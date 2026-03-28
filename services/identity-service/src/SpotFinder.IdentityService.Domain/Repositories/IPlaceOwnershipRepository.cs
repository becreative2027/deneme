using SpotFinder.IdentityService.Domain.Entities;

namespace SpotFinder.IdentityService.Domain.Repositories;

public interface IPlaceOwnershipRepository
{
    Task<List<Guid>> GetPlaceIdsByUserAsync(Guid userId, CancellationToken ct = default);
    Task<List<PlaceOwnership>> GetByPlaceIdAsync(Guid placeId, CancellationToken ct = default);
    Task AddAsync(PlaceOwnership ownership, CancellationToken ct = default);
    Task RemoveAsync(Guid userId, Guid placeId, CancellationToken ct = default);
}
