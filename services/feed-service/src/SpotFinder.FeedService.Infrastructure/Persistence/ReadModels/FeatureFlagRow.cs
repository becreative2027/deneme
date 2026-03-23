namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

/// <summary>Phase 7.3/7.4 — read model for admin.feature_flags (cross-schema, no migrations).</summary>
public sealed class FeatureFlagRow
{
    public string  Key               { get; set; } = string.Empty;
    public bool    IsEnabled         { get; set; }
    public int     RolloutPercentage { get; set; }
    public string? Target            { get; set; }   // Phase 7.4: targeting JSON
    public DateTime UpdatedAt        { get; set; }
}
