using SpotFinder.BuildingBlocks.Application;
using SpotFinder.SearchService.Domain.Models;

namespace SpotFinder.SearchService.Application.Features.Search.Queries.SearchPlaces;

public sealed record SearchPlacesQuery(
    string? Query,
    Guid? CityId,
    Guid? DistrictId,
    List<Guid>? LabelIds,
    LabelMatchMode MatchMode,
    double? NearLatitude,
    double? NearLongitude,
    double? RadiusKm,
    int Page,
    int PageSize,
    string LanguageCode) : IQuery<PagedResult<PlaceSearchResultDto>>;

public sealed record PlaceSearchResultDto(
    Guid PlaceId, string Slug, string Name,
    double Latitude, double Longitude,
    Guid CityId, List<string> LabelSlugs,
    double? DistanceKm, double RelevanceScore);
