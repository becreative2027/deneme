using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Domain.Repositories;

public interface ICountryRepository
{
    Task<Country?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Country?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<IReadOnlyList<Country>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Country country, CancellationToken ct = default);
    void Update(Country country);
}
