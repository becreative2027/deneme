using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.GeoService.Domain.Repositories;
using SpotFinder.GeoService.Infrastructure.Persistence;
using SpotFinder.GeoService.Infrastructure.Repositories;

namespace SpotFinder.GeoService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<GeoDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection") ?? configuration.GetConnectionString("GeoDb"))
                   .UseSnakeCaseNamingConvention());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<GeoDbContext>());
        services.AddScoped<ILanguageRepository, LanguageRepository>();
        services.AddScoped<ICountryRepository, CountryRepository>();
        services.AddScoped<ICityRepository, CityRepository>();
        services.AddScoped<IDistrictRepository, DistrictRepository>();
        return services;
    }
}
