using SpotFinder.BuildingBlocks.Application;
using SpotFinder.SearchService.Domain.Services;

namespace SpotFinder.SearchService.Application.Features.Search.Queries.Autocomplete;

public sealed class AutocompleteQueryHandler : IQueryHandler<AutocompleteQuery, IReadOnlyList<string>>
{
    private readonly IPlaceSearchEngine _searchEngine;
    public AutocompleteQueryHandler(IPlaceSearchEngine searchEngine) => _searchEngine = searchEngine;

    public async Task<IReadOnlyList<string>> Handle(AutocompleteQuery request, CancellationToken cancellationToken)
        => await _searchEngine.AutocompleteAsync(request.Query, request.CityId, request.LanguageCode, cancellationToken);
}
