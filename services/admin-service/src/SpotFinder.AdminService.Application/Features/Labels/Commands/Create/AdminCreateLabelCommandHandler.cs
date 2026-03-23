using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Entities.Write;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Create;

public sealed class AdminCreateLabelCommandHandler(
    AdminWriteDbContext        db,
    ICacheInvalidationService  cache,
    IAuditService              audit,
    ILogger<AdminCreateLabelCommandHandler> logger)
    : IRequestHandler<AdminCreateLabelCommand, ApiResult<int>>
{
    public async Task<ApiResult<int>> Handle(AdminCreateLabelCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var label = new AdminLabelWrite
            {
                CategoryId = cmd.CategoryId,
                Key        = cmd.Key.Trim().ToLowerInvariant(),
                IsActive   = true,
                CreatedAt  = DateTime.UtcNow,
                CreatedBy  = cmd.CreatedBy,
            };

            db.Labels.Add(label);
            await db.SaveChangesAsync(ct); // flush to get label.Id

            if (cmd.Translations is { Count: > 0 })
            {
                var translations = cmd.Translations.Select(t => new AdminLabelTranslationWrite
                {
                    LabelId     = label.Id,
                    LanguageId  = t.LanguageId,
                    DisplayName = t.DisplayName.Trim(),
                }).ToList();

                db.LabelTranslations.AddRange(translations);
            }

            audit.Log(cmd.CreatedBy, "CREATE", "Label", label.Id.ToString(), new
            {
                label.Id,
                label.Key,
                label.CategoryId,
                translationCount = cmd.Translations?.Count ?? 0,
            });

            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            cache.InvalidateFilters();

            sw.Stop();
            logger.LogInformation(
                "AdminCreateLabel — userId={UserId} created id={LabelId}, totalTime={TotalMs} ms.",
                cmd.CreatedBy, label.Id, sw.ElapsedMilliseconds);

            return ApiResult<int>.Ok(label.Id);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            logger.LogError(ex, "AdminCreateLabel failed — userId={UserId}.", cmd.CreatedBy);
            return ApiResult<int>.Fail("Failed to create label: " + ex.Message);
        }
    }
}
