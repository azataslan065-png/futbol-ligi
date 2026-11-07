// Gömülü YouTube oynatıcısında reklam ayıklayıcının (android Reklam.java ile aynı mantık) etkisini ölçer.
const { chromium } = require('playwright');
const fs = require('fs');
const src = fs.readFileSync(process.env.GITHUB_WORKSPACE + '/android/app/src/main/java/com/azat/saha/Reklam.java', 'utf8');
const betik = [...src.match(/BETIK = ([\s\S]*?);\n\n/)[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1].replace(/\\"/g, '"')).join('');
const SUNUCU = ['doubleclick.net','googlesyndication.com','googleadservices.com','imasdk.googleapis.com','adservice.google.com','googletagservices.com','ads.youtube.com'];
const YOL = ['/pagead/','/api/stats/ads','/ptracking','/get_midroll_info','/youtubei/v1/player/ad_break','/pcs/activeview'];
const VID = ['dQw4w9WgXcQ','kJQP7kiw5Fk','JGwWNGJdvx8','RgKAFK5djSk'];
async function dene(filtre, vid){
  const b = await chromium.launch({ args:['--autoplay-policy=no-user-gesture-required'] });
  const c = await b.newContext({ userAgent:'Mozilla/5.0 (Linux; Android 14; SM-S721B Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/158.0.0.0 Mobile Safari/537.36', viewport:{width:412,height:860}, isMobile:true, hasTouch:true });
  let reklamIstek = 0, engel = 0, enjekte = 0;
  await c.route('**/*', async r => {
    const u = new URL(r.request().url()), h = u.hostname;
    const reklam = SUNUCU.some(s => h === s || h.endsWith('.' + s)) || (/youtube/.test(h) && YOL.some(y => u.pathname.startsWith(y)));
    if (reklam) reklamIstek++;
    if (filtre && reklam){ engel++; return r.fulfill({ status:204, body:'' }); }
    if (filtre && /youtube(-nocookie)?\.com$/.test(h) && u.pathname.startsWith('/embed/') && r.request().resourceType() === 'document'){
      const y = await r.fetch(); let html = await y.text(); const hd = { ...y.headers() };
      Object.keys(hd).forEach(k => { if (/^content-security-policy/i.test(k) || /^content-length$/i.test(k) || /^content-encoding$/i.test(k)) delete hd[k]; });
      const i = html.search(/<head[ >]/); if (i >= 0){ const j = html.indexOf('>', i) + 1; html = html.slice(0, j) + betik + html.slice(j); } else html = betik + html;
      enjekte++; return r.fulfill({ status:y.status(), headers:hd, body:html });
    }
    return r.continue();
  });
  const p = await c.newPage();
  await p.goto('https://azataslan065-png.github.io/futbol-ligi/test/surum.json');
  await p.setContent(`<iframe id=f width=400 height=225 src="https://www.youtube.com/embed/${vid}?autoplay=1&playsinline=1&mute=1&enablejsapi=1&controls=0&rel=0" allow="autoplay;encrypted-media"></iframe>`);
  let reklamGoruldu = false, oynadi = false, sonDurum = '';
  for (let s = 0; s < 40; s++){
    await p.waitForTimeout(1000);
    const f = p.frames().find(x => /\/embed\//.test(x.url()));
    if (!f) continue;
    try{
      const d = await f.evaluate(() => { const m = document.querySelector('#movie_player'), v = document.querySelector('video');
        return { ad: !!(m && (m.classList.contains('ad-showing') || m.classList.contains('ad-interrupting'))), t: v ? v.currentTime : -1, hata: (document.querySelector('.ytp-error') || {}).innerText || '' }; });
      if (d.ad) reklamGoruldu = true; if (d.t > 2 && !d.ad) oynadi = true; sonDurum = JSON.stringify(d);
      if (s === 3 && !d.ad && d.t < 0.1) await f.click('body').catch(()=>{});
    }catch(e){ sonDurum = 'hata ' + e.message.slice(0, 80); }
  }
  console.log(`${filtre ? 'FİLTRE AÇIK ' : 'FİLTRE YOK  '} ${vid} reklamGöründü=${reklamGoruldu} videoOynadı=${oynadi} reklamİsteği=${reklamIstek} engellenen=${engel} enjekte=${enjekte} son=${sonDurum}`);
  await b.close();
}
(async () => { for (const v of VID){ await dene(false, v); await dene(true, v); } })().catch(e => console.log('HATA', e));
