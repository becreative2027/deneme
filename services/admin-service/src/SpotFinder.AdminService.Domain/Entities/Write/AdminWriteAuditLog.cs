namespace SpotFinder.AdminService.Domain.Entities.Write;

/// <summary>
/// Write-operation audit record stored in admin.write_audit_logs.
/// Distinct from the moderation-focused admin.audit_logs (AuditLog entity).
/// </summary>
public sealed class AdminWriteAuditLog
{
    public long      Id         { get; set; }
    public string?   UserId     { get; set; }
    public string    Action     { get; set; } = string.Empty; // CREATE | UPDATE | DELETE
    public string    EntityType { get; set; } = string.Empty; // Place | Label | City | District
    public string    EntityId   { get; set; } = string.Empty;
    public string?   Payload    { get; set; } // JSONB serialised payload
    public DateTime  CreatedAt  { get; set; } = DateTime.UtcNow;
}
