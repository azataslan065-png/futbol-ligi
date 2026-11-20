/* MEDYA KAPISI (2026-11-19, kullanıcı: "kotası dolan otomatik olarak sonraki sunucuya geçecek", "her birinden 1 hesap").
   Bütün uygulamalar (Puan Tablosu, Admin, SAHA, Skorbord) dosyayı YALNIZCA bu kapıya yükler. Kapı:
     1) yükleyenin Firebase oturumunu (anonim dahil) doğrular,
     2) sıradaki müsait İKİ farklı depoya aynı dosyayı yazar (biri kapanırsa diğerinden açılır),
     3) kota hatası veren depoyu "dolu" işaretler ve sıfırlanma zamanına kadar atlar.
   OKUMA kapıdan geçmez: dönen adres doğrudan deponun adresidir; yedek adres "#yedek=" ekiyle gelir ve istemci
   (ortak/medya.js) ilk adres açılmazsa yedeğe geçer. Gizli anahtarlar yalnızca Cloudflare'in secret'larındadır. */

const SURUM = '2026-11-20-A';
let KAPI_ADRES = '';   // bu isteğin geldiği kapı adresi (B2 dosyaları kapı üzerinden sunulur)
const RTDB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app';
const MAX_BOYUT = 95 * 1000 * 1000;          // Cloudflare ücretsiz planı istek gövdesi 100 MB; dosya bellekte tek kopya tutulur
const TEST_GUNLUK = 40;                        // test/ klasörüne günlük en fazla yükleme
const DURUM_ANAHTAR = 'durum';
const UZUN_ONBELLEK = 'public, max-age=31536000, immutable';

/* ── Yardımcılar ─────────────────────────────────────────────────────────────────────────── */
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
async function sha256Hex(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
async function hmac(key, s) {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? enc.encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, enc.encode(s));
}
function b64url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return atob(s); }
function cors(h = {}) {
  return Object.assign({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Expose-Headers': 'Content-Length,Content-Range,Accept-Ranges',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Yol,Range',
    'Access-Control-Max-Age': '86400',
  }, h);
}
function json(o, st = 200) { return new Response(JSON.stringify(o), { status: st, headers: cors({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }) }); }
function yolTemiz(y) {
  y = String(y || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!y || y.length > 300 || /(^|\/)\.\.?(\/|$)/.test(y) || !/^[A-Za-z0-9._\-\/]+$/.test(y)) return null;
  return y;
}

/* ── Firebase kimlik doğrulama (RS256, Google'ın genel anahtarları) ──────────────────────── */
let _jwk = null, _jwkBitis = 0;
async function jwkAl() {
  if (_jwk && Date.now() < _jwkBitis) return _jwk;
  const r = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  if (!r.ok) throw new Error('jwk ' + r.status);
  const j = await r.json(), m = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  _jwk = {}; for (const k of j.keys || []) _jwk[k.kid] = k;
  _jwkBitis = Date.now() + (m ? +m[1] : 3600) * 1000;
  return _jwk;
}
export async function tokenDogrula(tok, projeId, simdi = Date.now() / 1000, anahtarlar = null) {
  const p = String(tok || '').split('.');
  if (p.length !== 3) throw new Error('biçim');
  const bas = JSON.parse(b64url(p[0])), yuk = JSON.parse(b64url(p[1]));
  if (bas.alg !== 'RS256' || !bas.kid) throw new Error('alg');
  const jw = (anahtarlar || await jwkAl())[bas.kid];
  if (!jw) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jw, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const imza = Uint8Array.from(b64url(p[2]), (c) => c.charCodeAt(0));
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, imza, enc.encode(p[0] + '.' + p[1]));
  if (!ok) throw new Error('imza');
  if (yuk.aud !== projeId || yuk.iss !== 'https://securetoken.google.com/' + projeId) throw new Error('proje');
  if (!(yuk.exp > simdi) || yuk.iat > simdi + 300 || !yuk.sub) throw new Error('süre');
  return yuk.sub;
}

