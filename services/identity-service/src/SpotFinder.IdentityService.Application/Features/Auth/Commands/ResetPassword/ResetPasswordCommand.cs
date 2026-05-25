using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.ResetPassword;

public sealed record ResetPasswordCommand(string Email, string Code, string NewPassword) : ICommand;
