using MediatR;

namespace SpotFinder.AdminService.Application.Features.PlaceEvents.Commands;

public sealed record DeletePlaceEventCommand(Guid PlaceId, Guid EventId) : IRequest<bool>;
