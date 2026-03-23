using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Infrastructure.Persistence.Configurations;

public sealed class CountryConfiguration : IEntityTypeConfiguration<Country>
{
    public void Configure(EntityTypeBuilder<Country> builder)
    {
        builder.ToTable("countries");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).UseIdentityAlwaysColumn();
        builder.Property(c => c.Code).IsRequired().HasMaxLength(3);
        builder.Property(c => c.CreatedAt).HasDefaultValueSql("NOW()");
        builder.HasIndex(c => c.Code).IsUnique();
        builder.HasMany(c => c.Translations).WithOne()
            .HasForeignKey(t => t.CountryId).OnDelete(DeleteBehavior.Cascade);
        builder.Ignore(c => c.DomainEvents);
    }
}
