using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.ContentService.Domain.Entities;

namespace SpotFinder.ContentService.Infrastructure.Persistence.Configurations;

public sealed class PostMediaConfiguration : IEntityTypeConfiguration<PostMedia>
{
    public void Configure(EntityTypeBuilder<PostMedia> builder)
    {
        builder.ToTable("post_media");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id");
        builder.Property(m => m.PostId).HasColumnName("post_id");
        builder.Property(m => m.Url).HasColumnName("url").IsRequired().HasMaxLength(2048);
        builder.Property(m => m.Type).HasColumnName("type").HasMaxLength(50);
        builder.Property(m => m.CreatedAt).HasColumnName("created_at");
    }
}
