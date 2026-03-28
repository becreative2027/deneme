using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserCounts;

public sealed class GetUserCountsQueryHandler(SocialDbContext db)
    : IRequestHandler<GetUserCountsQuery, UserCountsDto>
{
    public async Task<UserCountsDto> Handle(GetUserCountsQuery request, CancellationToken ct)
    {
        var followersCount = await db.UserFollows.CountAsync(f => f.FollowingId == request.UserId, ct);
        var followingCount = await db.UserFollows.CountAsync(f => f.FollowerId == request.UserId, ct);
        return new UserCountsDto(followersCount, followingCount);
    }
}
