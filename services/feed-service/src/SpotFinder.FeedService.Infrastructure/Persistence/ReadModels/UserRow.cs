namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class UserRow
{
    public Guid   Id       { get; set; }
    public string Username { get; set; } = string.Empty;
}
