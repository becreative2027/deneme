namespace SpotFinder.ContentService.Domain.Entities;

public sealed class PostMedia
{
    public Guid Id         { get; set; }
    public Guid PostId     { get; set; }
    public string Url      { get; set; } = string.Empty;
    public string? Type    { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
