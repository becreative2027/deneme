using SpotFinder.BuildingBlocks.Application;
using SpotFinder.GeoService.Domain.Repositories;

namespace SpotFinder.GeoService.Application.Features.Cities.Queries.GetCitiesByCountry;

public sealed class GetCitiesByCountryQueryHandler : IQueryHandler<GetCitiesByCountryQuery, IReadOnlyList<CityDto>>
{
    private readonly ICityRepository _cityRepository;
    public GetCitiesByCountryQueryHandler(ICityRepository cityRepository) => _cityRepository = cityRepository;

    public async Task<IReadOnlyList<CityDto>> Handle(GetCitiesByCountryQuery request, CancellationToken cancellationToken)
    {
        var cities = await _cityRepository.GetByCountryIdAsync(request.CountryId, cancellationToken);
        return cities.Select(c =>
        {
            var t = c.Translations.FirstOrDefault(x => x.LanguageId == request.LanguageId);
            return new CityDto(c.Id, c.CountryId, t?.Name ?? string.Empty, t?.Slug);
        }).ToList();
    }
}
