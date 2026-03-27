namespace SpotFinder.SocialGraphService.Domain.Entities;

public sealed class UserFavorite
{
    public Guid UserId    { get; set; }
    public Guid PlaceId   { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
