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

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Comment;

public sealed class CommentPostCommandHandler(
    ContentDbContext db,
    IUserInterestService userInterests,
    IUserEventService userEvents,
    IOptions<RecommendationOptions> options,
    ILogger<CommentPostCommandHandler> logger)
    : IRequestHandler<CommentPostCommand, ApiResult<Guid>>
{
    public async Task<ApiResult<Guid>> Handle(CommentPostCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        var post = await db.Posts.FirstOrDefaultAsync(p => p.Id == cmd.PostId, ct);
        if (post is null)
            return ApiResult<Guid>.Fail($"Post {cmd.PostId} not found.");

        var comment = new PostComment
        {
            Id        = Guid.NewGuid(),
            PostId    = cmd.PostId,
            UserId    = cmd.UserId,
            Text      = cmd.Text,
            CreatedAt = DateTime.UtcNow,
        };

        db.PostComments.Add(comment);
        post.CommentCount++;
        post.FeedScore = Post.ComputeFeedScore(post.LikeCount, post.CommentCount, post.CreatedAt);
        await db.SaveChangesAsync(ct);

        // Phase 7.2 — weight read from config (default +3)
        await userInterests.UpdateAsync(cmd.UserId, post.PlaceId, options.Value.Weights.Comment, ct);

        // Phase 7.2 — event type constant
        await userEvents.LogAsync(cmd.UserId, UserEventTypes.Comment, cmd.PostId, post.PlaceId, ct: ct);

        sw.Stop();
        logger.LogInformation(
            "CommentPost — userId={UserId} postId={PostId} commentId={CommentId} weight={Weight}, totalTime={TotalMs} ms.",
            cmd.UserId, cmd.PostId, comment.Id, options.Value.Weights.Comment, sw.ElapsedMilliseconds);

        return ApiResult<Guid>.Ok(comment.Id);
    }
}
