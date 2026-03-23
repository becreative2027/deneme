using Microsoft.EntityFrameworkCore;
using SpotFinder.LabelService.Domain.Entities;
using SpotFinder.LabelService.Domain.Repositories;
using SpotFinder.LabelService.Infrastructure.Persistence;

namespace SpotFinder.LabelService.Infrastructure.Repositories;

public sealed class LabelRepository : ILabelRepository
{
    private readonly LabelDbContext _context;
    public LabelRepository(LabelDbContext context) => _context = context;

    public async Task<Label?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _context.Labels
            .Include(l => l.Translations)
            .Include(l => l.Keywords)
            .FirstOrDefaultAsync(l => l.Id == id, ct);

    public async Task<IReadOnlyList<Label>> GetByCategoryIdAsync(int categoryId, CancellationToken ct = default)
        => await _context.Labels
            .Include(l => l.Translations)
            .Where(l => l.CategoryId == categoryId && l.IsActive)
            .ToListAsync(ct);

    public async Task AddAsync(Label label, CancellationToken ct = default)
        => await _context.Labels.AddAsync(label, ct);
}
