/* SAHA FUTBOLCU SİSTEMİ (2026-11-06): admin editörü ve oyun AYNI kodu kullanır. Görünüm ayarları oyuncuHavuzu/{id}/gorunum
   altında yalnızca varsayılandan farklı değerler olarak durur. Vücut ve yüz değişimi tek bir uzay deformasyonudur: ten, forma,
   şort, krampon, saç ve kemikler aynı alandan geçtiği için katmanlar birbirinden ayrılmaz. */
(function(){'use strict';
function _cekirdek(){
const cl=(a,b,x)=>x<a?a:x>b?b:x,sst=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t)},bump=(a,b,c,d,x)=>x<=a||x>=d?0:x<b?sst(a,b,x):x>c?1-sst(c,d,x):1;
const G=(dx,dy,dz,sx,sy,sz)=>Math.exp(-(dx*dx/(sx*sx)+dy*dy/(sy*sy)+dz*dz/(sz*sz)));
function deform(p,x,y,z,o){
 const ax=x<0?-x:x,s=x<0?-1:1;let dx=0,dy=0,dz=0,w;
 if(y>1.42&&ax<.2){const hy=y-1.66,hz=z;
  if(hz>-.05||hy<0){
  w=G(ax-.055,hy+.065,hz-.02,.05,.03,.07);dx+=s*w*.014*p.jawW;
  w=G(ax-.052,hy+.058,hz+.015,.03,.03,.04);dy+=-w*.012*p.jawH;
  w=G(ax,hy+.10,hz-.07,.05,.028,.05);dy-=w*.013*p.chinL;dz+=w*.012*p.chinF;dx+=x*w*.4*p.chinW;
  w=G(ax-.05,hy+.012,hz-.058,.028,.026,.03);dx+=s*w*.007*p.cheek;dz+=w*.005*p.cheek;
  w=G(ax-.052,hy+.04,hz-.04,.03,.03,.035);dx+=s*w*.009*p.cheekF;
  w=G(ax-.035,hy-.034,hz-.085,.045,.016,.03);dz+=w*.006*p.brow;
  w=G(ax,hy+.012,hz-.105,.024,.036,.03);dy-=w*.007*p.noseL;
  w=G(ax,hy+.03,hz-.11,.02,.016,.022);dy-=w*.006*p.noseL;dy+=w*.005*p.noseT;dz+=w*.010*p.noseZ;
  w=G(ax-.01,hy+.033,hz-.10,.018,.012,.02);dx+=x*w*.55*p.noseW;
  w=G(ax,hy-.0,hz-.095,.014,.03,.02);dz+=w*.007*p.noseB;
  const ex=ax-.0312,ey=hy-.009,ez=hz-.08,we=G(ex,ey,ez,.020,.014,.018);
  dx+=s*we*.005*p.eyeD;dy+=we*.005*p.eyeY;dz+=we*.0045*p.eyeZ;dx+=s*ex*we*.32*p.eyeS;dy+=ey*we*.32*p.eyeS;dy+=ex*we*.22*p.eyeA;
  w=G(ax-.018,hy+.06,hz-.095,.026,.015,.022);dx+=x*w*.42*p.mouthW;
  w=G(ax,hy+.0605,hz-.10,.032,.0095,.016);dy+=(hy+.0605)*w*.8*p.lipT;dz+=w*.0035*p.lipT;
  w=G(ax,hy+.06,hz-.09,.042,.018,.03);dy+=w*.006*p.mouthY;dz+=w*.006*p.mouthZ;}
  const ew=G(ax-.086,hy,hz+.02,.022,.042,.032);if(ew>.01){dx+=s*ew*.010*p.earO+(ax-.078)*s*ew*.35*p.earS;dy+=hy*ew*.35*p.earS;dz+=(hz+.02)*ew*.35*p.earS}
  w=sst(.02,.09,hy);dy+=w*.012*p.foreH;
  const hw=sst(1.52,1.60,y);dx+=x*hw*.09*p.headW;dz+=z*hw*.10*p.headD;dy+=sst(1.54,1.62,y)*(y-1.60)*.11*p.headH;
  const hs=sst(1.50,1.57,y)*.10*p.headS;dx+=x*hs;dy+=(y-1.56)*hs;dz+=z*hs;
  w=bump(1.44,1.49,1.545,1.60,y)*(1-sst(.09,.13,ax));dx+=x*w*.20*p.neckT;dz+=(z+.02)*w*.20*p.neckT;
 }
 if(ax>.66&&y>1.3){const q=1+sst(.665,.69,ax)*.16*p.handS;dx+=s*(ax-.681)*(q-1);dy+=(y-1.42)*(q-1);dz+=(z+.04)*(q-1)}
 if(y>1.25&&ax>.19){let u=bump(.20,.26,.40,.47,ax)*.28*p.armU;dy+=(y-1.42)*u;dz+=(z+.03)*u;u=bump(.45,.50,.60,.68,ax)*.28*p.armF;dy+=(y-1.42)*u;dz+=(z+.04)*u}
 if(y>.8&&y<1.5&&ax<.33){const am=1-sst(.20,.26,ax);
  w=bump(1.14,1.28,1.36,1.46,y)*am;dx+=x*w*.13*p.chest;dz+=z*w*.17*p.chest;
  w=bump(.96,1.08,1.14,1.26,y)*am;dx+=x*w*.17*p.waist;dz+=(z-.02)*w*.15*p.waist;if(z>0)dz+=z*w*.45*Math.max(0,p.belly)+z*w*.25*Math.min(0,p.belly);
  w=bump(.80,.90,.97,1.05,y)*am;dx+=x*w*.13*p.hips;dz+=z*w*.08*p.hips;
  w=bump(.76,.86,.95,1.02,y)*sst(.02,-.05,z);dz+=z*w*.5*p.glute;
 }
 if(y<.92&&ax<.3){const cx=y>.519?.125-.0955*(y-.519):.125+.0525*(.519-y),cz=y>.519?-.002+.059*(y-.519):-.002-.085*(.519-y),rx=ax-cx,rz=z-cz;
  let u=bump(.50,.60,.80,.90,y)*.24*p.thigh;dx+=s*rx*u;dz+=rz*u;u=bump(.13,.28,.44,.53,y)*.24*p.calf;dx+=s*rx*u;dz+=rz*u;
  if(y<.15){const k=(1-sst(.105,.15,y))*.16*p.footS;dx+=s*(ax-.15)*k;dz+=(z+.03)*k;dy+=y*k*.6}
 }
 const sh=sst(1.26,1.36,y)*sst(.07,.20,ax)*.032*p.shoulder;dx+=s*sh;
 let nx=x+dx,ny=y+dy,nz=z+dz;
 if(ax>.2&&y>1.28){const a=(cl(.2,.68,ax)-.2)*.13*p.armL;nx+=s*a}
 const L=(cl(.13,.875,y)-.13)*.11*p.legL,T=(cl(.95,1.44,y)-.95)*.10*p.torsoL,N=(cl(1.46,1.56,y)-1.46)*.45*p.neckL;ny+=L+T+N;
 o[0]=nx;o[1]=ny;o[2]=nz;
}

var EPS=.004;
function ag(p,p0,n0,po,no,nor){var o=[0,0,0],a=[0,0,0],b=[0,0,0];for(var i=0,n=p0.length/3;i<n;i++){var j=i*3,x=p0[j],y=p0[j+1],z=p0[j+2];deform(p,x,y,z,o);po[j]=o[0];po[j+1]=o[1];po[j+2]=o[2];
 if(nor){var nx=n0[j],ny=n0[j+1],nz=n0[j+2],tx=ny-nz*.3,ty=-nx+nz*.2,tz=nx*.3-ny*.2,l=Math.hypot(tx,ty,tz)||1;tx/=l;ty/=l;tz/=l;var bx=ny*tz-nz*ty,by=nz*tx-nx*tz,bz=nx*ty-ny*tx;deform(p,x+tx*EPS,y+ty*EPS,z+tz*EPS,a);deform(p,x+bx*EPS,y+by*EPS,z+bz*EPS,b);var ax=a[0]-o[0],ay=a[1]-o[1],az=a[2]-o[2],qx=b[0]-o[0],qy=b[1]-o[1],qz=b[2]-o[2],cx=ay*qz-az*qy,cy=az*qx-ax*qz,cz=ax*qy-ay*qx;if(cx*nx+cy*ny+cz*nz<0){cx=-cx;cy=-cy;cz=-cz}l=Math.hypot(cx,cy,cz)||1;no[j]=cx/l;no[j+1]=cy/l;no[j+2]=cz/l}}}
/* saç kartları: kök sabit, boy ve hacim; sonuç baş kemiği yerel uzayında */
function kart(p,p0,st,L,Vv,Ri,hx,hy,hz,po){var o=[0,0,0],off=0;for(var s=0;s<st.length;s++){var cnt=st[s][0],w=st[s][1];for(var i=off;i<off+cnt;i+=w){var rx=(p0[i*3]+p0[i*3+3])/2,ry=(p0[i*3+1]+p0[i*3+4])/2,rz=(p0[i*3+2]+p0[i*3+5])/2;
 for(var j=i;j<i+w;j++){var q=j*3,x=rx+(p0[q]-rx)*L,y=ry+(p0[q+1]-ry)*L,z=rz+(p0[q+2]-rz)*L;if(Vv!==1){var v=Vv-1;x+=x*v*.14;y+=(y-1.68)*v*.24;z+=(z+.01)*v*.14}deform(p,x,y,z,o);var dx=o[0]-hx,dy=o[1]-hy,dz=o[2]-hz;po[q]=Ri[0]*dx+Ri[1]*dy+Ri[2]*dz;po[q+1]=Ri[3]*dx+Ri[4]*dy+Ri[5]*dz;po[q+2]=Ri[6]*dx+Ri[7]*dy+Ri[8]*dz}}off+=cnt}}
/* ten dokusu: taban × ten rengi, varsa yüz fotoğrafı, sonra sakal/saç/kaş maskeleri */
function ten(p,sak,W,base,m1,m2,har,fo,D){function h(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
 var R=h(p.ten),H=h(p.sac),d=p.beardD,bd=p.browD,sd=p.scalp,tr=R[0]/201,tg=R[1]/155,tb=R[2]/120,n=W*W*4,yg=p.yuzG==null?1:p.yuzG,fw=fo?fo.w:0,fh=fo?fo.h:0,fd=fo?fo.d:null,i;
 for(i=0;i<n;i+=4){var a=base[i]*tr,g=base[i+1]*tg,b=base[i+2]*tb;
  if(fd){var w0=har[i+2]/255*yg;if(w0>.01){if(w0>1)w0=1;var fx=(har[i]/255*.2-.1+.075)/.15,fy=(.065-(har[i+1]/255*.24-.14))/.19;if(fx>=0&&fx<1&&fy>=0&&fy<1){var k=((fy*fh|0)*fw+(fx*fw|0))*4,L=(base[i]*.3+base[i+1]*.59+base[i+2]*.11)/164,sh=L<.6?.6:L>1.05?1.05:L;a+=(fd[k]*sh-a)*w0;g+=(fd[k+1]*sh-g)*w0;b+=(fd[k+2]*sh-b)*w0}}}
  var be=(m1[i]*sak[1]+m1[i+1]*sak[2]+m1[i+2]*sak[3])*d/255;if(be>.004){var k1=be>1?1:be;a+=(H[0]*.8-a)*k1;g+=(H[1]*.8-g)*k1;b+=(H[2]*.8-b)*k1}
  var f=m2[i+1]*sd/255;if(f>.004){var k2=f>1?1:f;a+=(H[0]*.85-a)*k2;g+=(H[1]*.85-g)*k2;b+=(H[2]*.85-b)*k2}
  var br=m2[i]*bd/255;if(br>.004){var k3=br>1?1:br;a+=(H[0]*.7-a)*k3;g+=(H[1]*.7-g)*k3;b+=(H[2]*.7-b)*k3}
  D[i]=a;D[i+1]=g;D[i+2]=b;D[i+3]=255}}
return{deform:deform,ag:ag,kart:kart,ten:ten,sst:sst,cl:cl}}
var C=_cekirdek();
const S=(k,l,g,min=-1,max=1,d=0,st=.02,bi='')=>({k,l,g,min,max,d,st,bi});
const AYAR={
Yüz:[S('headS','Baş boyutu','Baş'),S('headW','Baş genişliği','Baş'),S('headH','Baş uzunluğu','Baş'),S('headD','Baş derinliği','Baş'),S('foreH','Alın yüksekliği','Baş'),S('brow','Kaş kemiği','Baş'),
S('jawW','Çene genişliği','Çene ve yanak'),S('jawH','Çene köşesi','Çene ve yanak'),S('chinL','Çene ucu boyu','Çene ve yanak'),S('chinF','Çene ucu öne','Çene ve yanak'),S('chinW','Çene ucu eni','Çene ve yanak'),S('cheek','Elmacık','Çene ve yanak'),S('cheekF','Yanak dolgunluğu','Çene ve yanak'),
S('noseL','Burun boyu','Burun'),S('noseW','Burun genişliği','Burun'),S('noseZ','Burun çıkıntısı','Burun'),S('noseT','Burun ucu','Burun'),S('noseB','Burun köprüsü','Burun'),
S('eyeD','Göz arası','Gözler'),S('eyeS','Göz büyüklüğü','Gözler'),S('eyeY','Göz yüksekliği','Gözler'),S('eyeZ','Göz derinliği','Gözler'),S('eyeA','Göz eğimi','Gözler'),
S('mouthW','Ağız genişliği','Ağız'),S('lipT','Dudak kalınlığı','Ağız'),S('mouthY','Ağız yüksekliği','Ağız'),S('mouthZ','Ağız çıkıntısı','Ağız'),
S('earS','Kulak boyutu','Kulaklar'),S('earO','Kulak açıklığı','Kulaklar')],
Saç:[S('hairL','Saç boyu','Saç',.4,1.8,1),S('hairV','Saç hacmi','Saç',.6,1.6,1),S('scalp','Yan solma','Saç',0,1,.95),S('browD','Kaş yoğunluğu','Kaşlar',0,1.4,1)],
Sakal:[S('beardD','Yoğunluk','Sakal',0,1.4,.75),S('beardL','Uzunluk','Sakal',0,4,0)],
Vücut:[S('boy','Boy','Genel',160,205,182,1,'cm'),
S('shoulder','Omuz genişliği','Üst gövde'),S('chest','Göğüs','Üst gövde'),S('waist','Bel','Üst gövde'),S('belly','Karın','Üst gövde'),S('hips','Kalça','Üst gövde'),S('glute','Popo','Üst gövde'),S('torsoL','Gövde boyu','Üst gövde'),
S('neckT','Boyun kalınlığı','Boyun'),S('neckL','Boyun boyu','Boyun'),
S('armL','Kol boyu','Kollar'),S('armU','Üst kol','Kollar'),S('armF','Ön kol','Kollar'),S('handS','El boyutu','Kollar'),
S('legL','Bacak boyu','Bacaklar'),S('thigh','Uyluk','Bacaklar'),S('calf','Baldır','Bacaklar'),S('footS','Ayak boyutu','Bacaklar')]};
const VAR={saçStil:'kisa',sakal:'kisa',ten:'#c99b78',sac:'#2a1d16',goz:'#4a2c17',forma:'#b30d15',sort:'#eaeaea',tozluk:'#b30d15',krampon:'#d3360c',klip:'Atak_Bekleme'};
const SACLAR=[['kazima','Kazıma'],['kisa','Kısa'],['daginik','Dağınık'],['yukari','Yukarı taralı'],['yana','Yana taralı'],['kivircik','Kıvırcık'],['uzun','Uzun']];
const SAKALLAR={yok:['Yok',0,0,0],kirli:['Kirli sakal',.5,.5,.5],kisa:['Kısa sakal',1,1,1],hat:['Çene hattı',.8,.75,0],keci:['Keçi',0,1,1],biyik:['Bıyık',0,0,1]};
const TENLER=['#f0cfb4','#e2b692','#c99b78','#a97650','#7f5337','#553524'];
const SACR=['#0f0c0b','#2a1d16','#4a3020','#7a5230','#b08a50','#d9bf8a','#8c3a1c','#8f8f8f'];
const GOZR=['#4a2c17','#6b4422','#3f6b3a','#3a6f93','#6f7f88','#16100c'];
const KLIP={Atak_Bekleme:'Bekleme',Kosu:'Koşu',Kosu_Geri:'Geri koşu',Top_Surme:'Top sürme',Pas:'Pas',Sut_1:'Şut 1',Sut_2:'Şut 2',Kosarak_Sut:'Koşarak şut',Kafa_1:'Kafa',Top_Karsilama:'Top karşılama',Kayarak_Mudahale_1:'Kayarak müdahale',Tac_Atisi:'Taç',Faul_Dusme:'Faul düşme',Ayaga_Kalkma:'Ayağa kalkma',Sevinc_Yumruk:'Yumruklu sevinç',Sevinc_Kollar_Havada:'Kollar havada',Sevinc_Genis_Durus:'Geniş duruş',Hayal_Kirikligi:'Başa el',Kaleci_Bekleme:'Kaleci bekleme',Kaleci_Tutma_1:'Kaleci tutuş',Kaleci_Plonjon_1:'Plonjon 1',Kaleci_Plonjon_2:'Plonjon 2',Kaleci_Elle_Atis:'Kaleci atış',Kaleci_Top_Tutma:'Topu tutma'};
const TIP={İnce:{chest:-.5,waist:-.6,hips:-.3,armU:-.5,armF:-.4,thigh:-.5,calf:-.4,shoulder:-.3,neckT:-.4},Atletik:{},Güçlü:{chest:.7,waist:.2,shoulder:.6,armU:.7,armF:.5,thigh:.7,calf:.6,neckT:.6,hips:.2},Kısa_Tıknaz:{boy:170,legL:-.4,chest:.4,waist:.5,thigh:.5,neckT:.4,neckL:-.5}};

var FS={C:C,AYAR:AYAR,VAR:VAR,SACLAR:SACLAR,SAKALLAR:SAKALLAR,TENLER:TENLER,SACR:SACR,GOZR:GOZR,KLIP:KLIP,TIP:TIP,TAB:'ortak/'};
FS.varsayilan=function(){var p={},t,i;for(var k in VAR)p[k]=VAR[k];for(t in AYAR)for(i=0;i<AYAR[t].length;i++)p[AYAR[t][i].k]=AYAR[t][i].d;delete p.klip;p.yuzG=1;return p};
FS.farki=function(p){var d=FS.varsayilan(),o={};for(var k in d)if(k!=='klip'&&p[k]!==d[k]&&p[k]!==undefined)o[k]=p[k];if(p.yuzUrl)o.yuzUrl=p.yuzUrl;return o};
FS.ac=function(g){var p=FS.varsayilan();if(g)for(var k in g)p[k]=g[k];return p};
/* ---- veri ---- */
var VS='ce773a24',_v=null;FS.GLBV='eaf7aea8';FS.LODV='4de817ae';
function b64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function resim(src){return new Promise(function(c,r){var i=new Image;i.crossOrigin='anonymous';i.onload=function(){c(i)};i.onerror=function(){r(new Error('Görsel açılamadı'))};i.src=src})}
function piksel(i,W,H){var c=document.createElement('canvas');c.width=W;c.height=H||W;var g=c.getContext('2d',{willReadFrequently:true});g.drawImage(i,0,0,W,H||W);return g.getImageData(0,0,W,H||W).data}
FS.veri=function(){if(_v)return _v;_v=fetch(FS.TAB+'saha_ozel_veri.json?v='+VS).then(function(r){if(!r.ok)throw new Error('saha_ozel_veri.json indirilemedi');return r.json()}).then(function(d){return Promise.all(['ten','m1','m2','har','sacg','tel'].map(function(k){return resim(d.res[k])})).then(function(I){d.img={ten:I[0],m1:I[1],m2:I[2],har:I[3],sacg:I[4],tel:I[5]};return d})});return _v};
FS.goz=function(W,hex){var T=W,D=new Uint8Array(T*T*4),E=[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)],iR=.205,pu=.085;for(var y=0;y<T;y++)for(var x=0;x<T;x++){var dx=x-T/2+.5,dy=y-T/2+.5,rr=Math.hypot(dx,dy)/(T/2),an=Math.atan2(dy,dx),v=[230,225,220],ra=(Math.sin(an*48)*.5+.5)*.35+(Math.sin(an*19+1)*.5+.5)*.3,sh=(.7+ra*1.1)*(1.25-.55*rr/iR),m=C.cl(0,1,(iR-rr)/.012),ri=Math.exp(-(((rr-iR)/.022)*((rr-iR)/.022))),k=(y*T+x)*4,hl=Math.exp(-(((x-T*.535)/(T/85))*((x-T*.535)/(T/85))+((y-T*.46)/(T/85))*((y-T*.46)/(T/85))));for(var i=0;i<3;i++){var c=v[i]*(1-m)+E[i]*sh*m;c*=1-ri*.75;var m2=C.cl(0,1,(pu-rr)/.012);c=c*(1-m2)+4*m2;D[k+i]=Math.min(255,c+hl*190)}D[k+3]=255}return D};
/* ---- oyun: hesap çalışanı; ana iş parçacığı donmaz ---- */
var _is=null,_sira={},_no=0,_ini=null;
FS.isci=function(M,V){if(_ini)return _ini;_ini=Promise.resolve().then(function(){var kod='var C=('+_cekirdek.toString()+')();var G=null;onmessage=function(e){var m=e.data;if(m.t==="kur"){G=m;return}var p=m.p,out={pos:{},nor:{},id:m.id},tr=[];for(var k in G.ag){var a=G.ag[k],po=new Float32Array(a.p.length),no=new Float32Array(a.n.length);C.ag(p,a.p,a.n,po,no,true);out.pos[k]=po;out.nor[k]=no;tr.push(po.buffer,no.buffer)}var yo={},o=[0,0,0];for(var n in G.j){var q=G.j[n];C.deform(p,q[0],q[1],q[2],o);yo[n]=[o[0],o[1],o[2]]}out.j=yo;var H=yo.Head,W=G.W,R=new Uint8ClampedArray(W*W*4);C.ten(p,m.sak,W,G.base,G.m1,G.m2,G.har,m.fo,R);out.ten=R;tr.push(R.buffer);if(G.sac[p["sa\\u00e7Stil"]]){var s=G.sac[p["sa\\u00e7Stil"]],sp=new Float32Array(s.p.length);C.kart(p,s.p,s.st,p.hairL,p.hairV,G.Ri,H[0],H[1],H[2],sp);out.sac=sp;tr.push(sp.buffer)}if(p.beardL>.05){var b=G.sac._sakal,bp=new Float32Array(b.p.length);C.kart(p,b.p,b.st,p.beardL,1,G.Ri,H[0],H[1],H[2],bp);out.sakal=bp;tr.push(bp.buffer)}C.deform(p,0,1.785,.02,o);out.ust=o[1];postMessage(out,tr)};';
 var url=URL.createObjectURL(new Blob([kod],{type:'text/javascript'}));_is=new Worker(url);_is.onmessage=function(e){var c=_sira[e.data.id];delete _sira[e.data.id];if(c)c(e.data)};
 var ag={},j={};M.kok.traverse(function(o){if(o.isSkinnedMesh&&!(o.material.alphaTest>0)){ag[o.name]={p:o.geometry.attributes.position.array.slice(),n:o.geometry.attributes.normal.array.slice()};o.skeleton.bones.forEach(function(b,i){if(!j[b.name]){var B=new THREE.Matrix4().copy(o.skeleton.boneInverses[i]).invert(),e=B.elements;j[b.name]=[e[12],e[13],e[14]]}})}});
 var W=512,sac={};for(var k in V.sac){var o=V.sac[k];sac[k]={p:new Float32Array(b64(o.v).buffer),st:o.st}}
 var Rb=null;M.kok.traverse(function(o){if(!Rb&&o.isSkinnedMesh)o.skeleton.bones.forEach(function(b,i){if(b.name==='Head'){var e=o.skeleton.boneInverses[i].elements;Rb=[e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]]}})});
 _is.postMessage({t:'kur',ag:ag,j:j,W:W,sac:sac,Ri:Rb,base:piksel(V.img.ten,W),m1:piksel(V.img.m1,W),m2:piksel(V.img.m2,W),har:piksel(V.img.har,W)});return true});return _ini};
