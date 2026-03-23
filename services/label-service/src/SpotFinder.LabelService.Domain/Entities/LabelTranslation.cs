using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.LabelService.Domain.Entities;

public sealed class LabelTranslation : Entity<int>
{
    public int LabelId { get; private set; }
    public int LanguageId { get; private set; }
    public string DisplayName { get; private set; } = string.Empty;

    private LabelTranslation() { }

    public static LabelTranslation Create(int labelId, int languageId, string displayName)
        => new() { LabelId = labelId, LanguageId = languageId, DisplayName = displayName };
}
