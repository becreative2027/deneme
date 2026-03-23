using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Config.Commands.ApproveConfigChange;
using SpotFinder.AdminService.Application.Features.Config.Commands.RejectConfigChange;
using SpotFinder.AdminService.Application.Features.Config.Commands.RequestConfigChange;
using SpotFinder.AdminService.Application.Features.Config.Commands.RollbackConfig;
using SpotFinder.AdminService.Application.Features.Config.Commands.UpsertFeatureFlag;
using SpotFinder.AdminService.Application.Features.Config.Commands.UpsertRuntimeConfig;
using SpotFinder.AdminService.Application.Features.Config.Queries.GetAllRuntimeConfigs;
using SpotFinder.AdminService.Application.Features.Config.Queries.GetConfigAuditLog;
using SpotFinder.AdminService.Application.Features.Config.Queries.GetConfigVersions;
using SpotFinder.AdminService.Application.Features.Config.Queries.GetPendingConfigChanges;
using SpotFinder.BuildingBlocks.Api;
// Disambiguate: UpsertRuntimeConfigResult exists in both UpsertRuntimeConfig and RollbackConfig namespaces
using UpsertConfigResult = SpotFinder.AdminService.Application.Features.Config.Commands.UpsertRuntimeConfig.UpsertRuntimeConfigResult;

namespace SpotFinder.AdminService.API.Controllers;

