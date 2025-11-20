# Firebase Güvenlik Kuralları Kurulum Rehberi

Bu dosyayı Firebase Console'a yükleyerek Firestore güvenliğini sağlayın.

## 📋 Kurulum Adımları

### 1. Firebase Console'a Giriş Yapın
https://console.firebase.google.com/project/qrmenurestoran/firestore/rules

### 2. Kuralları Kopyalayın
`firestore.rules` dosyasındaki tüm içeriği kopyalayın.

### 3. Firebase Console'da Yapıştırın
- Sol menüden **Firestore Database** seçin
- Üst menüden **Rules** sekmesine tıklayın
- Mevcut kuralları silin
- Yeni kuralları yapıştırın
- **Publish** (Yayınla) butonuna tıklayın

### 4. Test Edin
Kuralları yayınladıktan sonra test edin:
- ✅ Müşteri uygulaması menüyü görebilmeli
- ✅ Müşteri uygulaması sipariş oluşturabilmeli
- ❌ Müşteri uygulaması ürün ekleyememeli
- ✅ Admin paneli giriş yaptıktan sonra her şeyi yapabilmeli

## 🔐 Güvenlik Özellikleri

### Ürünler (`urunler` koleksiyonu):
- ✅ Herkes okuyabilir (müşteriler için)
- ❌ Sadece admin yazabilir

### Siparişler (`siparisler` koleksiyonu):
- ✅ Herkes sipariş oluşturabilir
- ❌ Sadece admin okuyabilir
- ❌ Sadece admin güncelleyebilir/silebilir
- ✅ Sipariş oluştururken zorunlu alanlar kontrol edilir

### Validasyon Kuralları:
- `masaNo`, `urunler`, `toplamFiyat`, `durum`, `tarih` zorunlu
- İlk oluşturulduğunda durum 'Beklemede' olmalı
- Toplam fiyat pozitif sayı olmalı

## 🚨 ÖNEMLİ NOTLAR

1. **Admin Authentication**: 
   - Admin panelinde mutlaka Firebase Authentication kullanın
   - Giriş yapılmadan ürün ekleme/düzenleme yapılamaz

2. **Test Ortamı**:
   - Production'a geçmeden önce test edin
   - Gerekirse geliştirme ortamı için ayrı Firebase projesi kullanın

3. **Güvenlik Duvarı**:
   - Firebase Console > Settings > Authorized domains
   - Sadece domaininizi ekleyin (localhost test için zaten var)

## 📝 CLI ile Kurulum (İsteğe Bağlı)

Firebase CLI kullanıyorsanız:

\`\`\`bash
# Firebase CLI'yi yükleyin
npm install -g firebase-tools

# Projeye giriş yapın
firebase login

# Projeyi başlatın
firebase init firestore

# Kuralları dağıtın
firebase deploy --only firestore:rules
\`\`\`

## 🔍 Kural Detayları

### Okuma İzinleri:
\`\`\`
allow read: if true;                  // Herkes okuyabilir
allow read: if request.auth != null;  // Sadece giriş yapanlar
\`\`\`

### Yazma İzinleri:
\`\`\`
allow create: if ...  // Oluşturma
allow update: if ...  // Güncelleme
allow delete: if ...  // Silme
allow write: if ...   // Hepsi (create + update + delete)
\`\`\`

## 🆘 Sorun Giderme

**Hata: "Missing or insufficient permissions"**
- Kuralların doğru yüklendiğinden emin olun
- Admin panelinde giriş yaptığınızdan emin olun
- Firebase Console'dan kuralları kontrol edin

**Hata: "PERMISSION_DENIED"**
- Koleksiyon adlarını kontrol edin (urunler, siparisler)
- Authentication durumunu kontrol edin
- Browser console'u inceleyin

## 📚 Daha Fazla Bilgi

Firebase Security Rules Dokümantasyonu:
https://firebase.google.com/docs/firestore/security/get-started
