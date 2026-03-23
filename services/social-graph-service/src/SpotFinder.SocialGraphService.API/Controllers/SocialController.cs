using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.SocialGraphService.Application.Features.Social.Commands.Follow;
using SpotFinder.SocialGraphService.Application.Features.Social.Commands.Unfollow;

namespace SpotFinder.SocialGraphService.API.Controllers;

[Authorize]
[Route("api/social")]
public sealed class SocialController : BaseController
{
    public SocialController(ISender sender) : base(sender) { }

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
}

public sealed record FollowRequest(Guid FollowingId);
public sealed record UnfollowRequest(Guid FollowingId);
