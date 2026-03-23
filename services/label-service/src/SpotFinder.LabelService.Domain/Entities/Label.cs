using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.LabelService.Domain.Entities;

public sealed class Label : AggregateRoot<int>
{
    public int CategoryId { get; private set; }
    public string Key { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; }

    private readonly List<LabelTranslation> _translations = new();
    private readonly List<LabelKeyword> _keywords = new();
    public IReadOnlyCollection<LabelTranslation> Translations => _translations.AsReadOnly();
    public IReadOnlyCollection<LabelKeyword> Keywords => _keywords.AsReadOnly();

    private Label() { }

    public static Label Create(int categoryId, string key)
        => new() { CategoryId = categoryId, Key = key, IsActive = true, CreatedAt = DateTime.UtcNow };

    public void AddTranslation(int languageId, string displayName)
        => _translations.Add(LabelTranslation.Create(Id, languageId, displayName));

    public void AddKeyword(int languageId, string keyword)
        => _keywords.Add(LabelKeyword.Create(Id, languageId, keyword));

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;

    public string? GetDisplayName(int languageId)
        => _translations.FirstOrDefault(t => t.LanguageId == languageId)?.DisplayName;
}
