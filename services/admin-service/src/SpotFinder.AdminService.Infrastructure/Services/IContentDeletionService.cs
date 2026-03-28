using SpotFinder.AdminService.Domain.Enums;

namespace SpotFinder.AdminService.Infrastructure.Services;

public interface IContentDeletionService
{
    /// <summary>
    /// Deletes the content identified by targetType and targetId.
    /// Called when a moderation item is approved.
    /// </summary>
    Task DeleteAsync(ModerationTargetType targetType, Guid targetId, CancellationToken ct = default);
}
