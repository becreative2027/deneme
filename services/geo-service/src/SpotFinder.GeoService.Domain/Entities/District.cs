using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.GeoService.Domain.Entities;

public sealed class District : AggregateRoot<int>
{
    public int CityId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private readonly List<DistrictTranslation> _translations = new();
    public IReadOnlyCollection<DistrictTranslation> Translations => _translations.AsReadOnly();

    private District() { }

    public static District Create(int cityId)
        => new() { CityId = cityId, CreatedAt = DateTime.UtcNow };

    public void AddTranslation(int languageId, string name, string? slug = null)
        => _translations.Add(DistrictTranslation.Create(Id, languageId, name, slug));

    public string? GetName(int languageId)
        => _translations.FirstOrDefault(t => t.LanguageId == languageId)?.Name;
}
