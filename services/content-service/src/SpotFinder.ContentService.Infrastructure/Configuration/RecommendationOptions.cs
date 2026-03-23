namespace SpotFinder.ContentService.Infrastructure.Configuration;

/// <summary>
/// Strongly-typed options for the recommendation / interest pipeline.
/// Bound from the "Recommendation" section of appsettings.json.
///
/// Phase 7.2 — all previously hardcoded values moved here so that
/// operators can tune the system without a code deploy.
/// </summary>
public sealed class RecommendationOptions
{
    public const string SectionName = "Recommendation";

    // ── Interest model ────────────────────────────────────────────────────
    /// <summary>Daily multiplier applied to every positive interest score (default 0.98 = 2% decay).</summary>
    public decimal InterestDecayRate { get; set; } = 0.98m;

    /// <summary>Maximum value for a single label interest score (prevents overflow).</summary>
    public int InterestCap { get; set; } = 1000;

    /// <summary>Apply log-scale normalisation to interest scores before scoring (log(1 + score)).</summary>
    public bool InterestLogScale { get; set; } = true;

    // ── Signal weights ────────────────────────────────────────────────────
    public WeightsOptions Weights { get; set; } = new();

    // ── Explore feed blend ────────────────────────────────────────────────
    /// <summary>Default (Variant A) slot ratios for the explore feed.</summary>
    public ExploreBlendOptions ExploreBlend { get; set; } = new();

    /// <summary>Variant B slot ratios — heavier trending, lighter personalization.</summary>
    public ExploreBlendOptions ExploreBlendVariantB { get; set; } = new()
    {
        Personalized = 0.4,
        Trending     = 0.4,
        Discovery    = 0.2,
    };

    // ── Trending ──────────────────────────────────────────────────────────
    public TrendingOptions Trending { get; set; } = new();

    // ─────────────────────────────────────────────────────────────────────

    public sealed class WeightsOptions
    {
        /// <summary>Interest delta applied when a user likes a post.</summary>
        public decimal Like       { get; set; } = 2;

        /// <summary>Interest delta applied when a user comments on a post.</summary>
        public decimal Comment    { get; set; } = 3;

        /// <summary>Interest delta applied when a user creates a post at a place.</summary>
        public decimal PostCreate { get; set; } = 4;

        /// <summary>Interest delta applied when a user unlikes a post (negative).</summary>
        public decimal Unlike     { get; set; } = -1;
    }

    public sealed class ExploreBlendOptions
    {
        /// <summary>Fraction of page slots allocated to personalized posts (0..1).</summary>
        public double Personalized { get; set; } = 0.5;

        /// <summary>Fraction of page slots allocated to trending posts (0..1).</summary>
        public double Trending     { get; set; } = 0.3;

        /// <summary>Fraction of page slots allocated to discovery / fresh posts (0..1).</summary>
        public double Discovery    { get; set; } = 0.2;

        /// <summary>
        /// Validates that the three fractions sum to approximately 1.
        /// Returns false (and the deviation) if the blend is invalid.
        /// </summary>
        public bool IsValid(out double deviation)
        {
            deviation = Math.Abs(Personalized + Trending + Discovery - 1.0);
            return deviation < 0.01;
        }
    }

    public sealed class TrendingOptions
    {
        /// <summary>Maximum trending score contribution to the final ranking score.</summary>
        public decimal Cap            { get; set; } = 200;

        /// <summary>Window of past activity used when computing trending scores (hours).</summary>
        public int     LookbackHours  { get; set; } = 24;

        /// <summary>How often the TrendingScoreRefreshJob recalculates scores (minutes).</summary>
        public int     RefreshMinutes { get; set; } = 10;
    }
}
