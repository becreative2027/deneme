using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpotFinder.ContentService.Infrastructure.Abstractions;
using SpotFinder.ContentService.Infrastructure.BackgroundJobs;
using SpotFinder.ContentService.Infrastructure.Configuration;
using SpotFinder.ContentService.Infrastructure.Persistence;
using SpotFinder.ContentService.Infrastructure.Services;

namespace SpotFinder.ContentService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ContentDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("ContentDb")));

        // Phase 7.2 — bind all recommendation parameters from appsettings.json.
        // Validates at startup that explore-blend ratios sum to ≈ 1.
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

        // Phase 6.3 — recalculates feed_score with time-decay every 5 minutes
        // for posts younger than 48 hours. Runs on startup then on interval.
        services.AddHostedService<FeedScoreRefreshJob>();

        // Phase 7 — user interest model: upserts content.user_interests on
        // Like, Comment, Post Create interactions (weights from config).
        services.AddScoped<IUserInterestService, UserInterestService>();

        // Phase 7 — trending scores: aggregates post activity per place
        // into content.trending_scores on the configured interval.
        services.AddHostedService<TrendingScoreRefreshJob>();

        // Phase 7.1 — interest decay: multiplies all scores by configured rate daily
        // so old interactions fade and the model stays adaptive.
        services.AddHostedService<InterestDecayJob>();

        // Phase 7.1 — event logging: records like/unlike/comment/post_create/dwell
        // events into content.user_events for analytics and future ML use.
        services.AddScoped<IUserEventService, UserEventService>();

        return services;
    }
}
