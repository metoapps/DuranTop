// Beş gerçek kayıt (vuruş, direk, file, düdük, gol): dosyalar mevcut ve doğru biçimde; ses.js hepsini yükler;
// gol uğultusu sustur() ile kesilir; düdük ilk açışta kaydın inmesini kısa süre bekler; oyun.js düdüğü koşu başında çalar.
// Çalıştır: node tests/ses-kayit-tam.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const KOK=path.join(__dirname,'..'),ADLAR=['vurus','direk','file','islik','gol'];

// 1) Dosyalar: MP3 başlığı ve makul boyut (süre sınırları OKU-BENI.txt ile uyumlu; ölçüm ffprobe ile teslim notunda)
const SINIR={vurus:[3000,40000],direk:[3000,40000],file:[3000,40000],islik:[3000,40000],gol:[40000,400000]};
for(const ad of ADLAR){
  const p=path.join(KOK,'assets/ses',ad+'.mp3');assert(fs.existsSync(p),ad+'.mp3 yok');
  const b=fs.readFileSync(p);const id3=b.slice(0,3).toString()==='ID3',sync=b[0]===0xff&&(b[1]&0xe0)===0xe0;
  assert(id3||sync,ad+'.mp3 MP3 değil');assert(b.length>=SINIR[ad][0]&&b.length<=SINIR[ad][1],ad+'.mp3 boyutu beklenmedik: '+b.length);
}
assert(fs.existsSync(path.join(KOK,'assets/ses/KAYNAKLAR.txt')),'lisans/kaynak notu yok');

