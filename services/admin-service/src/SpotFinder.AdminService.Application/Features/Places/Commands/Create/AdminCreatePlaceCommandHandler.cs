using System.Diagnostics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities.Write;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Places.Commands.Create;

public sealed class AdminCreatePlaceCommandHandler(
    AdminWriteDbContext        db,
    ICacheInvalidationService  cache,
    IAuditService              audit,
    ILogger<AdminCreatePlaceCommandHandler> logger)
    : IRequestHandler<AdminCreatePlaceCommand, ApiResult<Guid>>
{
    public async Task<ApiResult<Guid>> Handle(AdminCreatePlaceCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        // ── Idempotency: return existing record if GooglePlaceId already present ──
        if (cmd.GooglePlaceId is not null)
        {
            var existing = await db.Places
                .FirstOrDefaultAsync(p => p.GooglePlaceId == cmd.GooglePlaceId, ct);

            if (existing is not null)
            {
                logger.LogInformation(
                    "AdminCreatePlace — idempotent hit GooglePlaceId={Gid}, returning id={Id}.",
                    cmd.GooglePlaceId, existing.Id);
                return ApiResult<Guid>.Ok(existing.Id);
            }
        }

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var place = new AdminPlaceWrite
            {
                CountryId      = cmd.CountryId,
                CityId         = cmd.CityId,
                DistrictId     = cmd.DistrictId,
                Latitude       = cmd.Latitude,
                Longitude      = cmd.Longitude,
                GooglePlaceId  = cmd.GooglePlaceId,
                ParkingStatus  = cmd.ParkingStatus,
                CreatedBy      = cmd.CreatedBy,
                CreatedAt      = DateTime.UtcNow,
            };

            db.Places.Add(place);
            await db.SaveChangesAsync(ct); // flush to get place.Id

            var translations = cmd.Translations!.Select(t => new AdminPlaceTranslationWrite
            {
                PlaceId    = place.Id,
                LanguageId = t.LanguageId,
                Name       = t.Name.Trim(),
                Slug       = NormalizeSlug(t.Slug),
            }).ToList();

            db.PlaceTranslations.AddRange(translations);

            audit.Log(cmd.CreatedBy, "CREATE", "Place", place.Id.ToString(), new
            {
                place.Id,
                place.GooglePlaceId,
                place.CountryId,
                place.CityId,
                place.ParkingStatus,
                translationCount = translations.Count,
            });

            await db.SaveChangesAsync(ct); // saves translations + audit entry
            await tx.CommitAsync(ct);

            cache.InvalidateFilters();

            sw.Stop();
            logger.LogInformation(
                "AdminCreatePlace — userId={UserId} created id={PlaceId}, " +
                "translations={Count}, totalTime={TotalMs} ms.",
                cmd.CreatedBy, place.Id, translations.Count, sw.ElapsedMilliseconds);

            return ApiResult<Guid>.Ok(place.Id);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            logger.LogError(ex, "AdminCreatePlace failed — userId={UserId}.", cmd.CreatedBy);
            return ApiResult<Guid>.Fail("Failed to create place: " + ex.Message);
        }
    }

    private static string? NormalizeSlug(string? slug)
        => slug?.Trim().ToLowerInvariant().Replace(' ', '-');
}
