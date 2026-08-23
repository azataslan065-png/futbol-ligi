// KULLANICI TALEBİ ("Projeksiyon üzerinden siteyi ana ekrana alamıyoruz" - KÖK SEBEP):
// Chrome, bir siteyi "yüklenebilir" (PWA olarak ana ekrana eklenebilir) sayıp menüde bu
// seçeneği GÖSTEREBİLMESİ için manifest.json'un yanında GEÇERLİ bir Service Worker kaydı da
// arar - bu dosya olmadan menüde seçenek hiç görünmez (tam olarak bildirilen sorun budur).
// Bu, kasıtlı olarak MÜMKÜN OLAN EN BASİT service worker'dır: hiçbir şeyi önbelleğe almaz,
// sadece her isteği ağdan olduğu gibi geçirir - bu uygulama Firebase'den CANLI veri çektiği
// için içerik önbelleğe alınırsa eski/bayat veri gösterebilir, o yüzden bilinçli olarak
// sadece "passthrough" (dokunmadan geçiren) bir davranış uygulanır.
self.addEventListener('install', function(event){
  self.skipWaiting();
});
self.addEventListener('activate', function(event){
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function(event){
  event.respondWith(fetch(event.request));
});
