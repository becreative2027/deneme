using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.IdentityService.Domain.Entities;

namespace SpotFinder.IdentityService.Infrastructure.Persistence.Configurations;

public sealed class PlaceOwnershipConfiguration : IEntityTypeConfiguration<PlaceOwnership>
{
    public void Configure(EntityTypeBuilder<PlaceOwnership> b)
    {
        b.ToTable("place_ownerships", "identity");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id").UseIdentityAlwaysColumn();
        b.Property(x => x.UserId).HasColumnName("user_id");
        b.Property(x => x.PlaceId).HasColumnName("place_id");
        b.Property(x => x.GrantedAt).HasColumnName("granted_at");
        b.Property(x => x.GrantedBy).HasColumnName("granted_by");
        b.HasIndex(x => new { x.UserId, x.PlaceId }).IsUnique();
        b.HasIndex(x => x.PlaceId);
    }
}
