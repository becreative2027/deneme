using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.Unfollow;

public sealed record UnfollowUserCommand(Guid FollowerId, Guid FollowingId)
    : IRequest<ApiResult<bool>>;
