using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.PlaceService.Application.Features.Analytics.Queries.GetPlaceAnalytics;

/// <param name="PlaceId">The place to fetch analytics for.</param>
/// <param name="Days">How many days back to look (7, 30, 90). Default 30.</param>
public sealed record GetPlaceAnalyticsQuery(Guid PlaceId, int Days = 30)
    : IRequest<ApiResult<PlaceAnalyticsResponse>>;
