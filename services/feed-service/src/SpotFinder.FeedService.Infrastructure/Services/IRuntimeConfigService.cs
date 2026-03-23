namespace SpotFinder.FeedService.Infrastructure.Services;

/// <summary>
/// Phase 7.3 — reads DB-driven runtime configuration with cache + appsettings fallback.
///
/// Values are stored as raw JSON in admin.runtime_configs.
/// The service deserializes them to the requested type T.
/// If the key is missing from the DB, or the DB is unavailable, returns defaultValue.
/// </summary>
public interface IRuntimeConfigService
{
    /// <summary>
    /// Returns the config value for <paramref name="key"/> deserialized as <typeparamref name="T"/>.
    /// Falls back to <paramref name="defaultValue"/> if the key is absent or unreadable.
    /// </summary>
    Task<T> GetAsync<T>(string key, T defaultValue, CancellationToken ct = default);

    /// <summary>Phase 7.4 — Evicts a specific key from the cache (called by Redis subscriber).</summary>
    void InvalidateCache(string key);
}
