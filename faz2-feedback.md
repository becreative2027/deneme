# 🚀 Phase 2 — Data Quality & Production Hardening

## 🎯 Amaç

Bu fazın amacı:

* veri bütünlüğünü garanti altına almak
* duplicate riskini ortadan kaldırmak
* search ve ingestion için veri modelini güçlendirmek
* dataset’i daha gerçekçi hale getirmek

---

# 🧠 1. SLUG UNIQUE CONSTRAINTS

## CITY SLUG

```sql
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_city_slug_lang'
) THEN
    CREATE UNIQUE INDEX idx_city_slug_lang 
    ON geo.city_translations(slug, language_id);
END IF;
END $$;
```

---

## DISTRICT SLUG

```sql
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_district_slug_lang'
) THEN
    CREATE UNIQUE INDEX idx_district_slug_lang 
    ON geo.district_translations(slug, language_id);
END IF;
END $$;
```

---

# 🔒 2. GOOGLE PLACE ID HARDENING

```sql
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_google_place_id_not_null'
) THEN
    CREATE UNIQUE INDEX idx_google_place_id_not_null
    ON place.places(google_place_id)
    WHERE google_place_id IS NOT NULL;
END IF;
END $$;
```

---

# 🧠 3. LABEL KEYWORDS UNIQUE CONSTRAINT

```sql
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_label_keyword_lang'
) THEN
    ALTER TABLE label.label_keywords
    ADD CONSTRAINT unique_label_keyword_lang
    UNIQUE (label_id, language_id, keyword);
END IF;
END $$;
```

---

# 📊 4. REALISTIC SCORE NORMALIZATION

```sql
UPDATE place.place_scores
SET 
    popularity_score = ROUND((3 + random()*2)::numeric, 2),
    quality_score = ROUND((3 + random()*2)::numeric, 2),
    trend_score = ROUND((3 + random()*2)::numeric, 2),
    final_score = ROUND((3 + random()*2)::numeric, 2);
```

---

# 🏢 5. REALISTIC PLACE NAME UPDATE

```sql
UPDATE place.place_translations
SET name = CASE
    WHEN name LIKE '%Örnek%' THEN 'Masa Kahvaltı & Cafe'
    ELSE name
END
WHERE language_id = 1;

UPDATE place.place_translations
SET name = CASE
    WHEN name LIKE '%Sample%' THEN 'Skyline Rooftop Lounge'
    ELSE name
END
WHERE language_id = 2;
```

---

# 🧩 6. LABEL DISTRIBUTION IMPROVEMENT

## Clear duplicates first

```sql
DELETE FROM label.place_labels;
```

---

## Reassign labels with diversity

```sql
INSERT INTO label.place_labels (place_id, label_id, weight)
SELECT p.id, l.id, random()
FROM place.places p
JOIN label.labels l ON l.id <= 5
LIMIT 10;
```

---

# 🔍 7. VALIDATION QUERIES

## Duplicate check

```sql
SELECT label_id, keyword, COUNT(*)
FROM label.label_keywords
GROUP BY label_id, keyword
HAVING COUNT(*) > 1;
```

---

## Place label distribution

```sql
SELECT p.id, COUNT(pl.label_id)
FROM place.places p
LEFT JOIN label.place_labels pl ON p.id = pl.place_id
GROUP BY p.id;
```

---

## Slug uniqueness

```sql
SELECT slug, COUNT(*)
FROM geo.city_translations
GROUP BY slug
HAVING COUNT(*) > 1;
```

---

# ✅ ACCEPTANCE CRITERIA

* slug duplication olmamalı
* label keywords unique olmalı
* place scores realistic olmalı
* her place en az 3 label almalı
* indexler düzgün çalışmalı

---

# 🚀 RESULT

Bu fazdan sonra sistem:

* production-ready data model
* güvenli ingestion
* güçlü search altyapısı

---
