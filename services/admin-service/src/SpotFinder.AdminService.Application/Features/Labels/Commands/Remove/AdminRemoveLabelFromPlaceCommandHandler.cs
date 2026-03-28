using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Remove;

public sealed class AdminRemoveLabelFromPlaceCommandHandler(
    AdminWriteDbContext db,
    IAuditService       audit)
    : IRequestHandler<AdminRemoveLabelFromPlaceCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(
        AdminRemoveLabelFromPlaceCommand cmd,
        CancellationToken ct)
    {
        var row = await db.PlaceLabels
            .FirstOrDefaultAsync(pl => pl.PlaceId == cmd.PlaceId && pl.LabelId == cmd.LabelId, ct);

        if (row is null) return ApiResult<bool>.Ok(true); // idempotent

        db.PlaceLabels.Remove(row);
        audit.Log(cmd.RemovedBy, "DELETE", "PlaceLabel",
            $"{cmd.PlaceId}:{cmd.LabelId}", new { cmd.PlaceId, cmd.LabelId });

        await db.SaveChangesAsync(ct);
        return ApiResult<bool>.Ok(true);
    }
}
