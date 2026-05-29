using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpotFinder.FeedService.Application.Features.Feed.Queries.GetExploreFeed;
using SpotFinder.FeedService.Application.Features.Feed.Queries.GetFollowingFeed;
using SpotFinder.FeedService.Application.Features.Feed.Queries.GetNearbyFeed;
using SpotFinder.FeedService.Application.Features.Feed.Queries.GetPersonalizedFeed;
using SpotFinder.FeedService.Application.Features.Feed.Queries.GetPlaceFeed;
using SpotFinder.FeedService.Application.Features.Feed.Queries.GetUserPosts;
using SpotFinder.FeedService.Application.Features.Feed.Queries.GetUserPostCount;
using SpotFinder.FeedService.Infrastructure.Persistence;
using SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

namespace SpotFinder.FeedService.API.Controllers;

[ApiController]
[Route("api/feed")]
[Authorize]
public sealed class FeedController : ControllerBase
{
    private readonly ISender           _sender;
    private readonly FeedQueryDbContext _db;
    public FeedController(ISender sender, FeedQueryDbContext db)
    {
        _sender = sender;
        _db     = db;
    }

    // ── GET /api/feed/following?pageSize=10
    //        &cursorScore=15&cursorCreatedAt=2026-03-22T10:30:00Z&cursorPostId=... ──
    /// <summary>
    /// Cursor-paginated, ranked feed of posts from followed users.
    /// First call: omit all cursor params. Subsequent calls: pass NextCursor fields from the previous response.
    /// </summary>
    [HttpGet("following")]
    public async Task<IActionResult> GetFollowing(
        [FromQuery] int       pageSize        = 10,
        [FromQuery] int?      cursorScore     = null,
        [FromQuery] DateTime? cursorCreatedAt = null,
        [FromQuery] Guid?     cursorPostId    = null,
        CancellationToken     ct              = default)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _sender.Send(
            new GetFollowingFeedQuery(userId, pageSize, cursorScore, cursorCreatedAt, cursorPostId), ct);

        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Errors);
    }

    // ── GET /api/feed/nearby?cityId=1&pageSize=10
    //        &cursorScore=15&cursorCreatedAt=...&cursorPostId=... ─────────────
    /// <summary>
    /// Cursor-paginated, ranked feed of posts from places inside a city.
    /// First call: omit all cursor params.
    /// </summary>
    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearby(
        [FromQuery] int       cityId,
        [FromQuery] int       pageSize        = 10,
        [FromQuery] int?      cursorScore     = null,
        [FromQuery] DateTime? cursorCreatedAt = null,
        [FromQuery] Guid?     cursorPostId    = null,
        CancellationToken     ct              = default)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        if (cityId <= 0) return BadRequest("cityId must be greater than 0.");

        var result = await _sender.Send(
            new GetNearbyFeedQuery(userId, cityId, pageSize, cursorScore, cursorCreatedAt, cursorPostId), ct);

        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Errors);
    }

    // ── GET /api/feed/place/{placeId}?pageSize=10
    //        &cursorScore=15&cursorCreatedAt=...&cursorPostId=... ─────────────
    /// <summary>
    /// Cursor-paginated, ranked feed of posts attached to a specific place.
    /// First call: omit all cursor params.
    /// </summary>
    [HttpGet("place/{placeId:guid}")]
    public async Task<IActionResult> GetPlace(
        Guid              placeId,
        [FromQuery] int       pageSize        = 10,
        [FromQuery] int?      cursorScore     = null,
        [FromQuery] DateTime? cursorCreatedAt = null,
        [FromQuery] Guid?     cursorPostId    = null,
        CancellationToken     ct              = default)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _sender.Send(
            new GetPlaceFeedQuery(userId, placeId, pageSize, cursorScore, cursorCreatedAt, cursorPostId), ct);

        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Errors);
    }

    // ── GET /api/feed/personalized?pageSize=10&cursorScore=...&... ───────────
    /// <summary>
    /// Personalized feed ranked by user interests + trending scores.
    /// final_score = feed_score + (interest_score × 2) + trend_score
    /// Falls back to global top posts for new users with no recorded interests.
    /// </summary>
    [HttpGet("personalized")]
    public async Task<IActionResult> GetPersonalized(
        [FromQuery] int       pageSize        = 10,
        [FromQuery] int?      cursorScore     = null,
        [FromQuery] DateTime? cursorCreatedAt = null,
        [FromQuery] Guid?     cursorPostId    = null,
        CancellationToken     ct              = default)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _sender.Send(
            new GetPersonalizedFeedQuery(userId, pageSize, cursorScore, cursorCreatedAt, cursorPostId), ct);

        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Errors);
    }

    // ── GET /api/feed/explore?pageSize=10 ────────────────────────────────────
    /// <summary>
    /// Explore feed — blends personalized, trending, and global top posts.
    /// Always returns a fresh result (no cursor). Cached 30 s per user.
    /// </summary>
    [HttpGet("explore")]
    public async Task<IActionResult> GetExplore(
        [FromQuery] int   pageSize = 10,
        CancellationToken ct       = default)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _sender.Send(new GetExploreFeedQuery(userId, pageSize), ct);

        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Errors);
    }

    // ── POST /api/feed/seen ──────────────────────────────────────────────────
    /// <summary>
    /// Records a batch of post IDs the user has seen.
    /// Used for soft seen-penalty in For You ranking.
    /// Mobile should call this fire-and-forget after posts scroll into view.
    /// </summary>
    [HttpPost("seen")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkSeen(
        [FromBody] MarkSeenRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        if (request.PostIds is null || request.PostIds.Count == 0) return NoContent();

        var now = DateTime.UtcNow;
        var paramsList = request.PostIds
            .Distinct()
            .Take(50) // safety cap
            .Select(id => $"('{userId}', '{id}', '{now:yyyy-MM-dd HH:mm:ss}')")
            .ToList();

        var sql = $"""
            INSERT INTO content.user_seen_posts (user_id, post_id, seen_at)
            VALUES {string.Join(",", paramsList)}
            ON CONFLICT (user_id, post_id) DO UPDATE SET seen_at = EXCLUDED.seen_at
            """;

        await _db.Database.ExecuteSqlRawAsync(sql, ct);
        return NoContent();
    }

    // ── GET /api/users/{userId}/posts/count ──────────────────────────────────
    [HttpGet("/api/users/{userId:guid}/posts/count")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUserPostCount(Guid userId, CancellationToken ct)
    {
        var count = await _sender.Send(new GetUserPostCountQuery(userId), ct);
        return Ok(new { count });
    }

    // ── GET /api/users/{userId}/posts ─────────────────────────────────────────
    [HttpGet("/api/users/{userId:guid}/posts")]
    public async Task<IActionResult> GetUserPosts(
        Guid              userId,
        [FromQuery] int       pageSize        = 10,
        [FromQuery] int?      cursorScore     = null,
        [FromQuery] DateTime? cursorCreatedAt = null,
        [FromQuery] Guid?     cursorPostId    = null,
        CancellationToken     ct              = default)
    {
        var requestingUserId = GetUserId();
        var result = await _sender.Send(
            new GetUserPostsQuery(userId, requestingUserId, pageSize, cursorScore, cursorCreatedAt, cursorPostId), ct);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Errors);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub")
                 ?? User.FindFirst("nameid");
        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : Guid.Empty;
    }
}

public sealed record MarkSeenRequest(IReadOnlyList<Guid> PostIds);
