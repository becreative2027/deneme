using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Domain.Repositories;

public interface IDistrictRepository
{
    Task<District?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<District>> GetByCityIdAsync(int cityId, CancellationToken ct = default);
    Task AddAsync(District district, CancellationToken ct = default);
    void Update(District district);
}
