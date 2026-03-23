-- ============================================================
-- Phase 8.6 — Curated Place Seed (Istanbul, 30 places)
-- Schema-aware: resolves all IDs via slug/key/code — no hardcodes
-- Idempotent: ON CONFLICT DO NOTHING throughout
-- ============================================================

BEGIN;

-- ============================================================
-- 1. PLACES — 30 curated mekan
--    Geo IDs resolved once in a DO block
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
    JOIN geo.city_translations ct ON ct.city_id     = ci.id
    JOIN geo.languages          l  ON l.id           = ct.language_id
    WHERE ci.country_id = v_country_id AND l.code = 'en' AND ct.slug = 'istanbul'
    LIMIT 1;

    SELECT di.id INTO v_kadikoy_id
    FROM geo.districts di
    JOIN geo.district_translations dt ON dt.district_id = di.id
    JOIN geo.languages              l  ON l.id           = dt.language_id
    WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'kadikoy'
    LIMIT 1;

    SELECT di.id INTO v_besiktas_id
    FROM geo.districts di
    JOIN geo.district_translations dt ON dt.district_id = di.id
    JOIN geo.languages              l  ON l.id           = dt.language_id
    WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'besiktas'
    LIMIT 1;

    SELECT di.id INTO v_beyoglu_id
    FROM geo.districts di
    JOIN geo.district_translations dt ON dt.district_id = di.id
    JOIN geo.languages              l  ON l.id           = dt.language_id
    WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'beyoglu'
    LIMIT 1;

    -- ── Kadıköy (10) ───────────────────────────────────────────────────────────
    INSERT INTO place.places (
        google_place_id, country_id, city_id, district_id,
        latitude, longitude, rating, user_ratings_total, parking_status
    ) VALUES
        ('ph_walters_coffee',    v_country_id, v_city_id, v_kadikoy_id, 40.9899, 29.0303, 4.7,  892,  'unavailable'),
        ('ph_montag_coffee',     v_country_id, v_city_id, v_kadikoy_id, 40.9901, 29.0300, 4.6,  534,  'unavailable'),
        ('ph_kronotrop_kadikoy', v_country_id, v_city_id, v_kadikoy_id, 40.9889, 29.0310, 4.8, 1203,  'unavailable'),
        ('ph_arka_oda',          v_country_id, v_city_id, v_kadikoy_id, 40.9880, 29.0270, 4.5,  678,  'unavailable'),
        ('ph_ciya_sofrasi',      v_country_id, v_city_id, v_kadikoy_id, 40.9914, 29.0241, 4.9, 2341,  'limited'),
        ('ph_basta_street_food', v_country_id, v_city_id, v_kadikoy_id, 40.9909, 29.0257, 4.6,  445,  'unavailable'),
        ('ph_naga_putrika',      v_country_id, v_city_id, v_kadikoy_id, 40.9895, 29.0280, 4.5,  312,  'unavailable'),
        ('ph_zapata_burger',     v_country_id, v_city_id, v_kadikoy_id, 40.9887, 29.0295, 4.4,  289,  'unavailable'),
        ('ph_kemal_usta',        v_country_id, v_city_id, v_kadikoy_id, 40.9920, 29.0234, 4.7,  567,  'limited'),
        ('ph_kadikoy_borekci',   v_country_id, v_city_id, v_kadikoy_id, 40.9905, 29.0262, 4.5,  421,  'unavailable')
    ON CONFLICT (google_place_id) DO NOTHING;

    -- ── Beşiktaş (10) ──────────────────────────────────────────────────────────
    INSERT INTO place.places (
        google_place_id, country_id, city_id, district_id,
        latitude, longitude, rating, user_ratings_total, parking_status
    ) VALUES
        ('ph_mangerie',            v_country_id, v_city_id, v_besiktas_id, 41.0728, 29.0122, 4.6, 1876, 'limited'),
        ('ph_lucca',               v_country_id, v_city_id, v_besiktas_id, 41.0735, 29.0118, 4.5, 2103, 'limited'),
        ('ph_bebek_kahve',         v_country_id, v_city_id, v_besiktas_id, 41.0740, 29.0115, 4.7,  987, 'limited'),
        ('ph_house_cafe_ortakoy',  v_country_id, v_city_id, v_besiktas_id, 41.0473, 29.0256, 4.6, 1432, 'limited'),
        ('ph_the_townhouse',       v_country_id, v_city_id, v_besiktas_id, 41.0418, 29.0089, 4.4,  543, 'unavailable'),
        ('ph_efendi_bar',          v_country_id, v_city_id, v_besiktas_id, 41.0420, 29.0095, 4.5,  672, 'unavailable'),
        ('ph_akaretler_lokantasi', v_country_id, v_city_id, v_besiktas_id, 41.0440, 29.0044, 4.7,  834, 'available'),
        ('ph_besiktas_balikci',    v_country_id, v_city_id, v_besiktas_id, 41.0432, 29.0103, 4.6,  423, 'limited'),
        ('ph_ortakoy_waffle',      v_country_id, v_city_id, v_besiktas_id, 41.0480, 29.0266, 4.4, 3421, 'unavailable'),
        ('ph_fully_karakoy',       v_country_id, v_city_id, v_besiktas_id, 41.0214, 28.9736, 4.5,  756, 'unavailable')
    ON CONFLICT (google_place_id) DO NOTHING;

    -- ── Beyoğlu / Karaköy (10) ─────────────────────────────────────────────────
    INSERT INTO place.places (
        google_place_id, country_id, city_id, district_id,
        latitude, longitude, rating, user_ratings_total, parking_status
    ) VALUES
        ('ph_karakoy_lokantasi', v_country_id, v_city_id, v_beyoglu_id, 41.0214, 28.9736, 4.8, 1654, 'unavailable'),
        ('ph_namli_gurme',       v_country_id, v_city_id, v_beyoglu_id, 41.0221, 28.9741, 4.7,  987, 'unavailable'),
        ('ph_unter',             v_country_id, v_city_id, v_beyoglu_id, 41.0338, 28.9698, 4.5, 1234, 'unavailable'),
        ('ph_finn_karakoy',      v_country_id, v_city_id, v_beyoglu_id, 41.0207, 28.9743, 4.4,  432, 'unavailable'),
        ('ph_mums_cafe',         v_country_id, v_city_id, v_beyoglu_id, 41.0290, 28.9760, 4.6,  678, 'unavailable'),
        ('ph_viyana_kahvesi',    v_country_id, v_city_id, v_beyoglu_id, 41.0310, 28.9720, 4.7,  543, 'unavailable'),
        ('ph_360_istanbul',      v_country_id, v_city_id, v_beyoglu_id, 41.0330, 28.9740, 4.6, 2341, 'unavailable'),
        ('ph_mikla',             v_country_id, v_city_id, v_beyoglu_id, 41.0335, 28.9748, 4.9, 1876, 'unavailable'),
        ('ph_pandeli',           v_country_id, v_city_id, v_beyoglu_id, 41.0168, 28.9742, 4.7,  654, 'unavailable'),
        ('ph_galata_house',      v_country_id, v_city_id, v_beyoglu_id, 41.0247, 28.9725, 4.6,  432, 'unavailable')
    ON CONFLICT (google_place_id) DO NOTHING;
