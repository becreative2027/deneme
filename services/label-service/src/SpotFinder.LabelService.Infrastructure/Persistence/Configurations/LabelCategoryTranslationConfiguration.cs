using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Infrastructure.Persistence.Configurations;

public sealed class LabelCategoryTranslationConfiguration : IEntityTypeConfiguration<LabelCategoryTranslation>
{
    public void Configure(EntityTypeBuilder<LabelCategoryTranslation> builder)
    {
        builder.ToTable("label_category_translations");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).UseIdentityAlwaysColumn();
        builder.Property(t => t.CategoryId).HasColumnName("category_id");
        builder.Property(t => t.LanguageId).HasColumnName("language_id");
        builder.Property(t => t.DisplayName).IsRequired().HasColumnName("display_name");
        builder.HasIndex(t => new { t.CategoryId, t.LanguageId }).IsUnique();
    }
}
