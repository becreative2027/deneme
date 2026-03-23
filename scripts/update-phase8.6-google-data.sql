-- ============================================================
-- Phase 8.6 — Google Data Update
-- google_place_id: gerçek ChIJ formatında Google Place ID
-- Koordinatlar, isimler ve ilçeler Google Maps URL'lerinden alındı
-- ============================================================

BEGIN;

-- ============================================================
-- 1. EMİNÖNÜ İLÇESİ EKLE (Pandeli için)
-- ============================================================
DO $$
DECLARE
    v_country_id INT;
    v_city_id    INT;
    v_tr_id      INT;
    v_en_id      INT;
    v_eminonu_id INT;
BEGIN
    SELECT id INTO v_country_id FROM geo.countries WHERE code = 'TR';
    SELECT id INTO v_tr_id      FROM geo.languages  WHERE code = 'tr';
    SELECT id INTO v_en_id      FROM geo.languages  WHERE code = 'en';

    SELECT ci.id INTO v_city_id
    FROM geo.cities ci
    JOIN geo.city_translations ct ON ct.city_id = ci.id
    JOIN geo.languages          l  ON l.id = ct.language_id
    WHERE ci.country_id = v_country_id AND l.code = 'en' AND ct.slug = 'istanbul'
    LIMIT 1;

    SELECT di.id INTO v_eminonu_id
    FROM geo.districts di
    JOIN geo.district_translations dt ON dt.district_id = di.id
    JOIN geo.languages              l  ON l.id = dt.language_id
    WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'eminonu'
    LIMIT 1;

    IF v_eminonu_id IS NULL THEN
        INSERT INTO geo.districts (city_id) VALUES (v_city_id) RETURNING id INTO v_eminonu_id;
        RAISE NOTICE 'Eminönü ilçesi eklendi (id=%)', v_eminonu_id;
    ELSE
        RAISE NOTICE 'Eminönü zaten mevcut (id=%)', v_eminonu_id;
    END IF;

    INSERT INTO geo.district_translations (district_id, language_id, name, slug) VALUES
        (v_eminonu_id, v_tr_id, 'Eminönü', 'eminonu'),
        (v_eminonu_id, v_en_id, 'Eminonu', 'eminonu')
    ON CONFLICT (district_id, language_id) DO NOTHING;
END $$;

-- ============================================================
-- 2. PLACE.PLACES — google_place_id (ChIJ), koordinat, ilçe
-- ============================================================
DO $$
DECLARE
    v_country_id  INT;
    v_city_id     INT;
    v_kadikoy_id  INT;
    v_besiktas_id INT;
    v_beyoglu_id  INT;
    v_eminonu_id  INT;
