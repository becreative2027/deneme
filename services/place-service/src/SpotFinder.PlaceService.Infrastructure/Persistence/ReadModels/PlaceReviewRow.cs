namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class PlaceReviewRow
{
    public Guid Id { get; set; }
    public Guid PlaceId { get; set; }
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; }
}
