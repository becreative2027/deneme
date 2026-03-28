using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFollowers;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFollowing;

public sealed class GetUserFollowingQueryHandler(SocialDbContext db)
    : IRequestHandler<GetUserFollowingQuery, UserIdsDto>
{
    public async Task<UserIdsDto> Handle(GetUserFollowingQuery request, CancellationToken ct)
    {
        var ids = await db.UserFollows
            .Where(f => f.FollowerId == request.UserId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.FollowingId)
            .ToListAsync(ct);

        return new UserIdsDto(ids);
    }
}
