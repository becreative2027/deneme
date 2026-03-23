using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Queries.GetAllRuntimeConfigs;

public sealed class GetAllRuntimeConfigsQueryHandler(AdminDbContext db)
    : IRequestHandler<GetAllRuntimeConfigsQuery, ApiResult<GetAllRuntimeConfigsResponse>>
{
    public async Task<ApiResult<GetAllRuntimeConfigsResponse>> Handle(
        GetAllRuntimeConfigsQuery request, CancellationToken ct)
    {
        // Fetch configs + their max version in one query using a left join
        var configs = await db.RuntimeConfigs
            .AsNoTracking()
            .OrderBy(r => r.Key)
            .Select(r => new RuntimeConfigDto(
                r.Key,
                r.Value,
                db.RuntimeConfigVersions
                    .Where(v => v.Key == r.Key)
                    .Max(v => (int?)v.Version),
                r.UpdatedAt))
            .ToListAsync(ct);

        var flags = await db.FeatureFlags
            .AsNoTracking()
            .OrderBy(f => f.Key)
            .Select(f => new FeatureFlagDto(f.Key, f.IsEnabled, f.RolloutPercentage, f.Target, f.UpdatedAt))
            .ToListAsync(ct);

        return ApiResult<GetAllRuntimeConfigsResponse>.Ok(
            new GetAllRuntimeConfigsResponse(configs, flags));
    }
}
