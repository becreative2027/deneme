using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.IdentityService.Application.Features.Users.Commands.DeleteAccount;

public sealed record DeleteAccountCommand(Guid UserId) : ICommand<bool>;
