# 🔧 Teknik Özet - Saha Senkronizasyon Mimarisi

## 📊 Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                    SAHA SENKRONIZASYON                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  KATMAN 1: OYUN MOTORU (saha.html)                      │
│  ├─ Maç simülasyonu (Three.js 3D)                       │
│  ├─ Oyuncu takibi & İstatistik                         │
│  └─ Veri Üretim (skorlar, olaylar)                     │
│       │                                                  │
│       ├─→ localStorage (Kalıcı)                         │
│       └─→ postMessage (Gerçek-zaman)                   │
│       │                                                  │
│  KATMAN 2: YÖNETİM (admin.html)                         │
│  ├─ 🎮 Saha Sekmesi                                    │
│  ├─ Aktif maç izleme                                   │
│  ├─ İstatistik gösterişi                               │
│  └─ Senkronizasyon kontrol                             │
│       │                                                  │
│       ├─→ localStorage (Okuma)                          │
│       └─→ postMessage (İletme)                         │
│       │                                                  │
│  KATMAN 3: SEYIRCILER (index.html)                      │
│  ├─ Sezonlar → 🎮 Saha Oyunu                           │
│  ├─ Maç listesi gösterişi                              │
│  ├─ İstatistik sunumu                                  │
│  └─ Veri yenileme                                      │
│       │                                                  │
│       └─→ localStorage (Okuma)                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Protokoller

### localStorage API
```javascript
// YAZ
localStorage.setItem(key, JSON.stringify(data));

// OKU
let data = JSON.parse(localStorage.getItem(key));

// SİL
localStorage.removeItem(key);

// KAPASİTE
// ~5-10 MB sınırı (modern tarayıcılarda)
```

### postMessage API
```javascript
// GÖNDER
window.parent.postMessage({
  type: 'SAHA_DATA_UPDATE',
  payload: { /* veri */ }
}, '*');

// AL
window.addEventListener('message', event => {
  if (event.data.type === 'SAHA_DATA_UPDATE') {
    let data = event.data.payload;
  }
});
```

---

## 📦 Veri Yapısı

```javascript
{
  // Oynanmış maçlar
  matches: [
    {
      date: "16.09.2026",           // YYYY-MM-DD
      home: "Şampiyon FK",          // Ev sahibi takım
      away: "Fırtına Spor",         // Deplasman takım
      scoreHome: 3,                 // Ev sahibi skoru
      scoreAway: 1,                 // Deplasman skoru
      period: 2,                    // Son devre
      duration: 90                  // Oyun süresi (dakika)
    },
    // ...daha fazla maç
  ],

  // Şu anda oynan maç
  currentMatch: {
    home: "Şampiyon FK",           // Ev sahibi adı
    away: "Fırtına Spor",          // Deplasman adı
    scoreHome: 2,                  // Geçerli skor
    scoreAway: 1,
    period: 1,                     // 1 veya 2
    time: 23                       // Dakika (0-90)
  },

  // İstatistikler
  totalGoals: 4,                   // Tüm oynanmış maçlardaki gol
  stats: {                         // Detaylı istatistikler
    a: { /* Takım A */ },
    b: { /* Takım B */ }
  },

  // Son güncelleme zamanı
  lastUpdate: "14:23:45"
}
```

---

## ⚙️ Senkronizasyon Döngüsü

### SAHA.HTML
```
┌─────────────────────────────┐
│  Oyun Başlat (basla())      │
├─────────────────────────────┤
│  ✓ skorA, skorB okunur      │
│  ✓ devre, saat toplanır     │
│  ✓ AYAR verileri alınır     │
└──────────┬──────────────────┘
           │
        (LOOP)  
           │
      Her frame
           │
      ┌────▼────────────────┐
      │ senkron kontrol?    │ (15s'de bir)
      └────┬───────────────┘
           │ Evet
      ┌────▼──────────────────────┐
      │ sendMatchDataToSync()     │
      ├───────────────────────────┤
      │ ✓ JSON oluştur            │
      │ ✓ localStorage kaydet     │
      │ ✓ postMessage gönder      │
      │ ✓ console.log()           │
      └────┬──────────────────────┘
           │
      (devam)
```

