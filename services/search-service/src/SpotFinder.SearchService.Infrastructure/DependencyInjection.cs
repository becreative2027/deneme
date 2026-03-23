using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.SearchService.Domain.Services;
using SpotFinder.SearchService.Infrastructure.Persistence;
using SpotFinder.SearchService.Infrastructure.Services;

namespace SpotFinder.SearchService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<SearchDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("SearchDb")));
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<SearchDbContext>());
        services.AddScoped<IPlaceSearchEngine, PostgresPlaceSearchEngine>();
        return services;
    }
}
