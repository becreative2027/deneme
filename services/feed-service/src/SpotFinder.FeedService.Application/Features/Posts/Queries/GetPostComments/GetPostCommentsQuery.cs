using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.FeedService.Application.Features.Posts.Queries.GetPostComments;

public sealed record GetPostCommentsQuery(Guid PostId, int Page, int PageSize)
    : IRequest<ApiResult<List<PostCommentDto>>>;

public sealed record PostCommentDto(
    Guid     Id,
    Guid     UserId,
    string   Username,
    string?  DisplayName,
    string?  AvatarUrl,
    string   Text,
    DateTime CreatedAt);
