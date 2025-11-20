# 🍽️ QR Menü & Anlık Sipariş Yönetim Sistemi

![Status](https://img.shields.io/badge/Status-Production-success)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Firebase%20%7C%20Vite-blue)
![License](https://img.shields.io/badge/License-MIT-green)

Modern restoranlar için geliştirilmiş, **temassız QR menü** ve **gerçek zamanlı sipariş yönetimi** sağlayan web uygulaması.

🎯 **Müşteriler** masadaki QR kodu okutarak menüye erişir ve sipariş verir.  
📊 **İşletme** yönetim panelinden siparişleri anlık takip eder ve menüyü yönetir.

---

## 🚀 Proje Mimarisi ve Teknolojiler

Proje, **Monorepo** yapısında geliştirilmiş olup iki ana uygulamadan oluşur:

### 1. 📱 Müşteri Arayüzü (Client Side)
Müşterilerin herhangi bir uygulama indirmeden tarayıcı üzerinden eriştiği arayüzdür.
* **Teknoloji:** React.js (Vite), CSS3 (Mobile First Design)
* **Özellikler:**
    * **Akıllı Menü:** Kategori bazlı ve yatay kaydırmalı navigasyon.
    * **Oturum:** Masa numarasına özel oturum yönetimi (`?masa=1`).
    * **Sepet:** Anlık sepet güncelleme ve özel not ekleme.
    * **Görsel:** Kategoriye özel varsayılan görseller veya ürüne özel görsel linki desteği.

### 2. 🖥️ Yönetim Paneli (Admin Dashboard)
Restoran yöneticileri ve mutfak ekibi için geliştirilen kontrol merkezidir.
* **Teknoloji:** React.js, Firebase Auth, Firestore Real-time Listeners.
* **Özellikler:**
    * **Canlı Takip:** Sayfa yenilemeden (WebSocket benzeri) anlık sipariş bildirimi.
    * **Akıllı Süre Takibi:** Siparişin bekleme süresine göre renk değiştiren (Mavi -> Turuncu -> Kırmızı Alarm) uyarı sistemi.
    * **CRUD Menü Yönetimi:** Ürün ekleme, silme, fiyat güncelleme ve link ile resim atama.
    * **Sipariş Düzenleme:** Müşteri siparişini sonradan değiştirme (ürün ekleme/çıkarma, not güncelleme) yeteneği.
    * **Güvenlik:** E-posta/Şifre tabanlı yetkilendirme.

### ☁️ Backend & Altyapı (Serverless)
* **Database:** Google Firebase Firestore (NoSQL)
* **Authentication:** Firebase Auth (Admin girişi için)
* **Hosting:** Vercel (CI/CD ile otomatik dağıtım)
* **Security:** Google Cloud API Kısıtlamaları (HTTP Referrer & API Restrictions)

---

## 📸 Ekran Görüntüleri

<table>
  <tr>
    <td align="center">
      <h3>📱 Müşteri Arayüzü (Mobil)</h3>
      <a href="https://hizliresim.com/2pgs50p">
        <img src="https://i.hizliresim.com/2pgs50p.png" alt="Müşteri Menüsü" width="350"/>
      </a>
      <p><i>Kategori bazlı menü, sepet ve sipariş verme</i></p>
    </td>
    <td align="center">
      <h3>🖥️ Yönetim Paneli (Admin)</h3>
      <a href="https://hizliresim.com/l4s1xch">
        <img src="https://i.hizliresim.com/l4s1xch.png" alt="Admin Paneli" width="500"/>
      </a>
      <p><i>Gerçek zamanlı sipariş takibi ve yönetimi</i></p>
    </td>
  </tr>
</table>

---

## ⚙️ Kurulum ve Çalıştırma (Localhost)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler
* Node.js (v18 veya üzeri)
* Firebase Hesabı

### 1️⃣ Projeyi Klonlayın
```bash
git clone https://github.com/osnn96/QRMenu.git
cd QRMenu
```

### 2️⃣ Bağımlılıkları Yükleyin
Proje monorepo yapısında olduğu için her iki uygulamaya da paket yüklenmeli.

**Müşteri Uygulaması:**
```bash
cd qr-menu-musteri
npm install
```

**Admin Uygulaması:**
```bash
cd ../qr-menu-admin
npm install
```

### 3️⃣ Firebase Yapılandırması

Her iki klasörde de `.env` dosyası oluşturun (`.env.example` dosyasını referans alarak):

**qr-menu-admin/.env**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**qr-menu-musteri/.env** (aynı değerler)

> ⚠️ **Önemli:** `.env` dosyaları `.gitignore`'a eklenmiştir ve asla GitHub'a yüklenmemelidir!

### 4️⃣ Uygulamaları Başlatın

İki ayrı terminal penceresi açın:

**Terminal 1 - Müşteri Arayüzü:**
```bash
cd qr-menu-musteri
npm run dev
# http://localhost:5174 adresinde çalışacak
```

**Terminal 2 - Admin Paneli:**
```bash
cd qr-menu-admin
npm run dev
# http://localhost:5173 adresinde çalışacak
```
## 🛠️ Özellik Detayları

### 📦 Akıllı Kategori Sistemi
- Ürün eklerken mevcut kategoriler otomatik olarak dropdown'da sunulur
- Yeni kategori eklemek için "Manuel Gir" seçeneği
- Kategori bazlı gruplama ve kolay navigasyon

### ⏱️ Gerçek Zamanlı Sipariş Takibi
Admin panelinde siparişin yaşına göre renk kodlaması:
- 🔵 **0-10 dk:** Mavi (Yeni)
- 🟠 **10-30 dk:** Turuncu (Bekleniyor)
- 🔴 **30+ dk:** Kırmızı + Yanıp sönen (Gecikti!)

### 🖨️ QR Kod Oluşturucu
Proje içinde `qr-olusturucu.html` aracı ile:
1. Canlı site URL'i girilir
2. Masa sayısı belirlenir (örn: 20 masa)
3. Tek tıkla tüm masaların QR kodları PDF olarak yazdırılır
4. Her QR kod otomatik olarak `?masa=X` parametresi ile oluşturulur

### 🔄 Sipariş Düzenleme
- Admin siparişi sonradan değiştirebilir
- Ürün ekleme/çıkarma
- Özel not güncelleme
- Anlık Firestore senkronizasyonu

## 🔒 Güvenlik ve Deployment

### Güvenlik Önlemleri
- ✅ **Environment Variables:** API anahtarları `.env` dosyasında, kod içinde değil
- ✅ **Google Cloud Security:** API kısıtlamaları ile sadece authorized domainler erişebilir
- ✅ **Firebase Security Rules:** Firestore'da role-based access control
- ✅ **Authentication:** Admin paneli için email/password authentication
- ✅ **Git Security:** `.env` dosyaları `.gitignore`'da, asla commit edilmez

### Deployment
- **Platform:** Vercel (CI/CD otomatik deployment)
- **Admin Panel:** Ayrı Vercel projesi
- **Müşteri Uygulaması:** Ayrı Vercel projesi
- **Database:** Firebase Firestore (serverless)
- **CDN:** Vercel Edge Network

### Google Cloud API Kısıtlamaları
API anahtarı sadece şu domainlerden istekleri kabul eder:
- `http://localhost:5173/*` (Admin development)
- `http://localhost:5174/*` (Müşteri development)
- `https://*.vercel.app/*` (Production)
- `https://your-custom-domain.com/*` (Özel domain)

---

## 📚 Ek Dökümanlar

- [QUICKSTART.md](./QUICKSTART.md) - Hızlı başlangıç rehberi
- [FIREBASE_SECURITY_SETUP.md](./FIREBASE_SECURITY_SETUP.md) - Firebase güvenlik kurulumu
- [SECURITY_UPDATE.md](./SECURITY_UPDATE.md) - Güvenlik güncellemeleri

---

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

## 👨‍💻 Geliştirici

**Osman Şener Gürel**
- GitHub: [@osnn96](https://github.com/osnn96)
- Proje: [QRMenu](https://github.com/osnn96/QRMenu)

---

## 🙏 Teşekkürler

- [Firebase](https://firebase.google.com/) - Backend ve authentication
- [Vercel](https://vercel.com/) - Hosting ve CI/CD
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI framework