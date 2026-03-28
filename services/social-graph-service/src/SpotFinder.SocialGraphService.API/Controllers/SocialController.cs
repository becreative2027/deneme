using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.SocialGraphService.Application.Features.Social.Commands.AddFavorite;
using SpotFinder.SocialGraphService.Application.Features.Social.Commands.Follow;
using SpotFinder.SocialGraphService.Application.Features.Social.Commands.RemoveFavorite;
using SpotFinder.SocialGraphService.Application.Features.Social.Commands.Unfollow;
using SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserCounts;
using SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFavorites;
using SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFollowers;
using SpotFinder.SocialGraphService.Application.Features.Social.Queries.GetUserFollowing;

namespace SpotFinder.SocialGraphService.API.Controllers;

[Authorize]
[Route("api/social")]
public sealed class SocialController : BaseController
{
    public SocialController(ISender sender) : base(sender) { }

    // ── Follow ────────────────────────────────────────────────────────────────

    [HttpPost("follow")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Follow([FromBody] FollowRequest request, CancellationToken ct)
    {
        var followerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await Sender.Send(new FollowUserCommand(followerId, request.FollowingId), ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));
        return NoContent();
    }

    [HttpPost("unfollow")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Unfollow([FromBody] UnfollowRequest request, CancellationToken ct)
    {
        var followerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await Sender.Send(new UnfollowUserCommand(followerId, request.FollowingId), ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));
        return NoContent();
    }

    [HttpGet("counts/{userId:guid}")]
    [ProducesResponseType(typeof(UserCountsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCounts(Guid userId, CancellationToken ct)
    {
        var result = await Sender.Send(new GetUserCountsQuery(userId), ct);
        return Ok(result);
    }

    [HttpGet("followers/{userId:guid}")]
    [ProducesResponseType(typeof(UserIdsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFollowers(Guid userId, CancellationToken ct)
    {
        var result = await Sender.Send(new GetUserFollowersQuery(userId), ct);
        return Ok(result);
    }

    [HttpGet("following/{userId:guid}")]
    [ProducesResponseType(typeof(UserIdsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFollowing(Guid userId, CancellationToken ct)
    {
        var result = await Sender.Send(new GetUserFollowingQuery(userId), ct);
        return Ok(result);
    }

    // ── Favorites ─────────────────────────────────────────────────────────────

    [HttpGet("favorites")]
    [ProducesResponseType(typeof(UserFavoritesDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFavorites(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await Sender.Send(new GetUserFavoritesQuery(userId), ct);
        return Ok(result);
    }

    [HttpPost("favorites")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> AddFavorite([FromBody] FavoriteRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await Sender.Send(new AddFavoriteCommand(userId, request.PlaceId), ct);
        return NoContent();
    }

    [HttpDelete("favorites/{placeId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RemoveFavorite(Guid placeId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await Sender.Send(new RemoveFavoriteCommand(userId, placeId), ct);
        return NoContent();
    }
}

public sealed record FollowRequest(Guid FollowingId);
public sealed record UnfollowRequest(Guid FollowingId);
public sealed record FavoriteRequest(Guid PlaceId);
