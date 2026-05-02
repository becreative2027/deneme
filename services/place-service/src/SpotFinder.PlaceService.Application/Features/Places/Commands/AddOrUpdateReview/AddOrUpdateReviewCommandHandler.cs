using MediatR;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.PlaceService.Infrastructure.Services;
using SpotFinder.PlaceService.Domain.Entities;
using SpotFinder.PlaceService.Domain.Repositories;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.AddOrUpdateReview;

public sealed class AddOrUpdateReviewCommandHandler(
    IPlaceReviewRepository reviewRepo,
    IPlaceRepository placeRepo,
    IPlaceScoreRepository scoreRepo,
    IUserInterestWriter interests,
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

        // Recalculate place_scores based on new review stats
        // quality_score  = average review rating (0-5 scale) mapped to 0-10
        // popularity_score grows with review count (log-scale, capped at 10)
        // final_score = weighted average: 70% quality + 30% popularity
        var qualityScore    = avg * 2m;                                          // 0-10
        var popularityScore = Math.Min(10m, (decimal)Math.Log(1 + count) * 2m); // 0-10 log-scaled
        var finalScore      = (qualityScore * 0.7m) + (popularityScore * 0.3m);

        var score = await scoreRepo.GetByPlaceIdAsync(request.PlaceId, ct);
        if (score is not null)
        {
            score.Update(popularityScore, qualityScore, score.TrendScore, finalScore);
            scoreRepo.Update(score);
        }
        else
        {
            scoreRepo.Update(PlaceScore.Create(request.PlaceId, popularityScore, qualityScore, trend: null, finalScore: finalScore));
        }

        await unitOfWork.SaveChangesAsync(ct);

        // Update user interest signals — review is a strong engagement signal (+5)
        await interests.UpdateAsync(request.UserId, request.PlaceId, 5m, ct);

        return Unit.Value;
    }
}
