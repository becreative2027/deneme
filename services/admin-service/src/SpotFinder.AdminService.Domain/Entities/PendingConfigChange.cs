namespace SpotFinder.AdminService.Domain.Entities;

/// <summary>
/// Phase 7.5 — A config change that is staged for SuperAdmin approval.
///
/// Lifecycle:
///   Pending  → submitted by an Admin, not yet live.
///   Approved → SuperAdmin approved; the value has been applied to runtime_configs.
///   Rejected → SuperAdmin rejected; no change was made to runtime_configs.
///
/// Immutability rule: once a record leaves Pending status it must never be updated again.
/// Every approval or rejection creates an audit trail via ConfigAuditLog.
/// </summary>
public sealed class PendingConfigChange
{
    public Guid     Id            { get; private set; }
    public string   Key           { get; private set; } = string.Empty;
    /// <summary>Raw JSON value — same format as RuntimeConfig.Value.</summary>
    public string   Value         { get; private set; } = string.Empty;
    public string   RequestedBy   { get; private set; } = string.Empty;
    public string   RequestReason { get; private set; } = string.Empty;
    public string   Status        { get; private set; } = PendingConfigStatus.Pending;
    public string?  ReviewedBy    { get; private set; }
    public string?  ReviewReason  { get; private set; }
    public DateTime CreatedAt     { get; private set; }
    public DateTime? ReviewedAt   { get; private set; }

    private PendingConfigChange() { }

    public static PendingConfigChange Create(
        string key, string value, string requestedBy, string requestReason)
        => new()
        {
            Id            = Guid.NewGuid(),
            Key           = key,
            Value         = value,
            RequestedBy   = requestedBy,
            RequestReason = requestReason,
            Status        = PendingConfigStatus.Pending,
            CreatedAt     = DateTime.UtcNow,
        };

    /// <summary>Marks the change as approved. Call before writing the value to runtime_configs.</summary>
    public void Approve(string reviewedBy, string? reviewReason = null)
    {
        EnsurePending();
        Status      = PendingConfigStatus.Approved;
        ReviewedBy  = reviewedBy;
        ReviewReason = reviewReason;
        ReviewedAt  = DateTime.UtcNow;
    }

    /// <summary>Marks the change as rejected. No runtime_configs update occurs.</summary>
    public void Reject(string reviewedBy, string reviewReason)
    {
        EnsurePending();
        Status      = PendingConfigStatus.Rejected;
        ReviewedBy  = reviewedBy;
        ReviewReason = reviewReason;
        ReviewedAt  = DateTime.UtcNow;
    }

    private void EnsurePending()
    {
        if (Status != PendingConfigStatus.Pending)
            throw new InvalidOperationException(
                $"PendingConfigChange {Id} is already in status '{Status}' and cannot be reviewed again.");
    }
}

/// <summary>Allowed status values for PendingConfigChange.</summary>
public static class PendingConfigStatus
{
    public const string Pending  = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
}
