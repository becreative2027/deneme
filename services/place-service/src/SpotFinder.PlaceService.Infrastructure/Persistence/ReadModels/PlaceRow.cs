namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class PlaceRow
{
    public Guid Id { get; set; }
    public string? GooglePlaceId { get; set; }
    public string? CoverImageUrl { get; set; }
    public int? CountryId { get; set; }
    public int? CityId { get; set; }
    public int? DistrictId { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public decimal? Rating { get; set; }
    public int? UserRatingsTotal { get; set; }
    public string ParkingStatus { get; set; } = "unavailable";
    public string? MenuUrl { get; set; }
    public List<string> MenuImageUrls { get; set; } = new();
    public int? PriceLevel { get; set; }
    public string? VenueType { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
}
