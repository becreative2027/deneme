using MediatR;

namespace SpotFinder.AdminService.Application.Features.PlaceEvents.Commands;

public sealed record CreatePlaceEventCommand(
    Guid      PlaceId,
    string    Title,
    string?   Description,
    DateTime  StartsAt,
    DateTime? EndsAt,
    string?   ImageUrl,
    string    CreatedBy
) : IRequest<Guid>;
