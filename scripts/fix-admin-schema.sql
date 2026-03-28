-- Drop incorrectly named tables (PascalCase) and recreate with snake_case
DROP TABLE IF EXISTS admin."ModerationItems" CASCADE;
DROP TABLE IF EXISTS admin."AuditLogs" CASCADE;
DROP TABLE IF EXISTS admin."ImportJobs" CASCADE;
DROP TABLE IF EXISTS admin."RuntimeConfigVersions" CASCADE;
DROP TABLE IF EXISTS admin."ConfigAuditLogs" CASCADE;
DROP TABLE IF EXISTS admin."PendingConfigChanges" CASCADE;

-- ModerationItems → moderation_items
CREATE TABLE IF NOT EXISTS admin.moderation_items (
    id                      UUID        NOT NULL PRIMARY KEY,
    target_type             INT         NOT NULL,
    target_id               UUID        NOT NULL,
    status                  INT         NOT NULL DEFAULT 0,
    admin_note              VARCHAR(1000),
    reviewed_by_admin_id    UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at             TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_moderation_target ON admin.moderation_items (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_status ON admin.moderation_items (status);

-- AuditLogs → audit_logs
CREATE TABLE IF NOT EXISTS admin.audit_logs (
    id             UUID         NOT NULL PRIMARY KEY,
    admin_id       UUID         NOT NULL,
    action         VARCHAR(100) NOT NULL,
    target_entity  VARCHAR(100) NOT NULL,
    target_id      UUID         NOT NULL,
    details        VARCHAR(2000),
    occurred_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_admin_id    ON admin.audit_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_occurred_at ON admin.audit_logs (occurred_at);

-- ImportJobs → import_jobs
CREATE TABLE IF NOT EXISTS admin.import_jobs (
    id            UUID        NOT NULL PRIMARY KEY,
    status        INT         NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at  TIMESTAMPTZ,
    error_message TEXT
);

-- RuntimeConfigVersions → runtime_config_versions
CREATE TABLE IF NOT EXISTS admin.runtime_config_versions (
    id             UUID        NOT NULL PRIMARY KEY,
    key            TEXT        NOT NULL,
    value          JSONB       NOT NULL,
    changed_by     TEXT        NOT NULL,
    change_reason  TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rcv_key ON admin.runtime_config_versions (key);

-- ConfigAuditLogs → config_audit_logs
CREATE TABLE IF NOT EXISTS admin.config_audit_logs (
    id             UUID        NOT NULL PRIMARY KEY,
    key            TEXT        NOT NULL,
    old_value      JSONB,
    new_value      JSONB       NOT NULL,
    changed_by     TEXT        NOT NULL,
    change_reason  TEXT,
    occurred_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cal_key ON admin.config_audit_logs (key);

-- PendingConfigChanges → pending_config_changes
CREATE TABLE IF NOT EXISTS admin.pending_config_changes (
    id              UUID        NOT NULL PRIMARY KEY,
    key             TEXT        NOT NULL,
    proposed_value  JSONB       NOT NULL,
    status          INT         NOT NULL DEFAULT 0,
    changed_by      TEXT        NOT NULL,
    change_reason   TEXT,
    reviewed_by     TEXT,
    review_reason   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ
);
