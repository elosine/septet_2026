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
// the group whose first member is the piano's note at t (ids renumber with every build; the times do not)
const partOfEv = new Map(); for (const c of ir.chunks) for (const id of c.events || []) partOfEv.set(id, c.part);
const clusterAt = t => { const e = ir.events.find(x => partOfEv.get(x.id) === 2 && Math.abs(x.onset - t) < 0.002); return e ? clusterOf.get(e.id) : null; };
const C2C = 4 + C.engraving.layout.grandStaff.interStaffGapSs;

const CROSS = [
  { cl: clusterAt(581.207), what: 'the pair at 581.21 (E6 → C♯3)', n: 2, rests: 2 },
  { cl: clusterAt(623.547), what: 'the four at 623.55 (G2 · G♯5 · B1 · A♯5)', n: 4, rests: 0 },
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
  const ms = members(clusterAt(620.316)), ids = new Set(ms.map(e => e.id));
  const stems = BAS.items.filter(it => it.k === 'stem' && ids.has(it.ev));
  ok(stems.length === 4 && stems.every(s => s.attach === 'down'), 'the bass four at 620.3: four stems down in the bass system, as before');
  ok(!TRE.items.some(it => ids.has(it.ev)), 'the bass four at 620.3: nothing in the treble system');
}
ok(!model.warnings.some(w => /beam group /.test(w)), 'no beam-group warnings anywhere');

// ---- [2i.5–2i.6] --groups 444-624.1: the rule as built (RUNNING_LOG §522) ----
{
  const S3 = [...new Set(clusterOf.values())].map(cl => members(cl)).filter(ms => ms[0].onset >= 444);
  const byPart = p => S3.filter(ms => partOfEv.get(ms[0].id) === p);
  const sizes = p => byPart(p).map(ms => ms.length);
  // re-pinned 2026-09-14 after his nine note moves at 616.8-623.2 s (RUNNING_LOG §523): Fl 3 pairs · Vn1 7 + a triple · Va 6 + 2 · Vc 4 + 1
  const want = { 0: [3, 0, 0], 1: [7, 0, 0], 3: [7, 1, 0], 4: [10, 0, 0], 5: [6, 2, 0], 6: [4, 1, 0], 2: [39, 1, 22] };
  for (const p of Object.keys(want).map(Number)) {
    const s = sizes(p), got = [2, 3, 4].map(n => s.filter(x => x === n).length);
    ok(got.join() === want[p].join(), 'part ' + p + ': pairs · triples · fours = ' + want[p].join(' · ') + ' (got ' + got.join(' · ') + ')');
  }
  const pno = byPart(2).sort((a, b) => a[0].onset - b[0].onset);
  ok(pno.map(ms => ms.length).join('') === '2'.repeat(39) + '3' + '4'.repeat(22), 'the piano run: pairs from 581.21, the triple, then fours to the end');
  ok(pno.flat().length === 169 && Math.abs(pno[0][0].onset - 581.207) < 0.002 && Math.abs(pno[pno.length - 1][3].onset - 624) < 0.002, 'the piano run: all 169 notes, 581.21 → 624.00');
  ok(pno.filter(ms => ms.length === 4).every(ms => ms.slice(1).every((e, i) => e.onset - ms[i].onset < 0.25)), 'every four: every gap under 0.25 s');
  const triples = S3.filter(ms => ms.length === 3 && partOfEv.get(ms[0].id) !== 2).map(ms => partOfEv.get(ms[0].id) + '@' + ms[0].onset.toFixed(2)).sort();
  ok(triples.join() === '3@620.56,5@622.01,5@623.20,6@488.51', 'the triples outside the piano (D51\'s writing): Vn1 620.56 · Va 622.01 · Va 623.20 · Vc 488.51 (got ' + triples.join(' ') + ')');
  ok(S3.every(ms => ms.slice(1).every((e, i) => e.onset - ms[i].onset < 0.4)), 'every group: every gap under 0.4 s');
  const dyn = new Set([...ir.overlays].filter(ov => ov.kind === 'engraving' && ov.value.device && ov.value.device.clusterId && ov.value.device.dynMark).map(ov => ov.target.event));
  ok(S3.every(ms => ms.every(e => !dyn.has(e.id))), 'no dynamic written on a section-3 group (the page rule\'s, D52 · 2i.7)');
  ok(S3.every(ms => { const acc = ms.map(e => ir.overlays.find(ov => ov.kind === 'engraving' && ov.target.event === e.id).value.device.nhArtic); return acc.every(a => a === 'accent'); }), 'every head in a group keeps its accent');
}

console.log((fail ? 'FAIL' : 'PASS') + ' — test_cross_staff: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
