// Run: node tests/oynanis.cjs (no dependencies)
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const root = {}; vm.createContext(root);
for (const name of ['ayar', 'veri', 'kaleci', 'fizik', 'puan']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', name + '.js'), 'utf8'), root);
}
const D = root.DT;
let checked = 0;
for (const pos of D.AYAR.pozisyonlar) {
  for (const x of [-3, 0, 3]) {
    for (const y of [0.35, 1.1, 2.2]) {
      for (const seed of [1, 17, 42, 101]) {
        const input = { pos: pos, aim: { x: x, y: y }, zaman: 0.5, falso: 0, seed: seed };
        const a = D.fizik.hesapla(input), b = D.fizik.hesapla(input);
        assert.equal(JSON.stringify(a.yol), JSON.stringify(b.yol));
        assert(a.yol.every(function (p) { return Number.isFinite(p.x + p.y + p.z) && p.y >= D.AYAR.kale.topYaricap - 1e-8; }));
        checked++;
      }
    }
  }
}
for (const pos of D.AYAR.pozisyonlar.slice(3)) {
  let goals = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const r = D.fizik.hesapla({ pos: pos, aim: { x: 0, y: 2.2 }, falso: 0, zaman: 0.5, seed: seed });
    assert(!['baraj', 'aut'].includes(r.sonuc));
    if (r.sonuc === 'gol' || r.sonuc === 'direk_gol') goals++;
  }
  assert(goals > 0 && goals < 100, 'overhead mix ' + goals);
}
function rate(pos, x, y, antrenman, n) {
  let g = 0;
  for (let s = 1; s <= n; s++) {
    const r = D.fizik.hesapla({ pos: pos, aim: { x: x, y: y }, falso: 0, zaman: 0.5, seed: s, antrenman: antrenman });
    if (r.sonuc === 'gol' || r.sonuc === 'direk_gol') g++;
  }
  return g / n;
}
const pen = D.AYAR.pozisyonlar[0];
assert(rate(pen, 0, 1.1, false, 40) <= 0.1, 'official center should be saved');
assert(rate(pen, 0, 0.4, false, 40) <= 0.15, 'official low center should be saved');
assert(rate(pen, 0, 1.1, true, 40) <= 0.15, 'training center should be saved');
assert(rate(pen, 0, 0.4, true, 40) <= 0.2, 'training low center should be saved');
assert(rate(pen, 3.15, 0.4, false, 40) >= 0.55, 'official low corner should score');
assert(rate(pen, -3.15, 2.0, false, 40) >= 0.55, 'official high corner should score');
assert(rate(pen, 3.1, 0.45, true, 30) >= 0.8, 'training corner should score');
const centerPlan = D.fizik.hesapla({ pos: pen, aim: { x: 0, y: 1.1 }, zaman: 0.5, falso: 0, seed: 3, antrenman: false });
assert.equal(centerPlan.kaleci.eylem, 'bekle', 'center shot must not commit to a dive');
console.log('PASS', checked, 'trajectories; keeper keeps central shots and yields corners.');
