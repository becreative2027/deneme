using Microsoft.EntityFrameworkCore;
using SpotFinder.SocialGraphService.Domain.Entities;

namespace SpotFinder.SocialGraphService.Infrastructure.Persistence;

public sealed class SocialDbContext : DbContext
{
    public SocialDbContext(DbContextOptions<SocialDbContext> options) : base(options) { }

    public DbSet<UserFollow>    UserFollows    => Set<UserFollow>();
    public DbSet<UserFavorite>  UserFavorites  => Set<UserFavorite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("social");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SocialDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
