using MediatR;
using SpotFinder.PlaceService.Domain.Repositories;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceReviews;

public sealed class GetPlaceReviewsQueryHandler(IPlaceReviewRepository reviewRepo)
    : IRequestHandler<GetPlaceReviewsQuery, PlaceReviewsResponse>
{
    public async Task<PlaceReviewsResponse> Handle(GetPlaceReviewsQuery request, CancellationToken ct)
    {
        var (items, total) = await reviewRepo.GetByPlaceIdAsync(request.PlaceId, request.Page, request.PageSize, ct);

        var dtos = items.Select(r => new PlaceReviewDto(
            r.Id, r.UserId, r.Username, r.DisplayName, r.AvatarUrl,
            r.Rating, r.Comment, r.CreatedAt)).ToList();

        return new PlaceReviewsResponse(dtos, total, request.Page, request.PageSize, null);
    }
}
