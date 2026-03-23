using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.SearchService.Infrastructure.Persistence;

public sealed class SearchDbContext : DbContext, IUnitOfWork
{
    public SearchDbContext(DbContextOptions<SearchDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("search");
        base.OnModelCreating(modelBuilder);
    }
}
