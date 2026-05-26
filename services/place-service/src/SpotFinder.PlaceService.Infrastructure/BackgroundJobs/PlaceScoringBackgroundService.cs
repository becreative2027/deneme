using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SpotFinder.PlaceService.Domain.Services;

namespace SpotFinder.PlaceService.Infrastructure.BackgroundJobs;

/// <summary>
/// Runs a full place-scoring pass immediately on startup,
/// then repeats every <see cref="Period"/> hours.
/// Uses a DI scope per run so all scoped services (DbContexts) are safe.
/// </summary>
public sealed class PlaceScoringBackgroundService : BackgroundService
{
    // Recalculate every 4 hours — balances freshness against DB load.
    private static readonly TimeSpan Period = TimeSpan.FromHours(4);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PlaceScoringBackgroundService> _logger;

    public PlaceScoringBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<PlaceScoringBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger       = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PlaceScoringBackgroundService started. Period={Period}h", Period.TotalHours);

        // Run immediately so scores are fresh right after deploy.
        await RunScoringPassAsync(stoppingToken);

        using var timer = new PeriodicTimer(Period);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunScoringPassAsync(stoppingToken);
        }
    }

    private async Task RunScoringPassAsync(CancellationToken ct)
    {
        try
        {
            await using var scope   = _scopeFactory.CreateAsyncScope();
            var scoringService      = scope.ServiceProvider.GetRequiredService<IPlaceScoringService>();
            var count               = await scoringService.RecalculateAllAsync(ct);
            _logger.LogInformation("PlaceScoringBackgroundService — pass complete. scored={Count}", count);
        }
        catch (OperationCanceledException)
        {
            // Shutdown requested — exit cleanly.
        }
        catch (Exception ex)
        {
            // Log but don't crash the host — next tick will retry.
            _logger.LogError(ex, "PlaceScoringBackgroundService — unhandled error during scoring pass.");
        }
    }
}
