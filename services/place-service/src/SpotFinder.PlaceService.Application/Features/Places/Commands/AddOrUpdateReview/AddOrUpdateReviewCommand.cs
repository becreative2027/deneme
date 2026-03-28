using MediatR;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.AddOrUpdateReview;

public sealed record AddOrUpdateReviewCommand(
    Guid PlaceId,
    Guid UserId,
    string Username,
    string DisplayName,
    string? AvatarUrl,
    int Rating,
    string? Comment
) : IRequest<Unit>;
