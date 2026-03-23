using SpotFinder.BuildingBlocks.Application;
using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Domain.Repositories;

public interface IPlaceRepository
{
    Task<Place?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Place?> GetByGooglePlaceIdAsync(string googlePlaceId, CancellationToken ct = default);
    Task<PagedResult<Place>> GetPagedAsync(int? cityId, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(Place place, CancellationToken ct = default);
    void Update(Place place);
}