END $$;

-- ============================================================
-- 2. PLACE TRANSLATIONS (TR + EN)
-- ============================================================
INSERT INTO place.place_translations (place_id, language_id, name, slug)
SELECT p.id, l.id, v.name, v.slug
FROM (VALUES
    -- ── Kadıköy ────────────────────────────────────────────────────────────────
    ('ph_walters_coffee',    'tr', 'Walter''s Coffee Roastery', 'walters-coffee-roastery-kadikoy'),
    ('ph_walters_coffee',    'en', 'Walter''s Coffee Roastery', 'walters-coffee-roastery-kadikoy'),
    ('ph_montag_coffee',     'tr', 'Montag Coffee',             'montag-coffee-kadikoy'),
    ('ph_montag_coffee',     'en', 'Montag Coffee',             'montag-coffee-kadikoy'),
    ('ph_kronotrop_kadikoy', 'tr', 'Kronotrop Kadıköy',         'kronotrop-kadikoy'),
    ('ph_kronotrop_kadikoy', 'en', 'Kronotrop Kadikoy',         'kronotrop-kadikoy'),
    ('ph_arka_oda',          'tr', 'Arka Oda',                  'arka-oda-kadikoy'),
    ('ph_arka_oda',          'en', 'Arka Oda',                  'arka-oda-kadikoy'),
    ('ph_ciya_sofrasi',      'tr', 'Çiya Sofrası',              'ciya-sofrasi'),
    ('ph_ciya_sofrasi',      'en', 'Ciya Sofrasi',              'ciya-sofrasi'),
    ('ph_basta_street_food', 'tr', 'Basta Street Food',         'basta-street-food'),
    ('ph_basta_street_food', 'en', 'Basta Street Food',         'basta-street-food'),
    ('ph_naga_putrika',      'tr', 'Naga Putrika',              'naga-putrika'),
    ('ph_naga_putrika',      'en', 'Naga Putrika',              'naga-putrika'),
    ('ph_zapata_burger',     'tr', 'Zapata Burger',             'zapata-burger'),
    ('ph_zapata_burger',     'en', 'Zapata Burger',             'zapata-burger'),
    ('ph_kemal_usta',        'tr', 'Kemal Usta',                'kemal-usta'),
    ('ph_kemal_usta',        'en', 'Kemal Usta',                'kemal-usta'),
    ('ph_kadikoy_borekci',   'tr', 'Kadıköy Börekçisi',         'kadikoy-borekci'),
    ('ph_kadikoy_borekci',   'en', 'Kadikoy Borekci',           'kadikoy-borekci'),
    -- ── Beşiktaş ───────────────────────────────────────────────────────────────
    ('ph_mangerie',            'tr', 'Mangerie',                  'mangerie-besiktas'),
    ('ph_mangerie',            'en', 'Mangerie',                  'mangerie-besiktas'),
    ('ph_lucca',               'tr', 'Lucca',                     'lucca-besiktas'),
    ('ph_lucca',               'en', 'Lucca',                     'lucca-besiktas'),
    ('ph_bebek_kahve',         'tr', 'Bebek Kahve',               'bebek-kahve'),
    ('ph_bebek_kahve',         'en', 'Bebek Kahve',               'bebek-kahve'),
    ('ph_house_cafe_ortakoy',  'tr', 'The House Cafe Ortaköy',    'house-cafe-ortakoy'),
    ('ph_house_cafe_ortakoy',  'en', 'The House Cafe Ortakoy',    'house-cafe-ortakoy'),
    ('ph_the_townhouse',       'tr', 'The Townhouse',             'the-townhouse-besiktas'),
    ('ph_the_townhouse',       'en', 'The Townhouse',             'the-townhouse-besiktas'),
    ('ph_efendi_bar',          'tr', 'Efendi Bar',                'efendi-bar'),
    ('ph_efendi_bar',          'en', 'Efendi Bar',                'efendi-bar'),
    ('ph_akaretler_lokantasi', 'tr', 'Akaretler Lokantası',       'akaretler-lokantasi'),
    ('ph_akaretler_lokantasi', 'en', 'Akaretler Lokantasi',       'akaretler-lokantasi'),
    ('ph_besiktas_balikci',    'tr', 'Beşiktaş Balıkçısı',        'besiktas-balikci'),
    ('ph_besiktas_balikci',    'en', 'Besiktas Balikci',          'besiktas-balikci'),
    ('ph_ortakoy_waffle',      'tr', 'Ortaköy Waffle',            'ortakoy-waffle'),
    ('ph_ortakoy_waffle',      'en', 'Ortakoy Waffle',            'ortakoy-waffle'),
    ('ph_fully_karakoy',       'tr', 'Fully Karaköy',             'fully-karakoy'),
    ('ph_fully_karakoy',       'en', 'Fully Karakoy',             'fully-karakoy'),
    -- ── Beyoğlu / Karaköy ──────────────────────────────────────────────────────
    ('ph_karakoy_lokantasi', 'tr', 'Karaköy Lokantası',  'karakoy-lokantasi'),
    ('ph_karakoy_lokantasi', 'en', 'Karakoy Lokantasi',  'karakoy-lokantasi'),
    ('ph_namli_gurme',       'tr', 'Namlı Gurme',        'namli-gurme'),
    ('ph_namli_gurme',       'en', 'Namli Gurme',        'namli-gurme'),
    ('ph_unter',             'tr', 'Unter',              'unter-beyoglu'),
    ('ph_unter',             'en', 'Unter',              'unter-beyoglu'),
    ('ph_finn_karakoy',      'tr', 'Finn Karaköy',       'finn-karakoy'),
    ('ph_finn_karakoy',      'en', 'Finn Karakoy',       'finn-karakoy'),
    ('ph_mums_cafe',         'tr', 'Mums Cafe',          'mums-cafe'),
    ('ph_mums_cafe',         'en', 'Mums Cafe',          'mums-cafe'),
    ('ph_viyana_kahvesi',    'tr', 'Viyana Kahvesi',     'viyana-kahvesi'),
    ('ph_viyana_kahvesi',    'en', 'Viyana Kahvesi',     'viyana-kahvesi'),
    ('ph_360_istanbul',      'tr', '360 Istanbul',       '360-istanbul'),
    ('ph_360_istanbul',      'en', '360 Istanbul',       '360-istanbul'),
    ('ph_mikla',             'tr', 'Mikla',              'mikla'),
    ('ph_mikla',             'en', 'Mikla',              'mikla'),
    ('ph_pandeli',           'tr', 'Pandeli',            'pandeli'),
    ('ph_pandeli',           'en', 'Pandeli',            'pandeli'),
    ('ph_galata_house',      'tr', 'Galata House',       'galata-house'),
    ('ph_galata_house',      'en', 'Galata House',       'galata-house')
) AS v(google_id, lang_code, name, slug)
JOIN place.places   p ON p.google_place_id = v.google_id
JOIN geo.languages  l ON l.code            = v.lang_code
ON CONFLICT (place_id, language_id) DO NOTHING;

