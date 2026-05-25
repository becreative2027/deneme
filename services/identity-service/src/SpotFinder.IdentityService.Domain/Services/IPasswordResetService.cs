namespace SpotFinder.IdentityService.Domain.Services;

public interface IPasswordResetService
{
    string GenerateCode(string email);
    bool ValidateCode(string email, string code);
    void InvalidateCode(string email);
}
