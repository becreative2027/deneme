using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.PlaceService.Domain.Entities;

public sealed class PlaceTranslation : Entity<int>
{
    public Guid PlaceId { get; private set; }
    public int LanguageId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Slug { get; private set; }

    private PlaceTranslation() { }

    public static PlaceTranslation Create(Guid placeId, int languageId, string name, string? slug = null)
        => new() { PlaceId = placeId, LanguageId = languageId, Name = name, Slug = slug };
}
