// beating_calc_check.js — the beating math's self-check (PLAN 1f; the accel calculator's pattern). `node tools/beating_calc_check.js`
// → PASS lines and a verdict. Step 1 (2026-09-07): the palette against the live recipe — the six players, the ordinary voices and
// their measured ranges, the bend limits, the pairing rule at unison and at the intervals, the just offsets. Step 2 adds the math.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const BC = require('../score/public/beating_calc.js');
const ROOT = path.resolve(__dirname, '..');
const recipe = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
let fails = 0; const ok = (cond, msg) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
const pairKeys = ps => ps.map(p => p.players.join('+'));

// ---- the players and their voices ----
const P = BC.players(recipe);
ok(sameSet(P, ['flute', 'bass_clarinet', 'violin1', 'violin2', 'viola', 'cello']), 'six bending players, the piano out (CN-34): ' + P.join(' '));
ok(P.join() === 'flute,bass_clarinet,violin1,violin2,viola,cello', 'in score order (D10)');
const voices = { flute: 'ord', bass_clarinet: 'senza_vel', violin1: 'senza_vel', violin2: 'senza_vel', viola: 'senza_vel', cello: 'senza_vel' };
ok(P.every(k => (BC.ordinaryVoice(recipe, k) || {}).key === voices[k]), 'the ordinary voices: ' + P.map(k => k + '=' + BC.ordinaryVoice(recipe, k).key).join(' '));
const ranges = { flute: [60, 96], bass_clarinet: [34, 65], violin1: [55, 101], violin2: [55, 101], viola: [48, 93], cello: [36, 83] };   // MEASURED_RANGES, 2026-09-06
ok(P.every(k => { const r = BC.ordinaryRange(recipe, k); return r && r[0] === ranges[k][0] && r[1] === ranges[k][1]; }),
   'the ordinary ranges as measured (0d): ' + P.map(k => k + ' ' + BC.ordinaryRange(recipe, k).join('–')).join(' · '));

// ---- the bend limits ----
for (const k of P) {
  const b = BC.bendLimits(recipe, k);
  ok(b.playerSt === 1 && b.samplerSt != null && near(b.limitSt, Math.min(1, b.samplerSt)) && near(b.limitCents, b.limitSt * 100),
     k + ': player ±1 st (his rule), sampler ±' + b.samplerSt + ' st' + (b.measured ? ' measured' : ' provisional') + ' → limit ±' + b.limitCents + ' c (the smaller)');
}
ok(P.every(k => BC.bendLimits(recipe, k).measured) && !P.some(k => BC.bendLimits(recipe, k).mutableByMidi),
   'every sampler range measured (the bend probe of 2026-09-07), none changeable by MIDI (RPN 0 ignored on all six)');
ok(near(BC.bendLimits(recipe, 'flute').samplerSt, 2.0, 0.02) && P.filter(k => k !== 'flute').every(k => { const s = BC.bendLimits(recipe, k).samplerSt; return s >= 0.95 && s <= 1.0; }),
   'the flute (SI2) at ±2 st, the five Xsample instruments at ±1 st (0.96–0.99 measured) — the limit on those is the sampler\'s, just under the player\'s semitone');
ok(BC.bendLimits(recipe, 'piano').playerSt === 0 && recipe.piano.beating === false, 'the piano: playerBendSt 0, beating false — never offered');
ok(!BC.holds(recipe, 'piano', 60), 'holds(): the piano holds nothing (an anchor only)');
{ // a recipe with a narrower sampler than the player: the limit follows the sampler
  const r2 = JSON.parse(JSON.stringify(recipe)); r2.flute.bendRangeSt = 0.5;
  ok(BC.bendLimits(r2, 'flute').limitSt === 0.5, 'a sampler at ±0.5 st caps the limit below the player\'s semitone');
}

