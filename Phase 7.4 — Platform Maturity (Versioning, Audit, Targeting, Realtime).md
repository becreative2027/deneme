# 🚀 Phase 7.4 — Platform Maturity (Versioning, Audit, Targeting, Realtime)

## 🎯 Amaç

* runtime config değişikliklerini **version’lamak**
* değişiklikleri **audit edilebilir** hale getirmek
* feature flag’leri **hedeflenebilir** yapmak
* config değişikliklerini **anında yaymak**
* recommendation kararlarını **debuggable** yapmak

---

# 🧠 1. CONFIG VERSIONING

## Yeni tablo

```sql id="cfg_version"
CREATE TABLE admin.runtime_config_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    version INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT,
    change_reason TEXT
);
```

---

## Mantık

* her update → yeni version insert edilir
* current config → runtime_configs tablosunda kalır

---

## Rollback

```sql id="cfg_rollback"
UPDATE admin.runtime_configs
SET value = v.value
FROM admin.runtime_config_versions v
WHERE v.key = runtime_configs.key
  AND v.version = @targetVersion;
```

---

# 📜 2. CONFIG AUDIT LOG

## Tablo

```sql id="cfg_audit"
CREATE TABLE admin.config_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT,
    old_value JSONB,
    new_value JSONB,
    changed_by TEXT,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Amaç

* kim neyi değiştirdi?
* ne zaman?
* neden?

---

# 🚩 3. FEATURE FLAG TARGETING

## Tablo güncelle

```sql id="ff_target"
ALTER TABLE admin.feature_flags
ADD COLUMN IF NOT EXISTS target JSONB;
```

---

## Örnek

```json id="ff_example"
{
  "countries": ["TR"],
  "userIds": ["uuid1"],
  "platform": ["ios"]
}
```

---

## Service logic

```csharp id="ff_logic"
if (target != null)
{
    // check targeting rules first
}
else
{
    // fallback to percentage rollout
}
```

---

# ⚡ 4. REAL-TIME CONFIG (PUB/SUB)

## Problem

* 5 dk cache → gecikme

---

## Çözüm

### Redis pub/sub

Channel:

```text id="redis_channel"
config_updates
```

---

## Publish

* config update → message gönder

---

## Subscribe

* feed-service / content-service:

  * cache invalidate
  * yeni config yükle

---

# 🧠 5. MODEL SNAPSHOT LOGGING

## Amaç

* recommendation neden böyle çıktı?

---

## Response’a ekle (internal / debug)

```json id="snapshot"
{
  "variant": "A",
  "configSnapshot": {
    "decayRate": 0.97,
    "trendCap": 150,
    "blend": "50/30/20"
  }
}
```

---

## Logging

* requestId
* userId
* variant
* config snapshot

---

# 🔍 6. ADMIN API EXTENSIONS

## Yeni endpointler

* GET /api/admin/config/versions/{key}
* POST /api/admin/config/rollback/{key}
* GET /api/admin/config/audit

---

# 🔐 7. SECURITY

* sadece Admin/SuperAdmin erişebilir
* audit zorunlu (change_reason boş olamaz)

---

# 🧪 8. VALIDATION

* version increment doğru olmalı
* rollback düzgün çalışmalı
* target JSON valid olmalı

---

# 📊 9. OBSERVABILITY

* config change log
* feature flag usage log
* rollback log

---

# ✅ ACCEPTANCE CRITERIA

* config versionlanmalı
* rollback çalışmalı
* audit log tutulmalı
* feature flag targeting çalışmalı
* realtime config propagate edilmeli

---

# 🚀 RESULT

Bu fazdan sonra:

* sistem tamamen kontrol edilebilir olur
* riskli değişiklikler geri alınabilir
* debugging kolaylaşır
* product ekipleri bağımsız çalışır

---

# 🔜 NEXT

Phase 8 — Mobile App
