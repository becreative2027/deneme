using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Infrastructure.Persistence.Configurations;

public sealed class PlaceLabelConfiguration : IEntityTypeConfiguration<PlaceLabel>
{
    public void Configure(EntityTypeBuilder<PlaceLabel> builder)
    {
        builder.ToTable("place_labels");
        builder.HasKey(pl => new { pl.PlaceId, pl.LabelId });
        builder.Property(pl => pl.PlaceId).HasColumnName("place_id");
        builder.Property(pl => pl.LabelId).HasColumnName("label_id");
        builder.Property(pl => pl.Weight).HasPrecision(3, 2).HasDefaultValue(1.0m).HasColumnName("weight");
        builder.Property(pl => pl.CreatedAt).HasColumnName("created_at");
    }
}
