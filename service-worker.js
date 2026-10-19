/* SAHA / Puan Tablosu servis çalışanı — 2026-10-19-A
   1) Chrome'un "uygulama olarak yükle" koşulu için kayıtlı bir fetch işleyicisi (eskiden tek görevi buydu).
   2) MEDYA ÖNBELLEĞİ: Supabase'deki herkese açık dosyalar (müzik, reklam / gol animasyonu videoları,
      logolar, fotoğraflar) cihaza BİR KEZ indirilir, sonra cihazdan verilir. Supabase trafiği (egress)
      her girişte tekrar harcanmaz.
      - Sayfa HTML'i, Firebase verisi ve diğer her şey önbelleğe ALINMAZ (canlı veri bayatlamasın).
      - Büyük dosyalar (TV'ye yüklenmiş uzun videolar, > BUYUK_SINIR) saklanmaz, eskisi gibi akar.
      - Silinen / değiştirilen dosya: kullanılan her dosya en çok 12 saatte bir HEAD ile (gövdesiz,
        trafiği yok denecek kadar az) doğrulanır; Supabase'de yoksa (400/404) ya da ETag değiştiyse
        cihazdaki kopya silinir. Günde bir tarama, tüm kopyalara aynı kontrolü yapar ve 30 gündür
        kullanılmayanları siler. Toplam boyut TOPLAM_SINIR'ı aşarsa en eski kullanılan silinir.
      - <audio>/<video> parça (Range) isterse, saklanan dosyadan 206 yanıtı kesilerek verilir. */
var MEDYA = 'saha-medya-v1', META_URL = '/__saha-medya-meta__';
var BUYUK_SINIR = 25 * 1024 * 1024, TOPLAM_SINIR = 300 * 1024 * 1024;
var DOGRULA_MS = 12 * 3600e3, TARAMA_MS = 24 * 3600e3, KULLANILMAYAN_MS = 30 * 24 * 3600e3;

