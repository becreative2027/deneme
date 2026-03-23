# 🚀 Phase 8.5 — First Run & Debug (Windows + Android Emulator)

## 🎯 Amaç

Bu fazın amacı:

* mobil uygulamayı ilk kez çalıştırmak
* Android emulator üzerinde açmak
* test sürecine başlamak

---

# 🧱 1. GEREKSİNİMLER

## Kurulu olması gerekenler

* Node.js (>= 18)
* npm
* Git

---

## Android geliştirme

👉 Android Studio kurulmalı

---

# ⚙️ 2. ANDROID STUDIO KURULUM

## Adımlar

1. Android Studio indir ve kur
2. Aç → **More Actions → SDK Manager**
3. Şunları kur:

* Android SDK Platform (API 33 veya 34)
* Android SDK Build-Tools
* Android Emulator

---

## AVD (Emulator) oluştur

1. **Device Manager**
2. Create Virtual Device
3. Pixel 6 seç
4. Image: Android 13 (API 33)
5. Finish

---

## Emulator başlat

* Device Manager → Play tuşu

---

# 🧪 3. PROJEYİ ÇALIŞTIRMA

## Terminal

```bash
cd mobile/spotfinder
npm install
npx expo start
```

---

## Emulator’a gönder

Terminal açıkken:

```bash
a
```

👉 veya Expo UI → “Run on Android”

---

# 🔐 4. BACKEND BAĞLANTISI

## API URL kontrolü

`src/api/client.ts` içinde:

```ts
baseURL: "http://localhost:xxxx"
```

---

## ⚠️ ÖNEMLİ (Android Emulator)

```text
localhost yerine:
10.0.2.2
```

---

## Örnek

```ts
baseURL: "http://10.0.2.2:5000"
```

---

# 🧪 5. İLK AÇILIŞ TESTİ

## Beklenen akış

* Splash → Login ekranı
* Login → Main tabs

---

# 📋 6. TEST CHECKLIST

## 🔐 Auth

* register çalışıyor mu?
* login çalışıyor mu?
* logout çalışıyor mu?

---

## 📰 Feed

* scroll akıcı mı?
* infinite scroll çalışıyor mu?
* like/unlike çalışıyor mu?

---

## 🔍 Search

* place search çalışıyor mu?
* place detail açılıyor mu?

---

## ✍️ Post

* image seçiliyor mu?
* upload progress görünüyor mu?
* post oluşturuluyor mu?

---

## 👤 Profile

* profil yükleniyor mu?
* follow/unfollow çalışıyor mu?

---

## 🔔 Notification

* app açıkken toast geliyor mu?
* tıklayınca doğru sayfaya gidiyor mu?

---

## 🌙 Theme

* dark mode çalışıyor mu?

---

## 📶 Offline

* internet kapat → crash var mı?
* offline banner çıkıyor mu?

---

# 🚨 7. DEBUG DURUMLARI

## Eğer app açılmazsa:

* emulator açık mı?
* Expo log hata veriyor mu?

---

## Eğer API çalışmazsa:

* backend açık mı?
* port doğru mu?
* 10.0.2.2 kullandın mı?

---

## Eğer image yüklenmezse:

* presigned URL doğru mu?
* network error var mı?

---

# 🧠 8. LOG TAKİBİ

Expo terminalinde:

* error logları incele
* network hatalarını kontrol et

---

# 🧾 9. BUG LİSTESİ OLUŞTUR

Her bulduğun hatayı yaz:

```text
1. Login sonrası ekran donuyor
2. Feed scroll lag var
3. Image yüklenmiyor
4. Notification routing yanlış
```

---

# 🚀 10. SONRA NE OLACAK

* bug listeni ChatGPT’ye gönder
* sana **fix md dosyası** hazırlayacağım
* adım adım çözeceğiz

---

# 🎯 HEDEF

Bu fazın sonunda:

* uygulama emulator’de açılmalı
* temel akışlar çalışmalı
* bug listesi oluşmalı

---

# 🔜 NEXT

Phase 8.6 — Bug Fix Iterations

---
