using Microsoft.EntityFrameworkCore;
namespace SpotFinder.CommonTests.Helpers;

public static class FakeDbContextFactory
{
    public static TContext Create<TContext>(string? dbName = null) where TContext : DbContext
    {
        var options = new DbContextOptionsBuilder<TContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;
        return (TContext)Activator.CreateInstance(typeof(TContext), options)!;
    }
}
