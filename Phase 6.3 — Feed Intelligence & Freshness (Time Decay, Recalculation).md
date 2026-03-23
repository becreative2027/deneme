# 🚀 Phase 6.3 — Feed Intelligence & Freshness (Time Decay, Recalculation)

## 🎯 Amaç

Bu fazın amacı:

* feed’in stale olmasını engellemek
* eski viral postların sürekli üstte kalmasını önlemek
* feed’i “canlı” ve dengeli tutmak
* AI fazına zemin hazırlamak

---

# 🧠 1. TIME DECAY SCORING

## Problem

Şu an:

```text id="2c3nfd"
feed_score = like*2 + comment*3
```

👉 eski postlar yukarıda kalabilir

---

## Çözüm

Yeni model:

```text id="m8c1ka"
feed_score = base_score - time_decay
```

---

## Base score

```text id="x9o2k1"
base_score = (like_count * 2) + (comment_count * 3)
```

---

## Time decay

```text id="l4m7w2"
time_decay = hours_since_post * 0.5
```

---

## Final:

```text id="k8f2r3"
feed_score = base_score - (hours_since_post * 0.5)
```

---

# ⚙️ 2. COMPUTE METHOD UPDATE

## Güncelle:

```csharp id="9s7jz4"
public static int ComputeFeedScore(int likeCount, int commentCount, DateTime createdAt)
{
    var baseScore = (likeCount * 2) + (commentCount * 3);
    var hours = (DateTime.UtcNow - createdAt).TotalHours;
    var decay = hours * 0.5;

    return (int)Math.Max(0, baseScore - decay);
}
```

---

# 🔁 3. BACKGROUND RECALCULATION JOB

## Problem

* time geçince score stale olur

---

## Çözüm

Yeni background job:

### Schedule:

* her 5 dakika

---

## Scope:

* son 48 saat içindeki postlar

---

## SQL:

```sql id="g4l9fa"
UPDATE content.posts
SET feed_score = (like_count * 2 + comment_count * 3) 
                 - EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 * 0.5
WHERE created_at > NOW() - INTERVAL '48 hours';
```

---

## Amaç

* feed sürekli güncel kalır

---

# ⚡ 4. INDEX UPDATE

```sql id="j2f8d1"
DROP INDEX IF EXISTS idx_posts_feed_score;

CREATE INDEX idx_posts_feed_score
ON content.posts(feed_score DESC, created_at DESC, id DESC)
WHERE is_deleted = false AND status != 'hidden';
```

---

# 🧩 5. WRITE-SIDE ADJUSTMENT

## Like / Comment sonrası:

* sadece base_score hesapla
* decay background job’a bırak

---

# 🧠 6. FRESHNESS BOOST (OPTIONAL)

Yeni postlar için:

```text id="p9l3h1"
if (hours < 3) +3 bonus
```

---

# 📜 7. LOGGING

* job execution time
* updated row count
* error log

---

# 🔍 8. SAFETY

* negative score olmamalı
* max cap koyulabilir (opsiyonel)

---

# 🧪 9. VALIDATION

* score her zaman >= 0
* job düzgün çalışmalı

---

# ✅ ACCEPTANCE CRITERIA

* eski postlar aşağı düşmeli
* yeni postlar görünür olmalı
* feed dengeli olmalı
* query performansı korunmalı

---

# 🚀 RESULT

Bu fazdan sonra:

* feed dinamik hale gelir
* stale content problemi çözülür
* kullanıcı engagement artar

---

# 🔜 NEXT

Phase 7 — AI & Recommendation

---
