using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Infrastructure.Persistence.Configurations;

public sealed class LabelCategoryConfiguration : IEntityTypeConfiguration<LabelCategory>
{
    public void Configure(EntityTypeBuilder<LabelCategory> builder)
    {
        builder.ToTable("label_categories");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).UseIdentityAlwaysColumn();
        builder.Property(c => c.Key).IsRequired().HasColumnName("key");
        builder.HasIndex(c => c.Key).IsUnique();
        builder.Property(c => c.CreatedAt).HasColumnName("created_at");
        builder.Ignore(c => c.DomainEvents);

        builder.HasMany(c => c.Translations)
            .WithOne()
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Labels)
            .WithOne()
            .HasForeignKey(l => l.CategoryId);
    }
}
