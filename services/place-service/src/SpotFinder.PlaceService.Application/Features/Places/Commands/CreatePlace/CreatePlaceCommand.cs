using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.CreatePlace;

public sealed record CreatePlaceCommand(
    int? CountryId,
    int? CityId,
    int? DistrictId,
    double? Latitude,
    double? Longitude,
    string? GooglePlaceId,
    string? Source,
    int LanguageId,
    string Name,
    string? Slug) : ICommand<Guid>;
