using MediatR;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.PlaceService.Domain.Entities;
using SpotFinder.PlaceService.Domain.Repositories;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.AddOrUpdateReview;

public sealed class AddOrUpdateReviewCommandHandler(
    IPlaceReviewRepository reviewRepo,
    IPlaceRepository placeRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<AddOrUpdateReviewCommand, Unit>
{
    public async Task<Unit> Handle(AddOrUpdateReviewCommand request, CancellationToken ct)
    {
        // Upsert the review
        var existing = await reviewRepo.GetByPlaceAndUserAsync(request.PlaceId, request.UserId, ct);
        if (existing is null)
        {
            var review = PlaceReview.Create(
                request.PlaceId, request.UserId, request.Username,
                request.DisplayName, request.AvatarUrl, request.Rating, request.Comment);
            await reviewRepo.AddAsync(review, ct);
        }
        else
        {
            existing.Update(request.Rating, request.Comment, request.DisplayName, request.AvatarUrl);
        }

        await unitOfWork.SaveChangesAsync(ct);

        // Recalculate and persist rating stats on the place
        var (avg, count) = await reviewRepo.GetRatingStatsAsync(request.PlaceId, ct);
        var place = await placeRepo.GetByIdAsync(request.PlaceId, ct);
        if (place is not null)
        {
            place.SetRatingStats(avg, count);
            await unitOfWork.SaveChangesAsync(ct);
        }

        return Unit.Value;
    }
}