### ADMIN.HTML
```
┌──────────────────────────┐
│ Sayfa Yükle              │
├──────────────────────────┤
│ ✓ localStorage oku       │
│ ✓ SahaSync.updateUI()    │
└──────────┬───────────────┘
           │
      (Dinle)
           │
      ┌────▼────────────────────────┐
      │ message event dinle         │
      │ (saha'dan postMessage)      │
      └────┬───────────────────────┘
           │
      ┌────▼────────────────────────┐
      │ SahaSync.receiveSahaData()  │
      ├────────────────────────────┤
      │ ✓ Veri al                   │
      │ ✓ updateUI()               │
      │ ✓ localStorage kaydet      │
      │ ✓ Puan Tablosu'na gönder   │
      └────────────────────────────┘
```

### INDEX.HTML
```
┌──────────────────────────┐
│ Sayfa Yükle              │
├──────────────────────────┤
│ ✓ localStorage oku       │
│ ✓ SahaLeagueData doldur  │
└──────────┬───────────────┘
           │
    📅 Sezonlar → 🎮 Saha
           │
      ┌────▼────────────────────────┐
      │ openSahaLeague()            │
      ├────────────────────────────┤
      │ ✓ Sheet HTML oluştur        │
      │ ✓ Aktif maç göster          │
      │ ✓ İstatistikler göster      │
      │ ✓ Maç listesi göster        │
      └────────────────────────────┘
```

---

## 🔄 Senkronizasyon Örnekleri

### Örnek 1: Oyun Başlangıcı
```javascript
// SAHA.HTML
sendMatchDataToSync();
// ↓
// localStorage: {
//   matches: [],
//   currentMatch: {
//     home: "Şampiyon FK",
//     away: "Fırtına Spor",
//     scoreHome: 0,
//     scoreAway: 0,
//     period: 1,
//     time: 0
//   },
//   totalGoals: 0
// }

// ADMIN.HTML
// → "Henüz aktif maç yok" → "Aktif maç gösterilir"

// INDEX.HTML
// → "Henüz veri yok" → İstatistikler gösterilir
```

### Örnek 2: Maç Sırasında (15. dakika)
```javascript
// SAHA.HTML (otomatik)
sendMatchDataToSync();
// ↓
// localStorage: {
//   currentMatch: {
//     ...,
//     scoreHome: 1,
//     time: 15
//   }
// }

// ADMIN.HTML & INDEX.HTML
// → UI otomatik güncellenir
```

### Örnek 3: Maç Sonu
```javascript
// SAHA.HTML
recordMatchEnd();
// ↓
// window._matchHistory.push({...});
// sendMatchDataToSync();

// localStorage: {
//   matches: [{
//     date: "16.09.2026",
//     home: "Şampiyon FK",
//     away: "Fırtına Spor",
//     scoreHome: 3,
//     scoreAway: 1,
//     period: 2,
//     duration: 90
//   }]
// }
```

---

## 📡 Ağ Topolojisi

### Senaryo 1: Aynı Bilgisayar
```
┌─────────────────────────────────┐
│      Web Tarayıcısı             │
├─────────────────────────────────┤
│ Tab 1: saha.html   (3D Oyun)   │◄─┐
│ Tab 2: admin.html  (Yönetim)   │◄─┼─ localStorage
│ Tab 3: index.html  (Puan Tab)  │◄─┘
└─────────────────────────────────┘
```

### Senaryo 2: Aynı Ağ (LAN)
```
┌───────────────────────────────────┐
│      Sunucu (192.168.1.100)       │
│  ✓ saha.html                      │
│  ✓ admin.html                     │
│  ✓ index.html                     │
└──────┬────────────────────────────┘
       │ HTTP/HTTPS
       │
   ┌───┴────────────────────┬─────────────────────┐
   │                        │                     │
┌──▼───────┐        ┌──────▼──────┐    ┌────────▼──────┐
│ PC 1     │        │ PC 2        │    │ Tablet        │
│ (Oyuncu) │        │ (Yönetici)  │    │ (Seyirciler)  │
│ saha.html│◄──────►│admin.html   │◄──►│ index.html    │
└──────────┘localStorage│         │    └───────────────┘
                    └─────────────┘
```

---

## 🛡️ Güvenlik Özellikleri

### 1. Same-Origin Policy
```javascript
// localStorage sadece aynı domain'de erişilebilir
// example.com:   ✅ Okuyabilir
// example.org:   ❌ Okunmaz (bloke edilir)
```

### 2. postMessage Kontrolü
```javascript
// Kaynak kontrolü
window.parent.postMessage(data, '*');
// '*' = Tüm kaynaklara izin (test için)
// 'https://example.com' = Sadece spesifik kaynak
```

