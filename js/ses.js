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

  var sesler = {
    vurus: function () { gurultuSes(0.09, 'lowpass', 900, 0.7, 0.9, 0.004); ton('sine', 140, 0.12, 0.8, 60); },
    file: function () { gurultuSes(0.5, 'bandpass', 1700, 0.6, 0.35, 0.05); },
    direk: function () { ton('triangle', 920, 0.9, 0.5, 870); ton('square', 1840, 0.5, 0.12, 1700); gurultuSes(0.05, 'highpass', 3000, 0.7, 0.4, 0.002); },
    kurtaris: function () { gurultuSes(0.14, 'lowpass', 400, 0.7, 0.9, 0.004); ton('sine', 110, 0.14, 0.6, 70); },
    baraj: function () { gurultuSes(0.16, 'lowpass', 300, 0.7, 0.9, 0.004); ton('sine', 90, 0.16, 0.6, 55); },
    gol: function () { gurultuSes(1.9, 'bandpass', 900, 0.5, 0.55, 0.5); ton('sine', 2900, 0.35, 0.1, 3100); },
    ah: function () { gurultuSes(1.0, 'bandpass', 420, 0.6, 0.4, 0.3); },
    islik: function () { ton('sine', 2800, 0.45, 0.15, 3000); }
  };

  DT.ses = {
    acikMi: function () { return acik; },
    ayarla: function (v) {                       // kullanıcı dokunuşuyla çağrılmalı
      acik = !!v;
      if (acik && baslat() && ctx.state === 'suspended') ctx.resume();
    },
    cal: function (ad) {
      if (!acik || !ctx || !sesler[ad]) return;
      try { sesler[ad](); } catch (e) { /* ses hatası oyunu durdurmasın */ }
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
