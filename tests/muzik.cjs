// Müzik: parça verisi (müzik teorisi tutarlılığı), çevrimdışı render (ses seviyesi), çalıcı (zamanlama, geçiş, kısma, efektler, gerçek dosya tercihi, ses kapalıyken sessizlik).
const fs=require('fs'),vm=require('vm'),assert=require('assert');
function dunya(ek){const log={osc:[],kaynak:[],gain:[],oran:[],fetch:[]};let simdi=0,sayici=null;
 function gainNode(){const g={gain:{value:1,setValueAtTime(v,t){this.value=v;log.oran.push(['set',v,t]);},linearRampToValueAtTime(v,t){log.oran.push(['lin',v,t]);},exponentialRampToValueAtTime(v,t){log.oran.push(['exp',v,t]);},cancelScheduledValues(){}},connect(){},disconnect(){}};log.gain.push(g);return g;}
 function AC(){this.destination={};this.sampleRate=22050;this.state='running';Object.defineProperty(this,'currentTime',{get:()=>simdi});this.createGain=gainNode;
  this.createOscillator=()=>{const o={type:'sine',frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(t){o.t=t;log.osc.push(o);},stop(){}};return o;};
  this.createBiquadFilter=()=>({type:'',frequency:{value:0},Q:{value:0},connect(){}});this.createBuffer=(c,n)=>({getChannelData:()=>new Float32Array(n),duration:n/22050});
  this.createBufferSource=()=>{const s={buffer:null,loop:false,connect(){},start(t){s.t=t;log.kaynak.push(s);},stop(){}};return s;};this.decodeAudioData=(h)=>Promise.resolve({duration:30,byteLength:h.byteLength});}
 const root=Object.assign({DT:{ses:{acikMi:()=>true}},AudioContext:AC,Buffer,setInterval:(f)=>{sayici=f;return 1;},addEventListener(){}},ek||{});vm.createContext(root);vm.runInContext(fs.readFileSync(__dirname+'/../js/muzik.js','utf8'),root);
 return{M:root.DT.muzik,log,root,ilerle:(sn)=>{const adimlar=Math.round(sn/.025);for(let i=0;i<adimlar;i++){simdi+=.025;if(sayici)sayici();}},zaman:()=>simdi};}
const {M}=dunya();
// 1) Parça verisi: teori tutarlılığı
const A_HARM=new Set([9,11,0,2,4,5,7,8]);   // la armonik minör (E majör dominantı için sol diyez dahil)
for(const ad of ['menu','mac']){const p=M.PARCALAR[ad],uz=M.bolumMs(ad),olay=M.olayUret(ad),adim=60/p.bpm/4;
 assert.equal(p.akor.length,8,ad+': 8 ölçü');assert(Math.abs(uz-8*16*adim)<1e-9,ad+': döngü süresi = 8 ölçü');assert.deepEqual([p.akor[0],p.akor[7]],['Am','E'],ad+': Am ile başlar, dominant E ile biter (döngü Am\'ye çözülür)');
 olay.forEach(e=>{assert(e.t>=0&&e.t<uz-1e-9,ad+': olay döngü içinde '+e.t);assert(e.sure>0&&e.ses>0&&e.ses<=.26,ad+': ses seviyesi güvenli '+e.ses);assert(M.SES[e.tur],'tanımlı ses karakteri');});
 for(let b=0;b<8;b++){const ak=p.akor[b],tri=M.AKOR[ak],o=olay.filter(e=>e.t>=b*16*adim-1e-9&&e.t<(b+1)*16*adim-1e-9);
  const bas=o.filter(e=>e.tur===(ad==='mac'?'basM':'bas'));assert(bas.length>=3&&bas.every(e=>e.midi===M.KOK[ak]),ad+' ölçü '+b+': bas kökü '+ak);
  assert.equal(o.filter(e=>e.tur==='kick').length,ad==='mac'?4:2,ad+': kick sayısı');
  if(ad==='menu'){const pad=o.filter(e=>e.tur==='pad').map(e=>e.midi).sort();assert.deepEqual(pad,tri.slice().sort(),'pad = akor '+ak);o.filter(e=>e.tur==='lead').forEach(e=>{assert(A_HARM.has(e.midi%12),'lead nota la minör ölçüsünde: '+e.midi);assert(e.midi>=69&&e.midi<=84,'lead aralığı');});
   const ld=o.filter(e=>e.tur==='lead');assert(ld.length>=4&&ld.length<=5);}
  else{const arp=o.filter(e=>e.tur==='arp');assert.equal(arp.length,16,'16\'lık arpej');arp.forEach(e=>{assert(tri.map(m=>(m+12)%12).includes(e.midi%12),'arp akor sesi: '+ak+' '+e.midi);});assert.equal(o.filter(e=>e.tur==='snare').length,2);assert.equal(o.filter(e=>e.tur==='hat').length,4);}}
 // yoğunluk: saniyede aşırı olay yok
 const sn=[];for(let t=0;t<uz;t+=1)sn.push(olay.filter(e=>e.t>=t&&e.t<t+1).length);assert(Math.max(...sn)<=32,ad+': saniyedeki olay sayısı makul '+Math.max(...sn));}
