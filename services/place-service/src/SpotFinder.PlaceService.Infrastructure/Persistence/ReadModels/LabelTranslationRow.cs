namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class LabelTranslationRow
{
    public int Id { get; set; }
    public int LabelId { get; set; }
    public int LanguageId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
}
