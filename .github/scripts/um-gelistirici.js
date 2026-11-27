// Uygulama Merkezi — geliştirici dosyalarını GitHub'a aktarır (2026-11-27).
// Geliştiricinin GitHub anahtarı yoktur: telefonundan seçtiği dosya parça parça Firebase'e yazılır
//   um/parca/<kod>/<dosya>/<n>  (base64)   ve   um/yukleme/<kod>/<dosya> = { app, alan, ad, tur, boyut, parca, t, durum }
// Bu görev "hazir" dosyaları alır:
//   - APK  → bu deponun "um-gelistirici" sürümüne (release) eklenir; paket adı ve sürüm APK'dan okunur
//   - görsel/video → bu depoda um-gelistirici/<kod>/<uygulama>/ klasörüne yazılır (GitHub Pages'ten yayınlanır)
// Sonra uygulama kaydındaki (um/gapps/<kod>/<uygulama>) "yukleniyor:<dosya>" yer tutucusunu gerçek adresle değiştirir,
// parçaları siler ve artık kullanılmayan eski dosyaları kaldırır. Görev birkaç dakika boyunca 15 sn'de bir bakar.
const admin = require('firebase-admin');
const { execFileSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
function anahtar(){
  let t = process.env.SA || '';
  try{ return JSON.parse(t); }catch(e){}
  const govde = (t.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/) || [])[1];
  let duz = t.replace(/\r\n|\r|\n/g, '');
  if(govde != null){
    const b64 = govde.replace(/\\n/g, '').replace(/[^A-Za-z0-9+\/=]/g, '');
    const pem = '-----BEGIN PRIVATE KEY-----\\n' + b64.match(/.{1,64}/g).join('\\n') + '\\n-----END PRIVATE KEY-----\\n';
    duz = duz.replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----(\\n)*/, pem);
  }
  return JSON.parse(duz);
}
const REPO = process.env.GITHUB_REPOSITORY, TOKEN = process.env.GH_TOKEN;
const [OWNER, NAME] = REPO.split('/');
const PAGES = `https://${OWNER}.github.io/${NAME}/`, DIR = 'um-gelistirici', TAG = 'um-gelistirici';
const SURE = +(process.env.SURE || 270) * 1000, BASLA = Date.now();
const PH = 'yukleniyor:';
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
async function gh(p, opt = {}){
  const r = await fetch(p.startsWith('http') ? p : `https://api.github.com/repos/${REPO}${p}`, Object.assign({}, opt, { headers: Object.assign({ Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, opt.headers || {}) }));
  if(r.status === 204) return null;
  const j = await r.json().catch(() => ({}));
  if(!r.ok){ const e = new Error(`GitHub ${r.status}: ${j.message || p}`); e.status = r.status; throw e; }
  return j;
}
const guvenli = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 48);
function uzanti(m){
  if(m.alan === 'apk') return 'apk';
  if(m.alan === 'icon') return 'png';
  if(/^shot/.test(m.alan)) return 'jpg';
  const e = (String(m.ad || '').match(/\.(mp4|webm|mov|m4v)$/i) || [])[1];
  return e ? e.toLowerCase() : (/webm/.test(m.tur) ? 'webm' : 'mp4');
}
function apkBilgi(buf){
  const bt = path.join(process.env.ANDROID_HOME || '/usr/local/lib/android/sdk', 'build-tools');
  const surumler = fs.readdirSync(bt).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const aapt = path.join(bt, surumler[surumler.length - 1], 'aapt');
  const dosya = path.join(os.tmpdir(), 'um-' + Date.now() + '.apk'); fs.writeFileSync(dosya, buf);
  try{
    const o = execFileSync(aapt, ['dump', 'badging', dosya], { encoding: 'utf8', maxBuffer: 1 << 24 });
    const pk = (o.match(/package: name='([^']+)'/) || [])[1], vn = (o.match(/versionName='([^']*)'/) || [])[1];
    const sdk = (o.match(/sdkVersion:'(\d+)'/) || [])[1];
    return { paket: pk || '', surum: vn || '', minSdk: +sdk || 0 };
  } finally { fs.unlinkSync(dosya); }
}
const SDK_ANDROID = { 21: '5.0', 22: '5.1', 23: '6.0', 24: '7.0', 25: '7.1', 26: '8.0', 27: '8.1', 28: '9', 29: '10', 30: '11', 31: '12', 32: '12L', 33: '13', 34: '14', 35: '15', 36: '16' };
const mb = (n) => (n / 1048576).toFixed(1).replace('.', ',') + ' MB';

