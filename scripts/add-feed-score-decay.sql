-- ============================================================
-- Phase 6.3 — Feed Score Time Decay
-- Run once against the shared PostgreSQL instance.
-- Applies the new decay-based formula to existing rows and
-- ensures the ranking index is optimal for the updated column.
-- ============================================================

-- 1. Backfill ALL existing posts with the decay formula.
--    Posts older than 48 h will get score = 0 (they've fully decayed).
--    The background job (FeedScoreRefreshJob) will keep recent posts
--    refreshed from this point on.
UPDATE content.posts
SET    feed_score = GREATEST(0, FLOOR(
           (like_count * 2 + comment_count * 3)
           + CASE
               WHEN EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 < 3
               THEN 3
               ELSE 0
             END
           - (EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 * 0.5)
       ));

-- 2. Recreate the feed ranking index so it reflects the post-backfill
--    distribution (the planner will build fresh statistics on it).
--    Shape is unchanged from Phase 6.2 — this is a no-op if already current.
DROP INDEX IF EXISTS content.idx_posts_feed_score;

CREATE INDEX idx_posts_feed_score
    ON content.posts (feed_score DESC, created_at DESC, id DESC)
    WHERE is_deleted = false AND status != 'hidden';

-- 3. Optional: ANALYZE to give the planner fresh statistics immediately.
ANALYZE content.posts;
