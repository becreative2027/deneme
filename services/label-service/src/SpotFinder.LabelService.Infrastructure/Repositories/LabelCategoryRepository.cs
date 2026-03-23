using Microsoft.EntityFrameworkCore;
using SpotFinder.LabelService.Domain.Entities;
using SpotFinder.LabelService.Domain.Repositories;
using SpotFinder.LabelService.Infrastructure.Persistence;

namespace SpotFinder.LabelService.Infrastructure.Repositories;

public sealed class LabelCategoryRepository : ILabelCategoryRepository
{
    private readonly LabelDbContext _context;
    public LabelCategoryRepository(LabelDbContext context) => _context = context;

    public async Task<LabelCategory?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _context.LabelCategories
            .Include(c => c.Translations)
            .Include(c => c.Labels)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IReadOnlyList<LabelCategory>> GetAllAsync(CancellationToken ct = default)
        => await _context.LabelCategories
            .Include(c => c.Translations)
            .ToListAsync(ct);

    public async Task AddAsync(LabelCategory category, CancellationToken ct = default)
        => await _context.LabelCategories.AddAsync(category, ct);
}
