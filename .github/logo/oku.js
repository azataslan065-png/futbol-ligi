// Logo teşhisi: takım logolarının nerede durduğu (adres başı) ve adresin şu an açılıp açılmadığı. Rapor "logo-rapor" dalına.
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ;
  try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token;
  const al = async (y, q) => { const r = await fetch(DB + y + '.json' + (q || ''), { headers: { Authorization: 'Bearer ' + tok } }); return r.ok ? r.json() : { HATA: r.status }; };
  for (const kok of ['test/', '']) {
    const ligler = await al(kok + 'leagues', '?shallow=true') || {};
    console.log('\n===== ' + (kok || 'kök/') + 'leagues: ' + Object.keys(ligler).length + ' lig');
    for (const lig of Object.keys(ligler).slice(-4)) {
      const tk = await al(kok + 'leagues/' + lig + '/teams') || {};
      console.log('-- lig ' + lig + ': ' + Object.keys(tk).length + ' takım');
      for (const [id, x] of Object.entries(tk).slice(0, 12)) {
        const l = String((x && x.logo) || '');
        let durum = '';
        if (/^https?:/.test(l)) { try { const r = await fetch(l, { method: 'GET', redirect: 'follow' }); const b = await r.arrayBuffer(); durum = 'HTTP ' + r.status + ' ' + (r.headers.get('content-type') || '') + ' ' + b.byteLength + 'B ' + (r.status >= 400 ? Buffer.from(b).toString('utf8').slice(0, 160).replace(/\s+/g, ' ') : ''); } catch (e) { durum = 'HATA ' + e.message; } }
        else if (l.startsWith('data:')) durum = 'data URL ' + l.length + ' karakter';
        else durum = l ? 'tanınmayan' : 'logo YOK';
        console.log('   ' + String((x && (x.name || x.ad)) || id).slice(0, 24).padEnd(24) + ' | ' + l.slice(0, 90) + ' | ' + durum);
      }
    }
  }
})().catch(e => console.log('HATA ' + e.message));
