using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.PlaceService.Infrastructure.Persistence;
using System.Diagnostics;

namespace SpotFinder.PlaceService.Application.Features.Filters.Queries.GetPlaceFilters;

public sealed class GetPlaceFiltersQueryHandler
    : IRequestHandler<GetPlaceFiltersQuery, ApiResult<PlaceFiltersResponse>>
{
    private readonly PlaceQueryDbContext _db;
    private readonly IMemoryCache _cache;
    private readonly ILogger<GetPlaceFiltersQueryHandler> _logger;

    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public GetPlaceFiltersQueryHandler(
        PlaceQueryDbContext db,
        IMemoryCache cache,
        ILogger<GetPlaceFiltersQueryHandler> logger)
    {
        _db     = db;
        _cache  = cache;
        _logger = logger;
    }

    public async Task<ApiResult<PlaceFiltersResponse>> Handle(
        GetPlaceFiltersQuery request, CancellationToken ct)
    {
        var cacheKey = $"place_filters_{request.LanguageId}";

        if (_cache.TryGetValue(cacheKey, out ApiResult<PlaceFiltersResponse>? cached) && cached is not null)
        {
            _logger.LogInformation(
                "GetPlaceFilters — cache HIT (lang={LanguageId}).", request.LanguageId);
            return cached;
        }

        var sw = Stopwatch.StartNew();
        _logger.LogInformation(
            "GetPlaceFilters — cache MISS, querying DB (lang={LanguageId}).", request.LanguageId);

        // Single query: categories → translations → labels → label translations
        var rows = await (
            from cat in _db.LabelCategories
            join catT in _db.LabelCategoryTranslations
                on new { Id = cat.Id, LangId = request.LanguageId }
                equals new { Id = catT.CategoryId, LangId = catT.LanguageId }
                into catTrans
            from catT in catTrans.DefaultIfEmpty()
            join lbl in _db.Labels on cat.Id equals lbl.CategoryId
            where lbl.IsActive
            join lblT in _db.LabelTranslations
                on new { Id = lbl.Id, LangId = request.LanguageId }
                equals new { Id = lblT.LabelId, LangId = lblT.LanguageId }
                into lblTrans
            from lblT in lblTrans.DefaultIfEmpty()
            orderby cat.Id, lbl.Id
            select new
            {
                CategoryId          = cat.Id,
                CategoryKey         = cat.Key,
                CategoryDisplayName = catT != null ? catT.DisplayName : cat.Key,
                LabelId             = lbl.Id,
                LabelKey            = lbl.Key,
                LabelDisplayName    = lblT != null ? lblT.DisplayName : lbl.Key,
            }
        ).ToListAsync(ct);

        var categories = rows
            .GroupBy(r => new { r.CategoryId, r.CategoryKey, r.CategoryDisplayName })
            .Select(g => new FilterCategoryDto(
                g.Key.CategoryId,
                g.Key.CategoryKey,
                g.Key.CategoryDisplayName,
                g.Select(r => new FilterLabelDto(r.LabelId, r.LabelKey, r.LabelDisplayName))
                 .ToList()))
            .ToList();

        var result = ApiResult<PlaceFiltersResponse>.Ok(new PlaceFiltersResponse(categories));

        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = CacheTtl,
            Size = 1,
        });

        sw.Stop();
        _logger.LogInformation(
            "GetPlaceFilters — DB query done in {ElapsedMs} ms, cached for {Ttl} min (lang={LanguageId}).",
            sw.ElapsedMilliseconds, CacheTtl.TotalMinutes, request.LanguageId);

        return result;
    }
}
