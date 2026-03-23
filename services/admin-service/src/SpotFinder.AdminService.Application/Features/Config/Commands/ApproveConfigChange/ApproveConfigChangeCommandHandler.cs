using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.ApproveConfigChange;

/// <summary>
/// Phase 7.5 — Approves a pending config change and applies it atomically.
///
/// Transaction:
///   ① Load + validate the pending change (must be in Pending status).
///   ② Mark the pending record as Approved.
///   ③ Compute next version for the key.
///   ④ Insert version snapshot.
///   ⑤ Upsert runtime_configs with the approved value.
///   ⑥ Insert audit log entry (reason = "Approved pending change {id}: {reviewReason}").
///   ⑦ Commit → Publish Redis config event (best-effort, outside transaction).
/// </summary>
public sealed class ApproveConfigChangeCommandHandler(
    AdminDbContext db,
    IConfigUpdatePublisher publisher,
    ILogger<ApproveConfigChangeCommandHandler> logger)
    : IRequestHandler<ApproveConfigChangeCommand, ApiResult<ApproveConfigChangeResult>>
{
    public async Task<ApiResult<ApproveConfigChangeResult>> Handle(
        ApproveConfigChangeCommand cmd, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.ReviewedBy))
            return ApiResult<ApproveConfigChangeResult>.Fail("ReviewedBy is required.");

        var pending = await db.PendingConfigChanges
            .FirstOrDefaultAsync(p => p.Id == cmd.PendingId, ct);

        if (pending is null)
            return ApiResult<ApproveConfigChangeResult>.Fail(
                $"Pending change {cmd.PendingId} not found.");

        if (pending.Status != Domain.Entities.PendingConfigStatus.Pending)
            return ApiResult<ApproveConfigChangeResult>.Fail(
                $"Pending change {cmd.PendingId} is already '{pending.Status}' and cannot be approved.");

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            // ── ① Mark approved ───────────────────────────────────────────────
            pending.Approve(cmd.ReviewedBy, cmd.ReviewReason);

            // ── ② Current live value (for audit) ─────────────────────────────
            var existing = await db.RuntimeConfigs
                .FirstOrDefaultAsync(r => r.Key == pending.Key, ct);

            var oldValue = existing?.Value;

            // ── ③ Next version ────────────────────────────────────────────────
            var maxVersion = await db.RuntimeConfigVersions
                .Where(v => v.Key == pending.Key)
                .MaxAsync(v => (int?)v.Version, ct) ?? 0;

            var nextVersion = maxVersion + 1;
            var reason = $"Approved pending change {pending.Id}: {cmd.ReviewReason ?? pending.RequestReason}";

            // ── ④ Version snapshot ────────────────────────────────────────────
            db.RuntimeConfigVersions.Add(
                RuntimeConfigVersion.Create(
                    pending.Key, pending.Value, nextVersion, cmd.ReviewedBy, reason));

            // ── ⑤ Upsert live config ──────────────────────────────────────────
            if (existing is null)
                db.RuntimeConfigs.Add(RuntimeConfig.Create(pending.Key, pending.Value));
            else
                existing.Update(pending.Value);

            // ── ⑥ Audit log ───────────────────────────────────────────────────
            db.ConfigAuditLogs.Add(
                ConfigAuditLog.Create(pending.Key, oldValue, pending.Value, cmd.ReviewedBy, reason));

            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            logger.LogInformation(
                "ApproveConfigChange — pendingId={Id} key={Key} v{Version} by={By}",
                pending.Id, pending.Key, nextVersion, cmd.ReviewedBy);

            // ── ⑦ Publish (best-effort) ───────────────────────────────────────
            await publisher.PublishConfigChangedAsync(pending.Key, ct);

            return ApiResult<ApproveConfigChangeResult>.Ok(
                new ApproveConfigChangeResult(pending.Id, pending.Key, nextVersion));
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            logger.LogError(ex, "ApproveConfigChange failed — pendingId={Id}", cmd.PendingId);
            return ApiResult<ApproveConfigChangeResult>.Fail("Approval failed: " + ex.Message);
        }
    }
}
