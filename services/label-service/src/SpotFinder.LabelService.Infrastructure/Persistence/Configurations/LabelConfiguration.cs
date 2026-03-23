using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Infrastructure.Persistence.Configurations;

public sealed class LabelConfiguration : IEntityTypeConfiguration<Label>
{
    public void Configure(EntityTypeBuilder<Label> builder)
    {
        builder.ToTable("labels");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).UseIdentityAlwaysColumn();
        builder.Property(l => l.CategoryId).HasColumnName("category_id");
        builder.Property(l => l.Key).IsRequired().HasColumnName("key");
        builder.HasIndex(l => l.Key).IsUnique();
        builder.Property(l => l.IsActive).HasDefaultValue(true).HasColumnName("is_active");
        builder.Property(l => l.CreatedAt).HasColumnName("created_at");
        builder.Ignore(l => l.DomainEvents);

        builder.HasMany(l => l.Translations)
            .WithOne()
            .HasForeignKey(t => t.LabelId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Keywords)
            .WithOne()
            .HasForeignKey(k => k.LabelId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
