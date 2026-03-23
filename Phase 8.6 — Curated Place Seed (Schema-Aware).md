# 🚀 Phase 8.6 — Curated Place Seed (Schema-Aware)

## 🎯 Amaç

Bu task’in amacı:

* mevcut database schema’yı okuyarak
* İstanbul için 30 adet curated mekan eklemek
* doğru kolonları otomatik kullanmak (slug/name fark etmeksizin)
* label mapping’i kaliteli şekilde yapmak

---

# ⚠️ KRİTİK KURAL

❗ Hardcoded kolon kullanma
❗ "slug" varsayımı yapma

👉 Önce schema’yı keşfet

---

# 🧠 1. SCHEMA ANALYSIS (ZORUNLU)

Aşağıdaki tabloları inspect et:

```sql
geo.cities
geo.districts
place.places
place.place_translations
label.labels
label.place_labels
```

---

## Her tablo için:

* kolon isimlerini bul
* case-sensitive mi kontrol et
* primary key yapısını öğren

---

# 🧱 2. GEO RESOLUTION

İstanbul'u bul:

* city name → İstanbul / Istanbul

District’leri bul:

* Kadıköy
* Beşiktaş
* Beyoğlu

👉 slug varsa slug kullan
👉 yoksa name üzerinden bul

---

# 📍 3. PLACE INSERT

30 curated place ekle:

---

## Kadıköy

* Walter’s Coffee Roastery
* Montag Coffee
* Kronotrop Kadıköy
* Arka Oda
* Çiya Sofrası
* Basta Street Food
* Naga Putrika
* Zapata Burger
* Kemal Usta
* Kadıköy Börekçisi

---

## Beşiktaş

* Mangerie
* Lucca
* Bebek Kahve
* The House Cafe Ortaköy
* The Townhouse
* Efendi Bar
* Akaretler Lokantası
* Beşiktaş Balıkçısı
* Ortaköy Waffle
* Fully Karaköy

---

## Beyoğlu / Karaköy

* Karaköy Lokantası
* Namlı Gurme
* Unter
* Finn Karaköy
* Mums Cafe
* Viyana Kahvesi
* 360 Istanbul
* Mikla
* Pandeli
* Galata House

---

## Kurallar

* id → UUID
* rating → 4.4 – 4.9
* google_place_id → placeholder bırak (sonra güncellenecek)

---

# 🌍 4. TRANSLATIONS

* language_id = TR (1) kullan
* name alanını doldur

---

# 🏷 5. LABEL MAPPING (SMART)

Label’ları key üzerinden bul:

---

## Mapping kuralları

### Coffee places

→ coffee, dessert, work_friendly

### Fine dining

→ fine_dining, romantic

### Nightlife

→ nightlife, cocktail

### Breakfast

→ breakfast, brunch

---

## Weight

* core → 0.9
* strong → 0.7
* secondary → 0.5

---

# ⚠️ 6. IDEMPOTENCY

Her insert:

```sql
ON CONFLICT DO NOTHING
```

---

# 🧪 7. VALIDATION QUERY

Script sonunda:

```sql
SELECT COUNT(*) FROM place.places;
SELECT COUNT(*) FROM label.place_labels;
```

---

# 🎯 OUTPUT

Claude şu çıktıyı üretmeli:

1. ✅ Full SQL script
2. ✅ Schema-aware (kolon hatası yok)
3. ✅ 30 mekan eklenmiş
4. ✅ Label mapping yapılmış

---

# 🚀 GOAL

Script çalıştığında:

* app boş görünmemeli
* place detail dolu olmalı
* feed meaningful olmalı

---
