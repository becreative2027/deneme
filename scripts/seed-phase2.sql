-- ============================================================
-- Phase 2 — Seed & Reference Data
-- Idempotent: resolves all IDs by code/key/slug, never hardcodes
-- Wraps in a transaction — rolls back entirely on any error
-- ============================================================

BEGIN;

-- ============================================================
-- 1. LANGUAGES
-- ============================================================
INSERT INTO geo.languages (code, name) VALUES
    ('tr', 'Türkçe'),
    ('en', 'English')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 2. COUNTRIES
-- ============================================================
INSERT INTO geo.countries (code) VALUES ('TR')
ON CONFLICT (code) DO NOTHING;

-- COUNTRY TRANSLATIONS
INSERT INTO geo.country_translations (country_id, language_id, name, slug)
SELECT c.id, l.id, v.name, v.slug
FROM (VALUES
    ('TR', 'tr', 'Türkiye', 'turkiye'),
    ('TR', 'en', 'Turkey',  'turkey')
) AS v(country_code, lang_code, name, slug)
JOIN geo.countries c ON c.code = v.country_code
JOIN geo.languages l ON l.code = v.lang_code
ON CONFLICT (country_id, language_id) DO NOTHING;

-- ============================================================
-- 3. CITIES — İstanbul
-- No unique constraint on geo.cities; guard via translation slug
-- ============================================================
DO $$
DECLARE
    v_country_id INT;
    v_city_id    INT;
    v_tr_id      INT;
    v_en_id      INT;
BEGIN
    SELECT id INTO v_country_id FROM geo.countries WHERE code = 'TR';
    SELECT id INTO v_tr_id      FROM geo.languages WHERE code = 'tr';
    SELECT id INTO v_en_id      FROM geo.languages WHERE code = 'en';

    SELECT ci.id INTO v_city_id
    FROM geo.cities ci
    JOIN geo.city_translations ct ON ct.city_id   = ci.id
    JOIN geo.languages          l  ON l.id         = ct.language_id
    WHERE ci.country_id = v_country_id AND l.code = 'en' AND ct.slug = 'istanbul'
    LIMIT 1;

    IF v_city_id IS NULL THEN
        INSERT INTO geo.cities (country_id) VALUES (v_country_id) RETURNING id INTO v_city_id;
        RAISE NOTICE 'Inserted city Istanbul (id=%)', v_city_id;
    ELSE
        RAISE NOTICE 'City Istanbul already exists (id=%)', v_city_id;
    END IF;

    INSERT INTO geo.city_translations (city_id, language_id, name, slug) VALUES
        (v_city_id, v_tr_id, 'İstanbul', 'istanbul'),
        (v_city_id, v_en_id, 'Istanbul', 'istanbul')
    ON CONFLICT (city_id, language_id) DO NOTHING;
END $$;

-- ============================================================
-- 4. DISTRICTS — Kadıköy, Beşiktaş, Beyoğlu
-- ============================================================
DO $$
DECLARE
    v_country_id  INT;
    v_city_id     INT;
    v_tr_id       INT;
    v_en_id       INT;
    v_district_id INT;

    type_districts RECORD;
