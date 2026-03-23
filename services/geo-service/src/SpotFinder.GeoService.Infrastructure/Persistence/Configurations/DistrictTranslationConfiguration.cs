using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Infrastructure.Persistence.Configurations;

public sealed class DistrictTranslationConfiguration : IEntityTypeConfiguration<DistrictTranslation>
{
    public void Configure(EntityTypeBuilder<DistrictTranslation> builder)
    {
        builder.ToTable("district_translations");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).UseIdentityAlwaysColumn();
        builder.Property(t => t.Name).IsRequired();
        builder.Property(t => t.Slug).HasMaxLength(200);
        builder.HasIndex(t => new { t.DistrictId, t.LanguageId }).IsUnique();
        builder.Property(t => t.LanguageId).IsRequired();
    }
}
