using MediatR;
using SpotFinder.AdminService.Application.Features.Geo.Commands.CreateCity;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Geo.Commands.CreateDistrict;

public sealed record AdminCreateDistrictCommand(
    int                          CityId,
    List<GeoTranslationInput>?   Translations = null,
    string?                      CreatedBy    = null)
    : IRequest<ApiResult<int>>;
