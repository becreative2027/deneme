using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.ContentService.Domain.Entities;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.AddMedia;

public sealed class AddPostMediaCommandHandler(
    ContentDbContext db,
    ILogger<AddPostMediaCommandHandler> logger)
    : IRequestHandler<AddPostMediaCommand, ApiResult<Guid>>
{
    public async Task<ApiResult<Guid>> Handle(AddPostMediaCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        var post = await db.Posts.FirstOrDefaultAsync(p => p.Id == cmd.PostId, ct);
        if (post is null)
            return ApiResult<Guid>.Fail($"Post {cmd.PostId} not found.");

        if (post.UserId != cmd.UserId)
            return ApiResult<Guid>.Fail("You do not own this post.");

        var media = new PostMedia
        {
            Id        = Guid.NewGuid(),
            PostId    = cmd.PostId,
            Url       = cmd.Url,
            Type      = cmd.Type,
            CreatedAt = DateTime.UtcNow,
        };

        db.PostMedia.Add(media);
        await db.SaveChangesAsync(ct);

        sw.Stop();
        logger.LogInformation(
            "AddPostMedia — userId={UserId} postId={PostId} mediaId={MediaId}, totalTime={TotalMs} ms.",
            cmd.UserId, cmd.PostId, media.Id, sw.ElapsedMilliseconds);

        return ApiResult<Guid>.Ok(media.Id);
    }
}
