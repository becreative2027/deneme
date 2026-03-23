namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class PostLikeRow
{
    public Guid UserId { get; set; }
    public Guid PostId { get; set; }
}
