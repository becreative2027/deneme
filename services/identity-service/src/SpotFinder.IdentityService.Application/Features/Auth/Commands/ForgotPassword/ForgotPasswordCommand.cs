using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.ForgotPassword;

/// <summary>
/// Generates a 6-digit password reset code and logs it (no email infra yet).
/// Always returns success to avoid email enumeration.
/// </summary>
public sealed record ForgotPasswordCommand(string Email) : ICommand;
