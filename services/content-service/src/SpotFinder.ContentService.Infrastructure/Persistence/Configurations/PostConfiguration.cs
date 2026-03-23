using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.ContentService.Domain.Entities;

namespace SpotFinder.ContentService.Infrastructure.Persistence.Configurations;

public sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("posts");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(p => p.PlaceId).HasColumnName("place_id").IsRequired();
        builder.Property(p => p.Caption).HasColumnName("caption").HasMaxLength(2000);
        builder.Property(p => p.LikeCount).HasColumnName("like_count");
        builder.Property(p => p.CommentCount).HasColumnName("comment_count");
        builder.Property(p => p.FeedScore).HasColumnName("feed_score");
        builder.Property(p => p.IsDeleted).HasColumnName("is_deleted");
        builder.Property(p => p.Status).HasColumnName("status").IsRequired().HasMaxLength(20).HasDefaultValue("active");
        builder.Property(p => p.HiddenReason).HasColumnName("hidden_reason").HasMaxLength(500);
        builder.Property(p => p.ModeratedAt).HasColumnName("moderated_at");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");

        builder.HasQueryFilter(p => !p.IsDeleted && p.Status != "hidden");

        builder.HasMany(p => p.Media).WithOne().HasForeignKey(m => m.PostId);
        builder.HasMany(p => p.Likes).WithOne().HasForeignKey(l => l.PostId);
        builder.HasMany(p => p.Comments).WithOne().HasForeignKey(c => c.PostId);
    }
}
