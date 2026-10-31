const { chromium } = require('playwright');
const KOK = 'https://azataslan065-png.github.io/futbol-ligi/test/';
(async () => {
  const br = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await br.newPage({ viewport: { width: 412, height: 860 } });
  const log = []; p.on('console', m => { if(m.type() === 'error' || m.type() === 'warning') log.push(m.type() + ': ' + m.text().slice(0, 220)); });
  p.on('pageerror', e => log.push('pageerror: ' + e.message));
  p.on('requestfailed', r => log.push('istek başarısız: ' + r.url().slice(0, 120) + ' ' + (r.failure() || {}).errorText));
  p.on('response', r => { if(/ortak\/ses\//.test(r.url())) log.push('yanıt ' + r.status() + ' ' + (r.headers()['content-type'] || '') + ' ' + (r.headers()['content-length'] || '?') + ' ' + r.url().split('/ses/')[1]); });
  await p.goto(KOK + 'saha.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(6000);
  const r = await p.evaluate(async () => {
    const o = { build: window.APP_BUILD, destek: SahaSes.destek() };
    const t0 = performance.now();
    try{ await SahaSes.hazirla('spiker'); o.hazirlaMs = Math.round(performance.now() - t0); }catch(e){ o.hazirlaHata = String(e && e.message); }
    try{ const a = performance.now(); const b = await SahaSes.tampon('Gol! Demir uzak köşeye vurdu!', 'spiker'); o.uretMs = Math.round(performance.now() - a); o.sure = b.duration; }catch(e){ o.uretHata = String(e && e.message); }
    o.sesHata = SahaSes.hata();
    o.muzikListe = (window.SAHA_SES && SAHA_SES.liste || []).length; o.muzikUrl = (SAHA_SES.liste || []).slice(0, 2).map(x => x.url);
    o.fbHazir = !!window.fbHazir || (typeof fbHazir !== 'undefined' && fbHazir);
    return o;
  });
  console.log(JSON.stringify(r, null, 1));
  // müzik dosyası erişimi
  for(const u of (r.muzikUrl || [])){ try{ const x = await p.evaluate(async (u) => { const t = performance.now(); const z = await fetch(u, { method: 'GET', headers: { Range: 'bytes=0-65535' } }); return z.status + ' ' + (z.headers.get('content-type') || '') + ' ' + Math.round(performance.now() - t) + 'ms'; }, u); console.log('müzik', u.slice(0, 90), x); }catch(e){ console.log('müzik hata', e.message); } }
  console.log('GÜNLÜK\n' + log.slice(0, 60).join('\n'));
  await p.screenshot({ path: 'saha.png' });
  await br.close();
})().catch(e => { console.log('KOŞU HATASI ' + e.message); process.exit(0); });
