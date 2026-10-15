// Koşarak vuruş (futbolcu3d.placement/rig): geri adım → dönüş → DURMADAN ivmelenen koşu → basma ayağı topun yanında (kalça çömelir) → vuruş koşu hızıyla → vuruştan sonra da koşmaya devam.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root={DT:{}};vm.createContext(root);for(const n of ['ayar','futbolcu3d'])vm.runInContext(fs.readFileSync(__dirname+'/../js/'+n+'.js','utf8'),root);const D=root.DT,F=D.futbolcu3d,UNIT=F.UNIT,A=D.AYAR,TB_GERI=F.TB_GERI,TB_KOS=F.TB_KOS;
const pen=A.pozisyonlar[0],fr=A.pozisyonlar.find(p=>p.tip==='frikik');
const yol=(pos,x)=>[{x:pos.bx,z:0},{x:pos.bx+x*.02,z:.1}];
const kontrol=(r)=>{for(const v of Object.values(r.nodes))assert(v.every(Number.isFinite));for(const side of ['l','r'])for(const pr of [['hip','k',72],['k','f',72],['s','e',55],['e','h',55]]){const a=r.nodes[pr[0]+side],b=r.nodes[pr[1]+side];assert(Math.abs(Math.hypot(...a.map((x,i)=>x-b[i]))-pr[2])<1e-6,'sabit kemik boyu '+pr.join());}};
function ornek(pos,c,tb,W,x){const sh={elapsed:tb*W,windup:W,contact:c||{x:0,y:0}},pl=F.placement(pos,{direction:0,shot:sh,path:yol(pos,x||1)}),rg=F.rig({direction:0,shot:sh,kick:pl.kick,gait:pl.gait,drift:pl.drift,plant:pl.plant,devam:pl.devam,cok:pl.cok});return{pl,rg};}
const dunyaAyak=(pl,rg,k)=>{const y=pl.yaw,c=Math.cos(y),s=Math.sin(y),f=rg.nodes[k],lx=f[0]*UNIT,lz=f[2]*UNIT;return[pl.point[0]+c*lx+s*lz,pl.point[1]-s*lx+c*lz];};
for(const pos of [pen,fr]){const W=A.kosuSure[pos.tip],tP=F.tbBas(W),ad=pos.tip,topX=pos.bx,mesafe=p=>Math.hypot(p[0]-topX,p[1]);
 const P=(tb)=>ornek(pos,null,tb,W).pl,hizlar=[];const dt=1/(60*W);
 // 1) Konum ve hız: ışınlanma yok; geri adım hızı makul; KOŞU BAŞLADIKTAN SONRA HIZ HİÇ DÜŞMEZ ve temasta yüksek (durmadan vuruş)
 let onc=null,maxGeri=0;for(let tb=0;tb<=1.45;tb+=dt){const pt=P(tb).point;if(onc){const v=Math.hypot(pt[0]-onc[0],pt[1]-onc[1])*60;assert(v<7,ad+': ışınlanma yok, hız '+v.toFixed(2)+' tb='+tb.toFixed(3));if(tb<=TB_GERI)maxGeri=Math.max(maxGeri,v);hizlar.push([tb,v]);}onc=pt;}
 assert(maxGeri<=4.5,ad+': geri adım hızı '+maxGeri.toFixed(2));
 const kosu=hizlar.filter(h=>h[0]>=TB_KOS+.04&&h[0]<=1.0),temas=hizlar.filter(h=>h[0]>=.985&&h[0]<=1.0).map(h=>h[1]).reduce((a,b)=>a+b)/hizlar.filter(h=>h[0]>=.985&&h[0]<=1.0).length;
 for(let i=1;i<kosu.length;i++)assert(kosu[i][1]>=kosu[i-1][1]-.06,ad+': koşu hızı temasa kadar düşmez (durmadan): tb='+kosu[i][0].toFixed(3)+' '+kosu[i-1][1].toFixed(2)+'→'+kosu[i][1].toFixed(2));
 assert(temas>=2.3,ad+': temas anında koşu hızı yüksek: '+temas.toFixed(2)+' m/sn');assert(Math.abs(P(1).hiz-temas)<.5,ad+': beyan edilen temas hızı ölçülenle tutarlı');
 for(const h of hizlar.filter(h=>h[0]>=tP-.1&&h[0]<=1.0))assert(h[1]>1.8,ad+': basmadan temasa kadar durmaz: '+h[1].toFixed(2));
 // 2) Temasta gövde topun hemen arkasında, vuruştan sonra da ilerler (yavaşlayarak, ani durma yok)
 assert(mesafe(P(1).point)<.15,ad+': temasta gövde topun arkasında '+mesafe(P(1).point).toFixed(3));
 const sonra=hizlar.filter(h=>h[0]>1.0&&h[0]<=1.45);assert(sonra[0][1]>temas*.6,ad+': vuruştan hemen sonra hız ani düşmez '+sonra[0][1].toFixed(2));for(let i=1;i<sonra.length;i++)assert(sonra[i][1]<=sonra[i-1][1]+.05,ad+': vuruş sonrası yavaşlar');
 let dr=0;for(let tb=1;tb<=1.6;tb+=.02){const pl=P(tb);const d2=Math.hypot(pl.point[0]-P(1).point[0],pl.point[1]-P(1).point[1]);assert(d2>=dr-1e-6);dr=d2;}assert(dr>.3&&dr<1.0,ad+': vuruştan sonra koşmaya devam eder '+dr.toFixed(2)+' m');
 // 3) Yön: koşarken hareket yönüne bakar, basmadan itibaren atış doğrultusuna
 const launch=Math.atan2(.02,.1);assert(Math.abs(P(tP+.01).yaw-launch)<.03&&Math.abs(P(1).yaw-launch)<.03,ad+': basmada ve vuruşta atış yönüne bakar');
 {const k=P(.6),k2=P(.61),hd=Math.atan2(k2.point[0]-k.point[0],k2.point[1]-k.point[1]),da=((k.yaw-hd)+Math.PI*3)%(2*Math.PI)-Math.PI;assert(Math.abs(da)<.5,ad+': koşarken yaklaşık hareket yönüne bakar '+da.toFixed(2));}
 // 4) Basma ayağı topun yanında dünyada SABİT (gövde üstünden geçer), yerde; vuruş ayağı temasta topta
 const w0=(()=>{const o=ornek(pos,null,tP+.02,W);return dunyaAyak(o.pl,o.rg,'fl');})();for(let tb=tP+.02;tb<=1.0;tb+=.01){const o=ornek(pos,null,tb,W),w=dunyaAyak(o.pl,o.rg,'fl');assert(Math.hypot(w[0]-w0[0],w[1]-w0[1])<.02,ad+': basma ayağı yerinde (kayma yok) tb='+tb.toFixed(3)+' '+Math.hypot(w[0]-w0[0],w[1]-w0[1]).toFixed(3));assert(o.rg.nodes.fl[1]<=9.5,ad+': basma ayağı yerde (IK erişiyor) y='+o.rg.nodes.fl[1].toFixed(1));}
 {const o=ornek(pos,null,1,W),w=dunyaAyak(o.pl,o.rg,'fr');assert(Math.hypot(w[0]-topX,w[1]-0)<.35,ad+': temasta vuruş ayağı (bilek) topun hemen arkasında, burun topa değer: '+Math.hypot(w[0]-topX,w[1]).toFixed(3));const wl=dunyaAyak(o.pl,o.rg,'fl');assert(Math.hypot(wl[0]-topX,wl[1])<.45,ad+': basma ayağı da topun yanında '+Math.hypot(wl[0]-topX,wl[1]).toFixed(2));}
 // 5) Bacaklar: ayaklar kalkar, yer altına inmez, kemik boyları sabit; bütün zaman çizelgesi boyunca sonlu
 let enYuksek=0,enAlt=99;for(let tb=0;tb<=1.45;tb+=.005){const r=ornek(pos,null,tb,W).rg;kontrol(r);if(tb>=TB_KOS&&tb<tP)for(const f of ['fl','fr']){enYuksek=Math.max(enYuksek,r.nodes[f][1]);enAlt=Math.min(enAlt,r.nodes[f][1]);}}
 assert(enYuksek>8+22,ad+': koşuda ayaklar belirgin kalkar '+enYuksek.toFixed(1));assert(enAlt>=8-1e-6,ad+': ayak yerin altına inmez '+enAlt.toFixed(2));
 // 6) Koşu → vuruş geçişinde (basma anı) ve faz sınırlarında sıçrama yok
 {const a=ornek(pos,null,tP-.0004,W).rg,b=ornek(pos,null,tP+.0004,W).rg;for(const k of ['fl','fr','kl','kr','hip','chest','neck','head','sl','sr','hl','hr','el','er']){const d=Math.hypot(...a.nodes[k].map((x,i)=>x-b.nodes[k][i]));assert(d<4,ad+': koşu→vuruş geçişinde '+k+' sıçramaz '+d.toFixed(2));}}
 for(const tb of [TB_GERI,TB_KOS]){const a2=ornek(pos,null,tb-.0005,W).rg,b2=ornek(pos,null,tb+.0005,W).rg;for(const k of ['fl','fr','hip','chest','head','hl','hr']){const d=Math.hypot(...a2.nodes[k].map((x,i)=>x-b2.nodes[k][i]));assert(d<5,ad+': faz geçişi tb='+tb+' '+k+' '+d.toFixed(2));}const p1=P(tb-.0005).point,p2=P(tb+.0005).point;assert(Math.hypot(p1[0]-p2[0],p1[1]-p2[1])<.02);}
 // 7) Çömelme: basma anında kalça alçalır, vuruşta korunur, sonra toparlanır
 {const h=(tb)=>ornek(pos,null,tb,W).rg.nodes.hip[1];assert(h(.6)>h(tP)+15&&h(1)<h(.6)-15&&h(1.45)>h(1)+15,ad+': son adımda çömelme '+[h(.6),h(tP),h(1),h(1.45)].map(v=>v.toFixed(0)).join('/'));}
 // 8) Geri adımda topdan uzaklaşır (monoton); koşuda topa yaklaşır (monoton, temasa kadar)
 let md=0;for(let tb=0;tb<=TB_GERI;tb+=.01){const m=mesafe(P(tb).point);assert(m>=md-1e-6,ad+': geri adım topdan uzaklaşır');md=m;}md=9;for(let tb=TB_KOS;tb<=1.0;tb+=.01){const m=mesafe(P(tb).point);assert(m<=md+1e-6,ad+': koşu topa yaklaşır');md=m;}
 assert(mesafe(P(TB_GERI).point)>=1.8,ad+': koşu başlangıcı topun arkasında '+mesafe(P(TB_GERI).point).toFixed(2));}
