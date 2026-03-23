-- =============================================
-- Migration: Add AI/rule-based columns to label.label_keywords
-- Idempotent: ADD COLUMN IF NOT EXISTS is safe to re-run
-- =============================================

ALTER TABLE label.label_keywords
    ADD COLUMN IF NOT EXISTS confidence NUMERIC(5,2) DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS source TEXT;

-- =============================================
-- Validation: show updated table structure
-- =============================================

SELECT
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'label'
  AND table_name   = 'label_keywords'
ORDER BY ordinal_position;
