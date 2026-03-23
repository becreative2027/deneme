\# 🚀 Phase 6 — Feed System (Following, Nearby, Explore)



\## 🎯 Amaç



\* kullanıcıya içerik sunmak

\* sosyal etkileşimi artırmak

\* performanslı feed sistemi kurmak

\* mobil UI için hazır response üretmek



\---



\# 🧠 1. FEED TYPES



\## 1. Following Feed



\* kullanıcının takip ettiği kişilerin postları



\---



\## 2. Nearby Feed



\* kullanıcının bulunduğu şehirdeki postlar



\---



\## 3. Place Feed



\* belirli bir mekana ait postlar



\---



\# 📡 2. ENDPOINTS



\## Following Feed



GET /api/feed/following



\---



\## Nearby Feed



GET /api/feed/nearby?cityId=1



\---



\## Place Feed



GET /api/feed/place/{placeId}



\---



\# 🧩 3. QUERY LOGIC



\## Following Feed



```sql id="fd1j3q"

SELECT p.\*

FROM content.posts p

JOIN social.user\_follows f ON p.user\_id = f.following\_id

WHERE f.follower\_id = @userId

ORDER BY p.created\_at DESC

LIMIT @pageSize OFFSET @offset;

```



\---



\## Nearby Feed



```sql id="k2l9ds"

SELECT p.\*

FROM content.posts p

JOIN place.places pl ON p.place\_id = pl.id

WHERE pl.city\_id = @cityId

ORDER BY p.created\_at DESC

LIMIT @pageSize OFFSET @offset;

```



\---



\## Place Feed



```sql id="d2k8sd"

SELECT p.\*

FROM content.posts p

WHERE p.place\_id = @placeId

ORDER BY p.created\_at DESC

LIMIT @pageSize OFFSET @offset;

```



\---



\# ⚡ 4. FEED RANKING (BASIC)



\## Ranking score:



```text id="r7n2fd"

score = (like\_count \* 2) + (comment\_count \* 3) + recency\_factor

```



\---



\## Recency:



\* son 24 saat → yüksek

\* eski → düşük



\---



\## SQL örnek:



```sql id="c3l9fd"

ORDER BY 

&#x20; (p.like\_count \* 2 + p.comment\_count \* 3) DESC,

&#x20; p.created\_at DESC

```



\---



\# 📊 5. RESPONSE MODEL



```json id="l9f3ds"

{

&#x20; "posts": \[

&#x20;   {

&#x20;     "id": "...",

&#x20;     "user": {

&#x20;       "id": "...",

&#x20;       "username": "john"

&#x20;     },

&#x20;     "place": {

&#x20;       "id": "...",

&#x20;       "name": "Cafe X"

&#x20;     },

&#x20;     "caption": "...",

&#x20;     "media": \["url1", "url2"],

&#x20;     "likeCount": 12,

&#x20;     "commentCount": 3,

&#x20;     "createdAt": "...",

&#x20;     "isLiked": true

&#x20;   }

&#x20; ],

&#x20; "page": 1,

&#x20; "pageSize": 10

}

```



\---



\# 🧠 6. JOIN STRATEGY



\* users join (username)

\* place join (name)

\* media join

\* likes check (isLiked)



\---



\# 🔍 7. PERFORMANCE RULES



\* SELECT \* yasak

\* projection kullan

\* index kullanımı zorunlu

\* N+1 query yok



\---



\# 📜 8. INDEXES



```sql id="a7k2d1"

CREATE INDEX idx\_posts\_user\_created ON content.posts(user\_id, created\_at DESC);

CREATE INDEX idx\_posts\_place\_created ON content.posts(place\_id, created\_at DESC);

CREATE INDEX idx\_posts\_created ON content.posts(created\_at DESC);

```



\---



\# 🔁 9. PAGINATION



\* page + pageSize (şimdilik)

\* future: cursor pagination



\---



\# 🧪 10. VALIDATION



\* userId auth’tan alınmalı

\* cityId valid olmalı

\* placeId valid olmalı



\---



\# 🔐 11. SECURITY



\* user spoofing yok

\* private user (future)



\---



\# ✅ ACCEPTANCE CRITERIA



\* following feed doğru çalışmalı

\* nearby feed doğru çalışmalı

\* place feed doğru çalışmalı

\* ranking çalışmalı

\* response hızlı olmalı



\---



\# 🚀 RESULT



Bu fazdan sonra:



\* kullanıcılar içerik tüketir

\* platform “yaşar”

\* engagement başlar



\---



\# 🔜 NEXT



Phase 7 — AI \& Recommendation



\---



