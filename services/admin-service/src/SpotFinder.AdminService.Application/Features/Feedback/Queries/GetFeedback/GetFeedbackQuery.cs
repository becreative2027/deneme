using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.Feedback.Queries.GetFeedback;

public sealed record GetFeedbackQuery(bool? Reviewed, int Page, int PageSize) : IQuery<PagedResult<FeedbackItemDto>>;

public sealed record FeedbackItemDto(
    Guid     Id,
    string   Category,
    string   Message,
    string?  UserId,
    string?  UserEmail,
    bool     IsReviewed,
    DateTime CreatedAt);
