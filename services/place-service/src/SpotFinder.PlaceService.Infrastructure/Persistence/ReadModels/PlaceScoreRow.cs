namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class PlaceScoreRow
{
    public Guid PlaceId { get; set; }
    public decimal? PopularityScore { get; set; }
    public decimal? QualityScore { get; set; }
    public decimal? TrendScore { get; set; }
    public decimal? FinalScore { get; set; }
    public DateTime UpdatedAt { get; set; }
}
