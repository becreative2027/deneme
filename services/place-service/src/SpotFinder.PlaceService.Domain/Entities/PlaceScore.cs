using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.PlaceService.Domain.Entities;

public sealed class PlaceScore : Entity<Guid>
{
    public Guid PlaceId { get; private set; }
    public decimal? PopularityScore { get; private set; }
    public decimal? QualityScore { get; private set; }
    public decimal? TrendScore { get; private set; }
    public decimal? FinalScore { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private PlaceScore() { }

    public static PlaceScore Create(Guid placeId, decimal? popularity = null, decimal? quality = null, decimal? trend = null, decimal? finalScore = null)
        => new() { Id = placeId, PlaceId = placeId, PopularityScore = popularity, QualityScore = quality, TrendScore = trend, FinalScore = finalScore, UpdatedAt = DateTime.UtcNow };

    public void Update(decimal? popularity, decimal? quality, decimal? trend, decimal? finalScore = null)
    {
        PopularityScore = popularity;
        QualityScore = quality;
        TrendScore = trend;
        FinalScore = finalScore;
        UpdatedAt = DateTime.UtcNow;
    }
}
