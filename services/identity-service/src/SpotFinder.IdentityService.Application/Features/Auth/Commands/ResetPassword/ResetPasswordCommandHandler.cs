using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Domain.Services;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.ResetPassword;

public sealed class ResetPasswordCommandHandler : ICommandHandler<ResetPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordResetService _passwordResetService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;

    public ResetPasswordCommandHandler(
        IUserRepository userRepository,
        IPasswordResetService passwordResetService,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _passwordResetService = passwordResetService;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        if (!_passwordResetService.ValidateCode(request.Email, request.Code))
            throw new InvalidOperationException("Invalid or expired reset code.");

        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");

        var newHash = _passwordHasher.Hash(request.NewPassword);
        user.UpdatePasswordHash(newHash);

        _passwordResetService.InvalidateCode(request.Email);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
