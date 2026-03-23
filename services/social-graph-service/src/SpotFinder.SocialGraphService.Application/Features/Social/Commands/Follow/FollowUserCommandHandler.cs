using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.SocialGraphService.Domain.Entities;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.Follow;

public sealed class FollowUserCommandHandler(
    SocialDbContext db,
    ILogger<FollowUserCommandHandler> logger)
    : IRequestHandler<FollowUserCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(FollowUserCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        // Idempotency: already following
        var exists = await db.UserFollows.AnyAsync(
            f => f.FollowerId == cmd.FollowerId && f.FollowingId == cmd.FollowingId, ct);

        if (exists)
            return ApiResult<bool>.Ok(true);

        db.UserFollows.Add(new UserFollow
        {
            FollowerId  = cmd.FollowerId,
            FollowingId = cmd.FollowingId,
            CreatedAt   = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);

        sw.Stop();
        logger.LogInformation(
            "Follow — followerId={FollowerId} followingId={FollowingId}, totalTime={TotalMs} ms.",
            cmd.FollowerId, cmd.FollowingId, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
