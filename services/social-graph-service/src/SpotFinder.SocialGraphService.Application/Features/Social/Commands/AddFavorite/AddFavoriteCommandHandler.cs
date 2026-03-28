using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.SocialGraphService.Domain.Entities;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.AddFavorite;

public sealed class AddFavoriteCommandHandler(SocialDbContext db)
    : IRequestHandler<AddFavoriteCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(AddFavoriteCommand cmd, CancellationToken ct)
    {
        var exists = await db.UserFavorites.AnyAsync(
            f => f.UserId == cmd.UserId && f.PlaceId == cmd.PlaceId, ct);

        if (exists)
            return ApiResult<bool>.Ok(true);

        db.UserFavorites.Add(new UserFavorite
        {
            UserId    = cmd.UserId,
            PlaceId   = cmd.PlaceId,
            CreatedAt = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);
        return ApiResult<bool>.Ok(true);
    }
}
