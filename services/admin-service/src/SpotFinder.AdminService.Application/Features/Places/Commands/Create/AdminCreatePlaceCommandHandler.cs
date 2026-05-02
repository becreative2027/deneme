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
                Slug       = string.IsNullOrWhiteSpace(t.Slug)
                             ? GenerateSlug(t.Name)
                             : NormalizeSlug(t.Slug),
            }).ToList();

            // If only one translation provided, mirror it for the other language (TR→EN or EN→TR)
            var providedLangIds = translations.Select(t => t.LanguageId).ToHashSet();
            var trLangId = 1; // tr
            var enLangId = 2; // en
            if (providedLangIds.Count == 1)
            {
                var source = translations[0];
                var missingLangId = source.LanguageId == trLangId ? enLangId : trLangId;
                translations.Add(new AdminPlaceTranslationWrite
                {
                    PlaceId    = place.Id,
                    LanguageId = missingLangId,
                    Name       = source.Name,
                    Slug       = source.Slug,
                });
            }

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

            // Insert default place_scores so the place appears in ranked results
            await db.Database.ExecuteSqlRawAsync(
                $"INSERT INTO place.place_scores (place_id, final_score, popularity_score, quality_score) VALUES ('{place.Id}', 5.0, 5.0, 5.0) ON CONFLICT (place_id) DO NOTHING");

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

    private static string GenerateSlug(string name)
    {
        var s = name.Trim().ToLowerInvariant();
        s = s.Replace('ı', 'i').Replace('ğ', 'g').Replace('ş', 's')
             .Replace('ç', 'c').Replace('ü', 'u').Replace('ö', 'o')
             .Replace('İ', 'i').Replace('Ğ', 'g').Replace('Ş', 's')
             .Replace('Ç', 'c').Replace('Ü', 'u').Replace('Ö', 'o');
        // Replace non-alphanumeric with dash, collapse multiple dashes
        s = System.Text.RegularExpressions.Regex.Replace(s, @"[^a-z0-9]+", "-");
        return s.Trim('-');
    }
}