BEGIN
    SELECT id INTO v_country_id FROM geo.countries WHERE code = 'TR';

    SELECT ci.id INTO v_city_id
    FROM geo.cities ci
    JOIN geo.city_translations ct ON ct.city_id = ci.id
    JOIN geo.languages          l  ON l.id = ct.language_id
    WHERE ci.country_id = v_country_id AND l.code = 'en' AND ct.slug = 'istanbul'
    LIMIT 1;

    SELECT di.id INTO v_kadikoy_id  FROM geo.districts di JOIN geo.district_translations dt ON dt.district_id = di.id JOIN geo.languages l ON l.id = dt.language_id WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'kadikoy'  LIMIT 1;
    SELECT di.id INTO v_besiktas_id FROM geo.districts di JOIN geo.district_translations dt ON dt.district_id = di.id JOIN geo.languages l ON l.id = dt.language_id WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'besiktas' LIMIT 1;
    SELECT di.id INTO v_beyoglu_id  FROM geo.districts di JOIN geo.district_translations dt ON dt.district_id = di.id JOIN geo.languages l ON l.id = dt.language_id WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'beyoglu'  LIMIT 1;
    SELECT di.id INTO v_eminonu_id  FROM geo.districts di JOIN geo.district_translations dt ON dt.district_id = di.id JOIN geo.languages l ON l.id = dt.language_id WHERE di.city_id = v_city_id AND l.code = 'en' AND dt.slug = 'eminonu'  LIMIT 1;

    -- ── Kadıköy ────────────────────────────────────────────────────────────────
    UPDATE place.places SET google_place_id = 'ChIJ1QbFIWG4yhQRZre_Qwdk7po', latitude = 40.9848414, longitude = 29.0261005, district_id = v_kadikoy_id WHERE google_place_id = 'ph_walters_coffee';
    UPDATE place.places SET google_place_id = 'ChIJi34q7Ge4yhQRNkQd33XcwP0', latitude = 40.9900393, longitude = 29.0242324, district_id = v_kadikoy_id WHERE google_place_id = 'ph_montag_coffee';
    UPDATE place.places SET google_place_id = 'ChIJnwid533HyhQRv_XufXvsfyA', latitude = 40.9694073, longitude = 29.0661387, district_id = v_kadikoy_id WHERE google_place_id = 'ph_kronotrop_kadikoy';
    UPDATE place.places SET google_place_id = 'ChIJJwApwma4yhQR7T2fpIAK2og', latitude = 40.9865964, longitude = 29.0264904, district_id = v_kadikoy_id WHERE google_place_id = 'ph_arka_oda';
    UPDATE place.places SET google_place_id = 'ChIJhToLome4yhQRE1EMuLSuqlg', latitude = 40.9893196, longitude = 29.0244093, district_id = v_kadikoy_id WHERE google_place_id = 'ph_ciya_sofrasi';
    UPDATE place.places SET google_place_id = 'ChIJHaR2P2a4yhQR39F-oqWuBqM', latitude = 40.9877957, longitude = 29.0262009, district_id = v_kadikoy_id WHERE google_place_id = 'ph_basta_street_food';
    UPDATE place.places SET google_place_id = 'ChIJ2WIzwIq4yhQRnDfLgoPPQ_Y', latitude = 40.9804921, longitude = 29.0239665, district_id = v_kadikoy_id WHERE google_place_id = 'ph_naga_putrika';
    UPDATE place.places SET google_place_id = 'ChIJjxKr-2a4yhQRqKeyb_cLKx8', latitude = 40.9877860, longitude = 29.0261630, district_id = v_kadikoy_id WHERE google_place_id = 'ph_zapata_burger';
    UPDATE place.places SET google_place_id = 'ChIJyyCtA2C4yhQRPGsO_h-dZPk', latitude = 40.9812127, longitude = 29.0230762, district_id = v_kadikoy_id WHERE google_place_id = 'ph_kemal_usta';
    UPDATE place.places SET google_place_id = 'ChIJX_2ZxGe4yhQR6UShkyWduhQ', latitude = 40.9902862, longitude = 29.0246082, district_id = v_kadikoy_id WHERE google_place_id = 'ph_kadikoy_borekci';
    -- The Townhouse: koordinatlar Kadıköy'ü gösteriyor (40.957, 29.081) — ilçe düzeltildi
    UPDATE place.places SET google_place_id = 'ChIJmwXY2G7HyhQRPHQkdZ3PjWU', latitude = 40.9579546, longitude = 29.0818278, district_id = v_kadikoy_id WHERE google_place_id = 'ph_the_townhouse';

    -- ── Beşiktaş ───────────────────────────────────────────────────────────────
    UPDATE place.places SET google_place_id = 'ChIJE2G-ygK2yhQRdvYZjzFVBKc', latitude = 41.0784965, longitude = 29.0446209, district_id = v_besiktas_id WHERE google_place_id = 'ph_mangerie';
    UPDATE place.places SET google_place_id = 'ChIJX2Ug_v-3yhQR_ewLcNyaTuc', latitude = 41.0773800, longitude = 29.0433160, district_id = v_besiktas_id WHERE google_place_id = 'ph_lucca';
    UPDATE place.places SET google_place_id = 'ChIJ__3upvi3yhQRcXD1opUfawc', latitude = 41.0767916, longitude = 29.0440649, district_id = v_besiktas_id WHERE google_place_id = 'ph_bebek_kahve';
    UPDATE place.places SET google_place_id = 'ChIJ16t1Xsi3yhQR5NiQPEvEQj4', latitude = 41.0475281, longitude = 29.0252667, district_id = v_besiktas_id WHERE google_place_id = 'ph_house_cafe_ortakoy';
    -- Efendi Bar → Efendi Topağacı
    UPDATE place.places SET google_place_id = 'ChIJR3m4EQm3yhQRbh-ShF8GOYk', latitude = 41.0513762, longitude = 28.9957712, district_id = v_besiktas_id WHERE google_place_id = 'ph_efendi_bar';

    -- ── Beyoğlu / Karaköy ──────────────────────────────────────────────────────
    UPDATE place.places SET google_place_id = 'ChIJr6PRGd25yhQR2VYidbg9zyQ', latitude = 41.0247498, longitude = 28.9801935, district_id = v_beyoglu_id WHERE google_place_id = 'ph_karakoy_lokantasi';
    UPDATE place.places SET google_place_id = 'ChIJdxbTod25yhQRCdN_A48zsFo', latitude = 41.0249060, longitude = 28.9775655, district_id = v_beyoglu_id WHERE google_place_id = 'ph_finn_karakoy';
    UPDATE place.places SET google_place_id = 'ChIJATAfU9y5yhQRh4xXBn49Nn0', latitude = 41.0246698, longitude = 28.9791382, district_id = v_beyoglu_id WHERE google_place_id = 'ph_mums_cafe';
    UPDATE place.places SET google_place_id = 'ChIJEUy3A-e5yhQRW8fUnAs9Xdc', latitude = 41.0261563, longitude = 28.9734200, district_id = v_beyoglu_id WHERE google_place_id = 'ph_viyana_kahvesi';
    UPDATE place.places SET google_place_id = 'ChIJhd6-PGa3yhQRkPyq9aLN268', latitude = 41.0326839, longitude = 28.9766684, district_id = v_beyoglu_id WHERE google_place_id = 'ph_360_istanbul';
    UPDATE place.places SET google_place_id = 'ChIJReR3RuC5yhQR_t7o9KL5qYQ', latitude = 41.0310369, longitude = 28.9741962, district_id = v_beyoglu_id WHERE google_place_id = 'ph_mikla';
    -- Galata House → Galata Frida House Cafe Restaurant
    UPDATE place.places SET google_place_id = 'ChIJuSqiaoe5yhQRHJUMfhFlLN8', latitude = 41.0272644, longitude = 28.9734691, district_id = v_beyoglu_id WHERE google_place_id = 'ph_galata_house';

    -- ── Eminönü — Pandeli (Mısır Çarşısı yanı, Beyoğlu değil) ─────────────────
    UPDATE place.places SET google_place_id = 'ChIJP2joPWa3yhQR-5rFKbT0saE', latitude = 41.0170699, longitude = 28.9712869, district_id = v_eminonu_id WHERE google_place_id = 'ph_pandeli';
