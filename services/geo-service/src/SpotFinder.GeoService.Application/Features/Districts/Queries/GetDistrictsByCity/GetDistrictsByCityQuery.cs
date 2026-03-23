using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.GeoService.Application.Features.Districts.Queries.GetDistrictsByCity;

public sealed record GetDistrictsByCityQuery(int CityId, int LanguageId = 1) : IQuery<IReadOnlyList<DistrictDto>>;
public sealed record DistrictDto(int Id, int CityId, string Name, string? Slug);
