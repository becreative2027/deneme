using MediatR;

namespace SpotFinder.PlaceService.Application.Features.Events.Queries.GetPlaceEvents;

public sealed record GetPlaceEventsQuery(Guid PlaceId, bool IncludePast = false)
    : IRequest<IReadOnlyList<PlaceEventDto>>;

public sealed record PlaceEventDto(
    Guid     Id,
    string   Title,
    string?  Description,
    DateTime StartsAt,
    DateTime? EndsAt,
    string?  ImageUrl,
    DateTime CreatedAt);
