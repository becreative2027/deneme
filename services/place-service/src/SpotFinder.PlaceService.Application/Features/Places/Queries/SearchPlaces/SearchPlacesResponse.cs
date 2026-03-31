namespace SpotFinder.PlaceService.Application.Features.Places.Queries.SearchPlaces;

public sealed record SearchPlacesResponse(
    IReadOnlyList<PlaceSummaryDto> Places,
    int TotalCount,
    int Page,
    int PageSize);

public sealed record PlaceSummaryDto(
    Guid Id,
    string Name,
    string? Slug,
    string? CoverImageUrl,
    int? CityId,
    int? DistrictId,
    double? Latitude,
    double? Longitude,
    decimal? Rating,
    int ReviewCount,
    string ParkingStatus,
    int? PriceLevel,
    string? VenueType,
    IReadOnlyList<LabelSummaryDto> Labels);

/// <summary>Compact label representation used in search results.</summary>
public sealed record LabelSummaryDto(int Id, string Name);
