using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Enums;

namespace SpotFinder.AdminService.Infrastructure.Services;

public sealed class ContentDeletionService : IContentDeletionService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration     _config;
    private readonly ILogger<ContentDeletionService> _logger;

    public ContentDeletionService(
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<ContentDeletionService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _config            = config;
        _logger            = logger;
    }

    public async Task DeleteAsync(ModerationTargetType targetType, Guid targetId, CancellationToken ct = default)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("internal");

            string url = targetType switch
            {
                ModerationTargetType.Post   => $"{_config["Services:ContentService"]}/api/internal/posts/{targetId}",
                ModerationTargetType.Review => $"{_config["Services:PlaceService"]}/api/internal/reviews/{targetId}",
                _                           => throw new NotSupportedException($"Deletion not supported for {targetType}")
            };

            var response = await client.DeleteAsync(url, ct);

            if (!response.IsSuccessStatusCode)
                _logger.LogWarning("Content deletion returned {Status} for {Type}/{Id}", response.StatusCode, targetType, targetId);
        }
        catch (Exception ex)
        {
            // Log but do not fail the moderation approval — content may already be gone
            _logger.LogError(ex, "Failed to delete {Type}/{Id} after moderation approval", targetType, targetId);
        }
    }
}
