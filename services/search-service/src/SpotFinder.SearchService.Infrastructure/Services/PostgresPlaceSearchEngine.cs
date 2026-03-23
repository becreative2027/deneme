using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.SearchService.Domain.Models;
using SpotFinder.SearchService.Domain.Services;
using SpotFinder.SearchService.Infrastructure.Persistence;

namespace SpotFinder.SearchService.Infrastructure.Services;

/// <summary>
/// PostgreSQL-based search engine. Executes cross-schema queries against place and label schemas.
/// In a later phase this can be replaced with Elasticsearch or a dedicated search index.
/// </summary>
public sealed class PostgresPlaceSearchEngine : IPlaceSearchEngine
{
    private readonly SearchDbContext _context;

    public PostgresPlaceSearchEngine(SearchDbContext context) => _context = context;

    public async Task<PagedResult<PlaceSearchResult>> SearchAsync(SearchFilter filter, string languageCode, CancellationToken ct = default)
    {
        var sql = BuildSearchSql(filter, languageCode);
        var countSql = BuildCountSql(filter, languageCode);

        var items = await _context.Database.SqlQueryRaw<PlaceSearchRaw>(sql).ToListAsync(ct);
        var totalRaw = await _context.Database.SqlQueryRaw<CountResult>(countSql).FirstOrDefaultAsync(ct);
        var total = totalRaw?.Count ?? 0;

        var results = items.Select(r => new PlaceSearchResult
        {
            PlaceId = r.PlaceId,
            Slug = r.Slug,
            Name = r.Name,
            Latitude = r.Latitude,
            Longitude = r.Longitude,
            CityId = r.CityId,
            RelevanceScore = 1.0
        }).ToList();

        return PagedResult<PlaceSearchResult>.Create(results, (int)total, filter.Page, filter.PageSize);
    }

    public async Task<IReadOnlyList<string>> AutocompleteAsync(string query, Guid? cityId, string languageCode, CancellationToken ct = default)
    {
        var cityFilter = cityId.HasValue ? $"AND p.city_id = '{cityId}'" : "";
        var sql = $"""
            SELECT DISTINCT pt.name
            FROM place.places p
            JOIN place.place_translations pt ON pt.place_id = p.id
            WHERE pt.language_code = '{languageCode}'
            AND pt.name ILIKE '{query.Replace("'", "''")}%'
            AND p.is_active = true
            {cityFilter}
            ORDER BY pt.name
            LIMIT 10
            """;
        return await _context.Database.SqlQueryRaw<string>(sql).ToListAsync(ct);
    }

    private static string BuildSearchSql(SearchFilter filter, string languageCode)
    {
        var conditions = BuildConditions(filter, languageCode);
        var offset = (filter.Page - 1) * filter.PageSize;
        return $"""
            SELECT p.id AS place_id, p.slug, COALESCE(pt.name, p.slug) AS name,
                   p.latitude, p.longitude, p.city_id
            FROM place.places p
            LEFT JOIN place.place_translations pt ON pt.place_id = p.id AND pt.language_code = '{languageCode}'
            WHERE p.is_active = true {conditions}
            ORDER BY p.created_at DESC
            LIMIT {filter.PageSize} OFFSET {offset}
            """;
    }

    private static string BuildCountSql(SearchFilter filter, string languageCode)
    {
        var conditions = BuildConditions(filter, languageCode);
        return $"""
            SELECT COUNT(*) AS count
            FROM place.places p
            LEFT JOIN place.place_translations pt ON pt.place_id = p.id AND pt.language_code = '{languageCode}'
            WHERE p.is_active = true {conditions}
            """;
    }

    private static string BuildConditions(SearchFilter filter, string languageCode)
    {
        var conditions = new List<string>();
        if (!string.IsNullOrWhiteSpace(filter.Query))
            conditions.Add($"AND pt.name ILIKE '%{filter.Query.Replace("'", "''")}%'");
        if (filter.CityId.HasValue)
            conditions.Add($"AND p.city_id = '{filter.CityId}'");
        if (filter.DistrictId.HasValue)
            conditions.Add($"AND p.district_id = '{filter.DistrictId}'");
        return string.Join(" ", conditions);
    }
}

file record PlaceSearchRaw
{
    public Guid PlaceId { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public Guid CityId { get; init; }
}

file record CountResult
{
    public long Count { get; init; }
}
