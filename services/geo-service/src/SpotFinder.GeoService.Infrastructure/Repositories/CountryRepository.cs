using Microsoft.EntityFrameworkCore;
using SpotFinder.GeoService.Domain.Entities;
using SpotFinder.GeoService.Domain.Repositories;
using SpotFinder.GeoService.Infrastructure.Persistence;

namespace SpotFinder.GeoService.Infrastructure.Repositories;

public sealed class CountryRepository : ICountryRepository
{
    private readonly GeoDbContext _context;
    public CountryRepository(GeoDbContext context) => _context = context;

    public async Task<Country?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _context.Countries.Include(c => c.Translations).FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<Country?> GetByCodeAsync(string code, CancellationToken ct = default)
        => await _context.Countries.Include(c => c.Translations).FirstOrDefaultAsync(c => c.Code == code.ToUpperInvariant(), ct);

    public async Task<IReadOnlyList<Country>> GetAllAsync(CancellationToken ct = default)
        => await _context.Countries.Include(c => c.Translations).ToListAsync(ct);

    public async Task AddAsync(Country country, CancellationToken ct = default)
        => await _context.Countries.AddAsync(country, ct);

    public void Update(Country country) => _context.Countries.Update(country);
}
