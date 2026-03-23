using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.AddMedia;

public sealed record AddPostMediaCommand(
    Guid    PostId,
    Guid    UserId,
    string  Url,
    string? Type)
    : IRequest<ApiResult<Guid>>;
