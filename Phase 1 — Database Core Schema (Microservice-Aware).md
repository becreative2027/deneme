\# 🚀 Phase 1 — Database Core Schema (Microservice-Aware)



\## 🎯 Amaç



Bu fazın amacı:



\* Tüm sistemin veritabanı mimarisini kurmak

\* Mikroservis bazlı schema ayrımı yapmak

\* Localization destekli veri yapısını oluşturmak

\* Geo + Place + Label çekirdeğini kurmak

\* Future-proof bir veri modeli oluşturmak



\---



\# 🧠 1. Database Stratejisi



\## Kullanılacak DB:



\* PostgreSQL



\## Yaklaşım:



👉 \*\*Single PostgreSQL instance + schema per service\*\*



\---



\## Schema Dağılımı



| Service          | Schema   |

| ---------------- | -------- |

| Identity         | identity |

| Geo              | geo      |

| Place            | place    |

| Label            | label    |

| Content (future) | content  |



\---



\# ⚙️ 2. Extensions



```sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

```



\---



\# 🌐 3. LANGUAGE (shared)



👉 Tüm sistem kullanır (geo schema içinde tutulacak)



```sql

CREATE SCHEMA IF NOT EXISTS geo;



CREATE TABLE geo.languages (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   code TEXT NOT NULL UNIQUE,

&#x20;   name TEXT NOT NULL,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\# 🌍 4. GEO SERVICE



\## COUNTRIES



```sql

