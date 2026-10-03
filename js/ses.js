/* Duran Top - ses. Dosya gerekmez: sesler tarayıcıda üretilir. Ses KAPALI başlar. */
(function (root) {
  'use strict';
  var DT = (root.DT = root.DT || {});
  var ctx = null, acik = false, ana = null;

  function baslat() {
    if (ctx) return true;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    ana = ctx.createGain(); ana.gain.value = 0.8; ana.connect(ctx.destination);
    return true;
  }
  function gurultu(sure) {
    var n = Math.floor(ctx.sampleRate * sure), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = b; return s;
  }
  function zarf(g, t0, a, tepe, bitis) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(a, 0.0002), t0 + tepe);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + bitis);
  }
  function gurultuSes(sure, tip, frek, q, ses, tepe) {
    var t = ctx.currentTime, s = gurultu(sure), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = tip; f.frequency.value = frek; f.Q.value = q;
    zarf(g, t, ses, tepe, sure);
    s.connect(f); f.connect(g); g.connect(ana); s.start(t); s.stop(t + sure);
  }
  function ton(tip, frek, sure, ses, bitisFrek) {
    var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tip; o.frequency.setValueAtTime(frek, t);
    if (bitisFrek) o.frequency.exponentialRampToValueAtTime(bitisFrek, t + sure);
    zarf(g, t, ses, 0.005, sure);
    o.connect(g); g.connect(ana); o.start(t); o.stop(t + sure);
  }

  // A short impact excites damped metal modes; net impact has no pitched ringing.
  function ornekUret(ad,rate,seed){rate=rate||44100;var duration=ad==='direk'?1.15:.43,n=Math.ceil(rate*duration),data=new Float32Array(n),state=seed||37;
    function noise(){state=(Math.imul(state,1664525)+1013904223)|0;return ((state>>>0)/4294967296)*2-1;}
    var modes=[[482,.23,.43],[781,.18,.31],[1193,.13,.20],[1741,.075,.14],[2637,.035,.075]],low=0,peak=0;
    for(var i=0;i<n;i++){var t=i/rate,w=noise(),v=0;
      if(ad==='direk'){
        v=w*.27*Math.exp(-t/ .009);
        modes.forEach(function(m){v+=m[1]*Math.sin(2*Math.PI*m[0]*t)*Math.exp(-t/m[2]);});
        v+=.20*Math.sin(2*Math.PI*105*t)*Math.exp(-t/.025);
      }else{
        low+=.20*(w-low);var high=w-low;
        var flutter=(.5+.5*Math.sin(2*Math.PI*31*t))*(.7+.3*Math.sin(2*Math.PI*47*t));
        v=.34*Math.sin(2*Math.PI*(110*t-38*t*t))*Math.exp(-t/.022)+.18*low*Math.exp(-t/.027);
        v+=high*.12*flutter*Math.exp(-t/.085)*(1-Math.exp(-t/.006));
        for(var j=0;j<3;j++){var start=.025+j*.028;if(t>=start)v+=low*.04*Math.exp(-(t-start)/.025);}
      }
      var attack=Math.min(1,t/.0007),release=Math.min(1,(duration-t)/.015);v*=attack*release;
      data[i]=v;peak=Math.max(peak,Math.abs(v));
    }
    if(peak>.70)for(i=0;i<n;i++)data[i]*=.70/peak;
    return data;
  }
  function darbe(ad,options){var t=ctx.currentTime,values=ornekUret(ad,ctx.sampleRate,1+Math.floor(Math.random()*100000)),buffer=ctx.createBuffer(1,values.length,ctx.sampleRate);buffer.getChannelData(0).set(values);
    var source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;gain.gain.value=Math.max(.45,Math.min(1.05,((options&&options.hiz)||24)/24));source.connect(gain);gain.connect(ana);source.start(t);
    source.onended=function(){source.disconnect();gain.disconnect();};
  }
  var sesler = {
    vurus: function () { gurultuSes(0.09, 'lowpass', 900, 0.7, 0.9, 0.004); ton('sine', 140, 0.12, 0.8, 60); },
    file: function (options) { darbe('file',options); },
    direk: function (options) { darbe('direk',options); },
    kurtaris: function () { gurultuSes(0.14, 'lowpass', 400, 0.7, 0.9, 0.004); ton('sine', 110, 0.14, 0.6, 70); },
    baraj: function () { gurultuSes(0.16, 'lowpass', 300, 0.7, 0.9, 0.004); ton('sine', 90, 0.16, 0.6, 55); },
    gol: function () { gurultuSes(1.7, 'bandpass', 780, 0.5, 0.28, 0.45); },
    ah: function () { gurultuSes(1.0, 'bandpass', 420, 0.6, 0.4, 0.3); },
    islik: function () { ton('sine', 2800, 0.45, 0.15, 3000); }
  };

  DT.ses = {
    ornekUret:ornekUret,acikMi: function () { return acik; },
    ayarla: function (v) {                       // kullanıcı dokunuşuyla çağrılmalı
      acik = !!v;
      if (acik && baslat() && ctx.state === 'suspended') ctx.resume();
    },
    cal: function (ad,options) {
      if (!acik || !ctx || !sesler[ad]) return;
      try { sesler[ad](options); } catch (e) { /* ses hatası oyunu durdurmasın */ }
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
