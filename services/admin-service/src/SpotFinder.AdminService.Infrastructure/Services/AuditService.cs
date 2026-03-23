using System.Text.Json;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities.Write;
using SpotFinder.AdminService.Infrastructure.Persistence;

namespace SpotFinder.AdminService.Infrastructure.Services;

public sealed class AuditService : IAuditService
{
    private static readonly JsonSerializerOptions JsonOpts =
        new() { WriteIndented = false, DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull };

    private readonly AdminWriteDbContext           _db;
    private readonly ILogger<AuditService>         _logger;

    public AuditService(AdminWriteDbContext db, ILogger<AuditService> logger)
    {
        _db     = db;
        _logger = logger;
    }

    /// <inheritdoc/>
    public void Log(string? userId, string action, string entityType, string entityId, object? payload = null)
    {
        try
        {
            _db.WriteAuditLogs.Add(new AdminWriteAuditLog
            {
                UserId     = userId,
                Action     = action,
                EntityType = entityType,
                EntityId   = entityId,
                Payload    = payload is null ? null : JsonSerializer.Serialize(payload, JsonOpts),
                CreatedAt  = DateTime.UtcNow,
            });
        }
        catch (Exception ex)
        {
            // Staging the audit entry must never break the calling handler.
            _logger.LogWarning(ex,
                "Failed to stage audit log entry — action={Action}, entity={EntityType}/{EntityId}.",
                action, entityType, entityId);
        }
    }
}
