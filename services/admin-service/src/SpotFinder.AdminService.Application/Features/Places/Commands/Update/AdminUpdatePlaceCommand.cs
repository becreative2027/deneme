using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Places.Commands.Update;

public sealed record AdminUpdatePlaceCommand(
    Guid     PlaceId,
    int?     CountryId,
    int?     CityId,
    int?     DistrictId,
    double?  Latitude,
    double?  Longitude,
    string?  GooglePlaceId,
    string?  ParkingStatus,
    decimal? Rating,
    string?  UpdatedBy)
    : IRequest<ApiResult<bool>>;
