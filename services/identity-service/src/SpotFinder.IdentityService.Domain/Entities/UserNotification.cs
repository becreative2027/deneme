namespace SpotFinder.IdentityService.Domain.Entities;

public sealed class UserNotification
{
    public Guid     Id         { get; set; } = Guid.NewGuid();
    public Guid     UserId     { get; set; }
    public string   Title      { get; set; } = string.Empty;
    public string   Body       { get; set; } = string.Empty;
    public string   Type       { get; set; } = string.Empty;
    public string?  PostId     { get; set; }
    public string?  PlaceId    { get; set; }
    public string?  ActorId    { get; set; }
    public bool     IsRead     { get; set; } = false;
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
}
