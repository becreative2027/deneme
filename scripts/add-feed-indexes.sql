-- ============================================================
-- Phase 6 — Feed System: Performance Indexes
-- Run once against the shared PostgreSQL instance.
-- ============================================================

-- ── content.posts ─────────────────────────────────────────────────────────────

-- Phase 6.2: Primary feed ranking index (replaces idx_posts_place_rank).
-- Used by all three feed queries: ORDER BY feed_score DESC, created_at DESC, id DESC
CREATE INDEX IF NOT EXISTS idx_posts_feed_score
    ON content.posts (feed_score DESC, created_at DESC, id DESC)
    WHERE is_deleted = false AND status != 'hidden';

-- Following feed: filter by user_id (joined with social.user_follows), sort by feed_score
CREATE INDEX IF NOT EXISTS idx_posts_user_created
    ON content.posts (user_id, feed_score DESC, created_at DESC)
    WHERE is_deleted = false AND status != 'hidden';

-- Place/Nearby feed: filter by place_id, sort by feed_score
CREATE INDEX IF NOT EXISTS idx_posts_place_created
    ON content.posts (place_id, feed_score DESC, created_at DESC)
    WHERE is_deleted = false AND status != 'hidden';

-- General recency index (explore/admin queries)
CREATE INDEX IF NOT EXISTS idx_posts_created
    ON content.posts (created_at DESC)
    WHERE is_deleted = false AND status != 'hidden';

-- ── content.post_media ────────────────────────────────────────────────────────

-- Batch media load: WHERE post_id IN (...)
CREATE INDEX IF NOT EXISTS idx_post_media_post_id
    ON content.post_media (post_id);

-- ── content.post_likes ────────────────────────────────────────────────────────

-- isLiked check: WHERE user_id = @userId AND post_id IN (...)
CREATE INDEX IF NOT EXISTS idx_post_likes_user_post
    ON content.post_likes (user_id, post_id);

-- ── social.user_follows ───────────────────────────────────────────────────────

-- Following feed JOIN: WHERE follower_id = @userId
CREATE INDEX IF NOT EXISTS idx_user_follows_follower
    ON social.user_follows (follower_id);

-- Reverse: followers-of-me lookups (future use)
CREATE INDEX IF NOT EXISTS idx_user_follows_following
    ON social.user_follows (following_id);

-- ── place.places ──────────────────────────────────────────────────────────────

-- Nearby feed JOIN: WHERE city_id = @cityId AND is_deleted = false
CREATE INDEX IF NOT EXISTS idx_places_city_id
    ON place.places (city_id)
    WHERE is_deleted = false;
