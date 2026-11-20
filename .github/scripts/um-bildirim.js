// Uygulama Merkezi (um/) bildirim kuyruğunu işler: yönetici panelinden eklenen duyuruları
// davetlilerin telefonlarına Firebase Cloud Messaging (web push) ile gönderir.
// Kuyruk: um/pushQueue/<id> = { title, body, link, hedef: 'hepsi' | 'test', durum: 'bekliyor', t }
// Sonuç aynı kayda yazılır: durum 'gonderildi' | 'hata', gonderilen, basarisiz, hata.
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
const SITE = 'https://azataslan065-png.github.io/uygulama-merkezi/';
(async () => {
  admin.initializeApp({ credential: admin.credential.cert(anahtar()), databaseURL: 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app' });
  const db = admin.database();
  const kuyruk = (await db.ref('um/pushQueue').once('value')).val() || {};
  const bekleyen = Object.keys(kuyruk).filter((id) => kuyruk[id] && kuyruk[id].durum === 'bekliyor');
  if(!bekleyen.length){ console.log('Bekleyen bildirim yok'); process.exit(0); }
  const [push, members, claims, invites] = await Promise.all(['um/push', 'um/members', 'um/claims', 'um/invites'].map(async (p) => (await db.ref(p).once('value')).val() || {}));
  for(const id of bekleyen){
    const ref = db.ref('um/pushQueue/' + id);
    const al = await ref.child('durum').transaction((d) => d === 'bekliyor' ? 'isleniyor' : undefined);
    if(!al.committed) continue;
    const x = kuyruk[id];
    // Hedef: iptal edilmemiş davetle giriş yapmış kişiler (test bildirimi yalnızca testçilere)
    const hedefler = Object.keys(push).filter((uid) => {
      const kod = claims[uid], dv = kod && invites[kod];
      if(!dv || dv.active !== true || !push[uid] || !push[uid].token) return false;
      return x.hedef === 'test' ? dv.beta === true : true;
    });
    const tokens = hedefler.map((uid) => push[uid].token);
    let gonderilen = 0, basarisiz = 0, hata = '';
    try{
      for(let i = 0; i < tokens.length; i += 500){
        const parca = tokens.slice(i, i + 500);
        const r = await admin.messaging().sendEachForMulticast({
          tokens: parca,
          data: { title: String(x.title || 'Uygulama Merkezi'), body: String(x.body || ''), link: String(x.link || SITE) },
          webpush: { headers: { Urgency: 'high', TTL: '86400' }, fcmOptions: { link: String(x.link || SITE) } }
        });
        gonderilen += r.successCount; basarisiz += r.failureCount;
        r.responses.forEach((rr, j) => {
          if(rr.success) return;
          const kod = rr.error && rr.error.code || '';
          if(!hata) hata = kod + ' ' + (rr.error && rr.error.message || '');
          // Geçersiz/silinmiş jetonları temizle
          if(/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(kod)){
            const uid = hedefler[i + j]; if(uid) db.ref('um/push/' + uid).remove().catch(() => {});
          }
        });
      }
      await ref.update({ durum: 'gonderildi', gonderilen, basarisiz, hedef_sayisi: tokens.length, hata: hata.slice(0, 300), bitis: Date.now() });
      console.log(`${id}: ${gonderilen}/${tokens.length} gönderildi` + (hata ? ' | ilk hata: ' + hata : ''));
    }catch(e){
      await ref.update({ durum: 'hata', hata: String(e && e.message || e).slice(0, 300), bitis: Date.now() });
      console.log('::error::' + id + ': ' + (e && e.message));
    }
  }
  process.exit(0);
})().catch((e) => { console.log('::error::' + (e && e.message)); process.exit(1); });
