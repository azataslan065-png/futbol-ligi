// Gerçek cihazlardan gelen SAHA teşhis kayıtlarını (son 12 saat) ve müzik/ses ayarını özetler. Kullanıcı adı/kimlik YAZILMAZ.
const { GoogleAuth } = require('google-auth-library'); const fs = require('fs');
const DB = 'https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/';
(async () => {
  let t = fs.readFileSync(process.env.RUNNER_TEMP + '/sa.json', 'utf8'), SAJ;
  try{ SAJ = JSON.parse(t); }catch(e){ SAJ = JSON.parse(t.replace(/\r?\n/g, '\\n')); }
  const auth = new GoogleAuth({ credentials: SAJ, scopes: ['https://www.googleapis.com/auth/firebase.database', 'https://www.googleapis.com/auth/userinfo.email'] });
  const tok = (await (await auth.getClient()).getAccessToken()).token;
  const al = async (y, q) => { const r = await fetch(DB + y + '.json' + (q || ''), { headers: { Authorization: 'Bearer ' + tok } }); return r.ok ? r.json() : { HATA: r.status }; };
  const sinir = Date.now() - 12 * 3600e3, saat = ts => new Date(ts + 3 * 3600e3).toISOString().slice(5, 19).replace('T', ' ');
  for(const yol of ['test/sahaVeri/leagues', 'test/leagues', 'leagues']){
    const L = await al(yol, '?shallow=true') || {};
    for(const lid of Object.keys(L).slice(-6)){ const T = await al(yol + '/' + lid + '/teams') || {};
      const st = Object.values(T).map(t => t && t.stadium).filter(Boolean); if(st.length) console.log('STADYUM', yol, lid, JSON.stringify(st)); }
  }
  for(const kok of ['test/', '']){
    console.log('\n===== ' + (kok || 'KÖK') + ' =====');
    const ses = await al(kok + 'sahaGorunum/ses') || {};
    const m = ses.muzikler || {};
    { const S = ses.kayitSilinen || {}; const K = Object.keys(S); console.log('kayitSilinen:', K.length, K.slice(0, 12).join(','), '| alanlar:', Object.keys(ses).join(',')); }
    console.log('müzik sayısı:', Object.keys(m).length, '| seviye', ses.muzikSeviye, '| spiker', ses.spkSesSpiker, ses.spkSesSpikerAd ? '(adlı)' : '', '| yorumcu', ses.spkSesYorumcu);
    for(const k of Object.keys(m).slice(0, 4)){ const u = String(m[k].url || ''); let d = '?'; try{ const r = await fetch(u, { headers: { Range: 'bytes=0-1023' } }); d = r.status + ' ' + r.headers.get('content-type') + ' acao=' + r.headers.get('access-control-allow-origin'); }catch(e){ d = 'hata ' + e.message; } console.log('  ' + u.replace(/^https?:\/\/([^/]+).*\/([^/]{0,40})$/, '$1 …/$2') + ' → ' + d); }
    { const A = await al(kok + 'sahaGorunum/anonsSes', '?shallow=true') || {}; const K = Object.keys(A); const g = {}; K.forEach(k => { const m = k.match(/^(_|o_|oi_|os_|n_|t_)/); const t = m ? m[1] : 'diger'; g[t] = (g[t] || 0) + 1; });
      console.log('anonsSes anahtar:', K.length, JSON.stringify(g), '| sabit:', K.filter(k => k[0] === '_').join(','), '| o_ ilk 15:', K.filter(k => k.startsWith('o_')).slice(0, 15).join(','), '| oi_ ilk 8:', K.filter(k => k.startsWith('oi_')).slice(0, 8).join(',')); }
    { const TS = await al(kok + 'sahaGorunum/taraftarSes') || {}; const o = {}; Object.keys(TS).forEach(t => { const g = {}; Object.values(TS[t] || {}).forEach(x => { const k = (x && x.tur) || '?'; g[k] = (g[k] || 0) + 1; }); o[t] = g; }); console.log('taraftarSes:', JSON.stringify(o).slice(0, 900)); }
    { const T = await al(kok + 'reklamPanolari/tribun') || {}; const GA = await al(kok + 'sahaGorunum/golAnim') || {}; const o = {}; Object.keys(GA).forEach(k => { const x = GA[k] || {}; o[k] = { yazi:x.yazi || '', video:x.video ? String(x.video).slice(-50) : '' }; });
      console.log('LED gol süreleri:', T.golSure1, T.golSure2, '| tribün öğe:', Object.keys(T.ogeler || {}).length, '| golAnim:', JSON.stringify(o).slice(0, 600)); }
    if(kok === 'test/'){ const GS = await al('test/paylasilan/genelSohbet') || {}; const P = Object.entries(GS).filter(([k, c]) => c && c.pinned); console.log('genel sohbet:', Object.keys(GS).length, 'mesaj, sabitli:', P.map(([k, c]) => k + '@' + saat(c.ts || 0) + ' ' + String(c.text || '').slice(0, 30).replace(/\s+/g, ' ')).join(' | ')); }
    { const MS = await al(kok + 'globalConfig/minSurum'); console.log('globalConfig/minSurum:', JSON.stringify(MS)); }
    { const A = await al(kok + 'sahaGorunum/anonsSes/_golBagir'); console.log('_golBagir kaydı:', A && A.url ? 'VAR' : 'yok'); }
    { const I = await al(kok + 'sahaGorunum/isimSes') || {}; const r = {}; Object.keys(I).forEach(rol => { const T = I[rol] || {}; r[rol] = Object.keys(T).length + ' ad (' + Object.keys(T).slice(0, 6).join(',') + ')'; }); console.log('isimSes:', JSON.stringify(r)); }
    const L = await al(kok + 'diagnostics/logs', '?orderBy="$key"&limitToLast=600') || {};
    const satir = Object.values(L).filter(x => x && x.app === 'saha' && x.ts > sinir).sort((a, b) => a.ts - b.ts);
    console.log('son 12 saat SAHA kaydı:', satir.length);
    const say = {}; satir.forEach(x => { const k = x.mod + ' | ' + x.title; say[k] = (say[k] || 0) + 1; });
    Object.entries(say).sort((a, b) => b[1] - a[1]).slice(0, 40).forEach(([k, n]) => console.log('  ' + n + '× ' + k));
    console.log('-- ses/müzik/spiker ayrıntı --');
    satir.filter(x => /ses|muzik|spk|medya|anonim|Okuma/i.test((x.mod || '') + ' ' + (x.title || '') + ' ' + (x.detail || ''))).slice(-40)
      .forEach(x => { let d = String(x.detail || ''); try{ const j = JSON.parse(d); delete j.kullanici; delete j.user; d = JSON.stringify(j); }catch(e){} console.log(saat(x.ts), x.mod, x.kind, x.title, d.slice(0, 260), '|', String(x.ua || '').replace(/Mozilla\/5.0 \(|\) AppleWebKit.*?(Chrome\/[\d]+|Version\/[\d.]+).*$/g, ' $1').slice(0, 90)); });
    const SD = await al(kok + 'diagnostics/sesDurum') || {};
    const sd = Object.values(SD).filter(x => x && x.ts > sinir).sort((a, b) => b.ts - a.ts);
    console.log('-- SES DURUM KARTLARI (' + sd.length + ') --');
    sd.slice(0, 4).forEach(x => { console.log(saat(x.ts), x.surum, String(x.ua || '').replace(/Mozilla\/5.0 \(|\) AppleWebKit.*?(Chrome\/[\d]+|Version\/[\d.]+).*$/g, ' $1').slice(0, 80));
      console.log('   ayar', JSON.stringify(x.ayar), 'girişli', x.girisli, 'maçta', x.macta, 'maç motoru', x.macMotoru);
      console.log('   müzik', JSON.stringify(x.muzik)); console.log('   kalabalık', JSON.stringify(x.kalabalik || null)); console.log('   doğal', JSON.stringify(x.dogal)); (x.olay || []).forEach(o => console.log('     · ' + o)); });
    { const KD = await al(kok + 'diagnostics/klipDurum') || {}; Object.values(KD).filter(x => x && x.ts > sinir).sort((a, b) => b.ts - a.ts).slice(0, 6).forEach(x => { const y = Object.assign({}, x); delete y.ua; console.log('KLİP', saat(x.ts), JSON.stringify(y)); }); }
    const D = await al(kok + 'diagnostics/devices') || {};
    const cihaz = Object.values(D).filter(x => x && (x.sonGorulme || 0) > sinir);
    { // MAÇ RAPORLARI (2026-11-14-A): her maçın cihaz/ağ/bağlantı/kare özeti (bkz. saha.html MAÇ RAPORU). Son 3 gün, en yeni 40.
      const MRp = await al(kok + 'diagnostics/macRapor') || {}; const MC = await al(kok + 'diagnostics/macCanli') || {};
      const g3 = Date.now() - 3 * 86400000, R = Object.values(MRp).filter(x => x && x.ts > g3).sort((a, b) => b.ts - a.ts).slice(0, 40);
      const cih = x => { const c = x.cihaz || {}; return (c.model || '?') + ' ' + (c.os || '') + ' ' + (c.apk ? 'APK(' + c.apk + ')' : (c.tarayici || '')) + ' ' + c.cekirdek + 'çek/' + c.bellekGB + 'GB ' + (c.ekran || []).join('x') + ' ' + c.hz + 'Hz ' + String(c.gpu || '').slice(0, 40); };
      const ozet = x => { const d = x.dilim || [], f = d.map(z => z[1]), k50 = d.reduce((n, z) => n + z[2], 0), k100 = d.reduce((n, z) => n + z[3], 0), en = Math.max(0, ...d.map(z => z[4]));
        const a = x.agBas || {}, b = x.agSon || {}, db = x.db || {}, o = x.oda;
        return [x.tur, x.sure_sn + 'sn', 'fps ' + (f.length ? Math.round(f.reduce((s, v) => s + v, 0) / f.length) + ' (en düşük ' + Math.min(...f) + ')' : '?'), 'takılma>50ms ' + k50 + ' >100ms ' + k100 + ' en uzun ' + en + 'ms',
          'ağ ' + (a.tur || '') + ' ' + (a.etkin || '?') + ' ' + (a.mbps || 0) + 'Mb ' + (a.rtt || 0) + 'ms→' + (b.etkin || '?') + ' (' + (x.agDegisim || 0) + ' değişim)',
          'db kopma ' + (db.kopma || 0) + ' / ' + Math.round((db.kopukMs || 0) / 1000) + 'sn' + (db.suAnKopuk ? ' (KOPUK)' : ''),
          o ? 'oda rtt ' + o.rttOrt + '/' + o.rttEn + 'ms paket arası en ' + o.paketAraEn + 'ms' : '', 'uzun görev ' + ((x.uzunGorev || {}).n || 0) + ' (' + ((x.uzunGorev || {}).ms || 0) + 'ms)',
          'yığın ' + ((x.yiginMB || {}).bas || 0) + '→' + ((x.yiginMB || {}).en || 0) + 'MB', x.pil ? 'pil ' + JSON.stringify(x.pil) : '', x.isi ? 'ISI ' + x.isi : '', 'pr ' + x.pr,
          (x.gizli || {}).n ? 'arka plan ' + x.gizli.n + '×/' + Math.round(x.gizli.ms / 1000) + 'sn' : '', (x.hata || {}).n ? 'HATA ' + x.hata.n : '', x.yarim ? 'YARIM' : ''].filter(Boolean).join(' | '); };
      console.log('-- MAÇ RAPORLARI (' + R.length + ', son 3 gün) --');
      R.forEach(x => { console.log(saat(x.ts), x.surum, cih(x)); console.log('     ' + ozet(x));
        if ((x.hata || {}).L && x.hata.L.length) console.log('     hatalar:', JSON.stringify(x.hata.L).slice(0, 600));
        const ol = (x.olay || []).filter(z => !/^(basla)$/.test(z[1])); if (ol.length) console.log('     olaylar:', ol.map(z => z[0] + 's ' + z[1] + (z[2] ? ':' + z[2] : '')).join(', ').slice(0, 700));
        const kot = (x.dilim || []).filter(z => z[1] < 40 || z[2] > 8); if (kot.length) console.log('     zayıf dilimler [sn,fps,>50,>100,enUzun,kalite,rtt,yığın]:', JSON.stringify(kot).slice(0, 500)); });
      const yarim = Object.entries(MC).filter(([k, x]) => x && !x.bitti && x.ts > g3);
      if (yarim.length) { console.log('-- BİTMEMİŞ MAÇLAR (çökme / kapatma olabilir) --'); yarim.forEach(([k, x]) => { console.log(saat(x.ts), x.surum, cih(x)); console.log('     ' + ozet(x)); }); }
    }
    console.log('son 12 saatte görülen cihaz:', cihaz.length); cihaz.slice(0, 10).forEach(x => console.log('  ', x.sahaSurum || x.surum || '', x.marka || '', x.model || '', String(x.ua || '').slice(0, 110)));
  }

  // (2026-11-06) APK kabuğundan gelen kayıtlar
  for(const kok of ['test/', '']){
    const L = Object.assign({}, await al(kok + 'diagnostics/logs', '?orderBy="$key"&limitToLast=1500') || {}, await al(kok + 'diagnostics/apk', '?orderBy="$key"&limitToLast=1500') || {});   // (2026-11-07) olağan APK olayları ayrı yerde
    const A = Object.values(L).filter(x => x && /SahaApp|; wv\)/.test(String(x.ua || '')) && x.ts > Date.now() - 24 * 3600e3).sort((a, b) => a.ts - b.ts);
    console.log('\n===== APK ' + (kok || 'KÖK') + ' kayıt: ' + A.length);
    A.slice(-150).forEach(x => console.log(saat(x.ts), x.app, x.mod, x.kind, x.title, String(x.detail || '').slice(0, 300), '|', String(x.ua || '').slice(-60)));
    const D = await al(kok + 'diagnostics/devices') || {};
    Object.values(D).filter(x => x && /SahaApp|; wv\)/.test(String(x.ua || ''))).forEach(x => console.log('CIHAZ', saat(x.sonGorulme || 0), x.sahaSurum || x.surum || '', String(x.ua || '').slice(-90)));
  }
  // (2026-11-07) Maç performans özetleri (saha_perf) ve SAHA'nın son 2 saatteki kasma/hata kayıtları
  for(const kok of ['test/', '']){
    const L = await al(kok + 'diagnostics/logs', '?orderBy="$key"&limitToLast=2500') || {};
    const P = Object.values(L).filter(x => x && x.mod === 'saha_perf').sort((a, b) => a.ts - b.ts);
    console.log('\n===== MAÇ PERFORMANS ' + (kok || 'KÖK') + ': ' + P.length);
    P.slice(-20).forEach(x => console.log(saat(x.ts), x.title, x.detail, '|', String(x.ua || '').slice(-80)));
    const U = Object.values(L).filter(x => x && x.mod === 'saha_perf_uzun').sort((a, b) => a.ts - b.ts);
    U.slice(-3).forEach(x => { console.log('-- UZUN KARELER ' + saat(x.ts) + ' [sn, aralık ms, js, çizim, yeni gölgelendirici, yeni geometri, yeni doku, gc MB, koşuyor, adım, tekrar]'); try{ const j = JSON.parse(x.detail); console.log('   sürüm', j.surum); (j.L || []).forEach(r => console.log('   ' + JSON.stringify(r))); }catch(e){ console.log(x.detail); } });
    const S = Object.values(L).filter(x => x && x.app === 'saha' && x.ts > Date.now() - 2 * 3600e3 && x.mod !== 'saha_perf').sort((a, b) => a.ts - b.ts);
    console.log('-- SAHA son 2 saat: ' + S.length);
    S.slice(-60).forEach(x => console.log(saat(x.ts), x.mod, x.kind, String(x.title || '').slice(0, 120), String(x.detail || '').slice(0, 220), '|', String(x.ua || '').slice(-50)));
  }
})().catch(e => { console.log('HATA ' + e.message); });
// 1793481479
