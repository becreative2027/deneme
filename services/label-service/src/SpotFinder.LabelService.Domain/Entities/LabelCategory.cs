using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.LabelService.Domain.Entities;

public sealed class LabelCategory : AggregateRoot<int>
{
    public string Key { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }

    private readonly List<LabelCategoryTranslation> _translations = new();
    private readonly List<Label> _labels = new();
    public IReadOnlyCollection<LabelCategoryTranslation> Translations => _translations.AsReadOnly();
    public IReadOnlyCollection<Label> Labels => _labels.AsReadOnly();

    private LabelCategory() { }

    public static LabelCategory Create(string key)
        => new() { Key = key, CreatedAt = DateTime.UtcNow };

    public void AddTranslation(int languageId, string displayName)
        => _translations.Add(LabelCategoryTranslation.Create(Id, languageId, displayName));

    public string? GetDisplayName(int languageId)
        => _translations.FirstOrDefault(t => t.LanguageId == languageId)?.DisplayName;
}
