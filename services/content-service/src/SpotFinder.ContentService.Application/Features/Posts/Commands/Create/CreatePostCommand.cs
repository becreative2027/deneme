using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Create;

public sealed record CreatePostCommand(
    Guid    UserId,
    Guid    PlaceId,
    string? Caption)
    : IRequest<ApiResult<Guid>>;
