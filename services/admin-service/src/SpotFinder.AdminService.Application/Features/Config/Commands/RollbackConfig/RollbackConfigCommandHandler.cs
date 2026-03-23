using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.RollbackConfig;

/// <summary>
/// Phase 7.4 — Rolls back a config key to a prior version.
///
/// Transaction:
///   ① Load target version snapshot.
///   ② Load current live value (for audit old_value).
///   ③ Compute new version number (max + 1) — rollback is itself versioned.
///   ④ Insert new version snapshot with rollback value + reason.
///   ⑤ Update runtime_configs with rolled-back value.
///   ⑥ Insert audit log.
///   ⑦ Commit → Publish Redis event.
/// </summary>
public sealed class RollbackConfigCommandHandler(
    AdminDbContext db,
    IConfigUpdatePublisher publisher,
    ILogger<RollbackConfigCommandHandler> logger)
    : IRequestHandler<RollbackConfigCommand, ApiResult<UpsertRuntimeConfigResult>>
{
    public async Task<ApiResult<UpsertRuntimeConfigResult>> Handle(
        RollbackConfigCommand cmd, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.ChangeReason))
            return ApiResult<UpsertRuntimeConfigResult>.Fail("ChangeReason is required.");

        // ── ① Load target version ─────────────────────────────────────────────
        var targetVersion = await db.RuntimeConfigVersions
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Key == cmd.Key && v.Version == cmd.TargetVersion, ct);

        if (targetVersion is null)
            return ApiResult<UpsertRuntimeConfigResult>.Fail(
                $"Version {cmd.TargetVersion} not found for key '{cmd.Key}'.");

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            // ── ② Current live value ──────────────────────────────────────────
            var existing = await db.RuntimeConfigs
                .FirstOrDefaultAsync(r => r.Key == cmd.Key, ct);

            var oldValue = existing?.Value;

            // ── ③ Next version ────────────────────────────────────────────────
            var maxVersion = await db.RuntimeConfigVersions
                .Where(v => v.Key == cmd.Key)
                .MaxAsync(v => (int?)v.Version, ct) ?? 0;

            var nextVersion = maxVersion + 1;
            var reason = $"Rollback to v{cmd.TargetVersion}: {cmd.ChangeReason}";

            // ── ④ Version snapshot ────────────────────────────────────────────
            db.RuntimeConfigVersions.Add(
                RuntimeConfigVersion.Create(cmd.Key, targetVersion.Value, nextVersion, cmd.RolledBackBy, reason));

            // ── ⑤ Update live config ──────────────────────────────────────────
            if (existing is null)
                db.RuntimeConfigs.Add(RuntimeConfig.Create(cmd.Key, targetVersion.Value));
            else
                existing.Update(targetVersion.Value);

            // ── ⑥ Audit log ───────────────────────────────────────────────────
            db.ConfigAuditLogs.Add(
                ConfigAuditLog.Create(cmd.Key, oldValue, targetVersion.Value, cmd.RolledBackBy, reason));

            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            logger.LogInformation(
                "RollbackConfig — key={Key} targetVersion={Target} newVersion={New} by={By}",
                cmd.Key, cmd.TargetVersion, nextVersion, cmd.RolledBackBy);

            await publisher.PublishConfigChangedAsync(cmd.Key, ct);

            return ApiResult<UpsertRuntimeConfigResult>.Ok(
                new UpsertRuntimeConfigResult(cmd.Key, nextVersion));
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            logger.LogError(ex, "RollbackConfig failed — key={Key} targetVersion={Target}", cmd.Key, cmd.TargetVersion);
            return ApiResult<UpsertRuntimeConfigResult>.Fail("Rollback failed: " + ex.Message);
        }
    }
}
