using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Infrastructure.Repositories;

public sealed class ModerationRepository : IModerationRepository
{
    private readonly AdminDbContext _context;
    public ModerationRepository(AdminDbContext context) => _context = context;

    public async Task<ModerationItem?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.ModerationItems.FindAsync([id], ct);

    public async Task<PagedResult<ModerationItem>> GetPendingAsync(ModerationTargetType? targetType, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.ModerationItems.Where(m => m.Status == ModerationStatus.Pending);
        if (targetType.HasValue) query = query.Where(m => m.TargetType == targetType.Value);
        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(m => m.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return PagedResult<ModerationItem>.Create(items, total, page, pageSize);
    }

    public async Task<bool> HasReportedAsync(string reporterId, ModerationTargetType targetType, Guid targetId, CancellationToken ct = default)
        => await _context.ModerationItems.AnyAsync(
            m => m.ReporterId == reporterId && m.TargetType == targetType && m.TargetId == targetId, ct);

    public async Task AddAsync(ModerationItem item, CancellationToken ct = default)
        => await _context.ModerationItems.AddAsync(item, ct);

    public void Update(ModerationItem item)
        => _context.ModerationItems.Update(item);
}
