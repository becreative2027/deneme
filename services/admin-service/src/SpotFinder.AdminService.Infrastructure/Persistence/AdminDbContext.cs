using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Infrastructure.Persistence;

public sealed class AdminDbContext : DbContext, IUnitOfWork
{
    public AdminDbContext(DbContextOptions<AdminDbContext> options) : base(options) { }

    public DbSet<ModerationItem> ModerationItems => Set<ModerationItem>();
    public DbSet<AuditLog>       AuditLogs       => Set<AuditLog>();
    public DbSet<ImportJob>      ImportJobs      => Set<ImportJob>();

    // Phase 7.3 — dynamic config + feature flags
    public DbSet<RuntimeConfig> RuntimeConfigs => Set<RuntimeConfig>();
    public DbSet<FeatureFlag>   FeatureFlags   => Set<FeatureFlag>();

    // Phase 7.4 — versioning + audit
    public DbSet<RuntimeConfigVersion> RuntimeConfigVersions => Set<RuntimeConfigVersion>();
    public DbSet<ConfigAuditLog>       ConfigAuditLogs       => Set<ConfigAuditLog>();

    // Phase 7.5 — approval workflow
    public DbSet<PendingConfigChange> PendingConfigChanges => Set<PendingConfigChange>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("admin");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AdminDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
