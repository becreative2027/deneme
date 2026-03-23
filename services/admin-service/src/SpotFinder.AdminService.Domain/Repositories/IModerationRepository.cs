using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Domain.Repositories;

public interface IModerationRepository
{
    Task<ModerationItem?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<ModerationItem>> GetPendingAsync(ModerationTargetType? targetType, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(ModerationItem item, CancellationToken ct = default);
    void Update(ModerationItem item);
}
