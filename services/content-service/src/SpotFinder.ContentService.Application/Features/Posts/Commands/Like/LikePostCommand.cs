using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Like;

public sealed record LikePostCommand(Guid UserId, Guid PostId)
    : IRequest<ApiResult<bool>>;
