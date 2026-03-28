using Microsoft.EntityFrameworkCore;
using SpotFinder.PlaceService.Domain.Entities;
using SpotFinder.PlaceService.Domain.Repositories;
using SpotFinder.PlaceService.Infrastructure.Persistence;

namespace SpotFinder.PlaceService.Infrastructure.Repositories;

public sealed class PlaceReviewRepository : IPlaceReviewRepository
{
    private readonly PlaceDbContext _db;
    public PlaceReviewRepository(PlaceDbContext db) => _db = db;

    public Task<PlaceReview?> GetByPlaceAndUserAsync(Guid placeId, Guid userId, CancellationToken ct = default)
        => _db.PlaceReviews.FirstOrDefaultAsync(r => r.PlaceId == placeId && r.UserId == userId, ct);

    public async Task<(IReadOnlyList<PlaceReview> Items, int Total)> GetByPlaceIdAsync(
        Guid placeId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _db.PlaceReviews.Where(r => r.PlaceId == placeId);
        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return (items, total);
    }

    public Task<PlaceReview?> GetByIdAsync(Guid reviewId, CancellationToken ct = default)
        => _db.PlaceReviews.FindAsync([reviewId], ct).AsTask();

    public async Task AddAsync(PlaceReview review, CancellationToken ct = default)
        => await _db.PlaceReviews.AddAsync(review, ct);

    public Task RemoveAsync(PlaceReview review, CancellationToken ct = default)
    {
        _db.PlaceReviews.Remove(review);
        return Task.CompletedTask;
    }

    public async Task<(decimal Average, int Count)> GetRatingStatsAsync(Guid placeId, CancellationToken ct = default)
    {
        var stats = await _db.PlaceReviews
            .Where(r => r.PlaceId == placeId)
            .GroupBy(_ => 1)
            .Select(g => new { Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync(ct);
        return stats is null ? (0m, 0) : ((decimal)stats.Avg, stats.Count);
    }
}