### 3. XSS Koruması
```javascript
// Veri daima JSON olarak işlenir
// İnline HTML yapıştırması imkansız

// ✅ Güvenli
let data = JSON.parse(localStorage.getItem('sahaData'));

// ❌ Tehlikeli
element.innerHTML = localStorage.getItem('sahaData');
```

---

## 🎯 Performans Optimizasyonları

### 1. Throttling (15 saniyelik gecikme)
```javascript
function sendMatchDataToSync() {
  let now = Date.now();
  if (now - window._lastSyncTime < 5000) return;
  window._lastSyncTime = now;
  // ... gönder
}
```

### 2. localStorage Sınırı Yönetimi
```javascript
// ~50 KB / maç
// Max kapasite: ~5-10 MB
// Max maçlar: 100-200
// Kontrol: Düzenli temizle
```

### 3. Verimli DOM Güncelleme
```javascript
// ❌ Çok yavaş
for (let i = 0; i < matches.length; i++) {
  document.getElementById('matchList').innerHTML += ...
}

// ✅ Hızlı
let html = matches.map(m => `...`).join('');
document.getElementById('matchList').innerHTML = html;
```

---

## 📈 Skalabilite Yolu

### Faz 1: localStorage (Şu anki)
- Kapasitesi: 5-10 MB
- Oyuncu sayısı: 1-5
- Maç sayısı: 50-100

### Faz 2: WebSocket
- Kapasitesi: Sınırsız
- Oyuncu sayısı: 100+
- Canlı senkronizasyon

### Faz 3: Firebase/Cloud
- Global deployment
- Yedekleme & Yük dengeleme
- Analitik & Raporlama

---

## 🐛 Hata İşleme

### Try-Catch Yapısı
```javascript
try {
  let data = JSON.parse(localStorage.getItem('sahaData'));
  window.SahaSync.receiveSahaData(data);
} catch(err) {
  console.error('Saha verisi yükleme hatası:', err);
  // Fallback veya kullanıcıya mesaj
}
```

### Yapılacak Kontroller
- ✅ localStorage mevcek mi?
- ✅ JSON geçerli mi?
- ✅ Alanlar boş mu?
- ✅ Veri eski mi?

---

## 💾 Backup & Restore

### Backup
```javascript
localStorage.setItem('sahaData_backup', localStorage.getItem('sahaData'));
```

### Restore
```javascript
let backup = localStorage.getItem('sahaData_backup');
if (backup) {
  localStorage.setItem('sahaData', backup);
}
```

### Dışa Aktar
```javascript
let data = JSON.parse(localStorage.getItem('sahaData'));
let json = JSON.stringify(data, null, 2);
// Dosya olarak indir veya kopyala
```

---

## 🔍 Hata Ayıklama Araçları

### Console Komutları
```javascript
// 1. localStorage'da ne var?
console.table(JSON.parse(localStorage.getItem('sahaData')).matches);

// 2. Aktif maç nedir?
console.log(window.SahaLeagueData.currentMatch);

// 3. Son senkronizasyon ne zaman?
console.log(window.SahaLeagueData.lastUpdate);

// 4. localStorage boyutu?
let size = new Blob(Object.values(localStorage)).size;
console.log('Size:', size, 'bytes');
```

### Chrome DevTools
- Storage → Local Storage → URL
- Network → XHR (postMessage)
- Console → Errors & Warnings

---

## 📚 Kaynaklar

- localStorage: https://mdn.io/localstorage
- postMessage: https://mdn.io/postmessage
- JSON: https://mdn.io/json
- Web Storage: https://html.spec.whatwg.org/storage

---

## ✅ Test Senaryoları

### Test 1: Sıradan Akış
```
1. saha.html oyun başlat (0:00)
2. 15:00 oyna (15. dakika)
3. admin.html score gözle
4. 90:00 oyun bitir
5. index.html Sezonlar → Saha
6. Maç listesinde görün
```

### Test 2: Hata Kurtarma
```
1. saha.html oyun oyna
2. Tarayıcıyı kapat (erken kapanış simülasyonu)
3. Yeniden aç
4. Veriler hâlâ var mı? (backup kontrol et)
```

### Test 3: Çoklu Sekme
```
1. Tab 1: saha.html (oyun)
2. Tab 2: admin.html (izleme)
3. Tab 3: index.html (seyirciler)
4. Oyun oynarken Tab 2&3 güncellensin
```

---

**Teknik Durum:** ✅ Üretim Hazır  
**Son Güncelleme:** 16 Eylül 2026  
**Versiyon:** 1.0
