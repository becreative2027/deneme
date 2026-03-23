using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.PlaceService.Domain.Entities;

namespace SpotFinder.PlaceService.Infrastructure.Persistence;

public sealed class PlaceDbContext : DbContext, IUnitOfWork
{
    public PlaceDbContext(DbContextOptions<PlaceDbContext> options) : base(options) { }

    public DbSet<Place> Places => Set<Place>();
    public DbSet<PlaceTranslation> PlaceTranslations => Set<PlaceTranslation>();
    public DbSet<PlaceScore> PlaceScores => Set<PlaceScore>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("place");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PlaceDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
