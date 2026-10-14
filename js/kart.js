/* Paylaşım kartı: tur sonunda skoru 1080×1350 bir görsele çizer (WhatsApp grubuna atmak için). Emoji'ye bağımlı değildir (şekillerle çizilir).
 * uret(veri, yap) → canvas;  paylas(veri, env) → Promise<'dosya'|'indir'|'metin'|'iptal'|'yok'>: önce dosya olarak paylaşır (destekleniyorsa), yoksa indirir, yoksa metin paylaşır.
 * veri: { oyuncu, mod, puan, ana, vuruslar:[{gol}], enSert, rozetler:[ad], rekor, tarih, alt } */
(function(root){'use strict';var DT=root.DT=root.DT||{};
var W=1080,H=1350;
function yuvarla(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function yildiz(g,cx,cy,R,renk){g.fillStyle=renk;g.beginPath();for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,r=i%2?R*.42:R;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}g.closePath();g.fill();}
function metin(g,t,x,y,boy,agirlik,renk,hiza,aralik){g.font=(agirlik||700)+' '+boy+"px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";g.fillStyle=renk||'#fff';g.textAlign=hiza||'center';g.textBaseline='middle';if(aralik&&g.letterSpacing!==undefined)g.letterSpacing=aralik+'px';g.fillText(t,x,y);if(aralik&&g.letterSpacing!==undefined)g.letterSpacing='0px';}
function uret(v,yap){var cv=yap(W,H),g=cv.getContext('2d');
 var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0e2a1c');gr.addColorStop(.55,'#12351f');gr.addColorStop(1,'#0a1a14');g.fillStyle=gr;g.fillRect(0,0,W,H);
 // saha çizgileri (hafif)
 g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=6;g.beginPath();g.arc(W/2,H*.62,230,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(0,H*.62);g.lineTo(W,H*.62);g.stroke();
 for(var i=0;i<8;i++){g.fillStyle=i%2?'rgba(255,255,255,.018)':'rgba(0,0,0,.05)';g.fillRect(0,i*H/8,W,H/8);}
 g.strokeStyle='rgba(255,210,90,.55)';g.lineWidth=8;yuvarla(g,28,28,W-56,H-56,36);g.stroke();
 metin(g,'DURAN TOP',W/2,118,92,800,'#ffd25a','center',10);
 // mod etiketi
 g.fillStyle='rgba(255,210,90,.18)';yuvarla(g,W/2-250,170,500,64,32);g.fill();metin(g,String(v.mod||'').toUpperCase(),W/2,203,38,700,'#ffe9a8','center',4);
 metin(g,String(v.oyuncu||'').toUpperCase(),W/2,306,78,800,'#ffffff','center',6);
 // büyük skor
 metin(g,String(v.puan),W/2,520,330,800,'#ffffff','center');metin(g,'PUAN',W/2,684,52,700,'rgba(255,255,255,.7)','center',14);
 metin(g,String(v.ana||''),W/2,770,64,700,'#9fe3b4','center',2);
 // vuruş noktaları: golde yeşil dolu daire + tik, kaçanda kırmızı çerçeve + çarpı; satır başına en çok 10
 var vs=(v.vuruslar||[]).slice(-20),sat=vs.length>10?2:1,satirdaki=Math.min(10,vs.length),boy=vs.length>10?62:78,ara=18;
 for(var k=0;k<vs.length;k++){var r=Math.floor(k/10),c=k%10,n=r===0?Math.min(10,vs.length):vs.length-10,tx=(r===0?satirdaki:n),topW=tx*boy+(tx-1)*ara,x0=W/2-topW/2+boy/2+c*(boy+ara),y0=880+r*(boy+16);
  g.lineWidth=7;if(vs[k].gol){g.fillStyle='#2ecc71';g.beginPath();g.arc(x0,y0,boy/2,0,Math.PI*2);g.fill();g.strokeStyle='#0b2b18';g.beginPath();g.moveTo(x0-boy*.2,y0);g.lineTo(x0-boy*.04,y0+boy*.17);g.lineTo(x0+boy*.22,y0-boy*.16);g.stroke();}
  else{g.strokeStyle='#e5534b';g.beginPath();g.arc(x0,y0,boy/2-3,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(x0-boy*.17,y0-boy*.17);g.lineTo(x0+boy*.17,y0+boy*.17);g.moveTo(x0+boy*.17,y0-boy*.17);g.lineTo(x0-boy*.17,y0+boy*.17);g.stroke();}}
 var yAlt=880+(sat-1)*(boy+16)+boy/2+54;
 if(v.enSert)metin(g,'En sert şut: '+v.enSert+' km/sa',W/2,yAlt,44,700,'#ffe9a8','center');
 var rz=(v.rozetler||[]).slice(0,3);if(rz.length){var yy=yAlt+(v.enSert?70:0);rz.forEach(function(ad,i2){var gen=Math.min(320,70+String(ad).length*19),xx=W/2-(rz.length*(gen+14))/2+i2*(gen+14);g.fillStyle='rgba(255,210,90,.2)';yuvarla(g,xx,yy-26,gen,52,26);g.fill();yildiz(g,xx+28,yy,15,'#ffd25a');metin(g,String(ad),xx+gen/2+14,yy,30,700,'#ffe9a8','center');});}
 if(v.rekor){g.fillStyle='#ffd25a';yuvarla(g,W/2-260,1120,520,70,35);g.fill();metin(g,'YENİ REKOR',W/2,1155,48,800,'#3a2600','center',8);}
 metin(g,String(v.alt||'Sen kaç yaparsın?'),W/2,1238,46,700,'#ffffff','center');metin(g,String(v.tarih||''),W/2,1286,30,600,'rgba(255,255,255,.6)','center');
 return cv;}
/* paylas: tuval → PNG; dosya paylaşımı destekleniyorsa dosya, değilse indirme, değilse metin */
function paylas(v,env){env=env||root;var doc=env.document,nav=env.navigator||{},yap=function(w,h){var c=doc.createElement('canvas');c.width=w;c.height=h;return c;},cv=uret(v,yap),metni=(v.oyuncu||'')+' · '+v.mod+': '+v.puan+' puan'+(v.ana?' ('+v.ana+')':'')+'\n'+(v.alt||'Sen kaç yaparsın?');
 return new Promise(function(coz){function metinPaylas(){if(typeof nav.share==='function'){nav.share({text:metni}).then(function(){coz('metin');},function(){coz('iptal');});}else if(nav.clipboard&&nav.clipboard.writeText){nav.clipboard.writeText(metni).then(function(){coz('metin');},function(){coz('yok');});}else coz('yok');}
  if(!cv.toBlob){metinPaylas();return;}
  cv.toBlob(function(blob){if(!blob){metinPaylas();return;}var dosya=null;try{dosya=new env.File([blob],'duran-top-skor.png',{type:'image/png'});}catch(e){}
   if(dosya&&typeof nav.canShare==='function'&&nav.canShare({files:[dosya]})&&typeof nav.share==='function'){nav.share({files:[dosya],text:metni}).then(function(){coz('dosya');},function(e){coz(e&&e.name==='AbortError'?'iptal':'yok');});return;}
   try{var url=(env.URL||{}).createObjectURL?env.URL.createObjectURL(blob):null;if(url&&doc.createElement){var a=doc.createElement('a');a.href=url;a.download='duran-top-skor.png';doc.body.appendChild(a);a.click();doc.body.removeChild(a);coz('indir');return;}}catch(e){}
   metinPaylas();},'image/png');});}
DT.kart={uret:uret,paylas:paylas,W:W,H:H};
})(typeof globalThis!=='undefined'?globalThis:window);
