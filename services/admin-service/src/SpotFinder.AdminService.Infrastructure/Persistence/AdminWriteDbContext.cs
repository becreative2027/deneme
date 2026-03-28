using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Domain.Entities.Write;

namespace SpotFinder.AdminService.Infrastructure.Persistence;

/// <summary>
/// Write-side DbContext for admin operations.
/// Covers place.*, label.*, geo.* schemas (same single PostgreSQL instance).
/// Change-tracking is ON (write side). No migrations — schema owned by each service.
///
/// Concurrency strategy: trigger-updated row_version BYTEA column on every table.
/// EF Core marks it as IsConcurrencyToken + ValueGeneratedOnAddOrUpdate so that
/// a stale read causes DbUpdateConcurrencyException on the next SaveChanges.
///
/// Soft-delete filters: HasQueryFilter(!IsDeleted) on Place and Label ensures
/// deleted records are invisible to all queries on this context.
/// </summary>
public sealed class AdminWriteDbContext : DbContext
{
    public AdminWriteDbContext(DbContextOptions<AdminWriteDbContext> options) : base(options) { }

    // ── place schema ──────────────────────────────────────────────────────
    public DbSet<AdminPlaceWrite>             Places             => Set<AdminPlaceWrite>();
    public DbSet<AdminPlaceTranslationWrite>  PlaceTranslations  => Set<AdminPlaceTranslationWrite>();

    // ── label schema ──────────────────────────────────────────────────────
    public DbSet<AdminLabelWrite>             Labels             => Set<AdminLabelWrite>();
    public DbSet<AdminLabelTranslationWrite>  LabelTranslations  => Set<AdminLabelTranslationWrite>();
    public DbSet<AdminPlaceLabelWrite>        PlaceLabels        => Set<AdminPlaceLabelWrite>();

    // ── geo schema ────────────────────────────────────────────────────────
    public DbSet<AdminCityWrite>              Cities             => Set<AdminCityWrite>();
    public DbSet<AdminCityTranslationWrite>   CityTranslations   => Set<AdminCityTranslationWrite>();
    public DbSet<AdminDistrictWrite>          Districts          => Set<AdminDistrictWrite>();
    public DbSet<AdminDistrictTranslationWrite> DistrictTranslations => Set<AdminDistrictTranslationWrite>();

