using SpotFinder.BuildingBlocks.Application;
using SpotFinder.GeoService.Domain.Repositories;

namespace SpotFinder.GeoService.Application.Features.Countries.Queries.GetAllCountries;

public sealed class GetAllCountriesQueryHandler : IQueryHandler<GetAllCountriesQuery, IReadOnlyList<CountryDto>>
{
    private readonly ICountryRepository _countryRepository;
    public GetAllCountriesQueryHandler(ICountryRepository countryRepository) => _countryRepository = countryRepository;

    public async Task<IReadOnlyList<CountryDto>> Handle(GetAllCountriesQuery request, CancellationToken cancellationToken)
    {
        var countries = await _countryRepository.GetAllAsync(cancellationToken);
        return countries.Select(c =>
        {
            var t = c.Translations.FirstOrDefault(x => x.LanguageId == request.LanguageId);
            return new CountryDto(c.Id, c.Code, t?.Name ?? c.Code, t?.Slug);
        }).ToList();
    }
}
