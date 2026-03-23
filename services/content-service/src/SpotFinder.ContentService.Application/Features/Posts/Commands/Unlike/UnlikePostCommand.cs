using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Unlike;

public sealed record UnlikePostCommand(Guid UserId, Guid PostId)
    : IRequest<ApiResult<bool>>;
