using Microsoft.EntityFrameworkCore;
using SpotFinder.IdentityService.Domain.Entities;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Infrastructure.Persistence;

namespace SpotFinder.IdentityService.Infrastructure.Repositories;

public sealed class PlaceOwnershipRepository : IPlaceOwnershipRepository
{
    private readonly IdentityDbContext _db;
    public PlaceOwnershipRepository(IdentityDbContext db) => _db = db;

    public Task<List<Guid>> GetPlaceIdsByUserAsync(Guid userId, CancellationToken ct = default) =>
        _db.PlaceOwnerships
           .Where(o => o.UserId == userId)
           .Select(o => o.PlaceId)
           .ToListAsync(ct);

    public Task<List<PlaceOwnership>> GetByPlaceIdAsync(Guid placeId, CancellationToken ct = default) =>
        _db.PlaceOwnerships
           .Where(o => o.PlaceId == placeId)
           .ToListAsync(ct);

    public Task<List<Guid>> GetAllOwnedPlaceIdsAsync(CancellationToken ct = default) =>
        _db.PlaceOwnerships
           .Select(o => o.PlaceId)
           .Distinct()
           .ToListAsync(ct);

    public async Task AddAsync(PlaceOwnership ownership, CancellationToken ct = default) =>
        await _db.PlaceOwnerships.AddAsync(ownership, ct);

    public async Task RemoveAsync(Guid userId, Guid placeId, CancellationToken ct = default)
    {
        var row = await _db.PlaceOwnerships
            .FirstOrDefaultAsync(o => o.UserId == userId && o.PlaceId == placeId, ct);
        if (row is not null)
            _db.PlaceOwnerships.Remove(row);
    }
}
