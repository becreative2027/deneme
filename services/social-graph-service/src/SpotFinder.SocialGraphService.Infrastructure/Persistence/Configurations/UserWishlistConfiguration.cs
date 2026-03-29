using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.SocialGraphService.Domain.Entities;

namespace SpotFinder.SocialGraphService.Infrastructure.Persistence.Configurations;

public sealed class UserWishlistConfiguration : IEntityTypeConfiguration<UserWishlist>
{
    public void Configure(EntityTypeBuilder<UserWishlist> builder)
    {
        builder.ToTable("user_wishlists");
        builder.HasKey(w => new { w.UserId, w.PlaceId });
        builder.Property(w => w.UserId).HasColumnName("user_id");
        builder.Property(w => w.PlaceId).HasColumnName("place_id");
        builder.Property(w => w.CreatedAt).HasColumnName("created_at");
    }
}
