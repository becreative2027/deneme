using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.RejectConfigChange;

/// <summary>
/// Phase 7.5 — SuperAdmin rejects a pending config change.
///
/// The pending row's status is set to Rejected. No change is made to
/// admin.runtime_configs. The rejection reason is persisted for audit purposes.
/// </summary>
public sealed record RejectConfigChangeCommand(
    Guid   PendingId,
    string ReviewedBy,
    string ReviewReason    // required — must explain why the change was rejected
) : IRequest<ApiResult<RejectConfigChangeResult>>;

public sealed record RejectConfigChangeResult(Guid PendingId, string Key);
