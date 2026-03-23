\# 🚀 Phase 0 — Product Scope \& Microservice Technical Foundation



\## 🎯 Amaç



Bu fazın amacı, projenin tüm teknik temelini \*\*mikroservis odaklı\*\* şekilde kurmaktır.



Bu fazda:

\- ürün kapsamı netleştirilecek

\- mikroservis sınırları tanımlanacak

\- teknoloji kararları verilecek

\- repo ve klasör yapısı oluşturulacak

\- ortak standartlar belirlenecek

\- servisler arası iletişim yaklaşımı tanımlanacak

\- geliştirme sırası netleştirilecek



⚠️ Bu fazda işlevsel business feature geliştirilmeyecek.  

Bu fazın çıktısı: \*\*sağlam teknik temel ve servis mimarisi\*\*.



\---



\# 1. Ürün Özeti



Bu proje bir:



\*\*location-based social discovery platform\*\*



olacaktır.



Sistemin ana hedefleri:



\- kullanıcıların mekan bulabilmesi

\- mekanları çoklu label ile filtreleyebilmesi

\- localization destekli arama yapabilmesi

\- mekanlara bağlı içerik paylaşabilmesi

\- sosyal feed içinde içerik tüketebilmesi

\- çevredeki mekanlardan yapılan paylaşımları görebilmesi

\- zamanla platformun kendi creator / influencer ekosistemini oluşturabilmesi



\---



\# 2. Ana Modüller



Sistem şu iş alanlarından oluşur:



1\. Identity / kullanıcı yönetimi

2\. Place / mekan yönetimi

3\. Geo / ülke-şehir-ilçe yapısı

4\. Label / filtreleme sistemi

5\. Search / discovery

6\. Content / post paylaşımı

7\. Social graph / takip etme

8\. Feed / keşfet

9\. Media / görsel yükleme

10\. AI / labeling ve öneri

11\. Admin / moderation ve yönetim

12\. Analytics / metrik ve trend



Bu iş alanları ileride birbirinden bağımsız ölçeklenebilir olmalıdır.



\---



\# 3. Mikroservis Stratejisi



\## 3.1 Hedef Mimari



Sistem uzun vadede mikroservis mimarisine göre kurulacaktır.



Ancak ilk günden aşırı parçalı bir yapı kurulmayacaktır.  

Bunun yerine:



\- servis sınırları baştan doğru belirlenecek

\- her servis ayrı proje olarak oluşturulacak

\- ortak kütüphaneler ayrılacak

\- servisler bağımsız deploy edilebilir olacak

\- fakat geliştirme sürecinde kontrollü ilerlemek için servis sayısı mantıklı tutulacak



\---



\## 3.2 Temel Mimari Karar



\*\*Modüler mikroservis yaklaşımı\*\* uygulanacaktır.



Yani:

\- her domain için ayrı servis tanımlanacak

\- her servisin kendi application/domain/persistence katmanı olacak

\- her servisin kendi veritabanı sahibi olma hedefi olacak

\- ama ilk fazlarda bazı servisler aynı PostgreSQL instance içinde ayrı schema veya ayrı database stratejisiyle yönetilebilir

\- servisler arası bağımlılıklar API kontratlarıyla kurulacak



\---



\## 3.3 Servisler Arası İletişim Stratejisi



Başlangıç aşamasında:

\- servisler arası iletişim \*\*HTTP REST\*\* ile yapılacak



İleri aşamalarda:

\- event-driven yapı için message broker eklenebilir

\- örneğin: RabbitMQ / Kafka



Ancak bu fazda:

\- event bus implement edilmeyecek

\- sadece buna uygun mimari temel hazırlanacak



\---



\# 4. Önerilen Mikroservisler



Claude aşağıdaki servis mimarisini baz almalıdır.



\## 4.1 API Gateway

Amaç:

\- mobil ve admin uygulamalarının tek giriş noktası olmak

\- route yönetmek

\- auth doğrulama

\- rate limit

\- request forwarding



Not:

İlk aşamada basit tutulabilir.



\---



\## 4.2 Identity Service

Sorumluluklar:

\- kullanıcı kaydı

\- login

\- JWT üretimi

\- refresh token

\- kullanıcı rolleri

\- admin/user yetkilendirme

\- profil temel kimlik bilgileri



Kapsam:

\- users

\- auth

\- roles

\- permissions

\- sessions



\---



\## 4.3 Profile Service

Sorumluluklar:

\- kullanıcı profili

\- bio

\- avatar

\- kullanıcı tercihleri

\- profile stats

\- saved places ilişkileri



Not:

Identity ile ayrı tutulmalı çünkü auth ile sosyal profil aynı bounded context değildir.



\---



\## 4.4 Geo Service

