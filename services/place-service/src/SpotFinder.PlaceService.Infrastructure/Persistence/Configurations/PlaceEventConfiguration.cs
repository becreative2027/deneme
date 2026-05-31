using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Infrastructure.Persistence.Configurations;

public sealed class PlaceEventConfiguration : IEntityTypeConfiguration<PlaceEvent>
{
    public void Configure(EntityTypeBuilder<PlaceEvent> b)
    {
        b.ToTable("place_events", "place");
        b.HasKey(e => e.Id);

        b.Property(e => e.Id).HasColumnName("id");
        b.Property(e => e.PlaceId).HasColumnName("place_id");
        b.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
        b.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
        b.Property(e => e.StartsAt).HasColumnName("starts_at");
        b.Property(e => e.EndsAt).HasColumnName("ends_at");
        b.Property(e => e.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
        b.Property(e => e.CreatedBy).HasColumnName("created_by").HasMaxLength(200);
        b.Property(e => e.CreatedAt).HasColumnName("created_at");

        b.HasIndex(e => e.PlaceId).HasDatabaseName("ix_place_events_place_id");
        b.HasIndex(e => e.StartsAt).HasDatabaseName("ix_place_events_starts_at");
    }
}
