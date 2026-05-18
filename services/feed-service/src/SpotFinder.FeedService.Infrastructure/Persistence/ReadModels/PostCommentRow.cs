namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class PostCommentRow
{
    public Guid     Id        { get; set; }
    public Guid     PostId    { get; set; }
    public Guid     UserId    { get; set; }
    public string   Text      { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
