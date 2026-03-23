namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class UserProfileRow
{
    public Guid    UserId           { get; set; }
    public string? DisplayName      { get; set; }
    public string? ProfileImageUrl  { get; set; }
}
