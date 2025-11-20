// qr-menu-musteri/src/App.jsx

import { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore"; 
import './App.css'; 

// -------------------------------------------------------------
// 1. VARSAYILAN GÖRSEL (Veritabanında resim yoksa bu görünür)
// -------------------------------------------------------------
// Buraya kendi logonuzu veya genel bir yemek tabağı resmi koyabilirsiniz.
const VARSAYILAN_RESIM = "";

function App() {
  const [menu, setMenu] = useState([]);
  const [sepet, setSepet] = useState([]); 
  const [ozelNot, setOzelNot] = useState(""); 
  const [masaNo, setMasaNo] = useState("Masa 1");
  const [sepetAcik, setSepetAcik] = useState(false); 
  const [yukleniyor, setYukleniyor] = useState(true);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const masa = params.get('masa');
    if (masa) setMasaNo(`Masa ${masa}`);

    const fetchMenu = async () => {
      const urunlerKoleksiyonu = collection(db, 'urunler'); 
      const urunSnapshot = await getDocs(urunlerKoleksiyonu);
      const urunListesi = urunSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      urunListesi.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
      setMenu(urunListesi);
      setYukleniyor(false);
    };
    fetchMenu();
  }, []);

  // --- GRUPLAMA MANTIĞI ---
  const kategoriler = [...new Set(menu.map(item => item.kategori || "Diğer"))].sort();
  
  const kategorilereGoreUrunler = menu.reduce((gruplar, urun) => {
    const kat = urun.kategori || "Diğer";
    if (!gruplar[kat]) gruplar[kat] = [];
    gruplar[kat].push(urun);
    return gruplar;
  }, {});

  // --- SEPET İŞLEMLERİ ---
  const sepeteEkle = (urun) => {
    const varOlan = sepet.find(item => item.id === urun.id);
    if (varOlan) {
      setSepet(sepet.map(item => item.id === urun.id ? { ...item, adet: item.adet + 1 } : item));
    } else {
      setSepet([...sepet, { ...urun, adet: 1 }]);
    }
  };

  const sepettenCikar = (urunId) => {
    const varOlan = sepet.find(item => item.id === urunId);
    if (varOlan.adet > 1) {
      setSepet(sepet.map(item => item.id === urunId ? { ...item, adet: item.adet - 1 } : item));
    } else {
      setSepet(sepet.filter(item => item.id !== urunId));
    }
  };

  const siparisiGonder = async () => {
    if (sepet.length === 0) return;
    const yeniSiparis = {
      masaNo: masaNo,
      ozelNot: ozelNot,
      durum: "Yeni",
      siparisZamani: Timestamp.now(),
      urunler: sepet.map(item => ({ urunAdi: item.ad, adet: item.adet, fiyat: item.fiyat }))
    };

    try {
      await addDoc(collection(db, "siparisler"), yeniSiparis);
      alert("Siparişiniz mutfağa iletildi! Afiyet olsun.");
      setSepet([]);
      setOzelNot("");
      setSepetAcik(false);
    } catch (e) {
      console.error(e);
      alert("Bir hata oluştu.");
    }
  };

  // Toplam Tutar Hesapla
  const toplamTutar = sepet.reduce((toplam, item) => toplam + (item.fiyat * item.adet), 0);

  // Kategoriye Kaydırma (Scroll)
  const scrollToCategory = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 110;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  if (yukleniyor) return <div style={{padding:'20px', textAlign:'center'}}>Menü Yükleniyor...</div>;

  return (
    <div className="App">
      {/* --- HEADER --- */}
      <header>
        <h1>Restoran Menüsü</h1>
        <small style={{color:'#666'}}>{masaNo}</small>
      </header>

      {/* --- KATEGORİ NAVİGASYONU (YATAY) --- */}
      <div className="kategori-nav">
        {kategoriler.map(kat => (
          <a key={kat} className="nav-item" onClick={() => scrollToCategory(kat)}>
            {kat}
          </a>
        ))}
      </div>

      {/* --- ÜRÜN LİSTESİ --- */}
      <div className="ana-icerik">
        {kategoriler.map(kat => (
          <div key={kat} id={kat} className="kategori-bolumu">
            <div className="kategori-baslik">{kat}</div>
            <div className="urun-listesi">
              {kategorilereGoreUrunler[kat].map(urun => (
                <div key={urun.id} className="urun-karti">
                  
                  {/* --- RESİM ALANI GÜNCELLENDİ --- */}
                  <img 
                    // 1. Veritabanında görsel var mı? Varsa onu kullan.
                    // 2. Yoksa? VARSAYILAN_RESIM kullan.
                    src={urun.gorsel ? urun.gorsel : VARSAYILAN_RESIM} 
                    alt={urun.ad} 
                    className="urun-gorsel"
                    loading="lazy"
                    // Eğer veritabanındaki link kırık çıkarsa (404), otomatik olarak varsayılanı göster
                    onError={(e) => { e.target.src = VARSAYILAN_RESIM; }} 
                  />
                  
                  <div className="urun-bilgi">
                    <div>
                      <h3 className="urun-baslik">{urun.ad}</h3>
                    </div>
                    
                    <div className="fiyat-buton-alani">
                      <span className="urun-fiyat">{urun.fiyat} ₺</span>
                      <button className="btn-ekle" onClick={() => sepeteEkle(urun)}>
                        + EKLE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- SEPET BARI --- */}
      {sepet.length > 0 && !sepetAcik && (
        <div className="sepet-bar" onClick={() => setSepetAcik(true)}>
          <div className="sepet-bar-bilgi">
            <span style={{fontSize:'0.8rem'}}>Sepetim</span>
            <span className="sepet-toplam">{toplamTutar} ₺</span>
          </div>
          <div style={{fontWeight:'bold'}}>Sepeti Gör &gt;</div>
        </div>
      )}

      {/* --- SEPET DETAY MODALI --- */}
      {sepetAcik && (
        <div className="sepet-modal">
          <div className="sepet-header">
            <h2>Sepetim ({masaNo})</h2>
            <button onClick={() => setSepetAcik(false)} style={{background:'transparent', border:'none', fontSize:'1.5rem'}}>&times;</button>
          </div>
          
          <div style={{flex:1, overflowY:'auto'}}>
            {sepet.map(item => (
              <div key={item.id} className="sepet-item">
                <div>
                  <div style={{fontWeight:'bold'}}>{item.ad}</div>
                  <div style={{color:'#666'}}>{item.fiyat} ₺</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <button onClick={() => sepettenCikar(item.id)} style={{width:'30px', height:'30px', borderRadius:'50%', border:'1px solid #ddd', background:'white'}}>-</button>
                  <span style={{fontWeight:'bold'}}>{item.adet}</span>
                  <button onClick={() => sepeteEkle(item)} style={{width:'30px', height:'30px', borderRadius:'50%', border:'1px solid #ddd', background:'white'}}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{borderTop:'1px solid #eee', paddingTop:'20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'1.2rem', fontWeight:'bold', marginBottom:'15px'}}>
              <span>Toplam</span>
              <span>{toplamTutar} ₺</span>
            </div>
            
            <textarea 
              placeholder="Sipariş notu ekle (örn: Acısız olsun)..." 
              rows="2"
              value={ozelNot}
              onChange={(e) => setOzelNot(e.target.value)}
            ></textarea>

            <button className="btn-siparis-tamamla" onClick={siparisiGonder}>
              SİPARİŞİ ONAYLA
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;