using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.PlaceService.Domain.Repositories;
using SpotFinder.PlaceService.Infrastructure.Persistence;
using SpotFinder.PlaceService.Infrastructure.Repositories;

namespace SpotFinder.PlaceService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
                            ?? configuration.GetConnectionString("PlaceDb");

        // Write context — owns migrations, tracks domain entities
        services.AddDbContext<PlaceDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Read context — migration-less, cross-schema, used only by CQRS query handlers
        services.AddDbContext<PlaceQueryDbContext>(options =>
            options.UseNpgsql(connectionString).UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<PlaceDbContext>());
        services.AddScoped<IPlaceRepository, PlaceRepository>();
        services.AddScoped<IPlaceScoreRepository, PlaceScoreRepository>();
        return services;
    }
}
