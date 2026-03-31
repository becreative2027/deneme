using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Places.Commands.Update;

public sealed class AdminUpdatePlaceCommandHandler(
    AdminWriteDbContext        db,
    ICacheInvalidationService  cache,
    IAuditService              audit,
    ILogger<AdminUpdatePlaceCommandHandler> logger)
    : IRequestHandler<AdminUpdatePlaceCommand, ApiResult<bool>>
{
    public async Task<ApiResult<bool>> Handle(AdminUpdatePlaceCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        // HasQueryFilter(!IsDeleted) means soft-deleted places are invisible here.
        var place = await db.Places.FirstOrDefaultAsync(p => p.Id == cmd.PlaceId, ct);
        if (place is null)
            return ApiResult<bool>.Fail($"Place {cmd.PlaceId} not found.");

        // Capture snapshot for audit payload before mutation.
        var before = new
        {
            place.CountryId, place.CityId, place.DistrictId,
            place.Latitude, place.Longitude, place.GooglePlaceId, place.ParkingStatus,
        };

        if (cmd.CountryId.HasValue)    place.CountryId     = cmd.CountryId;
        if (cmd.CityId.HasValue)       place.CityId        = cmd.CityId;
        if (cmd.DistrictId.HasValue)   place.DistrictId    = cmd.DistrictId;
        if (cmd.Latitude.HasValue)     place.Latitude      = cmd.Latitude;
        if (cmd.Longitude.HasValue)    place.Longitude     = cmd.Longitude;
        if (cmd.GooglePlaceId != null) place.GooglePlaceId = cmd.GooglePlaceId;
        if (cmd.ParkingStatus != null)  place.ParkingStatus = cmd.ParkingStatus;
        if (cmd.Rating.HasValue)        place.Rating        = cmd.Rating;
        if (cmd.CoverImageUrl != null)  place.CoverImageUrl = cmd.CoverImageUrl;
        if (cmd.MenuUrl != null)        place.MenuUrl       = cmd.MenuUrl;
        if (cmd.MenuImageUrls != null)  place.MenuImageUrls = cmd.MenuImageUrls;
        // PriceLevel: -1 = clear to null, positive = set value, null = no change
        if (cmd.PriceLevel.HasValue)    place.PriceLevel    = cmd.PriceLevel == -1 ? null : cmd.PriceLevel;
        if (cmd.VenueType != null)      place.VenueType     = cmd.VenueType == "" ? null : cmd.VenueType;

        place.UpdatedAt = DateTime.UtcNow;
        place.UpdatedBy = cmd.UpdatedBy;

        audit.Log(cmd.UpdatedBy, "UPDATE", "Place", cmd.PlaceId.ToString(), new { before, after = new
        {
            place.CountryId, place.CityId, place.DistrictId,
            place.Latitude, place.Longitude, place.GooglePlaceId, place.ParkingStatus,
        }});

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            logger.LogWarning(
                "AdminUpdatePlace — concurrency conflict on id={PlaceId}, userId={UserId}.",
                cmd.PlaceId, cmd.UpdatedBy);
            return ApiResult<bool>.Fail(
                "Conflict: this place was modified by another request. Reload and retry.");
        }

        cache.InvalidatePlace(cmd.PlaceId);
        cache.InvalidateFilters();

        sw.Stop();
        logger.LogInformation(
            "AdminUpdatePlace — userId={UserId} updated id={PlaceId}, totalTime={TotalMs} ms.",
            cmd.UpdatedBy, cmd.PlaceId, sw.ElapsedMilliseconds);

        return ApiResult<bool>.Ok(true);
    }
}
