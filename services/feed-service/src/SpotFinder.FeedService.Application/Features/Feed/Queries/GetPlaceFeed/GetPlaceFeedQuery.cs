using MediatR;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Feed.Queries.Common;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetPlaceFeed;

/// <summary>
/// Returns a cursor-paginated, ranked feed of posts attached to a specific place.
/// On the first call pass null cursors to get the first page.
/// </summary>
public sealed record GetPlaceFeedQuery(
    Guid      UserId,
    Guid      PlaceId,
    int       PageSize,
    // Cursor fields — all null on first page
    int?      CursorScore,
    DateTime? CursorCreatedAt,
    Guid?     CursorPostId
) : IRequest<ApiResult<FeedResponse>>;
