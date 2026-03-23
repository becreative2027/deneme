using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Places.Commands.Delete;

public sealed class AdminDeletePlaceCommandHandler(
    AdminWriteDbContext        db,
    ICacheInvalidationService  cache,
    IAuditService              audit,
    ILogger<AdminDeletePlaceCommandHandler> logger)
    : IRequestHandler<AdminDeletePlaceCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(AdminDeletePlaceCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        // HasQueryFilter(!IsDeleted) prevents loading already-deleted places.
        var place = await db.Places.FirstOrDefaultAsync(p => p.Id == cmd.PlaceId, ct);
        if (place is null)
            return ApiResult<bool>.Fail($"Place {cmd.PlaceId} not found.");

        place.IsDeleted = true;
        place.DeletedAt = DateTime.UtcNow;
        place.DeletedBy = cmd.DeletedBy;
        place.UpdatedAt = DateTime.UtcNow;

        audit.Log(cmd.DeletedBy, "DELETE", "Place", cmd.PlaceId.ToString(), new
        {
            cmd.PlaceId,
            deletedBy  = cmd.DeletedBy,
            deletedAt  = place.DeletedAt,
        });

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            logger.LogWarning(
                "AdminDeletePlace — concurrency conflict on id={PlaceId}, userId={UserId}.",
                cmd.PlaceId, cmd.DeletedBy);
            return ApiResult<bool>.Fail(
                "Conflict: this place was modified by another request. Reload and retry.");
        }

        cache.InvalidatePlace(cmd.PlaceId);
        cache.InvalidateFilters();

        sw.Stop();
        logger.LogInformation(
            "AdminDeletePlace — userId={UserId} soft-deleted id={PlaceId}, totalTime={TotalMs} ms.",
            cmd.DeletedBy, cmd.PlaceId, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
