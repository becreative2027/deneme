using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Domain.Repositories;

namespace SpotFinder.IdentityService.Application.Features.Users.Commands.DeleteAccount;

public sealed class DeleteAccountCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork)
    : ICommandHandler<DeleteAccountCommand, bool>
{
    public async Task<bool> Handle(DeleteAccountCommand cmd, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(cmd.UserId, ct);
        if (user is null) return false;

        user.DeleteAccount();
        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(ct);
        return true;
    }
}
