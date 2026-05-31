namespace SpotFinder.PlaceService.Application.Features.Analytics.Queries.GetPlaceAnalytics;

public sealed record PlaceAnalyticsResponse(
    int     TotalViews,
    int     UniqueVisitors,
    double? AvgDurationSeconds,
    IReadOnlyList<DailyViewStat>  DailyStats,
    IReadOnlyList<HourlyViewStat> HourlyStats);

public sealed record DailyViewStat(
    DateOnly Date,
    int      Views,
    int      UniqueVisitors);

public sealed record HourlyViewStat(
    DateTime Hour,              // UTC, truncated to the hour
    int      Views,
    int      UniqueVisitors,
    double?  AvgDurationSeconds);
