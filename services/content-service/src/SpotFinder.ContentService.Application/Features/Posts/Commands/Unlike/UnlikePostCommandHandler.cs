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

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Unlike;

public sealed class UnlikePostCommandHandler(
    ContentDbContext db,
    IUserInterestService userInterests,
    IUserEventService userEvents,
    IOptions<RecommendationOptions> options,
    ILogger<UnlikePostCommandHandler> logger)
    : IRequestHandler<UnlikePostCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(UnlikePostCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        var post = await db.Posts.FirstOrDefaultAsync(p => p.Id == cmd.PostId, ct);
        if (post is null)
            return ApiResult<bool>.Fail($"Post {cmd.PostId} not found.");

        var like = await db.PostLikes.FirstOrDefaultAsync(
            l => l.UserId == cmd.UserId && l.PostId == cmd.PostId, ct);

        if (like is null)
        {
            // Idempotent: not currently liked — no-op
            return ApiResult<bool>.Ok(false);
        }

        db.PostLikes.Remove(like);
        post.LikeCount = Math.Max(0, post.LikeCount - 1);
        post.FeedScore = Post.ComputeFeedScore(post.LikeCount, post.CommentCount, post.CreatedAt);
        await db.SaveChangesAsync(ct);

        // Phase 7.2 — negative weight read from config (default -1, floored at 0 by UPSERT SQL)
        await userInterests.UpdateAsync(cmd.UserId, post.PlaceId, options.Value.Weights.Unlike, ct);

        // Phase 7.2 — event type constant
        await userEvents.LogAsync(cmd.UserId, UserEventTypes.Unlike, cmd.PostId, post.PlaceId, ct: ct);

        sw.Stop();
        logger.LogInformation(
            "UnlikePost — userId={UserId} postId={PostId} weight={Weight}, totalTime={TotalMs} ms.",
            cmd.UserId, cmd.PostId, options.Value.Weights.Unlike, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
