namespace SpotFinder.LabelService.Domain.Entities;

public sealed class PlaceLabel
{
    public Guid PlaceId { get; private set; }
    public int LabelId { get; private set; }
    public decimal Weight { get; private set; } = 1.0m;
    public DateTime CreatedAt { get; private set; }

    private PlaceLabel() { }

    public static PlaceLabel Create(Guid placeId, int labelId, decimal weight = 1.0m)
        => new() { PlaceId = placeId, LabelId = labelId, Weight = weight, CreatedAt = DateTime.UtcNow };
}
