using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using SpotFinder.FeedService.Infrastructure.Persistence;
using SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

namespace SpotFinder.FeedService.Infrastructure.Services;

/// <summary>
/// Phase 7.3/7.4 — DB-backed feature flag service with targeting support.
///
/// Read path:
///   1. Load all flags into IMemoryCache (TTL = 5 min; evicted immediately by Redis subscriber).
///   2. Phase 7.4 targeting priority:
///      a. If flag.Target JSON is set → evaluate targeting rules (userIds / countries / platform).
///         Any rule matches → enabled.  No rule matches → disabled (targeting trumps rollout).
///      b. Else → deterministic bucket: |userId.GetHashCode()| % 100 &lt; RolloutPercentage.
///   3. On any failure → returns false (safe off).
/// </summary>
public sealed class FeatureFlagService : IFeatureFlagService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);
    private const string AllFlagsCacheKey = "featureflags:all";

    private readonly FeedQueryDbContext _db;
    private readonly IMemoryCache       _cache;
    private readonly ILogger<FeatureFlagService> _logger;

    public FeatureFlagService(
        FeedQueryDbContext db,
        IMemoryCache cache,
        ILogger<FeatureFlagService> logger)
    {
        _db     = db;
        _cache  = cache;
        _logger = logger;
    }

    public async Task<bool> IsEnabledAsync(
        string flagKey,
        Guid userId,
        FlagEvaluationContext? context = null,
        CancellationToken ct = default)
    {
        try
        {
            var flags = await GetAllFlagsAsync(ct);

            if (!flags.TryGetValue(flagKey, out var flag))
                return false;

            if (!flag.IsEnabled)
                return false;

            // ── Phase 7.4: Targeting rules take priority ──────────────────────
            if (!string.IsNullOrWhiteSpace(flag.Target))
                return EvaluateTarget(flag.Target, userId, context, flagKey);

            // ── Phase 7.3: Percentage rollout ─────────────────────────────────
            var bucket = Math.Abs(userId.GetHashCode()) % 100;
            var active = bucket < flag.RolloutPercentage;

            _logger.LogDebug(
                "FeatureFlag — key={Key} userId={UserId} bucket={Bucket} rollout={Pct} active={Active}",
                flagKey, userId, bucket, flag.RolloutPercentage, active);

            return active;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "FeatureFlag — failed to read key={Key}, defaulting false", flagKey);
            return false;
        }
    }

    public void InvalidateFlagCache()
    {
        _cache.Remove(AllFlagsCacheKey);
        _logger.LogInformation("FeatureFlag — cache invalidated via Redis event");
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task<Dictionary<string, FeatureFlagRow>> GetAllFlagsAsync(CancellationToken ct)
    {
        if (_cache.TryGetValue(AllFlagsCacheKey, out Dictionary<string, FeatureFlagRow>? cached))
            return cached!;

        var rows = await _db.FeatureFlags.AsNoTracking().ToListAsync(ct);
        var dict = rows.ToDictionary(f => f.Key);
        _cache.Set(AllFlagsCacheKey, dict, CacheTtl);
        return dict;
    }

    /// <summary>
    /// Phase 7.4 — Evaluates a targeting JSON rule set.
    ///
    /// Rules (OR semantics — any match → enabled):
    ///   userIds   : Guid string array — exact userId match
    ///   countries : string array      — ISO-3166 country code match
    ///   platform  : string array      — "ios" | "android" | "web" match
    ///
    /// For countries + platform, BOTH must match when both are specified (AND within a rule).
    /// </summary>
    private bool EvaluateTarget(
        string targetJson,
        Guid userId,
        FlagEvaluationContext? context,
        string flagKey)
    {
        try
        {
            using var doc = JsonDocument.Parse(targetJson);
            var root = doc.RootElement;

            // ── userIds: explicit inclusion list ─────────────────────────────
            if (root.TryGetProperty("userIds", out var userIdsEl))
            {
                foreach (var el in userIdsEl.EnumerateArray())
                {
                    if (Guid.TryParse(el.GetString(), out var id) && id == userId)
                    {
                        _logger.LogDebug("FeatureFlag — key={Key} userId={UserId} matched userIds target", flagKey, userId);
                        return true;
                    }
                }
            }

            // ── countries + platform (both required when both present) ─────────
            bool countryMatch  = true;
            bool platformMatch = true;
            bool hasCountryRule  = false;
            bool hasPlatformRule = false;

            if (root.TryGetProperty("countries", out var countriesEl))
            {
                hasCountryRule = true;
                countryMatch   = false;
                if (context?.Country != null)
                {
                    foreach (var el in countriesEl.EnumerateArray())
                    {
                        if (string.Equals(el.GetString(), context.Country, StringComparison.OrdinalIgnoreCase))
                        {
                            countryMatch = true;
                            break;
                        }
                    }
                }
            }

            if (root.TryGetProperty("platform", out var platformEl))
            {
                hasPlatformRule = true;
                platformMatch   = false;
                if (context?.Platform != null)
                {
                    foreach (var el in platformEl.EnumerateArray())
                    {
                        if (string.Equals(el.GetString(), context.Platform, StringComparison.OrdinalIgnoreCase))
                        {
                            platformMatch = true;
                            break;
                        }
                    }
                }
            }

            if ((hasCountryRule || hasPlatformRule) && countryMatch && platformMatch)
            {
                _logger.LogDebug(
                    "FeatureFlag — key={Key} userId={UserId} matched country/platform target",
                    flagKey, userId);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "FeatureFlag — malformed target JSON for key={Key}", flagKey);
            return false;
        }
    }
}
