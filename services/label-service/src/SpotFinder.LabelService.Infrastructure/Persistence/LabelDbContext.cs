using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Infrastructure.Persistence;

public sealed class LabelDbContext : DbContext, IUnitOfWork
{
    public LabelDbContext(DbContextOptions<LabelDbContext> options) : base(options) { }

    public DbSet<LabelCategory> LabelCategories => Set<LabelCategory>();
    public DbSet<LabelCategoryTranslation> LabelCategoryTranslations => Set<LabelCategoryTranslation>();
    public DbSet<Label> Labels => Set<Label>();
    public DbSet<LabelTranslation> LabelTranslations => Set<LabelTranslation>();
    public DbSet<LabelKeyword> LabelKeywords => Set<LabelKeyword>();
    public DbSet<PlaceLabel> PlaceLabels => Set<PlaceLabel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("label");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LabelDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
