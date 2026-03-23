using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.ApproveConfigChange;

/// <summary>
/// Phase 7.5 — SuperAdmin approves a pending config change.
///
/// On approval the pending value is immediately written to admin.runtime_configs
/// (same transactional flow as UpsertRuntimeConfigCommand: version snapshot + audit log + Redis publish).
/// The pending row's status is updated to Approved.
/// </summary>
public sealed record ApproveConfigChangeCommand(
    Guid    PendingId,
    string  ReviewedBy,
    string? ReviewReason   // optional note
) : IRequest<ApiResult<ApproveConfigChangeResult>>;

public sealed record ApproveConfigChangeResult(
    Guid   PendingId,
    string Key,
    int    NewVersion);
