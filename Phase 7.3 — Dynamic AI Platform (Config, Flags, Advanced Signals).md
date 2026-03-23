# 🚀 Phase 7.3 — Dynamic AI Platform (Config, Flags, Advanced Signals)

## 🎯 Amaç

Bu fazın amacı:

* sistemi runtime’da kontrol edilebilir hale getirmek
* feature flag sistemi kurmak
* recommendation engine’i daha esnek hale getirmek
* AI sistemini production-grade platforma dönüştürmek

---

# 🧠 1. DYNAMIC CONFIG (DB-BASED)

## Problem

* appsettings.json değiştir → deploy gerekir

---

## Çözüm

### Yeni tablo

```sql id="cfg_table"
CREATE TABLE admin.runtime_configs (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Örnek kayıt

```json id="cfg_example"
{
  "Recommendation:InterestDecayRate": 0.97,
  "Recommendation:Trending:Cap": 150
}
```

---

## Service

```csharp id="cfg_service"
IRuntimeConfigService
```

* cache ile birlikte çalışır
* fallback → appsettings

---

## Kullanım

```csharp id="cfg_use"
var decay = config.Get<double>("Recommendation:InterestDecayRate");
```

---

# 🚩 2. FEATURE FLAG SYSTEM

## Tablo

```sql id="ff_table"
CREATE TABLE admin.feature_flags (
    key TEXT PRIMARY KEY,
    is_enabled BOOLEAN,
    rollout_percentage INT,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Kullanım

```csharp id="ff_use"
if (featureFlagService.IsEnabled("new_feed_algorithm", userId))
{
    // new logic
}
```

---

## Rollout

* %10 user
* %50 user
* %100

---

# 🧠 3. DWELL NORMALIZATION

## Güncelle

```text id="dwell_norm"
normalized_dwell = log(1 + durationMs / 1000)
```

---

## Kullanım

```text id="dwell_score"
final_score += normalized_dwell
```

---

# 🧩 4. MULTI-LABEL DIVERSITY

## Problem

* dominant label bias

---

## Çözüm

* top N label yerine:
* weighted sampling

---

## Basit çözüm

```text id="multi_label"
score = Σ (label_score × weight)
```

---

## Diversity rule

* aynı label cluster max %50

---

# ⚡ 5. ADVANCED COLD START

## Problem

* yeni kullanıcı → boş interest

---

## Çözüm

### fallback:

* city-based popular
* trending
* random exploration

---

## Gelişmiş:

```text id="coldstart"
location + global trend + random
```

---

# 📊 6. CONFIG + FEATURE FLAG ENTEGRASYON

* config → numeric tuning
* feature flag → logic switch

---

# 🔍 7. LOGGING

* config change log
* feature flag usage log
* variant tracking

---

# 🧪 8. VALIDATION

* rollout % 0–100
* config null olmamalı
* fallback çalışmalı

---

# 🔐 9. SECURITY

* admin-only config update
* flag manipulation koruması

---

# ✅ ACCEPTANCE CRITERIA

* config runtime’da değiştirilebilmeli
* feature flag çalışmalı
* dwell scoring aktif olmalı
* cold start gelişmiş olmalı
* recommendation çeşitlenmeli

---

# 🚀 RESULT

Bu fazdan sonra:

* sistem tamamen kontrol edilebilir olur
* product team bağımsız çalışabilir
* AI sistemi evolve edebilir

---

# 🔜 NEXT

Phase 8 — Mobile App

---
