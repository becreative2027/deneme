using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Domain.Entities;

namespace SpotFinder.IdentityService.Infrastructure.Persistence;

public sealed class IdentityDbContext : DbContext, IUnitOfWork
{
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserProfile> Profiles => Set<UserProfile>();
    public DbSet<PlaceOwnership> PlaceOwnerships => Set<PlaceOwnership>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("identity");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IdentityDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