// ---- holds(): the range edges and the silent keys ----
ok(BC.holds(recipe, 'cello', 36) && BC.holds(recipe, 'cello', 83) && !BC.holds(recipe, 'cello', 35) && !BC.holds(recipe, 'cello', 84), 'the cello holds 36–83 inclusive, not 35 or 84');
ok(BC.holds(recipe, 'flute', 60) && !BC.holds(recipe, 'flute', 59), 'the flute holds C4 (60), not B3 (59): the ord patch has no extension');
ok(!BC.holds(recipe, 'bass_clarinet', 66) && BC.holds(recipe, 'bass_clarinet', 65), 'the bass clarinet tops at F4 (65)');
{ const r2 = JSON.parse(JSON.stringify(recipe)); const q = r2.viola.techniques.find(t => t.key === 'senza_vel'); q.silentKeys = [70];
  ok(!BC.holds(r2, 'viola', 70) && BC.holds(r2, 'viola', 71), 'a silent key inside the range is refused'); }

// ---- the pairing rule at unison ----
const u60 = BC.pairsFor(recipe, 60, 'unison');
ok(sameSet(pairKeys(u60), ['flute+bass_clarinet', 'flute+violin1', 'flute+violin2', 'flute+viola', 'flute+cello', 'bass_clarinet+violin1', 'bass_clarinet+violin2', 'bass_clarinet+viola', 'bass_clarinet+cello', 'violin1+violin2', 'violin1+viola', 'violin1+cello', 'violin2+viola', 'violin2+cello', 'viola+cello']),
   'C4 (60) at unison: all 15 pairs — every player holds middle C');
ok(u60.every(p => p.lowerNote === 60 && p.upperNote === 60 && p.lower === p.players[0] && p.upper === p.players[1] && !p.flexible), 'at unison lower = upper note, the assignment in score order');
const u40 = BC.pairsFor(recipe, 40, 'unison');
ok(sameSet(pairKeys(u40), ['bass_clarinet+cello']), 'E2 (40) at unison: only the bass clarinet and the cello reach it');
ok(BC.pairsFor(recipe, 35, 'unison').length === 0, 'B1 (35): nobody — no pair');
const u96 = BC.pairsFor(recipe, 96, 'unison');
ok(sameSet(pairKeys(u96), ['flute+violin1', 'flute+violin2', 'violin1+violin2']), 'C7 (96) at unison: the flute and the two violins');
ok(BC.pairsFor(recipe, 97, 'unison').length === 1 && pairKeys(BC.pairsFor(recipe, 97, 'unison'))[0] === 'violin1+violin2', 'C#7 (97): the violins alone');

// ---- the intervals: the just offsets and the partials (§148) ----
const IV = BC.INTERVALS;
ok(near(IV.P5.justOffsetCents, 1.955, 1e-3) && near(IV.P4.justOffsetCents, -1.955, 1e-3) && near(IV.M3.justOffsetCents, -13.686, 1e-3) && near(IV.m3.justOffsetCents, 15.641, 1e-3) && IV.unison.justOffsetCents === 0,
   'just offsets: fifth +1.955 · fourth −1.955 · major third −13.686 · minor third +15.641 · unison 0');
ok(IV.P5.partial === 3 && IV.P4.partial === 4 && IV.M3.partial === 5 && IV.m3.partial === 6 && IV.unison.partial === 1, 'the coincident partial: 1 · 3 · 4 · 5 · 6 (unison, fifth, fourth, major third, minor third)');
ok(IV.P5.semitones === 7 && IV.P4.semitones === 5 && IV.M3.semitones === 4 && IV.m3.semitones === 3, 'the semitones: 7 · 5 · 4 · 3');
ok(BC.intervalOf('nonsense') === IV.unison && BC.intervalOf(IV.P5) === IV.P5, 'intervalOf: an unknown key falls to unison; an object passes through');

// ---- the pairing rule at an interval: each holds its own note; the assignment follows the ranges ----
const f63 = BC.pairsFor(recipe, 63, 'P5');   // D#4 + A#4 (70): the bass clarinet holds 63 (≤ 65) but not 70 → it can only be the lower
const bcl = f63.filter(p => p.players.includes('bass_clarinet'));
ok(bcl.length === 5 && bcl.every(p => p.lower === 'bass_clarinet' && p.upper !== 'bass_clarinet' && p.lowerNote === 63 && p.upperNote === 70 && !p.flexible),
   'D#4 at a fifth: the bass clarinet (top F4) can only take the lower note — 5 pairs, never flexible');
