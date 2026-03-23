using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.Infrastructure.BackgroundJobs;

/// <summary>
/// Hosted background service that recalculates <c>feed_score</c> for all
/// active posts younger than 48 hours every 5 minutes.
///
/// Why this exists:
///   <c>feed_score</c> includes a time-decay component (hours_since_post × 0.5).
///   Write-side handlers (Like, Comment, Create) update the score on mutation,
///   but posts that receive no new interactions would otherwise keep a stale score.
///   This job ensures every recent post drifts down the feed naturally over time.
///
/// SQL formula (mirrors <see cref="SpotFinder.ContentService.Domain.Entities.Post.ComputeFeedScore"/>):
///   feed_score = GREATEST(0, FLOOR(
///     base_score + freshness_boost − time_decay
///   ))
///   where:
///     base_score      = like_count * 2 + comment_count * 3
///     freshness_boost = 3 if age &lt; 3 h, else 0
///     time_decay      = hours_since_post * 0.5
/// </summary>
public sealed class FeedScoreRefreshJob : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    // Raw SQL keeps the update a single server-side statement — no rows fetched.
    // GREATEST(0, ...) enforces the non-negative floor.
    // FLOOR(...) mirrors the (int)Math.Max(0, ...) cast in the C# formula.
    private const string RefreshSql = """
        UPDATE content.posts
        SET    feed_score = GREATEST(0, FLOOR(
                   (like_count * 2 + comment_count * 3)
                   + CASE
                       WHEN EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 < 3
                       THEN 3
                       ELSE 0
                     END
                   - (EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 * 0.5)
               ))
        WHERE  created_at > NOW() - INTERVAL '48 hours'
          AND  is_deleted  = false
          AND  status     != 'hidden'
        """;

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<FeedScoreRefreshJob> _logger;

    public FeedScoreRefreshJob(
        IServiceScopeFactory scopeFactory,
        ILogger<FeedScoreRefreshJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger       = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "FeedScoreRefreshJob — started, interval={Interval}", Interval);

        using var timer = new PeriodicTimer(Interval);

        // Run once immediately on startup to backfill any scores that aged
        // while the service was offline.
        await RefreshAsync(stoppingToken);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RefreshAsync(stoppingToken);
        }
    }

    private async Task RefreshAsync(CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            // Use a fresh scope for each iteration — DbContext is scoped.
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<ContentDbContext>();

            // ExecuteSqlRawAsync returns the number of rows affected.
            var updated = await db.Database.ExecuteSqlRawAsync(RefreshSql, ct);

            sw.Stop();
            _logger.LogInformation(
                "FeedScoreRefreshJob — updated {Rows} posts in {Ms}ms",
                updated, sw.ElapsedMilliseconds);
        }
        catch (OperationCanceledException)
        {
            // Normal shutdown — no log noise.
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "FeedScoreRefreshJob — unhandled error after {Ms}ms; will retry in {Interval}",
                sw.ElapsedMilliseconds, Interval);
            // Do not rethrow — the hosting infrastructure would stop the service.
        }
    }
}
