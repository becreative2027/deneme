namespace SpotFinder.AdminService.Infrastructure.Services;

/// <summary>
/// Appends a write-audit record to admin.write_audit_logs.
/// The record is added to the same DbContext change-tracker so it is committed
/// atomically with the main operation — no extra round-trip.
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Stage an audit record for the next SaveChangesAsync call.
    /// Does NOT call SaveChangesAsync itself.
    /// </summary>
    void Log(string? userId, string action, string entityType, string entityId, object? payload = null);
}
