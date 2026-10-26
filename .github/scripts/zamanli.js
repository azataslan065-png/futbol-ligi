// Zamanlanmış işlemleri yürütür (bkz. admin.html ZAMANLANMIŞ İŞLEMLER). Kuyruklar: zamanliIslemler ve test/zamanliIslemler.
// Admin paneli açıkken işlemleri kendisi yapar; bu görev panel kapalıyken de yapılmalarını sağlar. Çift yürütmeyi
// 'durum' alanındaki transaction (bekliyor -> isleniyor) önler.
const admin = require('firebase-admin');
const fs = require('fs');
function anahtar(){
  let t = process.env.SA || '';
  try{ return JSON.parse(t); }catch(e){}
  // Telefonda kopyalarken bölünen satırları onar (bkz. firebase-kurallar.yml).
  const govde = (t.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/) || [])[1];
  let duz = t.replace(/\r\n|\r|\n/g, '');
  if(govde != null){
    const b64 = govde.replace(/\\n/g, '').replace(/[^A-Za-z0-9+\/=]/g, '');
    const pem = '-----BEGIN PRIVATE KEY-----\\n' + b64.match(/.{1,64}/g).join('\\n') + '\\n-----END PRIVATE KEY-----\\n';
    duz = duz.replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----(\\n)*/, pem);
  }
  return JSON.parse(duz);
}
(async () => {
  admin.initializeApp({ credential: admin.credential.cert(anahtar()), databaseURL: 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app' });
  const db = admin.database(), simdi = Date.now();
  let yapilan = 0, hata = 0, bekleyen = 0;
  for(const kok of ['zamanliIslemler', 'test/zamanliIslemler']){
    const sn = await db.ref(kok).once('value'), v = sn.val() || {};
    for(const id of Object.keys(v)){
      const x = v[id];
      if(!x || x.durum !== 'bekliyor') continue;
      if(Number(x.zaman) > simdi){ bekleyen++; continue; }
      const kuyruk = db.ref(kok + '/' + id);
      const r = await kuyruk.child('durum').transaction(d => d === 'bekliyor' ? 'isleniyor' : undefined);
      if(!r.committed) continue;
      try{
        if(!x.yol || /^(\.|\/)/.test(x.yol)) throw new Error('Geçersiz yol');
        if(x.tur === 'ptDuyuru') await db.ref(x.yol).set({ text: (x.veri || {}).text || '', ts: Date.now(), active: true });
        else if(x.tur === 'ptDuyuruKaldir') await db.ref(x.yol).remove();
        else if(x.tur === 'sahaDuyuru') await db.ref(x.yol).push({ baslik: (x.veri || {}).baslik || '', metin: (x.veri || {}).metin || '', ts: admin.database.ServerValue.TIMESTAMP });
        else throw new Error('Bilinmeyen işlem: ' + x.tur);
        await kuyruk.update({ durum: 'yapildi', yapildiTs: Date.now(), kim: 'github' });
        yapilan++;
      }catch(e){
        await kuyruk.update({ durum: 'hata', hata: String((e && e.message) || e).slice(0, 200), yapildiTs: Date.now(), kim: 'github' });
        hata++;
      }
    }
  }
  console.log((hata ? '::warning::' : '::notice::') + 'Zamanlanmis islemler | yapilan ' + yapilan + ' | hata ' + hata + ' | bekleyen ' + bekleyen + ' | ' + new Date().toISOString());
  process.exit(0);
})().catch(e => { console.log('::error::' + (e && e.message)); process.exit(1); });
