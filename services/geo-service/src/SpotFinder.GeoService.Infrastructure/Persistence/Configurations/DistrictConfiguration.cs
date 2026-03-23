using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Infrastructure.Persistence.Configurations;

public sealed class DistrictConfiguration : IEntityTypeConfiguration<District>
{
    public void Configure(EntityTypeBuilder<District> builder)
    {
        builder.ToTable("districts");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).UseIdentityAlwaysColumn();
        builder.Property(d => d.CreatedAt).HasDefaultValueSql("NOW()");
        builder.HasMany(d => d.Translations).WithOne()
            .HasForeignKey(t => t.DistrictId).OnDelete(DeleteBehavior.Cascade);
        builder.Ignore(d => d.DomainEvents);
    }
}
