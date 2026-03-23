-- Phase 5.1: Social System Hardening — moderation columns + index optimization
-- Run via schema-runner: dotnet run --project scripts/schema-runner -- scripts/add-social-hardening.sql
-- ──────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── Moderation columns on content.posts ───────────────────────────────────────
ALTER TABLE content.posts ADD COLUMN IF NOT EXISTS status        TEXT        NOT NULL DEFAULT 'active';
ALTER TABLE content.posts ADD COLUMN IF NOT EXISTS hidden_reason TEXT;
ALTER TABLE content.posts ADD COLUMN IF NOT EXISTS moderated_at  TIMESTAMPTZ;

-- ── Index optimization ────────────────────────────────────────────────────────
-- Feed ordering by newest posts
CREATE INDEX IF NOT EXISTS idx_posts_created_at     ON content.posts(created_at DESC);
-- Comment pagination per post
CREATE INDEX IF NOT EXISTS idx_comments_post        ON content.post_comments(post_id, created_at DESC);
-- Like count queries per post
CREATE INDEX IF NOT EXISTS idx_likes_post           ON content.post_likes(post_id);
-- Moderation queue by status
CREATE INDEX IF NOT EXISTS idx_posts_status         ON content.posts(status) WHERE status <> 'active';

-- ── script_history ─────────────────────────────────────────────────────────────
INSERT INTO public.script_history(script_name)
VALUES ('add-social-hardening.sql')
ON CONFLICT DO NOTHING;

COMMIT;
