\# 🚀 Phase 4 — Admin \& Write Layer (CRUD, Auth, Moderation)



\## 🎯 Amaç



\* Write-side (komutlar) ile veri yönetimini kurmak

\* Admin paneli için API’leri sağlamak

\* Yetkilendirme, audit, soft delete ve concurrency ile güvenli veri yönetimi sağlamak



\---



\# 🧠 1) WRITE-SIDE PRENSİPLERİ



\* Ayrı \*\*write DbContext\*\* (tracking açık) kullanılacak

\* Tüm write işlemleri \*\*transaction\*\* içinde çalışacak

\* Read tarafına dokunulmayacak

\* \*\*Cache invalidation\*\* write sonrası tetiklenecek



\---



\# 🔐 2) AUTH \& ROLE



\## Roller



\* admin

\* moderator

\* user



\## Gereksinimler



\* JWT authentication (Identity Service ile entegre)

\* Policy/Role-based authorization

\* Admin endpointleri `\[Authorize(Roles="admin,moderator")]`



\---



\# 🧩 3) AUDIT \& SOFT DELETE



\## Tüm mutable tablolara ekle:



\* created\_at (default now)

\* updated\_at

\* created\_by (user id)

\* updated\_by

\* is\_deleted (bool, default false)

\* deleted\_at (nullable)



\## Kural:



\* Delete = soft delete

\* Read query’leri `is\_deleted = false` filtrelemeli (write tarafı da dahil)



\---



\# ⚙️ 4) OPTIMISTIC CONCURRENCY



\## Eklenmesi gereken alan:



\* row\_version (byte\[] / xmin veya explicit column)



EF Core:



\* `.IsRowVersion()`



\## Amaç:



\* concurrent update çakışmalarını engellemek



\---



\# 🏢 5) PLACE COMMANDS



\## CreatePlaceCommand



Alanlar:



\* name (per language)

\* geo (country\_id, city\_id, district\_id)

\* lat/lng

\* google\_place\_id (opsiyonel)

\* parking\_status



\## İşlemler:



\* place insert

\* translations insert

\* default score create

\* audit alanları set



\---



\## UpdatePlaceCommand



\* alan güncelle

\* translation update

\* updated\_at/by set

\* concurrency check



\---



\## DeletePlaceCommand



\* is\_deleted = true

\* deleted\_at set



\---



\# 🏷 6) LABEL COMMANDS



\## CreateLabelCommand



\* category\_id

\* key

\* translations



\## UpdateLabelCommand



\* active/inactive

\* translation update



\---



\## AssignLabelToPlaceCommand



\* place\_id

\* label\_id

\* weight



\---



\# 🌍 7) GEO COMMANDS



\## CreateCityCommand



\## CreateDistrictCommand



\## UpdateTranslationCommand



\* slug uniqueness korunmalı

\* duplicate kontrolü yapılmalı



\---



\# 📡 8) ADMIN ENDPOINTS



\## Place



POST   /admin/places

PUT    /admin/places/{id}

DELETE /admin/places/{id}



\---



\## Label



POST   /admin/labels

PUT    /admin/labels/{id}



POST   /admin/place-labels



\---



\## Geo



POST   /admin/cities

POST   /admin/districts



\---



\## Moderation



GET    /admin/moderation/places

POST   /admin/moderation/approve



\---



\# 🧪 9) VALIDATION



FluentValidation:



\* required alanlar

\* rating range (0–5)

\* lat/lng valid

\* label duplicate engeli



\---



\# 📦 10) CACHE INVALIDATION



Write sonrası:



\* filters cache temizle

\* place detail cache temizle



Örnek:



```csharp

\_cache.Remove($"place\_filters\_{langId}");

\_cache.Remove($"place\_detail\_{placeId}");

```



\---



\# 📜 11) LOGGING



Her write için:



\* dbTime

\* validation time

\* total time



\---



\# 🧠 12) TRANSACTION



```csharp

using var tx = await \_dbContext.Database.BeginTransactionAsync();

```



\* tüm write’lar atomik olmalı

\* hata → rollback



\---



\# 🔍 13) SECURITY



\* Admin endpointler protected

\* input sanitize

\* SQL injection yok (EF parametreli)



\---



\# ✅ ACCEPTANCE CRITERIA



\* Admin CRUD çalışmalı

\* Auth + role kontrolü aktif

\* Soft delete uygulanmalı

\* Concurrency conflict yakalanmalı

\* Cache invalidation çalışmalı

\* Transaction güvenli



\---



\# 🚀 RESULT



Bu fazdan sonra:



\* sistem yönetilebilir olur

\* admin panel bağlanabilir

\* veri kalitesi korunur



\---



\# 🔜 NEXT



Phase 5 → Social System (Users, Posts, Follow, Feed başlangıcı)



