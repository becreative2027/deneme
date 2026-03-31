-- ============================================================
-- Seed: comprehensive label expansion (v2)
-- 62 labels across 6 categories with TR+EN translations + keywords
-- Auto-assigns labels to existing places via keyword matching
-- Idempotent: ON CONFLICT DO NOTHING throughout
-- ============================================================

BEGIN;

-- ── 1. Ensure category rows exist ────────────────────────────────────────────
INSERT INTO label.label_categories (key) VALUES
    ('atmosphere'),
    ('experience'),
    ('food_drink'),
    ('beverage'),
    ('entertainment'),
    ('features')
ON CONFLICT (key) DO NOTHING;

-- ── 2. Category translations ─────────────────────────────────────────────────
INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 1, 'Ortam & Atmosfer'   FROM label.label_categories WHERE key = 'atmosphere'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 2, 'Atmosphere'         FROM label.label_categories WHERE key = 'atmosphere'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 1, 'Deneyim'            FROM label.label_categories WHERE key = 'experience'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 2, 'Experience'         FROM label.label_categories WHERE key = 'experience'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 1, 'Yemek & İçecek'    FROM label.label_categories WHERE key = 'food_drink'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 2, 'Food & Drink'       FROM label.label_categories WHERE key = 'food_drink'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 1, 'Kahve & Alkol'      FROM label.label_categories WHERE key = 'beverage'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 2, 'Beverages'          FROM label.label_categories WHERE key = 'beverage'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 1, 'Eğlence'            FROM label.label_categories WHERE key = 'entertainment'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 2, 'Entertainment'      FROM label.label_categories WHERE key = 'entertainment'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 1, 'Özellikler'         FROM label.label_categories WHERE key = 'features'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_category_translations (category_id, language_id, display_name)
SELECT id, 2, 'Features'           FROM label.label_categories WHERE key = 'features'
ON CONFLICT (category_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- ── 3. Labels ─────────────────────────────────────────────────────────────────
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'rooftop',        true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'manzarali',      true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'bahceli',        true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'ic_mekan',       true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'vintage',        true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'industrial',     true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'minimalist',     true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'luks',           true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'kasaba_kahvesi', true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'hareketli',      true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'sakin',          true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'dogal',          true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'deniz_kenari',   true FROM label.label_categories WHERE key = 'atmosphere' ON CONFLICT (key) DO NOTHING;

INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'romantik',          true FROM label.label_categories WHERE key = 'experience' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'arkadas_bulusmasi', true FROM label.label_categories WHERE key = 'experience' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'is_gorusmesi',      true FROM label.label_categories WHERE key = 'experience' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'aile_dostu',        true FROM label.label_categories WHERE key = 'experience' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'yalniz_calisma',    true FROM label.label_categories WHERE key = 'experience' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'dogum_gunu',        true FROM label.label_categories WHERE key = 'experience' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'ilk_bulus',         true FROM label.label_categories WHERE key = 'experience' ON CONFLICT (key) DO NOTHING;

INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'kahvalti',        true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'fine_dining',     true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'brunch',          true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'ogle_yemegi',     true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'aksam_yemegi',    true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'sokak_lezzeti',   true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'vejetaryen',      true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'vegan',           true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'glutensiz',       true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'tatli',           true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'deniz_urunu',     true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'etli_izgara',     true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'pide_lahmacun',   true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'dunya_mutfagi',   true FROM label.label_categories WHERE key = 'food_drink' ON CONFLICT (key) DO NOTHING;

INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'alkollu',          true FROM label.label_categories WHERE key = 'beverage' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'alkolsuz',         true FROM label.label_categories WHERE key = 'beverage' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'specialty_kahve',  true FROM label.label_categories WHERE key = 'beverage' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'turk_kahvesi',     true FROM label.label_categories WHERE key = 'beverage' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'boba_tea',         true FROM label.label_categories WHERE key = 'beverage' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'craft_bira',       true FROM label.label_categories WHERE key = 'beverage' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'sarap_bari',       true FROM label.label_categories WHERE key = 'beverage' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'kokteyl',          true FROM label.label_categories WHERE key = 'beverage' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'smoothie',         true FROM label.label_categories WHERE key = 'beverage' ON CONFLICT (key) DO NOTHING;

INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'gece_hayati',  true FROM label.label_categories WHERE key = 'entertainment' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'canli_muzik',  true FROM label.label_categories WHERE key = 'entertainment' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'dj_seti',      true FROM label.label_categories WHERE key = 'entertainment' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'oyun_gecesi',  true FROM label.label_categories WHERE key = 'entertainment' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'kitap_kultur', true FROM label.label_categories WHERE key = 'entertainment' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'spor_izleme',  true FROM label.label_categories WHERE key = 'entertainment' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'dans',         true FROM label.label_categories WHERE key = 'entertainment' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'karaoke',      true FROM label.label_categories WHERE key = 'entertainment' ON CONFLICT (key) DO NOTHING;

INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'wifi',               true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'priz',               true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'rezervasyon',        true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'yuruyus_mesafesi',   true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'otopark',            true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'engelli_erisim',     true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'evcil_hayvan',       true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'paket_servis',       true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'yedi_yirmidort',     true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'sabah_acilisi',      true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'gec_kapanma',        true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;
INSERT INTO label.labels (category_id, key, is_active)
SELECT id, 'teras',              true FROM label.label_categories WHERE key = 'features' ON CONFLICT (key) DO NOTHING;

-- ── 4. Label translations (direct INSERTs by key join) ───────────────────────
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Rooftop'             FROM label.labels lb WHERE lb.key = 'rooftop'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Rooftop'             FROM label.labels lb WHERE lb.key = 'rooftop'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Manzaralı'           FROM label.labels lb WHERE lb.key = 'manzarali'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Scenic View'         FROM label.labels lb WHERE lb.key = 'manzarali'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Bahçeli'             FROM label.labels lb WHERE lb.key = 'bahceli'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Garden Seating'      FROM label.labels lb WHERE lb.key = 'bahceli'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'İç Mekan'            FROM label.labels lb WHERE lb.key = 'ic_mekan'       ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Indoor'              FROM label.labels lb WHERE lb.key = 'ic_mekan'       ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Vintage'             FROM label.labels lb WHERE lb.key = 'vintage'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Vintage'             FROM label.labels lb WHERE lb.key = 'vintage'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Endüstriyel'         FROM label.labels lb WHERE lb.key = 'industrial'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Industrial'          FROM label.labels lb WHERE lb.key = 'industrial'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Minimalist'          FROM label.labels lb WHERE lb.key = 'minimalist'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Minimalist'          FROM label.labels lb WHERE lb.key = 'minimalist'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Lüks'                FROM label.labels lb WHERE lb.key = 'luks'           ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Luxury'              FROM label.labels lb WHERE lb.key = 'luks'           ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Mahalle Kahvesi'     FROM label.labels lb WHERE lb.key = 'kasaba_kahvesi' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Local Café'          FROM label.labels lb WHERE lb.key = 'kasaba_kahvesi' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Hareketli'           FROM label.labels lb WHERE lb.key = 'hareketli'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Lively'              FROM label.labels lb WHERE lb.key = 'hareketli'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Sakin'               FROM label.labels lb WHERE lb.key = 'sakin'          ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Quiet'               FROM label.labels lb WHERE lb.key = 'sakin'          ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Doğal & Organik'     FROM label.labels lb WHERE lb.key = 'dogal'          ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Natural'             FROM label.labels lb WHERE lb.key = 'dogal'          ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Deniz Kenarı'        FROM label.labels lb WHERE lb.key = 'deniz_kenari'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Waterfront'          FROM label.labels lb WHERE lb.key = 'deniz_kenari'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Romantik'            FROM label.labels lb WHERE lb.key = 'romantik'           ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Romantic'            FROM label.labels lb WHERE lb.key = 'romantik'           ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Arkadaş Buluşması'   FROM label.labels lb WHERE lb.key = 'arkadas_bulusmasi' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Friends Meetup'      FROM label.labels lb WHERE lb.key = 'arkadas_bulusmasi' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'İş Görüşmesi'        FROM label.labels lb WHERE lb.key = 'is_gorusmesi'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Business Meeting'    FROM label.labels lb WHERE lb.key = 'is_gorusmesi'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Aile Dostu'          FROM label.labels lb WHERE lb.key = 'aile_dostu'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Family Friendly'     FROM label.labels lb WHERE lb.key = 'aile_dostu'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Çalışmak İçin'       FROM label.labels lb WHERE lb.key = 'yalniz_calisma'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Work-Friendly'       FROM label.labels lb WHERE lb.key = 'yalniz_calisma'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Doğum Günü'          FROM label.labels lb WHERE lb.key = 'dogum_gunu'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Birthday Spot'       FROM label.labels lb WHERE lb.key = 'dogum_gunu'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'İlk Buluşma'         FROM label.labels lb WHERE lb.key = 'ilk_bulus'          ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'First Date'          FROM label.labels lb WHERE lb.key = 'ilk_bulus'          ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Kahvaltı'            FROM label.labels lb WHERE lb.key = 'kahvalti'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Breakfast'           FROM label.labels lb WHERE lb.key = 'kahvalti'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Fine Dining'         FROM label.labels lb WHERE lb.key = 'fine_dining'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Fine Dining'         FROM label.labels lb WHERE lb.key = 'fine_dining'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Brunch'              FROM label.labels lb WHERE lb.key = 'brunch'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Brunch'              FROM label.labels lb WHERE lb.key = 'brunch'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Öğle Yemeği'         FROM label.labels lb WHERE lb.key = 'ogle_yemegi'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Lunch'               FROM label.labels lb WHERE lb.key = 'ogle_yemegi'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Akşam Yemeği'        FROM label.labels lb WHERE lb.key = 'aksam_yemegi'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Dinner'              FROM label.labels lb WHERE lb.key = 'aksam_yemegi'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Sokak Lezzeti'       FROM label.labels lb WHERE lb.key = 'sokak_lezzeti' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Street Food'         FROM label.labels lb WHERE lb.key = 'sokak_lezzeti' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Vejetaryen'          FROM label.labels lb WHERE lb.key = 'vejetaryen'    ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Vegetarian'          FROM label.labels lb WHERE lb.key = 'vejetaryen'    ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Vegan'               FROM label.labels lb WHERE lb.key = 'vegan'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Vegan'               FROM label.labels lb WHERE lb.key = 'vegan'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Glutensiz'           FROM label.labels lb WHERE lb.key = 'glutensiz'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Gluten-Free'         FROM label.labels lb WHERE lb.key = 'glutensiz'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Tatlı & Pastane'     FROM label.labels lb WHERE lb.key = 'tatli'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Desserts'            FROM label.labels lb WHERE lb.key = 'tatli'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Deniz Ürünleri'      FROM label.labels lb WHERE lb.key = 'deniz_urunu'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Seafood'             FROM label.labels lb WHERE lb.key = 'deniz_urunu'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Izgara & Et'         FROM label.labels lb WHERE lb.key = 'etli_izgara'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Grill & Meat'        FROM label.labels lb WHERE lb.key = 'etli_izgara'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Pide & Lahmacun'     FROM label.labels lb WHERE lb.key = 'pide_lahmacun' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Turkish Flatbread'   FROM label.labels lb WHERE lb.key = 'pide_lahmacun' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Dünya Mutfağı'       FROM label.labels lb WHERE lb.key = 'dunya_mutfagi' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'World Cuisine'       FROM label.labels lb WHERE lb.key = 'dunya_mutfagi' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Alkollü'             FROM label.labels lb WHERE lb.key = 'alkollu'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Alcohol Served'      FROM label.labels lb WHERE lb.key = 'alkollu'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Alkolsüz'            FROM label.labels lb WHERE lb.key = 'alkolsuz'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Non-Alcoholic'       FROM label.labels lb WHERE lb.key = 'alkolsuz'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Specialty Kahve'     FROM label.labels lb WHERE lb.key = 'specialty_kahve' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Specialty Coffee'    FROM label.labels lb WHERE lb.key = 'specialty_kahve' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Türk Kahvesi'        FROM label.labels lb WHERE lb.key = 'turk_kahvesi'    ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Turkish Coffee'      FROM label.labels lb WHERE lb.key = 'turk_kahvesi'    ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Boba Tea'            FROM label.labels lb WHERE lb.key = 'boba_tea'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Boba Tea'            FROM label.labels lb WHERE lb.key = 'boba_tea'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Craft Bira'          FROM label.labels lb WHERE lb.key = 'craft_bira'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Craft Beer'          FROM label.labels lb WHERE lb.key = 'craft_bira'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Şarap Barı'          FROM label.labels lb WHERE lb.key = 'sarap_bari'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Wine Bar'            FROM label.labels lb WHERE lb.key = 'sarap_bari'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Kokteyl'             FROM label.labels lb WHERE lb.key = 'kokteyl'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Cocktails'           FROM label.labels lb WHERE lb.key = 'kokteyl'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Smoothie & Meyve'    FROM label.labels lb WHERE lb.key = 'smoothie'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Smoothies & Juice'   FROM label.labels lb WHERE lb.key = 'smoothie'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Gece Hayatı'         FROM label.labels lb WHERE lb.key = 'gece_hayati'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Nightlife'           FROM label.labels lb WHERE lb.key = 'gece_hayati'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Canlı Müzik'         FROM label.labels lb WHERE lb.key = 'canli_muzik'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Live Music'          FROM label.labels lb WHERE lb.key = 'canli_muzik'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'DJ Seti'             FROM label.labels lb WHERE lb.key = 'dj_seti'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'DJ Set'              FROM label.labels lb WHERE lb.key = 'dj_seti'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Oyun Gecesi'         FROM label.labels lb WHERE lb.key = 'oyun_gecesi'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Game Night'          FROM label.labels lb WHERE lb.key = 'oyun_gecesi'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Kitap & Kültür'      FROM label.labels lb WHERE lb.key = 'kitap_kultur' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Books & Culture'     FROM label.labels lb WHERE lb.key = 'kitap_kultur' ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Spor İzleme'         FROM label.labels lb WHERE lb.key = 'spor_izleme'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Sports Screening'    FROM label.labels lb WHERE lb.key = 'spor_izleme'  ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Dans Alanı'          FROM label.labels lb WHERE lb.key = 'dans'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Dance Floor'         FROM label.labels lb WHERE lb.key = 'dans'         ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Karaoke'             FROM label.labels lb WHERE lb.key = 'karaoke'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Karaoke'             FROM label.labels lb WHERE lb.key = 'karaoke'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Ücretsiz Wi-Fi'      FROM label.labels lb WHERE lb.key = 'wifi'               ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Free Wi-Fi'          FROM label.labels lb WHERE lb.key = 'wifi'               ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Şarj Noktası'        FROM label.labels lb WHERE lb.key = 'priz'               ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Charging Points'     FROM label.labels lb WHERE lb.key = 'priz'               ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Rezervasyon'         FROM label.labels lb WHERE lb.key = 'rezervasyon'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Reservations'        FROM label.labels lb WHERE lb.key = 'rezervasyon'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Toplu Taşıma Yakın'  FROM label.labels lb WHERE lb.key = 'yuruyus_mesafesi'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Transit Nearby'      FROM label.labels lb WHERE lb.key = 'yuruyus_mesafesi'   ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Otopark'             FROM label.labels lb WHERE lb.key = 'otopark'            ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Parking'             FROM label.labels lb WHERE lb.key = 'otopark'            ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Engelli Erişimi'     FROM label.labels lb WHERE lb.key = 'engelli_erisim'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Accessible'          FROM label.labels lb WHERE lb.key = 'engelli_erisim'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Evcil Hayvan Dostu'  FROM label.labels lb WHERE lb.key = 'evcil_hayvan'       ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Pet Friendly'        FROM label.labels lb WHERE lb.key = 'evcil_hayvan'       ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Paket Servis'        FROM label.labels lb WHERE lb.key = 'paket_servis'       ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Takeaway'            FROM label.labels lb WHERE lb.key = 'paket_servis'       ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, '7/24 Açık'           FROM label.labels lb WHERE lb.key = 'yedi_yirmidort'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Open 24/7'           FROM label.labels lb WHERE lb.key = 'yedi_yirmidort'     ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Erken Açılış'        FROM label.labels lb WHERE lb.key = 'sabah_acilisi'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Early Opening'       FROM label.labels lb WHERE lb.key = 'sabah_acilisi'      ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Geç Kapanış'         FROM label.labels lb WHERE lb.key = 'gec_kapanma'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Late Closing'        FROM label.labels lb WHERE lb.key = 'gec_kapanma'        ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 1, 'Teras'               FROM label.labels lb WHERE lb.key = 'teras'              ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;
INSERT INTO label.label_translations (label_id, language_id, display_name)
SELECT lb.id, 2, 'Terrace'             FROM label.labels lb WHERE lb.key = 'teras'              ON CONFLICT (label_id, language_id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- ── 5. Keywords ───────────────────────────────────────────────────────────────
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'rooftop',      0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'rooftop' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'çatı katı',    0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'rooftop' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'manzara',      0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'manzarali' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'boğaz',        0.92, 'seed-v2' FROM label.labels lb WHERE lb.key = 'manzarali' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'bahçe',        0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'bahceli' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'açık hava',    0.85, 'seed-v2' FROM label.labels lb WHERE lb.key = 'bahceli' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'vintage',      0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'vintage' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'endüstriyel',  0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'industrial' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'lüks',         0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'luks' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'premium',      0.85, 'seed-v2' FROM label.labels lb WHERE lb.key = 'luks' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'mahalle',      0.85, 'seed-v2' FROM label.labels lb WHERE lb.key = 'kasaba_kahvesi' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'sakin',        0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'sakin' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'organik',      0.85, 'seed-v2' FROM label.labels lb WHERE lb.key = 'dogal' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'deniz',        0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'deniz_kenari' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'sahil',        0.92, 'seed-v2' FROM label.labels lb WHERE lb.key = 'deniz_kenari' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'romantik',     0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'romantik' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'aile',         0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'aile_dostu' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'çocuk',        0.88, 'seed-v2' FROM label.labels lb WHERE lb.key = 'aile_dostu' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'laptop',       0.92, 'seed-v2' FROM label.labels lb WHERE lb.key = 'yalniz_calisma' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'doğum günü',   0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'dogum_gunu' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'kahvaltı',     0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'kahvalti' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'serpme',       0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'kahvalti' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'brunch',       0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'brunch' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'fine dining',  0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'fine_dining' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'gastronomi',   0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'fine_dining' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'sokak',        0.85, 'seed-v2' FROM label.labels lb WHERE lb.key = 'sokak_lezzeti' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'vejetaryen',   0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'vejetaryen' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'vegan',        0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'vegan' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'glutensiz',    0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'glutensiz' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'tatlı',        0.88, 'seed-v2' FROM label.labels lb WHERE lb.key = 'tatli' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'pastane',      0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'tatli' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'balık',        0.88, 'seed-v2' FROM label.labels lb WHERE lb.key = 'deniz_urunu' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'ızgara',       0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'etli_izgara' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'kebap',        0.88, 'seed-v2' FROM label.labels lb WHERE lb.key = 'etli_izgara' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'pide',         0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'pide_lahmacun' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'lahmacun',     0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'pide_lahmacun' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'bar',          0.85, 'seed-v2' FROM label.labels lb WHERE lb.key = 'alkollu' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'pub',          0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'alkollu' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'specialty',    0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'specialty_kahve' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'filter',       0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'specialty_kahve' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'türk kahvesi', 0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'turk_kahvesi' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'boba',         0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'boba_tea' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'craft',        0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'craft_bira' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'şarap',        0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'sarap_bari' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'kokteyl',      0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'kokteyl' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'smoothie',     0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'smoothie' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'gece',         0.80, 'seed-v2' FROM label.labels lb WHERE lb.key = 'gece_hayati' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'club',         0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'gece_hayati' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'canlı müzik',  0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'canli_muzik' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'konser',       0.92, 'seed-v2' FROM label.labels lb WHERE lb.key = 'canli_muzik' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'dj',           0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'dj_seti' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'masa oyunu',   0.92, 'seed-v2' FROM label.labels lb WHERE lb.key = 'oyun_gecesi' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'kitap',        0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'kitap_kultur' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'maç',          0.90, 'seed-v2' FROM label.labels lb WHERE lb.key = 'spor_izleme' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'dans',         0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'dans' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'karaoke',      0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'karaoke' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'wifi',         0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'wifi' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'şarj',         0.88, 'seed-v2' FROM label.labels lb WHERE lb.key = 'priz' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'rezervasyon',  0.92, 'seed-v2' FROM label.labels lb WHERE lb.key = 'rezervasyon' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'otopark',      0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'otopark' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'engelli',      0.92, 'seed-v2' FROM label.labels lb WHERE lb.key = 'engelli_erisim' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'evcil',        0.92, 'seed-v2' FROM label.labels lb WHERE lb.key = 'evcil_hayvan' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'köpek',        0.85, 'seed-v2' FROM label.labels lb WHERE lb.key = 'evcil_hayvan' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'paket',        0.88, 'seed-v2' FROM label.labels lb WHERE lb.key = 'paket_servis' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, '7/24',         0.98, 'seed-v2' FROM label.labels lb WHERE lb.key = 'yedi_yirmidort' ON CONFLICT DO NOTHING;
INSERT INTO label.label_keywords (label_id, keyword, confidence, source)
SELECT lb.id, 'teras',        0.95, 'seed-v2' FROM label.labels lb WHERE lb.key = 'teras' ON CONFLICT DO NOTHING;

-- ── 6. Auto-assign labels to existing places by keyword matching ───────────────
INSERT INTO label.place_labels (place_id, label_id, weight)
SELECT DISTINCT pt.place_id, lk.label_id, 0.7
FROM   label.label_keywords lk
JOIN   label.labels lb ON lb.id = lk.label_id AND lb.is_active
JOIN   place.place_translations pt ON pt.name ILIKE ('%' || lk.keyword || '%')
WHERE  NOT EXISTS (
    SELECT 1 FROM label.place_labels pl2
    WHERE pl2.place_id = pt.place_id AND pl2.label_id = lk.label_id
)
ON CONFLICT (place_id, label_id) DO NOTHING;

-- ── 7. Validation ─────────────────────────────────────────────────────────────
SELECT lc.key AS category, COUNT(*) AS label_count
FROM label.labels lb
JOIN label.label_categories lc ON lc.id = lb.category_id
GROUP BY lc.key
ORDER BY lc.key;

COMMIT;
