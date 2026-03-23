\# 🚀 Phase 5.1 — Social System Hardening (Consistency, Moderation, Performance)



\## 🎯 Amaç



Bu fazın amacı:



\* like/comment counter consistency sağlamak

\* content moderation altyapısı kurmak

\* authorization ve güvenliği artırmak

\* index ve performansı iyileştirmek

\* veri kalitesini yükseltmek



\---



\# 🧠 1. COUNTER CONSISTENCY



\## Problem



\* like\_count ve comment\_count out-of-sync olabilir



\---



\## Çözüm



\### Like sırasında:



```csharp id="lq1u4e"

post.LikeCount += 1;

```



\---



\### Unlike (yeni command ekle):



```csharp id="mkgc2p"

post.LikeCount = Math.Max(0, post.LikeCount - 1);

```



\---



\### Comment:



```csharp id="kzt4y9"

post.CommentCount += 1;

```



\---



\## Kural



\* transaction içinde yapılmalı

\* duplicate like artmamalı



\---



\# 🔁 2. UNLIKE COMMAND EKLE



\## Command:



\* UnlikePostCommand



\## Endpoint:



POST /api/posts/{id}/unlike



\---



\# 🧩 3. GLOBAL SOFT DELETE (CONTENT)



\## posts için:



```csharp id="1l1s2a"

modelBuilder.Entity<Post>()

&#x20;   .HasQueryFilter(p => !p.IsDeleted);

```



\---



\## Amaç:



\* silinen içerik feed’de görünmez



\---



\# ⚠️ 4. CONTENT MODERATION



\## posts tablosuna ekle:



```sql id="tq0r27"

ALTER TABLE content.posts ADD COLUMN status TEXT DEFAULT 'active';

ALTER TABLE content.posts ADD COLUMN hidden\_reason TEXT;

ALTER TABLE content.posts ADD COLUMN moderated\_at TIMESTAMP;

```



\---



\## Status değerleri:



\* active

\* hidden

\* flagged



\---



\## Admin command:



\* ModeratePostCommand



\---



\## Endpoint:



POST /admin/posts/{id}/moderate



\---



\# 🔐 5. AUTHORIZATION HARDENING



\## Kurallar:



\* post update/delete → sadece owner

\* moderation → admin/moderator



\---



\## Controller check:



```csharp id="2n2q9b"

if (post.UserId != currentUserId)

&#x20;   return Unauthorized();

```



\---



\# 📊 6. INDEX OPTIMIZATION



```sql id="a9oyl4"

CREATE INDEX idx\_posts\_created\_at ON content.posts(created\_at DESC);

CREATE INDEX idx\_comments\_post ON content.post\_comments(post\_id, created\_at DESC);

CREATE INDEX idx\_likes\_post ON content.post\_likes(post\_id);

```



\---



\# 🧠 7. PROFILE VALIDATION



\## Kurallar:



\* display\_name max 100

\* bio max 500

\* username normalize (lowercase)



\---



\# 🔍 8. DATA CLEANUP (OPTIONAL)



\* orphan post\_media kontrolü

\* orphan likes kontrolü



\---



\# 📜 9. LOGGING



\* like/unlike log

\* moderation log

\* delete log



\---



\# 🧪 10. VALIDATION



\* duplicate like yok

\* self-like (opsiyonel)

\* empty comment yok



\---



\# ✅ ACCEPTANCE CRITERIA



\* like/unlike doğru çalışmalı

\* counters doğru artmalı/azalmalı

\* silinen post görünmemeli

\* moderation çalışmalı

\* indexler aktif olmalı



\---



\# 🚀 RESULT



Bu fazdan sonra:



\* veri tutarlılığı garanti edilir

\* platform güvenli hale gelir

\* performans stabil olur



\---



\# 🔜 NEXT



Phase 6 — Feed System



\---



