using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.AuditLogs.Queries.GetAuditLogs;

public sealed class GetAuditLogsQueryHandler : IQueryHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly AdminWriteDbContext _db;
    public GetAuditLogsQueryHandler(AdminWriteDbContext db) => _db = db;

    public async Task<PagedResult<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.WriteAuditLogs.AsQueryable();

        if (request.AdminId.HasValue)
            query = query.Where(l => l.UserId == request.AdminId.Value.ToString());

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(l => new AuditLogDto(
            l.Id.ToString(),
            l.UserId,
            l.Action,
            l.EntityType,
            l.EntityId,
            l.Payload,
            l.CreatedAt
        )).ToList();

        return PagedResult<AuditLogDto>.Create(dtos, total, request.Page, request.PageSize);
    }
}
