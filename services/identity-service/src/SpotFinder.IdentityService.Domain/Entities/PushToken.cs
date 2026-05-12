namespace SpotFinder.IdentityService.Domain.Entities;

public sealed class PushToken
{
    public Guid   Id        { get; set; } = Guid.NewGuid();
    public Guid   UserId    { get; set; }
    public string Token     { get; set; } = string.Empty;
    public string Platform  { get; set; } = "ios";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
