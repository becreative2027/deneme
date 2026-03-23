-- =============================================
-- Migration: Add FK constraints from place.places → geo schema
-- Idempotent: safe to run multiple times
-- =============================================

DO $$
BEGIN

    -- fk_place_country: place.places.country_id → geo.countries.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'place'
          AND table_name        = 'places'
          AND constraint_name   = 'fk_place_country'
    ) THEN
        ALTER TABLE place.places
            ADD CONSTRAINT fk_place_country
            FOREIGN KEY (country_id) REFERENCES geo.countries(id);
        RAISE NOTICE 'Created constraint fk_place_country';
    ELSE
        RAISE NOTICE 'Constraint fk_place_country already exists — skipping';
    END IF;

    -- fk_place_city: place.places.city_id → geo.cities.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'place'
          AND table_name        = 'places'
          AND constraint_name   = 'fk_place_city'
    ) THEN
        ALTER TABLE place.places
            ADD CONSTRAINT fk_place_city
            FOREIGN KEY (city_id) REFERENCES geo.cities(id);
        RAISE NOTICE 'Created constraint fk_place_city';
    ELSE
        RAISE NOTICE 'Constraint fk_place_city already exists — skipping';
    END IF;

    -- fk_place_district: place.places.district_id → geo.districts.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'place'
          AND table_name        = 'places'
          AND constraint_name   = 'fk_place_district'
    ) THEN
        ALTER TABLE place.places
            ADD CONSTRAINT fk_place_district
            FOREIGN KEY (district_id) REFERENCES geo.districts(id);
        RAISE NOTICE 'Created constraint fk_place_district';
    ELSE
        RAISE NOTICE 'Constraint fk_place_district already exists — skipping';
    END IF;

END $$;

-- =============================================
-- Validation: show all constraints on place.places
-- =============================================

SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_schema  AS ref_schema,
    ccu.table_name    AS ref_table,
    ccu.column_name   AS ref_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.constraint_schema = kcu.constraint_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON tc.constraint_name = ccu.constraint_name
   AND tc.constraint_schema = ccu.constraint_schema
WHERE tc.constraint_schema = 'place'
  AND tc.table_name = 'places'
ORDER BY tc.constraint_type, tc.constraint_name;
