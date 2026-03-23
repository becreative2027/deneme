using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Domain;
namespace SpotFinder.BuildingBlocks.Infrastructure;

public abstract class BaseRepository<TEntity, TId, TContext>
    where TEntity : AggregateRoot<TId>
    where TContext : DbContext
{
    protected readonly TContext DbContext;
    protected BaseRepository(TContext dbContext) { DbContext = dbContext; }
    public virtual async Task<TEntity?> GetByIdAsync(TId id, CancellationToken ct = default)
        => await DbContext.Set<TEntity>().FindAsync([id], ct);
    public virtual async Task AddAsync(TEntity entity, CancellationToken ct = default)
        => await DbContext.Set<TEntity>().AddAsync(entity, ct);
    public virtual void Update(TEntity entity)
        => DbContext.Set<TEntity>().Update(entity);
    public virtual void Remove(TEntity entity)
        => DbContext.Set<TEntity>().Remove(entity);
    public virtual async Task<bool> ExistsAsync(TId id, CancellationToken ct = default)
        => await DbContext.Set<TEntity>().AnyAsync(e => EF.Property<TId>(e, "Id")!.Equals(id), ct);
}
