using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.AuditLogs.Queries.GetAuditLogs;

public sealed record GetAuditLogsQuery(Guid? AdminId, int Page, int PageSize) : IQuery<PagedResult<AuditLogDto>>;
public sealed record AuditLogDto(string Id, string? UserId, string Action, string EntityType, string EntityId, string? Payload, DateTime CreatedAt);
