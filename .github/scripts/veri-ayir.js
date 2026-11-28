// (2026-11-28) Test veritabanlarını ayırmak için bir kerelik kopya (bkz. .github/workflows/veri-ayir.yml)
const admin = require('firebase-admin');
function anahtar(){
  let t = process.env.SA || '';
  try{ return JSON.parse(t); }catch(e){}
  const govde = (t.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/) || [])[1];
  let duz = t.replace(/\r\n|\r|\n/g, '');
  if(govde != null){
    const b64 = govde.replace(/\\n/g, '').replace(/[^A-Za-z0-9+\/=]/g, '');
    const pem = '-----BEGIN PRIVATE KEY-----\\n' + b64.match(/.{1,64}/g).join('\\n') + '\\n-----END PRIVATE KEY-----\\n';
    duz = duz.replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----(\\n)*/, pem);
  }
  return JSON.parse(duz);
}
admin.initializeApp({ credential: admin.credential.cert(anahtar()), databaseURL: 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app' });
const db = admin.database();
(async () => {
  const hedefVar = async (y) => (await db.ref(y).once('value')).exists();
  if (!(await hedefVar('umtest/catalog'))) {
    const um = (await db.ref('um').once('value')).val() || {};
    const al = ['owner', 'catalog', 'beta', 'ozel', 'invites', 'claims', 'members', 'reviews', 'inbox', 'gelistirici', 'gclaims', 'gapps', 'sayac', 'media'];
    const kopya = {}; al.forEach((k) => { if (um[k] != null) kopya[k] = um[k]; });
    await db.ref('umtest').update(kopya);
    console.log('umtest kopyalandı:', Object.keys(kopya).join(', '));
  } else console.log('umtest zaten var, dokunulmadı');
  if (!(await hedefVar('test/skorbord'))) {
    const sk = (await db.ref('skorbord').once('value')).val();
    if (sk) { await db.ref('test/skorbord').set(sk); console.log('test/skorbord kopyalandı'); }
  } else console.log('test/skorbord zaten var, dokunulmadı');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
