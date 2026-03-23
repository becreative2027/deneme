namespace SpotFinder.FeedService.Infrastructure.Configuration;

/// <summary>
/// Strongly-typed options for the recommendation / feed scoring pipeline.
/// Bound from the "Recommendation" section of appsettings.json.
///
/// Phase 7.2 — mirrors the content-service options so both services
/// read the same logical configuration block.
/// </summary>
public sealed class RecommendationOptions
{
    public const string SectionName = "Recommendation";

    public bool    InterestLogScale { get; set; } = true;

    /// <summary>Default (Variant A) slot ratios for the explore feed.</summary>
    public ExploreBlendOptions ExploreBlend { get; set; } = new();

    /// <summary>Variant B slot ratios — heavier trending, lighter personalization.</summary>
    public ExploreBlendOptions ExploreBlendVariantB { get; set; } = new()
    {
        Personalized = 0.4,
        Trending     = 0.4,
        Discovery    = 0.2,
    };

    public TrendingOptions Trending { get; set; } = new();

    // ─────────────────────────────────────────────────────────────────────

    public sealed class ExploreBlendOptions
    {
        public double Personalized { get; set; } = 0.5;
        public double Trending     { get; set; } = 0.3;
        public double Discovery    { get; set; } = 0.2;

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

        public int     LookbackHours  { get; set; } = 24;
        public int     RefreshMinutes { get; set; } = 10;
    }
}
