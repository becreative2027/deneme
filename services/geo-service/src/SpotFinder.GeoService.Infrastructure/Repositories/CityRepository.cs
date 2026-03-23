using Microsoft.EntityFrameworkCore;
using SpotFinder.GeoService.Domain.Entities;
using SpotFinder.GeoService.Domain.Repositories;
using SpotFinder.GeoService.Infrastructure.Persistence;

namespace SpotFinder.GeoService.Infrastructure.Repositories;

public sealed class CityRepository : ICityRepository
{
    private readonly GeoDbContext _context;
    public CityRepository(GeoDbContext context) => _context = context;

    public async Task<City?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _context.Cities.Include(c => c.Translations).FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IReadOnlyList<City>> GetByCountryIdAsync(int countryId, CancellationToken ct = default)
        => await _context.Cities.Include(c => c.Translations).Where(c => c.CountryId == countryId).ToListAsync(ct);

    public async Task AddAsync(City city, CancellationToken ct = default)
        => await _context.Cities.AddAsync(city, ct);

    public void Update(City city) => _context.Cities.Update(city);
}
