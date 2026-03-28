using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.AdminService.Domain.Entities;

public sealed class PlaceNotification : AggregateRoot<Guid>
{
    public Guid                  PlaceId        { get; private set; }
    public string                Title          { get; private set; } = default!;
    public string                Body           { get; private set; } = default!;
    public string                Type           { get; private set; } = default!;
    public NotificationAudience  Audience       { get; private set; }
    public string                SentBy         { get; private set; } = default!;
    public int                   RecipientCount { get; private set; }
    public DateTime              SentAt         { get; private set; }

    private PlaceNotification() { }

    public static PlaceNotification Create(
        Guid id,
        Guid placeId,
        string title,
        string body,
        string type,
        NotificationAudience audience,
        string sentBy,
        int recipientCount)
        => new()
        {
            Id             = id,
            PlaceId        = placeId,
            Title          = title,
            Body           = body,
            Type           = type,
            Audience       = audience,
            SentBy         = sentBy,
            RecipientCount = recipientCount,
            SentAt         = DateTime.UtcNow,
        };
}
