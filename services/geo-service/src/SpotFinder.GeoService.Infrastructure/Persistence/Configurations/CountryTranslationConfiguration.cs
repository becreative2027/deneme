using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Infrastructure.Persistence.Configurations;

public sealed class CountryTranslationConfiguration : IEntityTypeConfiguration<CountryTranslation>
{
    public void Configure(EntityTypeBuilder<CountryTranslation> builder)
    {
        builder.ToTable("country_translations");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).UseIdentityAlwaysColumn();
        builder.Property(t => t.Name).IsRequired();
        builder.Property(t => t.Slug).HasMaxLength(200);
        builder.HasIndex(t => new { t.CountryId, t.LanguageId }).IsUnique();
        // FK to geo.languages is cross-schema; stored as raw int, not navigated
        builder.Property(t => t.LanguageId).IsRequired();
    }
}
