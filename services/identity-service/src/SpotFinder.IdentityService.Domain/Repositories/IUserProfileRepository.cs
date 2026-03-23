using SpotFinder.IdentityService.Domain.Entities;

namespace SpotFinder.IdentityService.Domain.Repositories;

public interface IUserProfileRepository
{
    Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(UserProfile profile, CancellationToken ct = default);
    void Update(UserProfile profile);
}
