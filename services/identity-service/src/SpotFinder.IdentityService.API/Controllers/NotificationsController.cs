using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.IdentityService.Domain.Entities;
using SpotFinder.IdentityService.Infrastructure.Persistence;
using SpotFinder.IdentityService.Infrastructure.Services;

namespace SpotFinder.IdentityService.API.Controllers;

[Authorize]
public sealed class NotificationsController : BaseController
{
    private readonly IdentityDbContext _ctx;

    public NotificationsController(ISender sender, IdentityDbContext ctx) : base(sender)
        => _ctx = ctx;

    /// <summary>Registers or refreshes the Expo push token for the current user's device.</summary>
    [HttpPost("register-device")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RegisterDevice(
        [FromBody] RegisterDeviceRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Token)) return BadRequest();

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var existing = await _ctx.PushTokens
            .FirstOrDefaultAsync(t => t.Token == request.Token, ct);

        if (existing is null)
        {
            await _ctx.PushTokens.AddAsync(new PushToken
            {
                UserId   = userId,
                Token    = request.Token,
                Platform = request.Platform ?? "ios",
            }, ct);
        }
        else
        {
            existing.UserId = userId;
        }

        await _ctx.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Returns Expo push tokens for a list of user IDs (internal/admin use).</summary>
    [HttpPost("tokens-by-users")]
    [Authorize(Roles = "Admin,SuperAdmin,PlaceOwner")]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTokensByUsers(
        [FromBody] TokensByUsersRequest request,
        CancellationToken ct)
    {
        if (request.UserIds is null || request.UserIds.Count == 0)
            return Ok(Array.Empty<string>());

        var tokens = await _ctx.PushTokens
            .Where(t => request.UserIds.Contains(t.UserId))
            .Select(t => t.Token)
            .ToListAsync(ct);

        return Ok(tokens);
    }

    /// <summary>
    /// Internal endpoint — called by social-graph-service after a follow event.
    /// Not exposed via the external gateway (Docker-internal only).
    /// </summary>
    [HttpPost("send-follow")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SendFollowNotification(
        [FromBody] SendFollowRequest request,
        [FromServices] IExpoPushService pushService,
        CancellationToken ct)
    {
        // Get follower's display name
        var follower = await _ctx.Profiles
            .FirstOrDefaultAsync(p => p.UserId == request.FollowerId, ct);

        var followerName = follower?.DisplayName
            ?? (await _ctx.Users.Where(u => u.Id == request.FollowerId)
                              .Select(u => u.Username)
                              .FirstOrDefaultAsync(ct))
            ?? "Biri";

        // Get push tokens of the followed user
        var tokens = await _ctx.PushTokens
            .Where(t => t.UserId == request.FollowingId)
            .Select(t => t.Token)
            .ToListAsync(ct);

        if (tokens.Count == 0) return NoContent();

        await pushService.SendAsync(
            tokens,
            title: "Yeni takipçi 🎉",
            body:  $"{followerName} seni takip etmeye başladı.",
            type:  "follow",
            userId: request.FollowerId.ToString(),
            ct:    ct);

        return NoContent();
    }

    /// <summary>
    /// Internal endpoint — called by content-service after a comment event.
    /// </summary>
    [HttpPost("send-comment")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SendCommentNotification(
        [FromBody] SendCommentRequest request,
        [FromServices] IExpoPushService pushService,
        CancellationToken ct)
    {
        if (request.CommenterId == request.PostOwnerId) return NoContent();

        var commenter = await _ctx.Profiles
            .FirstOrDefaultAsync(p => p.UserId == request.CommenterId, ct);

        var commenterName = commenter?.DisplayName
            ?? (await _ctx.Users.Where(u => u.Id == request.CommenterId)
                              .Select(u => u.Username)
                              .FirstOrDefaultAsync(ct))
            ?? "Biri";

        var tokens = await _ctx.PushTokens
            .Where(t => t.UserId == request.PostOwnerId)
            .Select(t => t.Token)
            .ToListAsync(ct);

        if (tokens.Count == 0) return NoContent();

        await pushService.SendAsync(
            tokens,
            title:   "Yeni yorum 💬",
            body:    $"{commenterName} gönderine yorum yaptı.",
            type:    "comment",
            userId:  request.CommenterId.ToString(),
            placeId: request.PlaceId,
            postId:  request.PostId,
            ct:      ct);

        return NoContent();
    }

    /// <summary>
    /// Internal endpoint — called by content-service after a like event.
    /// </summary>
    [HttpPost("send-like")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SendLikeNotification(
        [FromBody] SendLikeRequest request,
        [FromServices] IExpoPushService pushService,
        CancellationToken ct)
    {
        // Don't notify if user liked their own post
        if (request.LikerId == request.PostOwnerId) return NoContent();

        var liker = await _ctx.Profiles
            .FirstOrDefaultAsync(p => p.UserId == request.LikerId, ct);

        var likerName = liker?.DisplayName
            ?? (await _ctx.Users.Where(u => u.Id == request.LikerId)
                              .Select(u => u.Username)
                              .FirstOrDefaultAsync(ct))
            ?? "Biri";

        var tokens = await _ctx.PushTokens
            .Where(t => t.UserId == request.PostOwnerId)
            .Select(t => t.Token)
            .ToListAsync(ct);

        if (tokens.Count == 0) return NoContent();

        await pushService.SendAsync(
            tokens,
            title:   "Yeni beğeni ❤️",
            body:    $"{likerName} gönderini beğendi.",
            type:    "like",
            userId:  request.LikerId.ToString(),
            placeId: request.PlaceId,
            postId:  request.PostId,
            ct:      ct);

        return NoContent();
    }
}

public sealed record RegisterDeviceRequest(string Token, string? Platform);
public sealed record TokensByUsersRequest(IReadOnlyList<Guid> UserIds);
public sealed record SendFollowRequest(Guid FollowerId, Guid FollowingId);
public sealed record SendLikeRequest(Guid LikerId, Guid PostOwnerId, string PostId, string? PlaceId = null);
public sealed record SendCommentRequest(Guid CommenterId, Guid PostOwnerId, string PostId, string? PlaceId = null);
