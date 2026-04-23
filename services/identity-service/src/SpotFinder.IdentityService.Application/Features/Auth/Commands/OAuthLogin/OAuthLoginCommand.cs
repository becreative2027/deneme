using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.Login;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.OAuthLogin;

/// <summary>POST /api/auth/oauth</summary>
/// <param name="Provider">"apple" | "google"</param>
/// <param name="IdentityToken">JWT from Apple / ID token from Google</param>
/// <param name="Email">Provided by client when provider doesn't return email in token</param>
/// <param name="DisplayName">Full name from the provider (used when creating a new account)</param>
public sealed record OAuthLoginCommand(
    string Provider,
    string IdentityToken,
    string? Email,
    string? DisplayName)
    : ICommand<LoginResult>;
