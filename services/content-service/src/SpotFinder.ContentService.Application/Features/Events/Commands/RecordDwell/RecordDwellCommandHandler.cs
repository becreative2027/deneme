using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.ContentService.Infrastructure.Abstractions;
using SpotFinder.ContentService.Application.Constants;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.Application.Features.Events.Commands.RecordDwell;

/// <summary>
/// Handles dwell-time event ingestion.
///
/// Flow:
///   1. Validate that the post exists (silently drops invalid post IDs).
///   2. Build a JSON payload: <c>{"durationMs": &lt;value&gt;}</c>.
///   3. Log via <see cref="IUserEventService"/> (best-effort, non-critical).
///
/// Security: UserId always sourced from JWT (set by controller, not client).
/// </summary>
public sealed class RecordDwellCommandHandler(
    ContentDbContext db,
    IUserEventService userEvents,
    ILogger<RecordDwellCommandHandler> logger)
    : IRequestHandler<RecordDwellCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(RecordDwellCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        // Look up the post to get its placeId for richer analytics.
        var post = await db.Posts
            .Where(p => p.Id == cmd.PostId)
            .Select(p => new { p.PlaceId })
            .FirstOrDefaultAsync(ct);

        if (post is null)
        {
            logger.LogDebug(
                "RecordDwell — post {PostId} not found; dwell event dropped", cmd.PostId);
            return ApiResult<bool>.Ok(false);
        }

        // Payload: {"durationMs": 4200}
        var payload = $"{{\"durationMs\":{cmd.DurationMs}}}";

        await userEvents.LogAsync(
            cmd.UserId,
            UserEventTypes.Dwell,
            cmd.PostId,
            post.PlaceId,
            payload,
            ct);

        sw.Stop();
        logger.LogInformation(
            "RecordDwell — userId={UserId} postId={PostId} durationMs={DurationMs} in {Ms}ms",
            cmd.UserId, cmd.PostId, cmd.DurationMs, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
