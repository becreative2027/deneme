using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Infrastructure.Persistence;

namespace SpotFinder.AdminService.Infrastructure.Services;

/// <summary>
/// Fetches post and user details from the shared PostgreSQL instance (content + identity schemas)
/// to enrich moderation items without cross-service HTTP calls.
/// </summary>
public sealed class ModerationEnrichmentService(AdminDbContext db) : IModerationEnrichmentService
{
    public async Task<Dictionary<Guid, PostSummary>> GetPostsAsync(IEnumerable<Guid> postIds, CancellationToken ct = default)
    {
        var ids = postIds.Select(id => id.ToString()).ToList();
        if (ids.Count == 0) return new();

        var rows = await db.Database
            .SqlQueryRaw<PostRow>(
                """
                SELECT
                    p.id,
                    p.user_id   AS author_id,
                    p.caption,
                    p.like_count,
                    p.comment_count,
                    (SELECT pm.url FROM content.post_media pm WHERE pm.post_id = p.id ORDER BY pm.created_at LIMIT 1) AS image_url
                FROM content.posts p
                WHERE p.id = ANY(@ids)
                """,
                new Npgsql.NpgsqlParameter("ids", ids.Select(Guid.Parse).ToArray()))
            .ToListAsync(ct);

        return rows.ToDictionary(
            r => r.Id,
            r => new PostSummary(r.Id, r.Caption, r.ImageUrl, r.AuthorId, null, null, r.LikeCount, r.CommentCount));
    }

    public async Task<Dictionary<Guid, UserSummary>> GetUsersAsync(IEnumerable<Guid> userIds, CancellationToken ct = default)
    {
        var ids = userIds.ToList();
        if (ids.Count == 0) return new();

        var rows = await db.Database
            .SqlQueryRaw<UserRow>(
                """
                SELECT
                    u.id,
                    u.username,
                    p.display_name,
                    p.profile_image_url AS avatar_url
                FROM identity.users u
                LEFT JOIN identity.profiles p ON p.user_id = u.id
                WHERE u.id = ANY(@ids)
                """,
                new Npgsql.NpgsqlParameter("ids", ids.ToArray()))
            .ToListAsync(ct);

        return rows.ToDictionary(
            r => r.Id,
            r => new UserSummary(r.Id, r.Username, r.DisplayName, r.AvatarUrl));
    }

    // Raw result types used only for SqlQueryRaw mapping
    private sealed class PostRow
    {
        public Guid    Id           { get; init; }
        public Guid    AuthorId     { get; init; }
        public string? Caption      { get; init; }
        public string? ImageUrl     { get; init; }
        public int     LikeCount    { get; init; }
        public int     CommentCount { get; init; }
    }

    private sealed class UserRow
    {
        public Guid    Id          { get; init; }
        public string? Username    { get; init; }
        public string? DisplayName { get; init; }
        public string? AvatarUrl   { get; init; }
    }
}
