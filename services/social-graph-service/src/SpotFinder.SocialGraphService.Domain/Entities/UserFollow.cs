namespace SpotFinder.SocialGraphService.Domain.Entities;

public sealed class UserFollow
{
    public Guid FollowerId  { get; set; }
    public Guid FollowingId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
