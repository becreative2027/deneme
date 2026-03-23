namespace SpotFinder.AdminService.Domain.Entities.Write;

public sealed class AdminPlaceTranslationWrite
{
    public int      Id          { get; set; }
    public Guid     PlaceId     { get; set; }
    public int      LanguageId  { get; set; }
    public string   Name        { get; set; } = string.Empty;
    public string?  Slug        { get; set; }
}
