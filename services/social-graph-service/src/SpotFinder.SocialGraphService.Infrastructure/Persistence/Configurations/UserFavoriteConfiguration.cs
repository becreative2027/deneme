using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.SocialGraphService.Domain.Entities;

namespace SpotFinder.SocialGraphService.Infrastructure.Persistence.Configurations;

public sealed class UserFavoriteConfiguration : IEntityTypeConfiguration<UserFavorite>
{
    public void Configure(EntityTypeBuilder<UserFavorite> builder)
    {
        builder.ToTable("user_favorites");
        builder.HasKey(f => new { f.UserId, f.PlaceId });
        builder.Property(f => f.UserId).HasColumnName("user_id");
        builder.Property(f => f.PlaceId).HasColumnName("place_id");
        builder.Property(f => f.CreatedAt).HasColumnName("created_at");
    }
}
