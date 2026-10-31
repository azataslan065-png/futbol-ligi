// Gerçek cihazlardan gelen SAHA teşhis kayıtlarını (son 12 saat) ve müzik/ses ayarını özetler. Kullanıcı adı/kimlik YAZILMAZ.
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ;
  try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token;
  const al = async (y, q) => { const r = await fetch(DB + y + '.json' + (q || ''), { headers: { Authorization: 'Bearer ' + tok } }); return r.ok ? r.json() : { HATA: r.status }; };
  const sinir = Date.now() - 12 * 3600e3, saat = ts => new Date(ts + 3 * 3600e3).toISOString().slice(5, 19).replace('T', ' ');
  for(const kok of ['test/', '']){
    console.log('\n===== ' + (kok || 'KÖK') + ' =====');
    const ses = await al(kok + 'sahaGorunum/ses') || {};
    const m = ses.muzikler || {};
    console.log('müzik sayısı:', Object.keys(m).length, '| seviye', ses.muzikSeviye, '| spiker', ses.spkSesSpiker, ses.spkSesSpikerAd ? '(adlı)' : '', '| yorumcu', ses.spkSesYorumcu);
    for(const k of Object.keys(m).slice(0, 4)){ const u = String(m[k].url || ''); let d = '?'; try{ const r = await fetch(u, { headers: { Range: 'bytes=0-1023' } }); d = r.status + ' ' + r.headers.get('content-type') + ' acao=' + r.headers.get('access-control-allow-origin'); }catch(e){ d = 'hata ' + e.message; } console.log('  ' + u.replace(/^https?:\/\/([^/]+).*\/([^/]{0,40})$/, '$1 …/$2') + ' → ' + d); }
    const L = await al(kok + 'diagnostics/logs', '?orderBy="$key"&limitToLast=600') || {};
    const satir = Object.values(L).filter(x => x && x.app === 'saha' && x.ts > sinir).sort((a, b) => a.ts - b.ts);
    console.log('son 12 saat SAHA kaydı:', satir.length);
    const say = {}; satir.forEach(x => { const k = x.mod + ' | ' + x.title; say[k] = (say[k] || 0) + 1; });
    Object.entries(say).sort((a, b) => b[1] - a[1]).slice(0, 40).forEach(([k, n]) => console.log('  ' + n + '× ' + k));
    console.log('-- ses/müzik/spiker ayrıntı --');
    satir.filter(x => /ses|muzik|spk|medya|anonim|Okuma/i.test((x.mod || '') + ' ' + (x.title || '') + ' ' + (x.detail || ''))).slice(-40)
      .forEach(x => { let d = String(x.detail || ''); try{ const j = JSON.parse(d); delete j.kullanici; delete j.user; d = JSON.stringify(j); }catch(e){} console.log(saat(x.ts), x.mod, x.kind, x.title, d.slice(0, 260), '|', String(x.ua || '').replace(/Mozilla\/5.0 \(|\) AppleWebKit.*?(Chrome\/[\d]+|Version\/[\d.]+).*$/g, ' $1').slice(0, 90)); });
    const SD = await al(kok + 'diagnostics/sesDurum') || {};
    const sd = Object.values(SD).filter(x => x && x.ts > sinir).sort((a, b) => b.ts - a.ts);
    console.log('-- SES DURUM KARTLARI (' + sd.length + ') --');
    sd.slice(0, 6).forEach(x => { console.log(saat(x.ts), x.surum, String(x.ua || '').replace(/Mozilla\/5.0 \(|\) AppleWebKit.*?(Chrome\/[\d]+|Version\/[\d.]+).*$/g, ' $1').slice(0, 80));
      console.log('   ayar', JSON.stringify(x.ayar), 'girişli', x.girisli, 'maçta', x.macta, 'maç motoru', x.macMotoru);
      console.log('   müzik', JSON.stringify(x.muzik)); console.log('   doğal', JSON.stringify(x.dogal)); (x.olay || []).forEach(o => console.log('     · ' + o)); });
    const D = await al(kok + 'diagnostics/devices') || {};
    const cihaz = Object.values(D).filter(x => x && (x.sonGorulme || 0) > sinir);
    console.log('son 12 saatte görülen cihaz:', cihaz.length); cihaz.slice(0, 10).forEach(x => console.log('  ', x.sahaSurum || x.surum || '', x.marka || '', x.model || '', String(x.ua || '').slice(0, 110)));
  }
})().catch(e => { console.log('HATA ' + e.message); });
