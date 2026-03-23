namespace SpotFinder.AdminService.Infrastructure.Services;

/// <summary>
/// Phase 7.4 — Publishes config/flag change notifications via Redis pub/sub.
///
/// Consumers (feed-service, content-service) subscribe to the channel and
/// immediately evict stale cache entries, achieving near-real-time propagation.
/// </summary>
public interface IConfigUpdatePublisher
{
    /// <summary>
    /// Publishes a notification that the config key has changed.
    /// Fires-and-forgets on failure (non-critical path — cache TTL is the fallback).
    /// </summary>
    Task PublishConfigChangedAsync(string key, CancellationToken ct = default);

    /// <summary>Publishes a notification that all feature flags should be re-read.</summary>
    Task PublishFlagsChangedAsync(CancellationToken ct = default);
}