BEGIN
    SELECT id INTO v_country_id FROM geo.countries WHERE code = 'TR';
    SELECT id INTO v_tr_id      FROM geo.languages WHERE code = 'tr';
    SELECT id INTO v_en_id      FROM geo.languages WHERE code = 'en';

    SELECT ci.id INTO v_city_id
    FROM geo.cities ci
    JOIN geo.city_translations ct ON ct.city_id = ci.id
    JOIN geo.languages          l  ON l.id = ct.language_id
    WHERE ci.country_id = v_country_id AND l.code = 'en' AND ct.slug = 'istanbul'
    LIMIT 1;

    FOR type_districts IN
        SELECT * FROM (VALUES
            ('kadikoy',  'Kadıköy',  'Kadikoy'),
            ('besiktas', 'Beşiktaş', 'Besiktas'),
            ('beyoglu',  'Beyoğlu',  'Beyoglu')
        ) AS d(slug, name_tr, name_en)
    LOOP
        SELECT di.id INTO v_district_id
        FROM geo.districts di
        JOIN geo.district_translations dt ON dt.district_id = di.id
        JOIN geo.languages              l  ON l.id = dt.language_id
        WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = type_districts.slug
        LIMIT 1;

        IF v_district_id IS NULL THEN
            INSERT INTO geo.districts (city_id) VALUES (v_city_id) RETURNING id INTO v_district_id;
            RAISE NOTICE 'Inserted district % (id=%)', type_districts.slug, v_district_id;
        ELSE
            RAISE NOTICE 'District % already exists (id=%)', type_districts.slug, v_district_id;
        END IF;

        INSERT INTO geo.district_translations (district_id, language_id, name, slug) VALUES
            (v_district_id, v_tr_id, type_districts.name_tr, type_districts.slug),
            (v_district_id, v_en_id, type_districts.name_en, type_districts.slug)
        ON CONFLICT (district_id, language_id) DO NOTHING;
    END LOOP;
END $$;

-- ============================================================
-- 5. LABEL CATEGORIES
-- ============================================================
INSERT INTO label.label_categories (key) VALUES
    ('experience'),
    ('atmosphere'),
    ('food_drink'),
    ('entertainment'),
    ('features'),
    ('beverage')
ON CONFLICT (key) DO NOTHING;

-- CATEGORY TRANSLATIONS
INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT lc.id, l.id, v.display_name
FROM (VALUES
    ('experience',    'tr', 'Deneyim'),
    ('experience',    'en', 'Experience'),
    ('atmosphere',    'tr', 'Atmosfer'),
    ('atmosphere',    'en', 'Atmosphere'),
    ('food_drink',    'tr', 'Yemek & İçecek'),
    ('food_drink',    'en', 'Food & Drink'),
    ('entertainment', 'tr', 'Eğlence'),
    ('entertainment', 'en', 'Entertainment'),
    ('features',      'tr', 'Özellikler'),
    ('features',      'en', 'Features'),
    ('beverage',      'tr', 'İçecek'),
    ('beverage',      'en', 'Beverage')
) AS v(cat_key, lang_code, display_name)
JOIN label.label_categories lc ON lc.key  = v.cat_key
JOIN geo.languages           l  ON l.code = v.lang_code
ON CONFLICT (category_id, language_id) DO NOTHING;

-- ============================================================
-- 6. LABELS
-- ============================================================
INSERT INTO label.labels (category_id, key)
SELECT lc.id, v.key
FROM (VALUES
    ('experience',    'romantik'),
    ('experience',    'arkadas_bulusmasi'),
    ('atmosphere',    'manzarali'),
    ('atmosphere',    'rooftop'),
    ('food_drink',    'kahvalti'),
    ('food_drink',    'fine_dining'),
    ('entertainment', 'gece_hayati'),
    ('features',      'wifi'),
    ('beverage',      'alkollu')
) AS v(cat_key, key)
JOIN label.label_categories lc ON lc.key = v.cat_key
ON CONFLICT (key) DO NOTHING;

