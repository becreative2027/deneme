using SpotFinder.IdentityService.Domain.Entities;

namespace SpotFinder.IdentityService.Domain.Services;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user, IReadOnlyList<Guid>? ownedPlaceIds = null);
    string GenerateRefreshToken();
}
