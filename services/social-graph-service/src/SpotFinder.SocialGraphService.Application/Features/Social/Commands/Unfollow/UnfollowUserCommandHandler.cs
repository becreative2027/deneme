using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.Unfollow;

public sealed class UnfollowUserCommandHandler(
    SocialDbContext db,
    ILogger<UnfollowUserCommandHandler> logger)
    : IRequestHandler<UnfollowUserCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(UnfollowUserCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        var follow = await db.UserFollows.FirstOrDefaultAsync(
            f => f.FollowerId == cmd.FollowerId && f.FollowingId == cmd.FollowingId, ct);

        if (follow is null)
            return ApiResult<bool>.Fail($"Follow relationship not found.");

        db.UserFollows.Remove(follow);
        await db.SaveChangesAsync(ct);

        sw.Stop();
        logger.LogInformation(
            "Unfollow — followerId={FollowerId} followingId={FollowingId}, totalTime={TotalMs} ms.",
            cmd.FollowerId, cmd.FollowingId, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
