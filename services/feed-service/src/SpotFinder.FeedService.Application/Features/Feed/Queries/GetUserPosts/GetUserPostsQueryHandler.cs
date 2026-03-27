using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Feed.Queries.Common;
using SpotFinder.FeedService.Infrastructure.Persistence;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetUserPosts;

public sealed class GetUserPostsQueryHandler
    : IRequestHandler<GetUserPostsQuery, ApiResult<FeedResponse>>
{
    private readonly FeedQueryDbContext _db;

    public GetUserPostsQueryHandler(FeedQueryDbContext db) => _db = db;

    public async Task<ApiResult<FeedResponse>> Handle(
        GetUserPostsQuery request, CancellationToken ct)
    {
        var pageSize  = Math.Clamp(request.PageSize, 1, 50);
        var hasCursor = request.CursorScore.HasValue
                     && request.CursorCreatedAt.HasValue
                     && request.CursorPostId.HasValue;

        var cs  = request.CursorScore     ?? 0;
        var cAt = request.CursorCreatedAt ?? DateTime.MinValue;
        var cId = request.CursorPostId    ?? Guid.Empty;

        var rawPosts = await _db.Posts
            .Where(p => p.UserId == request.TargetUserId)
            .Where(p => !hasCursor
                     || p.FeedScore < cs
                     || (p.FeedScore == cs && p.CreatedAt < cAt)
                     || (p.FeedScore == cs && p.CreatedAt == cAt && p.Id < cId))
            .OrderByDescending(p => p.FeedScore)
            .ThenByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Take(pageSize + 1)
            .Select(p => new { p.Id, p.UserId, p.PlaceId, p.Caption, p.LikeCount, p.CommentCount, p.CreatedAt, p.FeedScore })
            .ToListAsync(ct);

        if (rawPosts.Count == 0)
            return ApiResult<FeedResponse>.Ok(new FeedResponse([], null, HasMore: false));

        var hasMore = rawPosts.Count > pageSize;
        var posts   = rawPosts.Take(pageSize).ToList();

        var postIds  = posts.Select(p => p.Id).ToList();
        var placeIds = posts.Select(p => p.PlaceId).Distinct().ToList();

        var mediaList = await _db.PostMedia
            .Where(m => postIds.Contains(m.PostId))
            .Select(m => new { m.PostId, m.Url })
            .ToListAsync(ct);

        var userRow = await (
            from u in _db.Users
            where u.Id == request.TargetUserId
            join pr in _db.UserProfiles on u.Id equals pr.UserId into prg
            from pr in prg.DefaultIfEmpty()
            select new
            {
                u.Id, u.Username,
                DisplayName     = pr != null ? pr.DisplayName     : null,
                ProfileImageUrl = pr != null ? pr.ProfileImageUrl : null
            }
        ).FirstOrDefaultAsync(ct);

        var placeList = await _db.PlaceTranslations
            .Where(t => placeIds.Contains(t.PlaceId))
            .Select(t => new { t.PlaceId, t.LanguageId, t.Name })
            .ToListAsync(ct);

        var likedSet = (await _db.PostLikes
            .Where(l => l.UserId == request.RequestingUserId && postIds.Contains(l.PostId))
            .Select(l => l.PostId)
            .ToListAsync(ct)).ToHashSet();

        var mediaByPost = mediaList
            .GroupBy(m => m.PostId)
            .ToDictionary(g => g.Key,
                          g => (IReadOnlyList<string>)g.Select(m => m.Url).ToList());

        var nameByPlace = placeList
            .GroupBy(t => t.PlaceId)
            .ToDictionary(
                g => g.Key,
                g => (g.FirstOrDefault(t => t.LanguageId == 1) ?? g.First()).Name);

        var dtos = posts.Select(p => new FeedPostDto(
            p.Id,
            new FeedUserDto(p.UserId,
                userRow?.Username ?? string.Empty,
                userRow?.DisplayName,
                userRow?.ProfileImageUrl),
            new FeedPlaceDto(p.PlaceId,
                nameByPlace.GetValueOrDefault(p.PlaceId, string.Empty)),
            p.Caption,
            mediaByPost.GetValueOrDefault(p.Id, []),
            p.LikeCount,
            p.CommentCount,
            p.CreatedAt,
            likedSet.Contains(p.Id)
        )).ToList();

        var last   = posts[^1];
        var cursor = hasMore ? new FeedCursor(last.FeedScore, last.CreatedAt, last.Id) : null;

        return ApiResult<FeedResponse>.Ok(new FeedResponse(dtos, cursor, hasMore));
    }
}
