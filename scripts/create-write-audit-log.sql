-- write_audit_logs: admin write-operation audit trail
-- Written by AuditService.Log() on every CREATE/UPDATE/DELETE admin action

CREATE TABLE IF NOT EXISTS admin.write_audit_logs (
    id          BIGSERIAL    NOT NULL PRIMARY KEY,
    user_id     TEXT,
    action      VARCHAR(50)  NOT NULL,   -- CREATE | UPDATE | DELETE
    entity_type VARCHAR(100) NOT NULL,   -- Place | Label | City | District | ...
    entity_id   TEXT         NOT NULL,
    payload     JSONB,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wal_entity      ON admin.write_audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_wal_user_id     ON admin.write_audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_wal_created_at  ON admin.write_audit_logs (created_at DESC);
