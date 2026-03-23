using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Update;

public sealed class AdminUpdateLabelCommandHandler(
    AdminWriteDbContext        db,
    ICacheInvalidationService  cache,
    IAuditService              audit,
    ILogger<AdminUpdateLabelCommandHandler> logger)
    : IRequestHandler<AdminUpdateLabelCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(AdminUpdateLabelCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        // HasQueryFilter(!IsDeleted) prevents loading deleted labels.
        var label = await db.Labels.FirstOrDefaultAsync(l => l.Id == cmd.LabelId, ct);
        if (label is null)
            return ApiResult<bool>.Fail($"Label {cmd.LabelId} not found.");

        var before = new { label.Key, label.IsActive };

        if (cmd.Key != null)       label.Key      = cmd.Key.Trim().ToLowerInvariant();
        if (cmd.IsActive.HasValue) label.IsActive = cmd.IsActive.Value;

        label.UpdatedAt = DateTime.UtcNow;
        label.UpdatedBy = cmd.UpdatedBy;

        audit.Log(cmd.UpdatedBy, "UPDATE", "Label", cmd.LabelId.ToString(), new
        {
            before,
            after = new { label.Key, label.IsActive },
        });

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            logger.LogWarning(
                "AdminUpdateLabel — concurrency conflict on id={LabelId}, userId={UserId}.",
                cmd.LabelId, cmd.UpdatedBy);
            return ApiResult<bool>.Fail(
                "Conflict: this label was modified by another request. Reload and retry.");
        }

        cache.InvalidateFilters();

        sw.Stop();
        logger.LogInformation(
            "AdminUpdateLabel — userId={UserId} updated id={LabelId}, totalTime={TotalMs} ms.",
            cmd.UpdatedBy, cmd.LabelId, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
