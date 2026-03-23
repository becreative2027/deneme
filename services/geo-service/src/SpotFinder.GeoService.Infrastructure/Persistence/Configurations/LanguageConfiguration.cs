using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Infrastructure.Persistence.Configurations;

public sealed class LanguageConfiguration : IEntityTypeConfiguration<Language>
{
    public void Configure(EntityTypeBuilder<Language> builder)
    {
        builder.ToTable("languages");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).UseIdentityAlwaysColumn();
        builder.Property(l => l.Code).IsRequired().HasMaxLength(10);
        builder.Property(l => l.Name).IsRequired();
        builder.Property(l => l.CreatedAt).HasDefaultValueSql("NOW()");
        builder.HasIndex(l => l.Code).IsUnique();
    }
}
