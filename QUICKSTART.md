# 🚀 Hızlı Başlangıç Rehberi

## ✅ Yapılanlar

1. ✅ `.env` dosyaları oluşturuldu
2. ✅ Firebase config environment variable'lara taşındı
3. ✅ `.gitignore` güncellemeleri tamamlandı
4. ✅ Firestore Security Rules hazırlandı
5. ✅ Dokümantasyon eklendi

---

## 🔥 ŞİMDİ YAPMANIZ GEREKENLER

### 1. Uygulamaları Test Edin

```bash
# Terminal 1 - Admin Paneli
cd qr-menu-admin
npm run dev

# Terminal 2 - Müşteri Paneli
cd qr-menu-musteri
npm run dev
```

**Kontrol edin:**
- [ ] Menü yükleniyor mu?
- [ ] Firebase bağlantısı çalışıyor mu?
- [ ] Console'da hata var mı?

### 2. Firebase API Anahtarlarını YENİLEYİN! (ÇOK ÖNEMLİ!)

Eski anahtarlar GitHub'da açığa çıktı. **MUTLAKA** yenileyin:

#### Adım 1: Firebase Console'a Gidin
https://console.firebase.google.com/project/qrmenurestoran/settings/general

#### Adım 2: API Key'i Yenileyin
1. "Web API Key" bölümünü bulun
2. Sağ taraftaki "⚙️ Regenerate Key" seçeneğine tıklayın
3. Yeni anahtarı kopyalayın

#### Adım 3: .env Dosyalarını Güncelleyin
```bash
# qr-menu-admin/.env
VITE_FIREBASE_API_KEY=YENİ-API-KEY-BURAYA

# qr-menu-musteri/.env
VITE_FIREBASE_API_KEY=YENİ-API-KEY-BURAYA
```

#### Adım 4: Sunucuları Yeniden Başlatın
```bash
# Ctrl+C ile durdurun, sonra tekrar başlatın
npm run dev
```

### 3. Firestore Security Rules'u Uygulayın

#### Firebase Console:
https://console.firebase.google.com/project/qrmenurestoran/firestore/rules

#### Adımlar:
1. Sol menü: **Firestore Database** → **Rules**
2. `firestore.rules` dosyasını açın
3. Tüm içeriği kopyalayıp Firebase Console'a yapıştırın
4. **Publish** butonuna tıklayın

**Detaylı rehber:** `FIREBASE_SECURITY_SETUP.md`

### 4. Git'i Temizleyin (İsteğe Bağlı ama ÖNERİLİR)

Eğer `.env` dosyalarını daha önce Git'e push ettiyseniz:

```bash
# Dikkat: Bu komut git geçmişini değiştirir!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch qr-menu-admin/.env qr-menu-musteri/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
```

⚠️ **UYARI:** Bu işlem Git geçmişini yeniden yazar. Takım çalışıyorsanız önce bilgilendirin!

---

## 📁 Yeni Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `qr-menu-admin/.env` | Firebase config (Git'e gitmez) |
| `qr-menu-musteri/.env` | Firebase config (Git'e gitmez) |
| `qr-menu-admin/.env.example` | Şablon dosya |
| `qr-menu-musteri/.env.example` | Şablon dosya |
| `firestore.rules` | Güvenlik kuralları |
| `FIREBASE_SECURITY_SETUP.md` | Detaylı kurulum rehberi |
| `SECURITY_UPDATE.md` | Güvenlik güncellemeleri özeti |
| `.gitignore` (root) | Root seviye gitignore |

---

## ✅ Son Kontrol

- [ ] Uygulamalar çalışıyor
- [ ] Firebase bağlantısı OK
- [ ] API anahtarları yenilendi
- [ ] Firestore rules aktive edildi
- [ ] `.env` dosyaları Git'e eklenmedi
- [ ] Değişiklikler commit edildi

---

## 🆘 Sorun mu Yaşıyorsunuz?

### "Firebase yapılandırması yüklenemedi" Hatası
**Çözüm:**
```bash
# .env dosyasının doğru yerde olduğunu kontrol edin
ls -la qr-menu-admin/.env
ls -la qr-menu-musteri/.env

# Dev server'ı yeniden başlatın
npm run dev
```

### "Permission Denied" Hatası
**Çözüm:** Firestore Security Rules'u Firebase Console'dan aktive edin.

### "Module not found" Hatası
**Çözüm:**
```bash
npm install
```

---

## 📚 Daha Fazla Bilgi

- **Firestore Rules:** `FIREBASE_SECURITY_SETUP.md`
- **Güvenlik Özeti:** `SECURITY_UPDATE.md`
- **Firebase Docs:** https://firebase.google.com/docs

---

**Son güncelleme:** 20 Kasım 2025
**Versiyon:** 1.0 - Güvenlik Güncellemesi
