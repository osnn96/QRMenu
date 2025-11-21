// qr-menu-admin/src/App.jsx

import { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth"; 
import { 
  collection, query, orderBy, onSnapshot, 
  getDocs, addDoc, updateDoc, deleteDoc, doc 
} from "firebase/firestore"; 
import './App.css'; 

// -------------------------------------------------------------------
// 1. GİRİŞ SAYFASI
// -------------------------------------------------------------------
function LoginPage({ setGirisYapti }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError("");
    console.log("🔐 Giriş deneniyor:", email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Giriş başarılı:", userCredential.user.email);
      setGirisYapti(true); 
    } catch (err) {
      console.error("❌ Giriş hatası:", err.code, err.message);
      if (err.code === 'auth/user-not-found') {
        setError("Bu e-posta adresi kayıtlı değil.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Şifre hatalı.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Geçersiz e-posta formatı.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("E-posta veya şifre hatalı.");
      } else {
        setError("Giriş yapılamadı: " + err.message);
      }
    }
  };

  return (
    <div className="login-container">
      <h1>Admin Paneli Girişi</h1>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" required />
        <button type="submit">Giriş Yap</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

// -------------------------------------------------------------------
// 2. MENÜ YÖNETİMİ (RESİM LİNKİ YAPIŞTIRMALI VERSİYON)
// -------------------------------------------------------------------
function MenuYonetimi() {
  const [menu, setMenu] = useState([]);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniFiyat, setYeniFiyat] = useState(0);
  const [yeniKategori, setYeniKategori] = useState("");
  const [yeniGorselLink, setYeniGorselLink] = useState(""); // Link state'i
  const [menuAcik, setMenuAcik] = useState(false); 
  const [acikKategori, setAcikKategori] = useState(null);
  const [manuelKategoriModu, setManuelKategoriModu] = useState(false);

  const fetchMenu = async () => {
    const urunlerKoleksiyonu = collection(db, 'urunler');
    const urunSnapshot = await getDocs(urunlerKoleksiyonu);
    setMenu(urunSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    urunListesi.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    setMenu(urunListesi);
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleUrunEkle = async (e) => {
    e.preventDefault();
    if (!yeniAd || yeniFiyat <= 0 || !yeniKategori) return;

    try {
      await addDoc(collection(db, "urunler"), { 
        ad: yeniAd, 
        fiyat: Number(yeniFiyat), 
        kategori: yeniKategori,
        gorsel: yeniGorselLink || "" // Link varsa kaydet, yoksa boş
      });

      setYeniAd(""); setYeniFiyat(0); setYeniKategori(""); setYeniGorselLink("");
      setManuelKategoriModu(false);
      alert("Ürün başarıyla eklendi!");
      fetchMenu();
    } catch (err) {
      console.error(err);
      alert("Hata oluştu!");
    }
  };

  const handleUrunSil = async (id) => {
    if (window.confirm("Silinsin mi?")) { await deleteDoc(doc(db, "urunler", id)); fetchMenu(); }
  };

  // Resim Linkini Güncelleme
  const handleResimLinkGuncelle = async (id, mevcutLink) => {
    const yeniLink = window.prompt("Yeni resim linkini yapıştırın:", mevcutLink);
    if (yeniLink !== null) { 
        try {
            await updateDoc(doc(db, "urunler", id), { gorsel: yeniLink });
            fetchMenu();
        } catch(err) {
            alert("Güncellenemedi");
        }
    }
  };

  const handleFiyatGuncelle = async (id, fiyat) => {
    const yeni = window.prompt("Yeni fiyat:", fiyat);
    if (yeni) { await updateDoc(doc(db, "urunler", id), { fiyat: Number(yeni) }); fetchMenu(); }
  };

  const kategorilereGoreUrunler = menu.reduce((gruplar, urun) => {
    const k = urun.kategori || "Diğer";
    if (!gruplar[k]) gruplar[k] = [];
    gruplar[k].push(urun);
    return gruplar;
  }, {});

  const toggleKategori = (ad) => setAcikKategori(acikKategori === ad ? null : ad);
  const mevcutKategoriler = [...new Set(menu.map(item => item.kategori))].filter(k=>k).sort();

  const handleKategoriSelect = (e) => {
    const val = e.target.value;
    if (val === "__YENI_EKLE__") {
      setManuelKategoriModu(true);
      setYeniKategori("");
    } else {
      setManuelKategoriModu(false);
      setYeniKategori(val);
    }
  };

  return (
    <div className="menu-yonetimi-container" style={{marginTop: '30px'}}>
      <button onClick={() => setMenuAcik(!menuAcik)} style={{marginBottom: '10px', padding:'10px'}}>
        {menuAcik ? "Menü Yönetimini Gizle" : "Menü Yönetimini Göster / Düzenle"}
      </button>
      
      {menuAcik && (
        <div className="menu-yonetimi">
          <h3>Yeni Ürün Ekle</h3>
          <form onSubmit={handleUrunEkle} className="urun-ekle-form">
            <div style={{display:'flex', flexDirection:'column', gap:'10px', width:'100%'}}>
                <div style={{display:'flex', gap:'10px'}}>
                    <input type="text" value={yeniAd} onChange={(e) => setYeniAd(e.target.value)} placeholder="Ürün Adı" required style={{flex:2}} />
                    <input type="number" value={yeniFiyat} onChange={(e) => setYeniFiyat(e.target.value)} placeholder="Fiyat" required style={{flex:1}}/>
                </div>
                
                <div style={{display:'flex', gap:'10px'}}>
                    {manuelKategoriModu ? (
                        <div style={{display:'flex', width:'100%', gap:'5px', flex:1}}>
                            <input type="text" value={yeniKategori} onChange={(e) => setYeniKategori(e.target.value)} placeholder="Yeni Kategori..." required autoFocus style={{flex:1}}/>
                            <button type="button" onClick={() => setManuelKategoriModu(false)} style={{background:'#95a5a6'}}>✖</button>
                        </div>
                    ) : (
                        <select value={yeniKategori} onChange={handleKategoriSelect} required style={{flex:1, padding:'8px', border:'1px solid #d1d5db', borderRadius:'6px'}}>
                            <option value="">Kategori Seç...</option>
                            {mevcutKategoriler.map(k=><option key={k} value={k}>{k}</option>)}
                            <option disabled>──────────</option>
                            <option value="__YENI_EKLE__" style={{color:'blue', fontWeight:'bold'}}>+ Yeni Kategori</option>
                        </select>
                    )}
                </div>

                {/* --- LİNK KUTUSU --- */}
                <div style={{border:'1px solid #eee', padding:'10px', borderRadius:'5px', backgroundColor:'white'}}>
                    <label style={{display:'block', marginBottom:'5px', fontSize:'0.9em', fontWeight:'bold'}}>Resim Linki (Opsiyonel):</label>
                    <input 
                        type="text" 
                        value={yeniGorselLink} 
                        onChange={(e) => setYeniGorselLink(e.target.value)} 
                        placeholder="https://site.com/yemek.jpg" 
                        style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px'}}
                    />
                </div>

                <button type="submit" style={{padding:'10px', background:'#3498db'}}>Ürünü Kaydet</button>
            </div>
          </form>

          <h3>Mevcut Menü</h3>
          <div className="kategori-listesi">
            {Object.keys(kategorilereGoreUrunler).sort().map((kategoriAdi) => (
              <div key={kategoriAdi} className="kategori-kutusu">
                <div className="kategori-baslik" onClick={() => toggleKategori(kategoriAdi)}>
                  <span>{kategoriAdi} ({kategorilereGoreUrunler[kategoriAdi].length})</span>
                  <span>▼</span>
                </div>
                <div className={`kategori-icerik ${acikKategori === kategoriAdi ? 'acik' : ''}`}>
                  {kategorilereGoreUrunler[kategoriAdi].map((urun) => (
                    <div key={urun.id} className="kategori-urun-item">
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                          <div style={{width:'40px', height:'40px', background:'#eee', borderRadius:'4px', overflow:'hidden'}}>
                              {urun.gorsel ? <img src={urun.gorsel} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <span style={{fontSize:'8px', display:'flex', height:'100%', alignItems:'center', justifyContent:'center'}}>Yok</span>}
                          </div>
                          <span>{urun.ad} <strong>({urun.fiyat} TL)</strong></span>
                      </div>
                      <div>
                        {/* Resim Güncelleme Butonu */}
                        <button className="btn-update" onClick={()=>handleResimLinkGuncelle(urun.id, urun.gorsel)} title="Resim Linkini Değiştir">🔗</button>
                        <button className="btn-update" onClick={()=>handleFiyatGuncelle(urun.id, urun.fiyat)}>💰</button>
                        <button className="btn-delete" onClick={()=>handleUrunSil(urun.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------------
// 3. SİPARİŞ DÜZENLEME MODALI (NOT DÜZENLEME EKLENDİ)
// -------------------------------------------------------------------
function SiparisDuzenleModal({ siparis, kapat, kaydet, menu }) {
  const [duzenlenenUrunler, setDuzenlenenUrunler] = useState([...siparis.urunler]);
  const [yeniNot, setYeniNot] = useState(siparis.ozelNot || ""); 
  const [secilenYeniUrunId, setSecilenYeniUrunId] = useState("");

  const arttir = (index) => {
    const yeniListe = [...duzenlenenUrunler];
    yeniListe[index].adet += 1;
    setDuzenlenenUrunler(yeniListe);
  };

  const azalt = (index) => {
    const yeniListe = [...duzenlenenUrunler];
    if (yeniListe[index].adet > 1) {
      yeniListe[index].adet -= 1;
      setDuzenlenenUrunler(yeniListe);
    }
  };

  const urunSil = (index) => {
    const yeniListe = duzenlenenUrunler.filter((_, i) => i !== index);
    setDuzenlenenUrunler(yeniListe);
  };

  const yeniUrunEkle = () => {
    if (!secilenYeniUrunId) return;
    const menudekiUrun = menu.find(u => u.id === secilenYeniUrunId);
    if (!menudekiUrun) return;

    const varMi = duzenlenenUrunler.find(u => u.urunAdi === menudekiUrun.ad);
    if (varMi) {
      setDuzenlenenUrunler(duzenlenenUrunler.map(u => u.urunAdi === menudekiUrun.ad ? {...u, adet: u.adet + 1} : u));
    } else {
      setDuzenlenenUrunler([...duzenlenenUrunler, { urunAdi: menudekiUrun.ad, fiyat: menudekiUrun.fiyat, adet: 1 }]);
    }
    setSecilenYeniUrunId(""); 
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Siparişi Düzenle: {siparis.masaNo}</h3>
          <button onClick={kapat} style={{background:'transparent', border:'none', fontSize:'1.5em', cursor:'pointer', color:'#333'}}>&times;</button>
        </div>
        
        <ul className="modal-item-list">
          {duzenlenenUrunler.map((urun, index) => (
            <li key={index} className="modal-item">
              <span>{urun.urunAdi} ({urun.fiyat} TL)</span>
              <div className="qty-controls">
                 <button onClick={() => azalt(index)}>-</button>
                 <span>{urun.adet}</span>
                 <button onClick={() => arttir(index)}>+</button>
                 <button onClick={() => urunSil(index)} className="btn-modal-sil">Sil</button>
              </div>
            </li>
          ))}
        </ul>

        <div className="modal-add-new">
          <select value={secilenYeniUrunId} onChange={(e) => setSecilenYeniUrunId(e.target.value)}>
            <option value="">Listeye ürün ekle...</option>
            {menu.map(u => (
              <option key={u.id} value={u.id}>{u.ad} - {u.fiyat} TL</option>
            ))}
          </select>
          <button onClick={yeniUrunEkle} style={{background:'#2ecc71', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', padding:'8px'}}>Ekle</button>
        </div>

        <div className="modal-note-area">
            <label>Özel Not:</label>
            <textarea 
              value={yeniNot} 
              onChange={(e) => setYeniNot(e.target.value)} 
              placeholder="Müşteri notu buraya..."
            />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={kapat}>İptal</button>
          <button className="btn-save" onClick={() => kaydet(siparis.id, duzenlenenUrunler, yeniNot)}>Değişiklikleri Kaydet</button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// 4. SİPARİŞ PANELİ
// -------------------------------------------------------------------
function SiparisPaneli() {
  const [siparisler, setSiparisler] = useState([]);
  const [menu, setMenu] = useState([]); 
  const [duzenlenecekSiparis, setDuzenlenecekSiparis] = useState(null); 
  const [zamanTetikleyici, setZamanTetikleyici] = useState(0);
  const [sesAktif, setSesAktif] = useState(false);
  
  // useRef ile önceki değeri takip et (closure problemi çözümü)
  const oncekiBekleyenSayisiRef = useRef(0);
  const sesAktifRef = useRef(sesAktif);

  // Ref'i her değiştiğinde güncelle
  useEffect(() => {
    sesAktifRef.current = sesAktif;
    console.log("🔄 sesAktifRef güncellendi:", sesAktif);
  }, [sesAktif]);

  // ⚡ SÜPER GÜÇLÜ ALARM SESİ - 9 beep!
  const bildirimSesiCal = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Tek bir beep sesi oluştur (daha güçlü!)
      const beep = (delay, frequency = 900, duration = 0.5, volume = 0.8) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square'; // Square wave daha keskin ses
        
        // MAKSIMUM ses seviyesi!
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + duration);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + duration);
      };
      
      // 🚨 ALARM PATTERN - 9 beep (3x3)
      
      // Set 1: Hızlı 3 beep (Dikkat çekici!)
      beep(0, 950, 0.25, 0.8);
      beep(0.3, 950, 0.25, 0.8);
      beep(0.6, 950, 0.25, 0.8);
      
      // Kısa pause
      
      // Set 2: Orta tempo 3 beep (Vurgulamalı)
      beep(1.1, 1100, 0.4, 0.85);
      beep(1.6, 1100, 0.4, 0.85);
      beep(2.1, 1100, 0.4, 0.85);
      
      // Kısa pause
      
      // Set 3: Uzun 3 beep (KAÇIRILMAZ!)
      beep(2.8, 1200, 0.6, 0.9);
      beep(3.5, 1200, 0.6, 0.9);
      beep(4.2, 1200, 0.6, 0.9);
      
      console.log("� SÜPER GÜÇLÜ ALARM! (9 beep, ~5 saniye)");
    } catch (err) {
      console.error("❌ Ses hatası:", err);
    }
  };

  useEffect(() => {
    let ilkYukleme = true;
    
    const q = query(collection(db, "siparisler"), orderBy("siparisZamani", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const yeniSiparisler = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Yeni sipariş kontrolü - "Yeni" veya "Bekliyor" durumundaki siparişler
      const bekleyenSiparisler = yeniSiparisler.filter(s => 
        s.durum === "Yeni" || s.durum === "Bekliyor" || !s.tamamlandi
      );
      const yeniBekleyenSayisi = bekleyenSiparisler.length;
      
      // İlk yükleme değilse VE bekleyen sipariş sayısı arttıysa VE ses aktifse
      if (!ilkYukleme && yeniBekleyenSayisi > oncekiBekleyenSayisiRef.current && sesAktifRef.current) {
        console.log("🔔 YENİ SİPARİŞ! Ses çalınıyor...");
        bildirimSesiCal();
      }
      
      oncekiBekleyenSayisiRef.current = yeniBekleyenSayisi;
      setSiparisler(yeniSiparisler);
      ilkYukleme = false; // İlk yüklemeden sonra flag'i kapat
    });
    
    const menuGetir = async () => {
       const snap = await getDocs(collection(db, "urunler"));
       setMenu(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }
    menuGetir();

    // İlk yüklemede eski siparişleri temizle
    eskiSiparisleriTemizle();
    
    // Her dakika hem zaman güncellemesi hem temizlik yap
    const interval = setInterval(() => {
      setZamanTetikleyici(p => p + 1);
      eskiSiparisleriTemizle();
    }, 60000);
    
    return () => { unsubscribe(); clearInterval(interval); };
  }, [siparisler]);

  const durumDegistir = async (id, yeniDurum) => {
    const guncellemeler = { durum: yeniDurum };
    
    // Eğer durum "Tamamlandı" ise, silme zamanını kaydet
    if (yeniDurum === "Tamamlandı") {
      const silmeZamani = Date.now() + (24 * 60 * 60 * 1000); // 24 saat sonra
      guncellemeler.silinecekZaman = silmeZamani;
      console.log("⏰ Sipariş tamamlandı. 24 saat sonra silinecek:", new Date(silmeZamani).toLocaleString('tr-TR'));
    }
    
    await updateDoc(doc(db, "siparisler", id), guncellemeler);
  };
  
  // Silinmesi gereken eski siparişleri temizle
  const eskiSiparisleriTemizle = async () => {
    const simdi = Date.now();
    
    siparisler.forEach(async (siparis) => {
      if (siparis.silinecekZaman && siparis.silinecekZaman < simdi) {
        try {
          await deleteDoc(doc(db, "siparisler", siparis.id));
          console.log("🗑️ Eski sipariş silindi:", siparis.masaNo);
        } catch (err) {
          console.error("❌ Silme hatası:", err);
        }
      }
    });
  };

  const siparisiSil = async (id) => {
    if(window.confirm("Bu sipariş kaydı tamamen silinecek. Emin misiniz?")) {
      await deleteDoc(doc(db, "siparisler", id));
    }
  };

  const siparisIcerigiGuncelle = async (id, yeniUrunListesi, yeniNot) => {
    try {
      await updateDoc(doc(db, "siparisler", id), { 
        urunler: yeniUrunListesi,
        ozelNot: yeniNot 
      });
      setDuzenlenecekSiparis(null); 
    } catch (e) {
      alert("Güncelleme hatası!");
      console.error(e);
    }
  };

  const getSatirBilgisi = (siparis) => {
    if (!siparis.siparisZamani) return { sureMetni: "--", sinif: "satir-yeni" };
    const farkDk = Math.floor((new Date() - siparis.siparisZamani.toDate()) / 60000);

    let sureMetni = `${farkDk} dk`;
    if (farkDk === 0) sureMetni = "Az önce";
    if (farkDk > 60) sureMetni = `${Math.floor(farkDk / 60)} sa ${farkDk % 60} dk`;

    let sinif = "";
    if (siparis.durum === "Tamamlandı") {
      sinif = "satir-tamamlandi";
    } else {
      if (farkDk <= 10) sinif = "satir-yeni";
      else if (farkDk > 10 && farkDk < 30) { sinif = "satir-bekleniyor"; sureMetni += " (Bekliyor)"; }
      else { sinif = "satir-gecikti"; sureMetni += " (Gecikti!)"; }
    }
    return { sureMetni, sinif };
  };

  return (
    <div className="App">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>Yönetim Paneli</h1>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <button 
            onClick={() => {
              const yeniDurum = !sesAktif;
              setSesAktif(yeniDurum);
              console.log("🔊 Ses durumu:", yeniDurum ? "AÇIK" : "KAPALI");
              
              if (yeniDurum) {
                // Ses aktif edildiğinde test sesi çal
                console.log("🎵 Test sesi çalınıyor...");
                try {
                  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();
                  
                  oscillator.connect(gainNode);
                  gainNode.connect(audioContext.destination);
                  
                  oscillator.frequency.value = 600;
                  oscillator.type = 'sine';
                  
                  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                  
                  oscillator.start(audioContext.currentTime);
                  oscillator.stop(audioContext.currentTime + 0.3);
                  
                  console.log("✅ Test sesi çalındı!");
                } catch (err) {
                  console.error("❌ Ses hatası:", err);
                }
              }
            }}
            style={{
              backgroundColor: sesAktif ? '#10b981' : '#6b7280',
              color:'white',
              border:'none',
              padding:'8px 15px',
              borderRadius:'5px',
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              gap:'5px'
            }}
          >
            {sesAktif ? '🔔 Ses Açık' : '🔕 Ses Kapalı'}
          </button>
          <button onClick={() => auth.signOut()} style={{backgroundColor:'#333', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>Çıkış</button>
        </div>
      </div>
      <hr />
      
      {duzenlenecekSiparis && (
        <SiparisDuzenleModal 
          siparis={duzenlenecekSiparis} 
          menu={menu}
          kapat={() => setDuzenlenecekSiparis(null)}
          kaydet={siparisIcerigiGuncelle}
        />
      )}

      <h2>Gelen Siparişler</h2>
      
      <div className="table-container">
        <table className="siparis-tablosu">
          <thead>
            <tr>
              <th>Masa</th>
              <th>Sipariş İçeriği</th>
              <th>Özel Not</th>
              <th>Süre</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {siparisler.map((siparis) => {
              const { sureMetni, sinif } = getSatirBilgisi(siparis);
              return (
                <tr key={siparis.id} className={sinif}>
                  <td style={{fontWeight:'bold'}}>{siparis.masaNo}</td>
                  <td>
                    <ul style={{paddingLeft:'20px', margin:0}}>
                      {siparis.urunler.map((u, i) => (
                        <li key={i}>{u.adet}x {u.urunAdi}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{color: siparis.ozelNot ? '#d32f2f' : '#999', fontStyle:'italic', fontWeight: siparis.ozelNot ? 'bold' : 'normal'}}>
                    {siparis.ozelNot || "Not yok"}
                  </td>
                  <td style={{minWidth: '110px'}}>
                      <div style={{fontWeight:'bold'}}>{sureMetni}</div>
                      <div style={{fontSize:'0.8em', color:'#555'}}>{siparis.siparisZamani?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td><span style={{fontWeight:'bold'}}>{siparis.durum || "Yeni"}</span></td>
                  <td>
                     {siparis.durum !== "Tamamlandı" && (
                       <button className="btn-action btn-edit" onClick={() => setDuzenlenecekSiparis(siparis)}>Düzenle</button>
                     )}
                    {sinif !== "satir-zaman-asimi" && siparis.durum === "Yeni" && (
                      <button className="btn-action btn-hazirla" onClick={() => durumDegistir(siparis.id, "Hazırlanıyor")}>Hazırla</button>
                    )}
                    {sinif !== "satir-zaman-asimi" && siparis.durum === "Hazırlanıyor" && (
                      <button className="btn-action btn-tamamla" onClick={() => durumDegistir(siparis.id, "Tamamlandı")}>Tamamla</button>
                    )}
                     <button className="btn-action btn-sil" onClick={() => siparisiSil(siparis.id)}>
                       {sinif === "satir-zaman-asimi" ? "Temizle" : "Sil"}
                     </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {siparisler.length === 0 && <p style={{padding:'20px', textAlign:'center'}}>Henüz sipariş yok.</p>}
      </div>

      <hr style={{margin:'40px 0'}} />
      <MenuYonetimi />
    </div>
  );
}

// -------------------------------------------------------------------
// 5. ANA KONTROLCÜ
// -------------------------------------------------------------------
function App() {
  const [girisYapti, setGirisYapti] = useState(false); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGirisYapti(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); 

  if (loading) return <p>Yükleniyor...</p>;
  return girisYapti ? <SiparisPaneli /> : <LoginPage setGirisYapti={setGirisYapti} />;
}

export default App;