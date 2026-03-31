-- ============================================================
-- Migration: add price_level & venue_type to place.places
-- Run once on the server. Idempotent via IF NOT EXISTS / DO blocks.
-- ============================================================

ALTER TABLE place.places
    ADD COLUMN IF NOT EXISTS price_level SMALLINT  NULL,
    ADD COLUMN IF NOT EXISTS venue_type  VARCHAR(50) NULL;

DO $$ BEGIN
    RAISE NOTICE 'place.places columns price_level and venue_type ensured.';
END $$;
