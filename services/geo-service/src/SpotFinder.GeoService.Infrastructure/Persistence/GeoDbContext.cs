using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Infrastructure.Persistence;

public sealed class GeoDbContext : DbContext, IUnitOfWork
{
    public GeoDbContext(DbContextOptions<GeoDbContext> options) : base(options) { }

    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<CountryTranslation> CountryTranslations => Set<CountryTranslation>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<CityTranslation> CityTranslations => Set<CityTranslation>();
    public DbSet<District> Districts => Set<District>();
    public DbSet<DistrictTranslation> DistrictTranslations => Set<DistrictTranslation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("geo");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GeoDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
