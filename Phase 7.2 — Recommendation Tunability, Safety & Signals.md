# 🚀 Phase 7.2 — Recommendation Tunability, Safety & Signals

## 🎯 Amaç

* tüm kritik parametreleri **configurable** hale getirmek
* recommendation modelini **A/B test edilebilir** yapmak
* **trending etkisini dengelemek**
* **event tiplerini güvenli** hale getirmek
* **dwell-time** gibi güçlü sinyaller için altyapı kurmak

---

# 🧠 1. CONFIGURABLE PARAMETERS

## Yeni config (appsettings / options pattern)

```json id="cfg1"
"Recommendation": {
  "InterestDecayRate": 0.98,
  "InterestCap": 1000,
  "InterestLogScale": true,

  "Weights": {
    "Like": 2,
    "Comment": 3,
    "PostCreate": 4,
    "Unlike": -1
  },

  "ExploreBlend": {
    "Personalized": 0.5,
    "Trending": 0.3,
    "Discovery": 0.2
  },

  "Trending": {
    "Cap": 200,
    "LookbackHours": 24,
    "RefreshMinutes": 10
  },

  "Feed": {
    "FreshnessBoostHours": 3,
    "FreshnessBoostValue": 3,
    "DecayPerHour": 0.5
  }
}
```

---

## Kullanım

* Options pattern (`IOptions<RecommendationOptions>`)
* Tüm handler’lar **hardcoded değer yerine config** kullanır

---

# ⚖️ 2. TRENDING NORMALIZATION & CAP

## Problem

* trend_score aşırı büyüyebilir → feed’i domine eder

---

## Çözüm

```csharp id="trend_cap"
var trend = Math.Min(trendScore, options.Trending.Cap);
```

---

## Alternatif (opsiyonel)

```csharp id="trend_log"
trend = Math.Log(1 + trendScore);
```

---

# 🔐 3. EVENT TYPE SAFETY (ENUM)

## Problem

* string event type → typo riski

---

## Çözüm

```csharp id="event_enum"
public static class UserEventTypes
{
    public const string Like = "like";
    public const string Unlike = "unlike";
    public const string Comment = "comment";
    public const string PostCreate = "post_create";
    public const string Dwell = "dwell";
}
```

---

## Tüm servislerde:

* string literal yerine bu sabitler kullanılır

---

# 🧠 4. DWELL-TIME SIGNAL (FOUNDATION)

## Amaç

* kullanıcı postu ne kadar süre gördü → en güçlü sinyal

---

## API (content-service veya ayrı ingest endpoint)

POST /api/events/dwell

```json id="dwell_req"
{
  "postId": "...",
  "durationMs": 4200
}
```

---

## DB (raw event zaten var)

`content.user_events` kullanılır:

* event_type = "dwell"
* payload içine durationMs eklenebilir (opsiyonel JSONB alan)

---

## Aggregation (basit versiyon)

```sql id="dwell_agg"
-- son 24 saat dwell toplamı (ms)
SELECT post_id, SUM((payload->>'durationMs')::int) AS dwell_ms
FROM content.user_events
WHERE event_type = 'dwell'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY post_id;
```

---

## Kullanım (opsiyonel boost)

```text id="dwell_boost"
dwell_boost = log(1 + dwell_ms / 1000)
```

👉 Faz 7.2’de sadece altyapı kurulur, scoring’e eklemek opsiyonel

---

# 🧪 5. A/B TESTING HOOKS

## Amaç

* farklı parametreleri test etmek

---

## Basit yaklaşım

* kullanıcıyı variant’a ata (hash(userId) % 2)

```csharp id="ab_assign"
var variant = (userId.GetHashCode() & 1) == 0 ? "A" : "B";
```

---

## Variant config

* Variant A → default weights
* Variant B → farklı weights / blend

---

## Handler

* variant’a göre config override edilir

---

# 🔁 6. EXPLORE BLEND CONFIG

```csharp id="blend_cfg"
var p = options.ExploreBlend.Personalized;
var t = options.ExploreBlend.Trending;
var d = options.ExploreBlend.Discovery;
```

* slot hesapları bu oranlara göre yapılır
* toplam = 1 olmalı (validate)

---

# 📊 7. VALIDATION

* Explore oranları toplamı ≈ 1 olmalı
* negative weights kontrollü
* interest score ≥ 0
* trend cap uygulanmalı

---

# 📜 8. LOGGING & OBSERVABILITY

* hangi variant kullanıldı (A/B)
* hangi config değerleri kullanıldı (snapshot)
* cache hit/miss
* dwell event ingest sayısı

---

# ✅ ACCEPTANCE CRITERIA

* hardcoded değer kalmamalı (kritik yerlerde)
* event types sabit/enum ile yönetilmeli
* dwell event ingest çalışmalı
* explore oranları config’ten okunmalı
* trending cap uygulanmalı
* A/B variant akışı çalışmalı

---

# 🚀 RESULT

Bu fazdan sonra:

* sistem **tunable** olur
* hızlı **A/B test** yapılır
* recommendation daha **stabil ve dengeli** olur
* ileri sinyaller (dwell) için altyapı hazır olur

---

# 🔜 NEXT

Phase 8 — Mobile App
