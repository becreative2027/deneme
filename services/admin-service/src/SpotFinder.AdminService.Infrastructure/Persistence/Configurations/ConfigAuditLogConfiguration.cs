using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.AdminService.Domain.Entities;

namespace SpotFinder.AdminService.Infrastructure.Persistence.Configurations;

public sealed class ConfigAuditLogConfiguration : IEntityTypeConfiguration<ConfigAuditLog>
{
    public void Configure(EntityTypeBuilder<ConfigAuditLog> builder)
    {
        builder.ToTable("config_audit_logs", "admin");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id");
        builder.Property(a => a.Key).HasColumnName("key").IsRequired();
        builder.Property(a => a.OldValue).HasColumnName("old_value").HasColumnType("jsonb");
        builder.Property(a => a.NewValue).HasColumnName("new_value").HasColumnType("jsonb").IsRequired();
        builder.Property(a => a.ChangedBy).HasColumnName("changed_by").IsRequired();
        builder.Property(a => a.ChangeReason).HasColumnName("change_reason").IsRequired();
        builder.Property(a => a.CreatedAt).HasColumnName("created_at");
        builder.HasIndex(a => new { a.Key, a.CreatedAt });
    }
}
