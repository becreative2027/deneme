namespace SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

/// <summary>Phase 7.3 — read model for admin.runtime_configs (cross-schema, no migrations).</summary>
public sealed class RuntimeConfigRow
{
    public string   Key       { get; set; } = string.Empty;
    public string   Value     { get; set; } = string.Empty;   // raw JSONB as text
    public DateTime UpdatedAt { get; set; }
}
