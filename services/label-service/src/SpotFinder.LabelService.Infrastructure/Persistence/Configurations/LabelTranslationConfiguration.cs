using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Infrastructure.Persistence.Configurations;

public sealed class LabelTranslationConfiguration : IEntityTypeConfiguration<LabelTranslation>
{
    public void Configure(EntityTypeBuilder<LabelTranslation> builder)
    {
        builder.ToTable("label_translations");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).UseIdentityAlwaysColumn();
        builder.Property(t => t.LabelId).HasColumnName("label_id");
        builder.Property(t => t.LanguageId).HasColumnName("language_id");
        builder.Property(t => t.DisplayName).IsRequired().HasColumnName("display_name");
        builder.HasIndex(t => new { t.LabelId, t.LanguageId }).IsUnique();
    }
}