const f55 = BC.pairsFor(recipe, 55, 'P5');   // G3 + D4 (62): the flute (bottom C4) cannot hold 55 → it can only be the upper
const fl = f55.filter(p => p.players.includes('flute'));
ok(fl.length === 5 && fl.every(p => p.upper === 'flute' && p.lowerNote === 55 && p.upperNote === 62 && !p.flexible), 'G3 at a fifth: the flute (bottom C4) can only take the upper note (D4) — 5 pairs, never flexible');
const s66 = BC.pairsFor(recipe, 66, 'P4');   // F#4 + B4 (71): every string and the flute hold both → flexible, the higher-ranged takes the upper
const vv = s66.find(p => p.players.join('+') === 'viola+cello');
ok(vv && vv.flexible && vv.lower === 'cello' && vv.upper === 'viola', 'F#4 at a fourth, viola + cello: both could take either note — the viola (the higher range) takes the upper');
const fv = s66.find(p => p.players.join('+') === 'flute+violin1');
ok(fv && fv.flexible && fv.lower === 'flute' && fv.upper === 'violin1', 'F#4 at a fourth, flute + violin 1: both could — the violin (top 101 > 96) takes the upper');
ok(BC.pairsFor(recipe, 96, 'P5').length === 0, 'C7 at a fifth: the upper note G7 (103) is above every range — no pair');
ok(BC.pairsFor(recipe, 94, 'P5').length === 3 && BC.pairsFor(recipe, 94, 'P5').every(p => p.upperNote === 101 && p.upper !== 'flute'),
   'A#6 at a fifth (upper F7 = 101, the violins\' top): 3 pairs, the upper note always a violin');

// ---- the table ----
const T = BC.pairingTable(recipe, [36, 48, 60, 72, 84, 96], 'unison');
ok(Object.keys(T).length === 6 && T[36].length === 1 && T[48].length === 3 && T[60].length === 15 && T[72].length === 10 && T[84].length === 6 && T[96].length === 3,
   'the unison table over the C\'s: C2 1 pair · C3 3 · C4 15 · C5 10 · C6 6 · C7 3 (' + [36, 48, 60, 72, 84, 96].map(p => BC.noteName(p) + ' ' + T[p].length).join(' · ') + ')');
ok(BC.noteName(60) === 'C4' && BC.noteName(34) === 'A#1' && near(BC.midiHz(69), 440) && near(BC.midiHz(48), 130.8128, 1e-3), 'noteName and midiHz');
console.log('\n' + BC.describePalette(recipe).join('\n') + '\n');

// ======================= STEP 2 — the beating math (PLAN 1f item 2's checks) =======================
// the conversion: the tuba's number, the register law, the round trip, the partials
ok(near(BC.rateToCents(1, 48, 'unison'), 13.18, 0.01), '1 beat per second at C3 = ' + BC.rateToCents(1, 48, 'unison').toFixed(3) + ' c (the tuba\'s 13.19 of D28 to the rounding — the exact figure is 13.18)');
ok(near(BC.rateToCents(1, 60, 'unison'), 6.60, 0.01) && near(BC.rateToCents(1, 36, 'unison'), 26.27, 0.01), 'the register law: the same beat is 6.60 c at C4 and 26.27 c at C2 (a fixed cents doubles per octave, the log compressing a little)');
{ let worst = 0, n = 0;
  for (const r of [-8, -3, -1, -0.2, 0, 0.2, 1, 3, 8, 20]) for (const p of [36, 48, 60, 72, 96]) for (const iv of ['unison', 'm3', 'M3', 'P4', 'P5']) { worst = Math.max(worst, Math.abs(BC.centsToRate(BC.rateToCents(r, p, iv), p, iv) - r)); n++; }
  ok(worst < 1e-9, 'rate → cents → rate exact on ' + n + ' points (worst ' + worst.toExponential(1) + ')'); }
ok(near(BC.centsToRate(10, 60, 'P5') / BC.centsToRate(10, 60, 'unison'), 3) && near(BC.centsToRate(10, 60, 'P4') / BC.centsToRate(10, 60, 'unison'), 4) &&
   near(BC.centsToRate(10, 60, 'M3') / BC.centsToRate(10, 60, 'unison'), 5) && near(BC.centsToRate(10, 60, 'm3') / BC.centsToRate(10, 60, 'unison'), 6),
   'the same cents beat 3× at a fifth, 4× at a fourth, 5× at a major third, 6× at a minor third (the coincident partial)');