-- LABEL TRANSLATIONS
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, l.id, v.display_name
FROM (VALUES
    ('romantik',          'tr', 'Romantik'),
    ('romantik',          'en', 'Romantic'),
    ('arkadas_bulusmasi', 'tr', 'Arkadaş Buluşması'),
    ('arkadas_bulusmasi', 'en', 'Friends Meetup'),
    ('manzarali',         'tr', 'Manzaralı'),
    ('manzarali',         'en', 'Scenic'),
    ('rooftop',           'tr', 'Rooftop'),
    ('rooftop',           'en', 'Rooftop'),
    ('kahvalti',          'tr', 'Kahvaltı'),
    ('kahvalti',          'en', 'Breakfast'),
    ('fine_dining',       'tr', 'Fine Dining'),
    ('fine_dining',       'en', 'Fine Dining'),
    ('gece_hayati',       'tr', 'Gece Hayatı'),
    ('gece_hayati',       'en', 'Nightlife'),
    ('wifi',              'tr', 'Wi-Fi'),
    ('wifi',              'en', 'Wi-Fi'),
    ('alkollu',           'tr', 'Alkollü'),
    ('alkollu',           'en', 'Alcohol')
) AS v(label_key, lang_code, display_name)
JOIN label.labels  lb ON lb.key  = v.label_key
JOIN geo.languages l  ON l.code  = v.lang_code
ON CONFLICT (label_id, language_id) DO NOTHING;

-- ============================================================
-- 7. LABEL KEYWORDS
-- No unique constraint — guard with NOT EXISTS
-- ============================================================
INSERT INTO label.label_keywords (label_id, language_id, keyword, confidence, source)
SELECT lb.id, l.id, v.keyword, v.confidence::NUMERIC(5,2), v.source
FROM (VALUES
    ('romantik',          'tr', 'romantik',  '1.0', 'seed'),
    ('romantik',          'en', 'romantic',  '1.0', 'seed'),
    ('arkadas_bulusmasi', 'tr', 'arkadaş',   '0.8', 'seed'),
    ('arkadas_bulusmasi', 'en', 'friends',   '0.8', 'seed'),
    ('manzarali',         'tr', 'manzara',   '1.0', 'seed'),
    ('manzarali',         'en', 'view',      '1.0', 'seed'),
    ('gece_hayati',       'tr', 'gece',      '0.9', 'seed'),
    ('gece_hayati',       'en', 'nightlife', '0.9', 'seed')
) AS v(label_key, lang_code, keyword, confidence, source)
JOIN label.labels  lb ON lb.key  = v.label_key
JOIN geo.languages l  ON l.code  = v.lang_code
WHERE NOT EXISTS (
    SELECT 1 FROM label.label_keywords lk
    WHERE lk.label_id    = lb.id
      AND lk.language_id = l.id
      AND lk.keyword     = v.keyword
);

-- ============================================================
-- 8. PLACES
-- Resolves geo IDs dynamically by slug/code
-- ============================================================
DO $$
DECLARE
    v_country_id  INT;
    v_city_id     INT;
    v_kadikoy_id  INT;
    v_besiktas_id INT;
    v_beyoglu_id  INT;
BEGIN
    SELECT id INTO v_country_id FROM geo.countries WHERE code = 'TR';

    SELECT ci.id INTO v_city_id
    FROM geo.cities ci
    JOIN geo.city_translations ct ON ct.city_id = ci.id
    JOIN geo.languages          l  ON l.id = ct.language_id
    WHERE ci.country_id = v_country_id AND l.code = 'en' AND ct.slug = 'istanbul'
    LIMIT 1;

    SELECT di.id INTO v_kadikoy_id
    FROM geo.districts di
    JOIN geo.district_translations dt ON dt.district_id = di.id
    JOIN geo.languages              l  ON l.id = dt.language_id
    WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'kadikoy'
    LIMIT 1;

    SELECT di.id INTO v_besiktas_id
    FROM geo.districts di
    JOIN geo.district_translations dt ON dt.district_id = di.id
    JOIN geo.languages              l  ON l.id = dt.language_id
    WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'besiktas'
    LIMIT 1;

    SELECT di.id INTO v_beyoglu_id
    FROM geo.districts di
    JOIN geo.district_translations dt ON dt.district_id = di.id
    JOIN geo.languages              l  ON l.id = dt.language_id
    WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'beyoglu'
    LIMIT 1;

    INSERT INTO place.places (
        google_place_id, country_id, city_id, district_id,
        latitude, longitude, rating, user_ratings_total, parking_status
    ) VALUES
        ('g1', v_country_id, v_city_id, v_kadikoy_id,  40.9833, 29.0316, 4.5, 120, 'available'),
        ('g2', v_country_id, v_city_id, v_besiktas_id, 41.0428, 29.0097, 4.3, 300, 'limited'),
        ('g3', v_country_id, v_city_id, v_beyoglu_id,  41.0315, 28.9742, 4.7, 500, 'unavailable')
    ON CONFLICT (google_place_id) DO NOTHING;
