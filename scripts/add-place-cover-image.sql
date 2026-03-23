-- ── Phase 8.7 — Add cover_image_url to place.places ─────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'place'
      AND table_name   = 'places'
      AND column_name  = 'cover_image_url'
  ) THEN
    ALTER TABLE place.places ADD COLUMN cover_image_url TEXT;
    RAISE NOTICE 'Column cover_image_url added to place.places';
  ELSE
    RAISE NOTICE 'Column cover_image_url already exists, skipping';
  END IF;
END $$;

-- ── Seed cover images (Unsplash) ──────────────────────────────────────────────
-- UPDATE ... FROM pattern avoids "more than one row" scalar subquery issue.

-- Beyoğlu
UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = '360-istanbul';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'finn-karakoy';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'galata-frida-house';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'karakoy-lokantasi';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'mikla';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'mums-cafe';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'viyana-kahvesi-galata';

-- Beşiktaş
UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'bebek-kahve';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'efendi-topagaci';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1490645979285-0de545f4c2d0?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'lucca';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'mangerie';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'house-cafe-ortakoy';

-- Eminönü
UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'pandeli-restaurant';

-- Kadıköy
UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'basta-street-food-bar';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'kahvalti-naga-putrika';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'kemal-usta-waffles';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1442975631115-c4f7b05b8a2c?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'kronotrop-caddebostan-grove';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'montag-coffee-kadikoy';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'tarihi-kadikoy-borekci';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'the-townhouse';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'walters-coffee-roastery';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'zapata-burger';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'arkaoda';

UPDATE place.places SET cover_image_url = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
FROM place.place_translations pt WHERE pt.place_id = place.places.id AND pt.slug = 'ciya-sofrasi';