/// <summary>
/// Phase 7.3/7.4/7.5 — Admin endpoints for runtime configuration and feature flags.
///
/// Phase 7.5 additions:
///   PUT  /api/admin/config/runtime/{key}       — accepts requiresApproval flag;
///                                               when true stages a pending change instead of applying immediately.
///   GET  /api/admin/config/pending             — list pending changes (Admin + SuperAdmin)
///   POST /api/admin/config/pending/{id}/approve — approve a pending change (SuperAdmin only)
///   POST /api/admin/config/pending/{id}/reject  — reject a pending change (SuperAdmin only)
///
/// All mutating operations require Admin or SuperAdmin role.
/// Approve/reject require SuperAdmin.
/// </summary>
[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin/config")]
public sealed class AdminConfigController : BaseController
{
    public AdminConfigController(ISender sender) : base(sender) { }

    // ── GET /api/admin/config ────────────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<GetAllRuntimeConfigsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await Sender.Send(new GetAllRuntimeConfigsQuery(), ct);
        return result.IsSuccess
            ? Ok(ApiResponse<GetAllRuntimeConfigsResponse>.Ok(result.Data!))
            : FailResult(string.Join("; ", result.Errors));
    }

    // ── PUT /api/admin/config/runtime/{key} ──────────────────────────────────
    /// <summary>
    /// Upserts a runtime config value.
    ///
    /// When requiresApproval = true (Phase 7.5): stages the change as a pending
    /// approval request. Returns a PendingConfigChangeResult with the pending ID.
    /// A SuperAdmin must approve before the value becomes live.
    ///
    /// When requiresApproval = false (default): applies immediately with a version
    /// snapshot + audit log entry.
    ///
    /// Body: { "value": "150", "changedBy": "ops@example.com",
    ///         "changeReason": "Peak traffic tuning", "requiresApproval": false }
    /// </summary>
    [HttpPut("runtime/{key}")]
    [ProducesResponseType(typeof(ApiResponse<UpsertConfigResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PendingConfigChangeResult>), StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpsertRuntimeConfig(
        string key,
        [FromBody] UpsertRuntimeConfigRequest body,
        CancellationToken ct)
    {
        if (body.RequiresApproval)
        {
            // Phase 7.5 — stage for approval instead of applying directly
            var pendingResult = await Sender.Send(
                new RequestConfigChangeCommand(key, body.Value, body.ChangedBy, body.ChangeReason), ct);

            return pendingResult.IsSuccess
                ? Accepted(ApiResponse<PendingConfigChangeResult>.Ok(pendingResult.Data!))
                : FailResult(string.Join("; ", pendingResult.Errors));
        }

        var result = await Sender.Send(
            new UpsertRuntimeConfigCommand(key, body.Value, body.ChangedBy, body.ChangeReason), ct);

        return result.IsSuccess
            ? Ok(ApiResponse<UpsertConfigResult>.Ok(result.Data!))
            : FailResult(string.Join("; ", result.Errors));
    }

    // ── GET /api/admin/config/versions/{key} ─────────────────────────────────
    /// <summary>Returns the full version history for a config key, newest first.</summary>
    [HttpGet("versions/{key}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ConfigVersionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVersions(string key, CancellationToken ct)
    {
        var result = await Sender.Send(new GetConfigVersionsQuery(key), ct);
        return result.IsSuccess
            ? Ok(ApiResponse<IReadOnlyList<ConfigVersionDto>>.Ok(result.Data!))
            : FailResult(string.Join("; ", result.Errors));
    }

    // ── POST /api/admin/config/rollback/{key}/{version} ──────────────────────
    /// <summary>
    /// Rolls the config key back to a specific version.
    /// Body: { "rolledBackBy": "ops@example.com", "changeReason": "Latency spike after v3" }
    /// </summary>
    [HttpPost("rollback/{key}/{version:int}")]
    [ProducesResponseType(typeof(ApiResponse<RollbackConfigResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Rollback(
        string key,
        int version,
        [FromBody] RollbackConfigRequest body,
        CancellationToken ct)
    {
        var result = await Sender.Send(
            new RollbackConfigCommand(key, version, body.RolledBackBy, body.ChangeReason), ct);

        return result.IsSuccess
            ? Ok(ApiResponse<RollbackConfigResult>.Ok(
                new RollbackConfigResult(result.Data!.Key, version, result.Data.Version)))
            : FailResult(string.Join("; ", result.Errors));
    }

    // ── GET /api/admin/config/audit ──────────────────────────────────────────
    /// <summary>Returns the config audit log. Filter by ?key=X, paginate with ?page=1&amp;pageSize=50.</summary>
    [HttpGet("audit")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ConfigAuditLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLog(
        [FromQuery] string? key,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await Sender.Send(new GetConfigAuditLogQuery(key, page, pageSize), ct);
        return result.IsSuccess
            ? Ok(ApiResponse<IReadOnlyList<ConfigAuditLogDto>>.Ok(result.Data!))
            : FailResult(string.Join("; ", result.Errors));
    }

    // ── PUT /api/admin/config/flags/{key} ────────────────────────────────────
    /// <summary>
    /// Upsert a feature flag with optional targeting.
    ///
    /// Phase 7.5: target JSON is strictly validated against the allowed schema:
    ///   { "userIds": ["&lt;guid&gt;"], "countries": ["TR"], "platform": ["ios","android","web"] }
    ///
    /// Body: { "isEnabled": true, "rolloutPercentage": 10, "target": null,
    ///         "changedBy": "pm@example.com", "changeReason": "iOS beta test" }
    /// </summary>
    [HttpPut("flags/{key}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpsertFeatureFlag(
        string key,
        [FromBody] UpsertFeatureFlagRequest body,
        CancellationToken ct)
    {
        var result = await Sender.Send(
            new UpsertFeatureFlagCommand(
                key, body.IsEnabled, body.RolloutPercentage,
                body.Target, body.ChangedBy, body.ChangeReason), ct);

        return result.IsSuccess
            ? Ok(ApiResponse<string>.Ok(result.Data!))
            : FailResult(string.Join("; ", result.Errors));
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Phase 7.5 — Pending Config Approval Workflow
    // ═════════════════════════════════════════════════════════════════════════

    // ── GET /api/admin/config/pending ─────────────────────────────────────────
    /// <summary>
    /// Lists pending config changes.
    /// Filter by ?key=X and/or ?status=Pending|Approved|Rejected (default: Pending).
    /// Pass status= (empty) to return all statuses.
    /// </summary>
    [HttpGet("pending")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PendingConfigChangeDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendingChanges(
        [FromQuery] string? key,
        [FromQuery] string? status = "Pending",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await Sender.Send(
            new GetPendingConfigChangesQuery(key, status, page, pageSize), ct);

        return result.IsSuccess
            ? Ok(ApiResponse<IReadOnlyList<PendingConfigChangeDto>>.Ok(result.Data!))
            : FailResult(string.Join("; ", result.Errors));
    }

    // ── POST /api/admin/config/pending/{id}/approve ───────────────────────────
    /// <summary>
    /// SuperAdmin approves a pending config change.
    /// The staged value is immediately applied to runtime_configs.
    /// Body: { "reviewedBy": "superadmin@example.com", "reviewReason": "Validated in staging" }
    /// </summary>
    [HttpPost("pending/{id:guid}/approve")]
    [Authorize(Roles = "SuperAdmin")]
    [ProducesResponseType(typeof(ApiResponse<ApproveConfigChangeResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApprovePendingChange(
        Guid id,
        [FromBody] ReviewPendingConfigRequest body,
        CancellationToken ct)
    {
        var result = await Sender.Send(
            new ApproveConfigChangeCommand(id, body.ReviewedBy, body.ReviewReason), ct);

        return result.IsSuccess
            ? Ok(ApiResponse<ApproveConfigChangeResult>.Ok(result.Data!))
            : FailResult(string.Join("; ", result.Errors));
    }

    // ── POST /api/admin/config/pending/{id}/reject ────────────────────────────
    /// <summary>
    /// SuperAdmin rejects a pending config change.
    /// No change is made to runtime_configs.
    /// Body: { "reviewedBy": "superadmin@example.com", "reviewReason": "Value out of safe range" }
    /// </summary>
    [HttpPost("pending/{id:guid}/reject")]
    [Authorize(Roles = "SuperAdmin")]
    [ProducesResponseType(typeof(ApiResponse<RejectConfigChangeResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectPendingChange(
        Guid id,
        [FromBody] ReviewPendingConfigRequest body,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.ReviewReason))
            return BadRequest("ReviewReason is required when rejecting.");

        var result = await Sender.Send(
            new RejectConfigChangeCommand(id, body.ReviewedBy, body.ReviewReason!), ct);

        return result.IsSuccess
            ? Ok(ApiResponse<RejectConfigChangeResult>.Ok(result.Data!))
            : FailResult(string.Join("; ", result.Errors));
    }
}

// ── Request / Response DTOs ───────────────────────────────────────────────────

/// <summary>Phase 7.5: requiresApproval routes through approval workflow instead of live apply.</summary>
public sealed record UpsertRuntimeConfigRequest(
    string Value,
    string ChangedBy,
    string ChangeReason,
    bool   RequiresApproval = false);

public sealed record UpsertFeatureFlagRequest(
    bool    IsEnabled,
    int     RolloutPercentage,
    string? Target,
    string  ChangedBy,
    string  ChangeReason);

public sealed record RollbackConfigRequest(
    string RolledBackBy,
    string ChangeReason);

public sealed record RollbackConfigResult(
    string Key,
    int    RestoredFromVersion,
    int    NewVersion);

/// <summary>Shared body for approve and reject endpoints.</summary>
public sealed record ReviewPendingConfigRequest(
    string  ReviewedBy,
    string? ReviewReason);
