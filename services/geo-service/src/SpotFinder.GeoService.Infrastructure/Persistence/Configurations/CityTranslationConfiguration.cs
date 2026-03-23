using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Infrastructure.Persistence.Configurations;

public sealed class CityTranslationConfiguration : IEntityTypeConfiguration<CityTranslation>
{
    public void Configure(EntityTypeBuilder<CityTranslation> builder)
    {
        builder.ToTable("city_translations");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).UseIdentityAlwaysColumn();
        builder.Property(t => t.Name).IsRequired();
        builder.Property(t => t.Slug).HasMaxLength(200);
        builder.HasIndex(t => new { t.CityId, t.LanguageId }).IsUnique();
        builder.Property(t => t.LanguageId).IsRequired();
    }
}