ok(BC.zoneOf(0.5) === 'flanger' && BC.zoneOf(1) === 'beating' && BC.zoneOf(15) === 'beating' && BC.zoneOf(15.1) === 'roughness', 'the zones: < 1 flanger · 1–15 beating · > 15 roughness');
// curves and shapes
ok(BC.evalCurve([[0, 0], [0.5, 3], [1, 0]], 0.25) === 1.5 && BC.evalCurve(2, 0.7) === 2 && BC.evalCurve([[0.2, 1], [0.8, 3]], 0) === 1 && BC.evalCurve([[0.2, 1], [0.8, 3]], 1) === 3,
   'curves: linear between the points, a number flat, the ends held beyond the first and last point');
ok(BC.shape('hump', { peak: 3 }).length === 3 && BC.shape('arc', { peak: 2 }).length === 9 && near(BC.evalCurve(BC.shape('arc', { peak: 2 }), 0.5), 2) && BC.shape('flat', { level: 1.5 })[0][1] === 1.5 && BC.shape('burst', { peak: 4 })[1][1] === 4,
   'the shapes: hump (3 points) · arc (9, the peak at the middle) · flat · burst');
{ const m = BC.mirrored(BC.shape('hump', { peak: 3 })); ok(m.lower[1][1] === -1.5 && m.upper[1][1] === 1.5, 'mirrored: half each, the lower below (−1.5 / +1.5 from a 3 hump)');
  const fp = BC.flatPartner(BC.shape('hump', { peak: 3 }), 'upper'); ok(fp.lower === 0 && fp.upper[1][1] === 3, 'a flat partner: the lower holds, the upper carries the whole 3');
  const lv = BC.levelFromBeat(BC.shape('hump', { peak: 3 }), 0.3, 0.9); ok(lv[0][1] === 0.3 && lv[1][1] === 0.9 && lv[2][1] === 0.3, 'a level curve following the beating: 0.3 → 0.9 → 0.3'); }
// a still fifth: the just offset rides on the upper player's bend, the beat line 0
{ const o = BC.renderPair({ pitch: 60, interval: 'P5', players: { lower: 'cello', upper: 'viola' }, length: 4, rate: { lower: 0, upper: 0 } }, recipe);
  ok(o.notes.upper.length === 1 && o.notes.upper[0].key === 67 && o.notes.upper[0].bend.every(b => near(b[1], 1.955, 1e-3)) && o.notes.lower[0].key === 60 && o.notes.lower[0].bend.every(b => b[1] === 0),
     'a still fifth on C4: the upper note G4 carries +1.955 c (just) throughout, the lower none');
  ok(o.maxBeat === 0 && o.zones.length === 1 && o.zones[0].zone === 'flanger' && near(o.f.upper, o.f.lower * 1.5, 0.01), '… the beat line 0 (flanger zone), the upper frequency 3/2 of the lower');
  const q = BC.renderPair({ pitch: 60, interval: 'P4', players: { lower: 'cello', upper: 'viola' }, length: 4, rate: { lower: 0, upper: 0 } }, recipe);
  const t = BC.renderPair({ pitch: 60, interval: 'M3', players: { lower: 'cello', upper: 'viola' }, length: 4, rate: { lower: 0, upper: 0 } }, recipe);
  const u = BC.renderPair({ pitch: 60, interval: 'm3', players: { lower: 'cello', upper: 'viola' }, length: 4, rate: { lower: 0, upper: 0 } }, recipe);
  ok(near(q.notes.upper[0].bend[0][1], -1.955, 1e-3) && near(t.notes.upper[0].bend[0][1], -13.686, 1e-3) && near(u.notes.upper[0].bend[0][1], 15.641, 1e-3), '… the fourth −2 c, the major third −14 c, the minor third +16 c on the upper note'); }
