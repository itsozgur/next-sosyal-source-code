# Next Sosyal

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

> [🇹🇷 Türkçe Dokümantasyon](./README.tr.md) | [🇬🇧 English Documentation](./README.md)

Next Sosyal, Mastodon'un güvenilir ve açık kaynaklı altyapısı üzerine inşa edilmiş, Türkiye'nin teknoloji geleceğine odaklanan bir sosyal ağ platformudur. Bu proje, Türkçe yerelleştirme ve gençleri topluluk gücüyle teknolojiye teşvik etmek ve yerel teknoloji ekosistemini desteklemek için özel özelliklerle [Mastodon](https://github.com/mastodon/mastodon)'dan fork edilmiştir.

## 📖 İçindekiler

- [Proje Hakkında](#proje-hakkında)
- [Başlarken](#başlarken)
  - [Gereksinimler](#gereksinimler)
  - [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Docker Komutları](#docker-komutları)
- [Geliştirme](#geliştirme)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)
- [İletişim & Topluluk](#iletişim--topluluk)
- [Teşekkürler](#teşekkürler)

## 🌟 Proje Hakkında

Next Sosyal, [Mastodon](https://github.com/mastodon/mastodon)'dan fork edilmiş, Türkiye'nin teknoloji topluluğu için uyarlanmış bir sosyal ağ platformudur. Bu proje, Mastodon'un güvenilir ve açık kaynaklı altyapısı üzerine inşa edilirken, Türk teknoloji ekosistemine odaklanan özellikler ve iyileştirmeler eklemektedir.

### Mastodon'dan Temel Farkları

- **Türkçe Yerelleştirme**: Gelişmiş Türkçe dil desteği ve kültürel adaptasyonlar
- **Topluluk Odağı**: Türkiye'nin teknoloji topluluğu için özel olarak tasarlanmış özellikler
- **Özel Markalama**: Özelleştirilmiş görsel kimlik ve kullanıcı deneyimi
- **Yerel Özellikler**: Türkiye'ye özel işlevsellik ve entegrasyonlar

### Temel Hedefler

- **Açık Kaynak**: Şeffaf ve topluluk destekli geliştirme
- **Güvenli**: Mastodon'un güvenlik standartlarını takip eden kullanıcı verisi ve gizlilik koruması
- **Topluluk Öncelikli Yapı**: Kullanıcıların kendilerini özgürce ifade edebilecekleri, nefret söylemi ve kötü niyetli manipülasyona karşı topluluk ilkeleriyle korunan sağlıklı bir sosyal ortam oluşturma
- **Kültürel Adaptasyon**: Türk teknoloji meraklılarına hitap eden bir platform sağlama

**Kullanılan Teknolojiler:**

- [Ruby on Rails](https://rubyonrails.org/) - Web uygulama çerçevesi
- [React.js](https://reactjs.org/) & [Redux](https://redux.js.org/) - Frontend çerçevesi ve durum yönetimi
- [Node.js](https://nodejs.org/) - Streaming API için JavaScript çalışma zamanı
- [PostgreSQL](https://www.postgresql.org/) - Ana veritabanı
- [Redis](https://redis.io/) - Önbellek ve oturum depolama
- [Docker](https://www.docker.com/) - Konteynerizasyon
- [Mastodon API](https://docs.joinmastodon.org/api/) - Sosyal ağ backend'i

## 🚀 Başlarken

Projeyi yerel makinenizde kurmak ve çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

Projeyi çalıştırmak için sisteminizde kurulu olması gerekenler:

- **Docker** ve **Docker Compose**
- **Git**
- **Ruby** 3.2+
- **Node.js** 18+
- **PostgreSQL** 12+
- **Redis** 4+

### Kurulum

1. Geliştirme ortamını başlatın:

   ```bash
   docker compose -f .devcontainer/compose.yaml up -d
   docker compose -f .devcontainer/compose.yaml exec app bin/setup
   docker compose -f .devcontainer/compose.yaml exec app bin/dev
   ```

2. Uygulamayı ziyaret edin:
   - Tarayıcınızı açın ve `http://localhost:3000` adresine gidin

## 🎯 Kullanım

### Yerel Geliştirme

Projeyi çalıştırmak için aşağıdaki komutları çalıştırın:

```bash
docker compose -f .devcontainer/compose.yaml up -d
docker compose -f .devcontainer/compose.yaml exec app bin/setup
docker compose -f .devcontainer/compose.yaml exec app bin/dev
```

### Katkıda Bulunma Kurulumu

Commit öncesi sistem kontrollerini devre dışı bırakmak için aşağıdaki komutu çalıştırın:

```bash
npx husky disable
```

## ✨ Özellikler

**Satıcı kilidi yok: Uyumlu herhangi bir platformla tam birlikte çalışabilirlik** - Mastodon olması gerekmiyor; ActivityPub'ı uygulayan her şey sosyal ağın bir parçasıdır! [Daha fazla bilgi](https://blog.joinmastodon.org/2018/06/why-activitypub-is-the-future/)

**Gerçek zamanlı, kronolojik zaman çizelgesi güncellemeleri** - Takip ettiğiniz kişilerin güncellemeleri WebSocket'ler aracılığıyla kullanıcı arayüzünde gerçek zamanlı olarak görünür. Ayrıca bir firehose görünümü de var!

**Resimler ve kısa videolar gibi medya eklentileri** - Güncellemelere ekli resimleri ve WebM/MP4 videolarını yükleyin ve görüntüleyin. Ses parçası olmayan videolar GIF'ler gibi işlenir; normal videolar sürekli döngü yapar!

**Güvenlik ve moderasyon araçları** - Mastodon, özel gönderiler, kilitli hesaplar, ifade filtreleme, susturma, engelleme ve diğer birçok özelliğin yanı sıra bir raporlama ve moderasyon sistemi içerir. [Daha fazla bilgi](https://blog.joinmastodon.org/2018/07/cage-the-mastodon/)

**OAuth2 ve basit bir REST API** - Mastodon bir OAuth2 sağlayıcısı olarak çalışır, böylece 3. taraf uygulamalar REST ve Streaming API'lerini kullanabilir. Bu, çok sayıda seçenek sunan zengin bir uygulama ekosistemi ile sonuçlanır!

## 🛠️ Teknoloji Yığını

- **Ruby on Rails** - REST API ve diğer web sayfalarını güçlendirir
- **React.js** ve **Redux** - Arayüzün dinamik kısımları için kullanılır
- **Node.js** - Streaming API'yi güçlendirir
- **PostgreSQL** - Ana veritabanı
- **Redis** - Önbellek ve oturum depolama
- **Docker** - Konteynerizasyon ve geliştirme ortamı

## 🔧 Ortam Değişkenleri

Uygulamanın düzgün çalışması için belirli ortam değişkenlerinin tanımlanması gerekir. Bu değişkenler `development`, `staging` ve `production` ortamları için ayrı ayrı yapılandırılmalıdır.

### Gerekli Değişkenler

| Değişken Adı                          | Açıklama                                                |
| ------------------------------------- | ------------------------------------------------------- |
| `LOCAL_DOMAIN`                        | Sunucunuzun alan adı (sonradan değiştirilemez)          |
| `SECRET_KEY_BASE`                     | Rails uygulama gizli anahtarı                           |
| `OTP_SECRET`                          | Tek kullanımlık şifre gizli anahtarı                    |
| `VAPID_PRIVATE_KEY`                   | Web push bildirimi özel anahtarı                        |
| `VAPID_PUBLIC_KEY`                    | Web push bildirimi genel anahtarı                       |
| `DB_HOST`                             | PostgreSQL veritabanı sunucusu                          |
| `DB_USER`                             | PostgreSQL veritabanı kullanıcısı                       |
| `DB_NAME`                             | PostgreSQL veritabanı adı                               |
| `DB_PASS`                             | PostgreSQL veritabanı şifresi                           |
| `REDIS_HOST`                          | Redis sunucu adresi                                     |
| `REACT_APP_SITE_NAME`                 | UI'da görüntülenen uygulama adı                         |
| `REACT_APP_LIGHT_LOGO_URL`            | Açık tema logo URL'i                                    |
| `REACT_APP_DARK_LOGO_URL`             | Koyu tema logo URL'i                                    |
| `REACT_APP_SIGNUP_URL`                | Kullanıcı kayıt sayfası URL'i                           |
| `AUTH_URL`                            | Kimlik doğrulama servisi URL'i                          |
| `ASSET_HOST`                          | Statik varlıklar sunucu URL'i                           |
| `REACT_APP_FAVICON_URL`               | Favicon URL'i                                           |
| `INTERNAL_API_SECRET_TOKEN`           | Dahili API kimlik doğrulama tokeni                      |
| `DISALLOW_UNAUTHENTICATED_API_ACCESS` | API erişimini kimlik doğrulamalı kullanıcılarla sınırla |
| `CDN_URL`                             | İçerik dağıtım ağı URL'i                                |
| `ALLOW_ACCESS_TO_INSTANCE_PEERS`      | Örnek eş bilgilerine erişime izin ver                   |
| `PUBLISH_PEERS`                       | Eş bilgilerini yayınla                                  |
| `DISABLE_FEDERATION`                  | ActivityPub federasyonunu devre dışı bırak              |
| `LIMITED_FEDERATION_MODE`             | Sınırlı federasyon modunu etkinleştir                   |
| `PEERS_API_ENABLED`                   | Eşler API uç noktasını etkinleştir                      |
| `ALLOWED_DOMAINS`                     | Federasyon için izin verilen alan adları listesi        |
| `AUTH_CDN_URL`                        | Kimlik doğrulama CDN URL'i                              |
| `PUBLIC_TIMELINE_ACCESS`              | Genel zaman çizelgesi erişimini kontrol et              |

## 🐳 Docker Komutları

### Servisleri Başlatma/Durdurma

```bash
# Tüm servisleri başlat
docker compose up -d

# Tüm servisleri durdur
docker compose down

# Logları görüntüle
docker compose logs -f
```

### Bakım Komutları

```bash
# Veritabanı migrasyonu
docker compose run --rm web rails db:migrate

# Varlık derlemesi
docker compose run --rm web rails assets:precompile

# Önbelleği temizle
docker compose run --rm web rails tmp:clear

# Sistem durumunu kontrol et
docker compose run --rm web rails mastodon:check
```

### Admin Kullanıcı Yönetimi

#### Docker Konteynerine Bağlan

```bash
docker exec -it devcontainer-app-1 bash
```

#### Rails Konsoluna Eriş

```bash
rails console
```

#### Yeni Admin Kullanıcı Oluştur

```ruby
# Admin rolünü bul
admin_role = UserRole.find_by(name: 'Admin')

# Yeni admin kullanıcı oluştur
user = User.create!(
  email: 'admin@example.com',
  password: 'password123',
  confirmed_at: Time.now.utc,
  agreement: true,
  approved: true,
  role: admin_role,
  account_attributes: {
    username: 'admin',
    display_name: 'Site Yöneticisi'
  }
)
```

#### Şifre Değiştir (gerekirse)

```ruby
user = User.find_by(email: 'admin@example.com')
user.reset_password!('YeniSifre123', 'YeniSifre123')
```

#### Mevcut Kullanıcıya Admin Hakları Ver

```ruby
# Kullanıcıyı e-posta ile bul
user = User.find_by(email: 'kullanici@example.com')
# VEYA kullanıcı adı ile bul
user = User.joins(:account).find_by(accounts: { username: 'kullaniciadi' })

# Admin yap
admin_role = UserRole.find_by(name: 'Admin')
user.update!(
  approved: true,
  role: admin_role,
  confirmed_at: Time.now.utc
)
```

## 💻 Geliştirme

### Dal (Branch) Stratejisi

Dallar klasörlere göre organize edilmelidir. Aşağıda listelenen klasör isimleri zorunlu değildir:

- **feature/** → Yeni Özellikler
- **bugfix/** → Hata Düzeltmeleri
- **wip/** → Devam Eden Çalışmalar
- **release/** → Sürüm Hazırlığı
- **optimization/** → Performans İyileştirmeleri
- **refactor/** → Kod Yeniden Yapılandırma
- **chore/** → Rutin Bakım Görevleri
- **docs/** → Dokümantasyon Güncellemeleri
- **test/** → Test ve Deneme

### Commit Mesaj Kuralları

- Konuyu gövdeden boş bir satırla ayırın.
- **Konu** satırını **50** karakterle sınırlayın.
- Konu satırını nokta ile bitirmeyin.
- Konu satırında **emir kipi** kullanın.
- Gövdeyi 72 karakterde sarın.
- Gövdeyi nasıl değil, ne ve neden açıklamak için kullanın.

#### Örnek

```
Kimlik doğrulama servisini çok faktörlü kimlik doğrulamayı destekleyecek şekilde yeniden düzenle

Çok faktörlü kimlik doğrulama (MFA) kimlik doğrulama servisine eklendi

- OTP doğrulaması için yeni uç nokta oluşturuldu.
- Hem JWT token hem de OTP doğrulaması için kontroller geliştirildi.
- README.md yeni kimlik doğrulama akışını yansıtacak şekilde güncellendi.
- MFA senaryoları için birim ve entegrasyon testleri eklendi.

Ek bir doğrulama faktörü gerektirerek güvenliği artırır.
```

#### Daha Fazla Okuma

- [Git Commit Mesajı Nasıl Yazılır](https://cbea.ms/git-commit/)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

## 🤝 Katkıda Bulunma

Next Sosyal, orijinal Mastodon lisansı ile uyumluluğu koruyarak **AGPL-3.0** lisansı altında **ücretsiz, açık kaynaklı bir yazılımdır**.

Katkılarınız bu projeyi daha iyi yapacak! Katkıda bulunmak istiyorsanız:

1. Projeyi forklayın
2. Özellik dalınızı oluşturun (`git checkout -b feature/harika-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika bir özellik ekle'`)
4. Dalınıza push yapın (`git push origin feature/harika-ozellik`)
5. Bir Pull Request açın

Bulduğunuz hatalar veya eksik olduğunu düşündüğünüz özellikler için sorun (issue) açabilirsiniz. Ayrıca bu depoya pull request gönderebilirsiniz.

Topluluğumuzun tüm üyelerinin sorumlu açıklama uygulamalarını ve topluluk kurallarımızı takip etmesini bekliyoruz.

### Upstream Katkıları

Eğer katkınız tüm Mastodon kullanıcılarına fayda sağlayacak genel bir iyileştirme ise, upstream [Mastodon projesine](https://github.com/mastodon/mastodon) de katkıda bulunmayı düşünün.

## 📜 Lisans

Bu proje, upstream Mastodon projesi ile uyumluluğu koruyarak [AGPL-3.0 Lisansı](LICENSE) altında lisanslanmıştır.

```
Copyright (C) 2016-2024 Eugen Rochko & diğer Mastodon katkıda bulunanlar (AUTHORS.md'ye bakın)
Copyright (C) 2024 Next Sosyal katkıda bulunanlar

Bu program ücretsiz bir yazılımdır: Özgür Yazılım Vakfı tarafından yayınlanan
GNU Affero Genel Kamu Lisansı'nın ya 3. versiyonu ya da (tercihinize bağlı olarak)
daha sonraki bir versiyonu altında yeniden dağıtabilir ve/veya değiştirebilirsiniz.

Bu program faydalı olması umuduyla dağıtılmıştır, ancak HİÇBİR GARANTİ VERMEMEKTEDİR;
TİCARİ ELVERİŞLİLİK veya BELİRLİ BİR AMACA UYGUNLUK için zımni garanti bile.
Daha fazla ayrıntı için GNU Affero Genel Kamu Lisansı'na bakın.

Bu programla birlikte GNU Affero Genel Kamu Lisansı'nın bir kopyasını almış
olmalısınız. Eğer almadıysanız, https://www.gnu.org/licenses/ adresine bakın
```

## 💬 İletişim & Topluluk

Sorularınız veya fikirleriniz mi var? Bizimle iletişime geçin!

- **E-posta:** [Bize ulaşın](mailto:apps@2ntech.com.tr)

## 🙏 Teşekkürler

- **Ana Atıf**: Bu proje, Eugen Rochko ve Mastodon ekibi tarafından geliştirilen [Mastodon](https://github.com/mastodon/mastodon)'dan fork edilmiştir
- Bu projenin üzerine inşa edildiği temeli yaratan tüm Mastodon topluluğuna
- Bu Türkiye odaklı fork'u geliştirmeye yardımcı olan tüm katkıda bulunanlara
- Açık kaynak topluluğuna ve özgür yazılım hareketine
- Türkiye'nin teknoloji geleceğine ve merkezi olmayan sosyal ağlara inanan herkese

### Upstream Kredileri

Bu proje şu inanılmaz çalışmalar olmadan var olamazdı:

- **Mastodon ekibi** - Çekirdek geliştiriciler ve katkıda bulunanlar
- **ActivityPub topluluğu** - Merkezi olmayan sosyal web standardı için

---

**Next Sosyal** - Türkiye'nin teknoloji geleceğine katkıda bulunun! 🚀
