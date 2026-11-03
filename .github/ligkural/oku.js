// Puan Tablosu "Lig Kuralları" metnini ve lig ayarlarını (büyük listeler hariç) okur; "ligkural" dalına rapor yazar. Kullanıcı kimliği yazılmaz.
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ;
  try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token;
  const al = async (y, q) => { const r = await fetch(DB + y + '.json' + (q || ''), { headers: { Authorization: 'Bearer ' + tok } }); return r.ok ? r.json() : { HATA: r.status }; };
  for(const yol of ['test/leagues', 'leagues']){
    console.log('\n######## ' + yol + ' ########');
    const L = await al(yol, '?shallow=true') || {};
    for(const lid of Object.keys(L)){
      const K = await al(yol + '/' + lid, '?shallow=true') || {};
      if(!K.leagueRules && !K.lgConfig) continue; console.log('\n=== LİG ' + lid);
      // YALNIZCA kural/puanlama alanları (beyaz liste) - başka hiçbir lig verisi rapora yazılmaz.
      for(const k of Object.keys(K)){
        if(!/^(leagueRules|leagueRulesUpdatedAt|lgConfig|rankNotes|season|leagueName|groupStage|pointsConfig)$/.test(k)) continue;
        const v = await al(yol + '/' + lid + '/' + k);
        const s = typeof v === 'string' ? v : JSON.stringify(v);
        if(k === 'leagueRules') console.log('--- leagueRules ---\n' + v + '\n--- son ---');
        else console.log(k + ': ' + String(s).slice(0, 400));
      }
    }
  }
})().catch(e => { console.log('HATA ' + e.message); });
