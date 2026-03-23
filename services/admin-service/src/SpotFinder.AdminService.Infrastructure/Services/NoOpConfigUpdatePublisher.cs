namespace SpotFinder.AdminService.Infrastructure.Services;

/// <summary>
/// Phase 7.4 — No-op publisher used when Redis is not configured.
/// Falls back gracefully; consumers rely on cache TTL for eventual propagation.
/// </summary>
internal sealed class NoOpConfigUpdatePublisher : IConfigUpdatePublisher
{
    public Task PublishConfigChangedAsync(string key, CancellationToken ct = default) => Task.CompletedTask;
    public Task PublishFlagsChangedAsync(CancellationToken ct = default) => Task.CompletedTask;
}
