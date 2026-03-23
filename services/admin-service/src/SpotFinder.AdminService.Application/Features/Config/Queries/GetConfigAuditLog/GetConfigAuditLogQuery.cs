using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Queries.GetConfigAuditLog;

public sealed record ConfigAuditLogDto(
    Guid     Id,
    string   Key,
    string?  OldValue,
    string   NewValue,
    string   ChangedBy,
    string   ChangeReason,
    DateTime CreatedAt
);

/// <summary>
/// Phase 7.4 — Returns the audit log for all config changes, newest first.
/// Optionally filtered to a specific key.
/// </summary>
public sealed record GetConfigAuditLogQuery(
    string? Key = null,   // null → return all keys
    int     Page = 1,
    int     PageSize = 50
) : IRequest<ApiResult<IReadOnlyList<ConfigAuditLogDto>>>;
