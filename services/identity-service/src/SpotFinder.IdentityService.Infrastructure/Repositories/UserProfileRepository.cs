using Microsoft.EntityFrameworkCore;
using SpotFinder.IdentityService.Domain.Entities;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Infrastructure.Persistence;

namespace SpotFinder.IdentityService.Infrastructure.Repositories;

public sealed class UserProfileRepository(IdentityDbContext db) : IUserProfileRepository
{
    public Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);

    public async Task AddAsync(UserProfile profile, CancellationToken ct = default)
        => await db.Profiles.AddAsync(profile, ct);

    public void Update(UserProfile profile)
        => db.Profiles.Update(profile);
}
