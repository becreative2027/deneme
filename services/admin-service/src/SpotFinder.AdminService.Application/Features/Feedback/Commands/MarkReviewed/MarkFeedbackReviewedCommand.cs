using MediatR;

namespace SpotFinder.AdminService.Application.Features.Feedback.Commands.MarkReviewed;

public sealed record MarkFeedbackReviewedCommand(Guid FeedbackId) : IRequest;