let surum = null;
async function surumAl(){
  if(surum) return surum;
  try{ surum = await gh('/releases/tags/' + TAG); }
  catch(e){
    if(e.status !== 404) throw e;
    surum = await gh('/releases', { method: 'POST', body: JSON.stringify({ tag_name: TAG, target_commitish: 'main', name: 'Uygulama Merkezi · geliştirici APK dosyaları', body: 'Geliştiricilerin Uygulama Merkezi\'ne yüklediği APK dosyaları (otomatik).', prerelease: true, make_latest: 'false' }) });
  }
  return surum;
}
async function apkYukle(ad, buf){
  const r = await surumAl();
  // yarıda kalmış önceki bir denemeden aynı adlı dosya kalmışsa önce silinir (yoksa GitHub 422 verir)
  try{ for(const a of (await gh(`/releases/${r.id}/assets?per_page=100`)) || []) if(a.name === ad) await gh(`/releases/assets/${a.id}`, { method: 'DELETE' }); }catch(e){}
  return gh(`https://uploads.github.com/repos/${REPO}/releases/${r.id}/assets?name=${encodeURIComponent(ad)}`, { method: 'POST', headers: { 'Content-Type': 'application/vnd.android.package-archive' }, body: buf });
}
// Tek işlemde birden fazla dosya ekle / sil (Git veri API'si)
async function isle(ekle, sil, mesaj){
  if(!ekle.length && !sil.length) return;
  const bloblar = [];
  for(const f of ekle) bloblar.push({ path: f.yol, mode: '100644', type: 'blob', sha: (await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: f.buf.toString('base64'), encoding: 'base64' }) })).sha });
  for(let deneme = 0; deneme < 5; deneme++){
    const ref = await gh('/git/ref/heads/main'), bas = ref.object.sha;
    const taban = (await gh('/git/commits/' + bas)).tree.sha;
    const agac = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: taban, tree: bloblar.concat(sil.map((y) => ({ path: y, mode: '100644', type: 'blob', sha: null }))) }) });
    const c = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message: mesaj, tree: agac.sha, parents: [bas] }) });
    try{ await gh('/git/refs/heads/main', { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) }); return; }
    catch(e){ if(e.status !== 422) throw e; await bekle(2000); }
  }
  throw new Error('Depoya yazılamadı (eş zamanlı değişiklik).');
}
async function yayindaMi(url, sn = 240){
  for(const son = Date.now() + sn * 1000; Date.now() < son;){
    try{ const r = await fetch(url + '?t=' + Date.now(), { method: 'HEAD' }); if(r.ok) return true; }catch(e){}
    await bekle(8000);
  }
  return false;
}
const yerTutucuVar = (x) => [x.icon, x.video, x.apkUrl, ...(x.screenshots || [])].some((u) => typeof u === 'string' && u.startsWith(PH));

