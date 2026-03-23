using Microsoft.EntityFrameworkCore;
using SpotFinder.LabelService.Domain.Entities;
using SpotFinder.LabelService.Domain.Repositories;
using SpotFinder.LabelService.Infrastructure.Persistence;

namespace SpotFinder.LabelService.Infrastructure.Repositories;

public sealed class PlaceLabelRepository : IPlaceLabelRepository
{
    private readonly LabelDbContext _context;
    public PlaceLabelRepository(LabelDbContext context) => _context = context;

    public async Task<IReadOnlyList<PlaceLabel>> GetByPlaceIdAsync(Guid placeId, CancellationToken ct = default)
        => await _context.PlaceLabels.Where(pl => pl.PlaceId == placeId).ToListAsync(ct);

    public async Task AddAsync(PlaceLabel placeLabel, CancellationToken ct = default)
        => await _context.PlaceLabels.AddAsync(placeLabel, ct);

    public async Task RemoveAsync(Guid placeId, int labelId, CancellationToken ct = default)
    {
        var pl = await _context.PlaceLabels
            .FirstOrDefaultAsync(x => x.PlaceId == placeId && x.LabelId == labelId, ct);
        if (pl is not null) _context.PlaceLabels.Remove(pl);
    }
}
