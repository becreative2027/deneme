using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.Login;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.Register;

namespace SpotFinder.IdentityService.API.Controllers;

public sealed class AuthController : BaseController
{
    public AuthController(ISender sender) : base(sender) { }

    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<RegisterResult>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command, CancellationToken ct)
    {
        var result = await Sender.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<RegisterResult>.Ok(result));
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await Sender.Send(command, ct);
        return OkResult(result);
    }
}