-- ============================================================
-- 3. PLACE LABELS
--    Labels resolved by key — mapping:
--      coffee/work   → arkadas_bulusmasi(0.9), wifi(0.7)
--      fine dining   → fine_dining(0.9), romantik(0.7)
--      nightlife/bar → gece_hayati(0.9), alkollu(0.8)
--      breakfast     → kahvalti(0.9), arkadas_bulusmasi(0.5)
--      scenic/rooftop→ manzarali(0.9), rooftop(0.9)
-- ============================================================
INSERT INTO label.place_labels (place_id, label_id, weight)
SELECT p.id, lb.id, v.weight::NUMERIC(3,2)
FROM (VALUES
    -- ── Kadıköy ────────────────────────────────────────────────────────────────
    ('ph_walters_coffee',    'arkadas_bulusmasi', 0.90),  -- social coffee spot
    ('ph_walters_coffee',    'wifi',              0.70),
    ('ph_montag_coffee',     'arkadas_bulusmasi', 0.90),
    ('ph_montag_coffee',     'wifi',              0.70),
    ('ph_kronotrop_kadikoy', 'arkadas_bulusmasi', 0.90),
    ('ph_kronotrop_kadikoy', 'wifi',              0.70),
    ('ph_kronotrop_kadikoy', 'kahvalti',          0.50),  -- serves brunch
    ('ph_arka_oda',          'gece_hayati',       0.90),  -- bar/nightlife
    ('ph_arka_oda',          'alkollu',           0.80),
    ('ph_ciya_sofrasi',      'fine_dining',       0.90),  -- iconic Anatolian kitchen
    ('ph_ciya_sofrasi',      'romantik',          0.70),
    ('ph_basta_street_food', 'arkadas_bulusmasi', 0.80),  -- casual meetup
    ('ph_naga_putrika',      'fine_dining',       0.70),
    ('ph_naga_putrika',      'romantik',          0.50),
    ('ph_zapata_burger',     'arkadas_bulusmasi', 0.80),
    ('ph_kemal_usta',        'fine_dining',       0.80),  -- seafood
    ('ph_kemal_usta',        'romantik',          0.60),
    ('ph_kadikoy_borekci',   'kahvalti',          0.90),  -- breakfast/börek
    ('ph_kadikoy_borekci',   'arkadas_bulusmasi', 0.50),
    -- ── Beşiktaş ───────────────────────────────────────────────────────────────
    ('ph_mangerie',            'kahvalti',          0.90),  -- brunch destination
    ('ph_mangerie',            'arkadas_bulusmasi', 0.70),
    ('ph_mangerie',            'manzarali',         0.60),
    ('ph_lucca',               'gece_hayati',       0.90),  -- Bebek nightlife
    ('ph_lucca',               'alkollu',           0.80),
    ('ph_lucca',               'arkadas_bulusmasi', 0.70),
    ('ph_bebek_kahve',         'arkadas_bulusmasi', 0.90),  -- iconic Bosphorus cafe
    ('ph_bebek_kahve',         'manzarali',         0.80),
    ('ph_bebek_kahve',         'wifi',              0.60),
    ('ph_house_cafe_ortakoy',  'kahvalti',          0.80),  -- brunch with Bosphorus view
    ('ph_house_cafe_ortakoy',  'manzarali',         0.90),
    ('ph_house_cafe_ortakoy',  'arkadas_bulusmasi', 0.70),
    ('ph_the_townhouse',       'gece_hayati',       0.80),
    ('ph_the_townhouse',       'alkollu',           0.70),
    ('ph_efendi_bar',          'gece_hayati',       0.90),
    ('ph_efendi_bar',          'alkollu',           0.90),
    ('ph_efendi_bar',          'romantik',          0.60),
    ('ph_akaretler_lokantasi', 'fine_dining',       0.90),  -- upscale dining
    ('ph_akaretler_lokantasi', 'romantik',          0.80),
    ('ph_besiktas_balikci',    'fine_dining',       0.80),  -- seafood
    ('ph_besiktas_balikci',    'romantik',          0.70),
    ('ph_besiktas_balikci',    'manzarali',         0.60),
    ('ph_ortakoy_waffle',      'arkadas_bulusmasi', 0.80),  -- street food icon
    ('ph_ortakoy_waffle',      'manzarali',         0.70),
    ('ph_fully_karakoy',       'gece_hayati',       0.90),
    ('ph_fully_karakoy',       'alkollu',           0.80),
    -- ── Beyoğlu / Karaköy ──────────────────────────────────────────────────────
    ('ph_karakoy_lokantasi', 'fine_dining',       0.90),  -- Karaköy institution
    ('ph_karakoy_lokantasi', 'romantik',          0.70),
    ('ph_namli_gurme',       'kahvalti',          0.70),  -- deli & breakfast
    ('ph_namli_gurme',       'arkadas_bulusmasi', 0.80),
    ('ph_unter',             'gece_hayati',       0.90),  -- underground bar
    ('ph_unter',             'alkollu',           0.90),
    ('ph_finn_karakoy',      'gece_hayati',       0.80),
    ('ph_finn_karakoy',      'alkollu',           0.80),
    ('ph_finn_karakoy',      'arkadas_bulusmasi', 0.70),
    ('ph_mums_cafe',         'arkadas_bulusmasi', 0.90),
    ('ph_mums_cafe',         'wifi',              0.70),
    ('ph_mums_cafe',         'kahvalti',          0.50),
    ('ph_viyana_kahvesi',    'arkadas_bulusmasi', 0.90),
    ('ph_viyana_kahvesi',    'wifi',              0.60),
    ('ph_360_istanbul',      'gece_hayati',       0.90),  -- rooftop bar
    ('ph_360_istanbul',      'rooftop',           0.90),
    ('ph_360_istanbul',      'manzarali',         0.90),
    ('ph_360_istanbul',      'alkollu',           0.70),
    ('ph_mikla',             'fine_dining',       0.90),  -- Michelin-starred rooftop
    ('ph_mikla',             'rooftop',           0.90),
    ('ph_mikla',             'manzarali',         0.90),
    ('ph_mikla',             'romantik',          0.80),
    ('ph_pandeli',           'fine_dining',       0.90),  -- historic Ottoman kitchen
    ('ph_pandeli',           'romantik',          0.70),
    ('ph_galata_house',      'fine_dining',       0.70),
    ('ph_galata_house',      'romantik',          0.60),
    ('ph_galata_house',      'manzarali',         0.50)
) AS v(google_id, label_key, weight)
JOIN place.places  p  ON p.google_place_id = v.google_id
JOIN label.labels  lb ON lb.key            = v.label_key
ON CONFLICT (place_id, label_id) DO NOTHING;

-- ============================================================
-- 4. PLACE SCORES — high-range seed (7.0 – 10.0)
-- ============================================================
INSERT INTO place.place_scores (place_id, popularity_score, quality_score, trend_score, final_score)
SELECT
    p.id,
    ROUND((random() * 3 + 7)::NUMERIC, 2),
    ROUND((random() * 3 + 7)::NUMERIC, 2),
    ROUND((random() * 3 + 7)::NUMERIC, 2),
    ROUND((random() * 3 + 7)::NUMERIC, 2)
FROM place.places p
WHERE p.google_place_id LIKE 'ph_%'
ON CONFLICT (place_id) DO NOTHING;

COMMIT;

-- ============================================================
-- VALIDATION
-- ============================================================
SELECT 'place.places'      AS "table", COUNT(*) AS rows FROM place.places
UNION ALL
SELECT 'place_translations',            COUNT(*) FROM place.place_translations
UNION ALL
SELECT 'label.place_labels',            COUNT(*) FROM label.place_labels
UNION ALL
SELECT 'place.place_scores',            COUNT(*) FROM place.place_scores
ORDER BY 1;