// mirrored humps in phase = a pulse; slid = a plateau; both moving the same way = a momentary unison
const HUMP3 = BC.shape('hump', { peak: 3 });
{ const a = BC.renderPair({ pitch: 60, interval: 'unison', players: { lower: 'cello', upper: 'viola' }, length: 6, beat: HUMP3 }, recipe);
  const mid = a.samples[Math.floor(a.samples.length / 2)];
  ok(near(a.samples[0].beat, 0, 1e-6) && near(a.maxBeat, 3, 0.02) && near(a.samples[a.samples.length - 1].beat, 0, 1e-6), 'mirrored hump in phase: a pulse 0 → ' + a.maxBeat + ' → 0 beats per second (the heard rate = the drawn peak, each player half)');
  ok(near(mid.centsL, -mid.centsU, 1e-6) && near(mid.centsU, BC.rateToCents(1.5, 60, 'unison'), 1e-3), '… the two players mirror in cents (±' + mid.centsU + ' c at the peak = 1.5 beats each)');
  ok(a.notes.lower.length === 1 && a.notes.upper.length === 1 && a.notes.lower[0].bend.length === 121 && a.notes.lower[0].bend[60][1] === mid.centsL && a.notes.upper[0].level[60][1] === 0.6,
     '… one note each, 121 bend points at 50 ms, the level 0.6 flat by default');
  const b = BC.renderPair({ pitch: 60, interval: 'unison', players: { lower: 'cello', upper: 'viola' }, length: 6, beat: HUMP3, slide: { upper: 3 } }, recipe);
  const late = b.samples.filter(q => q.t >= 3).map(q => q.beat);
  ok(near(b.maxBeat, 1.5, 0.02) && Math.max(...late) - Math.min(...late) < 0.02, 'the upper slid by half the length: a plateau — the peak halves (' + b.maxBeat + ') and from the middle on the beat holds flat');
  const c = BC.renderPair({ pitch: 60, interval: 'unison', players: { lower: 'cello', upper: 'viola' }, length: 6, rate: { lower: BC.scaleCurve(HUMP3, -0.5), upper: BC.scaleCurve(HUMP3, -0.5) }, slide: { upper: 3 } }, recipe);
  const at = t => c.samples.find(q => near(q.t, t, 1e-6)).beat;
  ok(at(3) > 1 && at(4.5) < 0.02 && at(6) > 1, 'both curves below the centre, one slid: the beat rises, dies to a momentary unison at 4.5 s (both at the same cents), rises again'); }
