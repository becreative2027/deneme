-- ============================================================
-- Phase 6.2 — Feed Score Materialization
-- Run once against the shared PostgreSQL instance.
-- Adds the precomputed feed_score column to content.posts and
-- backfills existing rows with the base formula (no recency bonus
-- at backfill time). Hereafter the write-side handlers keep it current.
-- ============================================================

-- 1. Add column (safe if already exists)
ALTER TABLE content.posts
    ADD COLUMN IF NOT EXISTS feed_score INTEGER NOT NULL DEFAULT 0;

-- 2. Backfill existing rows with base score (recency bonus not applied
--    at backfill — write-side will keep it fresh from this point on)
UPDATE content.posts
SET    feed_score = (like_count * 2) + (comment_count * 3)
WHERE  feed_score = 0;

-- 3. Primary feed ranking index — used by all three feed queries
--    ORDER BY feed_score DESC, created_at DESC, id DESC
CREATE INDEX IF NOT EXISTS idx_posts_feed_score
    ON content.posts (feed_score DESC, created_at DESC, id DESC)
    WHERE is_deleted = false AND status != 'hidden';

-- 4. Drop the old expression-based rank index (replaced by idx_posts_feed_score)
DROP INDEX IF EXISTS content.idx_posts_place_rank;
