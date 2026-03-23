using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Application.Features.Config.Validators;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.UpsertFeatureFlag;

/// <summary>
/// Phase 7.4/7.5 — Upserts a feature flag with targeting, audit log, and Redis publish.
///
/// Phase 7.5: target JSON is validated against the strict FlagTargetingValidator schema
/// instead of a bare JsonDocument.Parse check.  Invalid structure (unknown keys, bad
/// GUIDs, disallowed platform values, empty arrays, missing root keys) is rejected with
/// actionable error messages before any DB write occurs.
/// </summary>
public sealed class UpsertFeatureFlagCommandHandler(
    AdminDbContext db,
    IConfigUpdatePublisher publisher,
    ILogger<UpsertFeatureFlagCommandHandler> logger)
    : IRequestHandler<UpsertFeatureFlagCommand, ApiResult<string>>
{
    public async Task<ApiResult<string>> Handle(UpsertFeatureFlagCommand cmd, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.Key))
            return ApiResult<string>.Fail("Key must not be empty.");

        if (string.IsNullOrWhiteSpace(cmd.ChangeReason))
            return ApiResult<string>.Fail("ChangeReason is required for auditability.");

        if (cmd.RolloutPercentage is < 0 or > 100)
            return ApiResult<string>.Fail("RolloutPercentage must be 0–100.");

        // Phase 7.5 — strict JSON schema validation for the target field
        if (!string.IsNullOrWhiteSpace(cmd.Target))
        {
            var targetErrors = FlagTargetingValidator.Validate(cmd.Target);
            if (targetErrors.Count > 0)
                return ApiResult<string>.Fail(string.Join(" | ", targetErrors));
        }

        var existing = await db.FeatureFlags
            .FirstOrDefaultAsync(f => f.Key == cmd.Key, ct);

        if (existing is null)
        {
            db.FeatureFlags.Add(
                FeatureFlag.Create(cmd.Key, cmd.IsEnabled, cmd.RolloutPercentage, cmd.Target));
        }
        else
        {
            existing.Update(cmd.IsEnabled, cmd.RolloutPercentage, cmd.Target);
        }

        // Audit as a config log entry (flags share the audit infrastructure)
        db.ConfigAuditLogs.Add(ConfigAuditLog.Create(
            $"flag:{cmd.Key}",
            oldValue: null,
            newValue: $"{{\"enabled\":{cmd.IsEnabled.ToString().ToLower()},\"rollout\":{cmd.RolloutPercentage},\"target\":{cmd.Target ?? "null"}}}",
            changedBy: cmd.ChangedBy,
            changeReason: cmd.ChangeReason));

        await db.SaveChangesAsync(ct);

        logger.LogInformation(
            "FeatureFlag — key={Key} enabled={Enabled} rollout={Pct} target={Target} by={By}",
            cmd.Key, cmd.IsEnabled, cmd.RolloutPercentage, cmd.Target, cmd.ChangedBy);

        await publisher.PublishFlagsChangedAsync(ct);

        return ApiResult<string>.Ok(cmd.Key);
    }
}
