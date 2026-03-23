using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.ContentService.Infrastructure.Abstractions;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.Infrastructure.Services;

/// <summary>
/// Writes to <c>content.user_events</c> via a single parameterised INSERT.
/// Errors are caught and logged, never re-thrown — this is a best-effort
/// analytics sink that must not affect the main write path.
///
/// Phase 7.2 — adds optional <c>payload</c> (JSONB) support for dwell-time
/// and future rich-signal events.
/// </summary>
public sealed class UserEventService : IUserEventService
{
    private readonly ContentDbContext _db;
    private readonly ILogger<UserEventService> _logger;

    public UserEventService(ContentDbContext db, ILogger<UserEventService> logger)
    {
        _db     = db;
        _logger = logger;
    }

    public async Task LogAsync(
        Guid    userId,
        string  eventType,
        Guid?   postId,
        Guid?   placeId,
        string? payload      = null,
        CancellationToken ct = default)
    {
        try
        {
            // payload is cast to JSONB; NULL::jsonb is valid in PostgreSQL.
            await _db.Database.ExecuteSqlAsync(
                $"""
                INSERT INTO content.user_events (user_id, event_type, post_id, place_id, payload, created_at)
                VALUES ({userId}, {eventType}, {postId}, {placeId}, {payload}::jsonb, NOW())
                """, ct);

            _logger.LogDebug(
                "UserEventService — logged event={EventType} userId={UserId} postId={PostId}",
                eventType, userId, postId);
        }
        catch (Exception ex)
        {
            // Event logging is non-critical; swallow and log rather than
            // propagating an error that would roll back the main transaction.
            _logger.LogWarning(
                ex,
                "UserEventService — failed to log event={EventType} userId={UserId}; continuing",
                eventType, userId);
        }
    }
}
