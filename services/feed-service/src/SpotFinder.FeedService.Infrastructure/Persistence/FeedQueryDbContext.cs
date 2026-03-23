using Microsoft.EntityFrameworkCore;
using SpotFinder.FeedService.Infrastructure.Persistence.ReadModels;

namespace SpotFinder.FeedService.Infrastructure.Persistence;

/// <summary>
/// Read-only, migration-less cross-schema DbContext for CQRS feed query handlers.
/// Spans content.*, social.*, place.*, identity.* tables in a single DB instance.
/// No migrations — schema is owned by each upstream service.
/// </summary>
public sealed class FeedQueryDbContext : DbContext
{
    public FeedQueryDbContext(DbContextOptions<FeedQueryDbContext> options) : base(options) { }

    // ── content schema ────────────────────────────────────────────────────────
    public DbSet<PostRow>          Posts          => Set<PostRow>();
    public DbSet<PostMediaRow>     PostMedia      => Set<PostMediaRow>();
    public DbSet<PostLikeRow>      PostLikes      => Set<PostLikeRow>();
    public DbSet<UserInterestRow>  UserInterests  => Set<UserInterestRow>();
    public DbSet<TrendingScoreRow> TrendingScores => Set<TrendingScoreRow>();

    // ── social schema ─────────────────────────────────────────────────────────
    public DbSet<UserFollowRow> UserFollows => Set<UserFollowRow>();

    // ── place schema ──────────────────────────────────────────────────────────
    public DbSet<PlaceRow>            Places            => Set<PlaceRow>();
    public DbSet<PlaceTranslationRow> PlaceTranslations => Set<PlaceTranslationRow>();

    // ── label schema ──────────────────────────────────────────────────────────
    public DbSet<PlaceLabelRow> PlaceLabels => Set<PlaceLabelRow>();

    // ── identity schema ───────────────────────────────────────────────────────
    public DbSet<UserRow>        Users        => Set<UserRow>();
    public DbSet<UserProfileRow> UserProfiles => Set<UserProfileRow>();

    // ── content.user_events (dwell signals — Phase 7.3) ───────────────────
    public DbSet<UserEventRow> UserEvents => Set<UserEventRow>();