/* ── S3 imzası (Backblaze B2, AWS SigV4, gövde imzasız) ───────────────────────────────────── */
export async function s3Imzala({ method, url, headers, keyId, secret, region, simdi = new Date() }) {
  const u = new URL(url);
  const amzDate = simdi.toISOString().replace(/[:-]|\.\d{3}/g, ''), gun = amzDate.slice(0, 8);
  const h = Object.assign({}, headers, { host: u.host, 'x-amz-date': amzDate, 'x-amz-content-sha256': 'UNSIGNED-PAYLOAD' });
  const adlar = Object.keys(h).map((k) => k.toLowerCase()).sort();
  const hv = {}; for (const k of Object.keys(h)) hv[k.toLowerCase()] = String(h[k]).trim();
  const kanonikYol = u.pathname.split('/').map((s) => encodeURIComponent(decodeURIComponent(s))).join('/');
  const istek = [method, kanonikYol, u.searchParams.toString(), adlar.map((k) => k + ':' + hv[k]).join('\n') + '\n', adlar.join(';'), 'UNSIGNED-PAYLOAD'].join('\n');
  const kapsam = `${gun}/${region}/s3/aws4_request`;
  const imzalanacak = ['AWS4-HMAC-SHA256', amzDate, kapsam, await sha256Hex(istek)].join('\n');
  let k = await hmac('AWS4' + secret, gun); k = await hmac(k, region); k = await hmac(k, 's3'); k = await hmac(k, 'aws4_request');
  const imza = hex(await hmac(k, imzalanacak));
  const cikis = {}; for (const a of Object.keys(h)) if (a !== 'host') cikis[a] = h[a];
  cikis.Authorization = `AWS4-HMAC-SHA256 Credential=${keyId}/${kapsam}, SignedHeaders=${adlar.join(';')}, Signature=${imza}`;
  return cikis;
}

/* ── Depolar ─────────────────────────────────────────────────────────────────────────────── */

