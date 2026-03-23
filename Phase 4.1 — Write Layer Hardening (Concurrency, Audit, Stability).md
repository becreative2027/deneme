\# 🚀 Phase 4.1 — Write Layer Hardening (Concurrency, Audit, Stability)



\## 🎯 Amaç



Bu fazın amacı:



\* write-side güvenliğini artırmak

\* concurrency problemlerini çözmek

\* veri bütünlüğünü garanti altına almak

\* admin işlemlerini izlenebilir hale getirmek

\* cache yönetimini merkezileştirmek



\---



\# 🧠 1. OPTIMISTIC CONCURRENCY



\## Tablolara ekle:



\* place.places

\* label.labels

\* geo.cities

\* geo.districts



```sql id="tqjv6p"

ALTER TABLE place.places ADD COLUMN IF NOT EXISTS row\_version BYTEA;

ALTER TABLE label.labels ADD COLUMN IF NOT EXISTS row\_version BYTEA;

ALTER TABLE geo.cities ADD COLUMN IF NOT EXISTS row\_version BYTEA;

ALTER TABLE geo.districts ADD COLUMN IF NOT EXISTS row\_version BYTEA;

```



\---



\## EF Core mapping:



```csharp id="j6ewcz"

builder.Property(x => x.RowVersion)

&#x20;   .IsRowVersion();

```



\---



\## Handler davranışı:



\* update sırasında row\_version kontrol edilir

\* mismatch → conflict error döndür



\---



\# 🧩 2. GLOBAL SOFT DELETE FILTER



\## EF Core:



```csharp id="pdbn7a"

modelBuilder.Entity<Place>()

&#x20;   .HasQueryFilter(x => !x.IsDeleted);



modelBuilder.Entity<Label>()

&#x20;   .HasQueryFilter(x => !x.IsDeleted);

```



\---



\## Amaç:



\* silinmiş verinin yanlışlıkla dönmesini engellemek



\---



\# ⚡ 3. CACHE INVALIDATION SERVICE



\## Interface oluştur:



```csharp id="9v96er"

public interface ICacheInvalidationService

{

&#x20;   void InvalidatePlace(Guid placeId);

&#x20;   void InvalidateFilters(int languageId);

}

```



\---



\## Implementation:



\* IMemoryCache kullan

\* key pattern:



&#x20; \* place\_detail\_{id}

&#x20; \* place\_filters\_{langId}



\---



\## Kullanım:



Handler içinde:



```csharp id="k7h7fd"

\_cacheInvalidationService.InvalidatePlace(placeId);

```



\---



\# 📜 4. ADMIN AUDIT LOGS



\## Yeni schema:



```sql id="0h11z5"

CREATE SCHEMA IF NOT EXISTS admin;

```



\---



\## Table:



```sql id="uy2k3o"

CREATE TABLE admin.audit\_logs (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   user\_id UUID,

&#x20;   action TEXT,

&#x20;   entity\_type TEXT,

&#x20;   entity\_id TEXT,

&#x20;   payload JSONB,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\## Kullanım:



Her write işleminde:



\* action: CREATE / UPDATE / DELETE

\* entity\_type: Place / Label / City

\* payload: değişen data



\---



\# 🧪 5. VALIDATION HARDENING



\## Place validation:



\* latitude → -90 / 90

\* longitude → -180 / 180

\* rating → 0–5



\---



\## Label validation:



\* weight → 0–1



\---



\## Slug normalization:



\* lowercase

\* replace spaces with '-'



\---



\# 🔁 6. IDEMPOTENCY



\## CreatePlaceCommand



Kural:



\* aynı google\_place\_id varsa:



&#x20; \* yeni kayıt oluşturma

&#x20; \* mevcut kaydı döndür



\---



\## Handler:



```csharp id="x00hpa"

var existing = await \_db.Places

&#x20;   .FirstOrDefaultAsync(x => x.GooglePlaceId == request.GooglePlaceId);



if (existing != null)

&#x20;   return existing;

```



\---



\# 🔐 7. SECURITY HARDENING



\* Admin endpointler authorize edilmiş olmalı

\* input sanitize edilmeli

\* invalid data reject edilmeli



\---



\# 📊 8. LOGGING IMPROVEMENT



Her write işleminde:



\* userId

\* entityId

\* action

\* execution time



\---



\# 🧠 9. TRANSACTION SAFETY



```csharp id="xtfr6g"

using var tx = await \_dbContext.Database.BeginTransactionAsync();

```



\* tüm write işlemleri atomik olmalı



\---



\# ✅ ACCEPTANCE CRITERIA



\* concurrency conflict yakalanmalı

\* soft delete global çalışmalı

\* audit logs oluşmalı

\* cache invalidation merkezi olmalı

\* duplicate place oluşmamalı

\* validation doğru çalışmalı



\---



\# 🚀 RESULT



Bu fazdan sonra:



\* sistem race-condition resistant olur

\* veri kaybı riski azalır

\* admin işlemleri izlenebilir olur

\* cache yönetimi temiz hale gelir



\---



\# 🔜 NEXT



Phase 5 — Social System



\---



