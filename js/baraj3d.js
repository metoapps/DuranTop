/* Baraj oyuncuları (yalnız çizim). Çarpışma geometrisi js/baraj.js + model3d.js'te kalır; burada görünüm: dört farklı yüz (ten, saç, kaş, göz, sakal),
 * dört farklı beden (boy, gövde kalınlığı), rakip forması, eller önde kenetli, hafif sallanma, zıplayınca dizler toplanır.
 * Yüzler kodla çizilir (fotoğraf değil); aynı oyuncu her zaman aynı yüze sahiptir. */
(function(root){'use strict';var D=root.DT,K3=D.kaleci3d,doku={};
function rnd(seed){var a=seed|0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function koyu(hex,k){var v=parseInt(hex.slice(1),16);return'rgb('+[v>>16,(v>>8)&255,v&255].map(function(x){return Math.round(x*k);}).join(',')+')';}
/* Yüz dokusu: 128×158 (kare oranı .34:.42). Kenarlar ten rengiyle biter, böylece baş küresine karışır. */
function yuzDoku(gv,idx,yap){var key=idx+gv.ten+gv.sac+gv.stil;if(doku[key])return doku[key];
 var W=128,H=158,c=yap(W,H),g=c.getContext('2d'),r=rnd(idx*977+13);
 var zem=g.createLinearGradient(0,0,0,H);zem.addColorStop(0,koyu(gv.ten,1.0));zem.addColorStop(.55,koyu(gv.ten,.97));zem.addColorStop(1,koyu(gv.ten,.86));g.fillStyle=zem;g.fillRect(0,0,W,H);
 // elmacık ve çene gölgesi
 g.fillStyle='rgba(255,230,210,.10)';g.beginPath();g.ellipse(34,92,16,11,0,0,7);g.ellipse(94,92,16,11,0,0,7);g.fill();
 g.fillStyle='rgba(60,25,10,.16)';g.beginPath();g.ellipse(64,150,40,15,0,0,7);g.fill();
 // saç çizgisi
 if(gv.stil!=='dazlak'){g.fillStyle=gv.sac;g.beginPath();g.moveTo(0,0);g.lineTo(W,0);g.lineTo(W,gv.stil==='kivircik'?44:34);
  for(var x=W;x>=0;x-=8)g.lineTo(x,(gv.stil==='kivircik'?40:gv.stil==='ince'?24:30)+(r()-.5)*(gv.stil==='kivircik'?10:5));g.lineTo(0,50);g.closePath();g.fill();
  g.fillRect(0,0,9,76);g.fillRect(W-9,0,9,76);}   // favoriler
 else{g.fillStyle='rgba(30,20,15,.10)';g.fillRect(0,0,W,30);}
 // kaşlar
 g.strokeStyle=gv.stil==='dazlak'?koyu(gv.sac,1.3):gv.sac;g.lineCap='round';g.lineWidth=5.2+gv.kas*1.4;
 g.beginPath();g.moveTo(26,58);g.quadraticCurveTo(40,50,54,56);g.moveTo(74,56);g.quadraticCurveTo(88,50,102,58);g.stroke();
 // gözler
 [[40,70],[88,70]].forEach(function(e){g.fillStyle='#f3efe8';g.beginPath();g.ellipse(e[0],e[1],12,6.2,0,0,7);g.fill();
  g.fillStyle=gv.ten==='#e2b896'?'#5f7f96':'#3a2417';g.beginPath();g.arc(e[0],e[1],4.6,0,7);g.fill();g.fillStyle='#0b0908';g.beginPath();g.arc(e[0],e[1],2.2,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(e[0]-1.6,e[1]-1.6,1.1,0,7);g.fill();
  g.strokeStyle='rgba(30,15,8,.85)';g.lineWidth=2;g.beginPath();g.ellipse(e[0],e[1],12,6.2,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
  g.strokeStyle='rgba(70,35,20,.35)';g.lineWidth=1.6;g.beginPath();g.ellipse(e[0],e[1]+1,13,8,0,Math.PI*.15,Math.PI*.85);g.stroke();});
 // burun
 g.strokeStyle='rgba(80,40,22,.38)';g.lineWidth=2.4;g.beginPath();g.moveTo(60,76);g.quadraticCurveTo(55,96,52,106);g.stroke();
 g.fillStyle='rgba(60,25,12,.40)';g.beginPath();g.ellipse(55,109,4.4,2.6,0,0,7);g.ellipse(73,109,4.4,2.6,0,0,7);g.fill();
 g.fillStyle='rgba(255,235,220,.16)';g.beginPath();g.ellipse(66,96,4,14,0,0,7);g.fill();
 // sakal / çıkık gölgesi
 if(gv.sakal>0){g.fillStyle='rgba(20,12,8,'+(.10+.22*gv.sakal).toFixed(2)+')';g.beginPath();g.moveTo(12,98);g.quadraticCurveTo(64,128,116,98);g.lineTo(122,152);g.lineTo(6,152);g.closePath();g.fill();
  for(var i=0;i<260;i++){g.fillStyle='rgba(15,10,6,'+(.18*gv.sakal).toFixed(2)+')';g.fillRect(14+r()*100,100+r()*50,1.3,1.3);}
  if(gv.sakal>.6){g.fillStyle=gv.sac;g.beginPath();g.ellipse(64,122,24,9,0,0,7);g.fill();}}   // bıyık
 // ağız
 g.strokeStyle='rgba(95,35,28,.9)';g.lineWidth=3;g.beginPath();g.moveTo(46,128);g.quadraticCurveTo(64,134,82,128);g.stroke();
 g.fillStyle='rgba(165,75,65,.55)';g.beginPath();g.ellipse(64,133,13,3.2,0,0,Math.PI);g.fill();
 // kenarları ten rengine yumuşat
 var ed=g.createRadialGradient(64,80,40,64,80,82);ed.addColorStop(0,'rgba(0,0,0,0)');ed.addColorStop(1,'rgba(0,0,0,.20)');g.fillStyle=ed;g.fillRect(0,0,W,H);
 // oval maske: köşeler saydam, baş küresine karışır (kare yüz görünmesin)
 g.globalCompositeOperation='destination-in';var mk=g.createRadialGradient(64,82,38,64,82,66);mk.addColorStop(0,'rgba(0,0,0,1)');mk.addColorStop(.78,'rgba(0,0,0,1)');mk.addColorStop(1,'rgba(0,0,0,0)');
 g.save();g.translate(64,82);g.scale(1,1.22);g.translate(-64,-82);g.fillStyle=mk;g.fillRect(-40,-60,W+80,H+140);g.restore();g.globalCompositeOperation='source-over';
 doku[key]=c;return c;}
var FORMA={shirt:'#4f9fd8',shirtKoyu:'#3f86bd',shorts:'#f4f5f7',socks:'#e9edf1',boots:'#15191c',cuff:'#3f86bd'};
/* Baraj oyuncuları ayrıntılı (detay 2) çizilir ama her karede değil: her oyuncu için BİR kez (duruş sprite'ı) bir tuvale çizilir, sonra her karede tek drawImage ile konur
 * (önceden dört oyuncu ≈190 ms/kare). Zıplama sprite'ın dikey kaydırılmasıyla gösterilir, gölge ayrıca çizilir. Önbellek kamera/sahne değişince (surum) boşalır. */
var onbellek={surum:-1,s:{}};
function anahtar(p,i){return i+'|'+Math.round(p.x*100)+','+Math.round(p.z*100)+'|'+Math.round(p.boy*100);}
function uret(project,p,i,opt){
 var gv=D.baraj.GORUNUM[i%D.baraj.GORUNUM.length],s=p.boy/1.92,b=project(p.x,0,p.z);if(!b)return null;
 var ol=b.olcek||40,dpr=opt.dpr||1,w=Math.ceil(1.5*ol)+8,h=Math.ceil((p.boy+.2)*ol)+10;
 var c=opt.makeCanvas(Math.ceil(w*dpr),Math.ceil(h*dpr)),g2=c.getContext('2d');g2.scale(dpr,dpr);
 var ox=b.x-w/2,oy=b.y-(h-6),pr=function(x,y,z){var q=project(x,y,z);return q?{x:q.x-ox,y:q.y-oy,d:q.d,olcek:q.olcek}:q;};
 // Duruş: ayaklar omuz genişliği, dizler hafif kırık, eller önde kenetli (kasık koruması), bakış topa.
 var o={c:.06,h:0,sx:0,kw:0,egil:.035,bas:0,lfl:0,lfr:0,hl:[-.045,-.28,-.215],hr:[.045,-.28,-.215],el:[-.36,-.03,.0],er:[.36,-.03,.0]};
 var n=K3.kalip({x:p.x,y:1},p.z,o);
 Object.keys(n).forEach(function(k){n[k]=[p.x+(n[k][0]-p.x)*s,n[k][1]*s,p.z+(n[k][2]-p.z)*s];});
 n.hl[1]=Math.max(n.hl[1],0.05);
 var renk=Object.assign({},FORMA,{skin:gv.ten,gloves:gv.ten,hair:gv.sac,sacStil:gv.stil,elCiplak:true,kol:gv.ten,sortKisa:true,kulak:true,basOlcek:.88,detay:2,olcek:s,kalin:gv.beden,yuz:yuzDoku(gv,i,opt.makeCanvas)});
 K3.cizGovde(g2,pr,{nodes:n},renk);
 return{c:c,ox:ox,oy:oy,w:w,h:h,ol:ol,tab:{x:b.x,y:b.y}};}
function oyuncu(g,project,p,i,opt){opt=opt||{};var yap=opt.makeCanvas;if(!yap)return false;
 var sur=opt.surum||0;if(onbellek.surum!==sur)onbellek={surum:sur,s:{}};
 var key=anahtar(p,i),sp=onbellek.s[key];
 if(!sp){sp=uret(project,p,i,opt);if(!sp)return false;onbellek.s[key]=sp;}
 var t=opt.t||0,hv=Math.max(0,p.y),yer=hv>.005,dx=yer?0:Math.sin(t*1.7+i*1.9)*.7,dy=yer?0:Math.sin(t*1.3+i)*.5,yuk=hv*sp.ol;
 // gölge yerde kalır, zıplayınca küçülür ve silikleşir
 g.save();g.fillStyle='rgba(0,0,0,'+(.30*(1-Math.min(1,hv/.9))).toFixed(3)+')';g.beginPath();g.ellipse(sp.tab.x,sp.tab.y,Math.max(3,.30*sp.ol*(1-.25*Math.min(1,hv/.6))),Math.max(1.5,.075*sp.ol),0,0,Math.PI*2);g.fill();g.restore();
 g.drawImage(sp.c,sp.ox+dx,sp.oy+dy-yuk,sp.w,sp.h);
 return true;}
/* isit: pozisyon açılırken (nişan almadan önce) sprite'ları üretir; vuruş sırasında takılma olmasın. */
function isit(project,p,i,opt){opt=opt||{};if(!opt.makeCanvas)return false;var sur=opt.surum||0;if(onbellek.surum!==sur)onbellek={surum:sur,s:{}};var key=anahtar(p,i);if(onbellek.s[key])return true;var sp=uret(project,p,i,opt);if(!sp)return false;onbellek.s[key]=sp;return true;}
D.baraj3d={isit:isit,oyuncu:oyuncu,yuzDoku:yuzDoku,FORMA:FORMA,_onbellek:function(){return onbellek;}};
})(typeof globalThis!=='undefined'?globalThis:window);
