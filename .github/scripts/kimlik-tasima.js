// KİMLİK TOPLU TAŞIMA (V1.4.0 2. hafta). Henüz girişte taşınmamış, düz şifreli profiller için Firebase hesabı
// açar, profil ile hesabı bağlar ve düz şifreyi siler. Uygulamadaki SahaKimlik (ortak/ortak.js) ile AYNI e-posta
// ve şifre kuralını kullanır, böylece kullanıcı hiçbir şey fark etmeden aynı şifreyle girer.
// Şifreler hiçbir koşulda yazdırılmaz. ORTAM: 'test' (test/ alt ağacı) | 'kok'. DENEME=1 ise hiçbir şey yazılmaz.
const admin = require('firebase-admin'), crypto = require('crypto'), fs = require('fs');
const ORTAM = process.env.ORTAM === 'kok' ? 'kok' : 'test', DENEME = process.env.DENEME !== '0';
const ONEK = ORTAM === 'test' ? 'test/' : '';
const sa = JSON.parse(fs.readFileSync(process.env.RUNNER_TEMP + '/sa_temiz', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa), databaseURL: 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app' });
const db = admin.database(), auth = admin.auth();
const eposta = (p, s) => 'u' + crypto.createHash('sha256').update(ORTAM + '|' + p + '|' + (Number(s) || 0), 'utf8').digest('hex').slice(0, 32) + '@saha-lig.app';
const sifre = pw => 'SAHA·' + String(pw);
(async () => {
  const profiller = (await db.ref(ONEK + 'userProfiles').once('value')).val() || {};
  const say = { toplam: 0, tasinmis: 0, sifresiz: 0, tasinacak: 0, tasindi: 0, hata: 0 }, hatalar = [];
  for (const [p, v] of Object.entries(profiller)) {
    say.toplam++;
    if (!v || typeof v !== 'object') continue;
    if (v.authUid && v.authEposta) { say.tasinmis++; if (v.password && !DENEME) await db.ref(ONEK + 'userProfiles/' + p + '/password').remove(); continue; }
    if (!v.password) { say.sifresiz++; continue; }
    say.tasinacak++;
    if (DENEME) continue;
    try {
      const s = Number(v.authSurum) || 0, e = eposta(p, s);
      let u;
      try { u = await auth.createUser({ email: e, password: sifre(v.password) }); }
      catch (err) {
        if (err.code !== 'auth/email-already-exists') throw err;
        u = await auth.getUserByEmail(e);
        await auth.updateUser(u.uid, { password: sifre(v.password) });
      }
      const simdi = Date.now();
      await db.ref(ONEK + 'userProfiles/' + p).update({ authEposta: e, authSurum: s, authUid: u.uid, authTs: simdi, password: null });
      await db.ref(ONEK + 'kimlik/' + u.uid).set({ p, ts: simdi, kaynak: 'toplu' });
      say.tasindi++;
    } catch (err) { say.hata++; hatalar.push(p + ': ' + (err.code || err.message)); }
  }
  const ozet = `${ORTAM} · ${DENEME ? 'DENEME (yazılmadı)' : 'GERÇEK'} · profil ${say.toplam} · zaten taşınmış ${say.tasinmis} · şifresiz (girişte şifre belirleyecek) ${say.sifresiz} · taşınacak ${say.tasinacak} · taşındı ${say.tasindi} · hata ${say.hata}`;
  console.log((say.hata ? '::warning::' : '::notice::') + 'Kimlik toplu taşıma: ' + ozet);
  hatalar.slice(0, 20).forEach(h => console.log('::warning::' + h));
  process.exit(0);
})().catch(e => { console.log('::error::' + (e && e.message)); process.exit(1); });
