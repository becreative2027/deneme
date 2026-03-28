using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.PlaceService.Infrastructure.Persistence;
using SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;
using System.Diagnostics;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.SearchPlaces;

public sealed class SearchPlacesQueryHandler
    : IRequestHandler<SearchPlacesQuery, ApiResult<SearchPlacesResponse>>
{
    private readonly PlaceQueryDbContext _db;
    private readonly ILogger<SearchPlacesQueryHandler> _logger;

    public SearchPlacesQueryHandler(PlaceQueryDbContext db, ILogger<SearchPlacesQueryHandler> logger)
    {
        _db     = db;
        _logger = logger;
    }

    public async Task<ApiResult<SearchPlacesResponse>> Handle(
        SearchPlacesQuery request, CancellationToken ct)
    {
        var swTotal = Stopwatch.StartNew();
        var swDb    = Stopwatch.StartNew();

        _logger.LogInformation(
            "SearchPlaces started — city={CityId} district={DistrictId} labels=[{LabelIds}] " +
            "matchMode={MatchMode} minRating={MinRating} lang={LanguageId} page={Page} pageSize={PageSize}",
            request.CityId, request.DistrictId,
            request.LabelIds is { Count: > 0 } ? string.Join(",", request.LabelIds) : "none",
            request.MatchMode, request.MinRating, request.LanguageId, request.Page, request.PageSize);

        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page     = Math.Max(request.Page, 1);

        // ── Base query (soft-delete via HasQueryFilter) ───────────────────────
        IQueryable<PlaceRow> query = _db.Places;

        // ── Geo filters ───────────────────────────────────────────────────────
        if (request.CityId.HasValue)
            query = query.Where(p => p.CityId == request.CityId);

        if (request.DistrictId.HasValue)
            query = query.Where(p => p.DistrictId == request.DistrictId);

        // ── Rating filter ─────────────────────────────────────────────────────
        if (request.MinRating.HasValue)
            query = query.Where(p => p.Rating >= request.MinRating);

        // ── Text search (name ILIKE via translation table) ────────────────────
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var pattern = $"%{request.Query.Trim()}%";
            var matchingPlaceIds = _db.PlaceTranslations
                .Where(t => t.LanguageId == request.LanguageId &&
                            EF.Functions.ILike(t.Name, pattern))
                .Select(t => t.PlaceId);
            query = query.Where(p => matchingPlaceIds.Contains(p.Id));
        }

        // ── Label filter ──────────────────────────────────────────────────────
        if (request.LabelIds is { Count: > 0 })
        {
            var labelIds   = request.LabelIds;
            var labelCount = labelIds.Count;

            if (request.MatchMode.ToUpperInvariant() == "ALL")
            {
                // ── ALL: place must carry every requested label ────────────────
                // Fix: Distinct() before GroupBy → COUNT(DISTINCT label_id) semantics.
                // SQL:
                //   SELECT place_id
                //   FROM (SELECT DISTINCT place_id, label_id FROM label.place_labels
                //         WHERE label_id IN (@ids)) deduped
                //   GROUP BY place_id
                //   HAVING COUNT(*) = @labelCount
                var matchingPlaceIds = _db.PlaceLabels
                    .Where(pl => labelIds.Contains(pl.LabelId))
                    .Select(pl => new { pl.PlaceId, pl.LabelId })
                    .Distinct()                          // COUNT DISTINCT fix
                    .GroupBy(x => x.PlaceId)
                    .Where(g => g.Count() == labelCount)
                    .Select(g => g.Key);

                query = query.Where(p => matchingPlaceIds.Contains(p.Id));
            }
            else
            {
                // ── ANY: place must carry at least one requested label ─────────
                // JOIN-based (avoids correlated subquery, uses idx_place_labels_label_id).
                // SQL:
                //   INNER JOIN label.place_labels pl ON p.id = pl.place_id
                //   WHERE pl.label_id IN (@ids)
                //   + DISTINCT to collapse multi-label duplicates
                query = (from p in query
                         join pl in _db.PlaceLabels on p.Id equals pl.PlaceId
                         where labelIds.Contains(pl.LabelId)
                         select p).Distinct();
            }
        }

        // ── COUNT (separate query — fast path before expensive pagination) ────
        var totalCount = await query.CountAsync(ct);

        if (totalCount == 0)
        {
            swDb.Stop();
            swTotal.Stop();
            _logger.LogInformation(
                "SearchPlaces done — 0 results. dbTime={DbMs} ms, total={TotalMs} ms.",
                swDb.ElapsedMilliseconds, swTotal.ElapsedMilliseconds);
            return ApiResult<SearchPlacesResponse>.Ok(
                new SearchPlacesResponse([], 0, page, pageSize));
        }

        // ── Page data with final_score sort (LEFT JOIN place_scores) ──────────
        // ORDER BY: final_score DESC NULLS LAST → COALESCE(final_score, -1)
        //           then rating DESC, created_at ASC as tiebreakers.
        // SQL:
        //   SELECT p.*, ps.final_score
        //   FROM places p
        //   LEFT JOIN place.place_scores ps ON p.id = ps.place_id
        //   ORDER BY COALESCE(ps.final_score, -1) DESC, p.rating DESC, p.created_at ASC
        //   LIMIT @pageSize OFFSET @offset
        var pagedPlaces = await (
            from p in query
            join ps in _db.PlaceScores on p.Id equals ps.PlaceId into scoreGrp
            from ps in scoreGrp.DefaultIfEmpty()
            select new
            {
                p.Id,
                p.CoverImageUrl,
                p.CityId,
                p.DistrictId,
                p.Latitude,
                p.Longitude,
                p.Rating,
                p.ParkingStatus,
                p.CreatedAt,
                FinalScore = (decimal?)ps.FinalScore,
            }
        )
        .OrderByDescending(x => x.FinalScore ?? -1m)   // NULLS LAST
        .ThenByDescending(x => x.Rating)
        .ThenBy(x => x.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync(ct);

        var placeIds = pagedPlaces.Select(p => p.Id).ToList();

        // ── Translations (idx_place_translations_lang) ────────────────────────
        var translations = await _db.PlaceTranslations
            .Where(t => placeIds.Contains(t.PlaceId) && t.LanguageId == request.LanguageId)
            .Select(t => new { t.PlaceId, t.Name, t.Slug })
            .ToDictionaryAsync(t => t.PlaceId, ct);

        // ── Labels per place (idx_place_labels_place_id + label_id) ──────────
        var labelRows = await (
            from pl in _db.PlaceLabels
            where placeIds.Contains(pl.PlaceId)
            join lb in _db.Labels on pl.LabelId equals lb.Id
            join lt in _db.LabelTranslations
                on new { Id = lb.Id, LangId = request.LanguageId }
                equals new { Id = lt.LabelId, LangId = lt.LanguageId }
                into lts
            from lt in lts.DefaultIfEmpty()
            select new
            {
                pl.PlaceId,
                LabelId     = lb.Id,
                DisplayName = lt != null ? lt.DisplayName : lb.Key,
            }
        ).ToListAsync(ct);

        swDb.Stop();
        long dbTime = swDb.ElapsedMilliseconds;

        // ── Review counts (from app reviews, not Google data) ─────────────────
        var reviewCountMap = await _db.PlaceReviews
            .Where(r => placeIds.Contains(r.PlaceId))
            .GroupBy(r => r.PlaceId)
            .Select(g => new { PlaceId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PlaceId, x => x.Count, ct);

        // ── In-memory mapping ─────────────────────────────────────────────────
        var swMap = Stopwatch.StartNew();

        var labelsByPlace = labelRows
            .GroupBy(x => x.PlaceId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<LabelSummaryDto>)g
                    .Select(x => new LabelSummaryDto(x.LabelId, x.DisplayName))
                    .ToList());

        var dtos = pagedPlaces
            .Select(p =>
            {
                translations.TryGetValue(p.Id, out var t);
                labelsByPlace.TryGetValue(p.Id, out var lbls);
                reviewCountMap.TryGetValue(p.Id, out var rc);
                return new PlaceSummaryDto(
                    p.Id,
                    t?.Name ?? string.Empty,
                    t?.Slug,
                    p.CoverImageUrl,
                    p.CityId,
                    p.DistrictId,
                    p.Latitude,
                    p.Longitude,
                    p.Rating,
                    rc,
                    p.ParkingStatus,
                    lbls ?? []);
            })
            .ToList();

        swMap.Stop();
        swTotal.Stop();

        _logger.LogInformation(
            "SearchPlaces done — total={TotalCount}, returned={PageCount}. " +
            "dbTime={DbMs} ms, mapTime={MapMs} ms, totalTime={TotalMs} ms.",
            totalCount, dtos.Count,
            dbTime, swMap.ElapsedMilliseconds, swTotal.ElapsedMilliseconds);

        return ApiResult<SearchPlacesResponse>.Ok(
            new SearchPlacesResponse(dtos, totalCount, page, pageSize));
    }
}