// 9) Temas tipine göre vuruş: gövde, ayak ve bacak yatışı
{const W=A.kosuSure.penalti,T=(c,tb)=>ornek(pen,c,tb,W).rg,lean=(c)=>T(c,.97).nodes.chest[2];
 assert(lean({x:0,y:.8})-lean({x:0,y:-.8})>20,'üst temas öne, alt temas geriye: '+lean({x:0,y:.8}).toFixed(1)+' / '+lean({x:0,y:-.8}).toFixed(1));
 const pitch=(c)=>T(c,1.0).ayak[1].pitch;assert(pitch({x:0,y:.8})-pitch({x:0,y:0})>.25&&pitch({x:0,y:0})-pitch({x:0,y:-.8})>.25,'ayak eğimi alt < orta < üst: '+[-.8,0,.8].map(y=>pitch({x:0,y:y}).toFixed(2)).join(' '));
 const sag=T({x:.8,y:0},1.06).nodes.fr[0],sol=T({x:-.8,y:0},1.06).nodes.fr[0];assert(Math.abs(sag-sol)>60,'falso: takipte bacak ters yönlere geçer '+sag.toFixed(0)+' / '+sol.toFixed(0));
 const yaw=(c)=>T(c,1.0).ayak[1].yaw,roll=(c)=>T(c,1.0).ayak[1].roll;assert(yaw({x:.8,y:0})*yaw({x:-.8,y:0})<0&&roll({x:.8,y:0})*roll({x:-.8,y:0})<0,'falsoda ayak ters yönlere döner/yatar');assert(Math.abs(yaw({x:0,y:0}))<1e-9&&Math.abs(roll({x:0,y:0}))<1e-9,'ortada ayak düz');
 const pl=(c)=>T(c,.93).nodes.fl;assert(Math.abs(pl({x:.8,y:0})[0])>Math.abs(pl({x:0,y:0})[0])+8,'falsoda basma ayağı daha geniş');assert(pl({x:0,y:-.8})[2]>pl({x:0,y:.8})[2]+12,'alt temasta basma ayağı geride');
 for(const c of [{x:0,y:0},{x:.8,y:.8},{x:-.8,y:-.8}])for(let tb=0;tb<=1.5;tb+=.02)kontrol(T(c,tb));}
