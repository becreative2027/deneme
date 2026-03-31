using Microsoft.EntityFrameworkCore;
using SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

namespace SpotFinder.PlaceService.Infrastructure.Persistence;

/// <summary>
/// Read-only, migration-less cross-schema DbContext for CQRS query handlers.
/// Covers place.*, label.* tables in a single DB instance.
/// All column names are explicit to avoid naming-convention dependencies.
/// </summary>
public sealed class PlaceQueryDbContext : DbContext
{
    public PlaceQueryDbContext(DbContextOptions<PlaceQueryDbContext> options) : base(options) { }

    // place schema
    public DbSet<PlaceRow> Places => Set<PlaceRow>();
    public DbSet<PlaceTranslationRow> PlaceTranslations => Set<PlaceTranslationRow>();
    public DbSet<PlaceScoreRow> PlaceScores => Set<PlaceScoreRow>();
    public DbSet<PlaceReviewRow> PlaceReviews => Set<PlaceReviewRow>();

    // label schema
    public DbSet<PlaceLabelRow> PlaceLabels => Set<PlaceLabelRow>();
    public DbSet<LabelRow> Labels => Set<LabelRow>();
    public DbSet<LabelTranslationRow> LabelTranslations => Set<LabelTranslationRow>();
    public DbSet<LabelCategoryRow> LabelCategories => Set<LabelCategoryRow>();
    public DbSet<LabelCategoryTranslationRow> LabelCategoryTranslations => Set<LabelCategoryTranslationRow>();

    // geo schema (read-only, for city/district name resolution)
    public DbSet<CityTranslationRow> CityTranslations => Set<CityTranslationRow>();
    public DbSet<DistrictTranslationRow> DistrictTranslations => Set<DistrictTranslationRow>();

    // social schema (read-only counts)
    public DbSet<SocialFavoriteRow> SocialFavorites => Set<SocialFavoriteRow>();
    public DbSet<SocialWishlistRow> SocialWishlists => Set<SocialWishlistRow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── place schema ──────────────────────────────────────────────────────

        modelBuilder.Entity<PlaceRow>(b =>
        {
            b.ToTable("places", "place");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.GooglePlaceId).HasColumnName("google_place_id");
            b.Property(x => x.CoverImageUrl).HasColumnName("cover_image_url");
            b.Property(x => x.CountryId).HasColumnName("country_id");
            b.Property(x => x.CityId).HasColumnName("city_id");
            b.Property(x => x.DistrictId).HasColumnName("district_id");
            b.Property(x => x.Latitude).HasColumnName("latitude");
            b.Property(x => x.Longitude).HasColumnName("longitude");
            b.Property(x => x.Rating).HasColumnName("rating").HasPrecision(2, 1);
            b.Property(x => x.UserRatingsTotal).HasColumnName("user_ratings_total");
            b.Property(x => x.ParkingStatus).HasColumnName("parking_status");
            b.Property(x => x.MenuUrl).HasColumnName("menu_url");
            b.Property(x => x.MenuImageUrls)
                .HasColumnName("menu_image_urls")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>());
            b.Property(x => x.PriceLevel).HasColumnName("price_level");
            b.Property(x => x.VenueType).HasColumnName("venue_type");
            b.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            b.Property(x => x.CreatedAt).HasColumnName("created_at");
            b.HasQueryFilter(x => !x.IsDeleted);
        });

        modelBuilder.Entity<PlaceTranslationRow>(b =>
        {
            b.ToTable("place_translations", "place");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.PlaceId).HasColumnName("place_id");
            b.Property(x => x.LanguageId).HasColumnName("language_id");
            b.Property(x => x.Name).HasColumnName("name");
            b.Property(x => x.Slug).HasColumnName("slug");
        });

        modelBuilder.Entity<PlaceScoreRow>(b =>
        {
            b.ToTable("place_scores", "place");
            b.HasKey(x => x.PlaceId);
            b.Property(x => x.PlaceId).HasColumnName("place_id");
            b.Property(x => x.PopularityScore).HasColumnName("popularity_score").HasPrecision(5, 2);
            b.Property(x => x.QualityScore).HasColumnName("quality_score").HasPrecision(5, 2);
            b.Property(x => x.TrendScore).HasColumnName("trend_score").HasPrecision(5, 2);
            b.Property(x => x.FinalScore).HasColumnName("final_score").HasPrecision(5, 2);
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<PlaceReviewRow>(b =>
        {
            b.ToTable("place_reviews", "place");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.PlaceId).HasColumnName("place_id");
        });

        // ── label schema ──────────────────────────────────────────────────────

        modelBuilder.Entity<PlaceLabelRow>(b =>
        {
            b.ToTable("place_labels", "label");
            b.HasKey(x => new { x.PlaceId, x.LabelId });
            b.Property(x => x.PlaceId).HasColumnName("place_id");
            b.Property(x => x.LabelId).HasColumnName("label_id");
            b.Property(x => x.Weight).HasColumnName("weight").HasPrecision(3, 2);
        });

        modelBuilder.Entity<LabelRow>(b =>
        {
            b.ToTable("labels", "label");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.CategoryId).HasColumnName("category_id");
            b.Property(x => x.Key).HasColumnName("key");
            b.Property(x => x.IsActive).HasColumnName("is_active");
        });

        modelBuilder.Entity<LabelTranslationRow>(b =>
        {
            b.ToTable("label_translations", "label");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.LabelId).HasColumnName("label_id");
            b.Property(x => x.LanguageId).HasColumnName("language_id");
            b.Property(x => x.DisplayName).HasColumnName("display_name");
        });

        modelBuilder.Entity<LabelCategoryRow>(b =>
        {
            b.ToTable("label_categories", "label");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.Key).HasColumnName("key");
        });

        modelBuilder.Entity<LabelCategoryTranslationRow>(b =>
        {
            b.ToTable("label_category_translations", "label");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.CategoryId).HasColumnName("category_id");
            b.Property(x => x.LanguageId).HasColumnName("language_id");
            b.Property(x => x.DisplayName).HasColumnName("display_name");
        });

        // ── geo schema (snake_case — actual DB created by init-schema.sql, not EF migration) ──

        modelBuilder.Entity<CityTranslationRow>(b =>
        {
            b.ToTable("city_translations", "geo");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.CityId).HasColumnName("city_id");
            b.Property(x => x.LanguageId).HasColumnName("language_id");
            b.Property(x => x.Name).HasColumnName("name");
        });

        modelBuilder.Entity<DistrictTranslationRow>(b =>
        {
            b.ToTable("district_translations", "geo");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.DistrictId).HasColumnName("district_id");
            b.Property(x => x.LanguageId).HasColumnName("language_id");
            b.Property(x => x.Name).HasColumnName("name");
        });

        // ── social schema (read-only) ─────────────────────────────────────────

        modelBuilder.Entity<SocialFavoriteRow>(b =>
        {
            b.ToTable("user_favorites", "social");
            b.HasKey(x => new { x.UserId, x.PlaceId });
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.PlaceId).HasColumnName("place_id");
        });

        modelBuilder.Entity<SocialWishlistRow>(b =>
        {
            b.ToTable("user_wishlists", "social");
            b.HasKey(x => new { x.UserId, x.PlaceId });
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.PlaceId).HasColumnName("place_id");
        });
    }
}
