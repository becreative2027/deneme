-- Phase 5: Social System — identity.profiles, social.user_follows, content.* tables
-- Note: Cross-service FK constraints (identity.users) are enforced at application level.
--       Only place.places FK is kept since it shares the same schema-runner context.
-- ──────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── identity schema: create users table if EF Core hasn't run yet ─────────────
-- identity.users is managed by EF Core (IdentityDbContext). We create it here
-- with the canonical snake_case schema so FK references below work.
CREATE TABLE IF NOT EXISTS identity.users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email            TEXT UNIQUE NOT NULL,
    username         TEXT UNIQUE NOT NULL,
    password_hash    TEXT NOT NULL,
    role             INTEGER NOT NULL DEFAULT 0,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ
);

-- ── identity.profiles ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS identity.profiles (
    user_id           UUID PRIMARY KEY REFERENCES identity.users(id),
    display_name      TEXT,
    bio               TEXT,
    profile_image_url TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ
);

-- ── social schema ─────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS social;

CREATE TABLE IF NOT EXISTS social.user_follows (
    follower_id   UUID NOT NULL REFERENCES identity.users(id),
    following_id  UUID NOT NULL REFERENCES identity.users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id)
);

-- ── content schema ────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS content;

CREATE TABLE IF NOT EXISTS content.posts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES identity.users(id),
    place_id      UUID NOT NULL REFERENCES place.places(id),
    caption       TEXT,
    like_count    INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.post_media (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES content.posts(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    type       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.post_likes (
    user_id    UUID NOT NULL REFERENCES identity.users(id),
    post_id    UUID NOT NULL REFERENCES content.posts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS content.post_comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES content.posts(id),
    user_id    UUID NOT NULL REFERENCES identity.users(id),
    text       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_user        ON content.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_place       ON content.posts(place_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON social.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON content.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_media_post    ON content.post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post    ON content.post_likes(post_id);

-- ── script_history ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.script_history (
    script_name TEXT PRIMARY KEY,
    run_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.script_history(script_name)
VALUES ('add-social-schema.sql')
ON CONFLICT DO NOTHING;

COMMIT;
