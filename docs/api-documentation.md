# SpotFinder API Dokümantasyonu

> **Mimari:** 9 bağımsız microservice · ASP.NET Core 10 · CQRS + MediatR · PostgreSQL (Neon Cloud) · JWT Bearer Auth
> **Ortak davranış:** Tüm `[Authorize]` endpoint'ler `Authorization: Bearer <token>` header'ı bekler. UserId her zaman JWT claim'inden alınır, body'den kabul edilmez.

---

## İçindekiler

1. [Identity Service — Port 5001](#1-identity-service--port-5001)
2. [Geo Service — Port 5002](#2-geo-service--port-5002)
3. [Place Service — Port 5003](#3-place-service--port-5003)
4. [Label Service — Port 5004](#4-label-service--port-5004)
5. [Search Service — Port 5005](#5-search-service--port-5005)
6. [Admin Service — Port 5006](#6-admin-service--port-5006)
7. [Social Graph Service — Port 5007](#7-social-graph-service--port-5007)
8. [Content Service — Port 5008](#8-content-service--port-5008)
9. [Feed Service — Port 5009](#9-feed-service--port-5009)
10. [Veritabanı Şema Özeti](#10-veritabanı-şema-özeti)
11. [Mimari Desenler](#11-mimari-desenler)

---

## 1. Identity Service — Port 5001

**Amaç:** Kullanıcı kaydı, JWT kimlik doğrulama ve profil yönetimi.

---

### `POST /api/auth/register`

**Açıklama:** Yeni kullanıcı kaydı oluşturur. Email ve username benzersizliği kontrol edilir, şifre hash'lenerek saklanır.

**Yetki:** Yok (public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| email | string | ✓ | Benzersiz e-posta adresi |
| username | string | ✓ | Benzersiz kullanıcı adı |
| password | string | ✓ | Ham şifre (sunucuda hash'lenir) |

**Response — 201 Created:**
```json
{
  "isSuccess": true,
  "data": {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

**Hata Durumları:**
- `400` — Email veya username zaten kullanımda

**Beslenen Tablolar:**
- `identity.users` — Kullanıcı kaydı yazılır

---

### `POST /api/auth/login`

**Açıklama:** E-posta ve şifre ile giriş yapar. Başarılı girişte kısa ömürlü access token ve uzun ömürlü refresh token döner.

**Yetki:** Yok (public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "d4f8a...",
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
}
```

**Hata Durumları:**
- `400` — Kullanıcı bulunamadı veya şifre hatalı
- `400` — Hesap aktif değil

**Beslenen Tablolar:**
- `identity.users` — Email ile kullanıcı sorgulanır, şifre doğrulanır
- `identity.refresh_tokens` — Yeni refresh token (30 gün TTL) yazılır

---

### `PUT /api/users/profile`

**Açıklama:** Giriş yapmış kullanıcının profil bilgilerini günceller. UserId JWT'den alınır; body'de belirtilmesi gerekmez.

**Yetki:** `[Authorize]`

**Request Body:**
```json
{
  "displayName": "John Doe",
  "bio": "Mekan kaşifi 🗺️",
  "profileImageUrl": "https://cdn.example.com/avatar.jpg"
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| displayName | string? | — | Görünen ad |
| bio | string? | — | Kısa biyografi |
| profileImageUrl | string? | — | Profil fotoğrafı URL'i |

**Response — 204 No Content**

**Beslenen Tablolar:**
- `identity.user_profiles` — `upsert` ile DisplayName, Bio, ProfileImageUrl güncellenir

---

## 2. Geo Service — Port 5002

**Amaç:** Ülke, şehir ve ilçe listelerini çok dilli olarak sunar. Yalnızca okuma (read-only) operasyonları içerir.

---

### `GET /api/countries`

**Açıklama:** Sistemde kayıtlı tüm ülkeleri istenen dilde döner.

**Yetki:** `[Authorize]`

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| langId | int | 1 | Dil ID'si (1=TR, 2=EN, ...) |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": [
    { "id": 1, "code": "TR", "name": "Türkiye", "slug": "turkiye" },
    { "id": 2, "code": "US", "name": "Amerika Birleşik Devletleri", "slug": "abd" }
  ]
}
```

**Beslenen Tablolar:**
- `geo.countries` — Tüm ülkeler
- `geo.country_translations` — Dile göre çeviri (JOIN); çeviri yoksa `code` fallback

---

### `GET /api/cities/by-country/{countryId}`

**Açıklama:** Belirtilen ülkeye ait şehirleri döner.

**Yetki:** `[Authorize]`

**Route:** `countryId` (int)

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| langId | int | 1 | Dil ID'si |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": [
    { "id": 34, "countryId": 1, "name": "İstanbul", "slug": "istanbul" },
    { "id": 6,  "countryId": 1, "name": "Ankara",   "slug": "ankara"   }
  ]
}
```

**Beslenen Tablolar:**
- `geo.cities` — `WHERE country_id = @countryId`
- `geo.city_translations` — Dile göre lokalize isim

---

### `GET /api/districts/by-city/{cityId}`

**Açıklama:** Belirtilen şehre ait ilçeleri döner.

**Yetki:** `[Authorize]`

**Route:** `cityId` (int)

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| langId | int | 1 | Dil ID'si |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": [
    { "id": 101, "cityId": 34, "name": "Kadıköy",  "slug": "kadikoy"  },
    { "id": 102, "cityId": 34, "name": "Beşiktaş", "slug": "besiktas" }
  ]
}
```

**Beslenen Tablolar:**
- `geo.districts` — `WHERE city_id = @cityId`
- `geo.district_translations` — Lokalize isim

---

## 3. Place Service — Port 5003

**Amaç:** Mekan oluşturma, detay sorgulama, filtreleme ve arama.

---

### `POST /api/places`

**Açıklama:** Yeni bir mekan oluşturur. Mekan adı ve çevirileri zorunludur.

**Yetki:** `[Authorize]`

**Request Body:**
```json
{
  "countryId": 1,
  "cityId": 34,
  "districtId": 101,
  "latitude": 40.9823,
  "longitude": 29.0276,
  "googlePlaceId": "ChIJa...",
  "coverImageUrl": "https://cdn.example.com/place.jpg",
  "translations": [
    { "languageId": 1, "name": "Moda Parkı", "slug": "moda-parki" },
    { "languageId": 2, "name": "Moda Park",  "slug": "moda-park"  }
  ]
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| countryId | int? | — | Ülke ID |
| cityId | int? | — | Şehir ID |
| districtId | int? | — | İlçe ID |
| latitude | double? | — | Enlem |
| longitude | double? | — | Boylam |
| googlePlaceId | string? | — | Google Maps referansı |
| coverImageUrl | string? | — | Kapak fotoğrafı URL |
| translations | array | ✓ | En az 1 dil çevirisi |

**Response — 201 Created:**
```json
{
  "isSuccess": true,
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Beslenen Tablolar:**
- `place.places` — Mekan kaydı yazılır
- `place.place_translations` — Her dil için çeviri yazılır

---

### `GET /api/places/{id}`

**Açıklama:** Tek bir mekanın tam detayını döner. Puanlar, etiketler ve lokalize coğrafi bilgiler dahildir.

**Yetki:** `[Authorize]`

**Route:** `id` (Guid)

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| langId | int | 1 | Dil ID'si |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "id": "3fa85f64...",
    "name": "Moda Parkı",
    "slug": "moda-parki",
    "latitude": 40.9823,
    "longitude": 29.0276,
    "cityName": "İstanbul",
    "districtName": "Kadıköy",
    "coverImageUrl": "https://...",
    "rating": 4.7,
    "scores": {
      "popularityScore": 88,
      "qualityScore": 92,
      "trendScore": 15,
      "finalScore": 95
    },
    "labels": [
      { "id": 3, "key": "park", "displayName": "Park", "weight": 1.0 },
      { "id": 7, "key": "outdoor", "displayName": "Açık Hava", "weight": 0.8 }
    ]
  }
}
```

**Hata Durumları:**
- `404` — Mekan bulunamadı

**Beslenen Tablolar:**
- `place.places` — Ana kayıt
- `place.place_translations` — İsim ve slug
- `place.place_scores` — Popularity, quality, trend, final score (LEFT JOIN)
- `place.place_labels` — Mekan-etiket ilişkisi
- `label.labels` + `label.label_translations` — Etiket isimleri (langId'ye göre)
- `geo.city_translations` — Şehir adı (langId)
- `geo.district_translations` — İlçe adı (langId)

---

### `POST /api/places/search`

**Açıklama:** Mekanları çoklu filtrelerle arar ve sıralar. Etiket eşleştirme modu (ANY/ALL) desteklenir.

**Yetki:** `[Authorize]`

**Request Body:**
```json
{
  "languageId": 1,
  "cityId": 34,
  "districtId": 101,
  "labelIds": [3, 7],
  "matchMode": "ALL",
  "minRating": 4.0,
  "page": 1,
  "pageSize": 20
}
```

| Alan | Tip | Default | Açıklama |
|------|-----|---------|----------|
| languageId | int | 1 | Sonuç dili |
| cityId | int? | — | Şehir filtresi |
| districtId | int? | — | İlçe filtresi |
| labelIds | int[]? | — | Etiket ID listesi |
| matchMode | string | "ANY" | `ANY` → en az 1 etiket, `ALL` → tüm etiketler |
| minRating | decimal? | — | Minimum puan filtresi |
| page | int | 1 | Sayfa numarası |
| pageSize | int | 20 | Sayfa boyutu (max 100) |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "totalCount": 142,
    "page": 1,
    "pageSize": 20,
    "items": [
      {
        "id": "3fa85f64...",
        "name": "Moda Parkı",
        "slug": "moda-parki",
        "cityId": 34,
        "rating": 4.7,
        "finalScore": 95,
        "labels": ["park", "outdoor"]
      }
    ]
  }
}
```

**Sıralama:** `final_score DESC → rating DESC → created_at ASC`

**Beslenen Tablolar:**
- `place.places` — Soft-delete filtreli (`is_deleted = false`)
- `place.place_translations` — İsim/slug (langId JOIN)
- `place.place_labels` — Etiket filtresi (`ANY`: INNER JOIN, `ALL`: COUNT DISTINCT = etiket sayısı)
- `place.place_scores` — Sıralama için final_score (LEFT JOIN)
- `label.labels` + `label.label_translations` — Etiket key'leri

---

### `GET /api/filters`

**Açıklama:** Arama arayüzünde kullanılacak tüm etiket kategorilerini ve etiketleri lokalize olarak döner.

**Yetki:** `[Authorize]`

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| langId | int | 1 | Dil ID'si |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Mekan Türü",
        "labels": [
          { "id": 3, "key": "park",       "displayName": "Park"        },
          { "id": 4, "key": "cafe",       "displayName": "Kafe"        },
          { "id": 5, "key": "restaurant", "displayName": "Restoran"    }
        ]
      }
    ]
  }
}
```

**Beslenen Tablolar:**
- `label.label_categories` + `label.label_category_translations` — Kategori isimleri
- `label.labels` + `label.label_translations` — Etiket isimleri (langId)

---

## 4. Label Service — Port 5004

**Amaç:** Etiket ve kategori listeleme, mekan-etiket atama.

---

### `GET /api/label-categories`

**Açıklama:** Tüm etiket kategorilerini lokalize olarak listeler.

**Yetki:** `[Authorize]`

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| langId | int | 1 | Dil ID'si |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": [
    { "id": 1, "name": "Mekan Türü"  },
    { "id": 2, "name": "Özellikler" }
  ]
}
```

**Beslenen Tablolar:**
- `label.label_categories` + `label.label_category_translations`

---

### `GET /api/labels/by-category/{categoryId}`

**Açıklama:** Belirtilen kategoriye ait etiketleri lokalize olarak listeler.

**Yetki:** `[Authorize]`

**Route:** `categoryId` (int)

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| langId | int | 1 | Dil ID'si |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": [
    { "id": 3, "key": "park",    "displayName": "Park",    "isActive": true },
    { "id": 4, "key": "cafe",    "displayName": "Kafe",    "isActive": true }
  ]
}
```

**Beslenen Tablolar:**
- `label.labels` — `WHERE category_id = @categoryId AND is_active = true`
- `label.label_translations` — Dile göre displayName

---

### `POST /api/labels/assign`

**Açıklama:** Var olan bir etiketi mekana atar. Ağırlık (weight) değeri mekanın etiket skoru hesaplamasında kullanılır.

**Yetki:** `[Authorize]`

**Request Body:**
```json
{
  "placeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "labelId": 3,
  "weight": 1.0
}
```

| Alan | Tip | Default | Açıklama |
|------|-----|---------|----------|
| placeId | Guid | ✓ | Mekan ID |
| labelId | int | ✓ | Etiket ID |
| weight | decimal | 1.0 | Ağırlık (0-2 arası) |

**Response — 204 No Content**

**Beslenen Tablolar:**
- `place.place_labels` — PlaceId + LabelId + Weight ilişkisi eklenir

---

## 5. Search Service — Port 5005

**Amaç:** PostgreSQL raw SQL üzerinde full-text mekan arama ve autocomplete.

---

### `GET /api/search/places`

**Açıklama:** Mekan adı üzerinde metin araması yapar. Şehir/ilçe filtresi, etiket filtresi ve coğrafi yakınlık filtresi desteklenir.

**Yetki:** `[Authorize]`

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| query | string | — | Arama metni |
| cityId | int? | — | Şehir filtresi |
| districtId | int? | — | İlçe filtresi |
| labelIds | int[]? | — | Etiket ID listesi |
| matchMode | string | "Any" | `Any` veya `All` |
| lat | double? | — | Merkez enlemi (geo-filtre) |
| lon | double? | — | Merkez boylamı (geo-filtre) |
| radius | double? | — | Yarıçap (km) |
| page | int | 1 | Sayfa numarası |
| pageSize | int | 20 | Sayfa boyutu |
| lang | string | "en" | Sonuç dili |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "totalCount": 38,
    "page": 1,
    "pageSize": 20,
    "items": [
      {
        "placeId": "3fa85f64...",
        "name": "Moda Parkı",
        "slug": "moda-parki",
        "latitude": 40.9823,
        "longitude": 29.0276,
        "cityId": 34,
        "distanceKm": 1.2
      }
    ]
  }
}
```

**Beslenen Tablolar:**
- `place.places` — `is_deleted = false` filtreli, raw SQL
- `place.place_translations` — `LEFT JOIN`, `ILIKE '%query%'` ile metin araması
- `place.place_labels` — Etiket filtresi (matchMode'a göre)

**Teknik Detay:** EF Core 9 `SqlQueryRaw<PlaceSearchRaw>` ile çalışır. `PlaceSearchRaw` ve `CountResult` tipleri `DbContext`'te keyless entity olarak kayıtlıdır.

---

### `GET /api/search/autocomplete`

**Açıklama:** Yazılırken anlık öneri sunar. Şehir kapsamında prefix eşleştirmesi yapar.

**Yetki:** `[Authorize]`

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| query | string | ✓ | Arama ön eki |
| cityId | int? | — | Şehir kapsamı |
| lang | string | "en" | Sonuç dili |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": ["Moda Parkı", "Moda Sahili", "Modart Sanat Merkezi"]
}
```

**Beslenen Tablolar:**
- `place.places` — `is_deleted = false`
- `place.place_translations` — `ILIKE 'query%'` ile prefix eşleştirme, cityId filtresi

---

## 6. Admin Service — Port 5006

**Amaç:** Runtime konfigürasyon yönetimi, feature flag kontrolü, moderation, mekan/etiket/geo admin işlemleri.

> **Rol Gereksinimleri:** `Admin` veya `SuperAdmin` rolü. Bazı endpoint'ler yalnızca `SuperAdmin` içindir.

---

### `GET /api/admin/config`

**Açıklama:** Tüm canlı runtime konfigürasyonlarını listeler.

**Yetki:** `[Authorize]` + Admin/SuperAdmin

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "configs": [
      { "key": "Recommendation:TrendCap",    "value": "200",  "updatedAt": "2026-03-20T10:00:00Z" },
      { "key": "Recommendation:ExploreBlend", "value": "{...}", "updatedAt": "2026-03-19T08:30:00Z" }
    ]
  }
}
```

**Beslenen Tablolar:**
- `admin.runtime_configs` — Tüm key-value kayıtları

---

### `PUT /api/admin/config/runtime/{key}`

**Açıklama:** Bir konfigürasyon değerini anlık olarak günceller veya yeni oluşturur. `requiresApproval=true` olduğunda değişiklik beklemede kalır.

**Yetki:** `[Authorize]` + Admin/SuperAdmin

**Route:** `key` (string) — örn. `Recommendation:TrendCap`

**Request Body:**
```json
{
  "value": "250",
  "changedBy": "admin@spotfinder.io",
  "changeReason": "Trending cap artırıldı — Q2 kampanyası",
  "requiresApproval": false
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| value | string (JSON) | ✓ | Yeni değer |
| changedBy | string | ✓ | Değişikliği yapan admin |
| changeReason | string | ✓ | Audit log için sebep |
| requiresApproval | bool | — | `true` → SuperAdmin onayı gerekir |

**Response — 200 OK (anında uygulama):**
```json
{
  "isSuccess": true,
  "data": { "key": "Recommendation:TrendCap", "newValue": "250", "version": 3 }
}
```

**Response — 202 Accepted (onay bekliyor):**
```json
{
  "isSuccess": true,
  "data": { "pendingChangeId": "...", "status": "Pending" }
}
```

**İşlem Sırası (transaction):**
1. JSON geçerliliği ve `changeReason` boş olmama kontrolü
2. `runtime_config_versions`'a snapshot eklenir
3. `runtime_configs` upsert edilir
4. `config_audit_logs`'a before/after diff yazılır
5. Redis `config:{key}` kanalına değişiklik yayınlanır (cache invalidation)

**Beslenen Tablolar:**
- `admin.runtime_configs` — Canlı değer güncellenir
- `admin.runtime_config_versions` — Yeni versiyon snapshot'ı
- `admin.config_audit_logs` — Denetim kaydı
- `admin.pending_config_changes` — Yalnızca `requiresApproval=true` ise

---

### `GET /api/admin/config/versions/{key}`

**Açıklama:** Bir konfigürasyonun tüm versiyon geçmişini en yeniden eskiye listeler.

**Yetki:** Admin+

**Route:** `key` (string)

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": [
    { "version": 3, "value": "250", "changedBy": "admin@...", "changeReason": "Q2 kampanyası", "createdAt": "2026-03-20T..." },
    { "version": 2, "value": "200", "changedBy": "admin@...", "changeReason": "Initial set",   "createdAt": "2026-03-10T..." }
  ]
}
```

**Beslenen Tablolar:**
- `admin.runtime_config_versions` — `ORDER BY version DESC`

---

### `POST /api/admin/config/rollback/{key}/{version}`

**Açıklama:** Belirli bir konfigürasyon versiyonuna geri alır. Geri alım işlemi yeni bir versiyon olarak kaydedilir.

**Yetki:** Admin+

**Route:** `key` (string), `version` (int)

**Request Body:**
```json
{
  "rolledBackBy": "admin@spotfinder.io",
  "changeReason": "Yanlış değer geri alındı"
}
```

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": { "key": "Recommendation:TrendCap", "restoredValue": "200", "newVersion": 4 }
}
```

**Beslenen Tablolar:**
- `admin.runtime_config_versions` — Eski versiyon okunur, yeni versiyon yazılır
- `admin.runtime_configs` — Canlı değer eski değere döndürülür
- `admin.config_audit_logs` — Rollback audit kaydı

---

### `GET /api/admin/config/audit`

**Açıklama:** Konfigürasyon değişiklik denetim kayıtlarını sayfalandırılmış olarak listeler.

**Yetki:** Admin+

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| key | string? | — | Belirli bir key filtresi |
| page | int | 1 | Sayfa numarası |
| pageSize | int | 50 | Sayfa boyutu |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": [
    {
      "key": "Recommendation:TrendCap",
      "oldValue": "200",
      "newValue": "250",
      "changedBy": "admin@...",
      "changeReason": "Q2 kampanyası",
      "createdAt": "2026-03-20T10:00:00Z"
    }
  ]
}
```

**Beslenen Tablolar:**
- `admin.config_audit_logs`

---

### `GET /api/admin/config/pending`

**Açıklama:** Onay bekleyen konfigürasyon değişikliklerini listeler.

**Yetki:** Admin+

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| key | string? | — | Belirli key filtresi |
| status | string | "Pending" | `Pending`, `Approved`, `Rejected` |
| page | int | 1 | — |
| pageSize | int | 50 | — |

**Beslenen Tablolar:**
- `admin.pending_config_changes`

---

### `POST /api/admin/config/pending/{id}/approve`

**Açıklama:** Beklemedeki bir konfigürasyon değişikliğini onaylar ve canlıya alır.

**Yetki:** SuperAdmin only

**Route:** `id` (Guid)

**Request Body:**
```json
{
  "reviewedBy": "superadmin@spotfinder.io",
  "reviewReason": "Test doğrulandı, onaylandı"
}
```

**Beslenen Tablolar:**
- `admin.pending_config_changes` — Status → `Approved`
- `admin.runtime_configs` — Değer uygulanır
- `admin.runtime_config_versions` + `admin.config_audit_logs` — Kayıt oluşturulur

---

### `POST /api/admin/config/pending/{id}/reject`

**Açıklama:** Beklemedeki değişikliği reddeder. Canlı değer değişmez.

**Yetki:** SuperAdmin only

**Route:** `id` (Guid)

**Request Body:**
```json
{
  "reviewedBy": "superadmin@spotfinder.io",
  "reviewReason": "Değer aralık dışı"
}
```

**Beslenen Tablolar:**
- `admin.pending_config_changes` — Status → `Rejected`

---

### `PUT /api/admin/config/flags/{key}`

**Açıklama:** Feature flag oluşturur veya günceller. Rollout yüzdesi ve hedef kitle ayarlanabilir.

**Yetki:** Admin+

**Route:** `key` (string)

**Request Body:**
```json
{
  "isEnabled": true,
  "rolloutPercentage": 25,
  "target": "{\"userIds\":[],\"countries\":[\"TR\"],\"platform\":[\"ios\"]}",
  "changedBy": "admin@spotfinder.io",
  "changeReason": "TR iOS kullanıcılara %25 açılıyor"
}
```

**Response — 200 OK**

**Beslenen Tablolar:**
- `admin.feature_flags` — Upsert

---

### `POST /api/admin/places`

**Açıklama:** Admin yetkisiyle yeni mekan oluşturur.

**Yetki:** Admin+

**Request Body:** Place Service → `POST /api/places` ile aynı format.

**Response — 201 Created:** `{ "data": "<guid>" }`

**Beslenen Tablolar:** `place.places`, `place.place_translations`

---

### `PUT /api/admin/places/{id}`

**Açıklama:** Mekan meta verilerini admin olarak günceller.

**Yetki:** Admin+

**Route:** `id` (Guid)

**Request Body:**
```json
{
  "cityId": 34,
  "districtId": 101,
  "latitude": 40.9823,
  "longitude": 29.0276,
  "rating": 4.8,
  "parkingStatus": "Available",
  "updatedBy": "admin@spotfinder.io"
}
```

**Response — 204 No Content**

**Beslenen Tablolar:** `place.places`

---

### `DELETE /api/admin/places/{id}`

**Açıklama:** Mekanı soft-delete yapar (`is_deleted = true`). Kaydı fiziksel olarak silmez.

**Yetki:** Admin+

**Route:** `id` (Guid)

**Query Parametreleri:** `deletedBy` (string?)

**Response — 204 No Content**

**Beslenen Tablolar:** `place.places`

---

### `GET /api/moderation/pending`

**Açıklama:** Moderasyon bekleyen içerikleri listeler.

**Yetki:** Admin+

**Beslenen Tablolar:** `admin.moderation_items`

---

### `POST /api/admin/labels`

**Açıklama:** Yeni etiket ve lokalizasyonlarını oluşturur.

**Yetki:** Admin+

**Request Body:**
```json
{
  "key": "rooftop",
  "isActive": true,
  "categoryId": 1,
  "translations": [
    { "languageId": 1, "displayName": "Çatı Katı" },
    { "languageId": 2, "displayName": "Rooftop"   }
  ]
}
```

**Response — 201 Created:** `{ "data": 42 }` (yeni label ID)

**Beslenen Tablolar:** `label.labels`, `label.label_translations`

---

### `PUT /api/admin/labels/{id}`

**Açıklama:** Etiket meta verilerini günceller.

**Yetki:** Admin+

**Route:** `id` (int)

**Request Body:**
```json
{
  "key": "rooftop-bar",
  "isActive": false,
  "updatedBy": "admin@spotfinder.io"
}
```

**Response — 204 No Content**

**Beslenen Tablolar:** `label.labels`

---

### `POST /api/admin/labels/{id}/places/{placeId}`

**Açıklama:** Etiketi mekana atar ve ağırlık belirtir.

**Yetki:** Admin+

**Route:** `id` (int — label), `placeId` (Guid)

**Request Body:**
```json
{
  "weight": 1.5,
  "createdBy": "admin@spotfinder.io"
}
```

**Response — 204 No Content**

**Beslenen Tablolar:** `place.place_labels`

---

### `POST /api/admin/geo/cities`

**Açıklama:** Coğrafi veritabanına yeni şehir ekler.

**Yetki:** Admin+

**Request Body:**
```json
{
  "countryId": 1,
  "translations": [
    { "languageId": 1, "name": "Bursa", "slug": "bursa" },
    { "languageId": 2, "name": "Bursa", "slug": "bursa" }
  ]
}
```

**Response — 201 Created:** `{ "data": 16 }` (yeni şehir ID)

**Beslenen Tablolar:** `geo.cities`, `geo.city_translations`

---

### `POST /api/admin/geo/districts`

**Açıklama:** Coğrafi veritabanına yeni ilçe ekler.

**Yetki:** Admin+

**Request Body:**
```json
{
  "cityId": 16,
  "translations": [
    { "languageId": 1, "name": "Osmangazi", "slug": "osmangazi" }
  ]
}
```

**Response — 201 Created:** `{ "data": 301 }` (yeni ilçe ID)

**Beslenen Tablolar:** `geo.districts`, `geo.district_translations`

---

## 7. Social Graph Service — Port 5007

**Amaç:** Kullanıcılar arası takip ilişkilerini yönetir. Feed service'in "following" kaynağını oluşturur.

---

### `POST /api/social/follow`

**Açıklama:** Giriş yapmış kullanıcı başka bir kullanıcıyı takip eder. İdempotent — zaten takip ediliyorsa sessizce başarılı döner.

**Yetki:** `[Authorize]`

**Request Body:**
```json
{
  "followingId": "9c1c476a-1234-5678-abcd-ef0123456789"
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| followingId | Guid | ✓ | Takip edilecek kullanıcının ID'si |

**Response — 204 No Content**

**Hata Durumları:**
- `400` — Kendini takip etmeye çalışma

**Beslenen Tablolar:**
- `social.user_follows` — `(follower_id, following_id, created_at)` kaydı eklenir

---

### `POST /api/social/unfollow`

**Açıklama:** Takip ilişkisini sonlandırır. Takip yoksa sessizce başarılı döner.

**Yetki:** `[Authorize]`

**Request Body:**
```json
{
  "followingId": "9c1c476a-1234-5678-abcd-ef0123456789"
}
```

**Response — 204 No Content**

**Beslenen Tablolar:**
- `social.user_follows` — İlgili satır silinir

---

## 8. Content Service — Port 5008

**Amaç:** Post yaşam döngüsü (oluşturma, beğeni, yorum, medya), kullanıcı etkileşim event'leri ve post moderasyonu.

---

### `POST /api/posts`

**Açıklama:** Yeni bir post oluşturur. Feed score otomatik hesaplanır. Kullanıcının ilgi profili güncellenir.

**Yetki:** `[Authorize]`

**Request Body:**
```json
{
  "placeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "caption": "Harika bir akşam Moda Parkı'nda!"
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| placeId | Guid | ✓ | Postun ait olduğu mekan |
| caption | string? | — | Post açıklaması |

**Response — 201 Created:**
```json
{
  "isSuccess": true,
  "data": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

**İşlemler:**
1. `Post` entity oluşturulur (UserId JWT'den, FeedScore = `ComputeFeedScore(likes=0, comments=0, createdAt)`)
2. Kullanıcının ilgi puanı güncellenir (`user_interests` tablosuna `+4` weight ile)
3. `PostCreate` event'i loglanır

**Beslenen Tablolar:**
- `content.posts` — Yeni post yazılır
- `content.user_interests` — İlgi skoru güncellenir
- `content.user_events` — Event loglanır

---

### `POST /api/posts/{id}/media`

**Açıklama:** Var olan bir posta medya (fotoğraf/video) ekler.

**Yetki:** `[Authorize]` (yalnızca postun sahibi)

**Route:** `id` (Guid — post ID)

**Request Body:**
```json
{
  "url": "https://cdn.example.com/posts/abc123.jpg",
  "type": "image"
}
```

| Alan | Tip | Açıklama |
|------|-----|----------|
| url | string | Medya dosyasının CDN URL'i |
| type | string? | `image`, `video`, vb. |

**Response — 201 Created:** `{ "data": "<media-guid>" }`

**Beslenen Tablolar:**
- `content.post_media` — URL ve tip kaydedilir

---

### `POST /api/posts/{id}/like`

**Açıklama:** Postu beğenir. İdempotent — zaten beğenilmişse tekrar eklenmez. LikeCount güncellenir ve feed score yeniden hesaplanır.

**Yetki:** `[Authorize]`

**Route:** `id` (Guid — post ID)

**Request Body:** Yok

**Response — 204 No Content**

**İşlemler:**
1. `post_likes`'a `(user_id, post_id)` eklenir
2. `posts.like_count` +1 artırılır
3. `posts.feed_score` yeniden hesaplanır

**Beslenen Tablolar:**
- `content.post_likes` — Beğeni ilişkisi eklenir
- `content.posts` — `like_count` ve `feed_score` güncellenir

---

### `POST /api/posts/{id}/unlike`

**Açıklama:** Beğeniyi geri alır. LikeCount azaltılır ve feed score güncellenir.

**Yetki:** `[Authorize]`

**Route:** `id` (Guid — post ID)

**Response — 204 No Content**

**Beslenen Tablolar:**
- `content.post_likes` — Satır silinir
- `content.posts` — `like_count` ve `feed_score` güncellenir

---

### `POST /api/posts/{id}/comment`

**Açıklama:** Posta yorum ekler. CommentCount güncellenir ve feed score yeniden hesaplanır.

**Yetki:** `[Authorize]`

**Route:** `id` (Guid — post ID)

**Request Body:**
```json
{
  "text": "Harika bir mekan, kesinlikle gidilmeli!"
}
```

**Response — 201 Created:** `{ "data": "<comment-guid>" }`

**İşlemler:**
1. `post_comments`'a yorum eklenir
2. `posts.comment_count` +1 artırılır
3. `posts.feed_score` yeniden hesaplanır

**Beslenen Tablolar:**
- `content.post_comments` — Yorum kaydedilir
- `content.posts` — `comment_count` ve `feed_score` güncellenir

---

### `POST /api/events/dwell`

**Açıklama:** Kullanıcının bir post üzerinde geçirdiği süreyi kaydeder. Feed scoring pipeline'ı için dwell-time sinyali sağlar.

**Yetki:** `[Authorize]`

**Request Body:**
```json
{
  "postId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "durationMs": 8500
}
```

| Alan | Tip | Açıklama |
|------|-----|----------|
| postId | Guid | Görüntülenen post |
| durationMs | int | Milisaniye cinsinden görüntüleme süresi |

**Response — 200 OK:** `{ "data": true }`

**Beslenen Tablolar:**
- `content.user_events` — `EventType = "dwell"`, `DurationMs`, `PostId`, `UserId` loglanır

---

### `POST /admin/posts/{id}/moderate`

**Açıklama:** Bir postun moderasyon durumunu günceller (gizleme veya silme).

**Yetki:** `[Authorize]` + Admin/SuperAdmin

**Route:** `id` (Guid — post ID)

**Request Body:**
```json
{
  "status": "Hidden",
  "hiddenReason": "Topluluk kurallarına aykırı içerik"
}
```

| Alan | Tip | Açıklama |
|------|-----|----------|
| status | string | `Active`, `Hidden`, `Deleted` |
| hiddenReason | string? | `Hidden` durumda zorunlu |

**Response — 204 No Content**

**Beslenen Tablolar:**
- `content.posts` — `status`, `hidden_reason`, `moderated_at` güncellenir

---

## 9. Feed Service — Port 5009

**Amaç:** Farklı algoritmalarla post feed'leri ve kişiselleştirilmiş mekan önerileri sunar.

> **Cursor Pagination:** Following, Nearby, Place ve Personalized feed'leri keyset pagination kullanır. İlk istekte cursor parametreleri gönderilmez; sonraki sayfa için `NextCursor` alanındaki değerler kullanılır.

---

### `GET /api/feed/following`

**Açıklama:** Takip edilen kullanıcıların postlarından oluşan, feed score'a göre sıralanmış akış. Hiç takip yoksa global en yüksek skorlu postlara (cold-start fallback) düşer.

**Yetki:** `[Authorize]`

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| pageSize | int | 10 | 1–50 arası |
| cursorScore | int? | — | Önceki sayfanın son feed_score'u |
| cursorCreatedAt | DateTime? | — | Önceki sayfanın son created_at'i |
| cursorPostId | Guid? | — | Önceki sayfanın son post ID'si |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "posts": [
      {
        "id": "7c9e6679...",
        "user": { "id": "...", "username": "johndoe", "displayName": "John Doe", "profileImageUrl": "..." },
        "place": { "id": "...", "name": "Moda Parkı" },
        "caption": "Harika bir akşam!",
        "mediaUrls": ["https://cdn.example.com/abc.jpg"],
        "likeCount": 42,
        "commentCount": 7,
        "createdAt": "2026-03-22T18:00:00Z",
        "isLikedByMe": true
      }
    ],
    "nextCursor": {
      "score": 88,
      "createdAt": "2026-03-22T18:00:00Z",
      "postId": "7c9e6679..."
    },
    "hasMore": true
  }
}
```

**Algoritma:**
- Takip edilen kullanıcıların post ID'leri sorgulanır
- `(feed_score, created_at, id)` üçlüsüyle keyset pagination
- Oversample (3×) + diversity: kullanıcı başına max 2 post
- 30 saniye cache (ilk sayfa)

**Beslenen Tablolar:**
- `social.user_follows` — Takip edilen kullanıcı ID'leri
- `content.posts` — FeedScore bazlı sıralama
- `content.post_media` — Bulk load
- `identity.users` + `identity.user_profiles` — Kullanıcı bilgileri (bulk JOIN)
- `place.place_translations` — Mekan adı (bulk load)
- `content.post_likes` — `isLikedByMe` kontrolü (bulk load)

---

### `GET /api/feed/nearby`

**Açıklama:** Belirtilen şehirdeki mekanlara ait postları döner.

**Yetki:** `[Authorize]`

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| cityId | int | ✓ | Şehir filtresi |
| pageSize | int | — | 1–50, default 10 |
| cursorScore | int? | — | Cursor |
| cursorCreatedAt | DateTime? | — | Cursor |
| cursorPostId | Guid? | — | Cursor |

**Response:** Following feed ile aynı format.

**Algoritma:** Following feed ile aynı; fark: `social.user_follows` yerine `place.places WHERE city_id = @cityId` filtresi uygulanır.

**Beslenen Tablolar:** `content.posts`, `place.places` (cityId filtresi), `content.post_media`, `identity.users` + `identity.user_profiles`, `place.place_translations`, `content.post_likes`

---

### `GET /api/feed/place/{placeId}`

**Açıklama:** Belirli bir mekana ait tüm postları feed score sırasıyla döner.

**Yetki:** `[Authorize]`

**Route:** `placeId` (Guid)

**Query Parametreleri:** `pageSize`, cursor parametreleri

**Response:** Following feed ile aynı format.

**Beslenen Tablolar:** `content.posts` (placeId filtresi), `content.post_media`, `identity.users` + `identity.user_profiles`, `place.place_translations`, `content.post_likes`

---

### `GET /api/feed/personalized`

**Açıklama:** Kullanıcının ilgi profili ve trending skorlarına göre kişiselleştirilmiş post akışı. Yeni kullanıcılar için global top postlara düşer.

**Yetki:** `[Authorize]`

**Query Parametreleri:** `pageSize`, cursor parametreleri

**Response:** Following feed ile aynı format.

**Skor Formülü:**
```
final_score = feed_score + (interest_score × 2) + trend_score
```

**Algoritma:**
1. Kullanıcının ilgi vektörü yüklenir (`user_interests`)
2. Trending mekan ID'leri yüklenir (`trend_scores`)
3. Kullanıcının ilgi duyduğu label'lara sahip mekanların postları çekilir
4. Skor formülü uygulanır, cursor pagination + diversity kuralı

**Beslenen Tablolar:**
- `feed.user_interests` — Kullanıcı ilgi skoru (label bazlı)
- `feed.trend_scores` — Trend skoru
- `place.place_labels` — Label → mekan eşleştirmesi
- `content.posts`, `content.post_media`, `identity.users` + `identity.user_profiles`, `place.place_translations`, `content.post_likes`

---

### `GET /api/feed/explore`

**Açıklama:** Kişiselleştirilmiş, trending ve global discovery postlarının blendini sunar. Cursor yoktur — her seferinde taze sonuç döner. A/B test varyantı kullanıcı ID'sinden deterministik olarak atanır.

**Yetki:** `[Authorize]`

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| pageSize | int | 10 | 1–50 |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "posts": [ ... ],
    "nextCursor": null,
    "hasMore": false
  }
}
```

**A/B Varyantları:**

| Varyant | Atama | Kişisel | Trending | Discovery |
|---------|-------|---------|----------|-----------|
| A | `hash(userId) % 2 == 0` | %50 | %30 | %20 |
| B | `hash(userId) % 2 == 1` | %40 | %40 | %20 |

**Skor Formülü:**
```
final_score = feed_score
            + log(1 + interest_score) × multiplier   (A: ×2.0, B: ×1.5)
            + min(trend_score, TrendCap)              (default cap: 200)
```

**Diversity:** Merge edilen sonuçlarda yazar başına max 2 post.

**Cache:** 30 saniye, `feed:explore:{userId}:{pageSize}:{variant}` anahtarıyla.

**Beslenen Tablolar (sırasıyla, sequential):**
1. `feed.user_interests` — İlgi vektörü
2. `feed.trend_scores` — Trending mekan skorları
3. `place.place_labels` → ilgili mekan ID'leri
4. `content.posts` — 3 kaynaktan (personalized + trending + discovery)
5. `content.post_media`, `identity.users` + `identity.user_profiles`, `place.place_translations`, `content.post_likes`, `place.place_labels` — Bulk load

---

### `GET /api/places/recommendations`

**Açıklama:** Kullanıcının ilgi profiline ve trend skorlarına göre sıralanmış mekan önerileri döner. Admin rolündeyse ve `?debug=true` ise algoritma parametreleri de dahil edilir.

**Yetki:** `[Authorize]`

**Query Parametreleri:**

| Parametre | Tip | Default | Açıklama |
|-----------|-----|---------|----------|
| pageSize | int | 10 | 1–50 |
| debug | bool | false | `true` ise ve Admin/SuperAdmin ise DebugInfo dahil edilir |

**Response — 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "recommendations": [
      {
        "placeId": "3fa85f64...",
        "name": "Moda Parkı",
        "slug": "moda-parki",
        "totalScore": 148.5,
        "trendScore": 32.0,
        "interestScore": 116.5
      }
    ],
    "debugInfo": null
  }
}
```

`debugInfo` yalnızca Admin/SuperAdmin + `?debug=true` isteklerinde dolar:
```json
{
  "debugInfo": {
    "trendCap": 200,
    "interestMultiplier": 2.0,
    "exploreBlend": { "personalized": 0.5, "trending": 0.3, "discovery": 0.2 }
  }
}
```

**Skor Formülü:**
```
total_score = SUM(user_interest[label] × label_weight) + trend_score
```

**Cache:** 60 saniye per kullanıcı.

**Beslenen Tablolar:**
- `feed.user_interests` — Kullanıcı label ilgileri
- `feed.trend_scores` — Trend skoru
- `place.place_labels` — Label-mekan ağırlıkları
- `place.places` + `place.place_translations` — Mekan adı

---

## 10. Veritabanı Şema Özeti

```
identity
├── users              (id, email, username, password_hash, role, is_active, created_at)
├── user_profiles      (user_id, display_name, bio, profile_image_url)
└── refresh_tokens     (user_id, value, expires_at, created_at)

geo
├── countries          (id, code)
├── country_translations (country_id, language_id, name, slug)
├── cities             (id, country_id)
├── city_translations  (city_id, language_id, name, slug)
├── districts          (id, city_id)
└── district_translations (district_id, language_id, name, slug)

place
├── places             (id, google_place_id, country_id, city_id, district_id, lat, lon, rating, is_deleted, created_at)
├── place_translations (place_id, language_id, name, slug)
├── place_labels       (place_id, label_id, weight)
└── place_scores       (place_id, popularity_score, quality_score, trend_score, final_score)

label
├── label_categories   (id)
├── label_category_translations (category_id, language_id, name)
├── labels             (id, key, is_active, category_id)
└── label_translations (label_id, language_id, display_name)

content
├── posts              (id, user_id, place_id, caption, like_count, comment_count, feed_score, status, is_deleted, moderated_at, created_at)
├── post_media         (id, post_id, url, type)
├── post_likes         (user_id, post_id, created_at)
├── post_comments      (id, post_id, user_id, text, created_at)
└── user_events        (id, user_id, event_type, post_id, place_id, duration_ms, created_at)

social
└── user_follows       (follower_id, following_id, created_at)

feed
├── user_interests     (user_id, label_id, score)
└── trend_scores       (place_id, score, updated_at)

admin
├── runtime_configs          (key, value, updated_at)
├── runtime_config_versions  (key, value, version, changed_by, change_reason, created_at)
├── config_audit_logs        (key, old_value, new_value, changed_by, change_reason, created_at)
├── pending_config_changes   (id, key, value, status, changed_by, review_reason, created_at)
├── feature_flags            (key, is_enabled, rollout_percentage, target, updated_at)
├── moderation_items         (id, object_type, object_id, status, reviewed_by, created_at)
└── audit_logs               (id, operation, entity_type, entity_id, changed_by, changes, created_at)
```

---

## 11. Mimari Desenler

| Desen | Uygulama |
|-------|----------|
| **CQRS** | Command (yazma) ve Query (okuma) handler'ları ayrı |
| **MediatR** | Controller → `ISender.Send(query/command)` → Handler |
| **Repository + UoW** | Data access abstraction, transaction yönetimi |
| **Soft Delete** | `HasQueryFilter(p => !p.IsDeleted)` — sorgular otomatik filtreli |
| **Keyset Pagination** | `(feed_score, created_at, id)` üçlüsüyle cursor-based pagination |
| **Bulk Load (N+1 önleme)** | Feed handler'ları tüm post ID'leri için medya/kullanıcı/mekan verilerini tek sorguda yükler |
| **In-Memory Cache** | 30–60 saniye TTL, kullanıcı bazlı cache key |
| **JWT + Role Auth** | `User`, `Admin`, `SuperAdmin` rolleri; UserId her zaman claim'den |
| **Sequential DB Ops** | EF Core tek DbContext örneğinde eşzamanlı `await` — `Task.WhenAll` kullanılmaz |
| **Audit Trail** | Admin config değişiklikleri tam before/after diff ile loglanır |
| **Config Versioning** | Rollback için versiyon geçmişi tutulur |
| **A/B Testing** | Explore feed varyantı `hash(userId) % 2` ile deterministik atanır |
