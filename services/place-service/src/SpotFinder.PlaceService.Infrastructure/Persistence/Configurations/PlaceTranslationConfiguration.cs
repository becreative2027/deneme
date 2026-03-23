using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Infrastructure.Persistence.Configurations;

public sealed class PlaceTranslationConfiguration : IEntityTypeConfiguration<PlaceTranslation>
{
    public void Configure(EntityTypeBuilder<PlaceTranslation> builder)
    {
        builder.ToTable("place_translations");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).UseIdentityAlwaysColumn();
        builder.Property(t => t.Name).IsRequired();
        builder.Property(t => t.Slug).HasMaxLength(300);
        builder.HasIndex(t => new { t.PlaceId, t.LanguageId }).IsUnique();
        builder.Property(t => t.LanguageId).IsRequired();
    }
}
