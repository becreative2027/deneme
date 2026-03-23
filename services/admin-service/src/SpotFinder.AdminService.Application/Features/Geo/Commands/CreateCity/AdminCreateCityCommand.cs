using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Geo.Commands.CreateCity;

public sealed record AdminCreateCityCommand(
    int                          CountryId,
    List<GeoTranslationInput>?   Translations = null,
    string?                      CreatedBy    = null)
    : IRequest<ApiResult<int>>;

public sealed record GeoTranslationInput(int LanguageId, string Name, string? Slug = null);
