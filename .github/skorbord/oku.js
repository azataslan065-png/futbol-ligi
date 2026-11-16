// Skorbord teşhisi: skorbord/ düğümünün YAPISI (anahtar adları, tür, boyut; değer YAZILMAZ) + herkese açık okuma ve canlı akış denetimi.
// Admin "Skorbord" kaynağında hangi yollara yazmış, Skorbord'un okuduğu yollarla eşleşiyor mu - bunu görmek için.
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ;
  try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token;
  const al = async (y, q) => { const r = await fetch(DB + y + '.json' + (q || ''), { headers: { Authorization: 'Bearer ' + tok } }); return r.ok ? r.json() : { HATA: r.status }; };
  const yapi = (v, d, on) => { if(v === null || typeof v !== 'object'){ console.log(on + ' : ' + (v === null ? 'null' : typeof v) + (typeof v === 'string' ? '(' + v.length + ')' : '')); return; }
    const k = Object.keys(v); if(d <= 0){ console.log(on + ' : {' + k.length + ' anahtar, ' + JSON.stringify(v).length + ' bayt}'); return; }
    k.slice(0, 40).forEach(x => yapi(v[x], d - 1, on + '/' + x)); if(k.length > 40) console.log(on + '/… (+' + (k.length - 40) + ')'); };
  for(const y of ['skorbord', 'test/skorbord']){ console.log('\n===== ' + y + ' ====='); const v = await al(y); yapi(v, 3, y); }
  // yanlış köke yazılmış olabilir mi: test/ altındaki SAHA dışı kök ile kıyas için yalnızca son değişen üst dallar
  console.log('\n===== herkese açık okuma =====');
  try{ const r = await fetch(DB + 'skorbord.json?shallow=true'); console.log('skorbord.json', r.status, r.headers.get('access-control-allow-origin')); }catch(e){ console.log('hata', e.message); }
  try{ const c = new AbortController(); setTimeout(() => c.abort(), 6000); const r = await fetch(DB + 'skorbord.json', { headers: { Accept: 'text/event-stream' }, signal: c.signal, redirect: 'manual' });
    console.log('akış', r.status, r.headers.get('content-type'), 'yön:', (r.headers.get('location') || '').replace(/\?.*$/, ''));
    if(r.status === 200){ const rd = r.body.getReader(); const { value } = await rd.read(); console.log('ilk olay:', String(Buffer.from(value)).split('\n')[0]); c.abort(); } }catch(e){ console.log('akış:', e.name); }
})();
