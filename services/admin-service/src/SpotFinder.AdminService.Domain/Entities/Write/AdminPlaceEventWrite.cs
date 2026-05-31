namespace SpotFinder.AdminService.Domain.Entities.Write;

public sealed class AdminPlaceEventWrite
{
    public Guid      Id          { get; set; }
    public Guid      PlaceId     { get; set; }
    public string    Title       { get; set; } = string.Empty;
    public string?   Description { get; set; }
    public DateTime  StartsAt    { get; set; }
    public DateTime? EndsAt      { get; set; }
    public string?   ImageUrl    { get; set; }
    public string    CreatedBy   { get; set; } = string.Empty;
    public DateTime  CreatedAt   { get; set; }
}