// 10) Koşuda yana sallanma ve omuz yalpası: adımla işaret değiştirir, koşu başında sıfır, vuruşa doğru sönümlenir; baş gövdeden az sallanır
{const W=A.kosuSure.penalti,tP=F.tbBas(W),gor=[];for(let tb=TB_KOS;tb<=tP;tb+=.004){const r=ornek(pen,null,tb,W).rg;gor.push({x:r.nodes.chest[0],bas:r.nodes.head[0],sl:r.nodes.sl[1],sr:r.nodes.sr[1]});}
 const mx=Math.max(...gor.map(g=>g.x)),mn=Math.min(...gor.map(g=>g.x));assert(mx>2.5&&mn<-2.5,'gövde iki yana sallanır '+mn.toFixed(1)+'…'+mx.toFixed(1));let dgs=0;for(let i=1;i<gor.length;i++)if(gor[i].x*gor[i-1].x<0)dgs++;assert(dgs>=2,'adımla işaret değiştirir: '+dgs);
 assert(Math.abs(gor[0].x)<1,'koşu başında sallanma yok');assert(Math.max(...gor.map(g=>Math.abs(g.bas)))<Math.max(...gor.map(g=>Math.abs(g.x))),'baş gövdeden az sallanır');
 const yal=gor.map(g=>g.sl-g.sr);assert(Math.max(...yal)>6&&Math.min(...yal)<-6,'omuz yalpalar');
 const son=[];for(let tb=tP;tb<=1.0;tb+=.01)son.push(Math.abs(ornek(pen,null,tb,W).rg.nodes.chest[0]));assert(son[son.length-1]<1,'vuruşta sallanma söner');}
// 11) Süre ve oyun entegrasyonu
{assert(A.kosuSure.penalti>=1.2&&A.kosuSure.frikik>=A.kosuSure.penalti&&A.kosuSure.hedef>=1.2);const oyun=fs.readFileSync(__dirname+'/../js/oyun.js','utf8');assert(/on: \(A\.kosuSure&&A\.kosuSure\[d\.pos\.tip\]\)\|\|\.85/.test(oyun));assert(/gesture:\(d\.faz==='vurus'&&gk<d\.an\.on-\.1\)/.test(oyun),'kaleci rutini koşu boyunca');const cz=fs.readFileSync(__dirname+'/../js/cizim.js','utf8');assert(/drift:placement\.drift,plant:placement\.plant,devam:placement\.devam,cok:placement\.cok/.test(cz));}
console.log('PASS koşarak vuruş (durmadan): koşu başladıktan sonra hız temasa kadar düşmez, temasta ≥2,3 m/sn, vuruştan sonra da koşar; basma ayağı yerinde ve yerde, çömelme, süreklilik, temas tipine göre gövde-bacak-ayak yatışı, yana sallanma');
