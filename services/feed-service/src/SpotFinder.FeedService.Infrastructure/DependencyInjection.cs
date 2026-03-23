using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SpotFinder.FeedService.Infrastructure.Configuration;
using SpotFinder.FeedService.Infrastructure.Persistence;
using SpotFinder.FeedService.Infrastructure.Services;
using StackExchange.Redis;

namespace SpotFinder.FeedService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("FeedDb")
                            ?? configuration.GetConnectionString("DefaultConnection");

        // Read-only, migration-less cross-schema context — query handlers only
        services.AddDbContext<FeedQueryDbContext>(options =>
            options.UseNpgsql(connectionString)
                   .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));

        // Phase 7.2 — bind recommendation config; handlers read via IOptions<RecommendationOptions>.
        services.Configure<RecommendationOptions>(
            configuration.GetSection(RecommendationOptions.SectionName));

        services.PostConfigure<RecommendationOptions>(opts =>
        {
            if (!opts.ExploreBlend.IsValid(out var dev))
                throw new InvalidOperationException(
                    $"Recommendation:ExploreBlend ratios sum to {1 - dev:F3}, expected 1.0 (±0.01).");

            if (!opts.ExploreBlendVariantB.IsValid(out var devB))
                throw new InvalidOperationException(
                    $"Recommendation:ExploreBlendVariantB ratios sum to {1 - devB:F3}, expected 1.0 (±0.01).");
        });

        // Phase 7.3 — dynamic config + feature flags (reads admin schema via FeedQueryDbContext)
        services.AddScoped<IRuntimeConfigService, RuntimeConfigService>();
        services.AddScoped<IFeatureFlagService, FeatureFlagService>();

        // Phase 7.4 — Redis pub/sub subscriber for near-real-time cache invalidation.
        // If Redis connection string is absent, the invalidator is simply not registered
        // and services fall back to 5-minute TTL invalidation.
        var redisConn = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrWhiteSpace(redisConn))
        {
            services.AddSingleton<IConnectionMultiplexer>(
                _ => ConnectionMultiplexer.Connect(redisConn));
            services.AddHostedService<ConfigCacheInvalidator>();
        }

        return services;
    }
}
