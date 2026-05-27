namespace SpotFinder.AdminService.Application.Features.Moderation.Queries.GetPendingItems;

public interface IModerationEnrichmentService
{
    /// <summary>Fetches post and author details for the given post IDs from the content schema.</summary>
    Task<Dictionary<Guid, PostSummary>> GetPostsAsync(IEnumerable<Guid> postIds, CancellationToken ct = default);

    /// <summary>Fetches user summaries for the given user IDs from the identity schema.</summary>
    Task<Dictionary<Guid, UserSummary>> GetUsersAsync(IEnumerable<Guid> userIds, CancellationToken ct = default);
}
