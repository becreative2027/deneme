using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Infrastructure.Persistence.Configurations;

public sealed class PlaceReviewConfiguration : IEntityTypeConfiguration<PlaceReview>
{
    public void Configure(EntityTypeBuilder<PlaceReview> builder)
    {
        builder.ToTable("place_reviews", "place");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(x => x.PlaceId).IsRequired();
        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.Username).HasMaxLength(100).IsRequired();
        builder.Property(x => x.DisplayName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.AvatarUrl).HasMaxLength(500);
        builder.Property(x => x.Rating).IsRequired();
        builder.Property(x => x.Comment).HasMaxLength(2000);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(x => x.UpdatedAt);

        builder.HasIndex(x => new { x.PlaceId, x.UserId }).IsUnique();
        builder.HasIndex(x => x.PlaceId);
    }
}
