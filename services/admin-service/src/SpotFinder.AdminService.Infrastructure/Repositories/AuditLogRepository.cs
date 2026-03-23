using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Infrastructure.Repositories;

public sealed class AuditLogRepository : IAuditLogRepository
{
    private readonly AdminDbContext _context;
    public AuditLogRepository(AdminDbContext context) => _context = context;

    public async Task<PagedResult<AuditLog>> GetPagedAsync(Guid? adminId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.AuditLogs.AsQueryable();
        if (adminId.HasValue) query = query.Where(l => l.AdminId == adminId.Value);
        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(l => l.OccurredAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return PagedResult<AuditLog>.Create(items, total, page, pageSize);
    }

    public async Task AddAsync(AuditLog log, CancellationToken ct = default)
        => await _context.AuditLogs.AddAsync(log, ct);
}
