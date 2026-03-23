using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.PlaceService.Domain.Entities;
using SpotFinder.PlaceService.Domain.Repositories;
using SpotFinder.PlaceService.Infrastructure.Persistence;

namespace SpotFinder.PlaceService.Infrastructure.Repositories;

public sealed class PlaceRepository : IPlaceRepository
{
    private readonly PlaceDbContext _context;
    public PlaceRepository(PlaceDbContext context) => _context = context;

    public async Task<Place?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Places.Include(p => p.Translations).FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, ct);

    public async Task<Place?> GetByGooglePlaceIdAsync(string googlePlaceId, CancellationToken ct = default)
        => await _context.Places.Include(p => p.Translations).FirstOrDefaultAsync(p => p.GooglePlaceId == googlePlaceId, ct);

    public async Task<PagedResult<Place>> GetPagedAsync(int? cityId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.Places.Include(p => p.Translations).Where(p => !p.IsDeleted);
        if (cityId.HasValue) query = query.Where(p => p.CityId == cityId.Value);
        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(p => p.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return PagedResult<Place>.Create(items, total, page, pageSize);
    }

    public async Task AddAsync(Place place, CancellationToken ct = default)
        => await _context.Places.AddAsync(place, ct);

    public void Update(Place place) => _context.Places.Update(place);
}
