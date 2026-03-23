using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.GeoService.Application.Features.Countries.Queries.GetAllCountries;

public sealed record GetAllCountriesQuery(int LanguageId = 1) : IQuery<IReadOnlyList<CountryDto>>;
public sealed record CountryDto(int Id, string Code, string Name, string? Slug);
