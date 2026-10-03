// Çalıştır: node tests/oynanis.cjs (bağımlılık yok)
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root={};vm.createContext(root);
for(const name of ['ayar','veri','kaleci_maske','kaleci','fizik','puan'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name+'.js'),'utf8'),root);
const D=root.DT;let checked=0;
const oran=(pos,x,y,ant,N=200,sonuc='kurtaris')=>{let n=0;for(let s=1;s<=N;s++)if(D.fizik.hesapla({pos,aim:{x,y},falso:0,zaman:.5,seed:s*977,antrenman:ant}).sonuc===sonuc)n++;return n/N;};

// 1) aynı girdi aynı sonuç, yol sonlu ve zeminin altına inmez
for(const pos of D.AYAR.pozisyonlar)for(const x of [-3,0,3])for(const y of [.35,1.1,2.2])for(const seed of [1,17,42,101]){
 const input={pos,aim:{x,y},zaman:.5,falso:0,seed};const a=D.fizik.hesapla(input),b=D.fizik.hesapla(input);
 assert.equal(JSON.stringify(a),JSON.stringify(b));
 assert(a.yol.every(p=>Number.isFinite(p.x+p.y+p.z)&&p.y>=D.AYAR.kale.topYaricap-1e-8));checked++;
}
// 2) kalecinin üzerine gelen şut çoğunlukla kurtarılır (resmi turda ve antrenmanda); orta alçak/yüksek dahil
const pen=D.AYAR.pozisyonlar[0];
for(const ant of [false,true])for(const [x,y] of [[0,1.0],[0.3,1.2],[0,1.9],[0.6,1.0]]){
  const o=oran(pen,x,y,ant);assert(o>=0.85,`merkeze yakın şut kurtarılmalı: ant=${ant} (${x};${y}) kurtarış=${o}`);checked++;
}
// 3) güzel köşe ödüllendirilir: direğe yakın şutlar çoğunlukla gol
for(const [x,y] of [[3.0,0.5],[3.0,1.8],[-3.0,1.2],[-3.1,2.0]]){
  const o=oran(pen,x,y,false,200,'gol');assert(o>=0.8,`köşe golü: (${x};${y}) gol=${o}`);checked++;
}
// 4) kaleci her topa yan dalış yapmaz: merkezde dalış pozu yok
for(let s=1;s<=100;s++){const r=D.fizik.hesapla({pos:pen,aim:{x:0,y:1.0},zaman:.5,falso:0,seed:s,antrenman:false});
  const k=r.kaleci.konum(r.ucusT);assert(!/dalis/.test(k.poz)&&Math.abs(k.x)<0.5,'merkez şutta dalış başlamamalı (en çok kısa yan adım)');}
checked++;
// 5) kurtarış maskesi çizilen pozla sürekli: dalış ilerlerken maske aniden sıçramaz (poz değişimi tek adımda, konum sürekli)
{const plan=D.kaleci.planla({x:2,y:1},'penalti',false,()=>0,0.44);let onceki=plan.konum(0);
 for(let t=0.01;t<=0.6;t+=0.01){const k=plan.konum(t);assert(Math.hypot(k.x-onceki.x,k.y-onceki.y)<0.25,'konum sıçradı');onceki=k;}checked++;}
// 6) baraj üstünden gol yolu duruyor
for(const pos of D.AYAR.pozisyonlar.slice(3)){let goals=0;for(let seed=1;seed<=100;seed++){const r=D.fizik.hesapla({pos,aim:{x:0,y:2.4},falso:0,zaman:.5,seed});assert(!['baraj','aut'].includes(r.sonuc));if(r.sonuc==='gol'||r.sonuc==='direk_gol')goals++;}assert(goals>0);checked++;}
// 7) kalecinin erişebildiği top direkten gol sayılmaz
for(let s=1;s<=200;s++)for(const x of [-3.58,3.58]){const r=D.fizik.hesapla({pos:pen,aim:{x,y:1.0},zaman:.5,falso:0,seed:s});if(r.sonuc==='direk_gol')assert(!D.kaleci.tutarMi(r.kaleci,r.ucusT,r.gecis));}
checked++;
console.log('PASS:',checked,'kontrol: determinizm, merkeze gelen şutun kurtarılması, köşe ödülü, merkezde dalış yok, poz sürekliliği, baraj üstü gol yolu, direk-kaleci sırası.');

// Caught ball enters the hand smoothly after contact.
for(const y of [.35,1,1.9]) {
 const r=D.fizik.hesapla({pos:pen,aim:{x:0,y},falso:0,zaman:.5,seed:42});
 if(r.tuttu) { const i=r.yol.findIndex(p=>Math.abs(p.t-r.olayT)<1e-8);
  assert(i>=0); for(let j=i+1;j<Math.min(i+28,r.yol.length);j++){const a=r.yol[j-1],b=r.yol[j];assert(Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)<.13,'caught ball jumped');}
 }
}
console.log('PASS: continuous caught-ball path.');
