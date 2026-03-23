using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.LabelService.Domain.Repositories;
using SpotFinder.LabelService.Infrastructure.Persistence;
using SpotFinder.LabelService.Infrastructure.Repositories;

namespace SpotFinder.LabelService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<LabelDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("LabelDb")));
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<LabelDbContext>());
        services.AddScoped<ILabelCategoryRepository, LabelCategoryRepository>();
        services.AddScoped<ILabelRepository, LabelRepository>();
        services.AddScoped<IPlaceLabelRepository, PlaceLabelRepository>();
        return services;
    }
}
