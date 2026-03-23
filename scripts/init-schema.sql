-- =============================================
-- SpotFinder Phase 1 — Complete Schema Init
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- SCHEMA CREATION
-- =============================================
CREATE SCHEMA IF NOT EXISTS geo;
CREATE SCHEMA IF NOT EXISTS place;
CREATE SCHEMA IF NOT EXISTS label;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS admin;
CREATE SCHEMA IF NOT EXISTS search;

-- =============================================
-- GEO SERVICE TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS geo.languages (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geo.countries (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geo.country_translations (
    id SERIAL PRIMARY KEY,
    country_id INT REFERENCES geo.countries(id) ON DELETE CASCADE,
    language_id INT REFERENCES geo.languages(id),
    name TEXT NOT NULL,
    slug TEXT,
    UNIQUE(country_id, language_id)
);

CREATE TABLE IF NOT EXISTS geo.cities (
    id SERIAL PRIMARY KEY,
    country_id INT REFERENCES geo.countries(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geo.city_translations (
    id SERIAL PRIMARY KEY,
    city_id INT REFERENCES geo.cities(id) ON DELETE CASCADE,
    language_id INT REFERENCES geo.languages(id),
    name TEXT NOT NULL,
    slug TEXT,
    UNIQUE(city_id, language_id)
);

CREATE TABLE IF NOT EXISTS geo.districts (
    id SERIAL PRIMARY KEY,
    city_id INT REFERENCES geo.cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geo.district_translations (
    id SERIAL PRIMARY KEY,
    district_id INT REFERENCES geo.districts(id) ON DELETE CASCADE,
    language_id INT REFERENCES geo.languages(id),
    name TEXT NOT NULL,
    slug TEXT,
    UNIQUE(district_id, language_id)
);

-- =============================================
-- PLACE SERVICE TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS place.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_place_id TEXT UNIQUE,
    country_id INT,
    city_id INT,
    district_id INT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rating NUMERIC(2,1),
    user_ratings_total INT,
    parking_status TEXT DEFAULT 'unavailable'
        CHECK (parking_status IN ('available', 'unavailable', 'limited')),
    source TEXT,
    source_last_synced_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS place.place_translations (
    id SERIAL PRIMARY KEY,
    place_id UUID REFERENCES place.places(id) ON DELETE CASCADE,
    language_id INT REFERENCES geo.languages(id),
    name TEXT NOT NULL,
    slug TEXT,
    UNIQUE(place_id, language_id)
);

CREATE TABLE IF NOT EXISTS place.place_scores (
    place_id UUID PRIMARY KEY REFERENCES place.places(id) ON DELETE CASCADE,
    popularity_score NUMERIC(5,2),
    quality_score NUMERIC(5,2),
    trend_score NUMERIC(5,2),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- LABEL SERVICE TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS label.label_categories (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS label.label_category_translations (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES label.label_categories(id) ON DELETE CASCADE,
    language_id INT REFERENCES geo.languages(id),
    display_name TEXT NOT NULL,
    UNIQUE(category_id, language_id)
);

CREATE TABLE IF NOT EXISTS label.labels (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES label.label_categories(id),
    key TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS label.label_translations (
    id SERIAL PRIMARY KEY,
    label_id INT REFERENCES label.labels(id) ON DELETE CASCADE,
    language_id INT REFERENCES geo.languages(id),
    display_name TEXT NOT NULL,
    UNIQUE(label_id, language_id)
);

CREATE TABLE IF NOT EXISTS label.place_labels (
    place_id UUID REFERENCES place.places(id) ON DELETE CASCADE,
    label_id INT REFERENCES label.labels(id) ON DELETE CASCADE,
    weight NUMERIC(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (place_id, label_id)
);

CREATE TABLE IF NOT EXISTS label.label_keywords (
    id SERIAL PRIMARY KEY,
    label_id INT REFERENCES label.labels(id) ON DELETE CASCADE,
    language_id INT REFERENCES geo.languages(id),
    keyword TEXT NOT NULL
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_places_geo ON place.places(country_id, city_id, district_id);
CREATE INDEX IF NOT EXISTS idx_places_google ON place.places(google_place_id);
CREATE INDEX IF NOT EXISTS idx_place_labels_label ON label.place_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_place_labels_place ON label.place_labels(place_id);
CREATE INDEX IF NOT EXISTS idx_label_translations_lang ON label.label_translations(language_id);
CREATE INDEX IF NOT EXISTS idx_place_translations_lang ON place.place_translations(language_id);

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO geo.languages (code, name)
VALUES ('tr', 'Türkçe'), ('en', 'English')
ON CONFLICT (code) DO NOTHING;
