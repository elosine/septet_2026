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
  // [E1, §527] re-pinned: 581.21 is a single since the piano's time cuts (§526) — the first cross-staff pair with no ottava after 587.32
  { cl: clusterAt(588.762), what: 'the pair at 588.76 (E6 → G3)', n: 2, rests: 2 },
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
  // re-pinned 2026-09-14 after his 17 note moves in two rounds, 488-623 s (RUNNING_LOG §523-§524): Fl 2 pairs · Vn1 5 + a triple · Vn2 8 · Va 4 + 2 · Vc 4 + 1
  const want = { 0: [2, 0, 0], 1: [7, 0, 0], 3: [5, 1, 0], 4: [8, 0, 0], 5: [4, 2, 0], 6: [4, 1, 0], 2: [41, 1, 17] };   // [E1] --groupCuts 2@587.32,611.72 (§526)
  for (const p of Object.keys(want).map(Number)) {
    const s = sizes(p), got = [2, 3, 4].map(n => s.filter(x => x === n).length);
    ok(got.join() === want[p].join(), 'part ' + p + ': pairs · triples · fours = ' + want[p].join(' · ') + ' (got ' + got.join(' · ') + ')');
  }
  const pno = byPart(2).sort((a, b) => a[0].onset - b[0].onset);
  ok(pno.map(ms => ms.length).join('') === '2'.repeat(41) + '3' + '4'.repeat(17), 'the piano run (§526): pairs from 587.32, the triple at 611.05, then fours from 611.72 to the end');
  ok(pno.flat().length === 153 && Math.abs(pno[0][0].onset - 587.32) < 0.006 && Math.abs(pno[pno.length - 1][3].onset - 624) < 0.002, 'the piano run: 153 grouped notes, 587.32 → 624.00');
  const tri = pno.find(ms => ms.length === 3), four1 = pno.find(ms => ms.length === 4);
  ok(tri && Math.abs(tri[0].onset - 611.05) < 0.006 && four1 && Math.abs(four1[0].onset - 611.72) < 0.006, 'the piano run: the triple at 611.05 closes the pairs, the fours start at 611.72');
  const pSingles = ir.events.filter(e => e.env === 'strike' && partOfEv.get(e.id) === 2 && e.onset >= 581.2 && e.onset < 587.3);
  ok(pSingles.length === 16 && pSingles.every(e => !clusterOf.has(e.id)), 'the piano run: the 16 notes 581.21 → 586.96 are singles, no beam (his "a", §526) (got ' + pSingles.filter(e => !clusterOf.has(e.id)).length + ' of ' + pSingles.length + ')');
  ok(pno.filter(ms => ms.length === 4).every(ms => ms.slice(1).every((e, i) => e.onset - ms[i].onset < 0.25)), 'every four: every gap under 0.25 s');
  const triples = S3.filter(ms => ms.length === 3 && partOfEv.get(ms[0].id) !== 2).map(ms => partOfEv.get(ms[0].id) + '@' + ms[0].onset.toFixed(2)).sort();
  ok(triples.join() === '3@620.56,5@622.01,5@623.20,6@488.51', 'the triples outside the piano (D51\'s writing): Vn1 620.56 · Va 622.01 · Va 623.20 · Vc 488.51 (got ' + triples.join(' ') + ')');
  ok(S3.every(ms => ms.slice(1).every((e, i) => e.onset - ms[i].onset < 0.4)), 'every group: every gap under 0.4 s');
  const dyn = new Set([...ir.overlays].filter(ov => ov.kind === 'engraving' && ov.value.device && ov.value.device.clusterId && ov.value.device.dynMark).map(ov => ov.target.event));
  ok(S3.every(ms => ms.every(e => !dyn.has(e.id))), 'no dynamic written on a section-3 group (the page rule\'s, D52 · 2i.7)');
  ok(S3.every(ms => { const acc = ms.map(e => ir.overlays.find(ov => ov.kind === 'engraving' && ov.target.event === e.id).value.device.nhArtic); return acc.every(a => a === 'accent'); }), 'every head in a group keeps its accent');
}

