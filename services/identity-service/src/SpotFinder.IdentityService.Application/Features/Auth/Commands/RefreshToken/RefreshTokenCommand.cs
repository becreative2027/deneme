using MediatR;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.RefreshToken;

/// <summary>
/// Exchanges a valid refresh token for a new access token + refresh token pair (rotation).
/// Old refresh token is revoked immediately after use.
/// </summary>
public sealed record RefreshTokenCommand(string RefreshToken) : IRequest<RefreshTokenResult>;

public sealed record RefreshTokenResult(string AccessToken, string RefreshToken, Guid UserId);
