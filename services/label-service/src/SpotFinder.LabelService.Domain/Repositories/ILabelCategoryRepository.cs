using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Domain.Repositories;

public interface ILabelCategoryRepository
{
    Task<LabelCategory?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<LabelCategory>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(LabelCategory category, CancellationToken ct = default);
}
