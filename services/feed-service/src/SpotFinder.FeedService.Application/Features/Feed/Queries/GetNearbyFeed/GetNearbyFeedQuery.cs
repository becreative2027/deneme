using MediatR;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Feed.Queries.Common;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetNearbyFeed;

/// <summary>
/// Returns a cursor-paginated, ranked feed of posts from places inside a given city.
/// On the first call pass null cursors to get the first page.
/// </summary>
public sealed record GetNearbyFeedQuery(
    Guid      UserId,
    int       CityId,
    int       PageSize,
    // Cursor fields — all null on first page
    int?      CursorScore,
    DateTime? CursorCreatedAt,
    Guid?     CursorPostId
) : IRequest<ApiResult<FeedResponse>>;
