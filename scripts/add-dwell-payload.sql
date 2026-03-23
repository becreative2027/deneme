-- Phase 7.2 — Dwell-time signal infrastructure
--
-- Adds an optional JSONB payload column to content.user_events so that
-- rich event data (e.g. dwell duration) can be stored alongside the event.
--
-- Usage:
--   dwell event  → payload = '{"durationMs": 4200}'
--   other events → payload = NULL  (backward-compatible; no existing rows change)
--
-- Run once against the target database. Idempotent (IF NOT EXISTS guard).

ALTER TABLE content.user_events
    ADD COLUMN IF NOT EXISTS payload JSONB;

-- Index for fast aggregation of dwell events by post (see spec §7.2 dwell query)
CREATE INDEX IF NOT EXISTS idx_user_events_dwell
    ON content.user_events (post_id, created_at DESC)
    WHERE event_type = 'dwell';

ANALYZE content.user_events;
