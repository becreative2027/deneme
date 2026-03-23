using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Domain.Repositories;

public interface IAuditLogRepository
{
    Task<PagedResult<AuditLog>> GetPagedAsync(Guid? adminId, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(AuditLog log, CancellationToken ct = default);
}
