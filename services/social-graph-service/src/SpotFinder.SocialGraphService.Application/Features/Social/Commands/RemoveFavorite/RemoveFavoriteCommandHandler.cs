using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.SocialGraphService.Application.Abstractions;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.RemoveFavorite;

public sealed class RemoveFavoriteCommandHandler(SocialDbContext db, IUserInterestWriter interests)
    : IRequestHandler<RemoveFavoriteCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(RemoveFavoriteCommand cmd, CancellationToken ct)
    {
        var row = await db.UserFavorites.FirstOrDefaultAsync(
            f => f.UserId == cmd.UserId && f.PlaceId == cmd.PlaceId, ct);

        if (row is null)
            return ApiResult<bool>.Ok(true);

        db.UserFavorites.Remove(row);
        await db.SaveChangesAsync(ct);

        // Slightly reduce interest when removed from wishlist (-1, floored at 0)
        await interests.UpdateAsync(cmd.UserId, cmd.PlaceId, -1m, ct);

        return ApiResult<bool>.Ok(true);
    }
}
