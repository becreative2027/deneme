using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.GeoService.Application.Features.Cities.Queries.GetCitiesByCountry;

public sealed record GetCitiesByCountryQuery(int CountryId, int LanguageId = 1) : IQuery<IReadOnlyList<CityDto>>;
public sealed record CityDto(int Id, int CountryId, string Name, string? Slug);
