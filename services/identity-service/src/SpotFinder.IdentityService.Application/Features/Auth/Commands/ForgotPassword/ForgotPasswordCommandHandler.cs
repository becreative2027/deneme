using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Domain.Services;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.ForgotPassword;

public sealed class ForgotPasswordCommandHandler : ICommandHandler<ForgotPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordResetService _passwordResetService;
    private readonly ILogger<ForgotPasswordCommandHandler> _logger;

    public ForgotPasswordCommandHandler(
        IUserRepository userRepository,
        IPasswordResetService passwordResetService,
        ILogger<ForgotPasswordCommandHandler> logger)
    {
        _userRepository = userRepository;
        _passwordResetService = passwordResetService;
        _logger = logger;
    }

    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        // Always succeed to avoid email enumeration
        if (user is null) return;

        var code = _passwordResetService.GenerateCode(request.Email);

        // TODO: send via email service when available
        _logger.LogWarning("PASSWORD RESET CODE for {Email}: {Code} (expires 15 min)", request.Email, code);
    }
}
