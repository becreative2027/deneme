namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class PlaceLabelRow
{
    public Guid PlaceId { get; set; }
    public int LabelId { get; set; }
    public decimal Weight { get; set; }
}
