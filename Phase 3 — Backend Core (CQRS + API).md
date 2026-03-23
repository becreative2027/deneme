\# 🚀 Phase 3 — Backend Core (CQRS + API)



\## 🎯 Amaç



\* DB ile konuşan backend katmanını kurmak

\* CQRS pattern uygulamak

\* Place search ve filter endpointlerini oluşturmak

\* Localization destekli response üretmek



\---



\# 🧠 1. DbContext



\* GeoDbContext → geo schema

\* PlaceDbContext → place schema

\* LabelDbContext → label schema



\---



\# 🧩 2. Entities



DB ile birebir mapping:



\* Place

\* PlaceTranslation

\* PlaceScore

\* Label

\* LabelTranslation

\* PlaceLabel

\* Language

\* City / District / Country



\---



\# ⚙️ 3. CQRS



\## Queries



\### GetPlaceFiltersQuery



\* label categories

\* label list

\* localized



\---



\### SearchPlacesQuery



\* geo filter

\* label filter

\* rating

\* pagination



\---



\### GetPlaceDetailQuery



\* place info

\* labels

\* scores



\---



\# 🔍 4. Filtering Logic



\* WHERE label IN (...)

\* GROUP BY place

\* HAVING count logic



\---



\# 🌐 5. Localization



\* join translation tables

\* language\_id param



\---



\# 📡 6. API Endpoints



\### GET /api/filters



\### POST /api/places/search



\### GET /api/places/{id}



\---



\# 🧪 7. Validation



\* FluentValidation

\* request validation



\---



\# 📦 8. Response Model



```json

{

&#x20; "isSuccess": true,

&#x20; "data": {},

&#x20; "errors": \[]

}

```



\---



\# ✅ ACCEPTANCE



\* endpointler çalışmalı

\* data dönmeli

\* filter çalışmalı

\* localization çalışmalı



\---



\# 🚀 NEXT



Phase 4 → Admin \& CRUD



\---