// the breaths: inside the ceiling, staggered, the winds' gap, seeded, continuity, a hand mark kept, the ceiling flag, continuous
{ const spec = { pitch: 60, interval: 'unison', players: { lower: 'flute', upper: 'violin1' }, length: 40, beat: BC.shape('hump', { peak: 2 }), breath: { mode: 'designated', seed: 3 } };
  const o = BC.renderPair(spec, recipe), fl = o.notes.lower, vn = o.notes.upper, cF = o.breaths.lower.ceiling, cV = o.breaths.upper.ceiling;
  ok(cF.kind === 'breath' && cF.seconds === 6.8 && cV.kind === 'bow' && cV.seconds === 10.2, 'the ceilings at level 0.6: the flute\'s breath 8 × 0.85 = 6.8 s, the violin\'s bow 12 × 0.85 = 10.2 s');
  ok(fl.length >= 5 && fl.every(n => n.endS - n.startS <= cF.seconds + 1e-6) && vn.length >= 3 && vn.every(n => n.endS - n.startS <= cV.seconds + 1e-6),
     'a 40 s designated event: the flute in ' + fl.length + ' breaths, none above ' + cF.seconds + ' s; the violin in ' + vn.length + ' bows, none above ' + cV.seconds + ' s');
  ok(fl.slice(1).every((n, i) => near(n.startS - fl[i].endS, 0.5, 1e-6)) && vn.slice(1).every((n, i) => near(n.startS - vn[i].endS, 0, 1e-6)), '… the flute re-enters after a 0.5 s gap, the violin changes bow without one');
  const m1 = o.breaths.lower.marks, m2 = o.breaths.upper.marks;
  ok(m1.length && m2.length && Math.abs(m1[0] - m2[0]) > 1.5, '… the pair staggered: the first marks at ' + m1[0] + ' s and ' + m2[0] + ' s');
  ok(fl[fl.length - 1].endS === 40 && vn[vn.length - 1].endS === 40 && fl[0].startS === 0, '… the chains run from 0 to the end');
  ok(fl.slice(1).every((n, i) => Math.abs(n.bend[0][1] - fl[i].bend[fl[i].bend.length - 1][1]) < 0.5 && Math.abs(n.level[0][1] - fl[i].level[fl[i].level.length - 1][1]) < 0.02),
     '… continuity: each breath starts within 0.5 c and 0.02 of level of where the last ended');
  ok(!o.flags.length, '… no flags (2 beats per second at C4 is ±6.6 c each; every span inside its ceiling)');
  const o2 = BC.renderPair(Object.assign({}, spec, { breath: { mode: 'designated', seed: 4 } }), recipe), o3 = BC.renderPair(spec, recipe);
  ok(JSON.stringify(o2.breaths.lower.marks) !== JSON.stringify(m1) && JSON.stringify(o3.breaths.lower.marks) === JSON.stringify(m1), 'another seed, other marks; the same seed, the same marks');
  const o4 = BC.renderPair(Object.assign({}, spec, { breath: { mode: 'designated', seed: 3, marks: { lower: [12.5] } } }), recipe);
  ok(o4.breaths.lower.marks.includes(12.5) && o4.breaths.lower.marks.length === m1.length && o4.notes.lower.some(n => n.startS === 12.5), 'a hand-placed mark at 12.5 s kept through the deal (the nearest dealt mark gives way), a breath starting there');
  const o5 = BC.renderPair({ pitch: 60, interval: 'unison', players: { lower: 'flute', upper: 'violin1' }, length: 20, beat: HUMP3, breath: { mode: 'one' } }, recipe);
  ok(o5.notes.lower.length === 1 && o5.flags.some(f => f.flag === 'ceiling' && f.player === 'flute' && f.seconds === 20) && o5.flags.some(f => f.flag === 'ceiling' && f.player === 'violin1'), 'a 20 s single breath: the flute (6.8 s) and the violin (10.2 s) both flagged past the ceiling');
  const o6 = BC.renderPair({ pitch: 60, interval: 'unison', players: { lower: 'flute', upper: 'violin1' }, length: 20, beat: HUMP3, breath: { mode: 'continuous' } }, recipe);
  ok(o6.notes.lower.length === 1 && o6.notes.lower[0].flags.includes('continuous') && !o6.flags.some(f => f.flag === 'ceiling'), 'continuous: one long note, marked for the notation ("re-breathe at will"), no ceiling flag');
  const loud = BC.renderPair(Object.assign({}, spec, { level: 0.9 }), recipe);
  ok(loud.breaths.lower.ceiling.seconds === 5.6 && loud.notes.lower.length > fl.length, 'louder (level 0.9): the flute\'s ceiling 8 × 0.7 = 5.6 s, more breaths (' + loud.notes.lower.length + ' vs ' + fl.length + ')'); }
// the stretch
{ const spec = { pitch: 60, interval: 'unison', players: { lower: 'cello', upper: 'viola' }, length: 6, beat: HUMP3, slide: { upper: 1 }, breath: { mode: 'designated', marks: { lower: [3] }, deal: false } };
  const a = BC.renderPair(spec, recipe), b = BC.renderPair(BC.stretch(spec, 12), recipe);
  ok(b.length === 12 && near(b.maxBeat, a.maxBeat, 1e-6) && b.slide.upper === 2 && b.breaths.lower.marks[0] === 6, 'stretched 6 → 12 s: the same peak, the slide scaled 1 → 2 s, the hand mark 3 → 6 s');
  const at = (o, p) => o.samples.find(q => near(q.p, p, 1e-6));
  ok([0.25, 0.5, 0.75].every(p => near(at(a, p).centsU, at(b, p).centsU, 1e-6) && near(at(a, p).beat, at(b, p).beat, 1e-6)), '… the same cents and beat at the same normalised time');
  ok(a.notes.lower.length === 2 && b.notes.lower.length === 2 && b.notes.lower[1].startS === 6 && b.notes.lower[1].endS === 12, '… the cello\'s two bows now 0–6 and 6–12');
  const c = BC.renderPair(BC.stretch({ pitch: 60, interval: 'unison', players: { lower: 'flute', upper: 'violin1' }, length: 6, beat: HUMP3, breath: { mode: 'designated', seed: 3 } }, 30), recipe);
  ok(c.notes.lower.length >= 4 && c.notes.lower.every(n => n.endS - n.startS <= 6.8 + 1e-6), '… dealt breaths re-dealt at the new length: the flute in ' + c.notes.lower.length + ' breaths over 30 s, all inside the ceiling'); }
