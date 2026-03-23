namespace SpotFinder.SearchService.Domain.Models;

public sealed class PlaceSearchResult
{
    public Guid PlaceId { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public int CityId { get; init; }
    public List<string> LabelSlugs { get; init; } = new();
    public double? DistanceKm { get; init; }
    public double RelevanceScore { get; init; }
}
