using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.Login;

public sealed record LoginCommand(string Email, string Password) : ICommand<LoginResult>;
public sealed record LoginResult(string AccessToken, string RefreshToken, Guid UserId);