// 2) Çevrimdışı render: kırpma yok, ses seviyesi uygun, DC yok
for(const ad of ['menu','mac']){const uz=M.bolumMs(ad),olay=M.olayUret(ad),tum=[];for(let k=0;k<2;k++)olay.forEach(e=>tum.push(Object.assign({},e,{t:e.t+k*uz})));const x=M.render(tum,uz*2+1,22050);let pk=0,ss=0,dc=0;for(const v of x){assert(Number.isFinite(v));pk=Math.max(pk,Math.abs(v));ss+=v*v;dc+=v;}
 const rms=Math.sqrt(ss/x.length);assert(pk<.95,ad+': tepe '+pk.toFixed(3));assert(rms>.04&&rms<.25,ad+': RMS '+rms.toFixed(3));assert(Math.abs(dc/x.length)<.01,ad+': DC yok');
 // iki döngü aynı: ikinci yarı birinci yarıyla benzer (döngü bozulmaz)
 const n=Math.floor(uz*22050);let fark=0,say=0;for(let i=2000;i<n-2000;i+=7){fark+=Math.abs(x[i]-x[i+n]);say++;}assert(fark/say<.02,ad+': döngü tekrarında aynı ses '+(fark/say).toFixed(4));
 const wav=M.wav(x,22050);assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt32LE(24),22050);assert.equal(wav.length,44+x.length*2);}
