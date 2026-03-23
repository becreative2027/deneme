namespace SpotFinder.FeedService.Application.Features.Recommendations.Dtos;

/// <summary>A single place recommendation entry.</summary>
public sealed record PlaceRecommendationDto(
    Guid    PlaceId,
    string  PlaceName,
    decimal InterestScore,
    decimal TrendScore,
    decimal TotalScore
);

/// <summary>
/// Phase 7.4 — Configuration snapshot attached to every recommendation response.
/// Enables post-hoc debugging: "why did the algorithm choose these places?"
/// </summary>
public sealed record RecommendationConfigSnapshot(
    string  RequestId,           // trace ID or generated GUID
    string  Variant,             // "A" (legacy) | "B" (new_feed_algorithm enabled)
    decimal TrendCap,
    decimal DiversityMaxFraction,
    bool    DwellEnabled,
    bool    NewAlgoEnabled,
    bool    AdvColdStart,
    bool    IsFallback           // true = cold-start path was used
);

public sealed record PlaceRecommendationResponse(
    IReadOnlyList<PlaceRecommendationDto> Places,
    RecommendationConfigSnapshot?         DebugInfo = null   // always populated; named DebugInfo for clarity
);
