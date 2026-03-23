using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Moderate;

public sealed record ModeratePostCommand(
    Guid    PostId,
    string  Status,
    string? HiddenReason)
    : IRequest<ApiResult<bool>>;