/* B2 kova adı ve uç noktası: secret doğru biçimdeyse o, değilse wrangler.toml'daki B2_KOVA / B2_UC (gizli değiller). */
const b2Uc = (e) => { const x = String(e.B2_ENDPOINT || '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, ''); return /^s3\.[a-z0-9-]+\.backblazeb2\.com$/.test(x) ? x : (e.B2_UC || ''); };
const b2Kova = (e) => { const x = String(e.B2_BUCKET || '').trim(); return /^[a-z0-9][a-z0-9-]{4,48}[a-z0-9]$/.test(x) ? x : (e.B2_KOVA || ''); };
/* B2 anahtar çifti (2026-11-20): anahtar KİMLİĞİ gizli değildir (kullanıcı adı gibi; tek başına erişim vermez), uygulama anahtarı
   gizlidir. Telefonda kopyalarken değerler yer değiştirebiliyor: kimlik yanlışsa wrangler.toml'daki B2_ANAHTAR_ID kullanılır;
   uygulama anahtarı (K ile başlar) yanlışlıkla B2_KEY_ID'ye girildiyse oradan alınır. */
export function b2Anahtar(e) {
  const t = (v) => String(v || '').trim(), kimlikMi = (v) => /^[0-9a-f]{12,40}$/.test(v), gizliMi = (v) => /^K\S{20,60}$/.test(v) && !/^cfu/.test(v);
  const a = t(e.B2_KEY_ID), b = t(e.B2_APP_KEY);
  // (2026-11-20) wrangler.toml değişkeni bazı yayınlarda Worker'a ulaşmadı; kimlik gizli olmadığından burada da yazılı.
  const id = kimlikMi(a) ? a : kimlikMi(b) ? b : (t(e.B2_ANAHTAR_ID) || '003f177ece1d52d0000000001');
  const gizli = gizliMi(b) ? b : gizliMi(a) ? a : '';
  return { id, gizli };
}
export const DEPOLAR = {
  b2: {
    ad: 'Backblaze B2',
    hazir: (e) => !!(b2Anahtar(e).id && b2Anahtar(e).gizli && b2Kova(e) && b2Uc(e)),
    async yukle(e, yol, govde, tur) {
      const uc = b2Uc(e), region = (/^s3\.([^.]+)\./.exec(uc) || [])[1] || 'us-west-004';
      const url = `https://${uc}/${b2Kova(e)}/${yol}`;
      const h = await s3Imzala({ method: 'PUT', url, headers: { 'content-type': tur, 'cache-control': UZUN_ONBELLEK }, keyId: b2Anahtar(e).id, secret: b2Anahtar(e).gizli, region });
      const r = await fetch(url, { method: 'PUT', headers: h, body: govde });
      if (!r.ok) return { hata: r.status, metin: (await r.text()).slice(0, 300) };
      // (2026-11-19-C) Kova GİZLİ (herkese açık kova Backblaze'de kart istiyor): dosya kapının /b2/ yolundan sunulur.
      return { url: (KAPI_ADRES || '') + '/b2/' + yol };
    },
    kotaMi: (st, m) => st === 402 || st === 429 || (st === 403 && /cap|exceed|limit|quota/i.test(m)),
  },
  imagekit: {
    ad: 'ImageKit',
    hazir: (e) => !!e.IMAGEKIT_PRIVATE_KEY,   // dosya adresi yükleme yanıtından gelir; URL-endpoint gerekmez
    async yukle(e, yol, govde, tur) {
      const i = yol.lastIndexOf('/'), klasor = '/' + (i > 0 ? yol.slice(0, i) : ''), ad = yol.slice(i + 1);
      const yetki = 'Basic ' + btoa(e.IMAGEKIT_PRIVATE_KEY + ':');
      let r;
      if (typeof FixedLengthStream === 'function') {
        // (2026-11-19-D) Çok parçalı gövde elle kurulur: büyük video bellekte İKİNCİ kez kopyalanmaz (Worker belleği 128 MB).
        const bd = 'sbk' + crypto.randomUUID().replace(/-/g, ''), alan = (k, v) => `--${bd}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
        const bas = enc.encode(alan('fileName', ad) + alan('folder', klasor) + alan('useUniqueFileName', 'false')
          + `--${bd}\r\nContent-Disposition: form-data; name="file"; filename="${ad}"\r\nContent-Type: ${tur}\r\n\r\n`), son = enc.encode(`\r\n--${bd}--\r\n`);
        const parca = [bas, new Uint8Array(govde), son], { readable, writable } = new FixedLengthStream(parca.reduce((a, x) => a + x.byteLength, 0));
        const w = writable.getWriter(); (async () => { for (const x of parca) await w.write(x); await w.close(); })().catch(() => {});
        r = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', headers: { Authorization: yetki, 'Content-Type': 'multipart/form-data; boundary=' + bd }, body: readable });
      } else {
        const fd = new FormData();
        fd.append('file', new Blob([govde], { type: tur }), ad);
        fd.append('fileName', ad); fd.append('folder', klasor); fd.append('useUniqueFileName', 'false');
        r = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', headers: { Authorization: yetki }, body: fd });
      }
      const m = await r.text();
      if (!r.ok) return { hata: r.status, metin: m.slice(0, 300) };
      let u = ''; try { u = JSON.parse(m).url; } catch (_) {}
      return u ? { url: u } : { hata: 500, metin: 'url yok' };
    },
    kotaMi: (st, m) => st === 402 || st === 429 || (st === 403 && /limit|exceed|quota|plan/i.test(m)),
  },
  supabase: {
    ad: 'Supabase',
    hazir: (e) => !!(e.SUPABASE_URL && e.SUPABASE_KEY),
    async yukle(e, yol, govde, tur) {
      const kova = e.SUPABASE_BUCKET || 'videos';
      const r = await fetch(`${e.SUPABASE_URL}/storage/v1/object/${kova}/${yol}`, {
        method: 'POST', body: govde,
        headers: { Authorization: 'Bearer ' + e.SUPABASE_KEY, apikey: e.SUPABASE_KEY, 'Content-Type': tur, 'x-upsert': 'false', 'cache-control': '31536000' },
      });
      if (!r.ok) return { hata: r.status, metin: (await r.text()).slice(0, 300) };
      return { url: `${e.SUPABASE_URL}/storage/v1/object/public/${kova}/${yol}` };
    },
    kotaMi: (st, m) => st === 402 || st === 429 || /exceed|quota|restrict/i.test(m),
  },
};

/* ── Dönem ve açılış tarihi (2026-11-19-B, kullanıcı: "her kilitlendiğinde Supabase'den gelen tarihi gösterecek, diğerleri de öyle") ──
   Her deponun kotası bir dönemde sıfırlanır: B2 her gün (≈ 08:00 UTC), ImageKit ve Supabase ayda bir, kendi fatura gününde.
   Fatura günü Firebase'deki medyaAyar/<depo>/gun alanından okunur (admin kartından değiştirilir); yoksa varsayılan kullanılır
   (Supabase: 4 - kilit e-postasındaki "4 Aralık"). Depo kilitlenince açılış tarihi şu sırayla belirlenir:
     1) admin kartından elle girilen tarih (medyaAyar/<depo>/kilitBitis), 2) deponun hata mesajındaki tarih, 3) dönem sonu. */
const GUN_VARSAYILAN = { supabase: 4, imagekit: 1 };
export const SINIR = {   // ücretsiz plan sınırları (bayt); indirme dönemliktir
  b2: { depolama: 10e9, indirme: 1e9, not: 'günlük sınır; ayrıca günde 2.500 okuma ve 2.500 listeleme işlemi (Backblaze paneli, kart yokken $0)' },
  imagekit: { depolama: 3e9, indirme: 20e9 },
  supabase: { depolama: 1e9, indirme: 10e9, not: '5 GB önbellekli + 5 GB önbelleksiz indirme' },
};
let _ayar = null, _ayarZ = 0;
async function ayarOku(e) {
  if (_ayar && Date.now() - _ayarZ < 60000) return _ayar;
  let a = {}; try { const r = await fetch((e.RTDB || RTDB) + '/medyaAyar.json'); if (r.ok) a = (await r.json()) || {}; } catch (_) {}
  _ayar = a; _ayarZ = Date.now(); return a;
}
export function donem(id, ayar = {}, t = Date.now()) {
  if (id === 'b2') { const d = new Date(t); let b = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 8); if (b > t) b -= 864e5; return { bas: b, son: b + 864e5 }; }
  const g = Math.min(28, Math.max(1, +ayar.gun || GUN_VARSAYILAN[id] || 1)), d = new Date(t);
  let b = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), g); if (b > t) b = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, g);
  const bd = new Date(b); return { bas: b, son: Date.UTC(bd.getUTCFullYear(), bd.getUTCMonth() + 1, g) };
}
const AYLAR = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
export function tarihAyikla(m) {
  m = String(m || ''); let x;
  if ((x = /(20\d\d)-(\d\d)-(\d\d)/.exec(m))) return Date.UTC(+x[1], +x[2] - 1, +x[3]);
  if ((x = /\b([A-Z][a-z]{2})[a-z]*\.? (\d{1,2}),? (20\d\d)/.exec(m)) && AYLAR[x[1].toLowerCase()] != null) return Date.UTC(+x[3], AYLAR[x[1].toLowerCase()], +x[2]);
  if ((x = /\b(\d{1,2}) ([A-Z][a-z]{2})[a-z]* (20\d\d)/.exec(m)) && AYLAR[x[2].toLowerCase()] != null) return Date.UTC(+x[3], AYLAR[x[2].toLowerCase()], +x[1]);
  return 0;
}
export function acilis(id, kayit, ayar = {}) {
  if (ayar.kilitBitis > kayit.zaman) return { t: +ayar.kilitBitis, kaynak: 'elle' };
  if (kayit.mesajTarih > kayit.zaman) return { t: kayit.mesajTarih, kaynak: 'depo' };
  return { t: donem(id, ayar, kayit.zaman).son, kaynak: 'donem' };
}

/* ── Kota durumu (KV; yalnız durum değişince yazılır) ─────────────────────────────────────── */
let _durum = null, _durumZaman = 0;
async function durumOku(e) {
  if (_durum && Date.now() - _durumZaman < 60000) return _durum;
  let d = {}; try { d = (e.MEDYA_DURUM && await e.MEDYA_DURUM.get(DURUM_ANAHTAR, { type: 'json', cacheTtl: 60 })) || {}; } catch (_) {}
  _durum = d; _durumZaman = Date.now(); return d;
}
async function doluIsaretle(e, id, sebep) {
  const d = await durumOku(e), t = Date.now();
  d[id] = { dolu: true, sebep: String(sebep).slice(0, 160), zaman: t, mesajTarih: tarihAyikla(sebep) };
  d[id].aciliyor = acilis(id, d[id], (await ayarOku(e))[id] || {}).t;
  _durum = d; _durumZaman = t;
  try { e.MEDYA_DURUM && await e.MEDYA_DURUM.put(DURUM_ANAHTAR, JSON.stringify(d)); } catch (_) {}
}
export function doluMu(id, d, ayarlar = {}, simdi = Date.now()) {
  const k = d[id]; if (!k || !k.dolu) return false;
  return acilis(id, k, ayarlar[id] || {}).t > simdi;
}
export function sira(e, d, simdi = Date.now(), ayarlar = {}) {
  const liste = String(e.DEPO_SIRASI || 'b2,imagekit,supabase').split(',').map((s) => s.trim()).filter((s) => DEPOLAR[s] && DEPOLAR[s].hazir(e));
  return liste.filter((id) => !doluMu(id, d, ayarlar, simdi) && !(ayarlar[id] && ayarlar[id].kapali));
}

/* ── PAYLAŞIM SINIRLARI (2026-11-19-D, kullanıcı: "yönetici, kullanıcının ne kadar boyutta video ve fotoğraf ekleyebileceğini
   ayarlayabilsin; günlük kaç fotoğraf ve video paylaşılacağını 1 ile 10.000.000.000 (sonsuz) arasında belirleyebilsin").
   Ayar: medyaAyar/_sinir {fotoMB, videoMB, gunlukFoto, gunlukVideo, muaf:{<uid özeti>:true}} - admin kartından yazılır.
   Günlük sayı her kullanıcı (oturum) için Türkiye gününe göre tutulur; yöneticiler (muaf) sınırsızdır. Uygulamalar boyut
   sınırını yüklemeden ÖNCE uygular (aşan dosyada düzenleme ekranı açılır); kapı aynı sınırı ayrıca denetler. */
export const SINIR_VARSAYILAN = { fotoMB: 15, videoMB: 50, gunlukFoto: 1e10, gunlukVideo: 1e10 };
export function paylasimSiniri(ayar) {
  const a = (ayar && ayar._sinir) || {}, o = {}, s = (v, alt, ust, vars) => { v = Math.floor(+v); return v >= alt && v <= ust ? v : vars; };
  o.fotoMB = s(a.fotoMB, 1, 100, SINIR_VARSAYILAN.fotoMB); o.videoMB = s(a.videoMB, 1, 95, SINIR_VARSAYILAN.videoMB);
  o.gunlukFoto = s(a.gunlukFoto, 1, 1e10, SINIR_VARSAYILAN.gunlukFoto); o.gunlukVideo = s(a.gunlukVideo, 1, 1e10, SINIR_VARSAYILAN.gunlukVideo);
  o.muaf = a.muaf || {}; return o;
}
const trGunu = (t = Date.now()) => new Date(t + 3 * 3600e3).toISOString().slice(0, 10);

/* ── Yüklenen dosya sayacı (fotoğraf / video ayrı; depolama toplamı + bu dönem yüklenen) ───────────────── */
export const turu = (tur) => /^image\//.test(tur) ? 'foto' : /^video\//.test(tur) ? 'video' : 'ses';
async function sayacEkle(e, id, tur, bayt) {
  if (!e.MEDYA_DURUM) return;
  try {
    const k = 'kul:' + id, a = (await e.MEDYA_DURUM.get(k, { type: 'json' })) || {}, tt = turu(tur), dn = donem(id, (await ayarOku(e))[id] || {}).bas;
    a.dep = a.dep || {}; a.dep[tt] = a.dep[tt] || { n: 0, b: 0 }; a.dep[tt].n++; a.dep[tt].b += bayt;
    if (a.donem !== dn) { a.donem = dn; a.yuk = {}; }
    a.yuk = a.yuk || {}; a.yuk[tt] = a.yuk[tt] || { n: 0, b: 0 }; a.yuk[tt].n++; a.yuk[tt].b += bayt;
    await e.MEDYA_DURUM.put(k, JSON.stringify(a));
  } catch (_) {}
}
/* Deponun KENDİ ölçümü (yalnız ImageKit'in kullanım API'si var; 10 dk önbellek). */
let _ikKul = null, _ikKulZ = 0;
async function imagekitKullanim(e, bas) {
  if (!e.IMAGEKIT_PRIVATE_KEY) return null;
  if (_ikKul && Date.now() - _ikKulZ < 600000) return _ikKul;
  const g = (t) => new Date(t).toISOString().slice(0, 10);
  try {
    const r = await fetch(`https://api.imagekit.io/v1/accounts/usage?startDate=${g(bas)}&endDate=${g(Date.now())}`, { headers: { Authorization: 'Basic ' + btoa(e.IMAGEKIT_PRIVATE_KEY + ':') } });
    if (r.ok) { const j = await r.json(); _ikKul = { indirme: j.bandwidthBytes || 0, depolama: j.mediaLibraryStorageBytes || 0 }; _ikKulZ = Date.now(); }
  } catch (_) {}
  return _ikKul;
}

/* ── Yükleme: iki farklı depoya ─────────────────────────────────────────────────────────── */
export async function ikiyeYukle(e, yol, govde, tur, gunluk = () => {}) {
  const d = await durumOku(e), aday = sira(e, d, Date.now(), await ayarOku(e)), basarili = [], hatalar = [];
  let i = 0;
  async function birKopya() {
    while (i < aday.length) {
      const id = aday[i++];
      try {
        const s = await DEPOLAR[id].yukle(e, yol, govde, tur);
        if (s.url) { basarili.push({ id, url: s.url }); await sayacEkle(e, id, tur, govde.byteLength); return; }
        hatalar.push(id + ':' + s.hata + ' ' + String(s.metin || '').replace(/\s+/g, ' ').slice(0, 140));
        if (DEPOLAR[id].kotaMi(s.hata, s.metin || '')) { await doluIsaretle(e, id, s.hata + ' ' + (s.metin || '')); gunluk('dolu ' + id); }
      } catch (err) { hatalar.push(id + ':' + (err && err.message)); }
    }
  }
  await Promise.all([birKopya(), birKopya()]);   // iki kopya paralel; her biri sıradaki müsait depoyu alır
  return { basarili, hatalar };
}

/* ── B2 dosyası sunma (gizli kova; imzalı GET, Range aktarılır) ──────────────────────────────────────────
   Okuma oturum istemez (<img>/<video> başlık gönderemez); dosya adları tahmin edilemez. Backblaze'den Cloudflare'e çıkış
   trafiği iki şirketin anlaşması gereği ücretsizdir. Kota hatası (403 cap exceeded vb.) aynen döner: istemci yedek adrese geçer. */
async function b2Sun(req, e, yol) {
  if (!DEPOLAR.b2.hazir(e)) return new Response('yok', { status: 404, headers: cors() });
  const uc = b2Uc(e), region = (/^s3\.([^.]+)\./.exec(uc) || [])[1] || 'us-west-004';
  const url = `https://${uc}/${b2Kova(e)}/${yol}`, ek = {}, rg = req.headers.get('Range');
  if (rg) ek.range = rg;
  const h = await s3Imzala({ method: req.method === 'HEAD' ? 'HEAD' : 'GET', url, headers: ek, keyId: b2Anahtar(e).id, secret: b2Anahtar(e).gizli, region });
  const r = await fetch(url, { method: req.method === 'HEAD' ? 'HEAD' : 'GET', headers: h });
  const c = cors({ 'Cache-Control': r.ok ? UZUN_ONBELLEK : 'no-store', 'Accept-Ranges': 'bytes' });
  for (const k of ['content-type', 'content-length', 'content-range', 'etag', 'last-modified']) { const v = r.headers.get(k); if (v) c[k] = v; }
  if (!r.ok && r.status !== 206) {
    const m = (await r.text()).slice(0, 200);
    if (DEPOLAR.b2.kotaMi(r.status, m)) await doluIsaretle(e, 'b2', r.status + ' ' + m);
    return new Response('B2 ' + r.status, { status: r.status === 404 ? 404 : (r.status === 403 ? 403 : 502), headers: c });
  }
  return new Response(r.body, { status: r.status, headers: c });
}

/* ── Giriş noktası ───────────────────────────────────────────────────────────────────────── */
export default {
  async fetch(req, e) {
    const u = new URL(req.url);
    KAPI_ADRES = u.origin;
    if ((req.method === 'GET' || req.method === 'HEAD') && u.pathname.startsWith('/b2/')) {
      const yol = yolTemiz(decodeURIComponent(u.pathname.slice(4)));
      return yol ? b2Sun(req, e, yol) : json({ ok: false, hata: 'geçersiz yol' }, 400);
    }
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
    if (u.pathname === '/' || u.pathname === '/saglik') return json({ ok: true, surum: SURUM });

    if (u.pathname === '/durum' && req.method === 'GET') {
      const d = await durumOku(e), t = Date.now(), ay = await ayarOku(e), ayrinti = u.searchParams.has('ayrinti');
      const depolar = await Promise.all(String(e.DEPO_SIRASI || 'b2,imagekit,supabase').split(',').map((s) => s.trim()).filter((s) => DEPOLAR[s]).map(async (id) => {
        const dolu = doluMu(id, d, ay, t), ac = dolu ? acilis(id, d[id], ay[id] || {}) : null, dn = donem(id, ay[id] || {}, t);
        const o = { id, ad: DEPOLAR[id].ad, kurulu: DEPOLAR[id].hazir(e), kapali: !!(ay[id] && ay[id].kapali), dolu, aciliyor: ac ? ac.t : null, acilisKaynak: ac ? ac.kaynak : null,
          sebep: dolu ? d[id].sebep : null, kilitZaman: dolu ? d[id].zaman : null };
        if (ayrinti) {
          let k = null; try { k = e.MEDYA_DURUM && await e.MEDYA_DURUM.get('kul:' + id, { type: 'json' }); } catch (_) {}
          o.donem = dn; o.gun = id === 'b2' ? null : (+(ay[id] && ay[id].gun) || GUN_VARSAYILAN[id] || 1); o.sinir = SINIR[id];
          o.depolanan = (k && k.dep) || {}; o.yuklenen = (k && k.donem === dn.bas && k.yuk) || {};
          if (id === 'imagekit' && o.kurulu) o.depoOlcumu = await imagekitKullanim(e, dn.bas);
        }
        return o;
      }));
      const ba = b2Anahtar(e);   // teşhis: yalnız var/yok ve biçim; değer ASLA gösterilmez
      const b2Tani = { kimlik: !!ba.id, kimlikKaynak: /^[0-9a-f]{12,40}$/.test(String(e.B2_KEY_ID || '').trim()) ? 'secret' : (ba.id ? 'dosya' : 'yok'), gizli: !!ba.gizli, kova: !!b2Kova(e), uc: !!b2Uc(e),
        secretKeyIlk: String(e.B2_KEY_ID || '').trim().slice(0, 1), secretAppIlk: String(e.B2_APP_KEY || '').trim().slice(0, 1), secretKeyUz: String(e.B2_KEY_ID || '').trim().length, dosyaKimlikUz: String(e.B2_ANAHTAR_ID || '').length, kovaKaynak: e.B2_KOVA ? 'var' : 'yok', idUz: String(ba.id || '').length };
      const ps = paylasimSiniri(ay); delete ps.muaf;
      return json({ ok: true, surum: SURUM, depolar, paylasim: ps, b2Tani });
    }

    if (u.pathname === '/yukle' && req.method === 'POST') {
      let uid;
      try { uid = await tokenDogrula((req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, ''), e.FIREBASE_PROJE || 'superlig-208e3'); }
      catch (err) { return json({ ok: false, hata: 'oturum doğrulanamadı' }, 401); }
      const yol = yolTemiz(req.headers.get('X-Yol') || u.searchParams.get('yol'));
      if (!yol) return json({ ok: false, hata: 'geçersiz dosya yolu' }, 400);
      const tur = (req.headers.get('Content-Type') || 'application/octet-stream').split(';')[0].trim();
      if (!/^(image|video|audio)\//.test(tur)) return json({ ok: false, hata: 'yalnız fotoğraf, video ve ses yüklenebilir' }, 415);
      const uz = +req.headers.get('Content-Length') || 0;
      if (uz > MAX_BOYUT) return json({ ok: false, hata: 'dosya çok büyük' }, 413);
      if (yol.startsWith('test/') && e.MEDYA_DURUM) {
        const k = 'test:' + new Date().toISOString().slice(0, 10), n = +(await e.MEDYA_DURUM.get(k) || 0);
        if (n >= TEST_GUNLUK) return json({ ok: false, hata: 'test ortamının günlük yükleme sınırı doldu' }, 429);
        await e.MEDYA_DURUM.put(k, String(n + 1), { expirationTtl: 172800 });
      }
      const ps = paylasimSiniri(await ayarOku(e)), tt = turu(tur), muaf = !!ps.muaf[await sha256Hex(uid)];
      const mbSin = (tt === 'video' ? ps.videoMB : tt === 'foto' ? ps.fotoMB : ps.videoMB) * 1048576 * 1.05;
      if (!muaf && uz > mbSin) return json({ ok: false, hata: (tt === 'foto' ? 'Fotoğraf' : 'Video') + ' en fazla ' + (tt === 'foto' ? ps.fotoMB : ps.videoMB) + ' MB olabilir' }, 413);
      const gk = 'g:' + uid + ':' + trGunu(), gs = (!muaf && e.MEDYA_DURUM && tt !== 'ses') ? ((await e.MEDYA_DURUM.get(gk, { type: 'json' })) || {}) : null;
      const gSin = tt === 'video' ? ps.gunlukVideo : ps.gunlukFoto;
      if (gs && (gs[tt] || 0) >= gSin) { const g = trGunu().split('-').map(Number), yen = Date.UTC(g[0], g[1] - 1, g[2] + 1) - 3 * 3600e3;   // Türkiye gece yarısı
        return json({ ok: false, hata: 'Bugünkü ' + (tt === 'video' ? 'video' : 'fotoğraf') + ' paylaşım sınırına ulaştın (' + gSin + ').', sinir: true, tur: tt, adet: gSin, yenilenme: yen }, 429); }
      const govde = await req.arrayBuffer();
      if (govde.byteLength > MAX_BOYUT || (!muaf && govde.byteLength > mbSin)) return json({ ok: false, hata: 'dosya çok büyük' }, 413);
      const { basarili, hatalar } = await ikiyeYukle(e, yol, govde, tur);
      if (!basarili.length) return json({ ok: false, hata: 'bütün depolar dolu ya da ulaşılamıyor', ayrinti: hatalar }, 503);
      if (gs) { gs[tt] = (gs[tt] || 0) + 1; try { await e.MEDYA_DURUM.put(gk, JSON.stringify(gs), { expirationTtl: 172800 }); } catch (_) {} }
      const url = basarili[0].url + (basarili[1] ? '#yedek=' + encodeURIComponent(basarili[1].url) : '');
      return json({ ok: true, url, depolar: basarili.map((b) => b.id), uyari: hatalar.length ? hatalar : undefined });   // tek kopya kaldıysa sebebi (gizli bilgi içermez)
    }
    return json({ ok: false, hata: 'bulunamadı' }, 404);
  },
};
