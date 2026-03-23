\# 🚀 Phase 3.2 — Query Correctness \& Performance Hardening



\## 🎯 Amaç



Bu fazın amacı:



\* search sonuçlarının doğruluğunu garanti etmek

\* performansı optimize etmek

\* ranking sistemini devreye almak

\* API’yi production seviyesine taşımak



\---



\# 🧠 1. ALL MATCH BUG FIX (CRITICAL)



\## Problem



```sql

HAVING COUNT(\*) = @labelCount

```



❌ duplicate label durumunda yanlış sonuç döner



\---



\## Çözüm



```sql

HAVING COUNT(DISTINCT label\_id) = @labelCount

```



\---



\## Güncelle



SearchPlacesQueryHandler içinde ALL logic değiştirilmeli



\---



\# 📊 2. FINAL SCORE SORTING



\## Ekle:



```sql

ORDER BY ps.final\_score DESC

```



\---



\## Fallback:



```sql

ORDER BY p.rating DESC

```



\---



\## Güncelle



\* Search query sonunda sorting eklenmeli



\---



\# ⚡ 3. SUBQUERY → JOIN OPTIMIZATION



\## Eski:



```sql

WHERE place\_id IN (

&#x20; SELECT place\_id FROM label.place\_labels ...

)

```



\---



\## Yeni:



```sql

JOIN label.place\_labels pl ON p.id = pl.place\_id

```



\---



\## Amaç



\* execution plan iyileştirme

\* index kullanımını artırma



\---



\# 🧩 4. COUNT QUERY AYRIMI



\## Şu an



\* totalCount ve data aynı query olabilir



\---



\## Yeni yaklaşım



\* COUNT ayrı query

\* DATA ayrı query



\---



\## Örnek:



```sql

SELECT COUNT(DISTINCT p.id)

FROM ...

```



\---



\# 🧠 5. FILTER CACHE



\## Endpoint:



GET /api/filters



\---



\## Ekle:



\* MemoryCache

\* TTL: 5 dakika



\---



\## Amaç:



\* gereksiz DB çağrısını azaltmak



\---



\# 📜 6. LOGGING UPGRADE



\## Şu an:



\* total time var



\---



\## Ekle:



\* DB query time

\* mapping time

\* total time



\---



\## Örnek:



```csharp

\_logger.LogInformation("Query: {queryTime} ms, Mapping: {mapTime} ms, Total: {total} ms");

```



\---



\# 🔍 7. INDEX USAGE VALIDATION



Claude:



\* execution plan incelemeli



\* aşağıdaki indexlerin kullanıldığını doğrulamalı:



\* idx\_place\_labels\_place\_id



\* idx\_place\_labels\_label\_id



\* idx\_place\_translations\_lang



\---



\# 🧪 8. RESPONSE VALIDATION



\* ANY doğru çalışmalı

\* ALL doğru çalışmalı

\* sorting doğru çalışmalı

\* pagination doğru çalışmalı



\---



\# ✅ ACCEPTANCE CRITERIA



\* ALL logic hatasız

\* sonuçlar doğru sıralı

\* response hızlı

\* filter endpoint cache’li

\* query optimize



\---



\# 🚀 RESULT



Bu fazdan sonra:



\* search engine production-ready olur

\* performans stabil olur

\* veri doğruluğu garanti edilir



\---



