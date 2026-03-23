-- =============================================
-- Migration: Canonical indexes on label.place_labels
-- Idempotent: CREATE INDEX IF NOT EXISTS is safe to re-run
-- =============================================

CREATE INDEX IF NOT EXISTS idx_place_labels_place_id
    ON label.place_labels(place_id);

CREATE INDEX IF NOT EXISTS idx_place_labels_label_id
    ON label.place_labels(label_id);

-- =============================================
-- Validation: show all indexes on label.place_labels
-- =============================================

SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'label'
  AND tablename  = 'place_labels'
ORDER BY indexname;
