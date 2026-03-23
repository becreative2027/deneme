namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

/// <summary>Maps to <c>content.user_interests</c> — written by content-service.</summary>
public sealed class UserInterestRow
{
    public Guid    UserId  { get; set; }
    public int     LabelId { get; set; }
    public decimal Score   { get; set; }
}
