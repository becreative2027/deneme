-- Phase 7.5 — Governance & Safety Layer
-- Adds the pending config change approval workflow table.
--
-- pending_config_changes tracks config changes that require SuperAdmin approval
-- before being applied to the live runtime_configs table.
--
-- Lifecycle:
--   1. Admin submits change with requiresApproval = true  → status = 'Pending'
--   2. SuperAdmin reviews and approves                    → status = 'Approved'
--      (the approved value is immediately written to runtime_configs)
--   3. SuperAdmin rejects with reason                     → status = 'Rejected'
--      (the change is discarded; audit trail preserved)
--
-- Applied against the admin schema (same DB as runtime_configs).

CREATE TABLE IF NOT EXISTS admin.pending_config_changes (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    key            TEXT        NOT NULL,
    value          JSONB       NOT NULL,
    requested_by   TEXT        NOT NULL,
    request_reason TEXT        NOT NULL,
    status         TEXT        NOT NULL DEFAULT 'Pending'
                               CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reviewed_by    TEXT,
    review_reason  TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at    TIMESTAMPTZ
);

-- Index for the common query: list pending changes for a given key
CREATE INDEX IF NOT EXISTS ix_pending_config_changes_key_status
    ON admin.pending_config_changes (key, status);
