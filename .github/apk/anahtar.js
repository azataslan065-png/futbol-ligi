// APK imza anahtarı Firebase'de, kuralların kimseye açmadığı _apkImza yolunda durur (yalnızca hizmet hesabı okur).
// Yoksa bir kez üretilir ve oraya yazılır; böylece her derleme aynı anahtarla imzalanır ve uygulama üstüne güncellenir.
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs'), cp = require('child_process'), crypto = require('crypto');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/_apkImza.json';
(async () => {
  const t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'); let SAJ; try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token, H = { Authorization: 'Bearer ' + tok };
  const yol = process.env.RUNNER_TEMP + '/saha.jks';
  let v = await (await fetch(DB, { headers: H })).json();
  if(!v || !v.jks){
    const sifre = crypto.randomBytes(18).toString('base64url');
    cp.execFileSync('keytool', ['-genkeypair', '-keystore', yol, '-alias', 'saha', '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000',
      '-storepass', sifre, '-keypass', sifre, '-dname', 'CN=SAHA, O=AZAT, C=TR', '-storetype', 'PKCS12']);
    v = { jks: fs.readFileSync(yol).toString('base64'), sifre, t: Date.now() };
    const r = await fetch(DB, { method: 'PUT', headers: H, body: JSON.stringify(v) }); if(!r.ok) throw new Error('anahtar yazılamadı ' + r.status);
    console.log('yeni anahtar üretildi');
  } else { fs.writeFileSync(yol, Buffer.from(v.jks, 'base64')); console.log('anahtar okundu'); }
  fs.appendFileSync(process.env.GITHUB_ENV, 'KS_YOL=' + yol + '\nKS_SIFRE=' + v.sifre + '\n');
  console.log('::add-mask::' + v.sifre);
})().catch(e => { console.error(e.message); process.exit(1); });
