using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.SearchService.Infrastructure.Services;

namespace SpotFinder.SearchService.Infrastructure.Persistence;

public sealed class SearchDbContext : DbContext, IUnitOfWork
{
    public SearchDbContext(DbContextOptions<SearchDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("search");
        modelBuilder.Entity<PlaceSearchRaw>().HasNoKey().ToView(null);
        modelBuilder.Entity<CountResult>().HasNoKey().ToView(null);
        base.OnModelCreating(modelBuilder);
    }
}
