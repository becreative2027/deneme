using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities.Write;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Geo.Commands.CreateDistrict;

public sealed class AdminCreateDistrictCommandHandler(
    AdminWriteDbContext        db,
    ICacheInvalidationService  cache,
    IAuditService              audit,
    ILogger<AdminCreateDistrictCommandHandler> logger)
    : IRequestHandler<AdminCreateDistrictCommand, ApiResult<int>>
{
    public async Task<ApiResult<int>> Handle(AdminCreateDistrictCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var district = new AdminDistrictWrite
            {
                CityId    = cmd.CityId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = cmd.CreatedBy,
            };

            db.Districts.Add(district);
            await db.SaveChangesAsync(ct); // flush to get district.Id

            if (cmd.Translations is { Count: > 0 })
            {
                var translations = cmd.Translations.Select(t => new AdminDistrictTranslationWrite
                {
                    DistrictId = district.Id,
                    LanguageId = t.LanguageId,
                    Name       = t.Name.Trim(),
                    Slug       = NormalizeSlug(t.Slug),
                }).ToList();

                db.DistrictTranslations.AddRange(translations);
            }

            audit.Log(cmd.CreatedBy, "CREATE", "District", district.Id.ToString(), new
            {
                district.Id,
                district.CityId,
                translationCount = cmd.Translations?.Count ?? 0,
            });

            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            cache.InvalidateFilters();

            sw.Stop();
            logger.LogInformation(
                "AdminCreateDistrict — userId={UserId} created id={DistrictId}, totalTime={TotalMs} ms.",
                cmd.CreatedBy, district.Id, sw.ElapsedMilliseconds);

            return ApiResult<int>.Ok(district.Id);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            logger.LogError(ex, "AdminCreateDistrict failed — userId={UserId}.", cmd.CreatedBy);
            return ApiResult<int>.Fail("Failed to create district: " + ex.Message);
        }
    }

    private static string? NormalizeSlug(string? slug)
        => slug?.Trim().ToLowerInvariant().Replace(' ', '-');
}
