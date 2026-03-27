using MediatR;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserCounts;

public sealed record UserCountsDto(int FollowersCount, int FollowingCount);

public sealed record GetUserCountsQuery(Guid UserId) : IRequest<UserCountsDto>;
