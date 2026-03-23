using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.SocialGraphService.Domain.Entities;

namespace SpotFinder.SocialGraphService.Infrastructure.Persistence.Configurations;

public sealed class UserFollowConfiguration : IEntityTypeConfiguration<UserFollow>
{
    public void Configure(EntityTypeBuilder<UserFollow> builder)
    {
        builder.ToTable("user_follows");
        builder.HasKey(f => new { f.FollowerId, f.FollowingId });
        builder.Property(f => f.FollowerId).HasColumnName("follower_id");
        builder.Property(f => f.FollowingId).HasColumnName("following_id");
        builder.Property(f => f.CreatedAt).HasColumnName("created_at");
    }
}
