using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SpotFinder.ContentService.Infrastructure.Configuration;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.Infrastructure.BackgroundJobs;

/// <summary>
/// Hosted background service that recalculates <c>content.trending_scores</c>
/// by aggregating post activity in the configured lookback window.
///
/// Phase 7.1: hardcoded 10-minute interval and 24-hour window.
/// Phase 7.2: both are read from <see cref="RecommendationOptions.TrendingOptions"/>.
///
/// The job:
///   1. Upserts active places (those with ≥1 post in the lookback window).
///   2. Decays stale places to 0 (no activity in that window).
///
/// Runs immediately on startup, then on the configured periodic tick.
/// </summary>
public sealed class TrendingScoreRefreshJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptions<RecommendationOptions> _options;
    private readonly ILogger<TrendingScoreRefreshJob> _logger;

    public TrendingScoreRefreshJob(
        IServiceScopeFactory scopeFactory,
        IOptions<RecommendationOptions> options,
        ILogger<TrendingScoreRefreshJob> logger)
    {
        _scopeFactory = scopeFactory;
        _options      = options;
        _logger       = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var interval = TimeSpan.FromMinutes(_options.Value.Trending.RefreshMinutes);

        _logger.LogInformation(
            "TrendingScoreRefreshJob — started, interval={Interval} lookbackHours={Hours}",
            interval, _options.Value.Trending.LookbackHours);

        using var timer = new PeriodicTimer(interval);

        await RefreshAsync(stoppingToken);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RefreshAsync(stoppingToken);
        }
    }

    private async Task RefreshAsync(CancellationToken ct)
    {
        var sw            = Stopwatch.StartNew();
        var lookbackHours = _options.Value.Trending.LookbackHours;

        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<ContentDbContext>();

            // Upsert active places with fresh aggregated scores.
            // lookbackHours is parameterised safely by EF Core's FormattableString handling.
            var upserted = await db.Database.ExecuteSqlAsync(
                $"""
                INSERT INTO content.trending_scores (place_id, score, updated_at)
                SELECT   p.place_id,
                         COUNT(*)
                         + COALESCE(SUM(p.like_count),    0)
                         + COALESCE(SUM(p.comment_count), 0) AS score,
                         NOW()
                FROM     content.posts p
                WHERE    p.created_at  > NOW() - make_interval(hours => {lookbackHours})
                  AND    p.is_deleted  = false
                  AND    p.status     != 'hidden'
                GROUP BY p.place_id
                ON CONFLICT (place_id) DO UPDATE
                SET score      = EXCLUDED.score,
                    updated_at = NOW()
                """, ct);

            // Zero-out places that had no activity in the lookback window.
            var decayed = await db.Database.ExecuteSqlAsync(
                $"""
                UPDATE content.trending_scores
                SET    score      = 0,
                       updated_at = NOW()
                WHERE  updated_at < NOW() - make_interval(hours => {lookbackHours})
                """, ct);

            sw.Stop();
            _logger.LogInformation(
                "TrendingScoreRefreshJob — upserted={Upserted} decayed={Decayed} in {Ms}ms",
                upserted, decayed, sw.ElapsedMilliseconds);
        }
        catch (OperationCanceledException)
        {
            // Normal shutdown.
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "TrendingScoreRefreshJob — unhandled error after {Ms}ms; will retry next tick",
                sw.ElapsedMilliseconds);
        }
    }
}
