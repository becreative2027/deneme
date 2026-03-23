namespace SpotFinder.ContentService.Application.Constants;

/// <summary>
/// Type-safe constants for <c>content.user_events.event_type</c>.
///
/// Phase 7.2 — replaces raw string literals in handlers to eliminate
/// typo risk and make event types discoverable / refactorable.
/// </summary>
public static class UserEventTypes
{
    public const string Like       = "like";
    public const string Unlike     = "unlike";
    public const string Comment    = "comment";
    public const string PostCreate = "post_create";

    /// <summary>
    /// Dwell — user viewed a post for a measurable duration.
    /// Payload: <c>{"durationMs": &lt;int&gt;}</c>
    /// </summary>
    public const string Dwell = "dwell";
}
