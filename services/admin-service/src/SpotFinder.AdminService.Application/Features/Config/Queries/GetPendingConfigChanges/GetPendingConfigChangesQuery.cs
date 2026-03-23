using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Queries.GetPendingConfigChanges;

/// <summary>
/// Phase 7.5 — Returns pending config changes, optionally filtered by key or status.
///
/// Default behaviour: returns only Pending-status rows.
/// Pass status = null to retrieve all statuses (Pending + Approved + Rejected).
/// </summary>
public sealed record GetPendingConfigChangesQuery(
    string? Key    = null,
    string? Status = "Pending",    // null = all statuses
    int     Page   = 1,
    int     PageSize = 50
) : IRequest<ApiResult<IReadOnlyList<PendingConfigChangeDto>>>;

public sealed record PendingConfigChangeDto(
    Guid     Id,
    string   Key,
    string   Value,
    string   RequestedBy,
    string   RequestReason,
    string   Status,
    string?  ReviewedBy,
    string?  ReviewReason,
    DateTime CreatedAt,
    DateTime? ReviewedAt
);
