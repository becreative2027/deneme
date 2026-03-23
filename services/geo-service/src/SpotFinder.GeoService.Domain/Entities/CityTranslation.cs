using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.GeoService.Domain.Entities;

public sealed class CityTranslation : Entity<int>
{
    public int CityId { get; private set; }
    public int LanguageId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Slug { get; private set; }

    private CityTranslation() { }

    public static CityTranslation Create(int cityId, int languageId, string name, string? slug = null)
        => new() { CityId = cityId, LanguageId = languageId, Name = name, Slug = slug };
}
