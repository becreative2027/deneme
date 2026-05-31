namespace SpotFinder.PlaceService.Domain.Entities;

public sealed class PlaceEvent
{
    public Guid     Id          { get; private set; }
    public Guid     PlaceId     { get; private set; }
    public string   Title       { get; private set; } = string.Empty;
    public string?  Description { get; private set; }
    public DateTime StartsAt    { get; private set; }
    public DateTime? EndsAt     { get; private set; }
    public string?  ImageUrl    { get; private set; }
    public string   CreatedBy   { get; private set; } = string.Empty;
    public DateTime CreatedAt   { get; private set; }

    private PlaceEvent() { }

    public static PlaceEvent Create(
        Guid placeId, string title, string? description,
        DateTime startsAt, DateTime? endsAt, string? imageUrl, string createdBy) =>
        new()
        {
            Id          = Guid.NewGuid(),
            PlaceId     = placeId,
            Title       = title,
            Description = description,
            StartsAt    = startsAt,
            EndsAt      = endsAt,
            ImageUrl    = imageUrl,
            CreatedBy   = createdBy,
            CreatedAt   = DateTime.UtcNow,
        };
}
