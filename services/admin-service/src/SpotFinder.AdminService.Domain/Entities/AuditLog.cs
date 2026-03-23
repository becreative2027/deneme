using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.AdminService.Domain.Entities;

public sealed class AuditLog : Entity<Guid>
{
    public Guid AdminId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string TargetEntity { get; private set; } = string.Empty;
    public Guid TargetId { get; private set; }
    public string? Details { get; private set; }
    public DateTime OccurredAt { get; private set; }

    private AuditLog() { }

    public static AuditLog Create(Guid adminId, string action, string targetEntity, Guid targetId, string? details = null)
        => new() { Id = Guid.NewGuid(), AdminId = adminId, Action = action, TargetEntity = targetEntity, TargetId = targetId, Details = details, OccurredAt = DateTime.UtcNow };
}