Sorumluluklar:

\- countries

\- cities

\- districts

\- translation yönetimi

\- geo lookup

\- slug yapıları



Amaç:

Tüm diğer servisler için geo master data kaynağı olmak



\---



\## 4.5 Place Service

Sorumluluklar:

\- places

\- place translations

\- google\_place\_id

\- source tracking

\- parking status

\- place detail yönetimi

\- place lifecycle



\---



\## 4.6 Label Service

Sorumluluklar:

\- label categories

\- labels

\- label translations

\- label keywords

\- place-label mapping

\- label candidate yönetimi



\---



\## 4.7 Search Service

Sorumluluklar:

\- filtreleme

\- place search

\- ranking

\- match mode

\- autocomplete

\- semantic search için hazırlık



Not:

Search logic’i Place Service içine gömmek yerine ayrı tutmak daha sağlıklıdır.



\---



\## 4.8 Content Service

Sorumluluklar:

\- posts

\- captions

\- place-tagged paylaşım

\- comments

\- likes

\- saves

\- report hazırlığı



Kural:

Her post bir place\_id ile ilişkilendirilmeli



\---



\## 4.9 Social Graph Service

Sorumluluklar:

\- follow / unfollow

\- follower/following ilişkileri

\- block/mute hazırlığı

\- social relation graph



\---



\## 4.10 Feed Service

Sorumluluklar:

\- following feed

\- nearby feed

\- feed ranking

\- candidate toplama

\- feed merge logic

\- trend mekanlar ve trend içerikler



Not:

Feed kendi başına ayrı servis olmalı çünkü zamanla en çok evrilen kısım burasıdır.



\---



\## 4.11 Media Service

Sorumluluklar:

\- image upload

\- storage bağlantısı

\- media metadata

\- post media ilişkileri

\- resize / optimize pipeline hazırlığı



\---



\## 4.12 AI Service

Sorumluluklar:

\- AI label extraction

\- review summary analysis

\- semantic enrichment

\- recommended labels

\- future recommendation support



\---



\## 4.13 Admin Service

Sorumluluklar:

\- admin dashboard backend

\- moderation queue

\- place approval

\- label approval

\- post moderation

\- audit görüntüleme

\- import yönetimi



\---



\## 4.14 Ingestion Service

Sorumluluklar:

\- Google Places veri çekme

\- raw import

\- normalize etme

\- geo mapping

\- place upsert hazırlığı

\- dış kaynaklardan veri alma



\---



\## 4.15 Analytics Service

Sorumluluklar:

\- click

\- impression

\- save

\- post engagement

\- creator metrics

\- trend metrics

\- dashboard analytics



\---



\# 5. İlk Geliştirme İçin Önerilen Servis Gruplaması



Tüm servisleri aynı anda geliştirmek doğru değildir.



İlk geliştirme dalgasında Claude şu çekirdek servisleri kurmalıdır:



1\. API Gateway

2\. Identity Service

3\. Geo Service

4\. Place Service

5\. Label Service

6\. Search Service

7\. Admin Service



İkinci dalgada:

8\. Profile Service

9\. Content Service

10\. Social Graph Service

11\. Feed Service

12\. Media Service



Üçüncü dalgada:

13\. Ingestion Service

14\. AI Service

15\. Analytics Service



\---



\# 6. Teknoloji Stack



\## Backend

\- Language: C#

\- Framework: .NET 8

\- API Style: REST

\- Architecture: Clean Architecture + CQRS

\- ORM: Entity Framework Core

\- Validation: FluentValidation

\- Auth: JWT

\- Documentation: Swagger / OpenAPI



\## Database

\- PostgreSQL

\- ileride PostGIS

\- Redis ileride cache için



\## Mobile

\- React Native

\- TypeScript



\## Admin Panel

\- Next.js

\- TypeScript

\- modern component library



\## Storage

\- media için object storage odaklı yapı

\- başlangıçta local abstraction, ileride cloud storage



\---



\# 7. Repository Yapısı



Claude monorepo kurmalıdır.



Önerilen yapı:



```text

root/

│

├── gateway/

│   └── api-gateway/

│

├── services/

│   ├── identity-service/

│   ├── profile-service/

│   ├── geo-service/

│   ├── place-service/

│   ├── label-service/

│   ├── search-service/

│   ├── content-service/

│   ├── social-graph-service/

│   ├── feed-service/

│   ├── media-service/

│   ├── ai-service/

│   ├── ingestion-service/

│   ├── analytics-service/

│   └── admin-service/

│

├── mobile/

│

├── admin-web/

│

├── shared/

│   ├── building-blocks/

│   ├── contracts/

│   ├── shared-kernel/

│   └── common-tests/

│

├── docs/

│

└── scripts/

