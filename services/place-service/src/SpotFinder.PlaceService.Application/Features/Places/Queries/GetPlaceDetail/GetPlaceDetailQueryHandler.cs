using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.PlaceService.Infrastructure.Persistence;
using System.Diagnostics;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceDetail;

public sealed class GetPlaceDetailQueryHandler
    : IRequestHandler<GetPlaceDetailQuery, ApiResult<PlaceDetailResponse>>
{
    private readonly PlaceQueryDbContext _db;
    private readonly ILogger<GetPlaceDetailQueryHandler> _logger;

    public GetPlaceDetailQueryHandler(PlaceQueryDbContext db, ILogger<GetPlaceDetailQueryHandler> logger)
    {
        _db     = db;
        _logger = logger;
    }

    public async Task<ApiResult<PlaceDetailResponse>> Handle(
        GetPlaceDetailQuery request, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        _logger.LogInformation(
            "GetPlaceDetail started: placeId={PlaceId} lang={LanguageId}",
            request.PlaceId, request.LanguageId);

        // ── Place (soft-delete filter applied by HasQueryFilter) ──────────────
        var place = await _db.Places
            .FirstOrDefaultAsync(p => p.Id == request.PlaceId, ct);

        if (place is null)
        {
            sw.Stop();
            _logger.LogWarning(
                "GetPlaceDetail: place '{PlaceId}' not found ({ElapsedMs} ms).",
                request.PlaceId, sw.ElapsedMilliseconds);
            return ApiResult<PlaceDetailResponse>.Fail($"Place '{request.PlaceId}' not found.");
        }

        // ── Translation ───────────────────────────────────────────────────────
        // Uses idx_place_translations_lang (place_id, language_id)
        var translation = await _db.PlaceTranslations
            .Where(t => t.PlaceId == request.PlaceId && t.LanguageId == request.LanguageId)
            .Select(t => new { t.Name, t.Slug })
            .FirstOrDefaultAsync(ct);

        // ── Score ─────────────────────────────────────────────────────────────
        var score = await _db.PlaceScores
            .Where(s => s.PlaceId == request.PlaceId)
            .Select(s => new { s.PopularityScore, s.QualityScore, s.TrendScore, s.FinalScore })
            .FirstOrDefaultAsync(ct);

        // ── Geo names (city + district, localized) ────────────────────────────
        string? cityName = null;
        if (place.CityId.HasValue)
            cityName = await _db.CityTranslations
                .Where(ct2 => ct2.CityId == place.CityId.Value && ct2.LanguageId == request.LanguageId)
                .Select(ct2 => ct2.Name)
                .FirstOrDefaultAsync(ct);

        string? districtName = null;
        if (place.DistrictId.HasValue)
            districtName = await _db.DistrictTranslations
                .Where(dt => dt.DistrictId == place.DistrictId.Value && dt.LanguageId == request.LanguageId)
                .Select(dt => dt.Name)
                .FirstOrDefaultAsync(ct);

        // ── Labels with localized display names ───────────────────────────────
        // Uses idx_place_labels_place_id + idx_place_labels_label_id
        var labels = await (
            from pl in _db.PlaceLabels
            where pl.PlaceId == request.PlaceId
            join lb in _db.Labels on pl.LabelId equals lb.Id
            join lt in _db.LabelTranslations
                on new { Id = lb.Id, LangId = request.LanguageId }
                equals new { Id = lt.LabelId, LangId = lt.LanguageId }
                into lts
            from lt in lts.DefaultIfEmpty()
            orderby pl.Weight descending
            select new PlaceLabelDto(
                lb.Id,
                lb.Key,
                lt != null ? lt.DisplayName : lb.Key,
                pl.Weight)
        ).ToListAsync(ct);

        // ── App review count (distinct from Google's UserRatingsTotal) ─────────
        var reviewCount = await _db.PlaceReviews
            .CountAsync(r => r.PlaceId == request.PlaceId, ct);

        // ── Social counts ─────────────────────────────────────────────────────
        var favoriteCount = await _db.SocialFavorites
            .CountAsync(f => f.PlaceId == request.PlaceId, ct);

        var wishlistCount = await _db.SocialWishlists
            .CountAsync(w => w.PlaceId == request.PlaceId, ct);

        var scoreDto = score is null ? null : new PlaceScoreDto(
            score.PopularityScore,
            score.QualityScore,
            score.TrendScore,
            score.FinalScore);

        var response = new PlaceDetailResponse(
            place.Id,
            translation?.Name ?? string.Empty,
            translation?.Slug,
            place.GooglePlaceId,
            place.CoverImageUrl,
            place.CountryId,
            place.CityId,
            cityName,
            place.DistrictId,
            districtName,
            place.Latitude,
            place.Longitude,
            place.Rating,
            place.UserRatingsTotal,
            reviewCount,
            place.ParkingStatus,
            place.MenuUrl,
            place.MenuImageUrls,
            scoreDto,
            labels,
            favoriteCount,
            wishlistCount);

        sw.Stop();
        _logger.LogInformation(
            "GetPlaceDetail completed in {ElapsedMs} ms for place '{PlaceId}'.",
            sw.ElapsedMilliseconds, request.PlaceId);

        return ApiResult<PlaceDetailResponse>.Ok(response);
    }
}
