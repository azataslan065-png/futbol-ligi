// Puan Tablosu "Lig Kuralları" metnini ve lig ayarlarını (büyük listeler hariç) okur; "ligkural" dalına rapor yazar. Kullanıcı kimliği yazılmaz. 
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ;
  try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token;
  const al = async (y, q) => { const r = await fetch(DB + y + '.json' + (q || ''), { headers: { Authorization: 'Bearer ' + tok } }); return r.ok ? r.json() : { HATA: r.status }; };
  for(const yol of ['test/leagues', 'test/sahaVeri/leagues', 'leagues', 'sahaVeri/leagues']){
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
  for(const kok of ['test/', 'test/sahaVeri/', '', 'sahaVeri/']) for(const k of ['sahaSariSinir', 'sahaMacSuresiDk', 'sahaArkadasSuresiDk', 'sahaRastgeleSuresiDk']) console.log((kok || 'KÖK/') + 'globalAdminSettings/' + k + ' = ' + JSON.stringify(await al(kok + 'globalAdminSettings/' + k)));
  // (2026-11-07) Oyuncu havuzu özeti (ses kayıt isim listesi için): toplam, başlangıç oyuncusu, transfer oyuncusu, alan adları
  for(const kok of ['test/', '']){ const H = await al(kok + 'oyuncuHavuzu') || {}; const v = Object.values(H).filter(x => x && typeof x === 'object');
    const bas = v.filter(x => x.baslangic === true).length, tr = v.filter(x => x.baslangic !== true);
    console.log((kok || 'KÖK/') + 'oyuncuHavuzu: toplam ' + v.length + ', başlangıç ' + bas + ', transfer ' + tr.length + ', adı olan transfer ' + tr.filter(x => String(x.ad || '').trim()).length + ', satışta ' + tr.filter(x => x.satista).length);
    console.log('  baslangic değerleri: ' + JSON.stringify(v.reduce((o, x) => { const k = String(x.baslangic); o[k] = (o[k] || 0) + 1; return o; }, {})));
    console.log('  transfer örnek adlar: ' + tr.slice(0, 8).map(x => x.ad).join(', ')); }
  // (2026-11-07) admins değer türleri (uid yazılmaz): kural "=== true" ister
  { const A = await al('admins') || {}; console.log('admins: ' + JSON.stringify(Object.values(A).map(v => typeof v + ':' + (typeof v === 'object' ? Object.keys(v || {}).join('|') : String(v)))));
    const T = await al('test/admins') || {}; console.log('test/admins: ' + JSON.stringify(Object.values(T).map(v => typeof v + ':' + (typeof v === 'object' ? Object.keys(v || {}).join('|') : String(v))))); }
  for(const y of ['sahaGorunum/anonsSes', 'test/sahaGorunum/anonsSes', 'sahaGorunum/isimSes', 'test/sahaGorunum/isimSes', 'sahaGorunum/taraftarSes']){ const v = await al(y, '?shallow=true'); console.log(y + ': ' + JSON.stringify(v).slice(0, 300)); }
})().catch(e => { console.log('HATA ' + e.message); });
