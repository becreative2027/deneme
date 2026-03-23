using SpotFinder.BuildingBlocks.Domain;
using SpotFinder.AdminService.Domain.Enums;

namespace SpotFinder.AdminService.Domain.Entities;

public sealed class ModerationItem : AggregateRoot<Guid>
{
    public ModerationTargetType TargetType { get; private set; }
    public Guid TargetId { get; private set; }
    public ModerationStatus Status { get; private set; } = ModerationStatus.Pending;
    public string? AdminNote { get; private set; }
    public Guid? ReviewedByAdminId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ReviewedAt { get; private set; }

    private ModerationItem() { }

    public static ModerationItem Create(Guid id, ModerationTargetType targetType, Guid targetId)
        => new() { Id = id, TargetType = targetType, TargetId = targetId, CreatedAt = DateTime.UtcNow };

    public void Approve(Guid adminId, string? note = null)
    {
        Status = ModerationStatus.Approved;
        ReviewedByAdminId = adminId;
        AdminNote = note;
        ReviewedAt = DateTime.UtcNow;
    }

    public void Reject(Guid adminId, string? note = null)
    {
        Status = ModerationStatus.Rejected;
        ReviewedByAdminId = adminId;
        AdminNote = note;
        ReviewedAt = DateTime.UtcNow;
    }
}
