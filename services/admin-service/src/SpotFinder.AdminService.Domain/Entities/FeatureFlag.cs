namespace SpotFinder.AdminService.Domain.Entities;

/// <summary>
/// Phase 7.3/7.4 — Feature flag with percentage-based rollout AND optional targeting.
///
/// Evaluation priority (Phase 7.4):
///   1. If Target JSON is set → evaluate targeting rules (userIds / countries / platform).
///      Any match → enabled.  No match → disabled (targeting overrides rollout entirely).
///   2. If Target is null → deterministic percentage rollout:
///      bucket = |userId.GetHashCode()| % 100; enabled when bucket &lt; RolloutPercentage.
///
/// RolloutPercentage = 0   → disabled for everyone (when no target)
/// RolloutPercentage = 100 → enabled for everyone (when IsEnabled = true, no target)
/// </summary>
public sealed class FeatureFlag
{
    public string   Key                { get; private set; } = string.Empty;
    public bool     IsEnabled          { get; private set; }
    public int      RolloutPercentage  { get; private set; }
    /// <summary>
    /// Optional targeting JSON — e.g. {"userIds":["uuid1"],"countries":["TR"],"platform":["ios"]}.
    /// When set, overrides RolloutPercentage.
    /// </summary>
    public string?  Target             { get; private set; }
    public DateTime UpdatedAt          { get; private set; }

    private FeatureFlag() { }

    public static FeatureFlag Create(string key, bool isEnabled, int rolloutPercentage, string? target = null)
    {
        ValidateRollout(rolloutPercentage);
        return new() { Key = key, IsEnabled = isEnabled, RolloutPercentage = rolloutPercentage, Target = target, UpdatedAt = DateTime.UtcNow };
    }

    public void Update(bool isEnabled, int rolloutPercentage, string? target = null)
    {
        ValidateRollout(rolloutPercentage);
        IsEnabled         = isEnabled;
        RolloutPercentage = rolloutPercentage;
        Target            = target;
        UpdatedAt         = DateTime.UtcNow;
    }

    /// <summary>Determines whether the flag is active for a specific user (percentage rollout only).</summary>
    public bool IsEnabledFor(Guid userId)
    {
        if (!IsEnabled) return false;
        if (Target != null) return false;   // targeting rules evaluated externally
        var bucket = Math.Abs(userId.GetHashCode()) % 100;
        return bucket < RolloutPercentage;
    }

    private static void ValidateRollout(int pct)
    {
        if (pct is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(pct), "Must be 0–100.");
    }
}
