using System.Diagnostics;
using System.Net.Http.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.SocialGraphService.Domain.Entities;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.Follow;

public sealed class FollowUserCommandHandler(
    SocialDbContext db,
    IHttpClientFactory httpClientFactory,
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

        // Fire-and-forget push notification (non-critical)
        _ = SendFollowNotificationAsync(cmd.FollowerId, cmd.FollowingId);

        return ApiResult<bool>.Ok(true);
    }

    private async Task SendFollowNotificationAsync(Guid followerId, Guid followingId)
    {
        try
        {
            var http = httpClientFactory.CreateClient();
            await http.PostAsJsonAsync(
                "http://spotfinder-identity:8080/api/notifications/send-follow",
                new { followerId, followingId });
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to send follow push notification for follower={FollowerId}", followerId);
        }
    }
}
