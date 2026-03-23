# 🚀 Phase 6.1 — Feed Optimization (Cursor, Ranking, Caching)

## 🎯 Amaç

Bu fazın amacı:

* offset pagination problemlerini çözmek
* feed performansını artırmak
* ranking’i daha akıllı hale getirmek
* mobil UX’i iyileştirmek

---

# 🧠 1. CURSOR-BASED PAGINATION

## Problem

OFFSET kullanımı:

* yavaş
* duplicate risk
* skip problemi

---

## Yeni yapı

Query param:

* cursorCreatedAt
* cursorScore
* cursorPostId

---

## SQL

```sql id="c1p9x2"
WHERE (
    (score < @cursorScore)
    OR (score = @cursorScore AND p.created_at < @cursorCreatedAt)
    OR (score = @cursorScore AND p.created_at = @cursorCreatedAt AND p.id < @cursorPostId)
)
```

---

## ORDER

```sql id="o4k2p9"
ORDER BY score DESC, p.created_at DESC, p.id DESC
LIMIT @pageSize
```

---

# 📊 2. RANKING IMPROVEMENT (RECENCY)

## Yeni score

```text id="r2c8f1"
score = (like_count * 2) + (comment_count * 3) + recency_bonus
```

---

## Recency bonus

```sql id="f6k1a0"
CASE
  WHEN p.created_at > NOW() - INTERVAL '6 hours' THEN 5
  WHEN p.created_at > NOW() - INTERVAL '24 hours' THEN 2
  ELSE 0
END
```

---

## Final SQL

```sql id="d7l2m1"
ORDER BY 
  (p.like_count * 2 + p.comment_count * 3 + recency_bonus) DESC,
  p.created_at DESC
```

---

# ⚡ 3. FEED CACHE

## Cache key

* following_feed_{userId}
* nearby_feed_{cityId}
* place_feed_{placeId}

---

## TTL

* following: 30 sec
* nearby: 30 sec
* place: 60 sec

---

## Amaç

* DB load azaltmak
* hızlı response

---

# 🧩 4. RESPONSE MODEL UPGRADE

## Yeni response

```json id="z8f3n1"
{
  "posts": [...],
  "nextCursor": {
    "score": 15,
    "createdAt": "2026-03-22T10:30:00Z",
    "postId": "..."
  },
  "hasMore": true
}
```

---

# 🔍 5. PROFILE ENRICHMENT

Feed’e ekle:

* displayName
* profileImageUrl

---

# 🏢 6. PLACE FALLBACK

* translation yoksa default language dön

---

# 📜 7. QUERY OPTIMIZATION

* projection zorunlu
* join sayısı minimize
* index usage doğrulanmalı

---

# 🧪 8. VALIDATION

* cursor param null olabilir
* invalid cursor handle edilmeli

---

# 🔐 9. SECURITY

* userId sadece JWT’den alınmalı
* cursor manipulation kontrol edilmeli

---

# ✅ ACCEPTANCE CRITERIA

* infinite scroll düzgün çalışmalı
* duplicate post olmamalı
* ranking doğru olmalı
* response hızlı olmalı
* cache çalışmalı

---

# 🚀 RESULT

Bu fazdan sonra:

* feed stabil hale gelir
* UX ciddi iyileşir
* performans artar

---

# 🔜 NEXT

Phase 7 — AI & Recommendation

---
