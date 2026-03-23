\# 🚀 Phase 5 — Social System (Users, Posts, Follow, Interactions)



\## 🎯 Amaç



Bu fazın amacı:



\* kullanıcı sistemi kurmak

\* sosyal graph oluşturmak (follow)

\* place bağlı içerik üretmek

\* etkileşim mekanizmalarını eklemek

\* platformu “canlı” hale getirmek



\---



\# 🧠 1. SCHEMA PLAN



\## identity schema



\* users

\* profiles



\## social schema



\* user\_follows



\## content schema



\* posts

\* post\_media

\* post\_likes

\* post\_comments



\---



\# 👤 2. USERS (IDENTITY)



```sql id="u1n6yf"

CREATE TABLE identity.users (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   email TEXT UNIQUE NOT NULL,

&#x20;   username TEXT UNIQUE NOT NULL,

&#x20;   password\_hash TEXT NOT NULL,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\# 🧑‍💼 3. PROFILES



```sql id="x6w6xv"

CREATE TABLE identity.profiles (

&#x20;   user\_id UUID PRIMARY KEY REFERENCES identity.users(id),

&#x20;   display\_name TEXT,

&#x20;   bio TEXT,

&#x20;   profile\_image\_url TEXT,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\# 🤝 4. FOLLOW SYSTEM



```sql id="a5o0lp"

CREATE SCHEMA IF NOT EXISTS social;



CREATE TABLE social.user\_follows (

&#x20;   follower\_id UUID REFERENCES identity.users(id),

&#x20;   following\_id UUID REFERENCES identity.users(id),

&#x20;   created\_at TIMESTAMP DEFAULT NOW(),

&#x20;   PRIMARY KEY (follower\_id, following\_id)

);

```



\---



\# 📝 5. POSTS (PLACE-TAGGED)



```sql id="n3m5mf"

CREATE SCHEMA IF NOT EXISTS content;



CREATE TABLE content.posts (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   user\_id UUID REFERENCES identity.users(id),

&#x20;   place\_id UUID REFERENCES place.places(id),



&#x20;   caption TEXT,

&#x20;   created\_at TIMESTAMP DEFAULT NOW(),



&#x20;   like\_count INT DEFAULT 0,

&#x20;   comment\_count INT DEFAULT 0,



&#x20;   is\_deleted BOOLEAN DEFAULT FALSE

);

```



\---



\## 🚨 KURAL



👉 Her post \*\*zorunlu olarak place\_id içermeli\*\*



\---



\# 🖼 6. POST MEDIA



```sql id="l5a9a7"

CREATE TABLE content.post\_media (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   post\_id UUID REFERENCES content.posts(id) ON DELETE CASCADE,

&#x20;   url TEXT NOT NULL,

&#x20;   type TEXT,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\# ❤️ 7. POST LIKES



```sql id="v0i8lw"

CREATE TABLE content.post\_likes (

&#x20;   user\_id UUID REFERENCES identity.users(id),

&#x20;   post\_id UUID REFERENCES content.posts(id),

&#x20;   created\_at TIMESTAMP DEFAULT NOW(),

&#x20;   PRIMARY KEY (user\_id, post\_id)

);

```



\---



\# 💬 8. POST COMMENTS



```sql id="e7o8l3"

CREATE TABLE content.post\_comments (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   post\_id UUID REFERENCES content.posts(id),

&#x20;   user\_id UUID REFERENCES identity.users(id),

&#x20;   text TEXT NOT NULL,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\# ⚙️ 9. CQRS COMMANDS



\## Users



\* RegisterUserCommand

\* UpdateProfileCommand



\---



\## Social



\* FollowUserCommand

\* UnfollowUserCommand



\---



\## Content



\* CreatePostCommand

\* AddPostMediaCommand

\* LikePostCommand

\* CommentPostCommand



\---



\# 📡 10. API ENDPOINTS



\## Auth / User



POST /api/users/register

PUT /api/users/profile



\---



\## Social



POST /api/social/follow

POST /api/social/unfollow



\---



\## Content



POST /api/posts

POST /api/posts/{id}/like

POST /api/posts/{id}/comment



\---



\# 🔍 11. VALIDATION



\* post place\_id zorunlu

\* caption max length

\* duplicate like engelle

\* self-follow engelle



\---



\# 📊 12. INDEXES



```sql id="yo6mxy"

CREATE INDEX idx\_posts\_user ON content.posts(user\_id);

CREATE INDEX idx\_posts\_place ON content.posts(place\_id);

CREATE INDEX idx\_follows\_following ON social.user\_follows(following\_id);

```



\---



\# 🔐 13. SECURITY



\* user\_id auth token’dan alınmalı

\* client’tan gelen user\_id kabul edilmemeli



\---



\# 🧠 14. FUTURE HOOK



Bu yapı:



\* feed system (faz 6)

\* recommendation

\* influencer system



için temel oluşturur



\---



\# ✅ ACCEPTANCE CRITERIA



\* user register çalışmalı

\* follow/unfollow çalışmalı

\* post oluşturulmalı (place zorunlu)

\* like/comment çalışmalı

\* duplicate like engellenmeli



\---



\# 🚀 RESULT



Bu fazdan sonra:



\* kullanıcılar içerik üretir

\* içerik mekanlara bağlanır

\* sosyal etkileşim başlar



\---



\# 🔜 NEXT



Phase 6 — Feed System (Following + Nearby)



\---



