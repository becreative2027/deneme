using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpotFinder.PlaceService.Infrastructure.Persistence;

namespace SpotFinder.PlaceService.API.Controllers;

/// <summary>
/// Internal-only endpoints called by admin-service after moderation approval.
/// No JWT required — only reachable from within the cluster (no gateway route).
/// </summary>
[Route("api/internal/reviews")]
[ApiController]
public sealed class InternalReviewsController : ControllerBase
{
    private readonly PlaceDbContext _db;
    public InternalReviewsController(PlaceDbContext db) => _db = db;

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var review = await _db.PlaceReviews.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (review is null) return NotFound();

        _db.PlaceReviews.Remove(review);

        // Recalculate place rating
        var place = await _db.Places.FirstOrDefaultAsync(p => p.Id == review.PlaceId, ct);
        if (place is not null)
        {
            var remaining = await _db.PlaceReviews
                .Where(r => r.PlaceId == review.PlaceId && r.Id != review.Id)
                .ToListAsync(ct);

            var avg   = remaining.Count > 0 ? (decimal)remaining.Average(r => r.Rating) : 0;
            var count = remaining.Count;
            place.SetRatingStats(avg, count);
        }

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
