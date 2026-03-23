namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class DistrictTranslationRow
{
    public int Id { get; set; }
    public int DistrictId { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = string.Empty;
}
