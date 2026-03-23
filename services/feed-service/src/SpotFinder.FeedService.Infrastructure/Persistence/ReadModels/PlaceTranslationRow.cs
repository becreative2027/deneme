namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

public sealed class PlaceTranslationRow
{
    public int    Id         { get; set; }
    public Guid   PlaceId    { get; set; }
    public int    LanguageId { get; set; }
    public string Name       { get; set; } = string.Empty;
}
