using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.UpsertRuntimeConfig;

/// <summary>
/// Phase 7.4 — Upserts a runtime config with versioning, audit log, and Redis publish.
///
/// Atomic transaction:
///   ① Validate JSON + non-empty reason.
///   ② Insert version snapshot (new_value, nextVersion, createdBy, changeReason).
///   ③ Upsert runtime_configs (current live value).
///   ④ Insert config_audit_log (old_value, new_value, changedBy, changeReason).
///   ⑤ Commit.
///   ⑥ Publish "config:{key}" to Redis (best-effort, outside transaction).
/// </summary>
public sealed class UpsertRuntimeConfigCommandHandler(
    AdminDbContext db,
    IConfigUpdatePublisher publisher,
    ILogger<UpsertRuntimeConfigCommandHandler> logger)
    : IRequestHandler<UpsertRuntimeConfigCommand, ApiResult<UpsertRuntimeConfigResult>>
{
    public async Task<ApiResult<UpsertRuntimeConfigResult>> Handle(
        UpsertRuntimeConfigCommand cmd, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.Key))
            return ApiResult<UpsertRuntimeConfigResult>.Fail("Key must not be empty.");

        if (string.IsNullOrWhiteSpace(cmd.ChangeReason))
            return ApiResult<UpsertRuntimeConfigResult>.Fail("ChangeReason is required for auditability.");

        try { JsonDocument.Parse(cmd.Value); }
        catch (JsonException)
        {
            return ApiResult<UpsertRuntimeConfigResult>.Fail($"Value is not valid JSON: {cmd.Value}");
        }

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            // ── ① Read current state ──────────────────────────────────────────
            var existing = await db.RuntimeConfigs
                .FirstOrDefaultAsync(r => r.Key == cmd.Key, ct);

            var oldValue = existing?.Value;

            // ── ② Compute next version ────────────────────────────────────────
            var maxVersion = await db.RuntimeConfigVersions
                .Where(v => v.Key == cmd.Key)
                .MaxAsync(v => (int?)v.Version, ct) ?? 0;

            var nextVersion = maxVersion + 1;

            // ── ③ Version snapshot ────────────────────────────────────────────
            db.RuntimeConfigVersions.Add(
                RuntimeConfigVersion.Create(cmd.Key, cmd.Value, nextVersion, cmd.ChangedBy, cmd.ChangeReason));

            // ── ④ Upsert live config ─────────────────────────────────────────
            if (existing is null)
                db.RuntimeConfigs.Add(RuntimeConfig.Create(cmd.Key, cmd.Value));
            else
                existing.Update(cmd.Value);

            // ── ⑤ Audit log ───────────────────────────────────────────────────
            db.ConfigAuditLogs.Add(
                ConfigAuditLog.Create(cmd.Key, oldValue, cmd.Value, cmd.ChangedBy, cmd.ChangeReason));

            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            logger.LogInformation(
                "RuntimeConfig — key={Key} v{Version} changedBy={By} reason={Reason}",
                cmd.Key, nextVersion, cmd.ChangedBy, cmd.ChangeReason);

            // ── ⑥ Publish (best-effort, outside transaction) ─────────────────
            await publisher.PublishConfigChangedAsync(cmd.Key, ct);

            return ApiResult<UpsertRuntimeConfigResult>.Ok(
                new UpsertRuntimeConfigResult(cmd.Key, nextVersion));
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            logger.LogError(ex, "UpsertRuntimeConfig failed — key={Key}", cmd.Key);
            return ApiResult<UpsertRuntimeConfigResult>.Fail("Failed to save config: " + ex.Message);
        }
    }
}
