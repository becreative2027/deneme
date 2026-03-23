using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.GeoService.Domain.Entities;

public sealed class Language : Entity<int>
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }

    private Language() { }

    public static Language Create(string code, string name)
        => new() { Code = code.ToLowerInvariant(), Name = name, CreatedAt = DateTime.UtcNow };
}
