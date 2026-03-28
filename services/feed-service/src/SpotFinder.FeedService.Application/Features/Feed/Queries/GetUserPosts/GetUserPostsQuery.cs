using MediatR;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Feed.Queries.Common;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetUserPosts;

public sealed record GetUserPostsQuery(
    Guid TargetUserId,
    Guid RequestingUserId,
    int  PageSize,
    int?      CursorScore,
    DateTime? CursorCreatedAt,
    Guid?     CursorPostId
) : IRequest<ApiResult<FeedResponse>>;
