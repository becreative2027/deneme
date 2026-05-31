using MediatR;
using SpotFinder.PlaceService.Domain.Entities;
using SpotFinder.PlaceService.Infrastructure.Persistence;
using SpotFinder.PlaceService.Infrastructure.Services;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.TrackPlaceView;

public sealed class TrackPlaceViewCommandHandler(IUserInterestWriter interests, PlaceDbContext db)
    : IRequestHandler<TrackPlaceViewCommand, Unit>
{
    public async Task<Unit> Handle(TrackPlaceViewCommand request, CancellationToken ct)
    {
        // 1. Persist view row for analytics
        db.PlaceViews.Add(PlaceView.Create(request.UserId, request.PlaceId, request.DurationSeconds));
        await db.SaveChangesAsync(ct);

        // 2. Update user interest signals (fire-and-forget sub-task, errors ignored)
        _ = interests.UpdateAsync(request.UserId, request.PlaceId, 1m, CancellationToken.None);

        return Unit.Value;
    }
}
