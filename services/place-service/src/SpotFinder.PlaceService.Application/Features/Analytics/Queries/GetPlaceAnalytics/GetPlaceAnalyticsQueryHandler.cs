using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.PlaceService.Infrastructure.Persistence;

namespace SpotFinder.PlaceService.Application.Features.Analytics.Queries.GetPlaceAnalytics;

public sealed class GetPlaceAnalyticsQueryHandler(PlaceDbContext db)
    : IRequestHandler<GetPlaceAnalyticsQuery, ApiResult<PlaceAnalyticsResponse>>
{
    public async Task<ApiResult<PlaceAnalyticsResponse>> Handle(
        GetPlaceAnalyticsQuery request,
        CancellationToken ct)
    {
        var days  = Math.Clamp(request.Days, 1, 365);
        var since = DateTime.UtcNow.AddDays(-days).Date;

        var views = await db.PlaceViews
            .Where(v => v.PlaceId == request.PlaceId && v.CreatedAt >= since)
            .Select(v => new { v.UserId, v.DurationSeconds, Date = v.CreatedAt.Date })
            .ToListAsync(ct);

        var totalViews      = views.Count;
        var uniqueVisitors  = views.Select(v => v.UserId).Distinct().Count();
        var durationsWithValue = views.Where(v => v.DurationSeconds.HasValue).Select(v => v.DurationSeconds!.Value).ToList();
        double? avgDuration = durationsWithValue.Count > 0 ? durationsWithValue.Average() : null;

        var dailyStats = views
            .GroupBy(v => v.Date)
            .Select(g => new DailyViewStat(
                DateOnly.FromDateTime(g.Key),
                g.Count(),
                g.Select(v => v.UserId).Distinct().Count()))
            .OrderBy(d => d.Date)
            .ToList();

        return ApiResult<PlaceAnalyticsResponse>.Ok(new PlaceAnalyticsResponse(
            totalViews,
            uniqueVisitors,
            avgDuration.HasValue ? Math.Round(avgDuration.Value, 1) : null,
            dailyStats));
    }
}
