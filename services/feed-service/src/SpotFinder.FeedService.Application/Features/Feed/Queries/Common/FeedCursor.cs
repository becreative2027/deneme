namespace SpotFinder.FeedService.Application.Features.Feed.Queries.Common;

/// <summary>
/// Opaque keyset cursor for stable, duplicate-free feed pagination.
/// The three fields together form a total ordering over the result set.
/// </summary>
public sealed record FeedCursor(
    int      Score,      // like_count*2 + comment_count*3 + recency_bonus at time of fetch
    DateTime CreatedAt,  // post.created_at
    Guid     PostId      // post.id — final tiebreaker (uuid ordering)
);
