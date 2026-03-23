\# 🚀 Phase 2 — Seed \& Reference Data



\## 🎯 Amaç



Bu fazın amacı:



\* sistemi anlamlı veri ile doldurmak

\* localization sistemini aktif hale getirmek

\* label \& keyword sistemini kurmak

\* place dataset oluşturmak

\* search ve filtering için temel veri sağlamak



\---



\# 🌐 1. LANGUAGES



```sql

INSERT INTO geo.languages (code, name)

VALUES 

('tr', 'Türkçe'),

('en', 'English')

ON CONFLICT DO NOTHING;

```



\---



\# 🌍 2. COUNTRIES



```sql

INSERT INTO geo.countries (code)

VALUES ('TR')

ON CONFLICT DO NOTHING;

```



\---



\## COUNTRY TRANSLATIONS



```sql

INSERT INTO geo.country\_translations (country\_id, language\_id, name, slug)

VALUES 

(1, 1, 'Türkiye', 'turkiye'),

(1, 2, 'Turkey', 'turkey')

ON CONFLICT DO NOTHING;

```



\---



\# 🏙 3. CITIES



```sql

INSERT INTO geo.cities (country\_id)

VALUES (1);

```



\---



\## CITY TRANSLATIONS



```sql

INSERT INTO geo.city\_translations (city\_id, language\_id, name, slug)

VALUES 

(1, 1, 'İstanbul', 'istanbul'),

(1, 2, 'Istanbul', 'istanbul');

```



\---



\# 🏘 4. DISTRICTS



```sql

INSERT INTO geo.districts (city\_id)

VALUES (1), (1), (1);

```



\---



\## DISTRICT TRANSLATIONS



```sql

INSERT INTO geo.district\_translations (district\_id, language\_id, name, slug)

VALUES 

(1, 1, 'Kadıköy', 'kadikoy'),

(1, 2, 'Kadikoy', 'kadikoy'),



(2, 1, 'Beşiktaş', 'besiktas'),

(2, 2, 'Besiktas', 'besiktas'),



(3, 1, 'Beyoğlu', 'beyoglu'),

(3, 2, 'Beyoglu', 'beyoglu');

```



\---



\# 🏷 5. LABEL CATEGORIES



```sql

INSERT INTO label.label\_categories (key) VALUES

('experience'),

('atmosphere'),

('food\_drink'),

('entertainment'),

('features'),

('beverage');

```



\---



\## CATEGORY TRANSLATIONS



```sql

INSERT INTO label.label\_category\_translations (category\_id, language\_id, display\_name)

VALUES

(1,1,'Deneyim'), (1,2,'Experience'),

(2,1,'Atmosfer'), (2,2,'Atmosphere'),

(3,1,'Yemek \& İçecek'), (3,2,'Food \& Drink'),

(4,1,'Eğlence'), (4,2,'Entertainment'),

(5,1,'Özellikler'), (5,2,'Features'),

(6,1,'İçecek'), (6,2,'Beverage');

```



\---



\# 🏷 6. LABELS



```sql

INSERT INTO label.labels (category\_id, key) VALUES

(1,'romantik'),

(1,'arkadas\_bulusmasi'),

(2,'manzarali'),

(2,'rooftop'),

(3,'kahvalti'),

(3,'fine\_dining'),

(4,'gece\_hayati'),

(5,'wifi'),

(6,'alkollu');

```



\---



\## LABEL TRANSLATIONS



```sql

INSERT INTO label.label\_translations (label\_id, language\_id, display\_name)

VALUES

(1,1,'Romantik'), (1,2,'Romantic'),

(2,1,'Arkadaş Buluşması'), (2,2,'Friends Meetup'),

(3,1,'Manzaralı'), (3,2,'Scenic'),

(4,1,'Rooftop'), (4,2,'Rooftop'),

(5,1,'Kahvaltı'), (5,2,'Breakfast'),

(6,1,'Fine Dining'), (6,2,'Fine Dining'),

(7,1,'Gece Hayatı'), (7,2,'Nightlife'),

(8,1,'Wi-Fi'), (8,2,'Wi-Fi'),

(9,1,'Alkollü'), (9,2,'Alcohol');

```



\---



\# 🔍 7. LABEL KEYWORDS



```sql

INSERT INTO label.label\_keywords (label\_id, language\_id, keyword, confidence, source)

VALUES

(1,1,'romantik',1.0,'seed'),

(1,2,'romantic',1.0,'seed'),

(2,1,'arkadaş',0.8,'seed'),

(2,2,'friends',0.8,'seed'),

(3,1,'manzara',1.0,'seed'),

(3,2,'view',1.0,'seed'),

(7,1,'gece',0.9,'seed'),

(7,2,'nightlife',0.9,'seed');

```



\---



\# 🏢 8. PLACES



```sql

INSERT INTO place.places (

&#x20;   id, google\_place\_id, country\_id, city\_id, district\_id,

&#x20;   latitude, longitude, rating, user\_ratings\_total, parking\_status

)

VALUES

(gen\_random\_uuid(), 'g1', 1,1,1, 40.98,29.03, 4.5, 120, 'available'),

(gen\_random\_uuid(), 'g2', 1,1,2, 41.04,29.00, 4.3, 300, 'limited'),

(gen\_random\_uuid(), 'g3', 1,1,3, 41.03,28.97, 4.7, 500, 'unavailable');

```



\---



\# 🌍 9. PLACE TRANSLATIONS



```sql

INSERT INTO place.place\_translations (place\_id, language\_id, name, slug)

SELECT id, 1, 'Örnek Mekan TR', 'ornek-mekan'

FROM place.places;



INSERT INTO place.place\_translations (place\_id, language\_id, name, slug)

SELECT id, 2, 'Sample Place EN', 'sample-place'

FROM place.places;

```



\---



\# 🔗 10. PLACE LABELS



```sql

INSERT INTO label.place\_labels (place\_id, label\_id, weight)

SELECT id, 2, 0.9 FROM place.places;



INSERT INTO label.place\_labels (place\_id, label\_id, weight)

SELECT id, 7, 0.7 FROM place.places;

```



\---



\# 📊 11. PLACE SCORES



```sql

INSERT INTO place.place\_scores (place\_id, popularity\_score, quality\_score, trend\_score, final\_score)

SELECT 

&#x20;   id,

&#x20;   random()\*10,

&#x20;   random()\*10,

&#x20;   random()\*10,

&#x20;   random()\*10

FROM place.places;

```



\---



\# ✅ ACCEPTANCE



\* en az 3 place olmalı

\* tüm translationlar çalışmalı

\* label mapping doğru olmalı

\* keyword sistemi dolu olmalı

\* place-label ilişkisi kurulmuş olmalı



\---



\# 🚀 NEXT



Phase 3 → Backend Core Implementation



\---



