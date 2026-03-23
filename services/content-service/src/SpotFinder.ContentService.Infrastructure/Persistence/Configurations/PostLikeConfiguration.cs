using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.ContentService.Domain.Entities;

namespace SpotFinder.ContentService.Infrastructure.Persistence.Configurations;

public sealed class PostLikeConfiguration : IEntityTypeConfiguration<PostLike>
{
    public void Configure(EntityTypeBuilder<PostLike> builder)
    {
        builder.ToTable("post_likes");
        builder.HasKey(l => new { l.UserId, l.PostId });
        builder.Property(l => l.UserId).HasColumnName("user_id");
        builder.Property(l => l.PostId).HasColumnName("post_id");
        builder.Property(l => l.CreatedAt).HasColumnName("created_at");
    }
}
