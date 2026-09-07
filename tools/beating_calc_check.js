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
console.log(fails ? 'FAIL — ' + fails + ' check' + (fails > 1 ? 's' : '') + ' failed' : 'PASS — every check passed');
process.exit(fails ? 1 : 0);
