/* SAHA DOĞAL SES İŞÇİSİ (2026-10-31-A)
   Piper (açık kaynak sinir ağı ses sentezi, MIT) ile Türkçe metni insan sesine yakın bir sese çevirir. Oyunu dondurmamak için
   ayrı bir iş parçacığında (Web Worker) çalışır. Metin → espeak-ng ile ses birimleri (piper_phonemize, GPL-3) → onnxruntime-web
   ile ses modeli (tr_TR, Rhasspy Piper sesleri) → 22.050 Hz ses örnekleri. Dosyalar bir kez indirilir, tarayıcı önbelleğinde
   ('saha-ses-v1') saklanır; sonraki açılışlarda ağdan çekilmez.
   Mesajlar: {tip:'yukle', ses} → {tip:'ilerleme', yuzde} … {tip:'hazir', ses}
             {tip:'soyle', id, metin, ses, hiz} → {tip:'ses', id, pcm(Float32Array), hz} | {tip:'hata', id, mesaj} */
var KOK = self.location.href.replace(/[^/]*$/, '');
var ONBELLEK = 'saha-ses-v1';
importScripts(KOK + 'ort.wasm.min.js', KOK + 'piper_phonemize.js');
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = KOK;
var VERI = null, WASM = null, MODEL = {}, BEKLE = {};
function al(ad, ilerle){
  var url = KOK + ad;
  return caches.open(ONBELLEK).then(function(c){
    return c.match(url).then(function(r){
      if(r) return r.arrayBuffer();
      return fetch(url).then(function(r2){
        if(!r2.ok) throw new Error(ad + ' indirilemedi (HTTP ' + r2.status + ')');
        var top = Number(r2.headers.get('content-length')) || 0;
        if(!r2.body || !ilerle || !top) return r2.arrayBuffer().then(function(b){ c.put(url, new Response(b)).catch(function(){}); return b; });
        var okuyucu = r2.body.getReader(), parcalar = [], alinan = 0;
        var oku = function(){ return okuyucu.read().then(function(x){
          if(x.done){ var b = new Uint8Array(alinan), o = 0; parcalar.forEach(function(p){ b.set(p, o); o += p.length; });
            c.put(url, new Response(b.buffer)).catch(function(){}); return b.buffer; }
          parcalar.push(x.value); alinan += x.value.length; ilerle(alinan, top); return oku(); }); };
        return oku();
      });
    });
  }).catch(function(e){ if(e && /indirilemedi/.test(e.message)) throw e; return fetch(url).then(function(r){ if(!r.ok) throw new Error(ad + ' indirilemedi'); return r.arrayBuffer(); }); });
}
function yukle(ses){
  if(BEKLE[ses]) return BEKLE[ses];
  var dosyalar = [['piper_phonemize.data', 18.1], ['piper_phonemize.wasm', 0.6], ['tr_TR-' + ses + '-medium.int8.onnx', 18.7]];
  var toplamMb = dosyalar.reduce(function(t, d){ return t + d[1]; }, 0), bitenMb = 0;
  var ilerle = function(mb){ return function(a, t){ self.postMessage({ tip:'ilerleme', ses:ses, yuzde:Math.min(99, Math.round((bitenMb + mb * a / t) / toplamMb * 100)) }); }; };
  BEKLE[ses] = (VERI ? Promise.resolve(VERI) : al(dosyalar[0][0], ilerle(dosyalar[0][1])).then(function(b){ VERI = b; bitenMb += dosyalar[0][1]; return b; }))
    .then(function(){ return WASM ? WASM : al(dosyalar[1][0]).then(function(b){ WASM = b; bitenMb += dosyalar[1][1]; return b; }); })
    .then(function(){ return fetch(KOK + 'tr_TR-' + ses + '-medium.onnx.json').then(function(r){ return r.json(); }); })
    .then(function(cfg){ return al(dosyalar[2][0], ilerle(dosyalar[2][1])).then(function(b){
      return ort.InferenceSession.create(b, { executionProviders:['wasm'] }).then(function(s){ MODEL[ses] = { cfg:cfg, s:s }; return MODEL[ses]; }); }); })
    .catch(function(e){ BEKLE[ses] = null; throw e; });
  return BEKLE[ses];
}
function fonem(metin, dil){
  return new Promise(function(coz, red){
    var bitti = false;
    createPiperPhonemize({
      print:function(d){ if(bitti) return; try{ var j = JSON.parse(d); bitti = true; coz(j.phoneme_ids); }catch(e){} },
      printErr:function(){},
      wasmBinary:WASM,
      getPreloadedPackage:function(){ return VERI; },
      locateFile:function(u){ return KOK + u; }
    }).then(function(m){
      try{ m.callMain(['-l', dil, '--input', JSON.stringify([{ text:metin }]), '--espeak_data', '/espeak-ng-data']); }catch(e){ if(!bitti){ bitti = true; red(e); } }
      setTimeout(function(){ if(!bitti){ bitti = true; red(new Error('ses birimleri çıkarılamadı')); } }, 8000);
    }, function(e){ if(!bitti){ bitti = true; red(e); } });
  });
}
var SIRA = Promise.resolve();
function soyle(v){
  return yukle(v.ses).then(function(M){
    var cfg = M.cfg, inf = cfg.inference || {};
    return fonem(String(v.metin).slice(0, 400), (cfg.espeak && cfg.espeak.voice) || 'tr').then(function(ids){
      var feeds = {
        input: new ort.Tensor('int64', BigInt64Array.from(ids.map(function(x){ return BigInt(x); })), [1, ids.length]),
        input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)])),
        scales: new ort.Tensor('float32', Float32Array.from([inf.noise_scale || 0.667, (inf.length_scale || 1) / (v.hiz || 1), inf.noise_w || 0.8]))
      };
      if(cfg.speaker_id_map && Object.keys(cfg.speaker_id_map).length) feeds.sid = new ort.Tensor('int64', BigInt64Array.from([0n]));
      return M.s.run(feeds).then(function(o){ return { pcm:o.output.data, hz:(cfg.audio && cfg.audio.sample_rate) || 22050 }; });
    });
  });
}
self.onmessage = function(e){
  var v = e.data || {};
  if(v.tip === 'yukle'){ yukle(v.ses).then(function(){ self.postMessage({ tip:'hazir', ses:v.ses }); }, function(err){ self.postMessage({ tip:'hata', ses:v.ses, mesaj:String((err && err.message) || err) }); }); return; }
  if(v.tip === 'soyle'){
    SIRA = SIRA.then(function(){ return soyle(v).then(function(r){ var p = new Float32Array(r.pcm); self.postMessage({ tip:'ses', id:v.id, pcm:p, hz:r.hz }, [p.buffer]); },
      function(err){ self.postMessage({ tip:'hata', id:v.id, mesaj:String((err && err.message) || err) }); }); });
  }
};
