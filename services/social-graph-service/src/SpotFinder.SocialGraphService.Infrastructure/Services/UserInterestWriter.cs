using Microsoft.EntityFrameworkCore;
using SpotFinder.SocialGraphService.Application.Abstractions;
using SpotFinder.SocialGraphService.Infrastructure.Persistence;

namespace SpotFinder.SocialGraphService.Infrastructure.Services;

public sealed class UserInterestWriter(SocialDbContext db) : IUserInterestWriter
{
    private const int Cap = 1000;

    public async Task UpdateAsync(Guid userId, Guid placeId, decimal weight, CancellationToken ct = default)
    {
        await db.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO content.user_interests (user_id, label_id, score, updated_at)
            SELECT {userId}, pl.label_id, {weight}, NOW()
            FROM   label.place_labels pl
            WHERE  pl.place_id = {placeId}
            ON CONFLICT (user_id, label_id) DO UPDATE
            SET score      = GREATEST(0, LEAST(
                                 content.user_interests.score + {weight},
                                 {Cap})),
                updated_at = NOW()
            """, ct);
    }
}
