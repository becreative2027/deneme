using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.AdminService.Domain.Entities;

namespace SpotFinder.AdminService.Infrastructure.Persistence.Configurations;

public sealed class PlaceNotificationConfiguration : IEntityTypeConfiguration<PlaceNotification>
{
    public void Configure(EntityTypeBuilder<PlaceNotification> b)
    {
        b.ToTable("place_notifications", "admin");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.PlaceId).HasColumnName("place_id");
        b.Property(x => x.Title).HasColumnName("title").IsRequired().HasMaxLength(80);
        b.Property(x => x.Body).HasColumnName("body").IsRequired().HasMaxLength(300);
        b.Property(x => x.Type).HasColumnName("type").IsRequired().HasMaxLength(50);
        b.Property(x => x.Audience).HasColumnName("audience");
        b.Property(x => x.SentBy).HasColumnName("sent_by").IsRequired().HasMaxLength(256);
        b.Property(x => x.RecipientCount).HasColumnName("recipient_count");
        b.Property(x => x.SentAt).HasColumnName("sent_at");

        b.HasIndex(x => x.PlaceId);
        b.HasIndex(x => x.SentAt);
    }
}
