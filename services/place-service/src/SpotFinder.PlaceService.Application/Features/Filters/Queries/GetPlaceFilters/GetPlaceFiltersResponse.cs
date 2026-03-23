namespace SpotFinder.PlaceService.Application.Features.Filters.Queries.GetPlaceFilters;

public sealed record PlaceFiltersResponse(
    IReadOnlyList<FilterCategoryDto> Categories);

public sealed record FilterCategoryDto(
    int Id,
    string Key,
    string DisplayName,
    IReadOnlyList<FilterLabelDto> Labels);

public sealed record FilterLabelDto(
    int Id,
    string Key,
    string DisplayName);
