-- Admin service schema
CREATE SCHEMA IF NOT EXISTS admin;

-- ModerationItems
CREATE TABLE IF NOT EXISTS admin."ModerationItems" (
    "Id"                   UUID        NOT NULL PRIMARY KEY,
    "TargetType"           INT         NOT NULL,
    "TargetId"             UUID        NOT NULL,
    "Status"               INT         NOT NULL DEFAULT 0,
    "AdminNote"            VARCHAR(1000),
    "ReviewedByAdminId"    UUID,
    "CreatedAt"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ReviewedAt"           TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_moderation_target   ON admin."ModerationItems" ("TargetType", "TargetId");
CREATE INDEX IF NOT EXISTS idx_moderation_status   ON admin."ModerationItems" ("Status");

-- AuditLogs
CREATE TABLE IF NOT EXISTS admin."AuditLogs" (
    "Id"           UUID        NOT NULL PRIMARY KEY,
    "AdminId"      UUID        NOT NULL,
    "Action"       VARCHAR(100) NOT NULL,
    "TargetEntity" VARCHAR(100) NOT NULL,
    "TargetId"     UUID        NOT NULL,
    "Details"      VARCHAR(2000),
    "OccurredAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_admin_id    ON admin."AuditLogs" ("AdminId");
CREATE INDEX IF NOT EXISTS idx_audit_occurred_at ON admin."AuditLogs" ("OccurredAt");

-- ImportJobs
CREATE TABLE IF NOT EXISTS admin."ImportJobs" (
    "Id"          UUID        NOT NULL PRIMARY KEY,
    "Status"      INT         NOT NULL DEFAULT 0,
    "CreatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "CompletedAt" TIMESTAMPTZ,
    "ErrorMessage" TEXT
);

-- RuntimeConfigs
CREATE TABLE IF NOT EXISTS admin.runtime_configs (
    key        TEXT        NOT NULL PRIMARY KEY,
    value      JSONB       NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FeatureFlags
CREATE TABLE IF NOT EXISTS admin.feature_flags (
    key                TEXT        NOT NULL PRIMARY KEY,
    is_enabled         BOOLEAN     NOT NULL DEFAULT FALSE,
    rollout_percentage INT         NOT NULL DEFAULT 100,
    target             JSONB,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RuntimeConfigVersions
CREATE TABLE IF NOT EXISTS admin."RuntimeConfigVersions" (
    "Id"          UUID        NOT NULL PRIMARY KEY,
    "Key"         TEXT        NOT NULL,
    "Value"       JSONB       NOT NULL,
    "ChangedBy"   TEXT        NOT NULL,
    "ChangeReason" TEXT,
    "CreatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rcv_key ON admin."RuntimeConfigVersions" ("Key");

-- ConfigAuditLogs
CREATE TABLE IF NOT EXISTS admin."ConfigAuditLogs" (
    "Id"          UUID        NOT NULL PRIMARY KEY,
    "Key"         TEXT        NOT NULL,
    "OldValue"    JSONB,
    "NewValue"    JSONB       NOT NULL,
    "ChangedBy"   TEXT        NOT NULL,
    "ChangeReason" TEXT,
    "OccurredAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cal_key ON admin."ConfigAuditLogs" ("Key");

-- PendingConfigChanges
CREATE TABLE IF NOT EXISTS admin."PendingConfigChanges" (
    "Id"           UUID        NOT NULL PRIMARY KEY,
    "Key"          TEXT        NOT NULL,
    "ProposedValue" JSONB      NOT NULL,
    "Status"       INT         NOT NULL DEFAULT 0,
    "ChangedBy"    TEXT        NOT NULL,
    "ChangeReason" TEXT,
    "ReviewedBy"   TEXT,
    "ReviewReason" TEXT,
    "CreatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ReviewedAt"   TIMESTAMPTZ
);
