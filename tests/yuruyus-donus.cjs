// Duruş değiştirme gerçek bir dönüş mü? Yan yan yürüme yok, basılı ayak kaymıyor, uçlar bekleme duruşuyla aynı. node tests/yuruyus-donus.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const r={};vm.createContext(r);for(const n of ['ayar','veri','baraj','model3d','kaleci','ucus','fizik','puan','futbolcu3d'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const D=r.DT,F=D.futbolcu3d,P=D.AYAR.pozisyonlar,U=F.UNIT;
function dunya(root,yaw,v){const c=Math.cos(yaw),s=Math.sin(yaw);return [root[0]+(v[0]*c+v[2]*s)*U,(v[1]-8)*U,root[1]+(-v[0]*s+v[2]*c)*U];}
let kontrol=0;
for(const idx of [0,5,7,8,9])for(const from of [-1,0,1])for(const to of [-1,0,1]){if(from===to)continue;const pos=P[idx];let prev=null,prevF=null,maxOff=0;
 for(let i=0;i<=330;i++){const u=i/330,pl=F.placement(pos,{direction:to,walk:{from,to,u},shot:null}),rg=F.rig({gait:pl.gait,walk:{from,to,u},direction:to,yaw:pl.yaw}),feet=[dunya(pl.point,pl.yaw,rg.nodes.fl),dunya(pl.point,pl.yaw,rg.nodes.fr)];
  if(prev){const dx=pl.point[0]-prev[0],dz=pl.point[1]-prev[1],dt=1.1/330;
   if(Math.hypot(dx,dz)/dt>.15){let d=(Math.atan2(dx,dz)-pl.yaw)*180/Math.PI;while(d>180)d-=360;while(d<-180)d+=360;maxOff=Math.max(maxOff,Math.abs(d));}
   for(let k=0;k<2;k++){const a=prevF[k],b=feet[k];assert(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])<.12,'ayak bir karede sıçradı');if(a[1]<=1e-6&&b[1]<=1e-6)assert(Math.hypot(b[0]-a[0],b[2]-a[2])/dt<=.05,'basılı ayak kaydı: '+idx+' '+from+'→'+to);}}
  prev=pl.point;prevF=feet;}
 assert(maxOff<35,'gövde yönü gidiş yönünden '+maxOff.toFixed(0)+'° farklı (yan yan yürüme): '+idx+' '+from+'→'+to);
 const s0=F.placement(pos,{direction:from,walk:null,shot:null}),s1=F.placement(pos,{direction:to,walk:null,shot:null}),w0=F.placement(pos,{direction:to,walk:{from,to,u:0},shot:null}),w1=F.placement(pos,{direction:to,walk:{from,to,u:1},shot:null});
 assert(Math.hypot(w0.point[0]-s0.point[0],w0.point[1]-s0.point[1])<1e-9&&Math.abs(w0.yaw-s0.yaw)<1e-9,'başlangıç, bekleme duruşundan farklı');
 assert(Math.hypot(w1.point[0]-s1.point[0],w1.point[1]-s1.point[1])<1e-9&&Math.abs(w1.yaw-s1.yaw)<1e-9,'bitiş, bekleme duruşundan farklı');kontrol++;}
console.log('PASS turn–walk–turn: body yaw within 35° of travel direction, planted feet fixed, no foot jumps, endpoints equal idle stances ('+kontrol+' transitions)');
