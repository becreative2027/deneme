using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.Login;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.OAuthLogin;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.RefreshToken;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.Register;

namespace SpotFinder.IdentityService.API.Controllers;

public sealed class AuthController : BaseController
{
    public AuthController(ISender sender) : base(sender) { }

    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<LoginResult>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command, CancellationToken ct)
    {
        await Sender.Send(command, ct);
        var loginResult = await Sender.Send(new LoginCommand(command.Email, command.Password), ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<LoginResult>.Ok(loginResult));
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await Sender.Send(command, ct);
        return OkResult(result);
    }

    /// <summary>
    /// Sign in or register via Apple or Google.
    /// Body: { provider: "apple"|"google", identityToken: "...", email?: "...", displayName?: "..." }
    /// </summary>
    [HttpPost("oauth")]
    [ProducesResponseType(typeof(ApiResponse<LoginResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> OAuth([FromBody] OAuthLoginCommand command, CancellationToken ct)
    {
        var result = await Sender.Send(command, ct);
        return OkResult(result);
    }

    /// <summary>
    /// Exchange a valid refresh token for a new access + refresh token pair (rotation).
    /// Body: { refreshToken: "..." }
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await Sender.Send(new RefreshTokenCommand(request.RefreshToken), ct);
        return OkResult(result);
    }
}

public sealed record RefreshTokenRequest(string RefreshToken);
