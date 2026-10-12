// Yavaş şutta kaleci (kural 10: antrenman/hedef): topu beklerken donmaz, yan adımla izler, dalışı topun varışına göre zamanlar,
// yere erken yatmaz, ışınlanmaz; yavaş penaltıda da topu izler. Hızlı şut ve kural 9 (bayraksız) değişmez.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const r={DT:{}};vm.createContext(r);for(const n of ['ayar','model3d','kaleci3d','baraj','kaleci','ucus','fizik'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),r);
const D=r.DT,P=D.AYAR.pozisyonlar;
const G=(pi,a,seed,guc,k10)=>D.fizik.hesapla({pos:P[pi],aim:{x:a[0],y:a[1]},contact:{x:0,y:0},zaman:.5,seed,guc,temasFizigi:true,enerjiFizigi:true,takipFizigi:true,yerTakibi:true,golGeometrisi:true,penaltiTahmin:true,sabitKol:true,antrenman:true,kural10:k10});
const aims=[[2.4,1.2],[-2.0,.7],[.4,1.5],[1.2,.5],[-2.6,1.6],[2.0,1.9]];
// 1) Yavaş frikik: durgunluk, ilk hareket, dalış zamanlaması, süreklilik, gol oranı
for(const guc of [.5,.55,.6]){let n=0,gol=0,enUzunDurgun=0,enGecIlk=0,enGecBitis=-9,enErkenBitis=9,maxAtlama=0,maxYuru=0,yururken=0;
 for(const pi of [5,8,9])for(const a of aims)for(let seed=1;seed<=8;seed++){const res=G(pi,a,seed,guc,true),k=res.kaleci,T=res.olayT;if(res.sonuc==='baraj'||res.sonuc==='kisa'||k.merkezHatasi)continue;n++;if(res.sonuc==='gol')gol++;
  let prev=k.konum(0),idle=0,ilk=null,dive=false,endT=null;
  for(let t=1/60;t<=T+.3;t+=1/60){const q=k.konum(t),vx=Math.abs(q.x-prev.x)*60;maxAtlama=Math.max(maxAtlama,Math.abs(q.x-prev.x));
   if(q.poz!=='dal'&&q.ilerleme<.18&&vx>maxYuru)maxYuru=vx;if(q.yuruyor)yururken++;
   if(ilk===null&&(Math.abs(q.x)>.03||q.ilerleme>.02))ilk=t;if(endT===null&&q.poz==='dal'&&q.ilerleme>=1)endT=t;
   if(vx<.1&&q.poz!=='dal'&&Math.abs(q.x-Math.max(-2.2,Math.min(2.2,k.okunanX)))>.5&&t>k.okumaT&&t<T-.05){idle+=1/60;enUzunDurgun=Math.max(enUzunDurgun,idle);}else idle=0;prev=q;}   // durgunluk = topun hattından uzakta, dalmadan, hareketsiz kalmak (hatta varınca beklemek doğal)
  if(T>1.2&&ilk!==null)enGecIlk=Math.max(enGecIlk,ilk);if(endT!==null){enGecBitis=Math.max(enGecBitis,endT-T);enErkenBitis=Math.min(enErkenBitis,endT-T);}}
 assert(n>40,'örnek sayısı '+n);assert(enUzunDurgun<=.25,'güç '+guc+': kaleci topun hattından uzakta donup beklemez, en uzun durgunluk '+enUzunDurgun.toFixed(2)+' sn');
 assert(enGecIlk<=.6,'güç '+guc+': ilk hareket vuruştan en çok 0,6 sn sonra: '+enGecIlk.toFixed(2));
 assert(enGecBitis<=.13,'güç '+guc+': dalış topun varışından en çok 0,13 sn sonra biter: '+enGecBitis.toFixed(2));assert(enErkenBitis>=-.4,'güç '+guc+': dalış topun varışından 0,4 sn'+'den fazla önce bitmez: '+enErkenBitis.toFixed(2));
 assert(maxAtlama<.13,'ışınlanma yok: kare başı '+maxAtlama.toFixed(3)+' m');assert(maxYuru<=3.1,'yürüyüş hızı ≤ 3 m/sn: '+maxYuru.toFixed(2));assert(yururken>50,'yürüme bayrağı (yan adım animasyonu) var');
 assert(gol/n<=.08,'güç '+guc+': yavaş şutta gol oranı makul (≤%8): %'+(100*gol/n).toFixed(1));}
