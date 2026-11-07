/* STADYUM SESİ (2026-11-06, kullanıcı: "taraftar sesi... ses çıktısı stadyum ortamına uygun olmalı"). saha.html ve ses-kayit.html ortak kullanır.
   ANONS: kayıt, tribün hoparlörü zincirinden geçer: dar bant (kornalı hoparlör), hafif doyma, çatıdan dönen gecikmeler, stat yankısı.
   TARAFTAR: tek telefondan alınan kayıt 6 ayrı "ses" olarak çalınır (her biri biraz farklı hız, gecikme ve yön), aynı stat yankısına girer;
   az kişiyle alınan kayıt kalabalık gibi duyulur. Anons başlayınca taraftar sesi kısılır, bitince geri gelir. */
var StadSes = (function(){
  var H = new WeakMap(), AB = {};
  function yankiTampon(c, sure){
    var n = Math.floor(c.sampleRate * sure), b = c.createBuffer(2, n, c.sampleRate);
    for(var k = 0; k < 2; k++){
      var d = b.getChannelData(k), son = 0;
      for(var i = 0; i < n; i++){
        var t = i / n, kes = 0.42 - 0.34 * t;                               // kuyruk ilerledikçe tizi kaybolur (uzak beton tribün)
        son += ((Math.random() * 2 - 1) - son) * kes;
        d[i] = son * Math.pow(1 - t, 2.6) * Math.min(1, i / (c.sampleRate * 0.012));
      }
      [0.043, 0.071, 0.118, 0.164].forEach(function(s, j){ var p = Math.floor((s + k * 0.009) * c.sampleRate); if(p < n) d[p] += (j % 2 ? -1 : 1) * (0.55 - j * 0.1); });
    }
    return b;
  }
  function doymaEgri(){ var n = 1024, e = new Float32Array(n); for(var i = 0; i < n; i++){ var x = i / (n - 1) * 2 - 1; e[i] = Math.tanh(x * 1.7) / Math.tanh(1.7); } return e; }
  function kur(c, cikis){
    var s = H.get(c);
    if(s){ if(s.cikis !== cikis){ try{ s.son.disconnect(); }catch(e){} s.son.connect(cikis); s.cikis = cikis; } return s; }
    s = { cikis:cikis, son:c.createGain() }; s.son.connect(cikis);
    var bg = function(tip, f, q, g){ var b = c.createBiquadFilter(); b.type = tip; b.frequency.value = f; if(q != null) b.Q.value = q; if(g != null) b.gain.value = g; return b; };
    var ka = function(v){ var g = c.createGain(); g.gain.value = v; return g; };
    s.yanki = c.createConvolver(); s.yanki.buffer = yankiTampon(c, 1.7);
    var yc = ka(0.9); s.yanki.connect(yc); yc.connect(s.son);
    // Hoparlör: 300-4200 Hz bant, 1,9 kHz'te anlaşılırlık tepesi, hafif doyma, sınırlayıcı.
    s.pa = ka(1);
    var a = bg('highpass', 300, 0.8), b = bg('peaking', 1900, 0.9, 6), d = bg('lowpass', 4200, 0.8), ws = c.createWaveShaper(), cmp = c.createDynamicsCompressor();
    ws.curve = doymaEgri(); cmp.threshold.value = -16; cmp.knee.value = 6; cmp.ratio.value = 6; cmp.attack.value = 0.004; cmp.release.value = 0.18;
    s.pa.connect(a); a.connect(b); b.connect(d); d.connect(ws); ws.connect(cmp);
    var kuru = ka(0.8); cmp.connect(kuru); kuru.connect(s.son);
    [[0.17, 0.34], [0.31, 0.22], [0.48, 0.12]].forEach(function(g){ var dl = c.createDelay(0.6), v = ka(g[1]); dl.delayTime.value = g[0]; cmp.connect(dl); dl.connect(v); v.connect(s.son); });
    var pg = ka(0.42); cmp.connect(pg); pg.connect(s.yanki);
    // Taraftar: tribünden gelen ses; bas ve tiz uzakta kaybolur.
    s.fan = ka(1); s.kis = ka(1);
    var fh = bg('highpass', 170, 0.7), fl = bg('lowpass', 3600, 0.7), fk = ka(0.62), fy = ka(0.55);
    s.fan.connect(s.kis); s.kis.connect(fh); fh.connect(fl); fl.connect(fk); fk.connect(s.son); fl.connect(fy); fy.connect(s.yanki);
    H.set(c, s); return s;
  }
  function kisma(c, s, kis){ try{ var t = c.currentTime, g = s.kis.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(kis ? 0.4 : 1, t + (kis ? 0.25 : 0.9)); }catch(e){} }
  // Kaydın başındaki/sonundaki sessizliği atar (ardışık parçalar arasında boşluk kalmasın).
  function kirp(b){
    var d = b.getChannelData(0), n = d.length, ad = Math.max(1, Math.floor(b.sampleRate * 0.01)), tepe = 0, i;
    for(i = 0; i < n; i += 8){ var v = Math.abs(d[i]); if(v > tepe) tepe = v; }
    var e = Math.max(0.012, tepe * 0.06), bas = 0, son = n - 1;
    while(bas < n && Math.abs(d[bas]) < e) bas += ad;
    while(son > bas && Math.abs(d[son]) < e) son -= ad;
    var p = b.sampleRate * 0.04, b0 = Math.max(0, bas - p) / b.sampleRate, b1 = Math.min(n, son + p * 2) / b.sampleRate;
    return { bas:b0, sure:Math.max(0.05, b1 - b0) };
  }
  // Ortalama güce göre seviye: sessiz alınan kayıt yükseltilir, bağırış patlamaz.
  function olcek(b, hedef){
    var d = b.getChannelData(0), t = 0, n = 0;
    for(var i = 0; i < d.length; i += 64){ t += d[i] * d[i]; n++; }
    var r = Math.sqrt(t / Math.max(1, n)) || 0.05;
    return Math.max(0.3, Math.min(5, hedef / r));
  }
  function indir(url){
    if(!AB[url]){ AB[url] = fetch(url).then(function(r){ if(!r.ok) throw new Error('ses indirilemedi'); return r.arrayBuffer(); }); AB[url].catch(function(){ delete AB[url]; }); }
    return AB[url];
  }
  function coz(c, ab){ return new Promise(function(ok, no){ try{ var p = c.decodeAudioData(ab.slice(0), ok, no); if(p && p.catch) p.catch(no); }catch(e){ no(e); } }); }
  function tampon(c, url){ return indir(url).then(function(ab){ return coz(c, ab); }); }
  // Taraftar kaydını kalabalık olarak çalar. Dönen nesne: { bitis, dur(sn) }
  function kalabalik(c, b, cikis, o){
    o = o || {}; var s = kur(c, cikis), g = c.createGain(), t = c.currentTime + 0.05, kaynak = [], N = 6, sv = (o.ses == null ? 0.5 : o.ses) * olcek(b, 0.16) / Math.sqrt(N), uz = 0;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(sv, t + 0.8); g.connect(s.fan);
    for(var i = 0; i < N; i++){
      var k = c.createBufferSource(), oran = 1 + (i - (N - 1) / 2) * 0.0042 + (Math.random() - 0.5) * 0.002, gec = i === 0 ? 0 : 0.012 + Math.random() * 0.085;
      k.buffer = b; k.playbackRate.value = oran;
      if(c.createStereoPanner){ var p = c.createStereoPanner(); p.pan.value = (i / (N - 1) * 2 - 1) * 0.85; k.connect(p); p.connect(g); } else k.connect(g);
      k.start(t + gec); kaynak.push(k); uz = Math.max(uz, b.duration / oran + gec);
    }
    return { bitis:t + uz, dur:function(sn){ sn = sn == null ? 1.5 : sn; try{ var n = c.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(g.gain.value, n); g.gain.linearRampToValueAtTime(0, n + sn);
      kaynak.forEach(function(k){ try{ k.stop(n + sn + 0.05); }catch(e){} }); }catch(e){} } };
  }
  // Anons parçalarını arka arkaya hoparlörden okur.
  function dizi(c, urls, cikis, ses){
    var s = kur(c, cikis);
    return Promise.all(urls.map(function(u){ return tampon(c, u).catch(function(){ return null; }); })).then(function(L){
      L = L.filter(Boolean); if(!L.length) return;
      kisma(c, s, true);
      var g = c.createGain(), t = c.currentTime + 0.06; g.gain.value = ses == null ? 1 : ses; g.connect(s.pa);
      L.forEach(function(b){ var k = c.createBufferSource(), r = kirp(b), n = c.createGain(); n.gain.value = olcek(b, 0.17); k.buffer = b; k.connect(n); n.connect(g); k.start(t, r.bas, r.sure); t += r.sure + 0.14; });
      return new Promise(function(ok){ setTimeout(function(){ kisma(c, s, false); ok(); }, Math.max(0, (t - c.currentTime)) * 1000); });
    });
  }
  return { paGiris:function(c, cikis){ return kur(c, cikis).pa; }, kalabalik:kalabalik, dizi:dizi, kirp:kirp, tampon:tampon, indir:indir, coz:coz, olcek:olcek,
    kis:function(c, cikis, v){ kisma(c, kur(c, cikis), v); } };
})();
