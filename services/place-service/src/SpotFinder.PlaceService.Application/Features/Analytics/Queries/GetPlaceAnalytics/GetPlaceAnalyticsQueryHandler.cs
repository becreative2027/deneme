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
        var hourlyMode = request.Hours > 0;

        DateTime since = hourlyMode
            ? DateTime.UtcNow.AddHours(-Math.Clamp(request.Hours, 1, 48))
            : DateTime.UtcNow.AddDays(-Math.Clamp(request.Days, 1, 365)).Date;

        var views = await db.PlaceViews
            .Where(v => v.PlaceId == request.PlaceId && v.CreatedAt >= since)
            .Select(v => new { v.UserId, v.DurationSeconds, v.CreatedAt })
            .ToListAsync(ct);

        var totalViews     = views.Count;
        var uniqueVisitors = views.Select(v => v.UserId).Distinct().Count();
        var withDuration   = views.Where(v => v.DurationSeconds.HasValue).Select(v => v.DurationSeconds!.Value).ToList();
        double? avgDuration = withDuration.Count > 0 ? Math.Round(withDuration.Average(), 1) : null;

        // ── Daily stats ───────────────────────────────────────────────────────
        var dailyStats = hourlyMode
            ? (IReadOnlyList<DailyViewStat>)[]
            : views
                .GroupBy(v => v.CreatedAt.Date)
                .Select(g => new DailyViewStat(
                    DateOnly.FromDateTime(g.Key),
                    g.Count(),
                    g.Select(v => v.UserId).Distinct().Count()))
                .OrderBy(d => d.Date)
                .ToList();

        // ── Hourly stats ──────────────────────────────────────────────────────
        var hourlyStats = !hourlyMode
            ? (IReadOnlyList<HourlyViewStat>)[]
            : views
                .GroupBy(v => new DateTime(
                    v.CreatedAt.Year, v.CreatedAt.Month, v.CreatedAt.Day,
                    v.CreatedAt.Hour, 0, 0, DateTimeKind.Utc))
                .Select(g =>
                {
                    var durList = g.Where(v => v.DurationSeconds.HasValue)
                                   .Select(v => v.DurationSeconds!.Value)
                                   .ToList();
                    return new HourlyViewStat(
                        g.Key,
                        g.Count(),
                        g.Select(v => v.UserId).Distinct().Count(),
                        durList.Count > 0 ? Math.Round(durList.Average(), 1) : null);
                })
                .OrderBy(h => h.Hour)
                .ToList();

        return ApiResult<PlaceAnalyticsResponse>.Ok(new PlaceAnalyticsResponse(
            totalViews,
            uniqueVisitors,
            avgDuration,
            dailyStats,
            hourlyStats));
    }
}
