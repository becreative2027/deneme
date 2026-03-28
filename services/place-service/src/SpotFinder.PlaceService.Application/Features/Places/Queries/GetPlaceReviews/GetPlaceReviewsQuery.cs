using MediatR;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceReviews;

public sealed record GetPlaceReviewsQuery(Guid PlaceId, int Page = 1, int PageSize = 20) : IRequest<PlaceReviewsResponse>;

public sealed record PlaceReviewDto(
    Guid Id,
    Guid UserId,
    string Username,
    string DisplayName,
    string? AvatarUrl,
    int Rating,
    string? Comment,
    DateTime CreatedAt);

public sealed record PlaceReviewsResponse(
    IReadOnlyList<PlaceReviewDto> Items,
    int Total,
    int Page,
    int PageSize,
    Guid? MyReviewId);
