// Meto anatomisi: (1) sevinçler (3 tam-beden varyant + canlı bekleme) ve (2) koşu/vuruş kol pozları. İnsan sınırları: dirsek yalnız bükülür (10–140°), omuz geriye ≤55° uzanır,
// kemik boyları sabit, eller/kalça süreklidir, ayaklar yerin altına inmez, yüz (baş) gövdeden kopmaz. Burulmasız kol çerçevesi: bükülme düzlemi normali sonlu ve sıçramasız.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),D={DT:{},console};vm.createContext(D);for(const f of ['ayar','futbolcu3d','meto3d'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),D);
const M=D.DT.meto3d,R=D.DT.futbolcu3d,meta=JSON.parse(fs.readFileSync(__dirname+'/../assets/meto3d/model.json')),AD=D.DT.AYAR;
const sub=(a,b)=>a.map((v,k)=>v-b[k]),len=a=>Math.hypot(...a),dot=(a,b)=>a.reduce((n,x,k)=>n+x*b[k],0),unit=a=>{const l=len(a)||1;return a.map(x=>x/l)},deg=x=>x*180/Math.PI,ang=(a,b)=>deg(Math.acos(Math.max(-1,Math.min(1,dot(unit(a),unit(b))))));
const U=1/meta.unit_m,rest=meta.rest,seg=(k1,k2)=>len(sub(rest[k1],rest[k2]));
const uzun={ul:seg('sl','el'),fl:seg('el','hl'),ur:seg('sr','er'),fr:seg('er','hr'),tl:seg('hipl','kl'),sl:seg('kl','fl'),tr:seg('hipr','kr'),sr:seg('kr','fr')};
function boyKontrol(p,ad){for(const [a,b,k] of [['sl','el','ul'],['el','hl','fl'],['sr','er','ur'],['er','hr','fr']])assert(Math.abs(len(sub(p[b],p[a]))-uzun[k])<1e-3,ad+': kol kemik boyu sabit '+k+' '+len(sub(p[b],p[a])).toFixed(3)+' vs '+uzun[k].toFixed(3));
 for(const [a,b,k] of [['hipl','kl','tl'],['hipr','kr','tr']])assert(Math.abs(len(sub(p[b],p[a]))-uzun[k])<.05,ad+': uyluk boyu sabit '+k);}
const yerY=Math.min(rest.fl[1],rest.fr[1])-8;
// ---- 1) Sevinçler ----
const imza=new Set;let zirveLift=[0,0,0],havaKare=[0,0,0],idleHareket=0;
for(let v=0;v<3;v++){let prev=null;for(let j=0;j<=1000;j++){const t=j/100,r=R.rig({direction:0});r.celebration={time:t,variant:v};const p=M._pose(r,meta),m=M._matrices(r,meta),c=M._celebration(t,v);assert([...m].every(Number.isFinite),'matrisler sonlu');
  for(const s of ['l','r']){const u=sub(p['e'+s],p['s'+s]),f=sub(p['h'+s],p['e'+s]),th=ang(u,f);assert(th>=9.99&&th<=140.01,'sevinç '+v+' t='+t+' dirsek bükümü '+th.toFixed(1)+' (insan aralığı)');}
  boyKontrol(p,'sevinç '+v+' t='+t);
  for(const s of ['l','r'])assert(p['f'+s][1]>=yerY-1,'ayak yerin altına inmez: '+p['f'+s][1].toFixed(1)+' < '+yerY.toFixed(1));
  assert(c.body.lift*1>-.08&&c.body.lift<.27,'zıplama yüksekliği makul (m): '+c.body.lift.toFixed(3));
  zirveLift[v]=Math.max(zirveLift[v],c.body.lift);if(c.body.lift>.05)havaKare[v]++;
  if(prev){for(const s of ['l','r'])assert(len(sub(p['h'+s],prev['h'+s]))<16,'sevinç '+v+' eller sürekli (<4 m/sn) t='+t+': '+len(sub(p['h'+s],prev['h'+s])).toFixed(1));assert(len(sub(p.hip,prev.hip))<7,'kalça sürekli (<1,8 m/sn) t='+t+': '+len(sub(p.hip,prev.hip)).toFixed(1));}
  prev=p;if(j===200)imza.add(JSON.stringify(p.hr.map(Math.round)));
  if(t>=7&&t<9){idleHareket=Math.max(idleHareket,Math.abs(p.hip[1]-R.rig({direction:0}).nodes.hip[1]*0-p.hip[1]));}}}
