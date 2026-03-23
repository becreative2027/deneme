using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.AdminService.Domain.Entities;

namespace SpotFinder.AdminService.Infrastructure.Persistence.Configurations;

public sealed class FeatureFlagConfiguration : IEntityTypeConfiguration<FeatureFlag>
{
    public void Configure(EntityTypeBuilder<FeatureFlag> builder)
    {
        builder.ToTable("feature_flags", "admin");
        builder.HasKey(f => f.Key);
        builder.Property(f => f.Key).HasColumnName("key").IsRequired();
        builder.Property(f => f.IsEnabled).HasColumnName("is_enabled");
        builder.Property(f => f.RolloutPercentage).HasColumnName("rollout_percentage");
        builder.Property(f => f.Target).HasColumnName("target").HasColumnType("jsonb");
        builder.Property(f => f.UpdatedAt).HasColumnName("updated_at");
    }
}
