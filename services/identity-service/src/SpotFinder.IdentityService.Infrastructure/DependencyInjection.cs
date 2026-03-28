using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Domain.Services;
using SpotFinder.IdentityService.Infrastructure.Persistence;
using SpotFinder.IdentityService.Infrastructure.Repositories;
using SpotFinder.IdentityService.Infrastructure.Services;

namespace SpotFinder.IdentityService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("IdentityDb")));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<IdentityDbContext>());
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        services.AddScoped<IPlaceOwnershipRepository, PlaceOwnershipRepository>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        return services;
    }
}
