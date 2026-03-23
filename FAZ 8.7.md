# 🚀 Phase 8.7 — Perfect Label Mapping (Manual Quality, Auto Applied)

## 🎯 Amaç

Bu task’in amacı:

* mevcut 30 mekan için
* generic label mapping’i
* **mekan bazlı, yüksek doğruluklu, curated label mapping ile güncellemek**

---

# ⚠️ KRİTİK KURALLAR

## ❗ Mevcut veriyi silme

* DELETE kullanma
* mevcut mapping kalabilir

## ❗ Duplicate üretme

* ON CONFLICT kullan

## ❗ Schema-aware çalış

* label.key üzerinden join yap

---

# 🧠 STRATEJİ

Her mekan:

👉 4–6 label alacak
👉 weight ile importance belirtilecek

---

# 🧱 LABEL WEIGHT KURALI

| Weight | Anlam         |
| ------ | ------------- |
| 0.95   | core identity |
| 0.85   | güçlü         |
| 0.7    | secondary     |

---

# 📍 PERFECT MAPPING

## 🟣 KADIKÖY

### Walter’s Coffee Roastery

* coffee → 0.95
* dessert → 0.7
* wifi → 0.85
* arkadas_bulusmasi → 0.8

---

### Montag Coffee

* coffee → 0.95
* wifi → 0.85
* work_friendly → 0.85

---

### Kronotrop Kadıköy

* coffee → 0.95
* third_wave → 0.9
* wifi → 0.8

---

### Arka Oda

* gece_hayati → 0.95
* alkollu → 0.9
* alternatif → 0.8

---

### Çiya Sofrası

* lokal_lezzet → 0.95
* yemek → 0.9
* cultural → 0.85

---

### Basta Street Food

* street_food → 0.95
* burger → 0.85
* casual → 0.8

---

### Naga Putrika

* asian → 0.95
* fine_dining → 0.85
* romantic → 0.8

---

### Zapata Burger

* burger → 0.95
* fast_food → 0.9
* casual → 0.85

---

### Kemal Usta

* kebab → 0.95
* lokal_lezzet → 0.9

---

### Kadıköy Börekçisi

* kahvalti → 0.9
* bakery → 0.95
* lokal_lezzet → 0.85

---

## 🟢 BEŞİKTAŞ

### Mangerie

* brunch → 0.95
* manzarali → 0.9
* romantic → 0.85

---

### Lucca

* gece_hayati → 0.95
* alkollu → 0.9
* premium → 0.85

---

### Bebek Kahve

* kahvalti → 0.9
* manzarali → 0.85
* casual → 0.8

---

### House Cafe Ortaköy

* brunch → 0.9
* manzarali → 0.85

---

### The Townhouse

* fine_dining → 0.95
* romantic → 0.9

---

### Efendi Bar

* gece_hayati → 0.95
* alkollu → 0.9

---

### Akaretler Lokantası

* fine_dining → 0.9
* yemek → 0.85

---

### Beşiktaş Balıkçısı

* seafood → 0.95
* lokal_lezzet → 0.9

---

### Ortaköy Waffle

* dessert → 0.95
* street_food → 0.85

---

### Fully Karaköy

* coffee → 0.9
* brunch → 0.85

---

## 🔵 BEYOĞLU

### Karaköy Lokantası

* fine_dining → 0.95
* lokal_lezzet → 0.9

---

### Namlı Gurme

* kahvalti → 0.95
* deli → 0.9

---

### Unter

* rooftop → 0.95
* gece_hayati → 0.9

---

### Finn Karaköy

* coffee → 0.9
* brunch → 0.85

---

### Mums Cafe

* breakfast → 0.9
* cozy → 0.85

---

### Viyana Kahvesi

* coffee → 0.9
* dessert → 0.9

---

### 360 Istanbul

* rooftop → 0.95
* gece_hayati → 0.9
* manzarali → 0.9

---

### Mikla

* fine_dining → 0.95
* rooftop → 0.9
* manzarali → 0.9
* romantic → 0.85

---

### Pandeli

* historical → 0.9
* lokal_lezzet → 0.9

---

### Galata House

* boutique → 0.85
* romantic → 0.8

---

# 🧠 IMPLEMENTATION

Claude şunu yapmalı:

## 1. Mekanları bul

```sql
SELECT id, google_place_id FROM place.places
```

---

## 2. Label id'leri resolve et

```sql
SELECT id, key FROM label.labels
```

---

## 3. INSERT script üret

Format:

```sql
INSERT INTO label.place_labels (place_id, label_id, weight)
SELECT p.id, l.id, w.weight
FROM place.places p
JOIN (VALUES (...)) w(key, weight)
JOIN label.labels l ON l.key = w.key
WHERE p.google_place_id = 'ph_mikla'
ON CONFLICT DO NOTHING;
```

---

# 🎯 OUTPUT

Claude:

* tek SQL script üretmeli
* tüm 30 mekanı kapsamalı
* hatasız çalışmalı

---

# 🚀 GOAL

Script çalıştıktan sonra:

* recommendation engine güçlenecek
* feed kalitesi artacak
* user experience premium olacak

---
