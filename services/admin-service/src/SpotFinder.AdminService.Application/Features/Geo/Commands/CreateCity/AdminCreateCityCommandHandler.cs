using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities.Write;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Geo.Commands.CreateCity;

public sealed class AdminCreateCityCommandHandler(
    AdminWriteDbContext        db,
    ICacheInvalidationService  cache,
    IAuditService              audit,
    ILogger<AdminCreateCityCommandHandler> logger)
    : IRequestHandler<AdminCreateCityCommand, ApiResult<int>>
{
    public async Task<ApiResult<int>> Handle(AdminCreateCityCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var city = new AdminCityWrite
            {
                CountryId = cmd.CountryId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = cmd.CreatedBy,
            };

            db.Cities.Add(city);
            await db.SaveChangesAsync(ct); // flush to get city.Id

            if (cmd.Translations is { Count: > 0 })
            {
                var translations = cmd.Translations.Select(t => new AdminCityTranslationWrite
                {
                    CityId     = city.Id,
                    LanguageId = t.LanguageId,
                    Name       = t.Name.Trim(),
                    Slug       = NormalizeSlug(t.Slug),
                }).ToList();

                db.CityTranslations.AddRange(translations);
            }

            audit.Log(cmd.CreatedBy, "CREATE", "City", city.Id.ToString(), new
            {
                city.Id,
                city.CountryId,
                translationCount = cmd.Translations?.Count ?? 0,
            });

            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            cache.InvalidateFilters();

            sw.Stop();
            logger.LogInformation(
                "AdminCreateCity — userId={UserId} created id={CityId}, totalTime={TotalMs} ms.",
                cmd.CreatedBy, city.Id, sw.ElapsedMilliseconds);

            return ApiResult<int>.Ok(city.Id);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            logger.LogError(ex, "AdminCreateCity failed — userId={UserId}.", cmd.CreatedBy);
            return ApiResult<int>.Fail("Failed to create city: " + ex.Message);
        }
    }

    private static string? NormalizeSlug(string? slug)
        => slug?.Trim().ToLowerInvariant().Replace(' ', '-');
}