(async () => {
  admin.initializeApp({ credential: admin.credential.cert(anahtar()), databaseURL: 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app' });
  const db = admin.database();
  // SINAMA=1: uçtan uca deneme — sahte bir geliştirici yüklemesi (küçük görsel + gerçek bir APK) oluşturur, işler, doğrular, temizler
  const SINAMA = process.env.SINAMA === '1', SK = 'sinama0', SA_ = 'deneme';
  if(SINAMA){
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const apk = Buffer.from(await (await fetch('https://github.com/azataslan065-png/uygulama-merkezi/releases/download/apk/Uygulama-Merkezi.apk')).arrayBuffer());
    const parcala = async (f, buf, alan, ad) => { const P = 512 * 1024, n = Math.ceil(buf.length / P);
      for(let i = 0; i < n; i++) await db.ref(`um/parca/${SK}/${f}/${i}`).set(buf.subarray(i * P, (i + 1) * P).toString('base64'));
      await db.ref(`um/yukleme/${SK}/${f}`).set({ app: SA_, alan, ad, tur: '', boyut: buf.length, parca: n, t: Date.now(), durum: 'hazir' }); };
    await db.ref(`um/gapps/${SK}/${SA_}`).set({ name: 'Deneme', kind: 'apk', icon: PH + 'aaaaaaaaaaaaaaaa', apkUrl: PH + 'bbbbbbbbbbbbbbbb', screenshots: [PH + 'cccccccccccccccc'], engel: true });
    await parcala('aaaaaaaaaaaaaaaa', png, 'icon', 'icon.png'); await parcala('bbbbbbbbbbbbbbbb', apk, 'apk', 'x.apk'); await parcala('cccccccccccccccc', png, 'shot0', 's.jpg');
    console.log('Deneme yüklemesi hazır, APK', apk.length, 'bayt');
  }
  let tur = 0;
  while(Date.now() - BASLA < SURE){
    tur++;
    const tum = (await db.ref('um/yukleme').once('value')).val() || {};
    const isler = [];
    for(const [kod, l] of Object.entries(tum)) for(const [f, m] of Object.entries(l || {})){
      if(!m || (kod === 'sinama0') !== SINAMA) continue;   // deneme kayıtlarına yalnızca deneme görevi dokunur
      // yarıda kalmış yüklemeler (6 saat) temizlenir
      if(m.durum !== 'hazir' && m.durum !== 'isleniyor' && Date.now() - (m.t || 0) > 6 * 3600e3){ await db.ref(`um/parca/${kod}/${f}`).remove(); await db.ref(`um/yukleme/${kod}/${f}`).remove(); continue; }
      // işlenirken görev çökmüşse (15 dk) yeniden sıraya alınır
      if(m.durum === 'isleniyor' && Date.now() - (m.t || 0) > 15 * 60e3){ await db.ref(`um/yukleme/${kod}/${f}/durum`).set('hazir'); m.durum = 'hazir'; }
      if(m.durum === 'hazir') isler.push({ kod, f, m });
    }
    if(!isler.length){ if(SINAMA && tur > 1) break; if(tur === 1) console.log('Bekleyen dosya yok'); await bekle(SINAMA ? 1000 : 15000); continue; }
    const ekle = [], sonuc = [];
    for(const j of isler){
      // Not: işlem ilk kez yerel önbellekle (null) çağrılabilir; null döndürülünce sunucu gerçek değerle yeniden çağırır
      const al = await db.ref(`um/yukleme/${j.kod}/${j.f}/durum`).transaction((d) => d === 'hazir' ? 'isleniyor' : d === null ? null : undefined);
      if(!al.committed || al.snapshot.val() !== 'isleniyor') continue;
      try{
        const parcalar = (await db.ref(`um/parca/${j.kod}/${j.f}`).once('value')).val() || {};
        const bufs = []; for(let i = 0; i < j.m.parca; i++){ if(typeof parcalar[i] !== 'string') throw new Error('Dosya eksik geldi, yeniden yükle.'); bufs.push(Buffer.from(parcalar[i], 'base64')); }
        const buf = Buffer.concat(bufs);
        if(buf.length !== j.m.boyut) throw new Error('Dosya bozuk geldi, yeniden yükle.');
        const app = guvenli(j.m.app), kod = guvenli(j.kod), ext = uzanti(j.m);
        if(j.m.alan === 'apk'){
          const b = apkBilgi(buf);
          if(!b.paket) throw new Error('APK okunamadı (geçerli bir APK değil).');
          const a = await apkYukle(`${kod}-${app}-${j.f}.apk`, buf);
          sonuc.push(Object.assign({}, j, { url: a.browser_download_url, apk: b, boyut: buf.length }));
        } else {
          const yol = `${DIR}/${kod}/${app}/${guvenli(j.m.alan)}-${j.f}.${ext}`;
          ekle.push({ yol, buf }); sonuc.push(Object.assign({}, j, { url: PAGES + yol }));
        }
      } catch(e){
        console.log('HATA', j.kod, j.f, e.message);
        sonuc.push(Object.assign({}, j, { hata: e.message }));
      }
    }
    if(ekle.length){ await isle(ekle, [], `Uygulama Merkezi: geliştirici dosyaları (${ekle.length})`); await yayindaMi(PAGES + ekle[ekle.length - 1].yol); }
    // kayıtlara işle
    const dokunulan = new Set();
    for(const s of sonuc){
      const ref = db.ref(`um/gapps/${s.kod}/${s.m.app}`);
      await ref.transaction((x) => {
        if(!x) return x;
        const yer = PH + s.f, degis = (u) => (u === yer ? (s.hata ? '' : s.url) : u);
        for(const k of ['icon', 'video', 'apkUrl']) if(x[k] != null) x[k] = degis(x[k]);
        if(Array.isArray(x.screenshots)) x.screenshots = x.screenshots.map(degis).filter(Boolean);
        if(s.hata) x.hata = s.hata; else if(x.hata && !yerTutucuVar(x)) delete x.hata;
        if(s.apk && !s.hata){ x.paket = s.apk.paket; if(!x.version) x.version = s.apk.surum; x.size = mb(s.boyut); x.apkMs = Date.now(); if(!x.minAndroid && SDK_ANDROID[s.apk.minSdk]) x.minAndroid = SDK_ANDROID[s.apk.minSdk]; }
        x.updated = new Date().toISOString().slice(0, 10);
        return x;
      });
      await db.ref(`um/parca/${s.kod}/${s.f}`).remove();
      await db.ref(`um/yukleme/${s.kod}/${s.f}`).remove();
      dokunulan.add(s.kod + '/' + s.m.app);
      console.log(s.hata ? 'Hatalı' : 'Aktarıldı', s.kod, s.m.app, s.m.alan, s.url || '');
    }
    // kullanılmayan eski dosyaları kaldır
    const sil = [];
    for(const k of dokunulan){
      const [kod, app] = k.split('/');
      const x = (await db.ref(`um/gapps/${kod}/${app}`).once('value')).val() || {};
      const kullan = new Set([x.icon, x.video, x.apkUrl, ...(x.screenshots || [])].filter(Boolean));
      try{
        const l = await gh(`/contents/${DIR}/${guvenli(kod)}/${guvenli(app)}?ref=main`);
        for(const d of l || []) if(d.type === 'file' && !kullan.has(PAGES + d.path)) sil.push(d.path);
      }catch(e){ if(e.status !== 404) console.log('Liste alınamadı', e.message); }
      try{
        const r = await surumAl(), on = `${guvenli(kod)}-${guvenli(app)}-`;
        for(const a of (await gh(`/releases/${r.id}/assets?per_page=100`)) || []) if(a.name.startsWith(on) && !kullan.has(a.browser_download_url)) await gh(`/releases/assets/${a.id}`, { method: 'DELETE' });
      }catch(e){ console.log('Eski APK silinemedi', e.message); }
    }
    if(sil.length) await isle([], sil, `Uygulama Merkezi: eski geliştirici dosyaları kaldırıldı (${sil.length})`);
  }
  if(SINAMA){
    // aynı anda çalışan zamanlanmış görev dosyaları almış olabilir: yer tutucular kalkana kadar (en çok 5 dk) bekle
    let x = {};
    for(const son = Date.now() + 300e3; Date.now() < son; await bekle(10000)){ x = (await db.ref(`um/gapps/${SK}/${SA_}`).once('value')).val() || {}; if(!yerTutucuVar(x)) break; }
    console.log('SONUÇ', JSON.stringify(x));
    const ok = x.icon && x.icon.startsWith(PAGES) && x.apkUrl && x.apkUrl.includes('/releases/download/') && x.paket && (x.screenshots || []).length === 1 && !yerTutucuVar(x);
    const img = ok && (await fetch(x.icon)).status, apk = ok && (await fetch(x.apkUrl, { headers: { Range: 'bytes=0-15' } })).status;
    console.log(ok && img === 200 && (apk === 200 || apk === 206) ? 'SINAMA BAŞARILI' : 'SINAMA BAŞARISIZ', img, apk);
    // temizlik
    await db.ref(`um/gapps/${SK}/${SA_}`).set({ name: 'Deneme', engel: true });
    const sil = []; try{ for(const d of await gh(`/contents/${DIR}/${SK}/${SA_}?ref=main`)) sil.push(d.path); }catch(e){}
    if(sil.length) await isle([], sil, 'Uygulama Merkezi: deneme dosyaları kaldırıldı');
    try{ const r = await surumAl(); for(const a of await gh(`/releases/${r.id}/assets?per_page=100`)) if(a.name.startsWith(SK + '-')) await gh(`/releases/assets/${a.id}`, { method: 'DELETE' }); }catch(e){ console.log(e.message); }
    await db.ref(`um/gapps/${SK}`).remove(); await db.ref(`um/parca/${SK}`).remove(); await db.ref(`um/yukleme/${SK}`).remove();
    process.exit(ok && img === 200 && (apk === 200 || apk === 206) ? 0 : 1);
  }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
