using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Queries.GetConfigVersions;

public sealed class GetConfigVersionsQueryHandler(AdminDbContext db)
    : IRequestHandler<GetConfigVersionsQuery, ApiResult<IReadOnlyList<ConfigVersionDto>>>
{
    public async Task<ApiResult<IReadOnlyList<ConfigVersionDto>>> Handle(
        GetConfigVersionsQuery request, CancellationToken ct)
    {
        var versions = await db.RuntimeConfigVersions
            .AsNoTracking()
            .Where(v => v.Key == request.Key)
            .OrderByDescending(v => v.Version)
            .Select(v => new ConfigVersionDto(v.Id, v.Key, v.Value, v.Version, v.CreatedAt, v.CreatedBy, v.ChangeReason))
            .ToListAsync(ct);

        return ApiResult<IReadOnlyList<ConfigVersionDto>>.Ok(versions);
    }
}