// ---- [2i E1] the ottava on the beam side · the chain clears the group's accent (RUNNING_LOG §527) ----
{
  const OT = glyphs.standards.ottava, GAP = C.engraving.layout.stackGapSs, aH = glyphs.articulation.accent.hSs;
  const symH = glyphs.articulation.snappizz.hSs * 0.707;
  const beamOf = (S, t) => S.items.filter(it => it.k === 'beam' && it.tips.some(p => Math.abs(p.t - t) < 1e-6));
  const at = (S, pred, t) => S.items.find(it => pred(it) && Math.abs(it.t - t) < 1e-6);
  // the pair at 592.89 (C8 under 15ma → D♭3): the accents below their own notes, the 15ma past the beam by the house gap
  {
    const ms = members(clusterAt(592.887));
    const bm = beamOf(TRE, ms[0].onset), level = Math.max(...bm.map(b => b.tips[0].ySs));
    const ott = TRE.items.find(it => it.k === 'ottava' && it.ev === ms[0].id);
    ok(ott && ott.dir === 'above' && ott.ySs - OT.hookLengthSs >= level + OT.standardGapSs - 1e-6, 'the pair at 592.89: the 15ma hook clears the beam by ' + OT.standardGapSs + ' (hook ' + (ott && (ott.ySs - OT.hookLengthSs).toFixed(2)) + ', beam ' + level.toFixed(2) + ')');
    for (const e of ms) {
      const head = at(TRE, it => it.k === 'glyph' && /^notehead/.test(it.g), e.onset), acc = at(TRE, it => it.k === 'glyph' && it.g === 'artic-accent', e.onset);
      ok(head && acc && acc.ySs < head.ySs && acc.ySs < level, 'the pair at 592.89: ' + e.id + ' accent below its note (' + (acc && acc.ySs.toFixed(2)) + ' under ' + (head && head.ySs.toFixed(2)) + ')');
    }
  }
  // the pair at 602.02 (8va above · 8vb below): the 8vb, on the accent's side, stacks outside the accent
  {
    const ms = members(clusterAt(602.018)), low = ms.find(e => e.pitch.midi < 60);
    const acc = at(TRE, it => it.k === 'glyph' && it.g === 'artic-accent', low.onset), ott = TRE.items.find(it => it.k === 'ottava' && it.ev === low.id);
    ok(acc && ott && ott.dir === 'below' && ott.ySs + OT.hookLengthSs <= acc.ySs - aH / 2 - GAP + 1e-6, 'the pair at 602.02: the 8vb hook outside the low note\'s accent by the house gap (hook ' + (ott && (ott.ySs + OT.hookLengthSs).toFixed(2)) + ', accent ' + (acc && acc.ySs.toFixed(2)) + ')');
  }
  // section 3, every group: a beam-side ottava clears its beam and leaves no accent past it
  let nOtt = 0, badOtt = 0;
  for (const S of model.systems) for (const o of S.items.filter(it => it.k === 'ottava' && it.t >= 444)) {
    const bm = beamOf(S, o.t); if (!bm.length) continue;
    const up = bm[0].dir === 'up'; if ((o.dir === 'above') !== up) continue;
    nOtt++;
    const edge = up ? Math.max(...bm.map(b => b.tips[0].ySs)) : Math.min(...bm.map(b => b.tips[0].ySs));
    const hookOk = up ? o.ySs - OT.hookLengthSs >= edge + OT.standardGapSs - 1e-6 : o.ySs + OT.hookLengthSs <= edge - OT.standardGapSs + 1e-6;
    const accPast = S.items.some(it => it.k === 'glyph' && it.g === 'artic-accent' && bm[0].tips.some(p => Math.abs(p.t - it.t) < 1e-6) && (up ? it.ySs > edge : it.ySs < edge));
    if (!hookOk || accPast) badOtt++;
  }
  ok(nOtt >= 20 && badOtt === 0, 'section 3: every beam-side ottava in a group clears its beam, no accent past that beam (' + nOtt + ' ottavas, ' + badOtt + ' not)');
  // Vn2's pair at 520.32 (his screenshot): the accent nearest each note, the snap-pizz sign past it by the house gap
  const VN2 = sys(4);
  for (const t of [520.316, 520.653]) {
    const head = at(VN2, it => it.k === 'glyph' && it.g === 'notehead', t), acc = at(VN2, it => it.k === 'glyph' && it.g === 'artic-accent', t), sg = at(VN2, it => it.k === 'glyph' && it.g === 'artic-snappizz', t);
    ok(head && acc && sg && Math.abs(acc.ySs - head.ySs) < Math.abs(sg.ySs - head.ySs) && Math.abs(sg.ySs - acc.ySs) - symH / 2 - aH / 2 >= GAP - 1e-6,
      'Vn2 ' + t.toFixed(2) + ': accent nearest the note, the sign past it by ' + GAP + ' (gap ' + (acc && sg ? (Math.abs(sg.ySs - acc.ySs) - symH / 2 - aH / 2).toFixed(2) : '?') + ')');
  }
  // section 3, every column with a technique symbol and an accent on the same side: that order and that gap
  let nCol = 0, badCol = 0;
  for (const S of model.systems) {
    for (const sg of S.items.filter(it => it.k === 'glyph' && /^artic-(snappizz|plus)$/.test(it.g) && it.t >= 444)) {
      const acc = S.items.find(it => it.k === 'glyph' && it.g === 'artic-accent' && Math.abs(it.t - sg.t) < 1e-6 && Math.abs(it.dxSs - sg.dxSs) < 1e-6);
      const head = S.items.find(it => it.k === 'glyph' && /^notehead/.test(it.g) && Math.abs(it.t - sg.t) < 1e-6 && Math.abs(it.dxSs - sg.dxSs) < 1e-6);
      if (!acc || !head || Math.sign(acc.ySs - head.ySs) !== Math.sign(sg.ySs - head.ySs)) continue;
      nCol++;
      const h = glyphs.articulation[sg.g.slice(6)].hSs * 0.707;
      if (!(Math.abs(acc.ySs - head.ySs) < Math.abs(sg.ySs - head.ySs) && Math.abs(sg.ySs - acc.ySs) - h / 2 - aH / 2 >= GAP - 1e-6)) badCol++;
    }
  }
  ok(nCol >= 200 && badCol === 0, 'section 3: every technique symbol on its accent\'s side sits past the accent by the house gap (' + nCol + ' columns, ' + badCol + ' not)');
}

