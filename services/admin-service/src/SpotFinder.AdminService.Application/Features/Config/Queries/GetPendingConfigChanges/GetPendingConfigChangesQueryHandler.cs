using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Queries.GetPendingConfigChanges;

public sealed class GetPendingConfigChangesQueryHandler(AdminDbContext db)
    : IRequestHandler<GetPendingConfigChangesQuery, ApiResult<IReadOnlyList<PendingConfigChangeDto>>>
{
    public async Task<ApiResult<IReadOnlyList<PendingConfigChangeDto>>> Handle(
        GetPendingConfigChangesQuery query, CancellationToken ct)
    {
        var pageSize = Math.Clamp(query.PageSize, 1, 200);
        var page     = Math.Max(1, query.Page);

        var q = db.PendingConfigChanges.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Key))
            q = q.Where(p => p.Key == query.Key);

        if (!string.IsNullOrWhiteSpace(query.Status))
            q = q.Where(p => p.Status == query.Status);

        var rows = await q
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PendingConfigChangeDto(
                p.Id,
                p.Key,
                p.Value,
                p.RequestedBy,
                p.RequestReason,
                p.Status,
                p.ReviewedBy,
                p.ReviewReason,
                p.CreatedAt,
                p.ReviewedAt))
            .ToListAsync(ct);

        return ApiResult<IReadOnlyList<PendingConfigChangeDto>>.Ok(rows);
    }
}
