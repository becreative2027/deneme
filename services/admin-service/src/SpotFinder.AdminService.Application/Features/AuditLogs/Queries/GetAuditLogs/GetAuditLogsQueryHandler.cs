using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.AuditLogs.Queries.GetAuditLogs;

public sealed class GetAuditLogsQueryHandler : IQueryHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly IAuditLogRepository _auditLogRepository;
    public GetAuditLogsQueryHandler(IAuditLogRepository auditLogRepository) => _auditLogRepository = auditLogRepository;

    public async Task<PagedResult<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var result = await _auditLogRepository.GetPagedAsync(request.AdminId, request.Page, request.PageSize, cancellationToken);
        var dtos = result.Items.Select(l => new AuditLogDto(l.Id, l.AdminId, l.Action, l.TargetEntity, l.TargetId, l.Details, l.OccurredAt)).ToList();
        return PagedResult<AuditLogDto>.Create(dtos, result.TotalCount, result.Page, result.PageSize);
    }
}
