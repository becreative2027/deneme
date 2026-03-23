namespace SpotFinder.ContentService.Infrastructure.Abstractions;

/// <summary>
/// Logs user interaction events into <c>content.user_events</c>
/// for future ML model training, analytics, and debugging.
///
/// Event types (use <c>UserEventTypes</c> constants):
///   like / unlike / comment / post_create / dwell
///
/// Errors are caught and logged internally; callers must not depend
/// on this operation completing successfully (fire-and-observe).
///
/// Security: userId is always sourced from the JWT, never from the client.
/// </summary>
public interface IUserEventService
{
    /// <param name="payload">
    ///   Optional JSON payload stored in <c>content.user_events.payload</c> (JSONB).
    ///   Used for dwell events: <c>{"durationMs": 4200}</c>.
    /// </param>
    Task LogAsync(
        Guid    userId,
        string  eventType,
        Guid?   postId,
        Guid?   placeId,
        string? payload      = null,
        CancellationToken ct = default);
}
