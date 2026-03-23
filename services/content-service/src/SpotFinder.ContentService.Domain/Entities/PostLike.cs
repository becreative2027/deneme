namespace SpotFinder.ContentService.Domain.Entities;

public sealed class PostLike
{
    public Guid UserId { get; set; }
    public Guid PostId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
