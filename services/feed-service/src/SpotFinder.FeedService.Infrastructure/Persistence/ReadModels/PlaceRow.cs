namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class PlaceRow
{
    public Guid  Id        { get; set; }
    public int?  CityId    { get; set; }
    public bool  IsDeleted { get; set; }
}
