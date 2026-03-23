using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.GeoService.Domain.Entities;

public sealed class City : AggregateRoot<int>
{
    public int CountryId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private readonly List<CityTranslation> _translations = new();
    public IReadOnlyCollection<CityTranslation> Translations => _translations.AsReadOnly();

    private City() { }

    public static City Create(int countryId)
        => new() { CountryId = countryId, CreatedAt = DateTime.UtcNow };

    public void AddTranslation(int languageId, string name, string? slug = null)
        => _translations.Add(CityTranslation.Create(Id, languageId, name, slug));

    public string? GetName(int languageId)
        => _translations.FirstOrDefault(t => t.LanguageId == languageId)?.Name;
}
