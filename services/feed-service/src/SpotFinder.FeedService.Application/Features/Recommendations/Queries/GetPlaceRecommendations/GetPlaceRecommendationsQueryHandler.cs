using System.Diagnostics;
using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Recommendations.Dtos;
using SpotFinder.FeedService.Infrastructure.Configuration;
using SpotFinder.FeedService.Infrastructure.Persistence;
using SpotFinder.FeedService.Infrastructure.Services;

namespace SpotFinder.FeedService.Application.Features.Recommendations.Queries.GetPlaceRecommendations;

/// <summary>
/// Place recommendation handler — Phase 7.4.
///
/// Scoring formula:
///   total_score = interest_score + min(trend_score, TrendCap) + dwell_score
///
///   interest_score = SUM(user_interest[label] × label_weight)
///   dwell_score    = SUM(log(1 + durationMs / 1000))  [flag: dwell_scoring]
///   trend_score    = capped at runtime-configurable Recommendation:Trending:Cap
///
/// Feature flags (evaluated with optional targeting context):
///   dwell_scoring       → activates dwell score contribution
///   new_feed_algorithm  → activates 50%-cap diversity + Variant B label
///   advanced_cold_start → activates geo-diverse cold-start
///
/// Phase 7.4 additions:
///   • FlagEvaluationContext passed to all IsEnabledAsync calls.
///   • RecommendationConfigSnapshot attached to every response for debuggability.
///   • Snapshot logged with requestId, userId, variant for observability.
///
/// Cache: 60 s per user.
/// </summary>
public sealed class GetPlaceRecommendationsQueryHandler
    : IRequestHandler<GetPlaceRecommendationsQuery, ApiResult<PlaceRecommendationResponse>>
{
    private readonly FeedQueryDbContext _db;
    private readonly IMemoryCache       _cache;
    private readonly IOptions<RecommendationOptions> _options;
    private readonly IRuntimeConfigService  _rtConfig;
    private readonly IFeatureFlagService    _flags;
    private readonly ILogger<GetPlaceRecommendationsQueryHandler> _logger;

    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(60);

    public GetPlaceRecommendationsQueryHandler(
        FeedQueryDbContext db,
        IMemoryCache cache,
        IOptions<RecommendationOptions> options,
        IRuntimeConfigService rtConfig,
        IFeatureFlagService flags,
        ILogger<GetPlaceRecommendationsQueryHandler> logger)
    {
        _db       = db;
        _cache    = cache;
        _options  = options;
        _rtConfig = rtConfig;
        _flags    = flags;
        _logger   = logger;
    }

    public async Task<ApiResult<PlaceRecommendationResponse>> Handle(
        GetPlaceRecommendationsQuery request, CancellationToken ct)
    {
        var sw        = Stopwatch.StartNew();
        var pageSize  = Math.Clamp(request.PageSize, 1, 50);
        var requestId = Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N");

        // ── Phase 7.3/7.4: dynamic config + feature flags ─────────────────────
        // FlagEvaluationContext — Phase 7.4. The query doesn't yet carry country/platform,
        // so context is null here; targeting via userIds still works.
        FlagEvaluationContext? flagCtx = null;

        var trendCapTask      = _rtConfig.GetAsync("Recommendation:Trending:Cap",
                                    (decimal)_options.Value.Trending.Cap, ct);
        var diversityCapTask  = _rtConfig.GetAsync("Recommendation:DiversityMaxFraction", 0.5m, ct);
        var dwellFlagTask     = _flags.IsEnabledAsync("dwell_scoring",       request.UserId, flagCtx, ct);
        var newAlgoFlagTask   = _flags.IsEnabledAsync("new_feed_algorithm",  request.UserId, flagCtx, ct);
        var coldStartFlagTask = _flags.IsEnabledAsync("advanced_cold_start", request.UserId, flagCtx, ct);

        await Task.WhenAll(trendCapTask, diversityCapTask, dwellFlagTask, newAlgoFlagTask, coldStartFlagTask);

        var trendCap         = await trendCapTask;
        var diversityMaxFrac = Math.Clamp(await diversityCapTask, 0.1m, 1.0m);
        var dwellEnabled     = await dwellFlagTask;
        var newAlgoEnabled   = await newAlgoFlagTask;
        var advColdStart     = await coldStartFlagTask;
        var variant          = newAlgoEnabled ? "B" : "A";

        _logger.LogInformation(
            "GetPlaceRecommendations — requestId={ReqId} userId={UserId} pageSize={PageSize} " +
            "variant={Variant} trendCap={Cap} dwell={Dwell} advColdStart={ACS}",
            requestId, request.UserId, pageSize, variant, trendCap, dwellEnabled, advColdStart);

        var cacheKey = $"rec:places:{request.UserId}:{pageSize}";
        if (_cache.TryGetValue(cacheKey, out PlaceRecommendationResponse? cached))
        {
            _logger.LogInformation(
                "GetPlaceRecommendations — cache HIT requestId={ReqId} in {Ms}ms",
                requestId, sw.ElapsedMilliseconds);
            return ApiResult<PlaceRecommendationResponse>.Ok(cached!);
        }

        // ── STEP 1: User interest vector ─────────────────────────────────────
        var interests = await _db.UserInterests
            .Where(i => i.UserId == request.UserId)
            .Select(i => new { i.LabelId, i.Score })
            .ToListAsync(ct);

        var interestByLabel = interests.ToDictionary(i => i.LabelId, i => i.Score);

        List<Guid> candidatePlaceIds;
        bool isFallback = false;

        if (interestByLabel.Count > 0)
        {
            var labelIds = interestByLabel.Keys.ToList();
            candidatePlaceIds = await _db.PlaceLabels
                .Where(pl => labelIds.Contains(pl.LabelId))
                .Select(pl => pl.PlaceId)
                .Distinct()
                .ToListAsync(ct);
        }
        else
        {
            _logger.LogInformation(
                "GetPlaceRecommendations — cold start requestId={ReqId} advanced={Adv}",
                requestId, advColdStart);

            candidatePlaceIds = await BuildColdStartCandidatesAsync(pageSize, advColdStart, ct);
            isFallback = true;
        }

        if (candidatePlaceIds.Count == 0)
        {
            var snapshot0 = BuildSnapshot(requestId, variant, trendCap, diversityMaxFrac,
                                          dwellEnabled, newAlgoEnabled, advColdStart, isFallback: true);
            var empty = new PlaceRecommendationResponse([], snapshot0);
            _cache.Set(cacheKey, empty, CacheTtl);
            return ApiResult<PlaceRecommendationResponse>.Ok(empty);
        }

        // ── STEP 3: Bulk-load data ────────────────────────────────────────────
        var placeLabelsTask = _db.PlaceLabels
            .Where(pl => candidatePlaceIds.Contains(pl.PlaceId))
            .Select(pl => new { pl.PlaceId, pl.LabelId, pl.Weight })
            .ToListAsync(ct);

        var trendTask = _db.TrendingScores
            .Where(t => candidatePlaceIds.Contains(t.PlaceId))
            .Select(t => new { t.PlaceId, t.Score })
            .ToListAsync(ct);

        var nameTask = _db.PlaceTranslations
            .Where(t => candidatePlaceIds.Contains(t.PlaceId))
            .Select(t => new { t.PlaceId, t.LanguageId, t.Name })
            .ToListAsync(ct);

        Task<List<DwellEntry>> dwellTask = Task.FromResult(new List<DwellEntry>());
        if (dwellEnabled && !isFallback)
            dwellTask = LoadDwellScoresAsync(request.UserId, candidatePlaceIds, ct);

        await Task.WhenAll(placeLabelsTask, trendTask, nameTask, dwellTask);

        // ── STEP 4: Score aggregation ─────────────────────────────────────────
        var trendByPlace = trendTask.Result.ToDictionary(
            t => t.PlaceId,
            t => Math.Min(t.Score, trendCap));

        var dwellByPlace = dwellTask.Result.ToDictionary(
            d => d.PlaceId,
            d => d.NormalizedDwell);

        var nameByPlace = nameTask.Result
            .GroupBy(t => t.PlaceId)
            .ToDictionary(
                g => g.Key,
                g => (g.FirstOrDefault(t => t.LanguageId == 1) ?? g.First()).Name);

        var allPlaceScores = placeLabelsTask.Result
            .GroupBy(pl => pl.PlaceId)
            .Select(g =>
            {
                var placeId       = g.Key;
                var interestScore = isFallback ? 0m
                    : g.Sum(pl => interestByLabel.GetValueOrDefault(pl.LabelId, 0m) * pl.Weight);
                var trendScore    = trendByPlace.GetValueOrDefault(placeId, 0m);
                var dwellScore    = dwellByPlace.GetValueOrDefault(placeId, 0m);
                var totalScore    = interestScore + trendScore + dwellScore;
                var dominantLabel = g.OrderByDescending(pl => pl.Weight).First().LabelId;
                return (PlaceId: placeId, InterestScore: interestScore, TrendScore: trendScore,
                        DwellScore: dwellScore, TotalScore: totalScore, DominantLabel: dominantLabel);
            })
            .OrderByDescending(x => x.TotalScore)
            .ToList();

        // ── Diversity filter ──────────────────────────────────────────────────
        var maxPerLabel = newAlgoEnabled
            ? Math.Max(1, (int)Math.Ceiling(pageSize * (double)diversityMaxFrac))
            : 3;

        var placeScores = allPlaceScores
            .GroupBy(x => x.DominantLabel)
            .SelectMany(g => g.Take(maxPerLabel))
            .OrderByDescending(x => x.TotalScore)
            .Take(pageSize)
            .ToList();

        if (placeScores.Count == 0 && isFallback)
        {
            placeScores = trendTask.Result
                .OrderByDescending(t => t.Score)
                .Take(pageSize)
                .Select(t => (
                    PlaceId: t.PlaceId,
                    InterestScore: 0m,
                    TrendScore: Math.Min(t.Score, trendCap),
                    DwellScore: 0m,
                    TotalScore: Math.Min(t.Score, trendCap),
                    DominantLabel: 0))
                .ToList();
        }

        // ── STEP 5: Build response + snapshot ─────────────────────────────────
        var dtos = placeScores.Select(x => new PlaceRecommendationDto(
            x.PlaceId,
            nameByPlace.GetValueOrDefault(x.PlaceId, string.Empty),
            x.InterestScore,
            x.TrendScore,
            x.TotalScore
        )).ToList();

        var snapshot = BuildSnapshot(requestId, variant, trendCap, diversityMaxFrac,
                                     dwellEnabled, newAlgoEnabled, advColdStart, isFallback);

        // ── Phase 7.4: Log the model snapshot for observability ───────────────
        _logger.LogInformation(
            "RecSnapshot — requestId={ReqId} userId={UserId} variant={Variant} " +
            "trendCap={Cap} diversityFrac={Div} dwell={Dwell} maxPerLabel={Max} " +
            "count={Count} fallback={Fallback} in {Ms}ms",
            requestId, request.UserId, variant, trendCap, diversityMaxFrac,
            dwellEnabled, maxPerLabel, dtos.Count, isFallback, sw.ElapsedMilliseconds);

        var response = new PlaceRecommendationResponse(dtos, snapshot);
        _cache.Set(cacheKey, response, CacheTtl);

        return ApiResult<PlaceRecommendationResponse>.Ok(response);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static RecommendationConfigSnapshot BuildSnapshot(
        string requestId, string variant, decimal trendCap, decimal diversityMaxFrac,
        bool dwellEnabled, bool newAlgoEnabled, bool advColdStart, bool isFallback)
        => new(requestId, variant, trendCap, diversityMaxFrac,
               dwellEnabled, newAlgoEnabled, advColdStart, isFallback);

    private async Task<List<Guid>> BuildColdStartCandidatesAsync(
        int pageSize, bool advColdStart, CancellationToken ct)
    {
        var poolSize = pageSize * 4;

        if (!advColdStart)
        {
            return await _db.TrendingScores
                .Where(t => t.Score > 0)
                .OrderByDescending(t => t.Score)
                .Take(poolSize)
                .Select(t => t.PlaceId)
                .ToListAsync(ct);
        }

        var trendingIds = await _db.TrendingScores
            .Where(t => t.Score > 0)
            .OrderByDescending(t => t.Score)
            .Take(poolSize)
            .Select(t => t.PlaceId)
            .ToListAsync(ct);

        if (trendingIds.Count == 0) return trendingIds;

        var cityById = await _db.Places
            .Where(p => trendingIds.Contains(p.Id))
            .Select(p => new { p.Id, p.CityId })
            .ToListAsync(ct);

        var cityMap    = cityById.ToDictionary(p => p.Id, p => p.CityId ?? 0);
        int maxPerCity = Math.Max(1, (int)Math.Ceiling(pageSize * 0.5));
        var cityCounts = new Dictionary<int, int>();
        var result     = new List<Guid>(pageSize);

        foreach (var placeId in trendingIds)
        {
            if (result.Count >= pageSize) break;
            var city = cityMap.GetValueOrDefault(placeId, 0);
            cityCounts.TryGetValue(city, out var count);
            if (count >= maxPerCity) continue;
            cityCounts[city] = count + 1;
            result.Add(placeId);
        }

        if (result.Count < pageSize)
        {
            foreach (var placeId in trendingIds)
            {
                if (result.Count >= pageSize) break;
                if (!result.Contains(placeId)) result.Add(placeId);
            }
        }

        return result;
    }

    private async Task<List<DwellEntry>> LoadDwellScoresAsync(
        Guid userId, List<Guid> placeIds, CancellationToken ct)
    {
        var events = await _db.UserEvents
            .AsNoTracking()
            .Where(e => e.UserId    == userId
                     && e.EventType == "dwell"
                     && e.PlaceId   != null
                     && placeIds.Contains(e.PlaceId!.Value))
            .Select(e => new { e.PlaceId, e.Payload })
            .ToListAsync(ct);

        return events
            .Where(e => e.PlaceId.HasValue && e.Payload != null)
            .GroupBy(e => e.PlaceId!.Value)
            .Select(g =>
            {
                var totalNorm = g.Sum(e =>
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(e.Payload!);
                        if (doc.RootElement.TryGetProperty("durationMs", out var el))
                            return Math.Log(1.0 + el.GetDouble() / 1000.0);
                    }
                    catch { /* malformed — skip */ }
                    return 0.0;
                });
                return new DwellEntry(g.Key, (decimal)totalNorm);
            })
            .ToList();
    }

    private sealed record DwellEntry(Guid PlaceId, decimal NormalizedDwell);
}
