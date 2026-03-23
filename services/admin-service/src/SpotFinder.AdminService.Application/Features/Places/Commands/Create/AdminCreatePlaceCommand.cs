using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Places.Commands.Create;

public sealed record AdminCreatePlaceCommand(
    int?                        CountryId,
    int?                        CityId,
    int?                        DistrictId,
    double?                     Latitude,
    double?                     Longitude,
    string?                     GooglePlaceId,
    string                      ParkingStatus    = "unavailable",
    List<PlaceTranslationInput>? Translations    = null,
    string?                     CreatedBy        = null)
    : IRequest<ApiResult<Guid>>;

public sealed record PlaceTranslationInput(int LanguageId, string Name, string? Slug = null);
