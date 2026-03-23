using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.AdminService.Domain.Entities;

namespace SpotFinder.AdminService.Infrastructure.Persistence.Configurations;

public sealed class RuntimeConfigConfiguration : IEntityTypeConfiguration<RuntimeConfig>
{
    public void Configure(EntityTypeBuilder<RuntimeConfig> builder)
    {
        builder.ToTable("runtime_configs", "admin");
        builder.HasKey(r => r.Key);
        builder.Property(r => r.Key).HasColumnName("key").IsRequired();
        builder.Property(r => r.Value).HasColumnName("value").HasColumnType("jsonb").IsRequired();
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at");
    }
}
