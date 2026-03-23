using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.IdentityService.Application.Features.Users.Commands.UpdateProfile;
using SpotFinder.IdentityService.Application.Features.Users.Queries.GetUserById;

namespace SpotFinder.IdentityService.API.Controllers;

[Authorize]
public sealed class UsersController : BaseController
{
    public UsersController(ISender sender) : base(sender) { }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Sender.Send(new GetUserByIdQuery(id), ct);
        return result is null ? NotFound() : OkResult(result);
    }

    [HttpPut("profile")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cmd = new UpdateProfileCommand(userId, request.DisplayName, request.Bio, request.ProfileImageUrl);
        await Sender.Send(cmd, ct);
        return NoContent();
    }
}

public sealed record UpdateProfileRequest(
    string? DisplayName,
    string? Bio,
    string? ProfileImageUrl);
