using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;

namespace SpotFinder.AdminService.Infrastructure.Repositories;

public sealed class PlaceNotificationRepository : IPlaceNotificationRepository
{
    private readonly AdminDbContext _ctx;

    public PlaceNotificationRepository(AdminDbContext ctx) => _ctx = ctx;

    public async Task AddAsync(PlaceNotification notification, CancellationToken ct = default)
    {
        await _ctx.PlaceNotifications.AddAsync(notification, ct);
        await _ctx.SaveChangesAsync(ct);
    }

    public async Task<int> GetTodayCountAsync(Guid placeId, CancellationToken ct = default)
    {
        var todayUtc = DateTime.UtcNow.Date;
        return await _ctx.PlaceNotifications
            .CountAsync(n => n.PlaceId == placeId && n.SentAt >= todayUtc, ct);
    }

    public async Task<IReadOnlyList<PlaceNotification>> GetByPlaceIdAsync(
        Guid placeId, int page, int pageSize, CancellationToken ct = default)
    {
        return await _ctx.PlaceNotifications
            .Where(n => n.PlaceId == placeId)
            .OrderByDescending(n => n.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> GetTotalAsync(Guid placeId, CancellationToken ct = default)
        => await _ctx.PlaceNotifications.CountAsync(n => n.PlaceId == placeId, ct);

    public async Task<IReadOnlyList<Guid>> GetAudienceUserIdsAsync(
        Guid placeId, NotificationAudience audience, CancellationToken ct = default)
    {
        var placeIdStr = placeId.ToString();

        var sql = audience switch
        {
            NotificationAudience.Favorites =>
                $"SELECT DISTINCT user_id::text FROM social.user_favorites WHERE place_id = '{placeIdStr}'",

            NotificationAudience.Wishlist =>
                $"SELECT DISTINCT user_id::text FROM social.user_wishlists WHERE place_id = '{placeIdStr}'",

            NotificationAudience.Nearby =>
                // Users who favorited OR wishlisted any place within 3 km of this place
                // Distance formula: haversine → 6371 * 2 * ASIN(SQRT(...)) in km
                $"""
                 WITH target AS (
                     SELECT latitude, longitude
                     FROM place.places
                     WHERE id = '{placeIdStr}'
                 )
                 SELECT DISTINCT u.user_id::text
                 FROM (
                     SELECT user_id, place_id FROM social.user_favorites
                     UNION
                     SELECT user_id, place_id FROM social.user_wishlists
                 ) u
                 JOIN place.places p ON p.id = u.place_id
                 CROSS JOIN target t
                 WHERE (
                     6371.0 * 2.0 * ASIN(SQRT(
                         POWER(SIN(RADIANS((p.latitude  - t.latitude)  / 2.0)), 2) +
                         COS(RADIANS(t.latitude)) * COS(RADIANS(p.latitude)) *
                         POWER(SIN(RADIANS((p.longitude - t.longitude) / 2.0)), 2)
                     ))
                 ) <= 3.0
                 """,

            _ => throw new ArgumentOutOfRangeException(nameof(audience))
        };

        var results = new List<Guid>();
        await using var cmd = _ctx.Database.GetDbConnection().CreateCommand();
        cmd.CommandText = sql;

        if (_ctx.Database.GetDbConnection().State != System.Data.ConnectionState.Open)
            await _ctx.Database.OpenConnectionAsync(ct);

        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            if (Guid.TryParse(reader.GetString(0), out var id))
                results.Add(id);
        }

        return results;
    }
}
