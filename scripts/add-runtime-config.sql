-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 7.3 — Dynamic AI Platform: Runtime Config + Feature Flags
-- ═══════════════════════════════════════════════════════════════════════════
--
-- admin.runtime_configs — DB-driven key/value configuration store.
--   Allows numeric tuning (decay rates, caps, weights) to be changed at
--   runtime without a code deploy.  Values are JSONB so a single column
--   holds strings, numbers, booleans, or nested objects.
--
-- admin.feature_flags — Percentage-based feature rollout control.
--   rollout_percentage = 0   → fully disabled
--   rollout_percentage = 100 → fully enabled for all users
--   0 < pct < 100            → deterministic per-user bucketing
--
-- Both tables live in the admin schema (admin-only write access).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin.runtime_configs (
    key        TEXT      PRIMARY KEY,
    value      JSONB     NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Quick point-lookup index (implicit on PK, but explicit for clarity).
-- Range scans ("give me all Recommendation:* keys") also use this.
CREATE INDEX IF NOT EXISTS idx_runtime_configs_key
    ON admin.runtime_configs (key);

-- ── Seed defaults ─────────────────────────────────────────────────────────
-- These mirror the appsettings.json defaults so the DB is the single source
-- of truth after the first deploy.  INSERT … ON CONFLICT DO NOTHING ensures
-- idempotency when the script is re-run.

INSERT INTO admin.runtime_configs (key, value) VALUES
    ('Recommendation:InterestDecayRate', '0.97'),
    ('Recommendation:InterestCap',       '1000'),
    ('Recommendation:Trending:Cap',      '150'),
    ('Recommendation:Trending:LookbackHours', '24'),
    ('Recommendation:Trending:RefreshMinutes', '10'),
    ('Recommendation:DiversityMaxFraction', '0.5')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin.feature_flags (
    key                 TEXT    PRIMARY KEY,
    is_enabled          BOOLEAN NOT NULL DEFAULT false,
    rollout_percentage  INT     NOT NULL DEFAULT 0
        CHECK (rollout_percentage BETWEEN 0 AND 100),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key
    ON admin.feature_flags (key);

-- ── Seed default flags ────────────────────────────────────────────────────
INSERT INTO admin.feature_flags (key, is_enabled, rollout_percentage) VALUES
    ('new_feed_algorithm',  false, 0),
    ('advanced_cold_start', false, 0),
    ('dwell_scoring',       false, 0)
ON CONFLICT (key) DO NOTHING;

ANALYZE admin.runtime_configs;
ANALYZE admin.feature_flags;
