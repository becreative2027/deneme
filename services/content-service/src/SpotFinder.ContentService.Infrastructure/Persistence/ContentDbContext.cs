using Microsoft.EntityFrameworkCore;
using SpotFinder.ContentService.Domain.Entities;

namespace SpotFinder.ContentService.Infrastructure.Persistence;

public sealed class ContentDbContext : DbContext
{
    public ContentDbContext(DbContextOptions<ContentDbContext> options) : base(options) { }

    public DbSet<Post>        Posts        => Set<Post>();
    public DbSet<PostMedia>   PostMedia    => Set<PostMedia>();
    public DbSet<PostLike>    PostLikes    => Set<PostLike>();
    public DbSet<PostComment> PostComments => Set<PostComment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("content");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ContentDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
