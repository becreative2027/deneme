-- Phase 4.1: Row-version concurrency columns, label soft-delete, write audit log table
-- ────────────────────────────────────────────────────────────────────────────────────

-- ── Shared trigger function ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_row_version_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.row_version = decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── place.places ───────────────────────────────────────────────────────────────────
ALTER TABLE place.places
    ADD COLUMN IF NOT EXISTS row_version BYTEA
    DEFAULT decode(replace(gen_random_uuid()::text, '-', ''), 'hex');

UPDATE place.places
    SET row_version = decode(replace(gen_random_uuid()::text, '-', ''), 'hex')
WHERE row_version IS NULL;

DROP TRIGGER IF EXISTS trg_places_row_version ON place.places;
CREATE TRIGGER trg_places_row_version
    BEFORE INSERT OR UPDATE ON place.places
    FOR EACH ROW EXECUTE FUNCTION update_row_version_column();

-- ── label.labels ───────────────────────────────────────────────────────────────────
ALTER TABLE label.labels
    ADD COLUMN IF NOT EXISTS row_version BYTEA
    DEFAULT decode(replace(gen_random_uuid()::text, '-', ''), 'hex');

UPDATE label.labels
    SET row_version = decode(replace(gen_random_uuid()::text, '-', ''), 'hex')
WHERE row_version IS NULL;

DROP TRIGGER IF EXISTS trg_labels_row_version ON label.labels;
CREATE TRIGGER trg_labels_row_version
    BEFORE INSERT OR UPDATE ON label.labels
    FOR EACH ROW EXECUTE FUNCTION update_row_version_column();

-- Soft-delete support for labels (mirrors place.places pattern)
ALTER TABLE label.labels
    ADD COLUMN IF NOT EXISTS is_deleted  BOOLEAN    NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by  TEXT;

-- ── geo.cities ─────────────────────────────────────────────────────────────────────
ALTER TABLE geo.cities
    ADD COLUMN IF NOT EXISTS row_version BYTEA
    DEFAULT decode(replace(gen_random_uuid()::text, '-', ''), 'hex');

UPDATE geo.cities
    SET row_version = decode(replace(gen_random_uuid()::text, '-', ''), 'hex')
WHERE row_version IS NULL;

DROP TRIGGER IF EXISTS trg_cities_row_version ON geo.cities;
CREATE TRIGGER trg_cities_row_version
    BEFORE INSERT OR UPDATE ON geo.cities
    FOR EACH ROW EXECUTE FUNCTION update_row_version_column();

-- ── geo.districts ──────────────────────────────────────────────────────────────────
ALTER TABLE geo.districts
    ADD COLUMN IF NOT EXISTS row_version BYTEA
    DEFAULT decode(replace(gen_random_uuid()::text, '-', ''), 'hex');

UPDATE geo.districts
    SET row_version = decode(replace(gen_random_uuid()::text, '-', ''), 'hex')
WHERE row_version IS NULL;

DROP TRIGGER IF EXISTS trg_districts_row_version ON geo.districts;
CREATE TRIGGER trg_districts_row_version
    BEFORE INSERT OR UPDATE ON geo.districts
    FOR EACH ROW EXECUTE FUNCTION update_row_version_column();

-- ── admin.write_audit_logs ─────────────────────────────────────────────────────────
-- Separate from admin.audit_logs (moderation log); this tracks all write operations.
CREATE TABLE IF NOT EXISTS admin.write_audit_logs (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     TEXT,
    action      TEXT         NOT NULL,   -- CREATE | UPDATE | DELETE
    entity_type TEXT         NOT NULL,   -- Place | Label | City | District
    entity_id   TEXT         NOT NULL,
    payload     JSONB,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_write_audit_entity
    ON admin.write_audit_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_write_audit_user
    ON admin.write_audit_logs (user_id)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_write_audit_created
    ON admin.write_audit_logs (created_at DESC);
