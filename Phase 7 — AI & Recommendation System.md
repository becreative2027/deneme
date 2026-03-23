# 🚀 Phase 7 — AI & Recommendation System

## 🎯 Amaç

* kullanıcı davranışlarını analiz etmek
* kişiselleştirilmiş içerik sunmak
* mekan önerileri yapmak
* trending içerikleri tespit etmek

---

# 🧠 1. USER INTEREST MODEL

## Yeni tablo

```sql id="u7k2ds"
CREATE TABLE content.user_interests (
    user_id UUID,
    label_id INT,
    score NUMERIC,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, label_id)
);
```

---

## Mantık

Kullanıcı:

* like yaparsa → +2
* comment yaparsa → +3
* post atarsa → +4

---

## Update

```text id="i9d1f2"
user_interest_score += interaction_weight
```

---

# 📊 2. LABEL EXTRACTION

Post → place → label mapping kullanılır

---

## Query

```sql id="l3k9d2"
SELECT label_id
FROM label.place_labels
WHERE place_id = @placeId;
```

---

# ⚡ 3. PERSONALIZED FEED

## Yeni endpoint

GET /api/feed/personalized

---

## Query logic

```sql id="p2m8f4"
SELECT p.*, ui.score as interest_score
FROM content.posts p
JOIN label.place_labels pl ON p.place_id = pl.place_id
JOIN content.user_interests ui ON ui.label_id = pl.label_id
WHERE ui.user_id = @userId
ORDER BY (p.feed_score + ui.score) DESC
LIMIT @pageSize;
```

---

# 🧩 4. PLACE RECOMMENDATION

## Endpoint

GET /api/places/recommendations

---

## Logic

```sql id="d7k2s1"
SELECT pl.id, SUM(ui.score) as total_score
FROM place.places pl
JOIN label.place_labels l ON pl.id = l.place_id
JOIN content.user_interests ui ON ui.label_id = l.label_id
WHERE ui.user_id = @userId
GROUP BY pl.id
ORDER BY total_score DESC
LIMIT 10;
```

---

# 🔥 5. TRENDING SYSTEM

## Yeni tablo

```sql id="t8m3k2"
CREATE TABLE content.trending_scores (
    place_id UUID,
    score NUMERIC,
    updated_at TIMESTAMP,
    PRIMARY KEY (place_id)
);
```

---

## Score

```text id="o2l9p8"
trend_score = recent_posts + likes + comments
```

---

## Background job

* her 10 dakika çalışır
* son 24 saat analiz edilir

---

# 📡 6. EXPLORE FEED

## Endpoint

GET /api/feed/explore

---

## Combine:

* trending
* personalized
* fallback

---

# 🧠 7. SCORING MODEL

Final score:

```text id="s3k9d1"
final_score = feed_score 
            + (user_interest * 2)
            + trend_score
```

---

# 🔁 8. CACHE

* personalized_feed_{userId}
* place_recommendation_{userId}

TTL: 30–60 sec

---

# 🔍 9. INDEXES

```sql id="z4k2s8"
CREATE INDEX idx_user_interests_user ON content.user_interests(user_id);
CREATE INDEX idx_user_interests_label ON content.user_interests(label_id);
```

---

# 🧪 10. VALIDATION

* interest score overflow engellenmeli
* null interest handle edilmeli

---

# 🔐 11. SECURITY

* userId JWT’den alınmalı
* manipülasyon engellenmeli

---

# ✅ ACCEPTANCE CRITERIA

* personalized feed çalışmalı
* place recommendation doğru çalışmalı
* trending doğru hesaplanmalı
* explore feed çalışmalı

---

# 🚀 RESULT

Bu fazdan sonra:

* sistem kullanıcıyı “tanır”
* içerik önerir
* engagement ciddi artar

---

# 🔜 NEXT

Phase 8 — Mobile App

---
