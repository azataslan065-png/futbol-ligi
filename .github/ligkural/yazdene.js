// Ses kayıt sayfasının yaptığı yazmayı yönetici kimliğiyle (kurallar uygulanarak) dener, sonra siler. uid yazılmaz.
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ; try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token, H = { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' };
  const uid = Object.keys(await (await fetch(DB + 'admins.json', { headers: H })).json() || {})[0];
  const ov = '?auth_variable_override=' + encodeURIComponent(JSON.stringify({ uid: uid, provider: 'password' }));
  const dene = async (ad, govde) => { const r = await fetch(DB + '.json' + ov, { method: 'PATCH', headers: H, body: JSON.stringify(govde) }); console.log(ad, r.status, (await r.text()).slice(0, 200)); return r.status; };
  const k = 'isimSes/yorumcu/o_zz_deneme/normal', v = { m: 'deneme', url: 'https://example.invalid/x.webm', t: Date.now() };
  await dene('isim kok+test', { ['sahaGorunum/' + k]: v, ['test/sahaGorunum/' + k]: v });
  await dene('isim sadece kok', { ['sahaGorunum/' + k]: v });
  await dene('isim sadece test', { ['test/sahaGorunum/' + k]: v });
  await dene('anons kok+test', { 'sahaGorunum/anonsSes/zz_deneme': v, 'test/sahaGorunum/anonsSes/zz_deneme': v });
  await dene('temizle', { ['sahaGorunum/' + k]: null, ['test/sahaGorunum/' + k]: null, 'sahaGorunum/anonsSes/zz_deneme': null, 'test/sahaGorunum/anonsSes/zz_deneme': null });
})().catch(e => console.log('HATA ' + e.message));
