using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.SearchService.Application.Features.Search.Queries.Autocomplete;

public sealed record AutocompleteQuery(string Query, Guid? CityId, string LanguageCode = "en") : IQuery<IReadOnlyList<string>>;
