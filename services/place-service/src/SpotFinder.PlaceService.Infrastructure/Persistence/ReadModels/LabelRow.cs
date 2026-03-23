namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class LabelRow
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string Key { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
