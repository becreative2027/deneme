using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Domain.Repositories;

public interface IPlaceReviewRepository
{
    Task<PlaceReview?> GetByPlaceAndUserAsync(Guid placeId, Guid userId, CancellationToken ct = default);
    Task<PlaceReview?> GetByIdAsync(Guid reviewId, CancellationToken ct = default);
    Task<(IReadOnlyList<PlaceReview> Items, int Total)> GetByPlaceIdAsync(Guid placeId, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(PlaceReview review, CancellationToken ct = default);
    Task RemoveAsync(PlaceReview review, CancellationToken ct = default);
    Task<(decimal Average, int Count)> GetRatingStatsAsync(Guid placeId, CancellationToken ct = default);
}
