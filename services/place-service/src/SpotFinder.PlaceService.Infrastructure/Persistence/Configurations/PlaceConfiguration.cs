using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Infrastructure.Persistence.Configurations;

public sealed class PlaceConfiguration : IEntityTypeConfiguration<Place>
{
    public void Configure(EntityTypeBuilder<Place> builder)
    {
        builder.ToTable("places");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(p => p.GooglePlaceId).HasMaxLength(500);
        builder.Property(p => p.CoverImageUrl).HasColumnName("cover_image_url");
        builder.Property(p => p.MenuUrl).HasColumnName("menu_url");
        builder.Property(p => p.MenuImageUrls)
            .HasColumnName("menu_image_urls")
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'[]'::jsonb")
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>());
        builder.Property(p => p.ParkingStatus).HasDefaultValue("unavailable").HasMaxLength(20);
        builder.Property(p => p.PriceLevel).HasColumnName("price_level");
        builder.Property(p => p.VenueType).HasColumnName("venue_type").HasMaxLength(50);
        builder.Property(p => p.Rating).HasPrecision(2, 1);
        builder.Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
        builder.HasIndex(p => p.GooglePlaceId).IsUnique()
            .HasFilter("google_place_id IS NOT NULL");
        builder.HasMany(p => p.Translations).WithOne()
            .HasForeignKey(t => t.PlaceId).OnDelete(DeleteBehavior.Cascade);
        builder.Ignore(p => p.DomainEvents);
    }
}
