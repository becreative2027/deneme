namespace SpotFinder.AdminService.Domain.Entities;

/// <summary>
/// Phase 7.4 — Immutable snapshot of a runtime config value at a specific version.
///
/// Inserted every time admin.runtime_configs is updated.
/// Rollback = copy the chosen version's value back to runtime_configs.
/// </summary>
public sealed class RuntimeConfigVersion
{
    public Guid     Id           { get; private set; }
    public string   Key          { get; private set; } = string.Empty;
    public string   Value        { get; private set; } = string.Empty;
    public int      Version      { get; private set; }
    public DateTime CreatedAt    { get; private set; }
    public string   CreatedBy    { get; private set; } = string.Empty;
    public string   ChangeReason { get; private set; } = string.Empty;

    private RuntimeConfigVersion() { }

    public static RuntimeConfigVersion Create(
        string key, string value, int version, string createdBy, string changeReason)
        => new()
        {
            Id           = Guid.NewGuid(),
            Key          = key,
            Value        = value,
            Version      = version,
            CreatedAt    = DateTime.UtcNow,
            CreatedBy    = createdBy,
            ChangeReason = changeReason,
        };
}
