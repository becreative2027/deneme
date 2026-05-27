using MediatR;

namespace SpotFinder.AdminService.Application.Features.Feedback.Commands.RespondToFeedback;

public sealed record RespondToFeedbackCommand(Guid FeedbackId, string Message) : IRequest;
