using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceById;

public sealed record GetPlaceByIdQuery(Guid PlaceId, int LanguageId = 1) : IQuery<PlaceDetailDto?>;

public sealed record PlaceDetailDto(
    Guid Id, string? GooglePlaceId,
    int? CountryId, int? CityId, int? DistrictId,
    double? Latitude, double? Longitude,
    decimal? Rating, int? UserRatingsTotal,
    string ParkingStatus, string? Source,
    string Name, string? Slug,
    bool IsDeleted, DateTime CreatedAt);
