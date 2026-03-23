# 🚀 Phase 8 — Mobile App (React Native / Production Ready)

## 🎯 Amaç

* backend’i kullanıcıya ulaştırmak
* modern, hızlı ve temiz bir mobil uygulama oluşturmak
* App Store / Play Store’a hazır hale getirmek

---

# 🧠 1. TECH STACK

## Öneri

* React Native (Expo)
* TypeScript
* Zustand (state management)
* React Query (API cache)
* Axios (API client)
* React Navigation

---

# 📁 2. PROJE YAPISI

```text id="folder"
src/
 ├── api/
 ├── components/
 ├── screens/
 ├── navigation/
 ├── store/
 ├── hooks/
 ├── utils/
 └── types/
```

---

# 🔐 3. AUTH FLOW

## Screens

* LoginScreen
* RegisterScreen
* SplashScreen

---

## Flow

```text id="authflow"
App start → token var mı?
  → evet → Home
  → hayır → Login
```

---

# 📰 4. FEED SCREENS

## Ana ekran (Tabs)

* Following Feed
* Explore Feed
* Personalized Feed

---

## Endpointler

* GET /api/feed/following
* GET /api/feed/explore
* GET /api/feed/personalized

---

## UI

* PostCard component
* infinite scroll
* pull-to-refresh

---

# 🔍 5. PLACE DISCOVERY

## Screens

* SearchScreen
* PlaceDetailScreen

---

## Endpointler

* POST /api/places/search
* GET /api/places/{id}
* GET /api/places/recommendations

---

---

# ✍️ 6. POST CREATE

## Screen

* CreatePostScreen

---

## Flow

* foto seç
* caption yaz
* place seç
* post at

---

## Endpoint

POST /api/posts

---

# 👤 7. PROFILE

## Screen

* ProfileScreen

---

## İçerik

* kullanıcı bilgisi
* post listesi
* follow/unfollow

---

# 🧠 8. STATE MANAGEMENT

## Zustand store

```ts id="zustand"
authStore
userStore
feedStore
```

---

## React Query

* API caching
* pagination
* background refresh

---

# ⚡ 9. PERFORMANCE

* FlatList kullan
* memoization
* lazy loading

---

# 🔔 10. UX DETAYLARI

* skeleton loader
* error states
* empty states

---

# 📡 11. API CLIENT

```ts id="axios"
axios.create({
  baseURL: "...",
  headers: { Authorization: `Bearer ${token}` }
})
```

---

# 🧪 12. VALIDATION

* form validation
* network error handling

---

# 🔐 13. SECURITY

* token secure storage (SecureStore)
* HTTPS zorunlu

---

# ✅ ACCEPTANCE CRITERIA

* login/register çalışmalı
* feed yüklenmeli
* post paylaşılmalı
* mekan aranmalı
* profil görüntülenmeli

---

# 🚀 RESULT

Bu fazdan sonra:

* uygulama yayına hazır olur
* kullanıcı onboarding başlar
* gerçek data oluşur

---

# 🔜 NEXT

Phase 9 — Scaling & Infra
