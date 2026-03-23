using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.AdminService.Domain.Entities;

namespace SpotFinder.AdminService.Infrastructure.Persistence.Configurations;

public sealed class ModerationItemConfiguration : IEntityTypeConfiguration<ModerationItem>
{
    public void Configure(EntityTypeBuilder<ModerationItem> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.AdminNote).HasMaxLength(1000);
        builder.HasIndex(m => new { m.TargetType, m.TargetId });
        builder.HasIndex(m => m.Status);
        builder.Ignore("DomainEvents");
    }
}
