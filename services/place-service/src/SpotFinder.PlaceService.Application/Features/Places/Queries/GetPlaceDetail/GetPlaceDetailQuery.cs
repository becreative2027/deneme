using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceDetail;

/// <summary>GET /api/places/{id} — full place detail with labels and scores.</summary>
public sealed record GetPlaceDetailQuery(Guid PlaceId, int LanguageId = 1)
    : IRequest<ApiResult<PlaceDetailResponse>>;
