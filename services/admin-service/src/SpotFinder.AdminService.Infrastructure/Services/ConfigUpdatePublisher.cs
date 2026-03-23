using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace SpotFinder.AdminService.Infrastructure.Services;

/// <summary>
/// Phase 7.4 — Redis pub/sub publisher for config change events.
///
/// Channel: "config_updates"
/// Messages:
///   config:{key}   — a specific runtime_config key changed
///   flags:all      — all feature flags should be invalidated
///
/// Failures are swallowed (fire-and-forget) because the cache TTL provides
/// the safety net; live propagation is best-effort.
/// </summary>
public sealed class ConfigUpdatePublisher : IConfigUpdatePublisher
{
    private const string ChannelName = "config_updates";

    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<ConfigUpdatePublisher> _logger;

    public ConfigUpdatePublisher(IConnectionMultiplexer redis, ILogger<ConfigUpdatePublisher> logger)
    {
        _redis  = redis;
        _logger = logger;
    }

    public async Task PublishConfigChangedAsync(string key, CancellationToken ct = default)
    {
        try
        {
            var sub = _redis.GetSubscriber();
            await sub.PublishAsync(RedisChannel.Literal(ChannelName), $"config:{key}");
            _logger.LogInformation("ConfigUpdatePublisher — published config:{Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ConfigUpdatePublisher — failed to publish config:{Key}", key);
        }
    }

    public async Task PublishFlagsChangedAsync(CancellationToken ct = default)
    {
        try
        {
            var sub = _redis.GetSubscriber();
            await sub.PublishAsync(RedisChannel.Literal(ChannelName), "flags:all");
            _logger.LogInformation("ConfigUpdatePublisher — published flags:all");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ConfigUpdatePublisher — failed to publish flags:all");
        }
    }
}
