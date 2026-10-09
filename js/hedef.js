/* Hedef ağı (3. aşama, yalnız telefonda; kupaya ve sunucuya bağlı değil).
 * Kale ağzına gerili ağ, görseldeki gibi 14 delik: üstte 5, ortada 4, altta 5; köşe halkaları büyük.
 * Kaleci ve baraj yok. Top bir deliğin İÇİNDEN tamamen geçerse sayılır (merkeze uzaklık + top yarıçapı ≤ delik yarıçapı).
 * Halkaya ya da ağa çarpan top esneyip geri seker; yavaş gelen top ağın önüne düşer.
 * Uçuş: aynı enerji/falso/zamanlama fiziği (DT.ucus.energyLaunch). Sunucu bu dosyayı yüklemez. */
(function(root){'use strict';var D=root.DT,A=D.AYAR;
A.hiz.hedef=A.hiz.hedef||A.hiz.frikik;   // yalnız istemcide: hedef vuruşları frikik hızıyla
var BUYUK=.42,KUCUK=.33;
// Görselden ölçülen yerleşim (kale 7,32 × 2,44 m'ye ölçeklenmiş). puan: küçük delik > büyük, üst sıra > alt.
var DELIKLER=[
 {x:-3.04,y:1.93,r:BUYUK,puan:4},{x:-1.48,y:1.93,r:KUCUK,puan:5},{x:0,y:1.93,r:KUCUK,puan:5},{x:1.48,y:1.93,r:KUCUK,puan:5},{x:3.04,y:1.93,r:BUYUK,puan:4},
 {x:-2.18,y:1.22,r:KUCUK,puan:4},{x:-.72,y:1.22,r:KUCUK,puan:4},{x:.72,y:1.22,r:KUCUK,puan:4},{x:2.18,y:1.22,r:KUCUK,puan:4},
 {x:-3.04,y:.50,r:BUYUK,puan:2},{x:-1.48,y:.48,r:KUCUK,puan:3},{x:0,y:.48,r:KUCUK,puan:3},{x:1.48,y:.48,r:KUCUK,puan:3},{x:3.04,y:.50,r:BUYUK,puan:2}];
var POZ=[{tip:'hedef',ad:'Hedef ağı · 11 m',bx:0,D:11},{tip:'hedef',ad:'Hedef ağı · 16 m',bx:0,D:16},{tip:'hedef',ad:'Hedef ağı · 16 m (sağ)',bx:5,D:Math.sqrt(16*16-25)},
 {tip:'hedef',ad:'Hedef ağı · 16 m (sol)',bx:-5,D:Math.sqrt(16*16-25)},{tip:'hedef',ad:'Hedef ağı · 20 m',bx:0,D:20}];
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// Ağdaki deliği bul. tam: top deliğin içinden geçer; halka: top halkaya değer.
function delikBul(x,y,R){var en=null;DELIKLER.forEach(function(h,i){var d=Math.hypot(x-h.x,y-h.y);if(d+R<=h.r)en={i:i,tam:true,h:h,d:d};else if(!en&&d<h.r+R)en={i:i,tam:false,h:h,d:d};});return en;}
function hesapla(girdi){
 var pos=girdi.pos,aim=girdi.aim,rng=mulberry(girdi.seed|0),R=A.kale.topYaricap,yari=A.kale.genislik/2,H=A.kale.yukseklik,Dz=pos.D,dt=1/120;
 function gauss(){var u=Math.max(rng(),1e-9),v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
 var zamanVar=typeof girdi.zaman==='number',hata=zamanVar?girdi.zaman-.5:0,bant=D.zamanBandi(aim,girdi.guc),bandaGirdi=zamanVar&&Math.abs(hata)<=bant;
 var quality=Math.exp(-Math.pow(hata/(.18*bant/A.zaman.bant),2));
 var flight=D.ucus.energyLaunch(pos,aim,girdi.contact||{x:0,y:0},hata*D.koseBandi(aim)/bant,quality,gauss,girdi.guc,true);
 var orn=flight.yol,son=orn[orn.length-1],gecis={x:son.x,y:son.y},sonuc,delik=null;
 // Top ağa, merkezi ağdan bir yarıçap öndeyken değer: o anı bul (deliğe göre ölçüm de orada).
 var ic=-1;for(var q=1;q<orn.length;q++)if(orn[q].z>=Dz-R){ic=q;break;}
 if(ic>0){var o1=orn[ic-1],o2=orn[ic],u=(Dz-R-o1.z)/Math.max(1e-9,o2.z-o1.z);gecis={x:o1.x+(o2.x-o1.x)*u,y:o1.y+(o2.y-o1.y)*u};}
 if(!flight.reached)sonuc='kisa';
 else if(Math.abs(gecis.x)>yari+A.kale.direk/2+R||gecis.y>H+A.kale.direk/2+R)sonuc='aut';
 else if(Math.abs(gecis.x)>yari-R||gecis.y>H-R)sonuc='direk_disari';
 else{var b=delikBul(gecis.x,gecis.y,R);if(b&&b.tam){sonuc='delik';delik=b;}else if(b){sonuc='halka';delik=b;}else sonuc='ag';}
 if(ic>0&&(sonuc==='ag'||sonuc==='halka'||sonuc==='direk_disari'))orn=orn.slice(0,ic+1);
 var e=orn[orn.length-1],e0=orn[Math.max(0,orn.length-2)],gap=Math.max(e.t-e0.t,1e-6),v={x:(e.x-e0.x)/gap,y:(e.y-e0.y)/gap,z:(e.z-e0.z)/gap};
 var hiz=Math.hypot(v.x,v.y,v.z);
 if(sonuc==='ag'||sonuc==='halka'||sonuc==='direk_disari'){
  // Gergin ağ: hızlı top geri seker, yavaş top enerjisini bırakıp önüne düşer.
  var geri=hiz<9?.04:Math.min(.38,.18+.015*(hiz-9));v={x:v.x*.35,y:v.y*.30,z:-Math.abs(v.z)*geri};
  if(sonuc==='halka'){var dx=gecis.x-delik.h.x,dy=gecis.y-delik.h.y,l=Math.hypot(dx,dy)||1;v.x+=dx/l*1.6;v.y+=dy/l*1.2;}
  if(sonuc==='direk_disari'){v.z=-Math.abs(e.z-e0.z)/gap*.45;v.x*=1.5;}
 }
 var p={x:e.x,y:e.y,z:e.z},tt=e.t,sonra=[],fileT=null,damp=0,kalan=sonuc==='kisa'?.9:1.5;
 for(var j=1;j<=Math.round(kalan/dt);j++){
  var aero=D.ucus.acceleration([v.x,v.y,v.z],flight.spin,tt+j*dt);v.x+=aero[0]*dt;v.y+=aero[1]*dt;v.z+=aero[2]*dt;
  if(damp){var f=Math.exp(-damp*dt);v.x*=f;v.z*=f;}
  var prev={x:p.x,y:p.y,z:p.z};p.x+=v.x*dt;p.y+=v.y*dt;p.z+=v.z*dt;
  if(sonuc==='delik'&&D.fizik.fileTemasi(prev,p,v,Dz,true)){damp=5;if(fileT===null)fileT=tt+j*dt;}   // delikten geçen top arkadaki kale filesine düşer
  if(sonuc!=='delik'&&sonuc!=='aut'&&sonuc!=='kisa'&&p.z>Dz-R){p.z=Dz-R;if(v.z>0)v.z=-v.z*.2;}       // hedef ağının önünde kalır
  if(p.y<R){p.y=R;if(Math.abs(v.y)>.8){v.y=-v.y*.4;v.x*=.85;v.z*=.85;}else{v.y=0;var sp=Math.hypot(v.x,v.z),k=sp>0?Math.max(0,sp-1.4*dt)/sp:0;v.x*=k;v.z*=k;}}   // sekme kaybı; yerde yuvarlanma sürtünmesi ~1,4 m/sn²
  sonra.push({t:tt+j*dt,x:p.x,y:p.y,z:p.z});
 }
 var idle={x:0,y:1,poz:'bekle',yon:0,ilerleme:0};
 return{hedef:true,quality:quality,speed:flight.speed,spin:flight.spin,spinRps:flight.spinRps,cizgiyiGecti:flight.reached,ucusYol:orn,contact:flight.contact,tuttu:false,
  sonuc:sonuc,yol:orn.concat(sonra),olayT:e.t,ucusT:flight.T,gecis:gecis,kose:false,bandaGirdi:bandaGirdi,hata:hata,direkTemas:null,direkYeri:null,baraj:null,fileT:fileT,
  delik:delik?{i:delik.i,tam:delik.tam,puan:delik.h.puan}:null,kaleci:{onKarar:false,eylem:'bekle',konum:function(){return idle;},cizimKonum:function(){return idle;}},nokta:{x:aim.x,y:aim.y}};
}
function puanla(r){if(r.sonuc!=='delik')return{puan:0,taban:0,zaman:0,zor:0,gol:false};var z=r.bandaGirdi?1:0;return{puan:r.delik.puan+z,taban:r.delik.puan,zaman:z,zor:0,gol:true};}
// Çizim: kale ağzında yarı saydam ağ; delikler boş, kenarları neon halka.
function ciz(g,izdus,Dz,vurulan){
 var yari=A.kale.genislik/2,H=A.kale.yukseklik,a=izdus(-yari,H,Dz),b=izdus(yari,H,Dz),c=izdus(yari,0,Dz),d=izdus(-yari,0,Dz);if(!a||!b||!c||!d)return;
 var halkalar=DELIKLER.map(function(h){var m=izdus(h.x,h.y,Dz),k=izdus(h.x+h.r,h.y,Dz),u=izdus(h.x,h.y+h.r,Dz);return m&&k&&u?{x:m.x,y:m.y,rx:Math.abs(k.x-m.x),ry:Math.abs(u.y-m.y)}:null;}).filter(Boolean);
 g.save();g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(c.x,c.y);g.lineTo(d.x,d.y);g.closePath();
 halkalar.forEach(function(h){g.moveTo(h.x+h.rx,h.y);g.ellipse(h.x,h.y,h.rx,h.ry,0,0,Math.PI*2);});
 g.clip('evenodd');g.fillStyle='rgba(255,255,255,.07)';g.fillRect(Math.min(a.x,d.x)-2,Math.min(a.y,b.y)-2,Math.abs(b.x-a.x)+Math.abs(c.x-d.x)+4,Math.abs(d.y-a.y)+Math.abs(c.y-b.y)+4);
 g.strokeStyle='rgba(255,255,255,.42)';g.lineWidth=Math.max(.6,Math.abs(b.x-a.x)/520);g.beginPath();
 for(var x=-yari;x<=yari+1e-6;x+=.14){var p1=izdus(x,H,Dz),p2=izdus(x,0,Dz);g.moveTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);}
 for(var y=0;y<=H+1e-6;y+=.14){var q1=izdus(-yari,y,Dz),q2=izdus(yari,y,Dz);g.moveTo(q1.x,q1.y);g.lineTo(q2.x,q2.y);}
 g.stroke();g.restore();
 g.save();halkalar.forEach(function(h,i){var vur=vurulan===i;g.strokeStyle=vur?'#ffffff':'#c8f43c';g.lineWidth=Math.max(1.5,h.rx*(vur?.20:.12));g.shadowColor=vur?'#c8f43c':'rgba(200,244,60,.6)';g.shadowBlur=vur?10:3;
  g.beginPath();g.ellipse(h.x,h.y,h.rx,h.ry,0,0,Math.PI*2);g.stroke();});g.restore();
}
D.hedef={pozisyonlar:POZ,delikler:DELIKLER,delikBul:delikBul,hesapla:hesapla,puanla:puanla,ciz:ciz};
})(typeof globalThis!=='undefined'?globalThis:window);
