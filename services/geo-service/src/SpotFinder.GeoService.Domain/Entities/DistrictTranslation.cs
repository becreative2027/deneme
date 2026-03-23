using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.GeoService.Domain.Entities;

public sealed class DistrictTranslation : Entity<int>
{
    public int DistrictId { get; private set; }
    public int LanguageId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Slug { get; private set; }

    private DistrictTranslation() { }

    public static DistrictTranslation Create(int districtId, int languageId, string name, string? slug = null)
        => new() { DistrictId = districtId, LanguageId = languageId, Name = name, Slug = slug };
}
