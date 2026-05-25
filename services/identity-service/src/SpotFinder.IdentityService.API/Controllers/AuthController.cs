using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.ForgotPassword;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.Login;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.OAuthLogin;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.RefreshToken;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.Register;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.ResetPassword;

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
    /// Send a 6-digit reset code to the given email (code is logged; replace with email infra when ready).
    /// Always returns 200 to avoid email enumeration.
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        await Sender.Send(new ForgotPasswordCommand(request.Email), ct);
        return OkResult("Reset code sent if the account exists.");
    }

    /// <summary>
    /// Reset password using the 6-digit code.
    /// Body: { email, code, newPassword }
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        await Sender.Send(new ResetPasswordCommand(request.Email, request.Code, request.NewPassword), ct);
        return OkResult("Password reset successful.");
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
public sealed record ForgotPasswordRequest(string Email);
public sealed record ResetPasswordRequest(string Email, string Code, string NewPassword);
