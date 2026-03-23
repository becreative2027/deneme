namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

/// <summary>
/// Phase 7.3 — read model for content.user_events.
/// The payload column is JSONB; mapped as string here and parsed in the handler.
/// For dwell events: payload = '{"durationMs": 4200}'.
/// </summary>
public sealed class UserEventRow
{
    public Guid    Id        { get; set; }
    public Guid    UserId    { get; set; }
    public string  EventType { get; set; } = string.Empty;
    public Guid?   PostId    { get; set; }
    public Guid?   PlaceId   { get; set; }
    public string? Payload   { get; set; }   // JSONB as string
    public DateTime CreatedAt { get; set; }
}
