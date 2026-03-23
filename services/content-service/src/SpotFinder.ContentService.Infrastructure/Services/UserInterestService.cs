using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SpotFinder.ContentService.Infrastructure.Abstractions;
using SpotFinder.ContentService.Infrastructure.Configuration;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.Infrastructure.Services;

/// <summary>
/// Updates <c>content.user_interests</c> via a single server-side UPSERT
/// that resolves the place's labels from <c>label.place_labels</c> inline.
///
/// Phase 7.1: overflow cap hardcoded at 1000, floor at 0.
/// Phase 7.2: cap is now read from <see cref="RecommendationOptions.InterestCap"/>
///            so operators can change it without a code deploy.
/// </summary>
public sealed class UserInterestService : IUserInterestService
{
    private readonly ContentDbContext _db;
    private readonly IOptions<RecommendationOptions> _options;
    private readonly ILogger<UserInterestService> _logger;

    public UserInterestService(
        ContentDbContext db,
        IOptions<RecommendationOptions> options,
        ILogger<UserInterestService> logger)
    {
        _db      = db;
        _options = options;
        _logger  = logger;
    }

    public async Task UpdateAsync(
        Guid userId, Guid placeId, decimal weight, CancellationToken ct = default)
    {
        var cap = _options.Value.InterestCap;

        // Single server-side statement:
        //   1. Resolves all labels for the place from label.place_labels
        //   2. Upserts one row per label into content.user_interests
        //   3. Caps score at InterestCap (configurable, default 1000)
        //   4. Floors score at 0 (no negative interests)
        //
        // {userId}, {placeId}, {weight}, {cap} are all EF Core parameters — safe.

        var rows = await _db.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO content.user_interests (user_id, label_id, score, updated_at)
            SELECT {userId}, pl.label_id, {weight}, NOW()
            FROM   label.place_labels pl
            WHERE  pl.place_id = {placeId}
            ON CONFLICT (user_id, label_id) DO UPDATE
            SET score      = GREATEST(0, LEAST(
                                 content.user_interests.score + {weight},
                                 {cap})),
                updated_at = NOW()
            """, ct);

        _logger.LogDebug(
            "UserInterestService — userId={UserId} placeId={PlaceId} weight={Weight} cap={Cap} rows={Rows}",
            userId, placeId, weight, cap, rows);
    }
}
