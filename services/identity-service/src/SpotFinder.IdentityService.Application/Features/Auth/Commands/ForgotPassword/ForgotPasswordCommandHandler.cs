using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Domain.Services;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.ForgotPassword;

public sealed class ForgotPasswordCommandHandler : ICommandHandler<ForgotPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordResetService _passwordResetService;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(
        IUserRepository userRepository,
        IPasswordResetService passwordResetService,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _passwordResetService = passwordResetService;
        _emailService = emailService;
    }

    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        // Always succeed to avoid email enumeration
        if (user is null) return;

        var code = _passwordResetService.GenerateCode(request.Email);
        await _emailService.SendPasswordResetCodeAsync(request.Email, code, cancellationToken);
    }
}