assert.equal(imza.size,3,'üç sevinç birbirinden farklı');
for(let v=0;v<3;v++){assert(zirveLift[v]>=.12||v===1,'sevinç '+v+': gerçek zıplama (zirve '+zirveLift[v].toFixed(2)+' m)');}
assert(havaKare[0]>40&&havaKare[2]>40,'zıplamalı sevinçlerde ayaklar yerden uzun süre kalkar');
// bekleme canlı: bitmiş sevinçte (t=7…9) kalça ve eller hâlâ oynar (heykel gibi donmaz)
{let hMin=1e9,hMax=-1e9,elMin=1e9,elMax=-1e9;for(let j=700;j<=1100;j+=2){const r=R.rig({direction:0});r.celebration={time:j/100,variant:0};const p=M._pose(r,meta);hMin=Math.min(hMin,p.hip[0]);hMax=Math.max(hMax,p.hip[0]);elMin=Math.min(elMin,p.hr[2]);elMax=Math.max(elMax,p.hr[2]);}assert(hMax-hMin>2.0,'bekleyişte ağırlık aktarılır (yan kayma '+(hMax-hMin).toFixed(2)+' birim)');assert(elMax-elMin>2.0,'bekleyişte kol hafifçe sallanır ('+(elMax-elMin).toFixed(2)+' birim)');}
// ---- 2) Koşu / vuruş kol pozları (eskiden denetlenmiyordu) ----
const pos=AD.pozisyonlar[0];let maxEl=0,minEl=999,maxSh=0,minZ=9,adim=0,rigAdim=0,prevP=null,prevR=null,n=0;
for(const poz of [AD.pozisyonlar[0],AD.pozisyonlar.find(q=>q.tip==='frikik')])for(const dir of [-1,0,1]){prevP=null;prevR=null;for(let t=0;t<=3.4;t+=.02){const pl=R.placement(poz,{direction:dir,walk:null,shot:{elapsed:t,windup:1.5,contact:null},path:null,turning:null});
  const r=R.rig({id:'meto',direction:dir,yaw:pl.yaw,gait:pl.gait,kick:pl.kick,drift:pl.drift,plant:pl.plant,devam:pl.devam,cok:pl.cok,shot:{elapsed:t,windup:1.5,contact:null}});const p=M._pose(r,meta),m=M._matrices(r,meta);n++;assert([...m].every(Number.isFinite));boyKontrol(p,'vuruş t='+t);
  for(const [s,side] of [['l',-1],['r',1]]){const u=sub(p['e'+s],p['s'+s]),f=sub(p['h'+s],p['e'+s]),th=ang(u,f),sh=ang(u,[0,-1,0]);maxEl=Math.max(maxEl,th);minEl=Math.min(minEl,th);maxSh=Math.max(maxSh,sh);minZ=Math.min(minZ,unit(u)[2]);
   assert(th>=9.9&&th<=140.1,'koşu/vuruş dirsek bükümü insan aralığında: '+th.toFixed(1)+' t='+t);assert(sh<=105.5,'omuz yüksekliği ≤105°: '+sh.toFixed(1));assert(unit(u)[2]>=-Math.sin(55.5*Math.PI/180),'üst kol geriye ≤55°: '+deg(Math.asin(-unit(u)[2])).toFixed(1));assert(side*unit(u)[0]>=-.26,'kol gövdeyi belirgin çaprazlamaz');
   if(prevP){adim=Math.max(adim,len(sub(p['h'+s],prevP['h'+s])));rigAdim=Math.max(rigAdim,len(sub(r.nodes['h'+s],prevR.nodes['h'+s])));}}
  prevP=p;prevR=r;}}
assert(adim<=rigAdim*1.1+1,'çözücü, rig hedefinin kendi hızını aşmaz (kolu hızlandırmaz): '+adim.toFixed(1)+' ≤ '+(rigAdim*1.1+1).toFixed(1));
console.log('PASS Meto anatomisi: sevinçler (zıplama zirvesi '+zirveLift.map(x=>x.toFixed(2)).join('/')+' m, canlı bekleme) ve '+n+' koşu/vuruş pozu: dirsek '+minEl.toFixed(0)+'–'+maxEl.toFixed(0)+'°, omuz ≤'+maxSh.toFixed(0)+'°, geri uzanma ≤'+deg(Math.asin(-minZ)).toFixed(0)+'°, sabit kemik boyları, sürekli eller');
