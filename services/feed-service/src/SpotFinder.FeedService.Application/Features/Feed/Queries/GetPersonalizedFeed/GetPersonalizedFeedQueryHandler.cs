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

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetPersonalizedFeed;

/// <summary>
/// Personalized feed handler — Phase 7.2.
///
/// Scoring model:
///   final_score = feed_score
///               + (log(1 + interest_score) × 2)    ← log-normalised (when InterestLogScale = true)
///               + min(trend_score, Trending:Cap)    ← capped (Phase 7.2)
///
/// Phase 7.2 changes:
///   • trending score contribution is capped at Recommendation:Trending:Cap (default 200)
///   • log-normalisation is configurable via Recommendation:InterestLogScale
///
/// DB strategy:
///   1. Load user interests in memory (label_id → score).
///   2. Resolve interested place IDs from label.place_labels.
///   3. Fetch candidate posts using feed_score-based cursor (DB-sortable proxy).
///      Oversample × 3 to survive the diversity filter.
///   4. Bulk-load trending scores + place-label mappings for the returned posts.
///   5. Re-rank by final_score in memory.
///   6. Apply diversity (max 2 per user), take pageSize.
///   7. Cache first page (30 s TTL) per user.
///
/// Cold start: user has no interests → fall back to global top posts by feed_score.
/// </summary>
public sealed class GetPersonalizedFeedQueryHandler
    : IRequestHandler<GetPersonalizedFeedQuery, ApiResult<FeedResponse>>
{
    private readonly FeedQueryDbContext _db;
    private readonly IMemoryCache       _cache;
    private readonly IOptions<RecommendationOptions> _options;
    private readonly ILogger<GetPersonalizedFeedQueryHandler> _logger;

    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);
    private const int OversampleFactor = 3;

    private sealed record PostProjection(
        Guid     Id,
        Guid     UserId,
        Guid     PlaceId,
        string?  Caption,
        int      LikeCount,
        int      CommentCount,
        DateTime CreatedAt,
        int      FeedScore);

    public GetPersonalizedFeedQueryHandler(
        FeedQueryDbContext db,
        IMemoryCache cache,
        IOptions<RecommendationOptions> options,
        ILogger<GetPersonalizedFeedQueryHandler> logger)
    {
        _db      = db;
        _cache   = cache;
        _options = options;
        _logger  = logger;
    }

    public async Task<ApiResult<FeedResponse>> Handle(
        GetPersonalizedFeedQuery request, CancellationToken ct)
    {
        var sw       = Stopwatch.StartNew();
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var hasCursor = request.CursorScore.HasValue
                     && request.CursorCreatedAt.HasValue
                     && request.CursorPostId.HasValue;
        var opts     = _options.Value;

        _logger.LogInformation(
            "GetPersonalizedFeed — userId={UserId} pageSize={PageSize} hasCursor={HasCursor} trendCap={Cap}",
            request.UserId, pageSize, hasCursor, opts.Trending.Cap);

        var cacheKey = $"feed:personalized:{request.UserId}:{pageSize}";
        if (!hasCursor && _cache.TryGetValue(cacheKey, out FeedResponse? cached))
        {
            _logger.LogInformation(
                "GetPersonalizedFeed — cache HIT key={Key} in {Ms}ms", cacheKey, sw.ElapsedMilliseconds);
            return ApiResult<FeedResponse>.Ok(cached!);
        }
        _logger.LogInformation("GetPersonalizedFeed — cache MISS key={Key}", cacheKey);

        // ── STEP 1: Load this user's interest vector ──────────────────────────
        var interests = await _db.UserInterests
            .Where(i => i.UserId == request.UserId)
            .Select(i => new { i.LabelId, i.Score })
            .ToListAsync(ct);

        var interestByLabel = interests.ToDictionary(i => i.LabelId, i => i.Score);

        var cs  = request.CursorScore     ?? 0;
        var cAt = request.CursorCreatedAt ?? DateTime.MinValue;
        var cId = request.CursorPostId    ?? Guid.Empty;

        List<PostProjection> candidates;
        bool isFallback = false;

        if (interests.Count > 0)
        {
            // ── STEP 2a: Resolve place IDs matching user's labels ─────────────
            var labelIds = interestByLabel.Keys.ToList();

            var interestedPlaceIds = await _db.PlaceLabels
                .Where(pl => labelIds.Contains(pl.LabelId))
                .Select(pl => pl.PlaceId)
                .Distinct()
                .ToListAsync(ct);

            // ── STEP 2b: Fetch candidate posts from those places ──────────────
            candidates = await _db.Posts
                .Where(p => interestedPlaceIds.Contains(p.PlaceId))
                .Where(p => !hasCursor
                            || p.FeedScore < cs
                            || (p.FeedScore == cs && p.CreatedAt < cAt)
                            || (p.FeedScore == cs && p.CreatedAt == cAt && p.Id < cId))
                .OrderByDescending(p => p.FeedScore)
                .ThenByDescending(p => p.CreatedAt)
                .ThenByDescending(p => p.Id)
                .Take(pageSize * OversampleFactor)
                .Select(p => new PostProjection(
                    p.Id, p.UserId, p.PlaceId,
                    p.Caption, p.LikeCount, p.CommentCount, p.CreatedAt, p.FeedScore))
                .ToListAsync(ct);
        }
        else
        {
            // ── Cold start: no interests yet → global top posts ───────────────
            _logger.LogInformation(
                "GetPersonalizedFeed — cold start fallback for userId={UserId}", request.UserId);

            candidates = await _db.Posts
                .Where(p => !hasCursor
                            || p.FeedScore < cs
                            || (p.FeedScore == cs && p.CreatedAt < cAt)
                            || (p.FeedScore == cs && p.CreatedAt == cAt && p.Id < cId))
                .OrderByDescending(p => p.FeedScore)
                .ThenByDescending(p => p.CreatedAt)
                .ThenByDescending(p => p.Id)
                .Take(pageSize * OversampleFactor)
                .Select(p => new PostProjection(
                    p.Id, p.UserId, p.PlaceId,
                    p.Caption, p.LikeCount, p.CommentCount, p.CreatedAt, p.FeedScore))
                .ToListAsync(ct);

            isFallback = true;
        }

        if (candidates.Count == 0)
        {
            var empty = new FeedResponse([], null, HasMore: false);
            if (!hasCursor) _cache.Set(cacheKey, empty, CacheTtl);
            return ApiResult<FeedResponse>.Ok(empty);
        }

        var postIds  = candidates.Select(p => p.Id).ToList();
        var userIds  = candidates.Select(p => p.UserId).Distinct().ToList();
        var placeIds = candidates.Select(p => p.PlaceId).Distinct().ToList();

        // ── STEP 3: Six parallel bulk loads ───────────────────────────────────
        var mediaTask = _db.PostMedia
            .Where(m => postIds.Contains(m.PostId))
            .Select(m => new { m.PostId, m.Url })
            .ToListAsync(ct);

        var userTask = (
            from u in _db.Users
            where userIds.Contains(u.Id)
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
            .Where(t => placeIds.Contains(t.PlaceId))
            .Select(t => new { t.PlaceId, t.LanguageId, t.Name })
            .ToListAsync(ct);

        var likedTask = _db.PostLikes
            .Where(l => l.UserId == request.UserId && postIds.Contains(l.PostId))
            .Select(l => l.PostId)
            .ToListAsync(ct);

        var trendTask = _db.TrendingScores
            .Where(t => placeIds.Contains(t.PlaceId))
            .Select(t => new { t.PlaceId, t.Score })
            .ToListAsync(ct);

        var placeLabelTask = _db.PlaceLabels
            .Where(pl => placeIds.Contains(pl.PlaceId))
            .Select(pl => new { pl.PlaceId, pl.LabelId })
            .ToListAsync(ct);

        await Task.WhenAll(mediaTask, userTask, placeTask, likedTask, trendTask, placeLabelTask);

        // ── STEP 4: In-memory scoring ─────────────────────────────────────────
        //
        // Phase 7.2:
        //   trend_score is capped at Trending:Cap before being added.
        //   log-normalisation is toggled by InterestLogScale config.
        //
        // final_score = feed_score
        //             + (log(1 + interest_score) × 2)
        //             + min(trend_score, trendCap)

        var trendCap     = opts.Trending.Cap;
        var trendByPlace = trendTask.Result.ToDictionary(
            t => t.PlaceId,
            t => Math.Min(t.Score, trendCap));

        var labelsByPlace = placeLabelTask.Result
            .GroupBy(pl => pl.PlaceId)
            .ToDictionary(g => g.Key, g => g.Select(pl => pl.LabelId).ToList());

        var scored = candidates.Select(p =>
        {
            var labels       = labelsByPlace.GetValueOrDefault(p.PlaceId, []);
            var rawInterest  = labels.Sum(lid => interestByLabel.GetValueOrDefault(lid, 0m));
            var normInterest = opts.InterestLogScale
                ? (decimal)Math.Log(1 + (double)rawInterest)
                : rawInterest;
            var trendScore   = trendByPlace.GetValueOrDefault(p.PlaceId, 0m);
            return (Post: p, FinalScore: (decimal)p.FeedScore + normInterest * 2m + trendScore);
        });

        // Sort by final_score, apply diversity (max 2 posts per author), take page
        var posts = scored
            .OrderByDescending(x => x.FinalScore)
            .ThenByDescending(x => x.Post.CreatedAt)
            .ThenByDescending(x => x.Post.Id)
            .GroupBy(x => x.Post.UserId)
            .SelectMany(g => g.Take(2))
            .OrderByDescending(x => x.FinalScore)
            .ThenByDescending(x => x.Post.CreatedAt)
            .ThenByDescending(x => x.Post.Id)
            .Take(pageSize)
            .ToList();

        // ── STEP 5: Project to DTOs ───────────────────────────────────────────
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

        var dtos = posts.Select(x =>
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

        // ── STEP 6: Cursor + cache ────────────────────────────────────────────
        var last     = posts[^1].Post;
        var cursor   = new FeedCursor(last.FeedScore, last.CreatedAt, last.Id);
        var hasMore  = !isFallback && posts.Count == pageSize;
        var response = new FeedResponse(dtos, hasMore ? cursor : null, hasMore);

        if (!hasCursor) _cache.Set(cacheKey, response, CacheTtl);

        sw.Stop();
        _logger.LogInformation(
            "GetPersonalizedFeed — {Count} posts, hasMore={HasMore}, fallback={Fallback}, trendCap={Cap} in {Ms}ms",
            dtos.Count, hasMore, isFallback, trendCap, sw.ElapsedMilliseconds);

        return ApiResult<FeedResponse>.Ok(response);
    }
}