for(const [ad,e] of Object.entries(M.EFEKT)){const bitis=Math.max(...e.map(n=>n.t+n.sure+(M.SES[n.tur].r||.2)));assert(bitis<=1.7,ad+': efekt kısa '+bitis);const x=M.render(e,bitis+.1,22050);let pk=0;for(const v of x){assert(Number.isFinite(v));pk=Math.max(pk,Math.abs(v));}assert(pk>.02&&pk<.9,ad+': efekt duyulur ve kırpmaz '+pk.toFixed(3));}
// 3) Çalıcı
{const w=dunya();w.M.sahne('mac');w.M.ayarla(false);w.ilerle(1);assert.equal(w.log.osc.length,0,'ayar kapalıyken sessiz');}
{const w=dunya({DT:{ses:{acikMi:()=>false}}});w.M.ayarla(true);w.M.sahne('mac');w.ilerle(2);assert.equal(w.log.osc.length+w.log.kaynak.length,0,'genel Ses düğmesi kapalıyken sessiz');assert.equal(w.M.efekt('gol'),false);}
{const w=dunya();w.M.ayarla(true);w.M.sahne('mac');w.ilerle(3);const o=w.log.osc.filter(x=>x.t!==undefined);assert(o.length>40,'arpej ve bas zamanlanır: '+o.length);const ts=o.map(x=>x.t);assert(ts.every(t=>t>=0),'geçmişe not yok');assert(Math.max(...ts)<w.zaman()+.3,'yalnız ileriye 0,3 sn bakar');assert.deepEqual(w.M._durum().calan,'mac');
 // geçiş: yeni parça, eski sönümlenir
 const gB=w.log.oran.length;w.M.sahne('menu');w.ilerle(.5);assert.equal(w.M._durum().calan,'menu');assert(w.log.oran.slice(gB).some(r=>r[0]==='lin'&&r[1]===0),'eski parça 0\'a iner');assert(w.log.oran.slice(gB).some(r=>r[0]==='lin'&&r[1]===1),'yeni parça 1\'e çıkar');
 // müzik ayarı kapanınca durur ve yeniden açılınca devam eder
 w.M.muzikAyarla(false);const n0=w.log.osc.length;w.ilerle(1);assert.equal(w.log.osc.length,n0,'müzik kapalı: yeni nota yok');assert.equal(w.M._durum().calan,null);w.M.muzikAyarla(true);w.ilerle(1);assert(w.log.osc.length>n0&&w.M._durum().calan==='menu','müzik açılınca kaldığı sahneyle devam');
 // kısma: önce 0,3'e iner, sonra 1'e döner
 const kB=w.log.oran.length;w.M.kis(2,.3);const k=w.log.oran.slice(kB);assert(k.some(r=>r[0]==='lin'&&Math.abs(r[1]-.3)<1e-9)&&k.some(r=>r[0]==='lin'&&r[1]===1),'müzik kısılıp geri açılır');
 // efektler
 const eB=w.log.osc.length;assert.equal(w.M.efekt('gol'),true);assert.equal(w.log.osc.length-eB,6,'gol fanfarı 6 nota');assert.equal(w.M.efekt('yok'),false);for(const ad of Object.keys(w.M.EFEKT))assert.equal(w.M.efekt(ad),true,ad);}
// gerçek dosya tercihi
(async()=>{const w=dunya({fetch:async(u)=>/muzik-mac\.mp3$/.test(u)?{ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}:{ok:false}});w.M.ayarla(true);for(let i=0;i<40;i++)await new Promise(r=>setTimeout(r,5));assert.deepEqual(w.M._durum().kayit,['mac'],'gerçek parça bulundu');
 w.M.sahne('mac');w.ilerle(2);assert.equal(w.M._durum().gercek,true,'gerçek parça çalar');assert(w.log.kaynak.some(s=>s.loop===true),'döngüyle');assert.equal(w.log.osc.filter(o=>o.t!==undefined).length,0,'gerçek parça varken sentez yok');
 w.M.sahne('menu');w.ilerle(4);assert.equal(w.M._durum().gercek,false,'menü için kayıt yok: sentez');assert(w.log.osc.length>10,'menü sentezi çalar: '+w.log.osc.length);
 // oyun entegrasyonu
 const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
 assert(/DT\.muzik\.sahne\(ad === 'oyun' \? 'mac' : 'menu'\)/.test(oyun)&&/DT\.muzik\.ayarla\(/.test(oyun)&&/DT\.muzik\.kis\(/.test(oyun)&&/DT\.muzik\.efekt\('gol'\)/.test(oyun)&&/id="btnMuzik"/.test(html)&&/js\/muzik\.js/.test(html),'oyun entegrasyonu');
 console.log('PASS müzik: 2 döngü (la minör, 8 ölçü, akor-bas-pad-melodi tutarlı), render (kırpma yok, RMS uygun, döngü tekrarında aynı), çalıcı (zamanlama, geçiş, kısma, efektler, gerçek dosya tercihi, ses kapalıyken sessiz)');
})().catch(e=>{console.error(e);process.exit(1)});
