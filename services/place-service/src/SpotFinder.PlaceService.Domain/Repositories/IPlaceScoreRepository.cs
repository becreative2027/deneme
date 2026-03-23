using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Domain.Repositories;

public interface IPlaceScoreRepository
{
    Task<PlaceScore?> GetByPlaceIdAsync(Guid placeId, CancellationToken ct = default);
    Task AddAsync(PlaceScore score, CancellationToken ct = default);
    void Update(PlaceScore score);
}
