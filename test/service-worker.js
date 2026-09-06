/* ══════════════════════════════════════════════════════════════════════════════════════════
   SERVİS ÇALIŞANI - KURULABİLİRLİK İÇİN
   NEDEN VAR: Chrome, Android'de gerçek bir uygulama paketi (WebAPK) üretmek için sitenin
   geçerli bir servis çalışanına sahip olmasını şart koşar. Dosya yoksa "Ana ekrana ekle"
   yine çalışır ama ESKİ TİP kısayol kurulur - ve o kısayol manifest'teki orientation,
   theme_color, display gibi alanları YOK SAYAR.
   Test klasöründe bu dosya bulunmadığı için ekran yönü kilidi ve tema rengi uygulanmıyordu.

   NE YAPMIYOR - BİLEREK: Hiçbir şeyi ÖNBELLEĞE ALMAZ. Uygulama tek bir HTML dosyası olarak
   dağıtılıyor ve sık güncelleniyor; önbellek, kullanıcıların eski sürümde takılı kalmasına
   yol açardı - bu proje geçmişinde tam olarak bu tür sorunlar yaşandı.
   Yalnızca "fetch" olayını dinler ve isteği olduğu gibi ağa iletir. Chrome'un kurulabilirlik
   denetimi bir fetch dinleyicisinin VARLIĞINI arar; ne yaptığına bakmaz.
   ══════════════════════════════════════════════════════════════════════════════════════════ */

// Yeni sürüm beklemeden devreye girsin - eski çalışanın kullanıcıyı eski sürümde tutmasını
// engeller.
self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  // Bu kapsamdaki eski önbellekler varsa temizlenir. Bir önceki sürümde önbellek kullanılmış
  // olabilir; artık kullanılmadığı için geride bırakmak yer kaplar ve karışıklık yaratır.
  e.waitUntil(
    caches.keys().then(function (adlar) {
      return Promise.all(adlar.map(function (ad) { return caches.delete(ad); }));
    }).then(function () {
      return self.clients.claim();
    }).catch(function () { /* önbellek erişimi yoksa sorun değil */ })
  );
});

// Kurulabilirlik için gereken dinleyici. İstek değiştirilmeden ağa iletilir; çevrimdışı
// desteği YOKTUR ve olması da amaçlanmamıştır.
self.addEventListener('fetch', function (e) {
  return;
});