// the flags: the player's semitone, the sampler's range (the re-key), the roughness zone; a pair out of range
{ const o = BC.renderPair({ pitch: 60, interval: 'unison', players: { lower: 'cello', upper: 'viola' }, length: 4, beat: BC.shape('flat', { level: 40 }) }, recipe);
  ok(o.flags.some(f => f.flag === 'player-limit') && o.flags.some(f => f.flag === 'sampler-range') && o.flags.some(f => f.flag === 'roughness') && o.maxBeat > 15,
     '40 beats per second at C4 (±' + o.maxCents.upper + ' c each): the player\'s semitone, the sampler\'s range (re-keyed) and the roughness zone all flagged');
  const rk = o.notes.upper.find(n => n.keyOffset === 1);
  ok(rk && rk.flags.includes('rekey') && rk.key === 60 && rk.bend.every(b => Math.abs(b[1]) <= 100) && o.notes.lower.some(n => n.keyOffset === -1),
     '… the re-keyed notes: the viola a semitone up (key 60, offset +1) with the bend re-based inside ±100 c, the cello a semitone down');
  const q = BC.renderPair({ pitch: 60, interval: 'unison', players: { lower: 'cello', upper: 'viola' }, length: 4, beat: BC.shape('flat', { level: 3 }) }, recipe);
  ok(q.flags.length === 0 && q.notes.lower[0].keyOffset === 0, '3 beats per second at C4 (±6.6 c): no flags, no re-key');
  const w = BC.renderPair({ pitch: 96, interval: 'unison', players: { lower: 'cello', upper: 'flute' }, length: 4, beat: 2 }, recipe);
  ok(w.flags.some(f => f.flag === 'out-of-range' && f.player === 'cello' && f.note === 96), 'the cello asked for C7: flagged out of range (the palette\'s business, but the module says so)'); }
// the pattern: three pairs at offsets, the notes in absolute time, the META contour; describePair
{ const pat = BC.renderPattern({ length: 6, pairs: [
    { pitch: 60, interval: 'unison', players: { lower: 'cello', upper: 'viola' }, beat: HUMP3 },
    { pitch: 67, interval: 'unison', players: { lower: 'violin1', upper: 'violin2' }, beat: HUMP3, level: BC.levelFromBeat(HUMP3) },
    { pitch: 60, interval: 'P5', players: { lower: 'bass_clarinet', upper: 'flute' }, beat: HUMP3 }], offsets: [0, 1, 2] }, recipe);
  const fl = pat.notes.find(n => n.player === 'flute');
  ok(pat.pairs.length === 3 && pat.notes.length === 6 && pat.length === 8 && fl.startS === 2 && fl.endS === 8 && fl.key === 67 && pat.notes[0].player === 'cello' && pat.flags.length === 0,
     'a three-pair pattern at offsets 0 · 1 · 2 s: six notes, 8 s long, the flute on G4 from 2 to 8 s, the cello first, no flags');
  ok(pat.contour.length === 33 && near(pat.contour[0][1], 0.6, 1e-6) && pat.contour[16][1] > 0.6 && near(pat.contour[32][1], 0.6, 1e-6),
     '… the META contour: the crescendo\'s mean across the pattern, 33 points, above 0.6 in the middle where the violins swell');
  console.log('  ' + BC.describePair(pat.pairs[2])); }
console.log(fails ? 'FAIL — ' + fails + ' check' + (fails > 1 ? 's' : '') + ' failed' : 'PASS — every check passed');
process.exit(fails ? 1 : 0);
