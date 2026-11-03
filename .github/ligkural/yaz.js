// Lig kuralları metnini (.github/ligkural/kurallar.txt) YALNIZCA TEST veritabanındaki ligin leagueRules alanına yazar (kök/canlı veriye dokunmaz).
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ;
  try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token;
  const metin = fs.readFileSync(process.env.GITHUB_WORKSPACE + '/.github/ligkural/kurallar.txt', 'utf8').trim();
  for(const yol of ['test/leagues/mtdzcqcim4oo', 'test/sahaVeri/leagues/mtdzcqcim4oo']){
    const r = await fetch(DB + yol + '.json', { method:'PATCH', headers:{ Authorization:'Bearer ' + tok, 'Content-Type':'application/json' }, body: JSON.stringify({ leagueRules: metin, leagueRulesUpdatedAt: Date.now() }) });
    console.log(yol, r.status);
  }
})().catch(e => { console.log('HATA ' + e.message); });
