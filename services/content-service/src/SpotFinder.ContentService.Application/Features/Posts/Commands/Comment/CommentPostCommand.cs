using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Comment;

public sealed record CommentPostCommand(Guid UserId, Guid PostId, string Text)
    : IRequest<ApiResult<Guid>>;