// 2) ses.js davranışı (sahte AudioContext)
function kur({kayitVar,yavas}){
  const calan=[],istenen=[],zaman={t:0};let bekleyenler=[];
  function ctx(){return{get currentTime(){return zaman.t;},sampleRate:44100,state:'running',destination:{},resume(){},
    createGain(){const g={value:1,olaylar:[],setValueAtTime(v,t){g.olaylar.push(['set',v,t]);},linearRampToValueAtTime(v,t){g.olaylar.push(['ramp',v,t]);},exponentialRampToValueAtTime(v,t){g.olaylar.push(['exp',v,t]);}};return{gain:g,connect(){},disconnect(){}};},
    createBuffer(c,n){return{getChannelData(){return new Float32Array(n);},sentez:true};},
    createBufferSource(){const s={playbackRate:{value:1},connect(){},disconnect(){},stop(t){s.durdu=t;},start(){calan.push(s);}};return s;},
    createBiquadFilter(){return{frequency:{},Q:{},connect(){}};},
    createOscillator(){const o={frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){calan.push({osilator:true});},stop(){}};return o;},
    decodeAudioData(b){return Promise.resolve({kayit:b.ad});}};}
  const root={AudioContext:ctx,location:{search:''},setTimeout:(f,ms)=>setTimeout(f,ms),
    fetch:(u)=>{const ad=u.split('/').pop().split('.')[0];istenen.push(u);if(!kayitVar)return Promise.resolve({ok:false});
      const yanit={ok:true,arrayBuffer:()=>{const ab=new ArrayBuffer(8);ab.ad=ad;return Promise.resolve(ab);}};
      return yavas?new Promise(r=>bekleyenler.push(()=>r(yanit))):Promise.resolve(yanit);}};
  root.globalThis=root;vm.createContext(root);vm.runInContext(fs.readFileSync(path.join(KOK,'js/ses.js'),'utf8'),root);
  return {DT:root.DT,calan,istenen,zaman,birak:()=>{bekleyenler.forEach(f=>f());bekleyenler=[];}};
}
const bekle=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  // Hepsi yüklenir ve kayıttan çalınır
  let s=kur({kayitVar:true});s.DT.ses.ayarla(true);await bekle(20);
  assert.deepEqual(s.istenen.map(u=>u.split('/').pop().split('?')[0]).sort(),ADLAR.map(a=>a+'.mp3').sort(),'beş kaydın hepsi istenir');
  assert(s.istenen.every(u=>/\?v=20261006a$/.test(u)),'önbellek etiketi güncel');
  for(const ad of ADLAR)assert(s.DT.ses.kayitVarMi(ad),ad+' yüklenmedi');
  for(const ad of ['vurus','islik','gol']){s.calan.length=0;s.DT.ses.cal(ad);assert.equal(s.calan.length,1,ad+' tek kaynak');assert.equal(s.calan[0].buffer.kayit,ad,ad+' kayıttan çalmalı');}
  // Gol uğultusu: sustur() 0,3 sn'de kısar ve durdurur; ikinci gol öncekini keser
  s.calan.length=0;s.DT.ses.cal('gol');const gol1=s.calan[0];s.zaman.t=2;s.DT.ses.cal('gol');assert(Math.abs(gol1.durdu-2.32)<1e-9,'yeni gol önceki uğultuyu keser');
  const gol2=s.calan[1];s.zaman.t=3;s.DT.ses.sustur();assert(Math.abs(gol2.durdu-3.32)<1e-9,'sustur uğultuyu keser');
  s.calan.length=0;s.DT.ses.cal('vurus');s.zaman.t=4;s.DT.ses.sustur();assert.equal(s.calan[0].durdu,undefined,'kısa sesler susturulmaz');
  s.calan.length=0;s.DT.ses.cal('gol');s.zaman.t=5;s.DT.ses.ayarla(false);assert(Math.abs(s.calan[0].durdu-5.32)<1e-9,'ses kapatılınca uğultu kesilir');
  // Kayıt yoksa sentez (eski davranış)
  s=kur({kayitVar:false});s.DT.ses.ayarla(true);await bekle(20);
  for(const ad of ADLAR)assert(!s.DT.ses.kayitVarMi(ad));
  s.calan.length=0;s.DT.ses.cal('vurus');assert(s.calan.length>0&&s.calan.every(c=>!c.buffer||c.buffer.sentez),'kayıt yoksa vuruş sentezi');
  s.calan.length=0;s.DT.ses.cal('islik');assert(s.calan.length===1&&s.calan[0].osilator,'kayıt yoksa düdük sentezi');
  // İlk açışta düdük: kayıt inene kadar bekler, sonra kayıttan tek kez çalar
  s=kur({kayitVar:true,yavas:true});s.DT.ses.ayarla(true);s.DT.ses.cal('islik');assert.equal(s.calan.length,0,'kayıt inmeden hemen çalmaz');
  s.birak();await bekle(20);assert.equal(s.calan.length,1,'kayıt inince tek kez çalar');assert.equal(s.calan[0].buffer.kayit,'islik');await bekle(750);assert.equal(s.calan.length,1,'zaman aşımında ikinci kez çalmaz');
  // Kayıt hiç inmezse 0,7 sn sonra sentez
  s=kur({kayitVar:true,yavas:true});s.DT.ses.ayarla(true);s.DT.ses.cal('islik');await bekle(750);assert.equal(s.calan.length,1);assert(s.calan[0].osilator,'geç kalan kayıt yerine sentez');

  // 3) oyun.js bağlantısı: düdük vuruş fazı başında, susturma her yeni pozisyonda
  const oyun=fs.readFileSync(path.join(KOK,'js/oyun.js'),'utf8');
  assert(/if\(!acik\)\{[^}]*DT\.ses\.cal\('islik'\);\}/.test(oyun),'düdük pozisyon hazır olunca çalmalı (devam eden vuruşta değil)');
  assert(!/d\.faz = 'vurus';\s*\n\s*DT\.ses\.cal\('islik'\)/.test(oyun),'düdük vuruş başında çalmamalı');
  assert.equal((oyun.match(/DT\.ses\.cal\('islik'\)/g)||[]).length,2,'düdük yalnız pozisyon hazırlığında ve ses açma önizlemesinde');
  assert(/function vurusHazirla\(acik\) \{\s*\n\s*if \(DT\.ses\.sustur\) DT\.ses\.sustur\(\);/.test(oyun),'yeni pozisyonda uğultu susturulmalı');
  // frikik (FIFA tarzı basılı tutma): düdük VUR'a basınca, güç dolarken ya da ibreye basınca çalmaz; yalnız pozisyon hazırlığında çalar
  const govde=(ad)=>{const i=oyun.indexOf('function '+ad+'(');assert(i>=0,ad+' bulunamadı');let j=oyun.indexOf('\n  function ',i+10);if(j<0)j=oyun.length;return oyun.slice(i,j);};
  for(const ad of ['vur','vurusUygula','fifaBas','fifaBirak','fifaKare','nisanIlerle']) assert(!/ses\.cal\('islik'\)/.test(govde(ad)),ad+' içinde düdük çalmamalı');
  assert(/function vurusHazirla[\s\S]*?DT\.ses\.cal\('islik'\)/.test(govde('vurusHazirla')),'düdük vurusHazirla içinde çalmalı');
  const html=fs.readFileSync(path.join(KOK,'index.html'),'utf8');
  assert(/js\/ses\.js\?v=20261006a/.test(html)&&/js\/oyun\.js\?v=20261006d/.test(html),'index.html önbellek etiketleri');
  console.log('PASS five real recordings present; all loaded and played; crowd roar cut on next shot/mute; whistle waits for first load; synth fallback; oyun.js wiring');
})().catch(e=>{console.error(e);process.exit(1);});
