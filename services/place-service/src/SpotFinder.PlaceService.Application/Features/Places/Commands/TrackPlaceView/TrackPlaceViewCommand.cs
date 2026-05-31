using MediatR;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.TrackPlaceView;

/// <summary>
/// Records that a user viewed a place detail page.
/// Persists a row to place.place_views for analytics and updates user interest signals.
/// Fire-and-forget safe — handler swallows errors silently.
/// </summary>
public sealed record TrackPlaceViewCommand(Guid UserId, Guid PlaceId, int? DurationSeconds = null) : IRequest<Unit>;
