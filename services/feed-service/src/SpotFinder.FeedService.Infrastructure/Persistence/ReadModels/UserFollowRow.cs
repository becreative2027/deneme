namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class UserFollowRow
{
    public Guid FollowerId  { get; set; }
    public Guid FollowingId { get; set; }
}
