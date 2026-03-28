-- Migration: Add identity.place_ownerships table
-- Run with: dotnet run --project scripts/schema-runner -- scripts/add-place-ownerships.sql

CREATE TABLE IF NOT EXISTS identity.place_ownerships (
    id          SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL,
    place_id    UUID NOT NULL,
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by  UUID,
    CONSTRAINT uq_place_ownerships_user_place UNIQUE (user_id, place_id)
);

CREATE INDEX IF NOT EXISTS idx_place_ownerships_user   ON identity.place_ownerships (user_id);
CREATE INDEX IF NOT EXISTS idx_place_ownerships_place  ON identity.place_ownerships (place_id);
