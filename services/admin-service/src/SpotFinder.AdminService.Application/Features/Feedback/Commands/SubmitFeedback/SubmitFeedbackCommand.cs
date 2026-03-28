using MediatR;
using SpotFinder.AdminService.Domain.Enums;

namespace SpotFinder.AdminService.Application.Features.Feedback.Commands.SubmitFeedback;

public sealed record SubmitFeedbackCommand(
    FeedbackCategory Category,
    string           Message,
    string?          UserId,
    string?          UserEmail) : IRequest<Guid>;
