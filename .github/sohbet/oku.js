// Sohbet teşhisi: genel sohbet düğümlerinde kaç mesaj var, son mesajlar ne zaman ve kim (admin mi) tarafından yazılmış.
// Mesaj METNİ ve kullanıcı adı YAZILMAZ (repo herkese açık); yalnızca zaman, alan adları, yazan admin mi, uid'nin son 4 karakteri.
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ;
  try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token;
  const al = async (y, q) => { const r = await fetch(DB + y + '.json' + (q || ''), { headers: { Authorization: 'Bearer ' + tok } }); return r.ok ? r.json() : { HATA: r.status }; };
  const adminler = Object.assign({}, await al('admins') || {}, await al('test/admins') || {});
  const tarih = (x) => { const n = +x; return n > 1e12 ? new Date(n).toISOString().replace('T', ' ').slice(0, 19) + 'Z' : String(x).slice(0, 24); };
  const uidAl = (m) => m.uid || m.userId || m.authorUid || m.senderUid || m.yazanUid || m.u || '';
  const zamanAl = (m) => m.timestamp || m.ts || m.time || m.zaman || m.t || m.createdAt || 0;
  for (const y of ['paylasilan/genelSohbet', 'test/paylasilan/genelSohbet', 'skorbord/paylasilan/genelSohbet', 'test/skorbord/paylasilan/genelSohbet']) {
    const v = await al(y); console.log('\n===== ' + y + ' =====');
    if (!v || typeof v !== 'object') { console.log('boş'); continue; } if (v.HATA) { console.log('HATA', v.HATA); continue; }
    const l = Object.entries(v).filter(([, m]) => m && typeof m === 'object').sort((a, b) => zamanAl(a[1]) - zamanAl(b[1]));
    const ad = l.filter(([, m]) => adminler[uidAl(m)]).length;
    console.log('mesaj: ' + l.length + ' (admin yazdığı: ' + ad + ')');
    for (const [k, m] of l.slice(-12)) console.log(tarih(zamanAl(m)) + ' | ' + (adminler[uidAl(m)] ? 'ADMIN' : 'kullanıcı') + ' | uid …' + String(uidAl(m)).slice(-4) + ' | anahtar …' + k.slice(-4) + ' | isDev:' + m.isDev + ' source:' + String(m.source).slice(0, 12) + ' video:' + (m.videos ? (Array.isArray(m.videos) ? m.videos.length : Object.keys(m.videos).length) : 0) + ' foto:' + (m.photos || m.images || m.foto ? 1 : 0) + ' | alanlar: ' + Object.keys(m).sort().join(','));
  }
  // Lig belgesinde kalmış eski sohbet kopyaları (yönlendirme öncesi) — sadece sayı
  for (const kok of ['leagues', 'test/leagues', 'sahaVeri/leagues', 'test/sahaVeri/leagues', 'skorbord/leagues', 'test/skorbord/leagues']) {
    const ligler = await al(kok, '?shallow=true'); if (!ligler || ligler.HATA || typeof ligler !== 'object') continue;
    for (const lig of Object.keys(ligler).slice(0, 15)) { const g = await al(kok + '/' + lig + '/generalChat'); if (g && typeof g === 'object' && !g.HATA) { const l = Object.values(g).filter(m => m && typeof m === 'object').sort((a, b) => zamanAl(a) - zamanAl(b)); console.log(kok + '/' + lig.slice(-4) + '/generalChat: ' + l.length + ' mesaj (eski yol)'); l.slice(-6).forEach(m => console.log('   ' + tarih(zamanAl(m)) + ' isDev:' + m.isDev + ' source:' + String(m.source).slice(0, 12) + ' alanlar:' + Object.keys(m).sort().join(','))); }
      const mc = await al(kok + '/' + lig + '/matches', '?shallow=true'); if (mc && typeof mc === 'object' && !mc.HATA) { let n = 0, son = 0; for (const mid of Object.keys(mc)) { const c = await al(kok + '/' + lig + '/matches/' + mid + '/comments'); if (c && typeof c === 'object' && !c.HATA) for (const m of Object.values(c)) { if (m && typeof m === 'object') { n++; son = Math.max(son, +zamanAl(m) || 0); } } } if (n) console.log('   maç yorumları: ' + n + ', son: ' + tarih(son)); } }
  }
  const sh = await al('test/paylasilan/sohbetHesaplari', '?shallow=true'), sh2 = await al('paylasilan/sohbetHesaplari', '?shallow=true');
  console.log('\nsohbetHesaplari anahtarları test:', sh && Object.keys(sh).join(','), '| kök:', sh2 && Object.keys(sh2).join(','));
})();
