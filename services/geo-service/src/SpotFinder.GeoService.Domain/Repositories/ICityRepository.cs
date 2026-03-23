using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Domain.Repositories;

public interface ICityRepository
{
    Task<City?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<City>> GetByCountryIdAsync(int countryId, CancellationToken ct = default);
    Task AddAsync(City city, CancellationToken ct = default);
    void Update(City city);
}
