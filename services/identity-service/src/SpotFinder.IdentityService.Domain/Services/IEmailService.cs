namespace SpotFinder.IdentityService.Domain.Services;

public interface IEmailService
{
    Task SendPasswordResetCodeAsync(string toEmail, string code, CancellationToken cancellationToken = default);
}
