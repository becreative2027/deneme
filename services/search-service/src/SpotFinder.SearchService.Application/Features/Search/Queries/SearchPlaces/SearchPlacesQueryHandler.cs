using SpotFinder.BuildingBlocks.Application;
using SpotFinder.SearchService.Domain.Models;
using SpotFinder.SearchService.Domain.Services;

namespace SpotFinder.SearchService.Application.Features.Search.Queries.SearchPlaces;

public sealed class SearchPlacesQueryHandler : IQueryHandler<SearchPlacesQuery, PagedResult<PlaceSearchResultDto>>
{
    private readonly IPlaceSearchEngine _searchEngine;

    public SearchPlacesQueryHandler(IPlaceSearchEngine searchEngine) => _searchEngine = searchEngine;

    public async Task<PagedResult<PlaceSearchResultDto>> Handle(SearchPlacesQuery request, CancellationToken cancellationToken)
    {
        var filter = new SearchFilter
        {
            Query = request.Query,
            CityId = request.CityId,
            DistrictId = request.DistrictId,
            LabelIds = request.LabelIds ?? new(),
            MatchMode = request.MatchMode,
            NearLatitude = request.NearLatitude,
            NearLongitude = request.NearLongitude,
            RadiusKm = request.RadiusKm,
            Page = request.Page,
            PageSize = request.PageSize
        };

        var result = await _searchEngine.SearchAsync(filter, request.LanguageCode, cancellationToken);
        var dtos = result.Items.Select(r => new PlaceSearchResultDto(
            r.PlaceId, r.Slug, r.Name, r.Latitude, r.Longitude, r.CityId, r.LabelSlugs, r.DistanceKm, r.RelevanceScore
        )).ToList();

        return PagedResult<PlaceSearchResultDto>.Create(dtos, result.TotalCount, result.Page, result.PageSize);
    }
}
