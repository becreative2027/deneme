using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.Follow;

public sealed record FollowUserCommand(Guid FollowerId, Guid FollowingId)
    : IRequest<ApiResult<bool>>;
