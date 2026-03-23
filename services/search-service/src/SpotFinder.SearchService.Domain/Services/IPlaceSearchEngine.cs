using SpotFinder.BuildingBlocks.Application;
using SpotFinder.SearchService.Domain.Models;

namespace SpotFinder.SearchService.Domain.Services;

public interface IPlaceSearchEngine
{
    Task<PagedResult<PlaceSearchResult>> SearchAsync(SearchFilter filter, string languageCode, CancellationToken ct = default);
    Task<IReadOnlyList<string>> AutocompleteAsync(string query, Guid? cityId, string languageCode, CancellationToken ct = default);
}
