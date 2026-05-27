namespace SpotFinder.AdminService.Infrastructure.Services;

public interface IModerationEnrichmentService
{
    Task<Dictionary<Guid, PostSummary>> GetPostsAsync(IEnumerable<Guid> postIds, CancellationToken ct = default);
    Task<Dictionary<Guid, UserSummary>> GetUsersAsync(IEnumerable<Guid> userIds, CancellationToken ct = default);
}

public sealed record PostSummary(
    Guid Id,
    string? Caption,
    string? ImageUrl,
    Guid AuthorId,
    string? AuthorUsername,
    string? AuthorAvatarUrl,
    int LikeCount,
    int CommentCount);

public sealed record UserSummary(
    Guid Id,
    string? Username,
    string? DisplayName,
    string? AvatarUrl);
