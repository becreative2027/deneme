using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.ContentService.Domain.Entities;

namespace SpotFinder.ContentService.Infrastructure.Persistence.Configurations;

public sealed class PostCommentConfiguration : IEntityTypeConfiguration<PostComment>
{
    public void Configure(EntityTypeBuilder<PostComment> builder)
    {
        builder.ToTable("post_comments");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");
        builder.Property(c => c.PostId).HasColumnName("post_id");
        builder.Property(c => c.UserId).HasColumnName("user_id");
        builder.Property(c => c.Text).HasColumnName("text").IsRequired().HasMaxLength(2000);
        builder.Property(c => c.CreatedAt).HasColumnName("created_at");
    }
}
