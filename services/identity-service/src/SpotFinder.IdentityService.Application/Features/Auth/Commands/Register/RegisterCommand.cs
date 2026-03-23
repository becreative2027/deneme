using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.Register;

public sealed record RegisterCommand(string Email, string Username, string Password) : ICommand<RegisterResult>;
public sealed record RegisterResult(Guid UserId, string Email, string Username);
