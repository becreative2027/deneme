-- ============================================================
-- Phase 7 — AI & Recommendation System
-- Run once against the shared PostgreSQL instance.
-- Creates user_interests and trending_scores tables in the
-- content schema, owned/written by content-service and
-- read cross-schema by feed-service.
-- ============================================================

-- ── 1. User Interest Model ────────────────────────────────────────────────────
--
-- Rows are upserted by content-service on Like (+2), Comment (+3), Post (+4).
-- Score is capped at 1000 to prevent runaway accumulation.
-- The background job does NOT write here — interest is purely event-driven.

CREATE TABLE IF NOT EXISTS content.user_interests (
    user_id    UUID             NOT NULL,
    label_id   INTEGER          NOT NULL,
    score      NUMERIC(8, 2)    NOT NULL DEFAULT 0,
    updated_at TIMESTAMP        NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, label_id)
);

-- Fast per-user lookup (personalized feed, place recommendations)
CREATE INDEX IF NOT EXISTS idx_user_interests_user
    ON content.user_interests (user_id);

-- Fast per-label lookup (future: label analytics)
CREATE INDEX IF NOT EXISTS idx_user_interests_label
    ON content.user_interests (label_id);

-- ── 2. Trending Scores ────────────────────────────────────────────────────────
--
-- Maintained by TrendingScoreRefreshJob (content-service) every 10 minutes.
-- Aggregates recent post activity (last 24 h) per place.
-- Formula: recent_post_count + SUM(like_count) + SUM(comment_count)

CREATE TABLE IF NOT EXISTS content.trending_scores (
    place_id   UUID             NOT NULL,
    score      NUMERIC(10, 2)   NOT NULL DEFAULT 0,
    updated_at TIMESTAMP        NOT NULL DEFAULT NOW(),
    PRIMARY KEY (place_id)
);

-- Fast descending lookup (explore feed, place recommendations)
CREATE INDEX IF NOT EXISTS idx_trending_scores_score
    ON content.trending_scores (score DESC);
