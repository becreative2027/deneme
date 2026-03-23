# SpotFinder — API Endpoint Dokümantasyonu

> Oluşturulma tarihi: 2026-03-23
> Mimari: CQRS + MediatR, PostgreSQL (çoklu schema), JWT kimlik doğrulama

---

## İçindekiler

1. [Identity Service](#1-identity-service)
2. [Geo Service](#2-geo-service)
3. [Label Service](#3-label-service)
4. [Place Service](#4-place-service)
5. [Content Service](#5-content-service)
6. [Social Graph Service](#6-social-graph-service)
7. [Search Service](#7-search-service)
8. [Feed Service](#8-feed-service)
9. [Admin Service](#9-admin-service)
10. [Veritabanı Şema Özeti](#10-veritabanı-şema-özeti)

---

## 1. Identity Service

Base URL: `/api/auth`, `/api/users`
Auth: JWT Bearer (belirtilmedikçe anonim)

---

### POST /api/auth/register

**Açıklama:** Yeni kullanıcı kaydı oluşturur.
**Auth:** Anonim
**Yazar tablosu:** `identity.users`, `identity.profiles`, `identity.refresh_tokens`

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "P@ssw0rd!"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

---

### POST /api/auth/login

**Açıklama:** Kullanıcı girişi, JWT access + refresh token döner.
**Auth:** Anonim
**Yazar tablosu:** `identity.refresh_tokens`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
}
```

---

### GET /api/users/{id}

**Açıklama:** ID'ye göre kullanıcı bilgisi döner.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** — (sadece okuma, `identity.users`)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "User",
    "isActive": true,
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

**Response 404:** Kullanıcı bulunamadığında

---

### PUT /api/users/profile

**Açıklama:** Oturumdaki kullanıcının profil bilgilerini günceller.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `identity.profiles`

**Request:**
```json
{
  "displayName": "John Doe",
  "bio": "Şehir kaşifi",
  "profileImageUrl": "https://cdn.example.com/avatar.jpg"
}
```

**Response 204:** No Content

---

## 2. Geo Service

Base URL: `/api/countries`, `/api/cities`, `/api/districts`
Auth: Anonim (sadece okuma)

---

### GET /api/countries?langId=1

**Açıklama:** Tüm ülkelerin listesini döner.
**Yazar tablosu:** — (sadece okuma, `geo.countries`, `geo.country_translations`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "TR", "name": "Türkiye" },
    { "id": 2, "code": "DE", "name": "Almanya" }
  ]
}
```

---

### GET /api/cities/by-country/{countryId}?langId=1

**Açıklama:** Ülkeye ait şehirleri döner.
**Yazar tablosu:** — (sadece okuma, `geo.cities`, `geo.city_translations`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 34, "countryId": 1, "name": "İstanbul" },
    { "id": 6,  "countryId": 1, "name": "Ankara" }
  ]
}
```

---

### GET /api/districts/by-city/{cityId}?langId=1

**Açıklama:** Şehre ait ilçeleri döner.
**Yazar tablosu:** — (sadece okuma, `geo.districts`, `geo.district_translations`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "cityId": 34, "name": "Kadıköy" },
    { "id": 2, "cityId": 34, "name": "Beşiktaş" }
  ]
}
```

---

## 3. Label Service

Base URL: `/api/labelcategories`, `/api/labels`
Auth: Anonim (okuma), Bearer (yazma)

---

### GET /api/labelcategories?langId=1

**Açıklama:** Tüm label kategorilerini döner.
**Yazar tablosu:** — (sadece okuma, `label.label_categories`, `label.label_category_translations`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "key": "cuisine", "displayName": "Mutfak" },
    { "id": 2, "key": "ambiance", "displayName": "Ambiyans" }
  ]
}
```

---

### GET /api/labels/by-category/{categoryId}?langId=1

**Açıklama:** Kategoriye ait etiketleri döner.
**Yazar tablosu:** — (sadece okuma, `label.labels`, `label.label_translations`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 10, "key": "turkish", "displayName": "Türk Mutfağı" },
    { "id": 11, "key": "italian", "displayName": "İtalyan Mutfağı" }
  ]
}
```

---

### POST /api/labels/assign

**Açıklama:** Bir label'ı bir mekâna atar.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `label.place_labels`

**Request:**
```json
{
  "placeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "labelId": 10,
  "weight": 0.9
}
```

**Response 204:** No Content

---

## 4. Place Service

Base URL: `/api/places`, `/api/filters`
Auth: Anonim (okuma), Bearer (yazma)

---

### GET /api/filters?langId=1

**Açıklama:** Tüm label kategorileri ve etiketlerini filtre paneli için döner.
**Yazar tablosu:** — (sadece okuma, `label.*`)

**Response 200:**
```json
{
  "isSuccess": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "key": "cuisine",
        "displayName": "Mutfak",
        "labels": [
          { "id": 10, "key": "turkish", "displayName": "Türk Mutfağı" }
        ]
      }
    ]
  }
}
```

---

### POST /api/places/search

**Açıklama:** Geo, label ve puanlama filtrelerine göre mekân arar.
**Auth:** Anonim
**Yazar tablosu:** — (sadece okuma, `place.*`, `label.place_labels`)

**Request:**
```json
{
  "cityId": 34,
  "districtId": null,
  "labelIds": [10, 11],
  "matchMode": "Any",
  "lat": 41.015137,
  "lon": 28.979530,
  "radius": 5.0,
  "page": 1,
  "pageSize": 20,
  "langId": 1
}
```

**Response 200:**
```json
{
  "isSuccess": true,
  "data": {
    "places": [
      {
        "id": "aab1f64-...",
        "name": "Karaköy Lokantası",
        "slug": "karakoy-lokantasi",
        "coverImageUrl": "https://cdn.example.com/place.jpg",
        "cityId": 34,
        "districtId": 1,
        "latitude": 41.024,
        "longitude": 28.974,
        "rating": 4.5,
        "parkingStatus": "available",
        "labels": [
          { "id": 10, "name": "Türk Mutfağı" }
        ]
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### GET /api/places/{id}?langId=1

**Açıklama:** Mekânın tam detaylarını (label'lar ve skorlar dahil) döner.
**Auth:** Anonim
**Yazar tablosu:** — (sadece okuma, `place.*`, `label.place_labels`)

**Response 200:**
```json
{
  "isSuccess": true,
  "data": {
    "id": "aab1f64-...",
    "name": "Karaköy Lokantası",
    "slug": "karakoy-lokantasi",
    "googlePlaceId": "ChIJ...",
    "coverImageUrl": "https://cdn.example.com/place.jpg",
    "countryId": 1,
    "cityId": 34,
    "cityName": "İstanbul",
    "districtId": 1,
    "districtName": "Kadıköy",
    "latitude": 41.024,
    "longitude": 28.974,
    "rating": 4.5,
    "userRatingsTotal": 320,
    "parkingStatus": "available",
    "score": {
      "popularityScore": 87.5,
      "qualityScore": 92.0,
      "trendScore": 15.3,
      "finalScore": 194.8
    },
    "labels": [
      { "labelId": 10, "key": "turkish", "displayName": "Türk Mutfağı", "weight": 0.90 }
    ]
  }
}
```

**Response 404:** Mekân bulunamadığında

---

### POST /api/places

**Açıklama:** Yeni mekân oluşturur.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `place.places`, `place.place_translations`

**Request:**
```json
{
  "countryId": 1,
  "cityId": 34,
  "districtId": 1,
  "latitude": 41.015,
  "longitude": 28.979,
  "googlePlaceId": "ChIJ...",
  "source": "manual",
  "languageId": 1,
  "name": "Yeni Mekan",
  "slug": "yeni-mekan"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

---

## 5. Content Service

Base URL: `/api/posts`, `/api/events`, `/admin/posts`
Auth: Bearer (tüm endpoint'ler)

---

### POST /api/posts

**Açıklama:** Yeni gönderi oluşturur.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `content.posts`

**Request:**
```json
{
  "placeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "caption": "Harika bir yer!"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": "7cb1a234-..."
}
```

---

### POST /api/posts/{id}/media

**Açıklama:** Gönderiye medya ekler.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `content.post_media`

**Request:**
```json
{
  "url": "https://cdn.example.com/photo.jpg",
  "type": "image"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": "8de2b345-..."
}
```

---

### POST /api/posts/{id}/like

**Açıklama:** Gönderiyi beğenir.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `content.post_likes`, `content.posts` (like_count güncellenir)

**Response 204:** No Content

---

### POST /api/posts/{id}/unlike

**Açıklama:** Gönderi beğenisini geri alır.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `content.post_likes` (satır silinir), `content.posts` (like_count güncellenir)

**Response 204:** No Content

---

### POST /api/posts/{id}/comment

**Açıklama:** Gönderiye yorum ekler.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `content.post_comments`, `content.posts` (comment_count güncellenir)

**Request:**
```json
{
  "text": "Kesinlikle tavsiye ederim!"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": "9ef3c456-..."
}
```

---

### POST /api/events/dwell

**Açıklama:** Kullanıcının bir gönderiyi ne kadar süre izlediğini kaydeder (dwell-time sinyali).
**Auth:** Bearer (Zorunlu) — userId JWT'den alınır, client spoof edemez.
**Yazar tablosu:** `content.user_events`

**Request:**
```json
{
  "postId": "7cb1a234-...",
  "durationMs": 4500
}
```

**Response 200:**
```json
{
  "success": true,
  "data": true
}
```

---

### POST /admin/posts/{id}/moderate

**Açıklama:** Bir gönderiyi moderasyon durumuna göre günceller.
**Auth:** Bearer + Rol: `Admin` veya `SuperAdmin`
**Yazar tablosu:** `content.posts` (status, hidden_reason güncellenir)

**Request:**
```json
{
  "status": "hidden",
  "hiddenReason": "Uygunsuz içerik"
}
```

**Response 204:** No Content

---

## 6. Social Graph Service

Base URL: `/api/social`
Auth: Bearer (tüm endpoint'ler)

---

### POST /api/social/follow

**Açıklama:** Kimliği doğrulanmış kullanıcı, başka bir kullanıcıyı takip eder.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `social.user_follows`

**Request:**
```json
{
  "followingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response 204:** No Content

---

### POST /api/social/unfollow

**Açıklama:** Kimliği doğrulanmış kullanıcı, takibini bırakır.
**Auth:** Bearer (Zorunlu)
**Yazar tablosu:** `social.user_follows` (satır silinir)

**Request:**
```json
{
  "followingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response 204:** No Content

---

## 7. Search Service

Base URL: `/api/search`
Auth: Anonim

---

### GET /api/search/places

**Açıklama:** Metin, şehir, ilçe, label ve coğrafi yarıçapa göre mekân arar.
**Yazar tablosu:** — (sadece okuma, `place.*`, `label.*`, `geo.*`)

**Query Parametreleri:**

| Parametre    | Tip                  | Açıklama                              |
|--------------|----------------------|---------------------------------------|
| `query`      | string?              | Serbest metin arama                   |
| `cityId`     | Guid?                | Şehir filtresi                        |
| `districtId` | Guid?                | İlçe filtresi                         |
| `labelIds`   | List\<Guid\>?        | Label ID'leri listesi                 |
| `matchMode`  | `Any` / `All`        | Label eşleşme modu (varsayılan: Any)  |
| `lat`, `lon` | double?              | Merkez koordinatı                     |
| `radius`     | double?              | km cinsinden yarıçap                  |
| `page`       | int (varsayılan: 1)  | Sayfa numarası                        |
| `pageSize`   | int (varsayılan: 20) | Sayfa boyutu                          |
| `lang`       | string (varsayılan: "en") | Dil kodu                         |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "aab1f64-...",
        "name": "Karaköy Lokantası",
        "cityId": "...",
        "districtId": "...",
        "latitude": 41.024,
        "longitude": 28.974,
        "rating": 4.5
      }
    ],
    "totalCount": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### GET /api/search/autocomplete

**Açıklama:** Mekân adı için otomatik tamamlama önerileri döner.
**Yazar tablosu:** — (sadece okuma)

**Query Parametreleri:**

| Parametre | Tip    | Açıklama           |
|-----------|--------|--------------------|
| `query`   | string | Arama metni        |
| `cityId`  | Guid?  | Şehir filtresi     |
| `lang`    | string | Dil kodu (en/tr)   |

**Response 200:**
```json
{
  "success": true,
  "data": ["Karaköy Lokantası", "Karaköy Güllüoğlu", "Karaköy Balık"]
}
```

---

## 8. Feed Service

Base URL: `/api/feed`, `/api/places`
Auth: Bearer (tüm endpoint'ler)

> Feed endpoint'leri cursor-tabanlı sayfalama kullanır.
> İlk istek: cursor parametrelerini boş bırakın.
> Sonraki istekler: önceki yanıttaki `NextCursor` değerlerini kullanın.

---

### GET /api/feed/following

**Açıklama:** Takip edilen kullanıcıların gönderilerini sıralı döner.
**Yazar tablosu:** — (sadece okuma: `content.*`, `social.*`, `identity.*`)

**Query Parametreleri:**

| Parametre        | Açıklama                          |
|------------------|-----------------------------------|
| `pageSize`       | Varsayılan: 10                    |
| `cursorScore`    | Önceki sayfanın son skoru         |
| `cursorCreatedAt`| Önceki sayfanın son tarihi        |
| `cursorPostId`   | Önceki sayfanın son post ID'si    |

**Response 200:**
```json
{
  "items": [
    {
      "postId": "7cb1a234-...",
      "userId": "3fa85f64-...",
      "username": "johndoe",
      "profileImageUrl": "https://cdn.example.com/avatar.jpg",
      "placeId": "aab1f64-...",
      "placeName": "Karaköy Lokantası",
      "caption": "Harika bir yer!",
      "likeCount": 42,
      "commentCount": 5,
      "feedScore": 87,
      "createdAt": "2026-03-20T14:30:00Z",
      "media": [{ "url": "https://cdn.example.com/photo.jpg", "type": "image" }]
    }
  ],
  "nextCursor": {
    "score": 87,
    "createdAt": "2026-03-20T14:30:00Z",
    "postId": "7cb1a234-..."
  }
}
```

---

### GET /api/feed/nearby?cityId={cityId}

**Açıklama:** Belirtilen şehirdeki mekânlara ait gönderileri döner.
**Yazar tablosu:** — (sadece okuma: `content.*`, `place.*`)

Query parametreleri `following` endpoint'iyle aynıdır; ek olarak `cityId` (zorunlu) alır.

---

### GET /api/feed/place/{placeId}

**Açıklama:** Belirli bir mekâna ait gönderileri döner.
**Yazar tablosu:** — (sadece okuma: `content.*`, `place.*`)

---

### GET /api/feed/personalized

**Açıklama:** Kullanıcı ilgi alanlarına + trending skoruna göre kişiselleştirilmiş feed döner.
Skor formülü: `final_score = feed_score + (interest_score × 2) + trend_score`
**Yazar tablosu:** — (sadece okuma: `content.*`, `place.*`, `label.*`, `admin.feature_flags`)

---

### GET /api/feed/explore

**Açıklama:** Kişiselleştirilmiş, trending ve global top gönderileri karıştırır.
Cursor kullanmaz; kullanıcı başına 30 saniye cache'lenir.
**Yazar tablosu:** — (sadece okuma)

---

### GET /api/places/recommendations?pageSize=10&debug=false

**Açıklama:** Kullanıcının ilgi profiline + trending skora göre mekân önerir.
Skor formülü: `total_score = SUM(user_interest[label] × label_weight) + trend_score`
Kullanıcı başına 60 saniye cache'lenir.
`debug=true` yalnızca `Admin` / `SuperAdmin` rolüne `DebugInfo` döner.
**Yazar tablosu:** — (sadece okuma: `place.*`, `label.*`, `content.user_interests`, `content.trending_scores`, `admin.*`)

**Response 200:**
```json
{
  "items": [
    {
      "placeId": "aab1f64-...",
      "placeName": "Karaköy Lokantası",
      "totalScore": 123.5,
      "trendScore": 15.3
    }
  ],
  "debugInfo": null
}
```

---

## 9. Admin Service

Base URL: `/api/admin/...`
Auth: Bearer + Rol: `Admin` veya `SuperAdmin` (aksi belirtilmedikçe)

---

### GET /api/admin/audit-logs?adminId={guid}&page=1&pageSize=20

**Açıklama:** Admin işlem kayıtlarını döner.
**Yazar tablosu:** — (sadece okuma, `admin.audit_logs`)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "adminId": "...",
        "action": "CreatePlace",
        "targetEntity": "Place",
        "targetId": "...",
        "details": "{ ... }",
        "occurredAt": "2026-03-20T10:00:00Z"
      }
    ],
    "totalCount": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### GET /api/admin/moderation/pending?type=Post&page=1&pageSize=20

**Açıklama:** Bekleyen moderasyon öğelerini listeler.
**Yazar tablosu:** — (sadece okuma, `admin.moderation_items`)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "targetType": "Post",
        "targetId": "7cb1a234-...",
        "status": "Pending",
        "createdAt": "2026-03-21T09:00:00Z"
      }
    ],
    "totalCount": 3,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### POST /api/admin/moderation/{id}/review

**Açıklama:** Moderasyon öğesini onaylar veya reddeder.
**Yazar tablosu:** `admin.moderation_items`, `admin.audit_logs`

**Request:**
```json
{
  "adminId": "3fa85f64-...",
  "approve": true,
  "note": "İncelendi, uygun bulundu."
}
```

**Response 204:** No Content

---

### POST /api/admin/geo/cities

**Açıklama:** Yeni şehir oluşturur.
**Yazar tablosu:** `geo.cities`, `geo.city_translations`, `admin.write_audit_logs`

**Request:**
```json
{
  "countryId": 1,
  "translations": [
    { "languageId": 1, "name": "Bursa", "slug": "bursa" },
    { "languageId": 2, "name": "Bursa", "slug": "bursa" }
  ],
  "createdBy": "admin@example.com"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": 16
}
```

---

### POST /api/admin/geo/districts

**Açıklama:** Yeni ilçe oluşturur.
**Yazar tablosu:** `geo.districts`, `geo.district_translations`, `admin.write_audit_logs`

**Request:**
```json
{
  "cityId": 16,
  "translations": [
    { "languageId": 1, "name": "Osmangazi", "slug": "osmangazi" }
  ],
  "createdBy": "admin@example.com"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": 201
}
```

---

### POST /api/admin/labels

**Açıklama:** Yeni label oluşturur.
**Yazar tablosu:** `label.labels`, `label.label_translations`, `admin.write_audit_logs`

**Request:**
```json
{
  "categoryId": 1,
  "key": "vegan",
  "translations": [
    { "languageId": 1, "displayName": "Vegan" },
    { "languageId": 2, "displayName": "Vegan" }
  ],
  "createdBy": "admin@example.com"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": 25
}
```

---

### PUT /api/admin/labels/{id}

**Açıklama:** Mevcut label'ı günceller.
**Yazar tablosu:** `label.labels`, `admin.write_audit_logs`

**Request:**
```json
{
  "key": "vegan_friendly",
  "isActive": true,
  "updatedBy": "admin@example.com"
}
```

**Response 204:** No Content

---

### POST /api/admin/labels/{id}/places/{placeId}

**Açıklama:** Label'ı mekâna atar (ağırlık ile).
**Yazar tablosu:** `label.place_labels`, `admin.write_audit_logs`

**Request:**
```json
{
  "weight": 0.85,
  "createdBy": "admin@example.com"
}
```

**Response 204:** No Content

---

### POST /api/admin/places

**Açıklama:** Admin tarafından yeni mekân oluşturur (çeviri desteği ile).
**Yazar tablosu:** `place.places`, `place.place_translations`, `admin.write_audit_logs`

**Request:**
```json
{
  "countryId": 1,
  "cityId": 34,
  "districtId": 1,
  "latitude": 41.015137,
  "longitude": 28.979530,
  "googlePlaceId": "ChIJ...",
  "parkingStatus": "available",
  "translations": [
    { "languageId": 1, "name": "Karaköy Lokantası", "slug": "karakoy-lokantasi" },
    { "languageId": 2, "name": "Karakoy Restaurant", "slug": "karakoy-restaurant" }
  ],
  "createdBy": "admin@example.com"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

---

### PUT /api/admin/places/{id}

**Açıklama:** Mevcut mekânı günceller.
**Yazar tablosu:** `place.places`, `admin.write_audit_logs`

**Request:**
```json
{
  "countryId": 1,
  "cityId": 34,
  "districtId": 2,
  "latitude": 41.016,
  "longitude": 28.980,
  "googlePlaceId": "ChIJ...",
  "parkingStatus": "unavailable",
  "rating": 4.7,
  "updatedBy": "admin@example.com"
}
```

**Response 204:** No Content

---

### DELETE /api/admin/places/{id}?deletedBy=admin@example.com

**Açıklama:** Mekânı soft-delete ile siler.
**Yazar tablosu:** `place.places` (is_deleted=true, deleted_at, deleted_by), `admin.write_audit_logs`

**Response 204:** No Content

---

### GET /api/admin/config

**Açıklama:** Tüm runtime config ve feature flag değerlerini döner.
**Yazar tablosu:** — (sadece okuma, `admin.runtime_configs`, `admin.feature_flags`)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "configs": [
      { "key": "feed.maxPageSize", "value": "50", "currentVersion": 3, "updatedAt": "2026-03-20T10:00:00Z" }
    ],
    "flags": [
      { "key": "feature.personalized_feed", "isEnabled": true, "rolloutPercentage": 100, "target": null, "updatedAt": "2026-03-18T08:00:00Z" }
    ]
  }
}
```

---

### PUT /api/admin/config/runtime/{key}

**Açıklama:** Runtime config değerini oluşturur veya günceller.
`requiresApproval=true` ise değer hemen uygulanmaz, onay kuyruğuna alınır.
**Yazar tablosu:** `admin.runtime_configs`, `admin.runtime_config_versions`, `admin.config_audit_logs`
(requiresApproval=true ise: `admin.pending_config_changes`)

**Request:**
```json
{
  "value": "150",
  "changedBy": "ops@example.com",
  "changeReason": "Yoğun trafik için kapasite artırımı",
  "requiresApproval": false
}
```

**Response 200 (requiresApproval=false):**
```json
{
  "success": true,
  "data": { "key": "feed.maxPageSize", "version": 4 }
}
```

**Response 202 (requiresApproval=true):**
```json
{
  "success": true,
  "data": { "pendingId": "9abc...", "key": "feed.maxPageSize", "requestedValue": "150", "requestedBy": "ops@example.com" }
}
```

---

### GET /api/admin/config/versions/{key}

**Açıklama:** Bir config anahtarının tüm versiyon geçmişini döner (yeniden eskiye).
**Yazar tablosu:** — (sadece okuma, `admin.runtime_config_versions`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "version": 4, "value": "150", "changedBy": "ops@example.com", "changeReason": "...", "createdAt": "..." },
    { "version": 3, "value": "100", "changedBy": "admin@example.com", "changeReason": "...", "createdAt": "..." }
  ]
}
```

---

### POST /api/admin/config/rollback/{key}/{version}

**Açıklama:** Config anahtarını belirtilen versiyona geri alır.
**Yazar tablosu:** `admin.runtime_configs`, `admin.runtime_config_versions`, `admin.config_audit_logs`

**Request:**
```json
{
  "rolledBackBy": "ops@example.com",
  "changeReason": "v4 sonrası latency spike"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { "key": "feed.maxPageSize", "restoredFromVersion": 3, "newVersion": 5 }
}
```

---

### GET /api/admin/config/audit?key=feed.maxPageSize&page=1&pageSize=50

**Açıklama:** Config değişiklik audit logunu döner.
**Yazar tablosu:** — (sadece okuma, `admin.config_audit_logs`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "key": "feed.maxPageSize",
      "changedBy": "ops@example.com",
      "oldValue": "100",
      "newValue": "150",
      "changeReason": "...",
      "occurredAt": "2026-03-20T10:00:00Z"
    }
  ]
}
```

---

### PUT /api/admin/config/flags/{key}

**Açıklama:** Feature flag oluşturur veya günceller (hedefleme desteği ile).
**Yazar tablosu:** `admin.feature_flags`, `admin.config_audit_logs`

**Request:**
```json
{
  "isEnabled": true,
  "rolloutPercentage": 10,
  "target": "{\"userIds\":[],\"countries\":[\"TR\"],\"platform\":[\"ios\"]}",
  "changedBy": "pm@example.com",
  "changeReason": "iOS beta test başlatıldı"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": "feature.new_ui"
}
```

---

### GET /api/admin/config/pending?key=feed.maxPageSize&status=Pending&page=1&pageSize=50

**Açıklama:** Onay bekleyen config değişikliklerini listeler.
**Yazar tablosu:** — (sadece okuma, `admin.pending_config_changes`)

---

### POST /api/admin/config/pending/{id}/approve

**Açıklama:** Bekleyen config değişikliğini onaylar ve hemen uygular.
**Auth:** Bearer + Rol: **yalnızca `SuperAdmin`**
**Yazar tablosu:** `admin.pending_config_changes` (status→Approved), `admin.runtime_configs`, `admin.runtime_config_versions`, `admin.config_audit_logs`

**Request:**
```json
{
  "reviewedBy": "superadmin@example.com",
  "reviewReason": "Staging'de doğrulandı"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { "pendingId": "9abc...", "key": "feed.maxPageSize", "newVersion": 5 }
}
```

---

### POST /api/admin/config/pending/{id}/reject

**Açıklama:** Bekleyen config değişikliğini reddeder. `reviewReason` zorunludur.
**Auth:** Bearer + Rol: **yalnızca `SuperAdmin`**
**Yazar tablosu:** `admin.pending_config_changes` (status→Rejected)

**Request:**
```json
{
  "reviewedBy": "superadmin@example.com",
  "reviewReason": "Değer güvenli aralık dışında"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { "pendingId": "9abc...", "key": "feed.maxPageSize", "rejectedBy": "superadmin@example.com" }
}
```

---

## 10. Veritabanı Şema Özeti

| Schema       | Tablo(lar)                                                                                                         | Sahip Servis        |
|--------------|--------------------------------------------------------------------------------------------------------------------|---------------------|
| `identity`   | `users`, `refresh_tokens`, `profiles`                                                                              | Identity Service    |
| `geo`        | `languages`, `countries`, `country_translations`, `cities`, `city_translations`, `districts`, `district_translations` | Geo Service      |
| `label`      | `label_categories`, `label_category_translations`, `labels`, `label_translations`, `label_keywords`, `place_labels` | Label Service      |
| `place`      | `places`, `place_translations`, `place_scores`                                                                     | Place Service       |
| `content`    | `posts`, `post_media`, `post_likes`, `post_comments`, `user_events`, `user_interests`, `trending_scores`           | Content Service     |
| `social`     | `user_follows`                                                                                                     | Social Graph Service|
| `search`     | *(Elasticsearch / read-model — EF migration yok)*                                                                  | Search Service      |
| `admin`      | `moderation_items`, `audit_logs`, `import_jobs`, `runtime_configs`, `feature_flags`, `runtime_config_versions`, `config_audit_logs`, `pending_config_changes`, `write_audit_logs` | Admin Service |

> Feed Service ve Search Service yalnızca okuma yapan cross-schema context'ler kullanır; kendi şemalarına yazmaz.
