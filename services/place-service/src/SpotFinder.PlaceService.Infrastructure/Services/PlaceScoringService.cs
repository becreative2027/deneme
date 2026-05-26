using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.PlaceService.Domain.Services;
using SpotFinder.PlaceService.Domain.Entities;
using SpotFinder.PlaceService.Infrastructure.Persistence;

namespace SpotFinder.PlaceService.Infrastructure.Services;

/// <summary>
/// Scoring algorithm:
///
/// QualityScore  (0–10) = weighted average of app review ratings, falling back to Google rating.
///   raw  = avg_app_rating × 2                      (maps 1-5 → 2-10)
///   conf = min(review_count / 10, 1.0)             (confidence: 0 = no reviews, 1 = 10+ reviews)
///   quality = raw × conf + google_fallback × (1 - conf)
///
/// PopularityScore (0–10) = log-scaled engagement signals.
///   = log₁₀(1 + review_count)  × 3.0
///   + log₁₀(1 + favorite_count) × 4.0
///   + log₁₀(1 + wishlist_count) × 3.0
///   capped at 10.
///
/// TrendScore (0–10) = short-term momentum.
///   raw = reviews_last_7d × 3.0 + reviews_last_30d × 1.0
///   normalised = min(raw / 5.0, 10.0)
///
/// FinalScore (0–10) = weighted composite.
///   = quality × 0.40 + popularity × 0.35 + trend × 0.25
/// </summary>
public sealed class PlaceScoringService : IPlaceScoringService
{
    private readonly PlaceQueryDbContext _readDb;
    private readonly PlaceDbContext      _writeDb;
    private readonly ILogger<PlaceScoringService> _logger;

    public PlaceScoringService(
        PlaceQueryDbContext readDb,
        PlaceDbContext writeDb,
        ILogger<PlaceScoringService> logger)
    {
        _readDb  = readDb;
        _writeDb = writeDb;
        _logger  = logger;
    }

    public async Task<int> RecalculateAllAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("PlaceScoring — starting full recalculation pass.");
        var sw = System.Diagnostics.Stopwatch.StartNew();

        var now       = DateTime.UtcNow;
        var cutoff7d  = now.AddDays(-7);
        var cutoff30d = now.AddDays(-30);

        // ── 1. All non-deleted place IDs + Google rating fallback ────────────
        var places = await _readDb.Places
            .Select(p => new { p.Id, GoogleRating = p.Rating })
            .ToListAsync(ct);

        if (places.Count == 0)
        {
            _logger.LogWarning("PlaceScoring — no active places found, aborting.");
            return 0;
        }

        var placeIds     = places.Select(p => p.Id).ToHashSet();
        var googleRating = places.ToDictionary(p => p.Id, p => p.GoogleRating ?? 0m);

        // ── 2. App review stats per place (single batch query) ───────────────
        var reviewStats = await _readDb.PlaceReviews
            .Where(r => placeIds.Contains(r.PlaceId))
            .GroupBy(r => r.PlaceId)
            .Select(g => new
            {
                PlaceId    = g.Key,
                TotalCount = g.Count(),
                AvgRating  = g.Average(r => (double)r.Rating),
                Recent7d   = g.Count(r => r.CreatedAt >= cutoff7d),
                Recent30d  = g.Count(r => r.CreatedAt >= cutoff30d),
            })
            .ToDictionaryAsync(x => x.PlaceId, ct);

        // ── 3. Favorite counts per place ─────────────────────────────────────
        var favoriteCounts = await _readDb.SocialFavorites
            .Where(f => placeIds.Contains(f.PlaceId))
            .GroupBy(f => f.PlaceId)
            .Select(g => new { PlaceId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PlaceId, x => x.Count, ct);

        // ── 4. Wishlist counts per place ─────────────────────────────────────
        var wishlistCounts = await _readDb.SocialWishlists
            .Where(w => placeIds.Contains(w.PlaceId))
            .GroupBy(w => w.PlaceId)
            .Select(g => new { PlaceId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PlaceId, x => x.Count, ct);

        // ── 5. Load existing scores for upsert ───────────────────────────────
        var existingScores = await _writeDb.PlaceScores
            .ToDictionaryAsync(s => s.PlaceId, ct);

        // ── 6. Calculate and upsert ──────────────────────────────────────────
        var toAdd = new List<PlaceScore>();
        int updated = 0;

        foreach (var place in places)
        {
            reviewStats.TryGetValue(place.Id, out var rs);
            favoriteCounts.TryGetValue(place.Id, out var favCount);
            wishlistCounts.TryGetValue(place.Id, out var wlCount);

            // Quality
            decimal qualityScore;
            if (rs is not null && rs.TotalCount > 0)
            {
                decimal rawQuality   = (decimal)rs.AvgRating * 2m;       // 1-5 → 2-10
                decimal confidence   = Math.Min(rs.TotalCount / 10m, 1m); // 0→0, 10+→1
                decimal googleFallback = googleRating[place.Id] * 2m;     // 0-5 → 0-10
                qualityScore = Round(rawQuality * confidence + googleFallback * (1m - confidence));
            }
            else
            {
                // No app reviews — use Google rating alone (halved confidence)
                qualityScore = Round(googleRating[place.Id] * 2m * 0.5m);
            }

            // Popularity
            int reviews   = rs?.TotalCount ?? 0;
            int favorites = favCount;
            int wishlists = wlCount;

            decimal popularityScore = Round(Math.Min(10m,
                (decimal)Math.Log10(1 + reviews)   * 3m +
                (decimal)Math.Log10(1 + favorites) * 4m +
                (decimal)Math.Log10(1 + wishlists) * 3m));

            // Trend
            int r7  = rs?.Recent7d  ?? 0;
            int r30 = rs?.Recent30d ?? 0;
            decimal trendScore = Round(Math.Min(10m, (r7 * 3m + r30 * 1m) / 5m));

            // Final
            decimal finalScore = Round(
                qualityScore    * 0.40m +
                popularityScore * 0.35m +
                trendScore      * 0.25m);

            if (existingScores.TryGetValue(place.Id, out var existing))
            {
                existing.Update(popularityScore, qualityScore, trendScore, finalScore);
                _writeDb.PlaceScores.Update(existing);
                updated++;
            }
            else
            {
                toAdd.Add(PlaceScore.Create(place.Id, popularityScore, qualityScore, trendScore, finalScore));
            }
        }

        if (toAdd.Count > 0)
            await _writeDb.PlaceScores.AddRangeAsync(toAdd, ct);

        await _writeDb.SaveChangesAsync(ct);

        sw.Stop();
        _logger.LogInformation(
            "PlaceScoring — done. updated={Updated} created={Created} total={Total} elapsed={ElapsedMs}ms",
            updated, toAdd.Count, updated + toAdd.Count, sw.ElapsedMilliseconds);

        return updated + toAdd.Count;
    }

    private static decimal Round(decimal v) => Math.Round(Math.Clamp(v, 0m, 10m), 2);
}
