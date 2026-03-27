using MediatR;
using SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFollowers;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFollowing;

public sealed record GetUserFollowingQuery(Guid UserId) : IRequest<UserIdsDto>;
