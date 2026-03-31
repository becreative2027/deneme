using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.PlaceService.Domain.Entities;

public sealed class Place : AggregateRoot<Guid>
{
    public string? GooglePlaceId { get; private set; }
    public string? CoverImageUrl { get; private set; }
    public int? CountryId { get; private set; }
    public int? CityId { get; private set; }
    public int? DistrictId { get; private set; }
    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }
    public decimal? Rating { get; private set; }
    public int? UserRatingsTotal { get; private set; }
    public string ParkingStatus { get; private set; } = "unavailable";
    public string? MenuUrl { get; private set; }
    public List<string> MenuImageUrls { get; private set; } = new();
    public int? PriceLevel { get; private set; }
    public string? VenueType { get; private set; }
    public string? Source { get; private set; }
    public DateTime? SourceLastSyncedAt { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<PlaceTranslation> _translations = new();
    public IReadOnlyCollection<PlaceTranslation> Translations => _translations.AsReadOnly();

    private Place() { }

    public static Place Create(int? countryId, int? cityId, double? latitude, double? longitude, string? source = null)
        => new()
        {
            Id = Guid.NewGuid(),
            CountryId = countryId,
            CityId = cityId,
            Latitude = latitude,
            Longitude = longitude,
            Source = source,
            CreatedAt = DateTime.UtcNow
        };

    public void AddTranslation(int languageId, string name, string? slug = null)
        => _translations.Add(PlaceTranslation.Create(Id, languageId, name, slug));

    public void SetGooglePlaceId(string googlePlaceId)
    {
        GooglePlaceId = googlePlaceId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCoverImageUrl(string? url)
    {
        CoverImageUrl = url;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDistrict(int districtId)
    {
        DistrictId = districtId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetParkingStatus(string status)
    {
        ParkingStatus = status;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMenuUrl(string? url)
    {
        MenuUrl = url;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMenuImageUrls(IEnumerable<string> urls)
    {
        MenuImageUrls = urls.ToList();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPriceLevel(int? level)
    {
        PriceLevel = level;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetVenueType(string? type)
    {
        VenueType = type;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddMenuImageUrl(string url)
    {
        MenuImageUrls.Add(url);
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRatingStats(decimal average, int count)
    {
        Rating = Math.Round(average, 1);
        UserRatingsTotal = count;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public string? GetName(int languageId)
        => _translations.FirstOrDefault(t => t.LanguageId == languageId)?.Name;
}
