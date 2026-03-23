using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.UpsertRuntimeConfig;

/// <summary>
/// Phase 7.4 — Creates or updates a runtime config entry with versioning + audit.
///
/// Every call:
///   1. Inserts a version snapshot into admin.runtime_config_versions.
///   2. Writes the before/after diff to admin.config_audit_logs.
///   3. Publishes a cache-invalidation event to Redis.
///
/// ChangeReason must not be empty — enforced for auditability.
/// </summary>
public sealed record UpsertRuntimeConfigCommand(
    string Key,
    string Value,         // raw JSON
    string ChangedBy,     // admin username / email from JWT
    string ChangeReason   // required: "Tune cap for peak traffic", "Rollback after incident", etc.
) : IRequest<ApiResult<UpsertRuntimeConfigResult>>;

public sealed record UpsertRuntimeConfigResult(string Key, int Version);
