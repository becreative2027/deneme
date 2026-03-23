# 🚀 Phase 7.1 — Recommendation System Hardening (Decay, Diversity, Behavior)

## 🎯 Amaç

Bu fazın amacı:

* kullanıcı ilgisini zaman içinde güncellemek
* negatif sinyalleri sisteme dahil etmek
* öneri çeşitliliğini artırmak
* sistemi daha gerçekçi ve dengeli hale getirmek

---

# 🧠 1. INTEREST DECAY

## Problem

* kullanıcı ilgisi sürekli artıyor
* eski davranışlar sistemde kalıyor

---

## Çözüm

### Background job (daily)

```sql id="d1k8s3"
UPDATE content.user_interests
SET score = score * 0.98,
    updated_at = NOW()
WHERE score > 0;
```

---

## Amaç

* eski ilgi alanları yavaşça silinir
* sistem adaptif olur

---

# ⚠️ 2. NEGATIVE FEEDBACK

## Yeni sinyaller:

* unlike → -1
* report/hide → -3

---

## Update logic

```text id="k2l7f1"
user_interest_score += positive_weight
user_interest_score -= negative_weight
```

---

## Constraint

* score < 0 olamaz

```sql id="f4m2p9"
score = GREATEST(0, score)
```

---

# 🧩 3. RECOMMENDATION DIVERSITY

## Problem

* aynı tip içerik tekrar eder

---

## Çözüm

### SQL (label çeşitliliği):

```sql id="a9k3f2"
ROW_NUMBER() OVER (PARTITION BY label_id ORDER BY score DESC)
```

---

## Kural

* aynı label’dan max 3 öneri

---

## Feed tarafında:

* aynı user’dan max 2 post (zaten var)
* aynı place tekrarını sınırlayabilirsin (opsiyonel)

---

# ⚖️ 4. EXPLORE BALANCING

## Yeni yaklaşım:

Explore feed =

```text id="m1n2k3"
50% personalized
30% trending
20% discovery (random / low-score content)
```

---

## Implementation

* 3 query çalıştır
* sonuçları merge et

---

# 🧠 5. INTEREST NORMALIZATION

## Problem

* bazı label’lar çok şişebilir

---

## Çözüm

### Option 1 (simple cap):

```text id="o2p3l4"
score = MIN(score, 1000)
```

---

### Option 2 (log scale):

```text id="q5r6s7"
normalized = log(1 + score)
```

---

# 📊 6. USER EVENTS TABLE

## Yeni tablo:

```sql id="z8x9y0"
CREATE TABLE content.user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    event_type TEXT,
    post_id UUID,
    place_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Event types:

* like
* unlike
* comment
* post_create

---

## Amaç

* gelecekte ML modeli için veri
* debugging
* analytics

---

# ⚡ 7. SCORING UPDATE

## Yeni final_score:

```text id="w1e2r3"
final_score = feed_score
            + (normalized_user_interest * 2)
            + trend_score
```

---

# 🔁 8. CACHE UPDATE

* personalized feed cache invalidate
* explore feed cache invalidate

---

# 🧪 9. VALIDATION

* score negative olmamalı
* event logging doğru çalışmalı
* decay job çalışmalı

---

# 🔐 10. SECURITY

* event spoofing engellenmeli
* userId sadece JWT’den alınmalı

---

# ✅ ACCEPTANCE CRITERIA

* interest zamanla azalmalı
* negatif sinyaller çalışmalı
* explore feed dengeli olmalı
* öneriler çeşitlenmeli

---

# 🚀 RESULT

Bu fazdan sonra:

* sistem kullanıcıyı daha iyi anlar
* öneriler daha doğal olur
* feed monoton olmaz

---

# 🔜 NEXT

Phase 8 — Mobile App

---
