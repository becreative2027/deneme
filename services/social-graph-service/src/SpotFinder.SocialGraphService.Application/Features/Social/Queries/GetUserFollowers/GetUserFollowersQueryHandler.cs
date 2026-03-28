using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFollowers;

public sealed class GetUserFollowersQueryHandler(SocialDbContext db)
    : IRequestHandler<GetUserFollowersQuery, UserIdsDto>
{
    public async Task<UserIdsDto> Handle(GetUserFollowersQuery request, CancellationToken ct)
    {
        var ids = await db.UserFollows
            .Where(f => f.FollowingId == request.UserId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.FollowerId)
            .ToListAsync(ct);

        return new UserIdsDto(ids);
    }
}
