// Firebase kural testleri (Realtime Database öykünücüsü). Kurallar yayınlanmadan ÖNCE çalışır; biri başarısızsa yayın yapılmaz.
// Kapsam: V1.4.0 2. hafta sahiplik kuralları (test/ alt ağacı) + kökün eski davranışının bozulmadığı.
const fs = require('fs');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { ref, set, update, get, remove, runTransaction } = require('firebase/database');

(async () => {
  const env = await initializeTestEnvironment({
    projectId: 'demo-saha',
    database: { rules: fs.readFileSync('database.rules.json', 'utf8'), host: '127.0.0.1', port: 9000 }
  });
  const gecmis = Date.now() - 60000, gelecek = Date.now() + 3600000;
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.database();
    await set(ref(db, 'admins/ADMIN'), true);
    await set(ref(db, 'test'), {
      userProfiles: {
        v_ali: { name: 'Ali', authEposta: 'ali@saha-lig.app', authUid: 'UA' },
        v_veli: { name: 'Veli', authEposta: 'veli@saha-lig.app', authUid: 'UV' },
        v_eski: { name: 'Eski', password: '1234' }
      },
      kimlik: { UA: { p: 'v_ali' }, UV: { p: 'v_veli' } },
      kullanicilar: { v_ali: { para: 100, durum: 'onayli' }, v_veli: { para: 50, durum: 'onayli' } },
      takimSahipleri: { T1: 'v_ali', T2: 'v_veli' },
      oyuncuHavuzu: {
        o1: { ad: 'Bir', guc: 50, sahip: 'v_ali', satista: false },
        o2: { ad: 'Iki', guc: 60, satista: true, fiyat: 10 },
        o3: { ad: 'Uc', guc: 70, satista: true, artirma: { bas: 5, adim: 1, bitis: gecmis, eskiSahip: 'v_veli', teklif: { u: 'v_ali', tutar: 20 } } },
        o4: { ad: 'Dort', guc: 70, satista: true, artirma: { bas: 5, adim: 1, bitis: gelecek } }
      },
      sahaVeri: { leagues: { L1: { matches: {
        m1: { homeId: 'T1', awayId: 'T2', sahaOnayli: true },
        m2: { homeId: 'T3', awayId: 'T4', sahaOnayli: true },
        m3: { homeId: 'T1', awayId: 'T2', sahaOnayli: false }
      } } } }
    });
    await set(ref(db, 'kullanicilar/v_kok'), { para: 5 });   // kök (eski sürüm) verisi
  });
  const k = (uid, email) => env.authenticatedContext(uid, email ? { email } : { firebase: { sign_in_provider: 'anonymous' } }).database();
  const ali = k('UA', 'ali@saha-lig.app'), veli = k('UV', 'veli@saha-lig.app'), kotu = k('UX', 'x@saha-lig.app'), anon = k('ANON1'), admin = k('ADMIN', 'admin@ornek.com');
  const T = 'test/';
  const sonuc = []; let hata = 0;
  async function bek(ad, beklenen, fn){
    try{ await (beklenen ? assertSucceeds(fn()) : assertFails(fn())); sonuc.push('✓ ' + ad); }
    catch(e){ hata++; sonuc.push('✗ ' + ad + ' — ' + String(e && e.message || e).split('\n')[0].slice(0, 160)); }
  }
  // 1) SAHA kullanıcı kaydı
  await bek('Kendi parasına yazabilir', true, () => set(ref(ali, T + 'kullanicilar/v_ali/para'), 90));
  await bek('Başkasının parasına yazamaz', false, () => set(ref(veli, T + 'kullanicilar/v_ali/para'), 999999));
  await bek('Kimliksiz hesap kimsenin parasına yazamaz', false, () => set(ref(kotu, T + 'kullanicilar/v_ali/para'), 0));
  await bek('Anonim oturum başkasının parasına yazamaz', false, () => set(ref(anon, T + 'kullanicilar/v_veli/para'), 0));
  await bek('Arkadaşlık kabulü: karşı tarafa yalnızca kendi satırını yazar', true, () => set(ref(veli, T + 'kullanicilar/v_ali/arkadaslar/v_veli'), true));
  await bek('Karşı tarafa başkası adına arkadaş satırı yazamaz', false, () => set(ref(veli, T + 'kullanicilar/v_ali/arkadaslar/v_baska'), true));
  await bek('Kullanıcı kendi askı kaydını silemez', false, () => remove(ref(ali, T + 'kullanicilar/v_ali/askida')));
  await bek('Kullanıcı kendine onay veremez', false, () => set(ref(ali, T + 'kullanicilar/v_ali/onaylandi'), true));
  await bek('Yönetici her kullanıcıya para yazabilir', true, () => set(ref(admin, T + 'kullanicilar/v_veli/para'), 75));
  // 2) Profiller ve kimlik bağı
  await bek('Başkasının profilini değiştiremez', false, () => set(ref(veli, T + 'userProfiles/v_ali/name'), 'Hack'));
  await bek('Kendi profilini değiştirebilir', true, () => set(ref(ali, T + 'userProfiles/v_ali/avatar'), 'x'));
  await bek('Kimse düz şifre yazamaz', false, () => set(ref(ali, T + 'userProfiles/v_ali/password'), '1111'));
  await bek('Kullanıcı geçici şifre yazamaz', false, () => set(ref(ali, T + 'userProfiles/v_ali/tempPassword'), 'ABC'));
  await bek('Yönetici geçici şifre yazabilir', true, () => set(ref(admin, T + 'userProfiles/v_ali/tempPassword'), 'ABC'));
  await bek('Kullanıcı kendi geçici şifresini silebilir', true, () => remove(ref(ali, T + 'userProfiles/v_ali/tempPassword')));
  await bek('Kendi e-postası yazılı olmayan profile bağ kuramaz', false, () => set(ref(kotu, T + 'kimlik/UX'), { p: 'v_ali' }));
  await bek('Kendi bağını yazabilir', true, () => set(ref(ali, T + 'kimlik/UA'), { p: 'v_ali', ts: 1 }));
  await bek('Başkasının bağını yazamaz', false, () => set(ref(ali, T + 'kimlik/UV'), { p: 'v_ali' }));
  await bek('Yeni profil açılabilir (ilk kayıt)', true, () => set(ref(kotu, T + 'userProfiles/v_yeni'), { name: 'Yeni', authEposta: 'x@saha-lig.app', authUid: 'UX' }));
  await bek('Yeni profile kendi bağını kurar', true, () => set(ref(kotu, T + 'kimlik/UX'), { p: 'v_yeni' }));
  await bek('Profilde başka hesabın uid\'sini yazamaz', false, () => set(ref(kotu, T + 'userProfiles/v_eski/authUid'), 'UA'));
  // 3) Oyuncu havuzu
  await bek('Başkasının oyuncusunu serbest bırakamaz', false, () => remove(ref(veli, T + 'oyuncuHavuzu/o1/sahip')));
  await bek('Başkasının oyuncusunu satışa koyamaz', false, () => set(ref(veli, T + 'oyuncuHavuzu/o1/satisIlan'), { fiyat: 1 }));
  await bek('Satıştaki oyuncuyu kendi adına alır', true, () => update(ref(veli), { [T + 'oyuncuHavuzu/o2/sahip']: 'v_veli', [T + 'oyuncuHavuzu/o2/satista']: false, [T + 'oyuncuHavuzu/o2/alisTs']: 1, [T + 'kullanicilar/v_veli/para']: 40 }));
  await bek('Satıştaki oyuncuyu başkası adına alamaz', false, () => set(ref(kotu, T + 'oyuncuHavuzu/o4/sahip'), 'v_ali'));
  await bek('Kendi oyuncusunu serbest bırakır', true, () => remove(ref(ali, T + 'oyuncuHavuzu/o1/sahip')));
  // 4) Açık artırma
  await bek('Üçüncü kişi artırmayı "satıldı" yapamaz', false, () => set(ref(kotu, T + 'oyuncuHavuzu/o3/artirma/durum'), 'satildi'));
  await bek('Üçüncü kişi kendine ödeme kaydı açamaz', false, () => set(ref(kotu, T + 'oyuncuHavuzu/o3/artirma/odeme'), { u: 'v_yeni', tutar: 20, durum: 'bekliyor' }));
  await bek('Kazanan sonuçlandırır, satıcıya ödeme kaydı bırakır', true, () => update(ref(ali), {
    [T + 'oyuncuHavuzu/o3/sahip']: 'v_ali', [T + 'oyuncuHavuzu/o3/satista']: false, [T + 'oyuncuHavuzu/o3/alisTs']: 1,
    [T + 'oyuncuHavuzu/o3/artirma/durum']: 'satildi', [T + 'oyuncuHavuzu/o3/artirma/odeme']: { u: 'v_veli', tutar: 20, durum: 'bekliyor', ts: 1 },
    [T + 'kullanicilar/v_ali/para']: 70 }));
  await bek('Başkası satıcının ödemesini alamaz', false, () => set(ref(kotu, T + 'oyuncuHavuzu/o3/artirma/odeme/durum'), 'odendi'));
  await bek('Satıcı ödemesini tahsil eder', true, () => runTransaction(ref(veli, T + 'oyuncuHavuzu/o3/artirma/odeme/durum'), d => d === 'bekliyor' ? 'odendi' : undefined));
  await bek('Teklif başkası adına verilemez', false, () => set(ref(veli, T + 'oyuncuHavuzu/o4/artirma/teklif'), { u: 'v_ali', tutar: 6 }));
  await bek('Kendi adına geçerli teklif verir', true, () => set(ref(veli, T + 'oyuncuHavuzu/o4/artirma/teklif'), { u: 'v_veli', tutar: 6 }));
  // 5) Takım sahipliği ve maç sonuçları
  await bek('Kimliksiz hesap takım sahiplenemez', false, () => set(ref(anon, T + 'takimSahipleri/T3'), 'v_ali'));
  await bek('Başkasının takımını devralamaz', false, () => set(ref(veli, T + 'takimSahipleri/T1'), 'v_veli'));
  await bek('Boş takımı kendi adına alır', true, () => set(ref(ali, T + 'takimSahipleri/T5'), 'v_ali'));
  await bek('Maçın takım sahibi skor yazar', true, () => set(ref(ali, T + 'sahaVeri/leagues/L1/matches/m1/homeGoals'), 2));
  await bek('Maçla ilgisi olmayan skor yazamaz', false, () => set(ref(kotu, T + 'sahaVeri/leagues/L1/matches/m1/homeGoals'), 9));
  await bek('Sahipsiz takımlı maçı onaylı kullanıcı oynar', true, () => set(ref(veli, T + 'sahaVeri/leagues/L1/matches/m2/awayGoals'), 1));
  await bek('Onaysız maça kimse skor yazamaz', false, () => set(ref(ali, T + 'sahaVeri/leagues/L1/matches/m3/homeGoals'), 3));
  await bek('Herkes maça yorum yazabilir', true, () => set(ref(anon, T + 'sahaVeri/leagues/L1/matches/m1/comments/c1'), { text: 'x' }));
  // 6) Zorunlu güncelleme ve SAHA sorun bildirimi (2026-10-30-A)
  await bek('Kullanıcı zorunlu sürümü değiştiremez', false, () => set(ref(ali, T + 'globalConfig/minSurum'), { build: '2020-01-01-A' }));
  await bek('Anonim bakım ayarını değiştiremez', false, () => set(ref(anon, T + 'globalConfig/maintenanceSaha'), { active: false }));
  await bek('Yönetici zorunlu sürümü ayarlar', true, () => set(ref(admin, T + 'globalConfig/minSurum'), { build: '2026-10-30-A', ts: 1 }));
  await bek('Herkes zorunlu sürümü okur', true, () => get(ref(anon, T + 'globalConfig/minSurum')));
  await bek('SAHA kullanıcısı sorun bildirir', true, () => set(ref(ali, T + 'sahaVeri/leagues/L1/feedback/fb1'), { user: 'Ali', text: 'x', ts: 1, status: 'pending' }));
  // 7) Kök (yayındaki eski sürüm) değişmedi
  await bek('Kök: eski kural aynen (anonim kendi alanına yazar)', true, () => set(ref(anon, 'kullanicilar/v_kok/para'), 6));
  const satir = sonuc.join('\n');
  console.log(satir);
  fs.writeFileSync(process.env.RUNNER_TEMP ? process.env.RUNNER_TEMP + '/kural-sonuc.txt' : 'kural-sonuc.txt', satir);
  console.log((hata ? '::error::' : '::notice::') + 'Kural testleri: ' + (sonuc.length - hata) + '/' + sonuc.length + ' geçti');
  await env.cleanup();
  process.exit(hata ? 1 : 0);
})().catch(e => { console.log('::error::Kural testi çalışmadı: ' + (e && e.message)); process.exit(1); });
