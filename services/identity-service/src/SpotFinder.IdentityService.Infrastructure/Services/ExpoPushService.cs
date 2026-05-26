using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace SpotFinder.IdentityService.Infrastructure.Services;

public interface IExpoPushService
{
    Task SendAsync(IReadOnlyList<string> tokens, string title, string body,
        string type, string? userId = null, string? placeId = null,
        string? postId = null, CancellationToken ct = default);
}

public sealed class ExpoPushService : IExpoPushService
{
    private const string ExpoUrl   = "https://exp.host/--/api/v2/push/send";
    private const int    ChunkSize = 100;

    private readonly IHttpClientFactory         _httpFactory;
    private readonly ILogger<ExpoPushService>   _logger;

    public ExpoPushService(IHttpClientFactory httpFactory, ILogger<ExpoPushService> logger)
    {
        _httpFactory = httpFactory;
        _logger      = logger;
    }

    public async Task SendAsync(IReadOnlyList<string> tokens, string title, string body,
        string type, string? userId = null, string? placeId = null,
        string? postId = null, CancellationToken ct = default)
    {
        if (tokens.Count == 0) return;

        var http  = _httpFactory.CreateClient();
        var valid = tokens.Where(t => t.StartsWith("ExponentPushToken[")).ToList();

        for (int i = 0; i < valid.Count; i += ChunkSize)
        {
            var chunk = valid.Skip(i).Take(ChunkSize).Select(token => new ExpoPushMessage
            {
                To    = token,
                Title = title,
                Body  = body,
                Data  = BuildData(type, userId, placeId, postId),
                Sound = "default",
            }).ToList();

            try
            {
                var response = await http.PostAsJsonAsync(ExpoUrl, chunk, ct);
                if (!response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogWarning("Expo push batch failed: {Status} {Body}", response.StatusCode, content);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Expo push error at chunk {Index}", i);
            }
        }
    }

    private static Dictionary<string, string> BuildData(string type, string? userId, string? placeId, string? postId)
    {
        var data = new Dictionary<string, string> { ["type"] = type };
        if (userId  is not null) data["userId"]  = userId;
        if (placeId is not null) data["placeId"] = placeId;
        if (postId  is not null) data["postId"]  = postId;
        return data;
    }
}

file sealed class ExpoPushMessage
{
    [JsonPropertyName("to")]    public string To    { get; set; } = string.Empty;
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("body")]  public string Body  { get; set; } = string.Empty;
    [JsonPropertyName("data")]  public Dictionary<string, string> Data { get; set; } = new();
    [JsonPropertyName("sound")] public string Sound { get; set; } = "default";
}
