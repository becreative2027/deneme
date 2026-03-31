using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.SearchPlaces;

/// <summary>POST /api/places/search</summary>
public sealed record SearchPlacesQuery(
    string?         Query       = null,
    int             LanguageId  = 1,
    int?            CityId      = null,
    int?            DistrictId  = null,
    List<int>?      LabelIds    = null,
    string          MatchMode   = "ANY",
    decimal?        MinRating   = null,
    List<int>?      PriceLevels = null,
    List<string>?   VenueTypes  = null,
    int             Page        = 1,
    int             PageSize    = 20)
    : IRequest<ApiResult<SearchPlacesResponse>>;
