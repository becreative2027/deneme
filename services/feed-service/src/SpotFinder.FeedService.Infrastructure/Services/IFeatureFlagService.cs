namespace SpotFinder.FeedService.Infrastructure.Services;

/// <summary>
/// Phase 7.3/7.4 — Checks whether a feature flag is active for a specific user.
///
/// Phase 7.4 targeting priority:
///   1. If flag has Target JSON set → evaluate targeting rules.
///      Any rule match → enabled.  No match → disabled.
///   2. Else → deterministic percentage rollout (|userId.GetHashCode()| % 100).
///
/// Returns false on any DB/cache failure (safe default).
/// </summary>
public interface IFeatureFlagService
{
    /// <summary>
    /// Evaluates the flag for the given user, optionally using a targeting context.
    /// </summary>
    Task<bool> IsEnabledAsync(
        string flagKey,
        Guid userId,
        FlagEvaluationContext? context = null,
        CancellationToken ct = default);

    /// <summary>Phase 7.4 — Evicts all flag cache entries (called by Redis subscriber).</summary>
    void InvalidateFlagCache();
}
