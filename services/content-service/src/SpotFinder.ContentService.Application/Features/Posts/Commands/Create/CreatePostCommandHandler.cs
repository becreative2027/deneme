using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.ContentService.Infrastructure.Abstractions;
using SpotFinder.ContentService.Application.Constants;
using SpotFinder.ContentService.Domain.Entities;
using SpotFinder.ContentService.Infrastructure.Configuration;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Create;

public sealed class CreatePostCommandHandler(
    ContentDbContext db,
    IUserInterestService userInterests,
    IUserEventService userEvents,
    IOptions<RecommendationOptions> options,
    ILogger<CreatePostCommandHandler> logger)
    : IRequestHandler<CreatePostCommand, ApiResult<Guid>>
{
    public async Task<ApiResult<Guid>> Handle(CreatePostCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        var createdAt = DateTime.UtcNow;
        var post = new Post
        {
            Id        = Guid.NewGuid(),
            UserId    = cmd.UserId,
            PlaceId   = cmd.PlaceId,
            Caption   = cmd.Caption,
            CreatedAt = createdAt,
            FeedScore = Post.ComputeFeedScore(0, 0, createdAt),
        };

        db.Posts.Add(post);
        await db.SaveChangesAsync(ct);

        // Phase 7.2 — weight read from config (default +4)
        await userInterests.UpdateAsync(cmd.UserId, cmd.PlaceId, options.Value.Weights.PostCreate, ct);

        // Phase 7.2 — event type constant
        await userEvents.LogAsync(cmd.UserId, UserEventTypes.PostCreate, post.Id, cmd.PlaceId, ct: ct);

        sw.Stop();
        logger.LogInformation(
            "CreatePost — userId={UserId} postId={PostId} placeId={PlaceId} weight={Weight}, totalTime={TotalMs} ms.",
            cmd.UserId, post.Id, cmd.PlaceId, options.Value.Weights.PostCreate, sw.ElapsedMilliseconds);

        return ApiResult<Guid>.Ok(post.Id);
    }
}
