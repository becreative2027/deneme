using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.IdentityService.Domain.Entities;

namespace SpotFinder.IdentityService.Infrastructure.Persistence.Configurations;

public sealed class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("profiles");
        builder.HasKey(p => p.UserId);
        builder.Property(p => p.UserId).HasColumnName("user_id");
        builder.Property(p => p.DisplayName).HasColumnName("display_name").HasMaxLength(100);
        builder.Property(p => p.Bio).HasColumnName("bio").HasMaxLength(500);
        builder.Property(p => p.ProfileImageUrl).HasColumnName("profile_image_url").HasMaxLength(2048);
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
    }
}
