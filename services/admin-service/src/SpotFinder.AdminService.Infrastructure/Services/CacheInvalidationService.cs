using Microsoft.Extensions.Caching.Memory;

namespace SpotFinder.AdminService.Infrastructure.Services;

public sealed class CacheInvalidationService : ICacheInvalidationService
{
    // Matches the key pattern used in GetPlaceDetailQueryHandler and GetPlaceFiltersQueryHandler.
    private const string PlaceDetailPrefix = "place_detail_";
    private const string FilterPrefix      = "place_filters_";
    private const int    MaxLanguageIds    = 20; // covers any realistic language set

    private readonly IMemoryCache _cache;

    public CacheInvalidationService(IMemoryCache cache) => _cache = cache;

    public void InvalidatePlace(Guid placeId)
        => _cache.Remove($"{PlaceDetailPrefix}{placeId}");

    public void InvalidateFilters()
    {
        for (var i = 1; i <= MaxLanguageIds; i++)
            _cache.Remove($"{FilterPrefix}{i}");
    }
}
