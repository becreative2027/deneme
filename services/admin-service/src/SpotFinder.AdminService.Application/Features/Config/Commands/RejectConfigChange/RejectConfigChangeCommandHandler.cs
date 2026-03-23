using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.RejectConfigChange;

/// <summary>
/// Phase 7.5 — Rejects a pending config change. No runtime_configs modification occurs.
///
/// Steps:
///   ① Load + validate the pending change (must be in Pending status).
///   ② Mark the record as Rejected with the given reason.
///   ③ Save. No Redis publish (the live config is unchanged).
/// </summary>
public sealed class RejectConfigChangeCommandHandler(
    AdminDbContext db,
    ILogger<RejectConfigChangeCommandHandler> logger)
    : IRequestHandler<RejectConfigChangeCommand, ApiResult<RejectConfigChangeResult>>
{
    public async Task<ApiResult<RejectConfigChangeResult>> Handle(
        RejectConfigChangeCommand cmd, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.ReviewedBy))
            return ApiResult<RejectConfigChangeResult>.Fail("ReviewedBy is required.");

        if (string.IsNullOrWhiteSpace(cmd.ReviewReason))
            return ApiResult<RejectConfigChangeResult>.Fail("ReviewReason is required when rejecting.");

        var pending = await db.PendingConfigChanges
            .FirstOrDefaultAsync(p => p.Id == cmd.PendingId, ct);

        if (pending is null)
            return ApiResult<RejectConfigChangeResult>.Fail(
                $"Pending change {cmd.PendingId} not found.");

        if (pending.Status != PendingConfigStatus.Pending)
            return ApiResult<RejectConfigChangeResult>.Fail(
                $"Pending change {cmd.PendingId} is already '{pending.Status}' and cannot be rejected.");

        pending.Reject(cmd.ReviewedBy, cmd.ReviewReason);
        await db.SaveChangesAsync(ct);

        logger.LogInformation(
            "RejectConfigChange — pendingId={Id} key={Key} by={By} reason={Reason}",
            pending.Id, pending.Key, cmd.ReviewedBy, cmd.ReviewReason);

        return ApiResult<RejectConfigChangeResult>.Ok(
            new RejectConfigChangeResult(pending.Id, pending.Key));
    }
}
