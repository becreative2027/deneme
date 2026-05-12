using MediatR;
using SpotFinder.PlaceService.Infrastructure.Services;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.TrackPlaceView;

public sealed class TrackPlaceViewCommandHandler(IUserInterestWriter interests)
    : IRequestHandler<TrackPlaceViewCommand, Unit>
{
    public async Task<Unit> Handle(TrackPlaceViewCommand request, CancellationToken ct)
    {
        // Place view is a light interest signal (+1)
        await interests.UpdateAsync(request.UserId, request.PlaceId, 1m, ct);
        return Unit.Value;
    }
}
