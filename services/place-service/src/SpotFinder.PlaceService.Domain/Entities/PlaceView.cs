namespace SpotFinder.PlaceService.Domain.Entities;

public sealed class PlaceView
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid PlaceId { get; private set; }
    public int? DurationSeconds { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private PlaceView() { }

    public static PlaceView Create(Guid userId, Guid placeId, int? durationSeconds = null) =>
        new()
        {
            Id              = Guid.NewGuid(),
            UserId          = userId,
            PlaceId         = placeId,
            DurationSeconds = durationSeconds,
            CreatedAt       = DateTime.UtcNow,
        };
}
