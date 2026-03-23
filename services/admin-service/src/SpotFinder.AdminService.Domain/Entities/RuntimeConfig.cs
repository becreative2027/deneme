using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.AdminService.Domain.Entities;

/// <summary>
/// Phase 7.3 — DB-driven runtime configuration entry.
///
/// Each row is a key/value pair stored in admin.runtime_configs.
/// The value column holds raw JSON so it can represent any scalar
/// (string, number, boolean) or structured object.
///
/// Example keys:
///   "Recommendation:InterestDecayRate" → 0.97
///   "Recommendation:Trending:Cap"      → 150
/// </summary>
public sealed class RuntimeConfig
{
    public string    Key       { get; private set; } = string.Empty;
    public string    Value     { get; private set; } = string.Empty;   // raw JSONB as text
    public DateTime  UpdatedAt { get; private set; }

    private RuntimeConfig() { }

    public static RuntimeConfig Create(string key, string value)
        => new() { Key = key, Value = value, UpdatedAt = DateTime.UtcNow };

    public void Update(string value)
    {
        Value     = value;
        UpdatedAt = DateTime.UtcNow;
    }
}
