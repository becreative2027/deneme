namespace SpotFinder.ContentService.Domain.Entities;

public sealed class PostComment
{
    public Guid Id        { get; set; }
    public Guid PostId    { get; set; }
    public Guid UserId    { get; set; }
    public string Text    { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
