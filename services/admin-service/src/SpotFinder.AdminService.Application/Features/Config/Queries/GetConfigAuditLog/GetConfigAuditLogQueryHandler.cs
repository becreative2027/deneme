using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Queries.GetConfigAuditLog;

public sealed class GetConfigAuditLogQueryHandler(AdminDbContext db)
    : IRequestHandler<GetConfigAuditLogQuery, ApiResult<IReadOnlyList<ConfigAuditLogDto>>>
{
    public async Task<ApiResult<IReadOnlyList<ConfigAuditLogDto>>> Handle(
        GetConfigAuditLogQuery request, CancellationToken ct)
    {
        var pageSize = Math.Clamp(request.PageSize, 1, 200);
        var skip     = (Math.Max(request.Page, 1) - 1) * pageSize;

        var query = db.ConfigAuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Key))
            query = query.Where(a => a.Key == request.Key || a.Key == $"flag:{request.Key}");

        var logs = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .Select(a => new ConfigAuditLogDto(
                a.Id, a.Key, a.OldValue, a.NewValue, a.ChangedBy, a.ChangeReason, a.CreatedAt))
            .ToListAsync(ct);

        return ApiResult<IReadOnlyList<ConfigAuditLogDto>>.Ok(logs);
    }
}
