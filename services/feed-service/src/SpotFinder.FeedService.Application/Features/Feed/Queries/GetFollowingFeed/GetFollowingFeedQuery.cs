using MediatR;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Feed.Queries.Common;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetFollowingFeed;

/// <summary>
/// Returns a cursor-paginated, ranked feed of posts from users the caller follows.
/// On the first call pass null cursors to get the first page.
/// On subsequent calls pass the NextCursor values returned by the previous response.
/// </summary>
public sealed record GetFollowingFeedQuery(
    Guid      UserId,
    int       PageSize,
    // Cursor fields — all null on first page
    int?      CursorScore,
    DateTime? CursorCreatedAt,
    Guid?     CursorPostId
) : IRequest<ApiResult<FeedResponse>>;
