-- Phase 4: Audit columns for admin write operations
-- Adds created_by, updated_by, deleted_at, deleted_by to mutable tables.
-- Idempotent — safe to run multiple times.

-- ── place.places ─────────────────────────────────────────────────────────
ALTER TABLE place.places
  ADD COLUMN IF NOT EXISTS created_by   TEXT,
  ADD COLUMN IF NOT EXISTS updated_by   TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted_by   TEXT;

-- ── label.labels ─────────────────────────────────────────────────────────
ALTER TABLE label.labels
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_by   TEXT,
  ADD COLUMN IF NOT EXISTS updated_by   TEXT;

-- ── label.place_labels ───────────────────────────────────────────────────
ALTER TABLE label.place_labels
  ADD COLUMN IF NOT EXISTS created_by   TEXT;

-- ── geo.cities ───────────────────────────────────────────────────────────
ALTER TABLE geo.cities
  ADD COLUMN IF NOT EXISTS created_by   TEXT;

-- ── geo.districts ────────────────────────────────────────────────────────
ALTER TABLE geo.districts
  ADD COLUMN IF NOT EXISTS created_by   TEXT;

-- ── admin schema: ensure it exists (AdminDbContext will create its tables) ─
CREATE SCHEMA IF NOT EXISTS admin;
