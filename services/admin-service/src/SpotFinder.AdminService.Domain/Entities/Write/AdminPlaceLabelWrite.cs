namespace SpotFinder.AdminService.Domain.Entities.Write;

public sealed class AdminPlaceLabelWrite
{
    public Guid      PlaceId    { get; set; }
    public int       LabelId    { get; set; }
    public decimal   Weight     { get; set; } = 1.0m;
    public DateTime  CreatedAt  { get; set; } = DateTime.UtcNow;
    public string?   CreatedBy  { get; set; }
}
