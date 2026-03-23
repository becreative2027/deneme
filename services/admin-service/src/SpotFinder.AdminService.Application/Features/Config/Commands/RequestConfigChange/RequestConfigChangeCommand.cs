using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.RequestConfigChange;

/// <summary>
/// Phase 7.5 — Stages a runtime config change for SuperAdmin approval.
///
/// Calling this command does NOT immediately update admin.runtime_configs.
/// Instead it inserts a row into admin.pending_config_changes with status = Pending.
/// A SuperAdmin must then call ApproveConfigChangeCommand or RejectConfigChangeCommand.
///
/// Use this instead of UpsertRuntimeConfigCommand when RequiresApproval = true.
/// </summary>
public sealed record RequestConfigChangeCommand(
    string Key,
    string Value,           // raw JSON — validated before staging
    string RequestedBy,
    string RequestReason
) : IRequest<ApiResult<PendingConfigChangeResult>>;

public sealed record PendingConfigChangeResult(Guid Id, string Key, string Status);
