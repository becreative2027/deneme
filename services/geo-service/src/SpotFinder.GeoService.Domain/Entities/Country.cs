using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.GeoService.Domain.Entities;

public sealed class Country : AggregateRoot<int>
{
    public string Code { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }

    private readonly List<CountryTranslation> _translations = new();
    public IReadOnlyCollection<CountryTranslation> Translations => _translations.AsReadOnly();

    private Country() { }

    public static Country Create(string code)
        => new() { Code = code.ToUpperInvariant(), CreatedAt = DateTime.UtcNow };

    public void AddTranslation(int languageId, string name, string? slug = null)
        => _translations.Add(CountryTranslation.Create(Id, languageId, name, slug));

    public string? GetName(int languageId)
        => _translations.FirstOrDefault(t => t.LanguageId == languageId)?.Name;
}
