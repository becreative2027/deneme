-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 7.1 — User Events Table (Analytics / ML Foundation)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Stores immutable interaction events for future ML model training,
-- debugging, and analytics.  Writes are fire-and-forget; this table
-- is NOT on the read-critical path.
--
-- Event types:
--   like         — user liked a post        (interest weight +2)
--   unlike       — user un-liked a post     (interest weight -1)
--   comment      — user commented on a post (interest weight +3)
--   post_create  — user created a post      (interest weight +4)
--
-- Security: userId is always sourced from the JWT inside command handlers,
-- never from client-supplied payload, preventing event spoofing.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS content.user_events (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID      NOT NULL,
    event_type  TEXT      NOT NULL,   -- 'like' | 'unlike' | 'comment' | 'post_create'
    post_id     UUID,
    place_id    UUID,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Query patterns: events by user (timeline), events by type (analytics)
CREATE INDEX IF NOT EXISTS idx_user_events_user
    ON content.user_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_events_type
    ON content.user_events (event_type, created_at DESC);

ANALYZE content.user_events;