END $$;

-- ============================================================
-- 9. PLACE TRANSLATIONS
-- Realistic per-place names; references places by google_place_id
-- ============================================================
INSERT INTO place.place_translations (place_id, language_id, name, slug)
SELECT p.id, l.id, v.name, v.slug
FROM (VALUES
    ('g1', 'tr', 'Kadıköy Buluşma Noktası',  'kadikoy-bulusma-noktasi'),
    ('g1', 'en', 'Kadikoy Meeting Point',      'kadikoy-meeting-point'),
    ('g2', 'tr', 'Beşiktaş Çay Bahçesi',      'besiktas-cay-bahcesi'),
    ('g2', 'en', 'Besiktas Tea Garden',        'besiktas-tea-garden'),
    ('g3', 'tr', 'Beyoğlu Gece Kulübü',       'beyoglu-gece-kulubu'),
    ('g3', 'en', 'Beyoglu Nightclub',          'beyoglu-nightclub')
) AS v(google_id, lang_code, name, slug)
JOIN place.places   p ON p.google_place_id = v.google_id
JOIN geo.languages  l ON l.code            = v.lang_code
ON CONFLICT (place_id, language_id) DO NOTHING;

-- ============================================================
-- 10. PLACE LABELS — meaningful weights per place character
-- ============================================================
INSERT INTO label.place_labels (place_id, label_id, weight)
SELECT p.id, lb.id, v.weight
FROM (VALUES
    ('g1', 'romantik',          0.90),  -- Kadıköy: romantic spot
    ('g1', 'kahvalti',          0.85),  -- Kadıköy: popular breakfast area
    ('g1', 'arkadas_bulusmasi', 0.80),  -- Kadıköy: common meetup district
    ('g2', 'manzarali',         0.95),  -- Beşiktaş: Bosphorus view
    ('g2', 'rooftop',           0.85),  -- Beşiktaş: rooftop bar culture
    ('g2', 'arkadas_bulusmasi', 0.90),  -- Beşiktaş: social hub
    ('g3', 'gece_hayati',       0.95),  -- Beyoğlu: nightlife capital
    ('g3', 'alkollu',           0.80),  -- Beyoğlu: bars & clubs
    ('g3', 'rooftop',           0.70),  -- Beyoğlu: rooftop bars on İstiklal
    ('g3', 'manzarali',         0.75)   -- Beyoğlu: Golden Horn views
) AS v(google_id, label_key, weight)
JOIN place.places  p  ON p.google_place_id = v.google_id
JOIN label.labels  lb ON lb.key            = v.label_key
ON CONFLICT (place_id, label_id) DO NOTHING;

-- ============================================================
-- 11. PLACE SCORES — random seeded scores, ROUND to NUMERIC(5,2)
-- ============================================================
INSERT INTO place.place_scores (place_id, popularity_score, quality_score, trend_score, final_score)
SELECT
    p.id,
    ROUND((random() * 10)::numeric, 2),
    ROUND((random() * 10)::numeric, 2),
    ROUND((random() * 10)::numeric, 2),
    ROUND((random() * 10)::numeric, 2)
FROM place.places p
ON CONFLICT (place_id) DO NOTHING;

COMMIT;

