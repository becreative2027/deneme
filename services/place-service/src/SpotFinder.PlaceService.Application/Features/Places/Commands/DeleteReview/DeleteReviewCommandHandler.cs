using MediatR;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.PlaceService.Domain.Repositories;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.DeleteReview;

public sealed class DeleteReviewCommandHandler(
    IPlaceReviewRepository reviewRepo,
    IPlaceRepository placeRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteReviewCommand, bool>
{
    public async Task<bool> Handle(DeleteReviewCommand request, CancellationToken ct)
    {
        var review = await reviewRepo.GetByIdAsync(request.ReviewId, ct);
        if (review is null || review.PlaceId != request.PlaceId)
            return false;

        await reviewRepo.RemoveAsync(review, ct);
        await unitOfWork.SaveChangesAsync(ct);

        // Recalculate rating stats
        var (avg, count) = await reviewRepo.GetRatingStatsAsync(request.PlaceId, ct);
        var place = await placeRepo.GetByIdAsync(request.PlaceId, ct);
        if (place is not null)
        {
            place.SetRatingStats(avg, count);
            await unitOfWork.SaveChangesAsync(ct);
        }

        return true;
    }
}
