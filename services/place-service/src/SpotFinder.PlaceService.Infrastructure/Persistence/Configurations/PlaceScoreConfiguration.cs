using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Infrastructure.Persistence.Configurations;

public sealed class PlaceScoreConfiguration : IEntityTypeConfiguration<PlaceScore>
{
    public void Configure(EntityTypeBuilder<PlaceScore> builder)
    {
        builder.ToTable("place_scores");
        builder.HasKey(s => s.PlaceId);
        builder.Property(s => s.PlaceId).ValueGeneratedNever();
        builder.Ignore(s => s.Id);
        builder.Property(s => s.PopularityScore).HasPrecision(5, 2);
        builder.Property(s => s.QualityScore).HasPrecision(5, 2);
        builder.Property(s => s.TrendScore).HasPrecision(5, 2);
        builder.Property(s => s.FinalScore).HasPrecision(5, 2);
        builder.Property(s => s.UpdatedAt).HasDefaultValueSql("NOW()");
    }
}
