namespace SpotFinder.FeedService.Infrastructure.Services;

/// <summary>
/// Phase 7.4 — Optional evaluation context for feature flag targeting.
///
/// When provided, the flag service evaluates targeting rules (countries, platform)
/// in addition to the userId list check before falling back to percentage rollout.
/// </summary>
public sealed record FlagEvaluationContext(
    string? Country  = null,   // ISO-3166 alpha-2, e.g. "TR"
    string? Platform = null    // "ios" | "android" | "web"
);
