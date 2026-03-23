using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.AuditLogs.Queries.GetAuditLogs;

public sealed record GetAuditLogsQuery(Guid? AdminId, int Page, int PageSize) : IQuery<PagedResult<AuditLogDto>>;
public sealed record AuditLogDto(Guid Id, Guid AdminId, string Action, string TargetEntity, Guid TargetId, string? Details, DateTime OccurredAt);