-- ============================================================
-- VALIDATION — row counts per table
-- ============================================================
SELECT 'geo.languages'                  AS "table", COUNT(*) AS rows FROM geo.languages
UNION ALL
SELECT 'geo.countries',                   COUNT(*) FROM geo.countries
UNION ALL
SELECT 'geo.country_translations',        COUNT(*) FROM geo.country_translations
UNION ALL
SELECT 'geo.cities',                      COUNT(*) FROM geo.cities
UNION ALL
SELECT 'geo.city_translations',           COUNT(*) FROM geo.city_translations
UNION ALL
SELECT 'geo.districts',                   COUNT(*) FROM geo.districts
UNION ALL
SELECT 'geo.district_translations',       COUNT(*) FROM geo.district_translations
UNION ALL
SELECT 'label.label_categories',          COUNT(*) FROM label.label_categories
UNION ALL
SELECT 'label.label_category_translations', COUNT(*) FROM label.label_category_translations
UNION ALL
SELECT 'label.labels',                    COUNT(*) FROM label.labels
UNION ALL
SELECT 'label.label_translations',        COUNT(*) FROM label.label_translations
UNION ALL
SELECT 'label.label_keywords',            COUNT(*) FROM label.label_keywords
UNION ALL
SELECT 'place.places',                    COUNT(*) FROM place.places
UNION ALL
SELECT 'place.place_translations',        COUNT(*) FROM place.place_translations
UNION ALL
SELECT 'place.place_scores',              COUNT(*) FROM place.place_scores
UNION ALL
SELECT 'label.place_labels',              COUNT(*) FROM label.place_labels
ORDER BY 1;

-- ============================================================
-- Sample: each place with its labels (both languages)
-- ============================================================
SELECT
    pt_en.name                          AS place_name_en,
    pt_tr.name                          AS place_name_tr,
    ct_en.name                          AS city,
    dt_en.name                          AS district,
    p.rating,
    p.parking_status,
    lt_en.display_name                  AS label_en,
    lt_tr.display_name                  AS label_tr,
    pl.weight                           AS label_weight,
    ps.popularity_score,
    ps.quality_score,
    ps.trend_score,
    ps.final_score
FROM place.places p
JOIN place.place_translations  pt_en ON pt_en.place_id    = p.id
JOIN geo.languages              len   ON len.id            = pt_en.language_id AND len.code = 'en'
JOIN place.place_translations  pt_tr ON pt_tr.place_id    = p.id
JOIN geo.languages              ltr   ON ltr.id            = pt_tr.language_id AND ltr.code = 'tr'
JOIN geo.city_translations     ct_en ON ct_en.city_id     = p.city_id
JOIN geo.languages              lce   ON lce.id            = ct_en.language_id AND lce.code = 'en'
JOIN geo.district_translations dt_en ON dt_en.district_id = p.district_id
JOIN geo.languages              lde   ON lde.id            = dt_en.language_id AND lde.code = 'en'
LEFT JOIN label.place_labels    pl   ON pl.place_id        = p.id
LEFT JOIN label.labels          lb   ON lb.id              = pl.label_id
LEFT JOIN label.label_translations lt_en ON lt_en.label_id = lb.id
JOIN geo.languages              lle   ON lle.id            = lt_en.language_id AND lle.code = 'en'
LEFT JOIN label.label_translations lt_tr ON lt_tr.label_id = lb.id
JOIN geo.languages              llt   ON llt.id            = lt_tr.language_id AND llt.code = 'tr'
LEFT JOIN place.place_scores    ps   ON ps.place_id        = p.id
ORDER BY pt_en.name, label_weight DESC;

-- ============================================================
-- Sample: label keywords with confidence & source
-- ============================================================
SELECT
    lb.key                  AS label_key,
    lt.display_name         AS label_display,
    l.code                  AS language,
    lk.keyword,
    lk.confidence,
    lk.source
FROM label.label_keywords lk
JOIN label.labels           lb ON lb.id = lk.label_id
JOIN label.label_translations lt ON lt.label_id = lb.id AND lt.language_id = lk.language_id
JOIN geo.languages           l  ON l.id = lk.language_id
ORDER BY lb.key, l.code;
