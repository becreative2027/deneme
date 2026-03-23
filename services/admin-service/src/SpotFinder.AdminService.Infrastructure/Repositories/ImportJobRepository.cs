using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;

namespace SpotFinder.AdminService.Infrastructure.Repositories;

public sealed class ImportJobRepository : IImportJobRepository
{
    private readonly AdminDbContext _context;
    public ImportJobRepository(AdminDbContext context) => _context = context;

    public async Task<ImportJob?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.ImportJobs.FindAsync([id], ct);

    public async Task<IReadOnlyList<ImportJob>> GetRecentAsync(int count, CancellationToken ct = default)
        => await _context.ImportJobs.OrderByDescending(j => j.CreatedAt).Take(count).ToListAsync(ct);

    public async Task AddAsync(ImportJob job, CancellationToken ct = default)
        => await _context.ImportJobs.AddAsync(job, ct);

    public void Update(ImportJob job)
        => _context.ImportJobs.Update(job);
}
