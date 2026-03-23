using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Moderate;

public sealed class ModeratePostCommandHandler(
    ContentDbContext db,
    ILogger<ModeratePostCommandHandler> logger)
    : IRequestHandler<ModeratePostCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(ModeratePostCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        // IgnoreQueryFilters so hidden/deleted posts can still be moderated
        var post = await db.Posts
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == cmd.PostId, ct);

        if (post is null)
            return ApiResult<bool>.Fail($"Post {cmd.PostId} not found.");

        var previousStatus = post.Status;
        post.Status       = cmd.Status;
        post.HiddenReason = cmd.HiddenReason;
        post.ModeratedAt  = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        sw.Stop();
        logger.LogInformation(
            "ModeratePost — postId={PostId} status={PreviousStatus}→{NewStatus} reason={Reason}, totalTime={TotalMs} ms.",
            cmd.PostId, previousStatus, cmd.Status, cmd.HiddenReason, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
