using SpotFinder.AdminService.Domain.Entities;

namespace SpotFinder.AdminService.Domain.Repositories;

public interface IImportJobRepository
{
    Task<ImportJob?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ImportJob>> GetRecentAsync(int count, CancellationToken ct = default);
    Task AddAsync(ImportJob job, CancellationToken ct = default);
    void Update(ImportJob job);
}
