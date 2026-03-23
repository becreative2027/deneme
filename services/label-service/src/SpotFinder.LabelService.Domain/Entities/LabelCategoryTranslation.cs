using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.LabelService.Domain.Entities;

public sealed class LabelCategoryTranslation : Entity<int>
{
    public int CategoryId { get; private set; }
    public int LanguageId { get; private set; }
    public string DisplayName { get; private set; } = string.Empty;

    private LabelCategoryTranslation() { }

    public static LabelCategoryTranslation Create(int categoryId, int languageId, string displayName)
        => new() { CategoryId = categoryId, LanguageId = languageId, DisplayName = displayName };
}
