using MediatR;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFavorites;

public sealed record GetUserFavoritesQuery(Guid UserId) : IRequest<UserFavoritesDto>;

public sealed record UserFavoritesDto(IReadOnlyList<Guid> PlaceIds);
