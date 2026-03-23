using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Infrastructure.Persistence.Configurations;

public sealed class CityConfiguration : IEntityTypeConfiguration<City>
{
    public void Configure(EntityTypeBuilder<City> builder)
    {
        builder.ToTable("cities");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).UseIdentityAlwaysColumn();
        builder.Property(c => c.CreatedAt).HasDefaultValueSql("NOW()");
        builder.HasMany(c => c.Translations).WithOne()
            .HasForeignKey(t => t.CityId).OnDelete(DeleteBehavior.Cascade);
        builder.Ignore(c => c.DomainEvents);
    }
}
