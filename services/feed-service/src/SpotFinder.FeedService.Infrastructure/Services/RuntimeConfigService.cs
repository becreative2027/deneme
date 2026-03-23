using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using SpotFinder.FeedService.Infrastructure.Persistence;

namespace SpotFinder.FeedService.Infrastructure.Services;

/// <summary>
/// Phase 7.3 — DB-backed runtime config service.
///
/// Read path:
///   1. Check IMemoryCache (TTL = 5 min).
///   2. If miss → query admin.runtime_configs via FeedQueryDbContext.
///   3. Deserialize JSONB text → T.
///   4. On any failure → return defaultValue (appsettings fallback).
/// </summary>
public sealed class RuntimeConfigService : IRuntimeConfigService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    private readonly FeedQueryDbContext _db;
    private readonly IMemoryCache       _cache;
    private readonly ILogger<RuntimeConfigService> _logger;

    public RuntimeConfigService(
        FeedQueryDbContext db,
        IMemoryCache cache,
        ILogger<RuntimeConfigService> logger)
    {
        _db     = db;
        _cache  = cache;
        _logger = logger;
    }

    public void InvalidateCache(string key)
    {
        _cache.Remove($"rtcfg:{key}");
        _logger.LogInformation("RuntimeConfig — cache evicted for key={Key} via Redis event", key);
    }

    public async Task<T> GetAsync<T>(string key, T defaultValue, CancellationToken ct = default)
    {
        var cacheKey = $"rtcfg:{key}";

        if (_cache.TryGetValue(cacheKey, out T? cached))
            return cached!;

        try
        {
            var row = await _db.RuntimeConfigs
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Key == key, ct);

            if (row is null)
            {
                _cache.Set(cacheKey, defaultValue, CacheTtl);
                return defaultValue;
            }

            var value = JsonSerializer.Deserialize<T>(row.Value);
            var result = value ?? defaultValue;
            _cache.Set(cacheKey, result, CacheTtl);

            _logger.LogDebug("RuntimeConfig — key={Key} value={Value}", key, row.Value);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "RuntimeConfig — failed to read key={Key}, using default={Default}", key, defaultValue);
            return defaultValue;
        }
    }
}
