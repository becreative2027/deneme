using Microsoft.EntityFrameworkCore;
using SpotFinder.PlaceService.Domain.Entities;
using SpotFinder.PlaceService.Domain.Repositories;
using SpotFinder.PlaceService.Infrastructure.Persistence;

namespace SpotFinder.PlaceService.Infrastructure.Repositories;

public sealed class PlaceScoreRepository : IPlaceScoreRepository
{
    private readonly PlaceDbContext _context;
    public PlaceScoreRepository(PlaceDbContext context) => _context = context;

    public async Task<PlaceScore?> GetByPlaceIdAsync(Guid placeId, CancellationToken ct = default)
        => await _context.PlaceScores.FirstOrDefaultAsync(s => s.PlaceId == placeId, ct);

    public async Task AddAsync(PlaceScore score, CancellationToken ct = default)
        => await _context.PlaceScores.AddAsync(score, ct);

    public void Update(PlaceScore score) => _context.PlaceScores.Update(score);
}
