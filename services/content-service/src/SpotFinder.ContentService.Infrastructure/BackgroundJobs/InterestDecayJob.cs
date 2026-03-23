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
/// Hosted background service that applies a daily decay to all
/// <c>content.user_interests</c> scores (score × <see cref="RecommendationOptions.InterestDecayRate"/>).
///
/// Phase 7.1: hardcoded 0.98.
/// Phase 7.2: rate is now read from <see cref="RecommendationOptions.InterestDecayRate"/>
///            so operators can tune decay without a code deploy.
///
/// Runs immediately on startup (to catch any gap while offline), then
/// every 24 hours.
/// </summary>
public sealed class InterestDecayJob : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptions<RecommendationOptions> _options;
    private readonly ILogger<InterestDecayJob> _logger;

    public InterestDecayJob(
        IServiceScopeFactory scopeFactory,
        IOptions<RecommendationOptions> options,
        ILogger<InterestDecayJob> logger)
    {
        _scopeFactory = scopeFactory;
        _options      = options;
        _logger       = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "InterestDecayJob — started, interval={Interval} decayRate={Rate}",
            Interval, _options.Value.InterestDecayRate);

        using var timer = new PeriodicTimer(Interval);

        // Run once immediately on startup, then on each daily tick.
        await DecayAsync(stoppingToken);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await DecayAsync(stoppingToken);
        }
    }

    private async Task DecayAsync(CancellationToken ct)
    {
        var sw         = Stopwatch.StartNew();
        var decayRate  = _options.Value.InterestDecayRate;

        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<ContentDbContext>();

            // Only rows with score > 0 need updating; zero rows are already at floor.
            // decayRate is a config parameter, parameterised safely by EF Core.
            var rows = await db.Database.ExecuteSqlAsync(
                $"""
                UPDATE content.user_interests
                SET score      = score * {decayRate},
                    updated_at = NOW()
                WHERE score > 0
                """, ct);

            sw.Stop();
            _logger.LogInformation(
                "InterestDecayJob — decayed {Rows} rows (score × {Rate}) in {Ms}ms",
                rows, decayRate, sw.ElapsedMilliseconds);
        }
        catch (OperationCanceledException)
        {
            // Normal shutdown — suppress.
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "InterestDecayJob — unhandled error after {Ms}ms; will retry in {Interval}",
                sw.ElapsedMilliseconds, Interval);
        }
    }
}
