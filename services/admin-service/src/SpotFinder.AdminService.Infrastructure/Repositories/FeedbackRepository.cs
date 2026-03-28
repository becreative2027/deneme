using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Infrastructure.Repositories;

public sealed class FeedbackRepository : IFeedbackRepository
{
    private readonly AdminDbContext _context;
    public FeedbackRepository(AdminDbContext context) => _context = context;

    public async Task AddAsync(FeedbackItem item, CancellationToken ct = default)
        => await _context.FeedbackItems.AddAsync(item, ct);

    public async Task<FeedbackItem?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.FeedbackItems.FindAsync([id], ct);

    public async Task<PagedResult<FeedbackItem>> GetAllAsync(bool? reviewed, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.FeedbackItems.AsQueryable();
        if (reviewed.HasValue)
            query = query.Where(f => f.IsReviewed == reviewed.Value);
        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return PagedResult<FeedbackItem>.Create(items, total, page, pageSize);
    }

    public void Update(FeedbackItem item) => _context.FeedbackItems.Update(item);
}
