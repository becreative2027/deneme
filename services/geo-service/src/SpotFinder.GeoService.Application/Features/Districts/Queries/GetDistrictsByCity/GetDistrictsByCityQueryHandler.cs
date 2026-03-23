using SpotFinder.BuildingBlocks.Application;
using SpotFinder.GeoService.Domain.Repositories;

namespace SpotFinder.GeoService.Application.Features.Districts.Queries.GetDistrictsByCity;

public sealed class GetDistrictsByCityQueryHandler : IQueryHandler<GetDistrictsByCityQuery, IReadOnlyList<DistrictDto>>
{
    private readonly IDistrictRepository _districtRepository;
    public GetDistrictsByCityQueryHandler(IDistrictRepository districtRepository) => _districtRepository = districtRepository;

    public async Task<IReadOnlyList<DistrictDto>> Handle(GetDistrictsByCityQuery request, CancellationToken cancellationToken)
    {
        var districts = await _districtRepository.GetByCityIdAsync(request.CityId, cancellationToken);
        return districts.Select(d =>
        {
            var t = d.Translations.FirstOrDefault(x => x.LanguageId == request.LanguageId);
            return new DistrictDto(d.Id, d.CityId, t?.Name ?? string.Empty, t?.Slug);
        }).ToList();
    }
}
