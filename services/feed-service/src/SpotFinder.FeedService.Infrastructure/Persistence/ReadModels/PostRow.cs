namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class PostRow
{
    public Guid     Id           { get; set; }
    public Guid     UserId       { get; set; }
    public Guid     PlaceId      { get; set; }
    public string?  Caption      { get; set; }
    public int      LikeCount    { get; set; }
    public int      CommentCount { get; set; }
    public int      FeedScore    { get; set; }
    public bool     IsDeleted    { get; set; }
    public string   Status       { get; set; } = "active";
    public DateTime CreatedAt    { get; set; }
}
