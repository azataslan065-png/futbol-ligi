// KOK SEBEP ("Saha uygulaması hep M sürümünde"): eski kod fetch olayında ONCE
// onbellege bakiyordu ve varsa AGA HIC UGRAMADAN onu donduruyordu:
//   caches.match(e.request).then((cached) => cached || fetch(e.request)...)
// saha.html, install sirasinda ASSETS listesiyle onbellege BIR KEZ yazildiktan
// sonra, sunucudaki gercek dosya kac kez guncellenirse guncellensin, kullanici
// HICBIR ZAMAN yeni surumu gormuyordu - sadece service-worker.js dosyasinin
// KENDISI byte byte degisip tarayici yeni bir "install" calistirdiginda onbellek
// bir kerelik yenileniyordu (bu yuzden versiyon hep dosyanin en son SW-degisikligi
// anindaki halinde donup kaliyordu). CACHE adi da sabitti ('saha-v1') - install
// tekrar tetiklense bile eski girdiler activate'te asla temizlenmiyordu.
//
// COZUM: AG-ONCELIKLI (network-first) stratejiye gecildi - her istekte once agdan
// TAZE kopya denenir; basarili olursa hem kullaniciya o gonderilir hem onbellek
// o kopyayla guncellenir. Ag basarisiz olursa (cevrimdisi/baglanti yok) ancak o
// zaman onbellekteki en son bilinen kopyaya dusulur. Ayrica CACHE adi surume
// baglandi ve activate'te ESKI onbellekler acikca siliniyor.
const CACHE = 'saha-2026-09-18-AA';
const ASSETS = ['./saha.html', './icon-192.png', './icon-512.png', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((res) => {
      var kopya = res.clone();
      caches.open(CACHE).then((c) => { try{ c.put(e.request, kopya); }catch(err){} }).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
