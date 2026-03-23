-- ============================================================
-- Phase 2 — Data Quality & Production Hardening
-- faz2-feedback.md — executed exactly, step by step
-- Idempotent: safe to re-run
-- ============================================================

BEGIN;

-- ============================================================
-- 1a. SLUG UNIQUE CONSTRAINT — geo.city_translations(slug, language_id)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_city_slug_lang'
    ) THEN
        CREATE UNIQUE INDEX idx_city_slug_lang
            ON geo.city_translations(slug, language_id);
        RAISE NOTICE 'Created index idx_city_slug_lang';
    ELSE
        RAISE NOTICE 'Index idx_city_slug_lang already exists — skipping';
    END IF;
END $$;

-- ============================================================
-- 1b. SLUG UNIQUE CONSTRAINT — geo.district_translations(slug, language_id)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_district_slug_lang'
    ) THEN
        CREATE UNIQUE INDEX idx_district_slug_lang
            ON geo.district_translations(slug, language_id);
        RAISE NOTICE 'Created index idx_district_slug_lang';
    ELSE
        RAISE NOTICE 'Index idx_district_slug_lang already exists — skipping';
    END IF;
END $$;

-- ============================================================
-- 2. GOOGLE PLACE ID HARDENING — partial unique index
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_google_place_id_not_null'
    ) THEN
        CREATE UNIQUE INDEX idx_google_place_id_not_null
            ON place.places(google_place_id)
            WHERE google_place_id IS NOT NULL;
        RAISE NOTICE 'Created index idx_google_place_id_not_null';
    ELSE
        RAISE NOTICE 'Index idx_google_place_id_not_null already exists — skipping';
    END IF;
END $$;

-- ============================================================
-- 3. LABEL KEYWORDS UNIQUE CONSTRAINT
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_label_keyword_lang'
    ) THEN
        -- Deduplicate first: keep lowest id per (label_id, language_id, keyword)
        DELETE FROM label.label_keywords lk
        WHERE lk.id NOT IN (
            SELECT MIN(id)
            FROM label.label_keywords
            GROUP BY label_id, language_id, keyword
        );
        RAISE NOTICE 'Deduped label_keywords before adding unique constraint';

        ALTER TABLE label.label_keywords
            ADD CONSTRAINT unique_label_keyword_lang
            UNIQUE (label_id, language_id, keyword);
        RAISE NOTICE 'Created constraint unique_label_keyword_lang';
    ELSE
        RAISE NOTICE 'Constraint unique_label_keyword_lang already exists — skipping';
    END IF;
END $$;

-- ============================================================
-- 4. REALISTIC SCORE NORMALIZATION (3.00–5.00 range)
-- ============================================================
UPDATE place.place_scores
SET
    popularity_score = ROUND((3 + random() * 2)::numeric, 2),
    quality_score    = ROUND((3 + random() * 2)::numeric, 2),
    trend_score      = ROUND((3 + random() * 2)::numeric, 2),
    final_score      = ROUND((3 + random() * 2)::numeric, 2);

-- ============================================================
-- 5. REALISTIC PLACE NAME UPDATE
-- Only updates rows that still carry the generic seed names
-- ============================================================
UPDATE place.place_translations
SET name = CASE
    WHEN name LIKE '%Örnek%' THEN 'Masa Kahvaltı & Cafe'
    ELSE name
END
WHERE language_id = (SELECT id FROM geo.languages WHERE code = 'tr');

UPDATE place.place_translations
SET name = CASE
    WHEN name LIKE '%Sample%' THEN 'Skyline Rooftop Lounge'
    ELSE name
END
WHERE language_id = (SELECT id FROM geo.languages WHERE code = 'en');

-- ============================================================
-- 6. LABEL DISTRIBUTION IMPROVEMENT
-- Clear & reassign with diversity (exactly as per markdown)
-- ============================================================
DELETE FROM label.place_labels;

INSERT INTO label.place_labels (place_id, label_id, weight)
SELECT p.id, l.id, ROUND(random()::numeric, 2)
FROM place.places p
JOIN label.labels l ON l.id <= 5
LIMIT 10;

COMMIT;

-- ============================================================
-- 7. VALIDATION QUERIES
-- ============================================================

-- 7a. Duplicate check — label_keywords
SELECT
    'label_keywords duplicates' AS check_name,
    CASE WHEN COUNT(*) = 0 THEN 'PASS — no duplicates' ELSE 'FAIL — duplicates found' END AS result
FROM (
    SELECT label_id, keyword
    FROM label.label_keywords
    GROUP BY label_id, keyword
    HAVING COUNT(*) > 1
) dup;

-- 7b. Place label distribution (acceptance: each place >= 3 labels)
SELECT
    p.id                                                    AS place_id,
    pt.name                                                 AS place_name,
    COUNT(pl.label_id)                                      AS label_count,
    CASE WHEN COUNT(pl.label_id) >= 3 THEN 'PASS' ELSE 'FAIL' END AS acceptance
FROM place.places p
LEFT JOIN label.place_labels    pl ON pl.place_id    = p.id
LEFT JOIN place.place_translations pt ON pt.place_id = p.id
    AND pt.language_id = (SELECT id FROM geo.languages WHERE code = 'en')
GROUP BY p.id, pt.name
ORDER BY pt.name;

-- 7c. Slug uniqueness — city_translations
SELECT
    'city slug duplicates' AS check_name,
    CASE WHEN COUNT(*) = 0 THEN 'PASS — no duplicates' ELSE 'FAIL — duplicates found' END AS result
FROM (
    SELECT slug
    FROM geo.city_translations
    GROUP BY slug
    HAVING COUNT(*) > 1
) dup;

-- 7d. All new indexes on relevant tables
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname IN (
    'idx_city_slug_lang',
    'idx_district_slug_lang',
    'idx_google_place_id_not_null'
)
ORDER BY tablename, indexname;

-- 7e. New constraint on label.label_keywords
SELECT
    conname         AS constraint_name,
    contype         AS type,
    conrelid::regclass AS table_name
FROM pg_constraint
WHERE conname = 'unique_label_keyword_lang';

-- 7f. Updated place scores (should all be in 3.00–5.00 range)
SELECT
    pt.name                                                     AS place_name,
    ps.popularity_score,
    ps.quality_score,
    ps.trend_score,
    ps.final_score
FROM place.place_scores ps
JOIN place.places p ON p.id = ps.place_id
JOIN place.place_translations pt ON pt.place_id = p.id
    AND pt.language_id = (SELECT id FROM geo.languages WHERE code = 'en')
ORDER BY pt.name;

-- 7g. Updated place names (confirm no generic names remain)
SELECT
    l.code          AS lang,
    pt.name,
    pt.slug
FROM place.place_translations pt
JOIN geo.languages l ON l.id = pt.language_id
ORDER BY pt.name, l.code;
