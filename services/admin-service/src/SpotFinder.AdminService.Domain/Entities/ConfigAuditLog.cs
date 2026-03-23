namespace SpotFinder.AdminService.Domain.Entities;

/// <summary>
/// Phase 7.4 — Immutable config change audit record.
///
/// Captures who changed what, when, why, and what the before/after values were.
/// Written atomically with every runtime_configs update and rollback.
/// </summary>
public sealed class ConfigAuditLog
{
    public Guid     Id           { get; private set; }
    public string   Key          { get; private set; } = string.Empty;
    public string?  OldValue     { get; private set; }   // null on first-ever create
    public string   NewValue     { get; private set; } = string.Empty;
    public string   ChangedBy    { get; private set; } = string.Empty;
    public string   ChangeReason { get; private set; } = string.Empty;
    public DateTime CreatedAt    { get; private set; }

    private ConfigAuditLog() { }

    public static ConfigAuditLog Create(
        string key, string? oldValue, string newValue, string changedBy, string changeReason)
        => new()
        {
            Id           = Guid.NewGuid(),
            Key          = key,
            OldValue     = oldValue,
            NewValue     = newValue,
            ChangedBy    = changedBy,
            ChangeReason = changeReason,
            CreatedAt    = DateTime.UtcNow,
        };
}
