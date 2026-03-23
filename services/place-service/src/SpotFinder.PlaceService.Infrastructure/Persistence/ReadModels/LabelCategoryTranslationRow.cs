namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class LabelCategoryTranslationRow
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public int LanguageId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
}
