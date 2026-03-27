using MediatR;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFollowers;

public sealed record GetUserFollowersQuery(Guid UserId) : IRequest<UserIdsDto>;

public sealed record UserIdsDto(IReadOnlyList<Guid> UserIds);
