/* Görsel kaleci (yalnız çizim). Sonucu belirleyen gövde model3d.js'tedir ve sunucuda da çalışır; bu dosya ona dokunmaz.
 * Kurallar:
 *  - Top oyundayken (vuruştan sonra) eldivenler, baş, göğüs ve omuzlar fizik gövdesiyle birebir aynı yerdedir.
 *    Dalışta yalnız üstteki bacak dizden bükülür (görsel), eldiven yeri değişmez.
 *  - Penaltı öncesi hareketler yalnız görsel zamana bağlıdır; gizli tohumu ve kalecinin seçtiği yönü bilmez.
 *    Koşu başladıktan sonra 0,55 sn içinde sönümlenir; vuruş anında fizik duruşuna döner.
 *  - Vuruş anında küçük sıçrama (split-step): yalnız kaleci henüz kımıldamamışken, tepki süresinden önce biter. */
(function(root){'use strict';var D=root.DT,M=D.model3d,yuz=null;
if(M&&M.setFace){var eski=M.setFace;M.setFace=function(im){yuz=im;eski(im);};}
function add(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]];}function sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mul(a,s){return[a[0]*s,a[1]*s,a[2]*s];}function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function len(a){return Math.hypot(a[0],a[1],a[2]);}function unit(a){var l=len(a)||1;return mul(a,1/l);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}function ease(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function lerp(a,b,u){return a+(b-a)*u;}function lerpV(a,b,u){return[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];}
var KOL=[.34,.34],BACAK=[.375,.34];
// İki kemikli ters kinematik: kemik boyları sabit, dirsek/diz ipucu yönüne bükülür.
function ik(bas,hedef,L,ipucu){var d=sub(hedef,bas),m=len(d),ax=m<1e-8?[0,-1,0]:mul(d,1/m);
 var r=clamp(m,.03,L[0]+L[1]-1e-4),along=(L[0]*L[0]-L[1]*L[1]+r*r)/(2*r),bend=Math.sqrt(Math.max(0,L[0]*L[0]-along*along));
 var h=sub(ipucu,bas),perp=sub(h,mul(ax,dot(h,ax)));if(len(perp)<1e-7)perp=cross(ax,Math.abs(ax[1])>.9?[1,0,0]:[0,1,0]);
 return{orta:add(bas,add(mul(ax,along),mul(unit(perp),bend))),uc:add(bas,mul(ax,r))};}

/* ---------- penaltı öncesi oyunbozan hareketler ----------
 * Her biri yerel kalıp: c çömelme, h sıçrama, sx yana kayma, kw diz sallama, el hedefleri (gövdeye göre), ayak kaldırma. */
var HAZIR={c:.07,h:0,sx:0,kw:0,egil:0,hl:[-.32,.02,-.30],hr:[.32,.02,-.30],el:[-.50,.12,-.05],er:[.50,.12,-.05],lfl:0,lfr:0,bas:0};
function kopya(o){return JSON.parse(JSON.stringify(o));}
function karis(a,b,u){var o={};for(var k in a){o[k]=Array.isArray(a[k])?lerpV(a[k],b[k],u):lerp(a[k],b[k],u);}return o;}
var RUTIN={
 // Kollar iki yana açık, parmak uçlarında yaylanma, yavaş kanat çırpma (kaleyi büyük göstermek).
 kollarAcik:function(s,t){var o=kopya(HAZIR);o.c=.05;o.h=.025*Math.abs(Math.sin(t*6));var f=.07*Math.sin(t*2.6);
  o.hl=[-.76,.40+f,-.10];o.hr=[.76,.40-f,-.10];o.el=[-.6,.5,.2];o.er=[.6,.5,.2];return o;},
 // Çizgi üzerinde yan adımlar: ayaklar sırayla kalkar, gövde ortaya döner.
 yanAdim:function(s,t){var o=kopya(HAZIR),w=Math.sin(Math.PI*2*s);o.sx=.24*w;o.c=.10;var adim=Math.cos(Math.PI*2*s*2);
  o.lfl=.07*Math.max(0,adim);o.lfr=.07*Math.max(0,-adim);o.hl=[-.46,.08,-.22];o.hr=[.46,.08,-.22];return o;},
 // Üst direğe uzanma zıplaması: çömel, iki kolla yukarı sıçra, yumuşak iniş.
 direkZipla:function(s,t){var o=kopya(HAZIR),hz=clamp((s-.32)/.26,0,1),hava=Math.sin(Math.PI*hz);
  var on=ease((s-.14)/.18)*(1-ease((s-.32)/.06)),inis=ease((s-.58)/.06)*(1-ease((s-.70)/.15));o.c=.07+.13*on+.11*inis;o.h=.36*hava;
  var kol=ease((s-.22)/.14)*(1-ease((s-.66)/.14));o.hl=lerpV(HAZIR.hl,[-.16,1.02,-.02],kol);o.hr=lerpV(HAZIR.hr,[.16,1.02,-.02],kol);
  o.el=lerpV(HAZIR.el,[-.30,.70,.1],kol);o.er=lerpV(HAZIR.er,[.30,.70,.1],kol);return o;},
 // Eldivenleri çırpıp bir köşeyi göstermek (blöf). Gösterilen köşe zamandan gelir, kalecinin kararıyla ilgisi yok.
 isaret:function(s,t,yan){var o=kopya(HAZIR),cirp=1-ease((s-.30)/.10),acik=.05+.05*Math.abs(Math.sin(t*9));
  o.hl=lerpV(HAZIR.hl,[-acik,.22,-.38],cirp);o.hr=lerpV(HAZIR.hr,[acik,.22,-.38],cirp);
  var g=ease((s-.36)/.12)*(1-ease((s-.82)/.12)),uc=[yan*.70,.62,-.22],dir=[yan*.45,.55,0],bel=[-yan*.24,-.12,-.12];
  if(yan>0){o.hr=lerpV(o.hr,uc,g);o.er=lerpV(o.er,dir,g);o.hl=lerpV(o.hl,bel,g);}else{o.hl=lerpV(o.hl,uc,g);o.el=lerpV(o.el,dir,g);o.hr=lerpV(o.hr,bel,g);}
  o.bas=yan*.25*g;return o;},
 // "Spagetti bacak": dizler içe-dışa sallanır, kollar gevşek savrulur.
 dizSalla:function(s,t){var o=kopya(HAZIR);o.c=.11;o.kw=.075*Math.sin(t*13);var sv=.09*Math.sin(t*7);
  o.hl=[-.42+sv,-.06,-.18];o.hr=[.42+sv,-.06,-.18];o.el=[-.55,0,.1];o.er=[.55,0,.1];o.bas=.05*Math.sin(t*3);return o;},
 // Eller dizlerde öne eğilip bekleme, sonra doğrulma.
 egil:function(s,t){var o=kopya(HAZIR);var e=ease((s-.08)/.2)*(1-ease((s-.75)/.2));o.c=.07+.13*e;o.egil=.16*e;
  o.hl=lerpV(HAZIR.hl,[-.18,-.40,-.22],e);o.hr=lerpV(HAZIR.hr,[.18,-.40,-.22],e);o.el=lerpV(HAZIR.el,[-.45,-.05,.05],e);o.er=lerpV(HAZIR.er,[.45,-.05,.05],e);return o;},
 // Frikik: barajı yönetme, kolla baraj tarafını gösterip bağırma.
 barajYonet:function(s,t,yan){var o=kopya(HAZIR),g=ease((s-.1)/.15)*(1-ease((s-.7)/.15)),dalga=.05*Math.sin(t*8)*g;
  var uc=[yan*.66,.48+dalga,-.30];if(yan>0){o.hr=lerpV(o.hr,uc,g);o.er=lerpV(o.er,[yan*.4,.5,.05],g);}else{o.hl=lerpV(o.hl,uc,g);o.el=lerpV(o.el,[yan*.4,.5,.05],g);}
  o.bas=yan*.35*g;o.c=.05;return o;}
};
var PENALTI=['kollarAcik','yanAdim','direkZipla','isaret','dizSalla','egil'],SURE=2.9;
function karisim(n){var x=(n*2654435761)>>>0;x^=x>>>13;x=(x*1274126177)>>>0;return x;}
// Her altı bölümde her rutin bir kez (karışık sıra); blok sınırında aynı rutin art arda gelmez.
function sira(blok,L){var s=L.map(function(_,i){return i;}).sort(function(a,b){return karisim(blok*31+a)-karisim(blok*31+b);});return s;}
function rutinAdi(liste,n){var L=liste.length,blok=Math.floor(n/L),i=n%L,s=sira(blok,liste);
 if(blok>0){var once=sira(blok-1,liste)[L-1];if(s[0]===once){var t=s[0];s[0]=s[1];s[1]=t;}}return liste[s[i]];}
// Zaman → kalıp. Rutinler HAZIR'dan başlar ve HAZIR'a döner; aradaki geçiş kesintisizdir.
function onHareket(t,tip,barajYan){
 if(!(t>=0))return kopya(HAZIR);
 var liste=tip==='frikik'?null:PENALTI,n=Math.floor(t/SURE),s=(t-n*SURE)/SURE,zarf=ease(s/.14)*(1-ease((s-.86)/.14));
 if(tip==='frikik'){if(n%2===0)return kopya(HAZIR);return karis(HAZIR,RUTIN.barajYonet(s,t,barajYan||1),zarf);}
 var ad=rutinAdi(liste,n),yan=karisim(n*7+3)%2?1:-1;return karis(HAZIR,RUTIN[ad](s,t,yan),zarf);
}

/* ---------- görsel iskelet ---------- */
function kalip(k,z,o){
 var bx=k.x+o.sx,by=k.y+o.h-o.c,P=function(x,y,d){return[bx+x,by+y,z+(d||0)];};
 var n={hip:P(0,-.22,0),chest:P(0,.33,-o.egil),neck:P(o.bas*.2,.55,-o.egil*1.2),head:P(o.bas*.35,.73,-o.egil*1.35),sl:P(-.24,.31,-o.egil),sr:P(.24,.31,-o.egil)};
 var zemin=k.y-.85,ayakY=Math.max(zemin,zemin+o.h)+0;
 n.fl=[k.x+o.sx-.20,ayakY+o.lfl,z-.12];n.fr=[k.x+o.sx+.20,ayakY+o.lfr,z-.12];
 if(o.h<=0){n.fl[1]=zemin+o.lfl;n.fr[1]=zemin+o.lfr;}
 [['fl',-1,o.kw],['fr',1,-o.kw]].forEach(function(a){var key=a[0],yon=a[1],sal=a[2],r=ik(n.hip,n[key],BACAK,add(n.hip,[yon*(.16+sal),-.3,-.5]));n[key==='fl'?'kl':'kr']=r.orta;n[key]=r.uc;});
 [['sl','hl','el'],['sr','hr','er']].forEach(function(a){var s=n[a[0]],h=o[a[1]],e=o[a[2]],hedef=P(h[0],h[1],h[2]),ip=P(e[0],e[1],e[2]),r=ik(s,hedef,KOL,ip);n[a[2]]=r.orta;n[a[1]]=r.uc;});
 return n;
}
function iskelet(k,z,opt){
 opt=opt||{};var fiz=M.rig(Object.assign({},k,{eskiKol:false,gesture:undefined}),z),n=fiz.nodes;
 var dal=k.poz==='dal',kimildadi=dal||(k.recovery>0)||(k.ilerleme>0)||k.saved||k.block>0||k.low||k.high;
 if(dal&&!(k.recovery>0)){
  // Havada: üstteki bacak dizden bükülür, alttaki uzanır. Eldiven, baş ve gövde fizik yerinde kalır.
  var ust=n.fl[1]>n.fr[1]?'l':'r',kalca=n.hip,ayak=n['f'+ust],eksen=sub(ayak,kalca),buk=ease(clamp((k.ilerleme||0)*2.5,0,1));
  var hedef=add(kalca,add(mul(eksen,1-.22*buk),[0,0,-.10*buk])),r=ik(kalca,hedef,BACAK,n['k'+ust]);
  n['k'+ust]=r.orta;n['f'+ust]=r.uc;
  var alt=ust==='l'?'r':'l',ea=sub(n['f'+alt],kalca),r2=ik(kalca,add(kalca,add(mul(ea,1-.05*buk),[0,0,.04*buk])),BACAK,n['k'+alt]);
  n['k'+alt]=r2.orta;n['f'+alt]=r2.uc;
 }
 // Fizik ağırlığı b: vuruştan 0,12 sn sonra 1 (tam fizik). Önce: görsel kalıp. Geçiş kesintisiz.
 var vt=Number.isFinite(k.vurusT)?k.vurusT:null,b=vt===null?(kimildadi?1:0):ease((vt+.05)/.17);
 if(b<1){
  var w=k.gesture!==undefined?clamp(k.gestureW===undefined?1:k.gestureW,0,1):0,o=karis(HAZIR,onHareket(k.gesture,opt.tip,opt.barajYan),w);
  var sic=(vt!==null&&vt>-.22&&vt<.12)?Math.sin(Math.PI*(vt+.22)/.34):0;if(sic>0){o.h+=.075*sic;o.c=Math.max(0,o.c-.03*sic);}
  var kal=kalip({x:kimildadi?0:k.x,y:1},z,o),fizN=n;n={};Object.keys(fizN).forEach(function(key){n[key]=lerpV(kal[key],fizN[key],b);});
  // Kemik boyları karışımda kısalmasın: kollar ve bacaklar yeniden çözülür.
  [['sl','el','hl',KOL],['sr','er','hr',KOL],['hip','kl','fl',BACAK],['hip','kr','fr',BACAK]].forEach(function(q){var r=ik(n[q[0]],n[q[2]],q[3],add(n[q[1]],sub(n[q[1]],lerpV(n[q[0]],n[q[2]],.5))));n[q[1]]=r.orta;n[q[2]]=r.uc;});
 }
 var kemik=fiz.bones.map(function(b){var c=b.slice();if(b[0]==='el'||b[0]==='er')c[3]='shirt';return c;});
 return{nodes:n,bones:kemik,tilt:fiz.tilt};
}

/* ---------- çizim ---------- */
var RENK={shirt:'#279258',shirtKoyu:'#1d6f43',shorts:'#152b22',socks:'#236f44',skin:'#d4a47c',hair:'#9b7545',gloves:'#f1f1ea',cuff:'#d8253a',boots:'#20292d'};
function golge(g,project,n,z){var xs=[],ymin=9;Object.keys(n).forEach(function(k){xs.push(n[k][0]);ymin=Math.min(ymin,n[k][1]);});
 var a=Math.min.apply(null,xs),b=Math.max.apply(null,xs),cx=(a+b)/2,yari=Math.max(.32,(b-a)/2+.12),yuk=clamp(ymin-.1,0,1.5),alfa=.30*(1-yuk/1.6);
 var c=project(cx,0,z),l=project(cx-yari,0,z),r=project(cx+yari,0,z),f=project(cx,0,z-.35);if(!c||!l||!r||!f)return;
 g.save();g.fillStyle='rgba(0,0,0,'+alfa.toFixed(3)+')';g.beginPath();g.ellipse(c.x,c.y,Math.abs(r.x-l.x)/2,Math.max(1.5,Math.abs(f.y-c.y)*.6),0,0,Math.PI*2);g.fill();g.restore();}
function ciz(g,project,r,renk){var ucgen=[],n=r.nodes;
 function yuzey(a,b,c,color){var nor=unit(cross(sub(b,a),sub(c,a))),isik=.58+.48*Math.abs(nor[0]*-.40+nor[1]*.62+nor[2]*-.67)-.10*Math.max(0,-nor[1]);ucgen.push({p:[a,b,c],color:ton(color,isik)});}
 function silindir(a,b,yr,color,yr2){var w=unit(sub(b,a)),u=unit(cross(w,Math.abs(w[1])>.9?[1,0,0]:[0,1,0])),v=cross(w,u),N=10,r2=yr2||yr;
  for(var i=0;i<N;i++){var t=i*2*Math.PI/N,tn=(i+1)*2*Math.PI/N,o1=add(mul(u,Math.cos(t)),mul(v,Math.sin(t))),o2=add(mul(u,Math.cos(tn)),mul(v,Math.sin(tn)));
   var aa=add(a,mul(o1,yr)),ab=add(a,mul(o2,yr)),ba=add(b,mul(o1,r2)),bb=add(b,mul(o2,r2));yuzey(aa,ba,ab,color);yuzey(ab,ba,bb,color);}
  kure(a,[yr,yr,yr],color,4,6);kure(b,[r2,r2,r2],color,4,6);}
 function kure(m,s,color,A,B){A=A||5;B=B||8;function p(la,lo){return add(m,[s[0]*Math.sin(la)*Math.cos(lo),s[1]*Math.cos(la),s[2]*Math.sin(la)*Math.sin(lo)]);}
  for(var i=0;i<A;i++)for(var j=0;j<B;j++){var a=i*Math.PI/A,b=(i+1)*Math.PI/A,c=j*2*Math.PI/B,d=(j+1)*2*Math.PI/B;yuzey(p(a,c),p(b,c),p(b,d),color);yuzey(p(a,c),p(b,d),p(a,d),color);}}
 // gövde: kalçadan göğse genişleyen forma, omuz kuşağı
 silindir(n.hip,n.chest,.21,renk.shirt,.25);silindir(n.sl,n.sr,.10,renk.shirt);silindir(n.chest,n.neck,.08,renk.skin);
 silindir(n.hip,add(n.hip,[0,-.10,0]),.22,renk.shorts);
 [['sl','el','hl'],['sr','er','hr']].forEach(function(k){silindir(n[k[0]],n[k[1]],.085,renk.shirt,.075);silindir(n[k[1]],n[k[2]],.072,renk.shirtKoyu,.065);
  var bilek=add(n[k[2]],mul(unit(sub(n[k[1]],n[k[2]])),.07));silindir(bilek,n[k[2]],.068,renk.cuff,.07);kure(n[k[2]],[.105,.08,.105],renk.gloves);});
 [['kl','fl'],['kr','fr']].forEach(function(k,i){silindir(n.hip,n[k[0]],.115,renk.shorts,.095);silindir(n[k[0]],n[k[1]],.085,renk.socks,.065);
  kure(add(n[k[1]],[0,-.02,-.06]),[.10,.065,.19],renk.boots);});
 kure(n.head,[.14,.18,.145],renk.skin);kure(add(n.head,[0,.10,.015]),[.148,.10,.15],renk.hair);
 if(yuz){var up=unit(sub(n.head,n.neck)),right=[up[1],-up[0],0];
  function v(u,w){var xx=(u-.5)*.34,yy=(.5-w)*.42,dp=-.135-.035*Math.max(0,1-Math.pow(xx/.17,2));return add(n.head,add(mul(right,xx),add(mul(up,yy),[0,0,dp])));}
  for(var row=0;row<6;row++)for(var col=0;col<4;col++){var a=col/4,b=row/6,c=(col+1)/4,d=(row+1)/6;
   ucgen.push({p:[v(a,b),v(c,b),v(c,d)],uv:[[a,b],[c,b],[c,d]],doku:yuz});ucgen.push({p:[v(a,b),v(c,d),v(a,d)],uv:[[a,b],[c,d],[a,d]],doku:yuz});}}
 ucgen.forEach(function(t){t.s=t.p.map(function(p){return project(p[0],p[1],p[2]);});t.d=t.s.every(Boolean)?(t.s[0].d+t.s[1].d+t.s[2].d)/3:-1;});
 ucgen.sort(function(a,b){return b.d-a.d;});
 ucgen.forEach(function(t){if(t.d<0)return;var s=t.s;g.beginPath();g.moveTo(s[0].x,s[0].y);g.lineTo(s[1].x,s[1].y);g.lineTo(s[2].x,s[2].y);g.closePath();
  if(t.doku){var W=t.doku.width,H=t.doku.height,u0=[t.uv[0][0]*W,t.uv[0][1]*H],u1=[t.uv[1][0]*W,t.uv[1][1]*H],u2=[t.uv[2][0]*W,t.uv[2][1]*H];
   var dx1=u1[0]-u0[0],dy1=u1[1]-u0[1],dx2=u2[0]-u0[0],dy2=u2[1]-u0[1],det=dx1*dy2-dx2*dy1;if(!det)return;
   var a=((s[1].x-s[0].x)*dy2-(s[2].x-s[0].x)*dy1)/det,c=(dx1*(s[2].x-s[0].x)-dx2*(s[1].x-s[0].x))/det,b=((s[1].y-s[0].y)*dy2-(s[2].y-s[0].y)*dy1)/det,d=(dx1*(s[2].y-s[0].y)-dx2*(s[1].y-s[0].y))/det;
   g.save();g.clip();g.transform(a,b,c,d,s[0].x-a*u0[0]-c*u0[1],s[0].y-b*u0[0]-d*u0[1]);g.drawImage(t.doku,0,0);g.restore();}
  else{g.fillStyle=t.color;g.fill();g.strokeStyle=t.color;g.lineWidth=.6;g.stroke();}});
}
function ton(hex,l){var v=parseInt(hex.slice(1),16);return'rgb('+[v>>16,(v>>8)&255,v&255].map(function(x){return Math.min(255,Math.round(x*l));}).join(',')+')';}
function kaleciCiz(g,project,k,z,opt){var r=iskelet(k,z,opt);golge(g,project,r.nodes,z);ciz(g,project,r,RENK);return r;}
D.kaleci3d={iskelet:iskelet,onHareket:onHareket,ciz:kaleciCiz,HAZIR:HAZIR,RUTIN:RUTIN,PENALTI:PENALTI,SURE:SURE};
})(typeof globalThis!=='undefined'?globalThis:window);
