-- Phase 3.1: Add covering index on place_translations (place_id, language_id)
-- Used by SearchPlaces + GetPlaceDetail for localized name lookups.
-- Idempotent — safe to run multiple times.

CREATE INDEX IF NOT EXISTS idx_place_translations_lang
    ON place.place_translations (place_id, language_id);