CREATE TABLE geo.countries (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   code TEXT NOT NULL UNIQUE,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\## COUNTRY TRANSLATIONS



```sql

CREATE TABLE geo.country\_translations (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   country\_id INT REFERENCES geo.countries(id) ON DELETE CASCADE,

&#x20;   language\_id INT REFERENCES geo.languages(id),

&#x20;   name TEXT NOT NULL,

&#x20;   slug TEXT,

&#x20;   UNIQUE(country\_id, language\_id)

);

```



\---



\## CITIES



```sql

CREATE TABLE geo.cities (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   country\_id INT REFERENCES geo.countries(id) ON DELETE CASCADE,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\## CITY TRANSLATIONS



```sql

CREATE TABLE geo.city\_translations (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   city\_id INT REFERENCES geo.cities(id) ON DELETE CASCADE,

&#x20;   language\_id INT REFERENCES geo.languages(id),

&#x20;   name TEXT NOT NULL,

&#x20;   slug TEXT,

&#x20;   UNIQUE(city\_id, language\_id)

);

```



\---



\## DISTRICTS



```sql

CREATE TABLE geo.districts (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   city\_id INT REFERENCES geo.cities(id) ON DELETE CASCADE,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\## DISTRICT TRANSLATIONS



```sql

CREATE TABLE geo.district\_translations (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   district\_id INT REFERENCES geo.districts(id) ON DELETE CASCADE,

&#x20;   language\_id INT REFERENCES geo.languages(id),

&#x20;   name TEXT NOT NULL,

&#x20;   slug TEXT,

&#x20;   UNIQUE(district\_id, language\_id)

);

```



\---



\# 🏢 5. PLACE SERVICE



```sql

CREATE SCHEMA IF NOT EXISTS place;

```



\---



\## PLACES



```sql

CREATE TABLE place.places (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   google\_place\_id TEXT UNIQUE,



&#x20;   country\_id INT,

&#x20;   city\_id INT,

&#x20;   district\_id INT,



&#x20;   latitude DOUBLE PRECISION,

&#x20;   longitude DOUBLE PRECISION,



&#x20;   rating NUMERIC(2,1),

&#x20;   user\_ratings\_total INT,



&#x20;   parking\_status TEXT DEFAULT 'unavailable'

&#x20;       CHECK (parking\_status IN ('available', 'unavailable', 'limited')),



&#x20;   source TEXT,

&#x20;   source\_last\_synced\_at TIMESTAMP,



&#x20;   is\_deleted BOOLEAN DEFAULT FALSE,

&#x20;   created\_at TIMESTAMP DEFAULT NOW(),

&#x20;   updated\_at TIMESTAMP

);

```



\---



\## PLACE TRANSLATIONS



```sql

CREATE TABLE place.place\_translations (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   place\_id UUID REFERENCES place.places(id) ON DELETE CASCADE,

&#x20;   language\_id INT REFERENCES geo.languages(id),

&#x20;   name TEXT NOT NULL,

&#x20;   slug TEXT,

&#x20;   UNIQUE(place\_id, language\_id)

);

```



\---



\# 🏷 6. LABEL SERVICE



```sql

CREATE SCHEMA IF NOT EXISTS label;

```



\---



\## LABEL CATEGORIES



```sql

CREATE TABLE label.label\_categories (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   key TEXT NOT NULL UNIQUE,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\## CATEGORY TRANSLATIONS



```sql

CREATE TABLE label.label\_category\_translations (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   category\_id INT REFERENCES label.label\_categories(id) ON DELETE CASCADE,

&#x20;   language\_id INT REFERENCES geo.languages(id),

&#x20;   display\_name TEXT NOT NULL,

&#x20;   UNIQUE(category\_id, language\_id)

);

```



\---



\## LABELS



```sql

CREATE TABLE label.labels (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   category\_id INT REFERENCES label.label\_categories(id),

&#x20;   key TEXT NOT NULL UNIQUE,

&#x20;   is\_active BOOLEAN DEFAULT TRUE,

&#x20;   created\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\## LABEL TRANSLATIONS



```sql

CREATE TABLE label.label\_translations (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   label\_id INT REFERENCES label.labels(id) ON DELETE CASCADE,

&#x20;   language\_id INT REFERENCES geo.languages(id),

&#x20;   display\_name TEXT NOT NULL,

&#x20;   UNIQUE(label\_id, language\_id)

);

```



\---



\## PLACE LABELS



```sql

CREATE TABLE label.place\_labels (

&#x20;   place\_id UUID REFERENCES place.places(id) ON DELETE CASCADE,

&#x20;   label\_id INT REFERENCES label.labels(id) ON DELETE CASCADE,

&#x20;   weight NUMERIC(3,2) DEFAULT 1.0,

&#x20;   created\_at TIMESTAMP DEFAULT NOW(),

&#x20;   PRIMARY KEY (place\_id, label\_id)

);

```



\---



\## LABEL KEYWORDS



```sql

CREATE TABLE label.label\_keywords (

&#x20;   id SERIAL PRIMARY KEY,

&#x20;   label\_id INT REFERENCES label.labels(id) ON DELETE CASCADE,

&#x20;   language\_id INT REFERENCES geo.languages(id),

&#x20;   keyword TEXT NOT NULL

);

```



\---



\# 📊 7. PLACE SCORES



```sql

CREATE TABLE place.place\_scores (

&#x20;   place\_id UUID PRIMARY KEY REFERENCES place.places(id) ON DELETE CASCADE,

&#x20;   popularity\_score NUMERIC(5,2),

&#x20;   quality\_score NUMERIC(5,2),

&#x20;   trend\_score NUMERIC(5,2),

&#x20;   updated\_at TIMESTAMP DEFAULT NOW()

);

```



\---



\# ⚡ 8. INDEXES



```sql

CREATE INDEX idx\_places\_geo ON place.places(country\_id, city\_id, district\_id);

CREATE INDEX idx\_places\_google ON place.places(google\_place\_id);



CREATE INDEX idx\_place\_labels\_label ON label.place\_labels(label\_id);

CREATE INDEX idx\_place\_labels\_place ON label.place\_labels(place\_id);



CREATE INDEX idx\_label\_translations\_lang ON label.label\_translations(language\_id);

CREATE INDEX idx\_place\_translations\_lang ON place.place\_translations(language\_id);

```



\---



\# 🧩 9. FUTURE SCHEMA PREPARATION



```sql

CREATE SCHEMA IF NOT EXISTS content;

CREATE SCHEMA IF NOT EXISTS identity;

```



\---



\# 🧪 10. SEED DATA (MINIMUM)



```sql

INSERT INTO geo.languages (code, name)

VALUES ('tr', 'Türkçe'), ('en', 'English');

```



\---



\# 📌 11. CLAUDE TASK LIST



Claude şu işlemleri yapmalı:



1\. PostgreSQL bağlantısı kur

2\. Tüm schema’ları oluştur

3\. Tabloları eksiksiz oluştur

4\. Constraint’leri ekle

5\. Index’leri ekle

6\. Seed data ekle

7\. Migration script üret

8\. Her service için DbContext hazırlığı yap

9\. Connection string config oluştur

10\. Local çalıştırma scripti hazırla



\---



\# ✅ ACCEPTANCE CRITERIA



Bu faz sonunda:



\* tüm tablolar oluşturulmuş olmalı

\* schema’lar doğru ayrılmış olmalı

\* migration çalışıyor olmalı

\* seed data eklenmiş olmalı

\* backend bu DB’ye bağlanabiliyor olmalı



\---



\# 🚀 NEXT



Bir sonraki faz:



👉 Phase 2 — Seed \& Reference Data



\---



