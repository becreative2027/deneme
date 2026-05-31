using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Infrastructure.Persistence.Configurations;

public sealed class PlaceViewConfiguration : IEntityTypeConfiguration<PlaceView>
{
    public void Configure(EntityTypeBuilder<PlaceView> builder)
    {
        builder.ToTable("place_views", "place");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(x => x.PlaceId).HasColumnName("place_id").IsRequired();
        builder.Property(x => x.DurationSeconds).HasColumnName("duration_seconds");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();

        builder.HasIndex(x => x.PlaceId).HasDatabaseName("ix_place_views_place_id");
        builder.HasIndex(x => x.UserId).HasDatabaseName("ix_place_views_user_id");
        builder.HasIndex(x => x.CreatedAt).HasDatabaseName("ix_place_views_created_at");
    }
}
