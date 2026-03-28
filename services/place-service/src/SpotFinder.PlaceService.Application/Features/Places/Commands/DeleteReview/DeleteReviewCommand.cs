using MediatR;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.DeleteReview;

public sealed record DeleteReviewCommand(Guid PlaceId, Guid ReviewId) : IRequest<bool>;
