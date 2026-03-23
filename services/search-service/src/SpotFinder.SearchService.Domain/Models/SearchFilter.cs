namespace SpotFinder.SearchService.Domain.Models;

public sealed class SearchFilter
{
    public string? Query { get; init; }
    public Guid? CityId { get; init; }
    public Guid? DistrictId { get; init; }
    public List<Guid> LabelIds { get; init; } = new();
    public LabelMatchMode MatchMode { get; init; } = LabelMatchMode.Any;
    public double? NearLatitude { get; init; }
    public double? NearLongitude { get; init; }
    public double? RadiusKm { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public enum LabelMatchMode { Any = 0, All = 1 }
