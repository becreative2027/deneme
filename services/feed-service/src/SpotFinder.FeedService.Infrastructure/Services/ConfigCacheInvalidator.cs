using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace SpotFinder.FeedService.Infrastructure.Services;

/// <summary>
/// Phase 7.4 — BackgroundService that subscribes to the Redis "config_updates" channel
/// and immediately invalidates the corresponding IMemoryCache entries.
///
/// This eliminates the 5-minute cache lag after admin config changes, achieving
/// near-real-time propagation across all feed-service instances.
///
/// Message format (published by admin-service):
///   "config:{key}"  → evict rtcfg:{key} from RuntimeConfigService cache
///   "flags:all"     → evict all feature flag cache entries
///
/// If Redis is unavailable the service exits silently; the cache TTL remains the fallback.
/// </summary>
public sealed class ConfigCacheInvalidator : BackgroundService
{
    private const string ChannelName = "config_updates";

    private readonly IConnectionMultiplexer _redis;
    private readonly IServiceScopeFactory   _scopeFactory;
    private readonly ILogger<ConfigCacheInvalidator> _logger;

    public ConfigCacheInvalidator(
        IConnectionMultiplexer redis,
        IServiceScopeFactory scopeFactory,
        ILogger<ConfigCacheInvalidator> logger)
    {
        _redis        = redis;
        _scopeFactory = scopeFactory;
        _logger       = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            var sub = _redis.GetSubscriber();

            await sub.SubscribeAsync(
                RedisChannel.Literal(ChannelName),
                OnMessage);

            _logger.LogInformation(
                "ConfigCacheInvalidator — subscribed to Redis channel '{Channel}'", ChannelName);

            // Keep alive until the application stops
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            // Normal shutdown
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ConfigCacheInvalidator — subscription failed; falling back to TTL-based invalidation");
        }
    }

    private void OnMessage(RedisChannel channel, RedisValue message)
    {
        var msg = message.ToString();
        _logger.LogInformation("ConfigCacheInvalidator — received message '{Msg}'", msg);

        // Scoped services (IRuntimeConfigService, IFeatureFlagService) are registered Scoped,
        // so we resolve them from a new scope to avoid captive-dependency issues.
        using var scope = _scopeFactory.CreateScope();

        if (msg.StartsWith("config:", StringComparison.Ordinal))
        {
            var key = msg["config:".Length..];
            var rtConfig = scope.ServiceProvider.GetRequiredService<IRuntimeConfigService>();
            rtConfig.InvalidateCache(key);
        }
        else if (msg == "flags:all")
        {
            var flagService = scope.ServiceProvider.GetRequiredService<IFeatureFlagService>();
            flagService.InvalidateFlagCache();
        }
        else
        {
            _logger.LogWarning("ConfigCacheInvalidator — unknown message format: '{Msg}'", msg);
        }
    }
}