self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ad){
    return Promise.all(ad.filter(function(k){ return k.indexOf('saha-medya-') === 0 && k !== MEDYA; })
      .map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function _medyaMi(u){
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/(object|render\/image)\/public\//i.test(u);
}

/* ---- meta: url -> {t: son kullanım, s: boyut, e: etag, k: son doğrulama, b: 1 = büyük, saklanmaz} ---- */
var _meta = null, _metaYazZ = 0;
function metaOku(){
  if(_meta) return Promise.resolve(_meta);
  return caches.open(MEDYA).then(function(c){ return c.match(META_URL); })
    .then(function(r){ return r ? r.json() : {}; }).catch(function(){ return {}; })
    .then(function(m){ if(!_meta) _meta = (m && typeof m === 'object') ? m : {}; if(!_meta.u) _meta.u = {}; return _meta; });
}
function metaYaz(){
  if(_metaYazZ) return;
  _metaYazZ = setTimeout(function(){ _metaYazZ = 0;
    caches.open(MEDYA).then(function(c){
      return c.put(META_URL, new Response(JSON.stringify(_meta || {u:{}}), { headers:{ 'Content-Type':'application/json' } }));
    }).catch(function(){});
  }, 1500);
}

function sil(u){
  return caches.open(MEDYA).then(function(c){ return c.delete(u); }).then(function(){
    if(_meta && _meta.u) delete _meta.u[u]; metaYaz();
  }).catch(function(){});
}

/* Gövdesiz HEAD: dosya hâlâ var mı, değişti mi? Trafik ~ birkaç yüz bayt. */
function dogrula(u, m){
  return fetch(u, { method:'HEAD', mode:'cors', cache:'no-store', credentials:'omit' }).then(function(r){
    var x = _meta.u[u]; if(!x) return;
    if(r.status === 400 || r.status === 404 || r.status === 410) return sil(u);
    if(!r.ok) return;
    var et = r.headers.get('etag') || '';
    if(x.e && et && et !== x.e) return sil(u);
    x.k = Date.now(); metaYaz();
  }).catch(function(){});
}

function taramaGerekirse(){
  return metaOku().then(function(m){
    var simdi = Date.now(); if((m.tarama || 0) > simdi - TARAMA_MS) return;
    m.tarama = simdi; metaYaz();
    var L = Object.keys(m.u), i = 0;
    function sonraki(){
      if(i >= L.length) return boyutKontrol();
      var u = L[i++], x = m.u[u]; if(!x) return sonraki();
      if((x.t || 0) < simdi - KULLANILMAYAN_MS) return sil(u).then(sonraki);
      if(x.b) return sonraki();
      return dogrula(u, m).then(sonraki);
    }
    return sonraki();
  });
}

function boyutKontrol(){
  return metaOku().then(function(m){
    var L = Object.keys(m.u).filter(function(u){ return !m.u[u].b; });
    var top = L.reduce(function(a, u){ return a + (m.u[u].s || 0); }, 0);
    if(top <= TOPLAM_SINIR) return;
    L.sort(function(a, b){ return (m.u[a].t || 0) - (m.u[b].t || 0); });
    var p = Promise.resolve();
    while(top > TOPLAM_SINIR * 0.85 && L.length){ var u = L.shift(); top -= (m.u[u].s || 0); p = p.then(sil.bind(null, u)); }
    return p;
  });
}

/* Tüm dosyayı bir kez indirip saklar. Aynı dosya için aynı anda tek indirme. */
var _indiriliyor = {};
function indirSakla(u){
  if(_indiriliyor[u]) return _indiriliyor[u];
  var p = metaOku().then(function(m){
    var x = m.u[u];
    if(x && x.b) return null;
    return fetch(u, { method:'HEAD', mode:'cors', cache:'no-store', credentials:'omit' }).catch(function(){ return null; }).then(function(h){
      var n = h ? +(h.headers.get('content-length') || 0) : 0;
      if(h && h.ok && n > BUYUK_SINIR){ m.u[u] = { b:1, s:n, t:Date.now() }; metaYaz(); return null; }
      return fetch(u, { mode:'cors', cache:'no-store', credentials:'omit' }).then(function(r){
        if(!r.ok || r.status !== 200) return null;
        return r.blob().then(function(b){
          var bas = new Headers();
          bas.set('Content-Type', r.headers.get('content-type') || b.type || 'application/octet-stream');
          bas.set('Content-Length', String(b.size)); bas.set('Accept-Ranges', 'bytes');
          var yan = new Response(b, { status:200, headers:bas });
          if(b.size > BUYUK_SINIR){ m.u[u] = { b:1, s:b.size, t:Date.now() }; metaYaz(); return yan; }
          return caches.open(MEDYA).then(function(c){ return c.put(u, yan.clone()); }).then(function(){
            m.u[u] = { t:Date.now(), s:b.size, e:r.headers.get('etag') || '', k:Date.now() }; metaYaz();
            boyutKontrol(); return yan;
          }).catch(function(){ return yan; });   // depo dolu vb.: yine de bu seferlik ver
        });
      });
    });
  }).catch(function(){ return null; });
  _indiriliyor[u] = p;
  p.then(function(){ delete _indiriliyor[u]; }, function(){ delete _indiriliyor[u]; });
  return p;
}

/* Range: "bytes=a-b", "bytes=a-", "bytes=-n" */
function parcala(yanit, aralik){
  return yanit.blob().then(function(b){
    var n = b.size, m = /bytes=(\d*)-(\d*)/.exec(aralik || ''), bas, son;
    if(!m) return new Response(b, { status:200, headers:{ 'Content-Type':yanit.headers.get('content-type') || b.type, 'Content-Length':String(n), 'Accept-Ranges':'bytes' } });
    if(m[1] === '' && m[2] !== ''){ bas = Math.max(0, n - (+m[2])); son = n - 1; }
    else { bas = +m[1] || 0; son = m[2] !== '' ? Math.min(+m[2], n - 1) : n - 1; }
    if(bas >= n || bas > son) return new Response('', { status:416, headers:{ 'Content-Range':'bytes */' + n } });
    return new Response(b.slice(bas, son + 1), { status:206, statusText:'Partial Content', headers:{
      'Content-Type':yanit.headers.get('content-type') || b.type || 'application/octet-stream',
      'Content-Length':String(son - bas + 1), 'Content-Range':'bytes ' + bas + '-' + son + '/' + n, 'Accept-Ranges':'bytes' } });
  });
}

function medyaVer(istek){
  var u = istek.url, aralik = istek.headers.get('range');
  return caches.open(MEDYA).then(function(c){ return c.match(u); }).then(function(kayit){
    if(kayit){
      metaOku().then(function(m){
        var x = m.u[u]; if(!x){ m.u[u] = x = { t:0, s:0, e:'', k:0 }; }
        x.t = Date.now(); metaYaz();
        if((x.k || 0) < Date.now() - DOGRULA_MS) dogrula(u, m);
      });
      return aralik ? parcala(kayit, aralik) : kayit;
    }
    return indirSakla(u).then(function(yan){
      if(!yan) return fetch(istek);                      // büyük dosya / hata: eskisi gibi doğrudan
      return aralik ? parcala(yan, aralik) : yan;
    });
  }).catch(function(){ return fetch(istek); });
}

self.addEventListener('fetch', function(e){
  var r = e.request;
  if(r.method !== 'GET' || r.mode === 'navigate' || !_medyaMi(r.url)) return;   // diğer her şey tarayıcıya
  e.respondWith(medyaVer(r));
  e.waitUntil(taramaGerekirse().catch(function(){}));
});

/* Sayfa isterse: tüm medya önbelleğini sil (sorun giderme). */
self.addEventListener('message', function(e){
  if(e.data && e.data.tip === 'medyaTemizle'){
    _meta = { u:{} };
    e.waitUntil(caches.delete(MEDYA).then(function(){ if(e.source) e.source.postMessage({ tip:'medyaTemizlendi' }); }));
  }
});