    // ── admin schema (runtime config + feature flags — Phase 7.3) ────────
    public DbSet<RuntimeConfigRow> RuntimeConfigs => Set<RuntimeConfigRow>();
    public DbSet<FeatureFlagRow>   FeatureFlags   => Set<FeatureFlagRow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── content.posts ─────────────────────────────────────────────────────
        modelBuilder.Entity<PostRow>(b =>
        {
            b.ToTable("posts", "content");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.PlaceId).HasColumnName("place_id");
            b.Property(x => x.Caption).HasColumnName("caption");
            b.Property(x => x.LikeCount).HasColumnName("like_count");
            b.Property(x => x.CommentCount).HasColumnName("comment_count");
            b.Property(x => x.FeedScore).HasColumnName("feed_score");
            b.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            b.Property(x => x.Status).HasColumnName("status");
            b.Property(x => x.CreatedAt).HasColumnName("created_at");
            // Mirror the same soft-delete + moderation filter as ContentDbContext
            b.HasQueryFilter(x => !x.IsDeleted && x.Status != "hidden");
        });

        // ── content.post_media ────────────────────────────────────────────────
        modelBuilder.Entity<PostMediaRow>(b =>
        {
            b.ToTable("post_media", "content");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.PostId).HasColumnName("post_id");
            b.Property(x => x.Url).HasColumnName("url");
            b.Property(x => x.Type).HasColumnName("type");
        });

        // ── content.post_likes ────────────────────────────────────────────────
        modelBuilder.Entity<PostLikeRow>(b =>
        {
            b.ToTable("post_likes", "content");
            b.HasKey(x => new { x.UserId, x.PostId });
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.PostId).HasColumnName("post_id");
        });

        // ── social.user_follows ───────────────────────────────────────────────
        modelBuilder.Entity<UserFollowRow>(b =>
        {
            b.ToTable("user_follows", "social");
            b.HasKey(x => new { x.FollowerId, x.FollowingId });
            b.Property(x => x.FollowerId).HasColumnName("follower_id");
            b.Property(x => x.FollowingId).HasColumnName("following_id");
        });

        // ── place.places ──────────────────────────────────────────────────────
        modelBuilder.Entity<PlaceRow>(b =>
        {
            b.ToTable("places", "place");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.CityId).HasColumnName("city_id");
            b.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            b.HasQueryFilter(x => !x.IsDeleted);
        });

        // ── place.place_translations ──────────────────────────────────────────
        modelBuilder.Entity<PlaceTranslationRow>(b =>
        {
            b.ToTable("place_translations", "place");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.PlaceId).HasColumnName("place_id");
            b.Property(x => x.LanguageId).HasColumnName("language_id");
            b.Property(x => x.Name).HasColumnName("name");
        });

        // ── content.user_interests ────────────────────────────────────────────
        modelBuilder.Entity<UserInterestRow>(b =>
        {
            b.ToTable("user_interests", "content");
            b.HasKey(x => new { x.UserId, x.LabelId });
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.LabelId).HasColumnName("label_id");
            b.Property(x => x.Score).HasColumnName("score");
        });

        // ── content.trending_scores ───────────────────────────────────────────
        modelBuilder.Entity<TrendingScoreRow>(b =>
        {
            b.ToTable("trending_scores", "content");
            b.HasKey(x => x.PlaceId);
            b.Property(x => x.PlaceId).HasColumnName("place_id");
            b.Property(x => x.Score).HasColumnName("score");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        // ── label.place_labels ────────────────────────────────────────────────
        modelBuilder.Entity<PlaceLabelRow>(b =>
        {
            b.ToTable("place_labels", "label");
            b.HasKey(x => new { x.PlaceId, x.LabelId });
            b.Property(x => x.PlaceId).HasColumnName("place_id");
            b.Property(x => x.LabelId).HasColumnName("label_id");
            b.Property(x => x.Weight).HasColumnName("weight").HasPrecision(3, 2);
        });

        // ── identity.users ────────────────────────────────────────────────────
        modelBuilder.Entity<UserRow>(b =>
        {
            b.ToTable("users", "identity");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.Username).HasColumnName("username");
        });

        // ── identity.profiles ─────────────────────────────────────────────────
        modelBuilder.Entity<UserProfileRow>(b =>
        {
            b.ToTable("profiles", "identity");
            b.HasKey(x => x.UserId);
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.DisplayName).HasColumnName("display_name");
            b.Property(x => x.ProfileImageUrl).HasColumnName("profile_image_url");
        });

        // ── content.user_events ───────────────────────────────────────────────
        modelBuilder.Entity<UserEventRow>(b =>
        {
            b.ToTable("user_events", "content");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.EventType).HasColumnName("event_type");
            b.Property(x => x.PostId).HasColumnName("post_id");
            b.Property(x => x.PlaceId).HasColumnName("place_id");
            b.Property(x => x.Payload).HasColumnName("payload").HasColumnType("jsonb");
            b.Property(x => x.CreatedAt).HasColumnName("created_at");
        });

        // ── admin.runtime_configs ─────────────────────────────────────────────
        modelBuilder.Entity<RuntimeConfigRow>(b =>
        {
            b.ToTable("runtime_configs", "admin");
            b.HasKey(x => x.Key);
            b.Property(x => x.Key).HasColumnName("key");
            b.Property(x => x.Value).HasColumnName("value").HasColumnType("jsonb");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        // ── admin.feature_flags ───────────────────────────────────────────────
        modelBuilder.Entity<FeatureFlagRow>(b =>
        {
            b.ToTable("feature_flags", "admin");
            b.HasKey(x => x.Key);
            b.Property(x => x.Key).HasColumnName("key");
            b.Property(x => x.IsEnabled).HasColumnName("is_enabled");
            b.Property(x => x.RolloutPercentage).HasColumnName("rollout_percentage");
            b.Property(x => x.Target).HasColumnName("target").HasColumnType("jsonb");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });
    }
}
