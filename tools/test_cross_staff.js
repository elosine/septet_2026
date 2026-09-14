#!/usr/bin/env node
// test_cross_staff.js — PLAN 2i.4, the cross-staff group (NOTATION_STANDARDS §2; RUNNING_LOG §463, §521).
//   node tools/test_cross_staff.js
// A beamed cluster with members on BOTH staves of the piano's grand staff is laid out whole in the treble system: one beam above
// the treble staff, every stem up to it, the lower staff's ink moved by the staves' middle-to-middle distance (4 + 6 ss), the
// accent row on the beam side, the pair's rests on the treble staff, nothing in the bass system. A cluster on one staff (the bass
// four at 620.3) is unchanged. Runs on the MAIN notation file as built.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };

const glyphs = rd('notation/lib/glyphs.json'), C = rd('notation/registry/container.json');
const ens = rd('notation/registry/ensemble.json'), T = rd('notation/registry/techniques.json');
const ir = rd('notation/ir/piece-septet.ir.json');
const model = Layout.layoutSection(ir, glyphs, Object.assign({ m4AttackLines: false, frameParts: ens.parts.map(p => p.part), ensemble: ens, techniques: T }, C.engraving.layout));
const sys = k => model.systems.find(s => s.key === k);
const TRE = sys('2:0'), BAS = sys('2:1');
const clusterOf = new Map();
for (const ov of ir.overlays) if (ov.kind === 'engraving' && ov.value && ov.value.device && ov.value.device.clusterId) clusterOf.set(ov.target.event, ov.value.device.clusterId);
const members = cl => [...clusterOf].filter(([, c]) => c === cl).map(([ev]) => ir.events.find(e => e.id === ev)).sort((a, b) => a.onset - b.onset);
const C2C = 4 + C.engraving.layout.grandStaff.interStaffGapSs;

const CROSS = [
  { cl: 'cl-3', what: 'the pair at 581.21 (E6 → C♯3)', n: 2, rests: 2 },
  { cl: 'cl-4', what: 'the four at 623.55 (G2 · G♯5 · B1 · A♯5)', n: 4, rests: 0 },
];
for (const X of CROSS) {
  const ms = members(X.cl), ids = new Set(ms.map(e => e.id));
  ok(ms.length === X.n, X.what + ': ' + X.n + ' members in the build (got ' + ms.length + ')');
  const staves = new Set(ms.map(e => e.pitch.midi >= 60 ? 0 : 1));
  ok(staves.size === 2, X.what + ': members on both staves');
  ok(!BAS.items.some(it => ids.has(it.ev) || (it.t != null && ms.some(e => Math.abs(it.t - e.onset) < 1e-6))), X.what + ': nothing of the group in the bass system');
  const stems = TRE.items.filter(it => it.k === 'stem' && ids.has(it.ev));
  const beams = TRE.items.filter(it => it.k === 'beam' && it.tips.some(p => ms.some(e => Math.abs(p.t - e.onset) < 1e-6)));
  ok(beams.length === 2 && beams.every(b => b.dir === 'up'), X.what + ': ONE group, two beam levels, up (got ' + beams.length + ')');
  const level = beams.length ? Math.max(...beams.map(b => b.tips[0].ySs)) : NaN;
  ok(level > 2 && beams.every(b => b.tips.every(p => Math.abs(p.ySs - b.tips[0].ySs) < 1e-9)), X.what + ': the beam level and above the treble staff (' + (+level).toFixed(2) + ' ss)');
  ok(stems.length === X.n && stems.every(s => s.attach === 'up' && Math.abs(s.yB - level) < 1e-6), X.what + ': every stem up, ending on the beam');
  for (const e of ms) {
    const st = stems.find(s => s.ev === e.id), bass = e.pitch.midi < 60;
    ok(st && (bass ? st.yA < -2 - 6 + 1e-9 : st.yA > -2 - 1e-9), X.what + ': ' + e.id + ' stem starts on its ' + (bass ? 'bass' : 'treble') + ' staff (yA ' + (st && st.yA.toFixed(2)) + ')');
    const head = TRE.items.find(it => it.k === 'glyph' && /^notehead/.test(it.g) && Math.abs(it.t - e.onset) < 1e-6);
    ok(head && Math.abs(head.dxSs - glyphs.notehead.filled.wSs * 0.844 / 2) < 1e-6, X.what + ': ' + e.id + ' head left edge on its go time');
    if (bass && head) {
      const yBass = head.ySs + C2C;   // back on the bass staff's own coordinates
      ok(yBass >= -8 && yBass <= 8, X.what + ': ' + e.id + ' drawn ' + head.ySs.toFixed(2) + ' ss = ' + yBass.toFixed(2) + ' on the bass staff');
    }
  }
  const accents = TRE.items.filter(it => it.k === 'glyph' && it.g === 'artic-accent' && ms.some(e => Math.abs(it.t - e.onset) < 1e-6));
  ok(accents.length === X.n && accents.every(a => a.ySs > level && Math.abs(a.ySs - accents[0].ySs) < 1e-9), X.what + ': the accents on one row above the beam');
  ok(TRE.items.filter(it => it.k === 'gc' && ids.has(it.ev)).length === 1 && TRE.items.some(it => it.k === 'gc' && it.ev === ms[0].id), X.what + ': the GC on the first note only');
  ok(!TRE.items.some(it => it.k === 'goline' && ids.has(it.ev)), X.what + ': no go line');
  ok(TRE.items.filter(it => it.k === 'rest' && it.cluster === X.cl).length === X.rests, X.what + ': ' + X.rests + ' rests on the treble staff');
}
// one staff = as normal: the bass four at 620.3 stays in the bass system, stems down
{
  const ms = members('cl-2'), ids = new Set(ms.map(e => e.id));
  const stems = BAS.items.filter(it => it.k === 'stem' && ids.has(it.ev));
  ok(stems.length === 4 && stems.every(s => s.attach === 'down'), 'the bass four at 620.3: four stems down in the bass system, as before');
  ok(!TRE.items.some(it => ids.has(it.ev)), 'the bass four at 620.3: nothing in the treble system');
}
ok(!model.warnings.some(w => /beam group .*cl-[34]/.test(w)), 'no beam-group warnings for the two groups');

console.log((fail ? 'FAIL' : 'PASS') + ' — test_cross_staff: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
