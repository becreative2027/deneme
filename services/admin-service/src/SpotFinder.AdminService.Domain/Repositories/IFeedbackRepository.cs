using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Domain.Repositories;

public interface IFeedbackRepository
{
    Task AddAsync(FeedbackItem item, CancellationToken ct = default);
    Task<FeedbackItem?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<FeedbackItem>> GetAllAsync(bool? reviewed, int page, int pageSize, CancellationToken ct = default);
    void Update(FeedbackItem item);
}