    // ── admin schema (write-audit) ─────────────────────────────────────────
    public DbSet<AdminWriteAuditLog>          WriteAuditLogs     => Set<AdminWriteAuditLog>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ── place.places ──────────────────────────────────────────────────
        b.Entity<AdminPlaceWrite>(e =>
        {
            e.ToTable("places", "place");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.GooglePlaceId).HasColumnName("google_place_id");
            e.Property(p => p.CountryId).HasColumnName("country_id");
            e.Property(p => p.CityId).HasColumnName("city_id");
            e.Property(p => p.DistrictId).HasColumnName("district_id");
            e.Property(p => p.Latitude).HasColumnName("latitude");
            e.Property(p => p.Longitude).HasColumnName("longitude");
            e.Property(p => p.Rating).HasColumnName("rating").HasPrecision(2, 1);
            e.Property(p => p.UserRatingsTotal).HasColumnName("user_ratings_total");
            e.Property(p => p.ParkingStatus).HasColumnName("parking_status");
            e.Property(p => p.Source).HasColumnName("source");
            e.Property(p => p.CoverImageUrl).HasColumnName("cover_image_url");
            e.Property(p => p.MenuUrl).HasColumnName("menu_url");
            e.Property(p => p.MenuImageUrls).HasColumnName("menu_image_urls").HasColumnType("jsonb");
            e.Property(p => p.IsDeleted).HasColumnName("is_deleted");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
            e.Property(p => p.UpdatedAt).HasColumnName("updated_at");
            e.Property(p => p.CreatedBy).HasColumnName("created_by");
            e.Property(p => p.UpdatedBy).HasColumnName("updated_by");
            e.Property(p => p.DeletedAt).HasColumnName("deleted_at");
            e.Property(p => p.DeletedBy).HasColumnName("deleted_by");

            // Optimistic concurrency — trigger updates this column on every INSERT/UPDATE.
            e.Property(p => p.RowVersion)
                .HasColumnName("row_version")
                .HasColumnType("bytea")
                .IsConcurrencyToken()
                .ValueGeneratedOnAddOrUpdate();

            // Global soft-delete filter: never return deleted places.
            e.HasQueryFilter(p => !p.IsDeleted);

            e.Ignore(p => p.Translations); // translations managed separately
        });

        // ── place.place_translations ──────────────────────────────────────
        b.Entity<AdminPlaceTranslationWrite>(e =>
        {
            e.ToTable("place_translations", "place");
            e.HasKey(t => t.Id);
            e.Property(t => t.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            e.Property(t => t.PlaceId).HasColumnName("place_id");
            e.Property(t => t.LanguageId).HasColumnName("language_id");
            e.Property(t => t.Name).HasColumnName("name");
            e.Property(t => t.Slug).HasColumnName("slug");
            e.HasIndex(t => new { t.PlaceId, t.LanguageId }).IsUnique();
        });

        // ── label.labels ──────────────────────────────────────────────────
        b.Entity<AdminLabelWrite>(e =>
        {
            e.ToTable("labels", "label");
            e.HasKey(l => l.Id);
            e.Property(l => l.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            e.Property(l => l.CategoryId).HasColumnName("category_id");
            e.Property(l => l.Key).HasColumnName("key");
            e.Property(l => l.IsActive).HasColumnName("is_active");
            e.Property(l => l.CreatedAt).HasColumnName("created_at");
            e.Property(l => l.UpdatedAt).HasColumnName("updated_at");
            e.Property(l => l.CreatedBy).HasColumnName("created_by");
            e.Property(l => l.UpdatedBy).HasColumnName("updated_by");
            e.Property(l => l.IsDeleted).HasColumnName("is_deleted");
            e.Property(l => l.DeletedAt).HasColumnName("deleted_at");
            e.Property(l => l.DeletedBy).HasColumnName("deleted_by");

            // Optimistic concurrency
            e.Property(l => l.RowVersion)
                .HasColumnName("row_version")
                .HasColumnType("bytea")
                .IsConcurrencyToken()
                .ValueGeneratedOnAddOrUpdate();

            // Global soft-delete filter
            e.HasQueryFilter(l => !l.IsDeleted);

            e.Ignore(l => l.Translations);
        });

        // ── label.label_translations ──────────────────────────────────────
        b.Entity<AdminLabelTranslationWrite>(e =>
        {
            e.ToTable("label_translations", "label");
            e.HasKey(t => t.Id);
            e.Property(t => t.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            e.Property(t => t.LabelId).HasColumnName("label_id");
            e.Property(t => t.LanguageId).HasColumnName("language_id");
            e.Property(t => t.DisplayName).HasColumnName("display_name");
            e.HasIndex(t => new { t.LabelId, t.LanguageId }).IsUnique();
        });

        // ── label.place_labels ────────────────────────────────────────────
        b.Entity<AdminPlaceLabelWrite>(e =>
        {
            e.ToTable("place_labels", "label");
            e.HasKey(pl => new { pl.PlaceId, pl.LabelId });
            e.Property(pl => pl.PlaceId).HasColumnName("place_id");
            e.Property(pl => pl.LabelId).HasColumnName("label_id");
            e.Property(pl => pl.Weight).HasColumnName("weight").HasPrecision(3, 2);
            e.Property(pl => pl.CreatedAt).HasColumnName("created_at");
            e.Property(pl => pl.CreatedBy).HasColumnName("created_by");
        });

        // ── geo.cities ────────────────────────────────────────────────────
        b.Entity<AdminCityWrite>(e =>
        {
            e.ToTable("cities", "geo");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            e.Property(c => c.CountryId).HasColumnName("country_id");
            e.Property(c => c.CreatedAt).HasColumnName("created_at");
            e.Property(c => c.CreatedBy).HasColumnName("created_by");

            e.Property(c => c.RowVersion)
                .HasColumnName("row_version")
                .HasColumnType("bytea")
                .IsConcurrencyToken()
                .ValueGeneratedOnAddOrUpdate();

            e.Ignore(c => c.Translations);
        });

        // ── geo.city_translations ─────────────────────────────────────────
        b.Entity<AdminCityTranslationWrite>(e =>
        {
            e.ToTable("city_translations", "geo");
            e.HasKey(t => t.Id);
            e.Property(t => t.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            e.Property(t => t.CityId).HasColumnName("city_id");
            e.Property(t => t.LanguageId).HasColumnName("language_id");
            e.Property(t => t.Name).HasColumnName("name");
            e.Property(t => t.Slug).HasColumnName("slug");
            e.HasIndex(t => new { t.CityId, t.LanguageId }).IsUnique();
        });

        // ── geo.districts ─────────────────────────────────────────────────
        b.Entity<AdminDistrictWrite>(e =>
        {
            e.ToTable("districts", "geo");
            e.HasKey(d => d.Id);
            e.Property(d => d.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            e.Property(d => d.CityId).HasColumnName("city_id");
            e.Property(d => d.CreatedAt).HasColumnName("created_at");
            e.Property(d => d.CreatedBy).HasColumnName("created_by");

            e.Property(d => d.RowVersion)
                .HasColumnName("row_version")
                .HasColumnType("bytea")
                .IsConcurrencyToken()
                .ValueGeneratedOnAddOrUpdate();

            e.Ignore(d => d.Translations);
        });

        // ── geo.district_translations ─────────────────────────────────────
        b.Entity<AdminDistrictTranslationWrite>(e =>
        {
            e.ToTable("district_translations", "geo");
            e.HasKey(t => t.Id);
            e.Property(t => t.Id).HasColumnName("id").UseIdentityAlwaysColumn();
            e.Property(t => t.DistrictId).HasColumnName("district_id");
            e.Property(t => t.LanguageId).HasColumnName("language_id");
            e.Property(t => t.Name).HasColumnName("name");
            e.Property(t => t.Slug).HasColumnName("slug");
            e.HasIndex(t => new { t.DistrictId, t.LanguageId }).IsUnique();
        });

        // ── admin.write_audit_logs ─────────────────────────────────────────
        b.Entity<AdminWriteAuditLog>(e =>
        {
            e.ToTable("write_audit_logs", "admin");
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasColumnName("id");
            e.Property(a => a.UserId).HasColumnName("user_id");
            e.Property(a => a.Action).HasColumnName("action").IsRequired();
            e.Property(a => a.EntityType).HasColumnName("entity_type").IsRequired();
            e.Property(a => a.EntityId).HasColumnName("entity_id").IsRequired();
            e.Property(a => a.Payload).HasColumnName("payload").HasColumnType("jsonb");
            e.Property(a => a.CreatedAt).HasColumnName("created_at");
        });
    }
}
