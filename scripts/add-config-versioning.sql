-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 7.4 — Platform Maturity: Config Versioning, Audit, Flag Targeting
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Config version history ─────────────────────────────────────────────
-- Every write to admin.runtime_configs inserts a new row here.
-- Rollback = UPDATE runtime_configs SET value = (SELECT value FROM here WHERE version = N).

CREATE TABLE IF NOT EXISTS admin.runtime_config_versions (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    key           TEXT      NOT NULL,
    value         JSONB     NOT NULL,
    version       INT       NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by    TEXT      NOT NULL,
    change_reason TEXT      NOT NULL,
    UNIQUE (key, version)
);

CREATE INDEX IF NOT EXISTS idx_rcv_key_version
    ON admin.runtime_config_versions (key, version DESC);

-- ── 2. Config audit log ───────────────────────────────────────────────────
-- Immutable record of every change: who, what, why, before & after.

CREATE TABLE IF NOT EXISTS admin.config_audit_logs (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    key           TEXT      NOT NULL,
    old_value     JSONB,
    new_value     JSONB     NOT NULL,
    changed_by    TEXT      NOT NULL,
    change_reason TEXT      NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cal_key
    ON admin.config_audit_logs (key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cal_changed_by
    ON admin.config_audit_logs (changed_by, created_at DESC);

-- ── 3. Feature flag targeting ─────────────────────────────────────────────
-- target JSONB — optional; when set, overrides percentage rollout.
-- Example: {"userIds":["uuid1"],"countries":["TR"],"platform":["ios"]}

ALTER TABLE admin.feature_flags
    ADD COLUMN IF NOT EXISTS target JSONB;

ANALYZE admin.runtime_config_versions;
ANALYZE admin.config_audit_logs;
ANALYZE admin.feature_flags;
