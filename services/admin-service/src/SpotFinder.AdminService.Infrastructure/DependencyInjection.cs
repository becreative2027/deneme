using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Repositories;
using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.BuildingBlocks.Application;
using StackExchange.Redis;

namespace SpotFinder.AdminService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connStr = configuration.GetConnectionString("AdminDb")!;

        // NpgsqlDataSource with EnableDynamicJson() for List<string> <-> jsonb support (Npgsql 8.0+)
        var dataSource = new NpgsqlDataSourceBuilder(connStr)
            .EnableDynamicJson()
            .Build();

        // Admin-schema context (moderation, audit, import jobs)
        services.AddDbContext<AdminDbContext>(options =>
            options.UseNpgsql(dataSource).UseSnakeCaseNamingConvention());

        // Cross-schema write context (place.*, label.*, geo.*)
        services.AddDbContext<AdminWriteDbContext>(options =>
            options.UseNpgsql(dataSource).UseSnakeCaseNamingConvention());

        services.AddMemoryCache(o => o.SizeLimit = 256);
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AdminDbContext>());
        services.AddScoped<IModerationRepository, ModerationRepository>();
        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<IPlaceNotificationRepository, PlaceNotificationRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IImportJobRepository, ImportJobRepository>();

        // Phase 4.1: centralised cache invalidation + write audit logging
        services.AddScoped<ICacheInvalidationService, CacheInvalidationService>();
        services.AddScoped<IAuditService, AuditService>();

        // Content deletion via internal HTTP calls on moderation approval
        services.AddHttpClient("internal");
        services.AddScoped<IContentDeletionService, ContentDeletionService>();

        // Phase 7.4 — Redis pub/sub publisher for config change events.
        // Redis is optional; if no connection string is configured the publisher is a no-op.
        var redisConn = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrWhiteSpace(redisConn))
        {
            services.AddSingleton<IConnectionMultiplexer>(
                _ => ConnectionMultiplexer.Connect(redisConn));
            services.AddScoped<IConfigUpdatePublisher, ConfigUpdatePublisher>();
        }
        else
        {
            services.AddScoped<IConfigUpdatePublisher, NoOpConfigUpdatePublisher>();
        }

        return services;
    }
}
