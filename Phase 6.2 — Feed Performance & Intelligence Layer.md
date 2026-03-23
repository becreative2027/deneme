# 🚀 Phase 6.2 — Feed Performance & Intelligence Layer

## 🎯 Amaç

Bu fazın amacı:

* feed performansını ciddi şekilde artırmak
* query maliyetini düşürmek
* UX kalitesini yükseltmek
* AI fazı için temel hazırlamak

---

# 🧠 1. FEED SCORE MATERIALIZATION

## Problem

Şu an:

```text
score = like*2 + comment*3 + recency
```

Her query’de hesaplanıyor → pahalı

---

## Çözüm

### Yeni kolon:

```sql
ALTER TABLE content.posts
ADD COLUMN IF NOT EXISTS feed_score NUMERIC;
```

---

## Write-side güncelleme

* Like
* Unlike
* Comment
* Post create

sonrasında:

```csharp
post.FeedScore = (post.LikeCount * 2)
               + (post.CommentCount * 3)
               + recencyBonus;
```

---

## Query update

```sql
ORDER BY p.feed_score DESC, p.created_at DESC, p.id DESC
```

---

## Index

```sql
CREATE INDEX idx_posts_feed_score
ON content.posts(feed_score DESC, created_at DESC)
WHERE is_deleted = false AND status != 'hidden';
```

---

# ⚡ 2. QUERY SIMPLIFICATION

* recency hesaplamasını query’den kaldır
* sadece feed_score kullan

---

# 🧩 3. FEED DIVERSITY (ANTI-SPAM)

## Problem

* aynı kullanıcıdan çok post gelebilir

---

## Çözüm

Window function:

```sql
SELECT *
FROM (
  SELECT p.*, ROW_NUMBER() OVER (PARTITION BY p.user_id ORDER BY p.feed_score DESC) as rn
  FROM content.posts p
) t
WHERE t.rn <= 2
```

---

# 🧠 4. COLD START STRATEGY

## Problem

* yeni kullanıcı → boş feed

---

## Çözüm

Fallback:

```sql
SELECT p.*
FROM content.posts p
ORDER BY p.feed_score DESC
LIMIT @pageSize;
```

---

## Handler logic

* following boşsa → fallback feed

---

# ⚡ 5. CACHE INVALIDATION IMPROVEMENT

## Trigger noktaları:

* CreatePost
* Like
* Unlike
* Comment

---

## Cache temizle:

* following_feed_{userId}
* nearby_feed_{cityId}
* place_feed_{placeId}

---

# 🧠 6. FEED CACHE STRATEGY UPGRADE

## TTL

* following: 30s
* nearby: 30s
* place: 60s

---

## Ekstra

* sadece first page cache’lenir

---

# 🔍 7. INDEX CHECK

Ensure:

* idx_posts_feed_score
* idx_posts_place_created
* idx_user_follows_follower

kullanılıyor

---

# 🧪 8. VALIDATION

* feed_score null olmamalı
* negative score olmamalı

---

# 📜 9. LOGGING

* feed cache hit/miss log
* query duration log

---

# ✅ ACCEPTANCE CRITERIA

* query CPU cost düşmeli
* response time azalmalı
* feed çeşitliliği artmalı
* cold start çözülmeli
* cache doğru çalışmalı

---

# 🚀 RESULT

Bu fazdan sonra:

* feed ultra hızlı olur
* UX ciddi iyileşir
* AI için sağlam temel oluşur

---

# 🔜 NEXT

Phase 7 — AI & Recommendation

---
