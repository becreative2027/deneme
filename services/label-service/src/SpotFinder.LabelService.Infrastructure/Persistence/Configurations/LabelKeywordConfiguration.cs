using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Infrastructure.Persistence.Configurations;

public sealed class LabelKeywordConfiguration : IEntityTypeConfiguration<LabelKeyword>
{
    public void Configure(EntityTypeBuilder<LabelKeyword> builder)
    {
        builder.ToTable("label_keywords");
        builder.HasKey(k => k.Id);
        builder.Property(k => k.Id).UseIdentityAlwaysColumn();
        builder.Property(k => k.LabelId).HasColumnName("label_id");
        builder.Property(k => k.LanguageId).HasColumnName("language_id");
        builder.Property(k => k.Keyword).IsRequired().HasColumnName("keyword");
        builder.Property(k => k.Confidence).HasPrecision(5, 2).HasDefaultValue(1.0m).HasColumnName("confidence");
        builder.Property(k => k.Source).HasColumnName("source");
    }
}
