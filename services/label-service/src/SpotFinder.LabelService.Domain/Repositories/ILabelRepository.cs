using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Domain.Repositories;

public interface ILabelRepository
{
    Task<Label?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Label>> GetByCategoryIdAsync(int categoryId, CancellationToken ct = default);
    Task AddAsync(Label label, CancellationToken ct = default);
}