FS.hesapla=function(M,V,g){return FS.isci(M,V).then(function(){var p=FS.ac(g),sak=SAKALLAR[p.sakal]||SAKALLAR.yok,once=p.yuzUrl?resim(p.yuzUrl).then(function(i){return{d:piksel(i,192,240),w:192,h:240}}).catch(function(){return null}):Promise.resolve(null);return once.then(function(fo){return new Promise(function(c){var id=++_no;_sira[id]=c;_is.postMessage({t:'h',id:id,p:p,sak:sak,fo:fo})})}).then(function(s){s.p=p;return s})})};
FS.sacMesh=function(o,mt,hd,pos){var n8=new Int8Array(b64(o.n).buffer),u=new Uint16Array(b64(o.u).buffer),f=new Uint16Array(b64(o.f).buffer),g=new THREE.BufferGeometry,nn=new Float32Array(n8.length),uu=new Float32Array(u.length),i;for(i=0;i<nn.length;i++)nn[i]=n8[i]/127;for(i=0;i<uu.length;i++)uu[i]=u[i]/65535;g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nn,3));g.setAttribute('uv',new THREE.BufferAttribute(uu,2));g.setIndex(new THREE.BufferAttribute(f,1));var m=new THREE.Mesh(g,mt);m.frustumCulled=false;hd.add(m);return m};
window.FutbolcuSistem=FS;
})();
