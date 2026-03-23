using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.AdminService.Domain.Entities;

namespace SpotFinder.AdminService.Infrastructure.Persistence.Configurations;

/// <summary>Phase 7.5 — EF Core configuration for admin.pending_config_changes.</summary>
public sealed class PendingConfigChangeConfiguration : IEntityTypeConfiguration<PendingConfigChange>
{
    public void Configure(EntityTypeBuilder<PendingConfigChange> b)
    {
        b.ToTable("pending_config_changes", "admin");

        b.HasKey(p => p.Id);
        b.Property(p => p.Id).HasColumnName("id");

        b.Property(p => p.Key)
            .HasColumnName("key")
            .IsRequired();

        b.Property(p => p.Value)
            .HasColumnName("value")
            .HasColumnType("jsonb")
            .IsRequired();

        b.Property(p => p.RequestedBy)
            .HasColumnName("requested_by")
            .IsRequired();

        b.Property(p => p.RequestReason)
            .HasColumnName("request_reason")
            .IsRequired();

        b.Property(p => p.Status)
            .HasColumnName("status")
            .IsRequired();

        b.Property(p => p.ReviewedBy).HasColumnName("reviewed_by");
        b.Property(p => p.ReviewReason).HasColumnName("review_reason");

        b.Property(p => p.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");

        b.Property(p => p.ReviewedAt)
            .HasColumnName("reviewed_at")
            .HasColumnType("timestamptz");

        b.HasIndex(p => new { p.Key, p.Status })
            .HasDatabaseName("ix_pending_config_changes_key_status");
    }
}
