using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities.Write;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Assign;

public sealed class AdminAssignLabelToPlaceCommandHandler(
    AdminWriteDbContext        db,
    IAuditService              audit,
    ILogger<AdminAssignLabelToPlaceCommandHandler> logger)
    : IRequestHandler<AdminAssignLabelToPlaceCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(AdminAssignLabelToPlaceCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        // Idempotency: return success if the assignment already exists.
        var exists = await db.PlaceLabels
            .AnyAsync(pl => pl.PlaceId == cmd.PlaceId && pl.LabelId == cmd.LabelId, ct);

        if (exists)
        {
            logger.LogInformation(
                "AdminAssignLabelToPlace — idempotent, placeId={PlaceId} labelId={LabelId} already assigned.",
                cmd.PlaceId, cmd.LabelId);
            return ApiResult<bool>.Ok(true);
        }

        db.PlaceLabels.Add(new AdminPlaceLabelWrite
        {
            PlaceId   = cmd.PlaceId,
            LabelId   = cmd.LabelId,
            Weight    = cmd.Weight,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = cmd.CreatedBy,
        });

        audit.Log(cmd.CreatedBy, "CREATE", "PlaceLabel",
            $"{cmd.PlaceId}:{cmd.LabelId}",
            new { cmd.PlaceId, cmd.LabelId, cmd.Weight });

        await db.SaveChangesAsync(ct);

        sw.Stop();
        logger.LogInformation(
            "AdminAssignLabelToPlace — userId={UserId} assigned labelId={LabelId} to placeId={PlaceId}, " +
            "weight={Weight}, totalTime={TotalMs} ms.",
            cmd.CreatedBy, cmd.LabelId, cmd.PlaceId, cmd.Weight, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
