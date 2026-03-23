-- =============================================
-- Migration: Add final_score column to place.place_scores
-- Idempotent: safe to run multiple times
-- =============================================

ALTER TABLE place.place_scores
    ADD COLUMN IF NOT EXISTS final_score NUMERIC(5,2);

-- =============================================
-- Validation: show table structure
-- =============================================

SELECT
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'place'
  AND table_name   = 'place_scores'
ORDER BY ordinal_position;
