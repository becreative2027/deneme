namespace SpotFinder.PlaceService.Application.Features.Analytics.Queries.GetPlaceAnalytics;

public sealed record PlaceAnalyticsResponse(
    int    TotalViews,
    int    UniqueVisitors,
    double? AvgDurationSeconds,
    IReadOnlyList<DailyViewStat> DailyStats);

public sealed record DailyViewStat(
    DateOnly Date,
    int      Views,
    int      UniqueVisitors);
