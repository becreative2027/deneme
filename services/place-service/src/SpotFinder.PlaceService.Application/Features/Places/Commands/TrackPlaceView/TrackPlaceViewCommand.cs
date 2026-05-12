using MediatR;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.TrackPlaceView;

/// <summary>
/// Records that a user viewed a place detail page.
/// Used to update user interest signals for personalized recommendations.
/// Fire-and-forget safe — handler is intentionally lightweight.
/// </summary>
public sealed record TrackPlaceViewCommand(Guid UserId, Guid PlaceId) : IRequest<Unit>;
