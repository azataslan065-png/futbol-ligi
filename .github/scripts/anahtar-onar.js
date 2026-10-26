// Hizmet hesabi anahtarini dogrular/onarir (bkz. firebase-kurallar.yml). Anahtarin kendisi ASLA yazdirilmaz.
const fs=require("fs"); let t=fs.readFileSync(process.argv[2],"utf8"), j, onarildi=false;
// ONARIM: Telefonda metin uygulamasindan kopyalarken uzun satirlar (ozellikle private_key) gercek satir sonlariyla
// bolunebiliyor; JSON metin icinde satir sonu kabul etmez. Once oldugu gibi denenir, olmazsa satir sonlari temizlenir
// ve ozel anahtar PEM bicimine (64 karakterlik satirlar) yeniden kurulur.
try{ JSON.parse(t); }catch(e0){
  const ham=t, govde=(ham.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/)||[])[1];
  let duz=ham.replace(/\r\n|\r|\n/g,"");
  if(govde!=null){
    const b64=govde.replace(/\\n/g,"").replace(/[^A-Za-z0-9+\/=]/g,"");
    const pem="-----BEGIN PRIVATE KEY-----\\n"+b64.match(/.{1,64}/g).join("\\n")+"\\n-----END PRIVATE KEY-----\\n";
    duz=duz.replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----(\\n)*/,pem);
  }
  try{ JSON.parse(duz); t=duz; onarildi=true; }catch(e1){}
}
try{ j=JSON.parse(t); }catch(e){
  const m=String(e.message).match(/position (\d+)/), p=m?+m[1]:-1;
  const tur=c=>{ if(c==null) return "yok"; const k=c.charCodeAt(0); return k<32?"kontrol("+k+")":k>126?"ozel(U+"+k.toString(16)+")":(/[A-Za-z0-9+\/=]/.test(c)?"harf/rakam":"isaret("+k+")"); };
  const satir=p>=0?t.slice(0,p).split("\n").length:-1;
  const ozel=[...t].filter(c=>c.charCodeAt(0)>126).length, kontrol=[...t].filter(c=>{const k=c.charCodeAt(0);return k<32&&k!==10&&k!==13;}).length;
  console.log("::error::Anahtar gecerli JSON degil | uzunluk "+t.length+" | satir "+t.split("\n").length+" | hata konumu "+p+" (satir "+satir+") | o noktadaki karakter: "+tur(t[p])+" | onceki: "+tur(t[p-1])+" | ASCII disi karakter sayisi "+ozel+" | kontrol karakteri "+kontrol+" | mesaj: "+String(e.message).replace(/["{}]/g,"").slice(0,120));
  process.exit(1); }
const pk=String(j.private_key||"");
const sorun=[]; if(j.type!=="service_account") sorun.push("type service_account degil"); if(j.project_id!=="superlig-208e3") sorun.push("project_id farkli: "+j.project_id);
if(!/BEGIN PRIVATE KEY/.test(pk)||!/END PRIVATE KEY/.test(pk)) sorun.push("private_key eksik/bozuk (uzunluk "+pk.length+")"); if(!j.client_email) sorun.push("client_email yok");
console.log((sorun.length?"::error::Anahtar bicimi hatali: "+sorun.join("; "):"::notice::Anahtar bicimi gecerli"+(onarildi?" (kopyalamada eklenen satir sonlari onarildi)":""))+" | anahtar "+String(j.private_key_id||"").slice(0,8));
if(sorun.length) process.exit(1);
fs.writeFileSync(process.argv[2], JSON.stringify(j));
fs.writeFileSync(process.env.RUNNER_TEMP+"/sa_temiz", JSON.stringify(j));