// ---- [§528] --max16: no written value shorter than a 16th, anywhere in the MAIN file ----
{
  ok(/ --max16( |$)/.test(ir.provenance.build), 'the recorded build carries --max16 (R keeps the rule)');
  const devs = ir.overlays.filter(ov => ov.kind === 'engraving' && ov.value && ov.value.device).map(ov => ov.value.device);
  const short = devs.filter(d => (d.noteBeams || 0) > 2 || (d.beamLevels || 0) > 2 || (d.beamSubdivision || 0) > 4);
  ok(short.length === 0, 'no 32nds: no device with more than 2 beams or a subdivision over 4 (' + short.length + ')');
  const all = model.systems.flatMap(S => S.items);
  const rest32 = all.filter(it => it.k === 'rest' && it.dur > 16), beam3 = all.filter(it => it.k === 'beam' && /-b3/.test(String(it.group)));
  ok(rest32.length === 0 && beam3.length === 0, 'no 32nds on the page: no rest shorter than a 16th, no third beam level (' + rest32.length + ' rests, ' + beam3.length + ' beams)');
  // the piano's pairs at 607.27–611.50 (his "the notes turned into 30-second notes"): 16ths
  const pn = [...new Set(clusterOf.values())].map(cl => members(cl)).filter(ms => partOfEv.get(ms[0].id) === 2 && ms[0].onset >= 607.2 && ms[0].onset < 611.6 && ms.length <= 3);
  const devOf = id => ir.overlays.find(ov => ov.kind === 'engraving' && ov.target.event === id).value.device;
  ok(pn.length === 9 && pn.every(ms => ms.every(e => devOf(e.id).noteBeams === 2 && devOf(e.id).beamSubdivision === 4)), 'the piano pairs 607.27–611.50: 9 groups, every note a 16th (' + pn.length + ' groups)');
}

console.log((fail ? 'FAIL' : 'PASS') + ' — test_cross_staff: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
