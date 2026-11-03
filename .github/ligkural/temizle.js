// KUPA KALINTISI TEMİZLİĞİ (yalnızca TEST veritabanı): lig formatı 'league' yapılır; maçlardaki penaltı kazananı / uzatma alanları silinir.
// Rapor: kaç maçta hangi alan vardı (maç anahtarı, hafta ve skor; kişisel veri yok).
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
const ALAN = ['penaltyWinner', 'penaltyScore', 'inPenalties', 'hadExtraTime', 'hadExtraHalf', 'penalties'];
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ;
  try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token;
  const H = { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' };
  const al = async y => { const r = await fetch(DB + y + '.json', { headers: H }); return r.ok ? r.json() : null; };
  const yama = async (y, v) => (await fetch(DB + y + '.json', { method: 'PATCH', headers: H, body: JSON.stringify(v) })).status;
  for(const kok of ['test/leagues', 'test/sahaVeri/leagues']){
    const L = await al(kok + '/mtdzcqcim4oo/lgConfig');
    console.log(kok, 'lgConfig önce', JSON.stringify(L), '→', await yama(kok + '/mtdzcqcim4oo/lgConfig', { format: 'league' }));
    const M = await al(kok + '/mtdzcqcim4oo/matches') || {};
    const up = {}; let n = 0;
    for(const [k, m] of Object.entries(M)){
      if(!m || typeof m !== 'object') continue;
      const var_ = ALAN.filter(a => m[a] !== undefined && m[a] !== null && m[a] !== false && m[a] !== '');
      const hepsi = ALAN.filter(a => m[a] !== undefined);
      if(var_.length) console.log('  maç', k, 'hafta', m.week, (m.homeGoals ?? '?') + '-' + (m.awayGoals ?? '?'), 'alanlar:', var_.map(a => a + '=' + JSON.stringify(m[a]).slice(0, 40)).join(' '));
      hepsi.forEach(a => { up[k + '/' + a] = null; }); if(hepsi.length) n++;
    }
    console.log('  temizlenen maç:', n, Object.keys(up).length ? '→ ' + await yama(kok + '/mtdzcqcim4oo/matches', up) : '');
  }
})().catch(e => { console.log('HATA ' + e.message); });
