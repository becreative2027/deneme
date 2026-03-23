using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.ContentService.Infrastructure.Abstractions;
using SpotFinder.ContentService.Application.Constants;
using SpotFinder.ContentService.Domain.Entities;
using SpotFinder.ContentService.Infrastructure.Configuration;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Like;

public sealed class LikePostCommandHandler(
    ContentDbContext db,
    IUserInterestService userInterests,
    IUserEventService userEvents,
    IOptions<RecommendationOptions> options,
    ILogger<LikePostCommandHandler> logger)
    : IRequestHandler<LikePostCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(LikePostCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        var post = await db.Posts.FirstOrDefaultAsync(p => p.Id == cmd.PostId, ct);
        if (post is null)
            return ApiResult<bool>.Fail($"Post {cmd.PostId} not found.");

        // Duplicate like prevention (idempotent)
        var alreadyLiked = await db.PostLikes.AnyAsync(
            l => l.UserId == cmd.UserId && l.PostId == cmd.PostId, ct);

        if (alreadyLiked)
            return ApiResult<bool>.Ok(true);

        db.PostLikes.Add(new PostLike
        {
            UserId    = cmd.UserId,
            PostId    = cmd.PostId,
            CreatedAt = DateTime.UtcNow,
        });

        post.LikeCount++;
        post.FeedScore = Post.ComputeFeedScore(post.LikeCount, post.CommentCount, post.CreatedAt);
        await db.SaveChangesAsync(ct);

        // Phase 7.2 — weight read from config (default +2)
        await userInterests.UpdateAsync(cmd.UserId, post.PlaceId, options.Value.Weights.Like, ct);

        // Phase 7.2 — event type constant (eliminates string literal typo risk)
        await userEvents.LogAsync(cmd.UserId, UserEventTypes.Like, cmd.PostId, post.PlaceId, ct: ct);

        sw.Stop();
        logger.LogInformation(
            "LikePost — userId={UserId} postId={PostId} weight={Weight}, totalTime={TotalMs} ms.",
            cmd.UserId, cmd.PostId, options.Value.Weights.Like, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
