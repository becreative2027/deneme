namespace SpotFinder.AdminService.Infrastructure.Services;

/// <summary>
/// Centralised cache invalidation — removes keys from IMemoryCache.
/// All write handlers call this instead of calling cache.Remove directly.
/// </summary>
public interface ICacheInvalidationService
{
    /// <summary>Removes the cached detail entry for a single place.</summary>
    void InvalidatePlace(Guid placeId);

    /// <summary>
    /// Removes the cached filters response for every known language.
    /// Call after any change that affects the filter options (labels, geo).
    /// </summary>
    void InvalidateFilters();
}
