using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFavorites;

public sealed class GetUserFavoritesQueryHandler(SocialDbContext db)
    : IRequestHandler<GetUserFavoritesQuery, UserFavoritesDto>
{
    public async Task<UserFavoritesDto> Handle(GetUserFavoritesQuery request, CancellationToken ct)
    {
        var placeIds = await db.UserFavorites
            .Where(f => f.UserId == request.UserId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.PlaceId)
            .ToListAsync(ct);

        return new UserFavoritesDto(placeIds);
    }
}
