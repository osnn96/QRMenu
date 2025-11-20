// qr-menu-admin/src/App.jsx

import { useState, useEffect } from 'react';
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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setGirisYapti(true); 
    } catch (err) {
      console.error(err);
      setError("Hatalı e-posta veya şifre.");
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

  useEffect(() => {
    const q = query(collection(db, "siparisler"), orderBy("siparisZamani", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSiparisler(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const menuGetir = async () => {
       const snap = await getDocs(collection(db, "urunler"));
       setMenu(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }
    menuGetir();

    const interval = setInterval(() => setZamanTetikleyici(p => p + 1), 60000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, []);

  const durumDegistir = async (id, yeniDurum) => {
    await updateDoc(doc(db, "siparisler", id), { durum: yeniDurum });
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
        <button onClick={() => auth.signOut()} style={{backgroundColor:'#333', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>Çıkış</button>
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