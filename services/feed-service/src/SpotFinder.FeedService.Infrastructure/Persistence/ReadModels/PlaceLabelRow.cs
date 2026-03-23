namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

/// <summary>Maps to <c>label.place_labels</c> — managed by label-service, read cross-schema.</summary>
public sealed class PlaceLabelRow
{
    public Guid    PlaceId { get; set; }
    public int     LabelId { get; set; }
    public decimal Weight  { get; set; }
}
