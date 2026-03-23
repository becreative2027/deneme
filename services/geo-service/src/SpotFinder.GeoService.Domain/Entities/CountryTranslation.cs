using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.GeoService.Domain.Entities;

public sealed class CountryTranslation : Entity<int>
{
    public int CountryId { get; private set; }
    public int LanguageId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Slug { get; private set; }

    private CountryTranslation() { }

    public static CountryTranslation Create(int countryId, int languageId, string name, string? slug = null)
        => new() { CountryId = countryId, LanguageId = languageId, Name = name, Slug = slug };
}
