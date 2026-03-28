using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Enums;

namespace SpotFinder.AdminService.Domain.Repositories;

public interface IPlaceNotificationRepository
{
    Task AddAsync(PlaceNotification notification, CancellationToken ct = default);

    /// <summary>Returns how many notifications the place has sent today (UTC).</summary>
    Task<int> GetTodayCountAsync(Guid placeId, CancellationToken ct = default);

    Task<IReadOnlyList<PlaceNotification>> GetByPlaceIdAsync(
        Guid placeId, int page, int pageSize, CancellationToken ct = default);

    Task<int> GetTotalAsync(Guid placeId, CancellationToken ct = default);

    /// <summary>
    /// Resolves the target user IDs for the given audience:
    /// - Favorites → social.user_favorites WHERE place_id = placeId
    /// - Wishlist  → social.user_wishlists WHERE place_id = placeId
    /// - Nearby    → users who favorited any place in the same city
    /// </summary>
    Task<IReadOnlyList<Guid>> GetAudienceUserIdsAsync(
        Guid placeId, NotificationAudience audience, CancellationToken ct = default);
}
