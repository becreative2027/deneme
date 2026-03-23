using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.RequestConfigChange;

/// <summary>
/// Phase 7.5 — Stages a pending config change (does NOT apply it immediately).
///
/// Steps:
///   ① Validate inputs (non-empty key/reason, valid JSON value).
///   ② Insert PendingConfigChange with status = Pending.
///   ③ Return the pending change ID so the caller can reference it.
///
/// No Redis publish here — the change is not live yet.
/// Redis is published by ApproveConfigChangeCommandHandler after approval.
/// </summary>
public sealed class RequestConfigChangeCommandHandler(
    AdminDbContext db,
    ILogger<RequestConfigChangeCommandHandler> logger)
    : IRequestHandler<RequestConfigChangeCommand, ApiResult<PendingConfigChangeResult>>
{
    public async Task<ApiResult<PendingConfigChangeResult>> Handle(
        RequestConfigChangeCommand cmd, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.Key))
            return ApiResult<PendingConfigChangeResult>.Fail("Key must not be empty.");

        if (string.IsNullOrWhiteSpace(cmd.RequestReason))
            return ApiResult<PendingConfigChangeResult>.Fail("RequestReason is required for auditability.");

        try { JsonDocument.Parse(cmd.Value); }
        catch (JsonException)
        {
            return ApiResult<PendingConfigChangeResult>.Fail($"Value is not valid JSON: {cmd.Value}");
        }

        var pending = PendingConfigChange.Create(cmd.Key, cmd.Value, cmd.RequestedBy, cmd.RequestReason);
        db.PendingConfigChanges.Add(pending);
        await db.SaveChangesAsync(ct);

        logger.LogInformation(
            "PendingConfigChange — id={Id} key={Key} requestedBy={By} reason={Reason}",
            pending.Id, pending.Key, pending.RequestedBy, pending.RequestReason);

        return ApiResult<PendingConfigChangeResult>.Ok(
            new PendingConfigChangeResult(pending.Id, pending.Key, pending.Status));
    }
}
