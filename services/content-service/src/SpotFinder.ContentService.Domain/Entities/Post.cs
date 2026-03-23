namespace SpotFinder.ContentService.Domain.Entities;

public sealed class Post
{
    public Guid Id           { get; set; }
    public Guid UserId       { get; set; }
    public Guid PlaceId      { get; set; }
    public string? Caption   { get; set; }
    public int LikeCount     { get; set; }
    public int CommentCount  { get; set; }
    public int FeedScore     { get; set; }
    public bool IsDeleted    { get; set; }
    public string Status       { get; set; } = "active";
    public string? HiddenReason { get; set; }
    public DateTime? ModeratedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<PostMedia>   Media    { get; set; } = [];
    public List<PostLike>    Likes    { get; set; } = [];
    public List<PostComment> Comments { get; set; } = [];

    /// <summary>
    /// Computes the materialized feed score with time decay.
    /// Called immediately by write-side handlers (Like, Unlike, Comment, Create).
    /// The background job <c>FeedScoreRefreshJob</c> re-applies this formula
    /// every 5 minutes for all posts younger than 48 h, keeping scores fresh
    /// even when a post receives no new interactions.
    ///
    /// Formula:
    ///   base_score      = (likeCount × 2) + (commentCount × 3)
    ///   freshness_boost = +3 if age &lt; 3 h (surfaces brand-new posts)
    ///   time_decay      = hours_since_post × 0.5
    ///   feed_score      = max(0, base_score + freshness_boost − time_decay)
    /// </summary>
    public static int ComputeFeedScore(int likeCount, int commentCount, DateTime createdAt)
    {
        var baseScore      = (likeCount * 2) + (commentCount * 3);
        var hoursSince     = (DateTime.UtcNow - createdAt).TotalHours;
        var freshnessBoost = hoursSince < 3 ? 3 : 0;
        var decay          = hoursSince * 0.5;
        return (int)Math.Max(0, baseScore + freshnessBoost - decay);
    }
}
