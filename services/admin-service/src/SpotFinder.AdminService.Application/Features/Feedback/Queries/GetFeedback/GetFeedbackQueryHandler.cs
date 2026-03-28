using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.Feedback.Queries.GetFeedback;

public sealed class GetFeedbackQueryHandler : IQueryHandler<GetFeedbackQuery, PagedResult<FeedbackItemDto>>
{
    private readonly IFeedbackRepository _repo;
    public GetFeedbackQueryHandler(IFeedbackRepository repo) => _repo = repo;

    public async Task<PagedResult<FeedbackItemDto>> Handle(GetFeedbackQuery request, CancellationToken cancellationToken)
    {
        var result = await _repo.GetAllAsync(request.Reviewed, request.Page, request.PageSize, cancellationToken);
        var dtos = result.Items.Select(f => new FeedbackItemDto(
            f.Id,
            f.Category.ToString(),
            f.Message,
            f.UserId,
            f.UserEmail,
            f.IsReviewed,
            f.CreatedAt)).ToList();
        return PagedResult<FeedbackItemDto>.Create(dtos, result.TotalCount, result.Page, result.PageSize);
    }
}
