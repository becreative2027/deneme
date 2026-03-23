using Microsoft.EntityFrameworkCore;
using SpotFinder.GeoService.Domain.Entities;
using SpotFinder.GeoService.Domain.Repositories;
using SpotFinder.GeoService.Infrastructure.Persistence;

namespace SpotFinder.GeoService.Infrastructure.Repositories;

public sealed class DistrictRepository : IDistrictRepository
{
    private readonly GeoDbContext _context;
    public DistrictRepository(GeoDbContext context) => _context = context;

    public async Task<District?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _context.Districts.Include(d => d.Translations).FirstOrDefaultAsync(d => d.Id == id, ct);

    public async Task<IReadOnlyList<District>> GetByCityIdAsync(int cityId, CancellationToken ct = default)
        => await _context.Districts.Include(d => d.Translations).Where(d => d.CityId == cityId).ToListAsync(ct);

    public async Task AddAsync(District district, CancellationToken ct = default)
        => await _context.Districts.AddAsync(district, ct);

    public void Update(District district) => _context.Districts.Update(district);
}
