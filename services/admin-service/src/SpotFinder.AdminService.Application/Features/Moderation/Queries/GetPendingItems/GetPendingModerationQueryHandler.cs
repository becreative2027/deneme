using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.Moderation.Queries.GetPendingItems;

public sealed class GetPendingModerationQueryHandler : IQueryHandler<GetPendingModerationQuery, PagedResult<ModerationItemDto>>
{
    private readonly IModerationRepository _moderationRepository;
    public GetPendingModerationQueryHandler(IModerationRepository moderationRepository) => _moderationRepository = moderationRepository;

    public async Task<PagedResult<ModerationItemDto>> Handle(GetPendingModerationQuery request, CancellationToken cancellationToken)
    {
        var result = await _moderationRepository.GetPendingAsync(request.TargetType, request.Page, request.PageSize, cancellationToken);
        var dtos = result.Items.Select(i => new ModerationItemDto(i.Id, i.TargetType.ToString(), i.TargetId, i.Status.ToString(), i.ReporterId, i.ReporterNote, i.CreatedAt)).ToList();
        return PagedResult<ModerationItemDto>.Create(dtos, result.TotalCount, result.Page, result.PageSize);
    }
}
