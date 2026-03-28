using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.IdentityService.Application.Features.Users.Commands.UpdateProfile;
using SpotFinder.IdentityService.Application.Features.Users.Queries.GetUserById;
using SpotFinder.IdentityService.Application.Features.Users.Queries.GetUsersByIds;
using SpotFinder.IdentityService.Application.Features.Users.Queries.SearchUsers;

namespace SpotFinder.IdentityService.API.Controllers;

[Authorize]
public sealed class UsersController : BaseController
{
    public UsersController(ISender sender) : base(sender) { }

    [HttpGet("search")]
    [ProducesResponseType(typeof(SearchUsersResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new SearchUsersResponse([], 0, page, pageSize));

        var result = await Sender.Send(new SearchUsersQuery(q, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await Sender.Send(new GetUserByIdQuery(userId), ct);
        return result is null ? NotFound() : OkResult(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Sender.Send(new GetUserByIdQuery(id), ct);
        return result is null ? NotFound() : OkResult(result);
    }

    [HttpPost("batch")]
    [ProducesResponseType(typeof(IReadOnlyList<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByIds([FromBody] BatchUsersRequest request, CancellationToken ct)
    {
        var result = await Sender.Send(new GetUsersByIdsQuery(request.Ids), ct);
        return Ok(result);
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

public sealed record BatchUsersRequest(IReadOnlyList<Guid> Ids);
public sealed record UpdateProfileRequest(
    string? DisplayName,
    string? Bio,
    string? ProfileImageUrl);