END $$;

-- ============================================================
-- 3. PLACE_TRANSLATIONS — Google ile uyumlu isimler
-- ============================================================
UPDATE place.place_translations AS pt
SET name = v.name, slug = v.slug
FROM (VALUES
    -- ── Kadıköy ──────────────────────────────────────────────────────────────
    ('ChIJ1QbFIWG4yhQRZre_Qwdk7po', 'tr', 'Walter''s Coffee Roastery',         'walters-coffee-roastery'),
    ('ChIJ1QbFIWG4yhQRZre_Qwdk7po', 'en', 'Walter''s Coffee Roastery',         'walters-coffee-roastery'),
    ('ChIJi34q7Ge4yhQRNkQd33XcwP0', 'tr', 'Montag Coffee Kadıköy',             'montag-coffee-kadikoy'),
    ('ChIJi34q7Ge4yhQRNkQd33XcwP0', 'en', 'Montag Coffee Kadikoy',             'montag-coffee-kadikoy'),
    ('ChIJnwid533HyhQRv_XufXvsfyA', 'tr', 'Kronotrop Caddebostan Grove',       'kronotrop-caddebostan-grove'),
    ('ChIJnwid533HyhQRv_XufXvsfyA', 'en', 'Kronotrop Caddebostan Grove',       'kronotrop-caddebostan-grove'),
    ('ChIJJwApwma4yhQR7T2fpIAK2og', 'tr', 'arkaoda',                           'arkaoda'),
    ('ChIJJwApwma4yhQR7T2fpIAK2og', 'en', 'arkaoda',                           'arkaoda'),
    ('ChIJhToLome4yhQRE1EMuLSuqlg', 'tr', 'Çiya Sofrası',                      'ciya-sofrasi'),
    ('ChIJhToLome4yhQRE1EMuLSuqlg', 'en', 'Ciya Sofrasi',                      'ciya-sofrasi'),
    ('ChIJHaR2P2a4yhQR39F-oqWuBqM', 'tr', 'Basta Street Food Bar',             'basta-street-food-bar'),
    ('ChIJHaR2P2a4yhQR39F-oqWuBqM', 'en', 'Basta Street Food Bar',             'basta-street-food-bar'),
    ('ChIJ2WIzwIq4yhQRnDfLgoPPQ_Y', 'tr', 'Kahvaltı Naga Putrika',             'kahvalti-naga-putrika'),
    ('ChIJ2WIzwIq4yhQRnDfLgoPPQ_Y', 'en', 'Kahvalti Naga Putrika',             'kahvalti-naga-putrika'),
    ('ChIJjxKr-2a4yhQRqKeyb_cLKx8', 'tr', 'Zapata Burger',                     'zapata-burger'),
    ('ChIJjxKr-2a4yhQRqKeyb_cLKx8', 'en', 'Zapata Burger',                     'zapata-burger'),
    ('ChIJyyCtA2C4yhQRPGsO_h-dZPk', 'tr', 'Kemal Usta Waffles',                'kemal-usta-waffles'),
    ('ChIJyyCtA2C4yhQRPGsO_h-dZPk', 'en', 'Kemal Usta Waffles',                'kemal-usta-waffles'),
    ('ChIJX_2ZxGe4yhQR6UShkyWduhQ', 'tr', 'Tarihi Kadıköy Börekçisi',          'tarihi-kadikoy-borekci'),
    ('ChIJX_2ZxGe4yhQR6UShkyWduhQ', 'en', 'Tarihi Kadikoy Borekci',            'tarihi-kadikoy-borekci'),
    ('ChIJmwXY2G7HyhQRPHQkdZ3PjWU', 'tr', 'The Townhouse',                     'the-townhouse'),
    ('ChIJmwXY2G7HyhQRPHQkdZ3PjWU', 'en', 'The Townhouse',                     'the-townhouse'),
    -- ── Beşiktaş ─────────────────────────────────────────────────────────────
    ('ChIJE2G-ygK2yhQRdvYZjzFVBKc', 'tr', 'Mangerie',                          'mangerie'),
    ('ChIJE2G-ygK2yhQRdvYZjzFVBKc', 'en', 'Mangerie',                          'mangerie'),
    ('ChIJX2Ug_v-3yhQR_ewLcNyaTuc', 'tr', 'Lucca',                             'lucca'),
    ('ChIJX2Ug_v-3yhQR_ewLcNyaTuc', 'en', 'Lucca',                             'lucca'),
    ('ChIJ__3upvi3yhQRcXD1opUfawc', 'tr', 'Bebek Kahve',                       'bebek-kahve'),
    ('ChIJ__3upvi3yhQRcXD1opUfawc', 'en', 'Bebek Kahve',                       'bebek-kahve'),
    ('ChIJ16t1Xsi3yhQR5NiQPEvEQj4', 'tr', 'The House Cafe Ortaköy',            'house-cafe-ortakoy'),
    ('ChIJ16t1Xsi3yhQR5NiQPEvEQj4', 'en', 'The House Cafe Ortakoy',            'house-cafe-ortakoy'),
    ('ChIJR3m4EQm3yhQRbh-ShF8GOYk', 'tr', 'Efendi Topağacı',                   'efendi-topagaci'),
    ('ChIJR3m4EQm3yhQRbh-ShF8GOYk', 'en', 'Efendi Topagaci',                   'efendi-topagaci'),
    -- ── Beyoğlu / Karaköy ────────────────────────────────────────────────────
    ('ChIJr6PRGd25yhQR2VYidbg9zyQ', 'tr', 'Karaköy Lokantası',                 'karakoy-lokantasi'),
    ('ChIJr6PRGd25yhQR2VYidbg9zyQ', 'en', 'Karakoy Lokantasi',                 'karakoy-lokantasi'),
    ('ChIJdxbTod25yhQRCdN_A48zsFo', 'tr', 'Finn Karaköy',                      'finn-karakoy'),
    ('ChIJdxbTod25yhQRCdN_A48zsFo', 'en', 'Finn Karakoy',                      'finn-karakoy'),
    ('ChIJATAfU9y5yhQRh4xXBn49Nn0', 'tr', 'Mums Cafe',                         'mums-cafe'),
    ('ChIJATAfU9y5yhQRh4xXBn49Nn0', 'en', 'Mums Cafe',                         'mums-cafe'),
    ('ChIJEUy3A-e5yhQRW8fUnAs9Xdc', 'tr', 'Viyana Kahvesi Galata',             'viyana-kahvesi-galata'),
    ('ChIJEUy3A-e5yhQRW8fUnAs9Xdc', 'en', 'Viyana Kahvesi Galata',             'viyana-kahvesi-galata'),
    ('ChIJhd6-PGa3yhQRkPyq9aLN268', 'tr', '360 İstanbul',                      '360-istanbul'),
    ('ChIJhd6-PGa3yhQRkPyq9aLN268', 'en', '360 Istanbul',                      '360-istanbul'),
    ('ChIJReR3RuC5yhQR_t7o9KL5qYQ', 'tr', 'Mikla',                             'mikla'),
    ('ChIJReR3RuC5yhQR_t7o9KL5qYQ', 'en', 'Mikla',                             'mikla'),
    ('ChIJuSqiaoe5yhQRHJUMfhFlLN8', 'tr', 'Galata Frida House Cafe Restaurant','galata-frida-house'),
    ('ChIJuSqiaoe5yhQRHJUMfhFlLN8', 'en', 'Galata Frida House Cafe Restaurant','galata-frida-house'),
    -- ── Eminönü ──────────────────────────────────────────────────────────────
    ('ChIJP2joPWa3yhQR-5rFKbT0saE', 'tr', 'Pandeli Restaurant',                'pandeli-restaurant'),
    ('ChIJP2joPWa3yhQR-5rFKbT0saE', 'en', 'Pandeli Restaurant',                'pandeli-restaurant')
) AS v(google_id, lang_code, name, slug),
place.places p,
geo.languages l
WHERE p.google_place_id = v.google_id
  AND l.code            = v.lang_code
  AND pt.place_id       = p.id
  AND pt.language_id    = l.id;

COMMIT;

-- ============================================================
-- VALIDATION
-- ============================================================
SELECT
    dt.name          AS ilce,
    pt.name          AS mekan,
    p.latitude       AS lat,
    p.longitude      AS lng,
    p.google_place_id
FROM place.places p
JOIN place.place_translations  pt ON pt.place_id     = p.id
JOIN geo.languages              l  ON l.id            = pt.language_id AND l.code = 'tr'
LEFT JOIN geo.district_translations dt ON dt.district_id = p.district_id
JOIN geo.languages              ld ON ld.id           = dt.language_id AND ld.code = 'tr'
ORDER BY dt.name, pt.name;
