namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class CityTranslationRow
{
    public int Id { get; set; }
    public int CityId { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = string.Empty;
}
