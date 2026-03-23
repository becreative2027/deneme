using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.AdminService.Domain.Entities;

namespace SpotFinder.AdminService.Infrastructure.Persistence.Configurations;

public sealed class RuntimeConfigVersionConfiguration : IEntityTypeConfiguration<RuntimeConfigVersion>
{
    public void Configure(EntityTypeBuilder<RuntimeConfigVersion> builder)
    {
        builder.ToTable("runtime_config_versions", "admin");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasColumnName("id");
        builder.Property(v => v.Key).HasColumnName("key").IsRequired();
        builder.Property(v => v.Value).HasColumnName("value").HasColumnType("jsonb").IsRequired();
        builder.Property(v => v.Version).HasColumnName("version");
        builder.Property(v => v.CreatedAt).HasColumnName("created_at");
        builder.Property(v => v.CreatedBy).HasColumnName("created_by").IsRequired();
        builder.Property(v => v.ChangeReason).HasColumnName("change_reason").IsRequired();
        builder.HasIndex(v => new { v.Key, v.Version }).IsUnique();
    }
}
