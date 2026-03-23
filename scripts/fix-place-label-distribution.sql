-- ============================================================
-- Fix: Place label distribution — deterministic, key-based
-- Each place guaranteed >= 3 labels, no LIMIT, no ID ordering
-- ============================================================

BEGIN;

-- Step 1: Clear existing assignments
DELETE FROM label.place_labels;

-- Step 2: Reassign using label keys + google_place_id
INSERT INTO label.place_labels (place_id, label_id, weight)
SELECT p.id, lb.id, v.weight
FROM (VALUES
    -- Kadıköy Buluşma Noktası — breakfast spot, romantic, wi-fi friendly
    ('g1', 'kahvalti',          0.90),
    ('g1', 'romantik',          0.85),
    ('g1', 'wifi',              0.80),
    ('g1', 'arkadas_bulusmasi', 0.75),

    -- Beşiktaş Çay Bahçesi — scenic Bosphorus, rooftop, serves alcohol
    ('g2', 'manzarali',         0.95),
    ('g2', 'rooftop',           0.90),
    ('g2', 'alkollu',           0.75),
    ('g2', 'arkadas_bulusmasi', 0.80),

    -- Beyoğlu Gece Kulübü — nightlife, alcohol, rooftop, scenic
    ('g3', 'gece_hayati',       0.95),
    ('g3', 'alkollu',           0.85),
    ('g3', 'arkadas_bulusmasi', 0.80),
    ('g3', 'rooftop',           0.70)
) AS v(google_id, label_key, weight)
JOIN place.places  p  ON p.google_place_id = v.google_id
JOIN label.labels  lb ON lb.key            = v.label_key
ON CONFLICT (place_id, label_id) DO NOTHING;

COMMIT;

-- ============================================================
-- Validation
-- ============================================================

-- Label count per place (each must be >= 3)
SELECT
    p.google_place_id,
    pt.name                                                     AS place_name,
    COUNT(pl.label_id)                                          AS label_count,
    CASE WHEN COUNT(pl.label_id) >= 3 THEN 'PASS' ELSE 'FAIL' END AS acceptance
FROM place.places p
JOIN place.place_translations  pt ON pt.place_id    = p.id
    AND pt.language_id = (SELECT id FROM geo.languages WHERE code = 'en')
LEFT JOIN label.place_labels   pl ON pl.place_id    = p.id
GROUP BY p.id, p.google_place_id, pt.name
ORDER BY p.google_place_id;

-- Full assignment listing
SELECT
    pt.name                 AS place_name,
    lb.key                  AS label_key,
    lt.display_name         AS label_display,
    pl.weight
FROM label.place_labels      pl
JOIN place.places             p  ON p.id  = pl.place_id
JOIN place.place_translations pt ON pt.place_id    = p.id
    AND pt.language_id = (SELECT id FROM geo.languages WHERE code = 'en')
JOIN label.labels             lb ON lb.id = pl.label_id
JOIN label.label_translations lt ON lt.label_id    = lb.id
    AND lt.language_id = (SELECT id FROM geo.languages WHERE code = 'en')
ORDER BY pt.name, pl.weight DESC;
