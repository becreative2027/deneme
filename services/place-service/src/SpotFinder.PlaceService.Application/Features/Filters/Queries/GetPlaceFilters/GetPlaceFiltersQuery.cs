using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.PlaceService.Application.Features.Filters.Queries.GetPlaceFilters;

/// <summary>GET /api/filters — returns all label categories + labels, localized.</summary>
public sealed record GetPlaceFiltersQuery(int LanguageId = 1)
    : IRequest<ApiResult<PlaceFiltersResponse>>;
