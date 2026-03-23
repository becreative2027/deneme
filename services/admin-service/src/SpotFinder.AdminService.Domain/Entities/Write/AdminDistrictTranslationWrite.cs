namespace SpotFinder.AdminService.Domain.Entities.Write;

public sealed class AdminDistrictTranslationWrite
{
    public int     Id          { get; set; }
    public int     DistrictId  { get; set; }
    public int     LanguageId  { get; set; }
    public string  Name        { get; set; } = string.Empty;
    public string? Slug        { get; set; }
}
