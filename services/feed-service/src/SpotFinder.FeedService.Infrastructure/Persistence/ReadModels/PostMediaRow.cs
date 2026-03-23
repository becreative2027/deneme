namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class PostMediaRow
{
    public Guid    Id     { get; set; }
    public Guid    PostId { get; set; }
    public string  Url    { get; set; } = string.Empty;
    public string? Type   { get; set; }
}
