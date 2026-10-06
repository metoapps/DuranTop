/* Cosmetic only: two celebrations per person. No score, seed or weekly rights. */
(function(root){'use strict';var D=root.DT;
var counts={},names={latte:'Bir yudum, bir gol',lort:'Gol otele yazıldı',josh:'Bu gol minik için',fero:'Lezzet tamam, rota hazır',meto:'Bu gol tribüne'};
function smooth(a,b,t){t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);}
function blend(a,b,u){return a.map(function(x,i){return x+(b[i]-x)*u;});}
function pose(id,t){
 t=Math.max(0,Number(t)||0);if(id!=='meto')t%=5.6;var inU=smooth(0,.5,t),beat=Math.sin(t*5),p={left:[-65,155,18],right:[65,155,18],feet:[[-24,8,0],[24,8,0]],shift:0,turn:0,prop:null,propAngle:0};
 if(id==='latte'){
  var sip=smooth(.7,1.5,t)*(1-smooth(2.1,2.7,t)),cheers=smooth(2.7,3.5,t)*(1-smooth(4.7,5.5,t));
  p.right=blend([67,210,35],[-38,316,45],sip);p.right=blend(p.right,[88,300,38],cheers);
  p.left=[-72,205,25];p.prop='latte';p.propAngle=-.28*sip+.06*Math.sin(t*7)*(1-sip);p.turn=.08*Math.sin(t*1.4);
 }else if(id==='lort'){
  var ring=smooth(.35,.8,t)*(1-smooth(1.25,1.7,t)),pocket=smooth(1.6,2.1,t)*(1-smooth(2.4,2.8,t)),horon=smooth(2.6,3.1,t)*(1-smooth(5.0,5.6,t));
  p.left=[-62,203,30];p.right=blend([67,194,35],[-26,204+9*Math.sin(t*15),56],ring);
  p.right=blend(p.right,[42,156,23],pocket);p.left=blend(p.left,[-110,272,12],horon);p.right=blend(p.right,[110,272,12],horon);
  p.feet[0]=[-24-8*horon*beat,8+12*horon*Math.max(0,beat),0];p.feet[1]=[24-8*horon*beat,8+12*horon*Math.max(0,-beat),0];
  p.shift=3*horon*Math.sin(t*10);p.prop=t<1.7?'bell':t<2.7?'coin':null;p.propAngle=ring;
 }else if(id==='josh'){
  var rock=smooth(.25,.9,t)*(1-smooth(4.3,5.5,t));p.left=[-26,202,55];p.right=[30,210,55];p.prop='baby';
  p.turn=.12*rock*Math.sin(t*2.5);p.shift=2*rock*Math.cos(t*5);p.propAngle=.12*rock*Math.sin(t*2.5);
 }else if(id==='fero'){
  var taste=smooth(.3,1,t)*(1-smooth(1.6,2.3,t)),travel=smooth(2.4,3.2,t);
  p.right=blend([70,210,35],[-24,310,48],taste);p.left=blend([-70,188,25],[-75,148,18],travel);
  p.right=blend(p.right,[90,274,18],travel);p.prop=t<2.5?'food':'suitcase';p.turn=.14*travel*Math.sin(t*2);
  p.feet[1][1]=8+Math.max(0,Math.sin(t*6))*8*travel;
 }else if(id==='meto'){
  // Badge touch -> grounded, open-arm salute -> turn to the stands -> relax.
  // No prop, repetitive flapping or bobbing. Both feet stay planted.
  var badge=smooth(.20,.65,t)*(1-smooth(.95,1.45,t)),eagle=smooth(1.15,2.35,t)*(1-smooth(4.45,5.75,t));
  p.left=blend([-65,155,18],[-158,260,8],eagle);
  p.right=blend([65,155,18],[-17,237,57],badge);p.right=blend(p.right,[158,260,8],eagle);
  p.feet=[[-26,8,0],[26,8,0]];p.shift=-2*smooth(.1,.5,t)*(1-smooth(1.0,1.8,t));
  p.turn=.32*smooth(1.5,2.65,t)-.60*smooth(3.1,4.15,t)+.28*smooth(4.5,5.7,t);
  p.prop=null;
 }
 p.left=blend([-65,155,18],p.left,inU);p.right=blend([65,155,18],p.right,inU);return p;
}
function next(id){var key='dt_cosmetic_celebrations',m=counts,n=0;try{var stored=JSON.parse(root.localStorage.getItem(key)||'null');if(stored&&typeof stored==='object'&&!Array.isArray(stored))m=stored;}catch(e){}n=Number(m[id]);if(!Number.isFinite(n)||n<0)n=0;var choice=n%2===0?1:0;m[id]=(n+1)%1000000;counts=m;try{root.localStorage.setItem(key,JSON.stringify(m));}catch(e){}return choice;}
/* İkinci sevinç: kişinin kendi fotoğraf kareleri (bekle, sevinc, sevinc2-4) ile 2B hareket.
 * Kareler bükülmez ya da 3B gövdeye sarılmaz; yalnız taşınır, eğilir, hafifçe ezilir/esner. */
var KITS={meto:['#16191d','#d83243'],lort:['#1455c7','#eeeeee'],fero:['#ededed','#c74b3f'],latte:['#ba2230','#f0dfcc'],josh:['#522580','#e8bc56']};
function hash(id){var h=7;for(var i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;return h;}
function frame(id,t){
 t=Math.max(0,Number(t)||0);var loop=t>=5.6;t%=5.6;var h=hash(id||''),side=h%2?1:-1,f={key:'bekle',dx:0,lift:0,rot:0,sx:1,sy:1,alt:null};
 function arc(a,b,height){var u=(t-a)/(b-a);return height*Math.sin(Math.PI*Math.max(0,Math.min(1,u)));}
 if(!loop&&t<.55){var u=t/.55;f.dx=-side*.32*(1-smooth(0,1,u));f.lift=.025*Math.abs(Math.sin(u*Math.PI*3));f.rot=side*.06;}
 else if(t<.66){f.sy=.93;f.sx=1.04;}
 else if(t<1.36){f.key='sevinc';f.lift=arc(.66,1.36,.30);f.rot=-side*.04*Math.sin((t-.66)*9);}
 else if(t<1.50){f.key='sevinc';var q=Math.sin(Math.PI*(t-1.36)/.14);f.sy=1-.07*q;f.sx=1+.04*q;}
 else if(t<3.30){var w=(t-1.5)/.9*Math.PI*2,half=Math.floor((t-1.5)/.45);
  // Uçak koşusu: kare değişimi yalnız salınımın uç noktasında (hız sıfırken), sıçrama yok.
  f.key=(half%2===0)?'sevinc2':'sevinc4';f.dx=side*.20*Math.sin(w);f.rot=-side*.13*Math.cos(w);f.lift=.02*Math.abs(Math.sin(w*2));}
 else if(t<4.30){f.key='sevinc3';f.lift=arc(3.3,3.75,.08)+arc(3.75,4.2,.05);f.rot=side*.03;}
 else{f.key='sevinc';f.lift=arc(4.3,4.85,.17)+arc(4.85,5.3,.09);var land=Math.max(0,Math.sin(Math.PI*Math.min(1,(t-5.3)/.18)));f.sy=1-.05*land;}
 return f;
}
function confetti(g,o,t){
 var col=KITS[o.id]||KITS.meto,n=34,hgt=o.height;g.save();
 for(var i=0;i<n;i++){var a=(i*97%101)/101,b=(i*53%89)/89,speed=.35+.4*b,y=((t*speed+a)%1),x=o.x+(a-.5)*hgt*1.9+Math.sin(t*2+i)*hgt*.05;
  var py=o.y-hgt*1.25+y*hgt*1.35;g.globalAlpha=Math.min(1,(1-y)*3)*.9;g.fillStyle=i%3===0?'#f5e8ca':col[i%2];
  g.save();g.translate(x,py);g.rotate(t*4+i);g.fillRect(-hgt*.012,-hgt*.006,hgt*.024,hgt*.012);g.restore();}
 g.restore();
}
function draw(g,o){
 var get=o.sprite;if(!get)return false;
 var time=o.time;if(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)time=2.0;
 var f=frame(o.id,time),im=get(f.key)||get('sevinc')||get('bekle');if(!im)return false;
 var S=D.SPRITE||{genislik:900,yukseklik:560,ankrajX:450,ankrajY:540,boy:474},olcek=o.height/S.boy;
 var x=o.x+f.dx*o.height,y=o.y-f.lift*o.height;
 g.save();g.fillStyle='rgba(0,0,0,'+(0.28-0.5*f.lift).toFixed(3)+')';g.beginPath();g.ellipse(o.x+f.dx*o.height,o.y,o.height*(.22-.25*f.lift),o.height*.045,0,0,Math.PI*2);g.fill();g.restore();
 g.save();g.translate(x,y);g.rotate(f.rot);g.scale(olcek*f.sx,olcek*f.sy);g.drawImage(im,-S.ankrajX,-S.ankrajY,S.genislik,S.yukseklik);g.restore();
 if(!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches))confetti(g,o,time);
 g.save();g.textAlign='center';g.font='bold '+Math.max(11,Math.min(15,o.height*.055))+'px Arial';g.fillStyle='#f5e8ca';g.shadowColor='#000';g.shadowBlur=3;g.fillText(names[o.id]||'',o.x,o.y+22);g.restore();return true;
}
D.sevinc={pose:pose,frame:frame,next:next,draw:draw,names:names};
})(typeof globalThis!=='undefined'?globalThis:window);
