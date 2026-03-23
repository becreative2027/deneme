namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

/// <summary>Maps to <c>content.trending_scores</c> — refreshed every 10 min by content-service.</summary>
public sealed class TrendingScoreRow
{
    public Guid     PlaceId   { get; set; }
    public decimal  Score     { get; set; }
    public DateTime UpdatedAt { get; set; }
}