// 1b) Çok yavaş toplarda (varış >1,8 sn) kaleci UÇMAZ: topun hattına yürür, ayakta ya da çömelerek tutar
{let n=0,dalan=0,alcak=0,alcakCome=0,kurt=0,gol=0;for(const guc of [.4,.45,.5,.55])for(const pi of [5,8,9])for(const a of aims){for(let seed=1;seed<=6;seed++){const res=G(pi,a,seed,guc,true),k=res.kaleci,T=res.olayT;if(res.sonuc==='baraj'||res.sonuc==='kisa'||k.merkezHatasi||T<1.8)continue;n++;
   let dal=false;for(let t=0;t<=T+.2;t+=.02){if(k.konum(t).poz==='dal'){dal=true;break;}}if(dal)dalan++;
   if(res.sonuc==='kurtaris')kurt++;if(res.sonuc==='gol')gol++;
   if(res.gecis.y<.6){alcak++;const q=k.konum(T);if(q.y<=.85&&q.poz!=='dal')alcakCome++;}}}
 assert(n>40,'yavaş top örneği '+n);assert(dalan/n<=.10,'çok yavaş topta kaleci uçmaz: dalan '+dalan+'/'+n);
 assert(alcak<5||alcakCome/alcak>=.8,'alçak yavaş topu çömelerek tutar: '+alcakCome+'/'+alcak);assert(kurt/n>=.85,'yavaş topu çoğunlukla tutar: %'+(100*kurt/n).toFixed(0)+' gol %'+(100*gol/n).toFixed(0));}
// 2) Yavaş penaltı: yere erken yatmaz, kalkarken top gelmez; kural 10 kapalıyken eski davranış aynı
for(const guc of [.35,.4]){let n=0,gol=0;for(const a of aims)for(let seed=1;seed<=10;seed++){const res=G(0,a,seed,guc,true),k=res.kaleci,T=res.olayT;if(res.sonuc==='baraj'||res.sonuc==='kisa')continue;n++;if(res.sonuc==='gol')gol++;
  assert(!k.onKarar,'yavaş penaltıda kaleci vuruştan önce yön seçmez, topu izler');let land=null;for(let t=0;t<T;t+=.02){const q=k.konum(t);if(q.landing){land=t;break;}}
  assert(land===null||T-land<=.4,'güç '+guc+': kaleci top gelmeden 0,4 sn'+'den fazla önce yere yatmaz: '+(land===null?'-':(T-land).toFixed(2)));const q=k.konum(T);assert(!(q.recovery>0&&q.recovery<1),'top gelirken kalkmaya çalışmaz');}
 assert(n>20&&gol/n<=.25,'güç '+guc+': yavaş penaltıda gol oranı '+(100*gol/n).toFixed(0)+'% (n='+n+')');}
{const eski=G(0,[2.4,1.2],3,.3,false);assert(eski.kaleci.onKarar,'kural 10 kapalı: eski davranış (yön önceden seçilir)');}
// 3) Hızlı penaltıda yön önceden seçilir (rules 9 davranışı korunur)
{let pen=0,penOk=0;for(const guc of [.6,1])for(const a of aims)for(let seed=1;seed<=6;seed++){const res=G(0,a,seed,guc,true);if(res.sonuc==='baraj'||res.sonuc==='kisa')continue;pen++;if(res.kaleci.onKarar===true)penOk++;}
 assert.equal(penOk,pen,'hızlı penaltıda kaleci yönü vuruştan önce seçer (rules 9 davranışı)');
}
// 4) Yan adım animasyonu: ayaklar sırayla kalkar, kemik boyları sabit, yürümezken değişiklik yok
{const K=D.kaleci3d,dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
 const durgun=K.iskelet({x:1,y:1,poz:'bekle',vurusT:2},20,{tip:'frikik'}).nodes,a0=K.iskelet({x:1,y:1,poz:'bekle',vurusT:2,yuruyor:true,adimFaz:0},20,{tip:'frikik'}).nodes,a1=K.iskelet({x:1,y:1,poz:'bekle',vurusT:2,yuruyor:true,adimFaz:.5},20,{tip:'frikik'}).nodes;
 assert(a0.fl[1]>durgun.fl[1]+.05&&a1.fr[1]>durgun.fr[1]+.05,'yürürken ayaklar sırayla kalkar');assert(a0.fl[1]>a0.fr[1]&&a1.fr[1]>a1.fl[1],'sol/sağ ayak sırayla');
 for(const n of [a0,a1]){assert(Math.abs(dist(n.hip,n.kl)-.375)<1e-6&&Math.abs(dist(n.kl,n.fl)-.34)<1e-6&&Math.abs(dist(n.hip,n.kr)-.375)<1e-6&&Math.abs(dist(n.kr,n.fr)-.34)<1e-6,'bacak boyları sabit');}
 for(const k of ['hl','hr','el','er','sl','sr','head','chest','hip'])assert(dist(a0[k],durgun[k])<1e-9,k+' fizik yerinde');}
console.log('PASS yavaş şutta kaleci: donup beklemez (durgunluk ≤0,25 sn), yan adımla izler, dalış topun varışına göre, ışınlanma yok, yavaş penaltıda yere erken yatmaz, hızlı şut ve kural 9 aynı');
