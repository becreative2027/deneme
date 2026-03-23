using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Feed.Queries.Common;
using SpotFinder.FeedService.Infrastructure.Configuration;
using SpotFinder.FeedService.Infrastructure.Persistence;
using System.Diagnostics;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetExploreFeed;

/// <summary>
/// Explore feed — Phase 7.2.
///
/// Source split (configurable via Recommendation:ExploreBlend):
///   Variant A (default) — 50% personalized / 30% trending / 20% discovery
///   Variant B           — 40% personalized / 40% trending / 20% discovery
///
/// Variant assignment: hash(userId) % 2 → deterministic per user.
///
/// Scoring formula (§7.1-5):
///   final_score = feed_score
///               + (log(1 + interest_score) × 2)   ← log-normalised (Variant A)
///               + min(trend_score, Trending:Cap)   ← capped (Phase 7.2)
///
///   Variant B uses a lower interest multiplier (×1.5) to reduce
///   personalisation and surface more trending content.
///
/// Diversity: max 2 posts per author across the merged set.
/// Cache: 30 s per user (no cursor — always a fresh blend).
/// </summary>
public sealed class GetExploreFeedQueryHandler
    : IRequestHandler<GetExploreFeedQuery, ApiResult<FeedResponse>>
{
    private readonly FeedQueryDbContext _db;
    private readonly IMemoryCache       _cache;
    private readonly IOptions<RecommendationOptions> _options;
    private readonly ILogger<GetExploreFeedQueryHandler> _logger;

    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    private sealed record PostProjection(
        Guid     Id,
        Guid     UserId,
        Guid     PlaceId,
        string?  Caption,
        int      LikeCount,
        int      CommentCount,
        DateTime CreatedAt,
        int      FeedScore);

    public GetExploreFeedQueryHandler(
        FeedQueryDbContext db,
        IMemoryCache cache,
        IOptions<RecommendationOptions> options,
        ILogger<GetExploreFeedQueryHandler> logger)
    {
        _db      = db;
        _cache   = cache;
        _options = options;
        _logger  = logger;
    }

    public async Task<ApiResult<FeedResponse>> Handle(
        GetExploreFeedQuery request, CancellationToken ct)
    {
        var sw       = Stopwatch.StartNew();
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var opts     = _options.Value;

        // ── A/B variant assignment ─────────────────────────────────────────────
        // Deterministic per user: same user always gets the same variant.
        var variant = (request.UserId.GetHashCode() & 1) == 0 ? "A" : "B";
        var blend   = variant == "B" ? opts.ExploreBlendVariantB : opts.ExploreBlend;

        // Validate blend (also checked at startup via PostConfigure, but defensive here)
        if (!blend.IsValid(out _))
        {
            _logger.LogWarning(
                "GetExploreFeed — blend for variant={Variant} is invalid; falling back to defaults",
                variant);
            blend = new RecommendationOptions.ExploreBlendOptions();
        }

        _logger.LogInformation(
            "GetExploreFeed — userId={UserId} pageSize={PageSize} variant={Variant} " +
            "blend=[{P:P0}/{T:P0}/{D:P0}]",
            request.UserId, pageSize, variant,
            blend.Personalized, blend.Trending, blend.Discovery);

        var cacheKey = $"feed:explore:{request.UserId}:{pageSize}:{variant}";
        if (_cache.TryGetValue(cacheKey, out FeedResponse? cached))
        {
            _logger.LogInformation(
                "GetExploreFeed — cache HIT key={Key} in {Ms}ms", cacheKey, sw.ElapsedMilliseconds);
            return ApiResult<FeedResponse>.Ok(cached!);
        }
        _logger.LogInformation("GetExploreFeed — cache MISS key={Key}", cacheKey);

        // ── Slot allocation from config ────────────────────────────────────────
        var personalizedSlots = (int)Math.Ceiling(pageSize * blend.Personalized);
        var trendingSlots     = (int)Math.Ceiling(pageSize * blend.Trending);
        var discoverySlots    = Math.Max(1, pageSize - personalizedSlots - trendingSlots);

        // ── STEP 1: User interest vector + trending place IDs (parallel) ───────
        var interestTask = _db.UserInterests
            .Where(i => i.UserId == request.UserId)
            .Select(i => new { i.LabelId, i.Score })
            .ToListAsync(ct);

        var trendingPlacesTask = _db.TrendingScores
            .Where(t => t.Score > 0)
            .OrderByDescending(t => t.Score)
            .Take(50)
            .Select(t => new { t.PlaceId, t.Score })
            .ToListAsync(ct);

        await Task.WhenAll(interestTask, trendingPlacesTask);

        var interestByLabel  = interestTask.Result.ToDictionary(i => i.LabelId, i => i.Score);
        var trendByPlaceRaw  = trendingPlacesTask.Result.ToDictionary(t => t.PlaceId, t => t.Score);
        var trendingPlaceIds = trendingPlacesTask.Result.Select(t => t.PlaceId).ToList();

        // Over-fetch 2× each slot so deduplication leaves enough posts
        var personalizedFetch = personalizedSlots * 2;
        var trendingFetch     = trendingSlots     * 2;
        var discoveryFetch    = discoverySlots    * 2;

        // ── STEP 2a: Personalized posts (personalized-slot) ───────────────────
        List<PostProjection> personalizedPosts = [];
        if (interestByLabel.Count > 0)
        {
            var labelIds = interestByLabel.Keys.ToList();
            var interestedPlaceIds = await _db.PlaceLabels
                .Where(pl => labelIds.Contains(pl.LabelId))
                .Select(pl => pl.PlaceId)
                .Distinct()
                .ToListAsync(ct);

            if (interestedPlaceIds.Count > 0)
            {
                personalizedPosts = await _db.Posts
                    .Where(p => interestedPlaceIds.Contains(p.PlaceId))
                    .OrderByDescending(p => p.FeedScore)
                    .ThenByDescending(p => p.CreatedAt)
                    .Take(personalizedFetch)
                    .Select(p => new PostProjection(
                        p.Id, p.UserId, p.PlaceId,
                        p.Caption, p.LikeCount, p.CommentCount, p.CreatedAt, p.FeedScore))
                    .ToListAsync(ct);
            }
        }

        // ── STEP 2b: Trending posts (trending-slot) ───────────────────────────
        var seenIds = personalizedPosts.Select(p => p.Id).ToHashSet();

        List<PostProjection> trendingPosts = [];
        if (trendingPlaceIds.Count > 0)
        {
            var rawTrending = await _db.Posts
                .Where(p => trendingPlaceIds.Contains(p.PlaceId))
                .OrderByDescending(p => p.FeedScore)
                .ThenByDescending(p => p.CreatedAt)
                .Take(trendingFetch)
                .Select(p => new PostProjection(
                    p.Id, p.UserId, p.PlaceId,
                    p.Caption, p.LikeCount, p.CommentCount, p.CreatedAt, p.FeedScore))
                .ToListAsync(ct);

            foreach (var p in rawTrending)
            {
                if (seenIds.Add(p.Id)) trendingPosts.Add(p);
            }
        }

        // ── STEP 2c: Discovery posts (discovery-slot — fresh / low-hype) ─────
        var rawDiscovery = await _db.Posts
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Take(discoveryFetch * 3)   // wider net; many will already be seen
            .Select(p => new PostProjection(
                p.Id, p.UserId, p.PlaceId,
                p.Caption, p.LikeCount, p.CommentCount, p.CreatedAt, p.FeedScore))
            .ToListAsync(ct);

        var discoveryPosts = new List<PostProjection>();
        foreach (var p in rawDiscovery)
        {
            if (seenIds.Add(p.Id)) discoveryPosts.Add(p);
            if (discoveryPosts.Count >= discoveryFetch) break;
        }

        // ── STEP 2d: Merge all three sources ─────────────────────────────────
        var merged = new List<PostProjection>(
            personalizedPosts.Count + trendingPosts.Count + discoveryPosts.Count);
        merged.AddRange(personalizedPosts);
        merged.AddRange(trendingPosts);
        merged.AddRange(discoveryPosts);

        if (merged.Count == 0)
        {
            var empty = new FeedResponse([], null, HasMore: false);
            _cache.Set(cacheKey, empty, CacheTtl);
            return ApiResult<FeedResponse>.Ok(empty);
        }

        // ── STEP 3: Bulk-load secondary data ─────────────────────────────────
        var allPlaceIds = merged.Select(p => p.PlaceId).Distinct().ToList();
        var allPostIds  = merged.Select(p => p.Id).ToList();
        var allUserIds  = merged.Select(p => p.UserId).Distinct().ToList();

        var mediaTask = _db.PostMedia
            .Where(m => allPostIds.Contains(m.PostId))
            .Select(m => new { m.PostId, m.Url })
            .ToListAsync(ct);

        var userTask = (
            from u in _db.Users
            where allUserIds.Contains(u.Id)
            join pr in _db.UserProfiles on u.Id equals pr.UserId into prg
            from pr in prg.DefaultIfEmpty()
            select new
            {
                u.Id, u.Username,
                DisplayName     = pr != null ? pr.DisplayName     : null,
                ProfileImageUrl = pr != null ? pr.ProfileImageUrl : null
            }
        ).ToListAsync(ct);

        var placeTask = _db.PlaceTranslations
            .Where(t => allPlaceIds.Contains(t.PlaceId))
            .Select(t => new { t.PlaceId, t.LanguageId, t.Name })
            .ToListAsync(ct);

        var likedTask = _db.PostLikes
            .Where(l => l.UserId == request.UserId && allPostIds.Contains(l.PostId))
            .Select(l => l.PostId)
            .ToListAsync(ct);

        var placeLabelTask = _db.PlaceLabels
            .Where(pl => allPlaceIds.Contains(pl.PlaceId))
            .Select(pl => new { pl.PlaceId, pl.LabelId })
            .ToListAsync(ct);

        await Task.WhenAll(mediaTask, userTask, placeTask, likedTask, placeLabelTask);

        // ── STEP 4: Score + rank + diversity ─────────────────────────────────
        //
        // Phase 7.2 changes:
        //   • trend_score is capped at Trending:Cap (default 200)
        //   • Variant B uses interest multiplier ×1.5 instead of ×2
        //
        // final_score = feed_score
        //             + (log(1 + interest_score) × interestMultiplier)
        //             + min(trend_score, trendCap)

        var trendCap          = opts.Trending.Cap;
        var interestMultiplier = variant == "B" ? 1.5m : 2.0m;

        var labelsByPlace = placeLabelTask.Result
            .GroupBy(pl => pl.PlaceId)
            .ToDictionary(g => g.Key, g => g.Select(pl => pl.LabelId).ToList());

        // Apply trending cap (raw scores come from the pre-loaded dict)
        var trendByPlace = trendByPlaceRaw.ToDictionary(
            kv => kv.Key,
            kv => Math.Min(kv.Value, trendCap));

        var ranked = merged
            .Select(p =>
            {
                var labels        = labelsByPlace.GetValueOrDefault(p.PlaceId, []);
                var rawInterest   = labels.Sum(lid => interestByLabel.GetValueOrDefault(lid, 0m));
                var normInterest  = opts.InterestLogScale
                    ? (decimal)Math.Log(1 + (double)rawInterest)
                    : rawInterest;
                var trendScore    = trendByPlace.GetValueOrDefault(p.PlaceId, 0m);
                var finalScore    = (decimal)p.FeedScore + normInterest * interestMultiplier + trendScore;
                return (Post: p, FinalScore: finalScore);
            })
            .OrderByDescending(x => x.FinalScore)
            .ThenByDescending(x => x.Post.CreatedAt)
            .ThenByDescending(x => x.Post.Id)
            .GroupBy(x => x.Post.UserId)
            .SelectMany(g => g.Take(2))           // max 2 per author
            .OrderByDescending(x => x.FinalScore)
            .ThenByDescending(x => x.Post.CreatedAt)
            .ThenByDescending(x => x.Post.Id)
            .Take(pageSize)
            .ToList();

        // ── STEP 5: Project DTOs ──────────────────────────────────────────────
        var mediaByPost = mediaTask.Result
            .GroupBy(m => m.PostId)
            .ToDictionary(g => g.Key,
                          g => (IReadOnlyList<string>)g.Select(m => m.Url).ToList());

        var userById = userTask.Result.ToDictionary(u => u.Id);

        var nameByPlace = placeTask.Result
            .GroupBy(t => t.PlaceId)
            .ToDictionary(
                g => g.Key,
                g => (g.FirstOrDefault(t => t.LanguageId == 1) ?? g.First()).Name);

        var likedSet = likedTask.Result.ToHashSet();

        var dtos = ranked.Select(x =>
        {
            var p = x.Post;
            userById.TryGetValue(p.UserId, out var u);
            return new FeedPostDto(
                p.Id,
                new FeedUserDto(p.UserId,
                    u?.Username ?? string.Empty,
                    u?.DisplayName,
                    u?.ProfileImageUrl),
                new FeedPlaceDto(p.PlaceId,
                    nameByPlace.GetValueOrDefault(p.PlaceId, string.Empty)),
                p.Caption,
                mediaByPost.GetValueOrDefault(p.Id, []),
                p.LikeCount,
                p.CommentCount,
                p.CreatedAt,
                likedSet.Contains(p.Id));
        }).ToList();

        // Explore has no cursor — it's always a fresh blend
        var response = new FeedResponse(dtos, NextCursor: null, HasMore: false);
        _cache.Set(cacheKey, response, CacheTtl);

        sw.Stop();
        _logger.LogInformation(
            "GetExploreFeed — {Count} posts variant={Variant} " +
            "(personalized={P} trending={T} discovery={D}) trendCap={Cap} in {Ms}ms",
            dtos.Count, variant,
            personalizedPosts.Count, trendingPosts.Count, discoveryPosts.Count,
            trendCap, sw.ElapsedMilliseconds);

        return ApiResult<FeedResponse>.Ok(response);
    }
}
