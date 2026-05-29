namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class UserSeenPostRow
{
    public Guid UserId  { get; set; }
    public Guid PostId  { get; set; }
    public DateTime SeenAt { get; set; }
}
