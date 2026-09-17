#!/usr/bin/env node
// pick_bloom_takes.js — one held-dyad take per Bloom pair, by a written rule; every number the video build needs, in one file
// (PLAN 2h.7.2–2h.7.4, 2026-09-17, RUNNING_LOG §600).
//
//   node tools/gen_bloom_heldmax.js                       → midi/demo-bloom-heldmax/ (six takes per pair)
//   node tools/render_reaper.js --dir midi/demo-bloom-heldmax --out demo-bloom-heldmax --end 660 --gainWindow 0-660
//   node tools/measure_beating.js --wav notation/audio/raw/demo-bloom-heldmax-float.wav --slots midi/demo-bloom-heldmax/slots.json --json
//        > midi/demo-bloom-heldmax/measured.json
//   node tools/pick_bloom_takes.js                        → midi/demo-bloom-heldmax/picked.json (read by notation/video/renders/bloom_demos.sh)
//
// WHY TAKES: every Xsample part lands ±1–2 c from its bend on each note-on (the SI2 flute is exact), so one strike is a draw — the
// rate moved up to 8 % and the viola's level 17 dB between strikes of the same message. THE RULE — nothing is tuned, a take is chosen:
//   1. it holds (no second after the attack more than 12 dB under the loudest)
//   2. its measured rate is within 4 % of the chart's figure (a margin inside the plan's 5 %)
//   3. its envelope agrees — the beating as heard sits at 1, 2 or 3 times that rate
//   4. of those, the deepest beating (the envelope's max/min); depths within 10 % of the deepest count as equal, and then the take
//      nearest the chart wins
// THE STATIC'S AUDIO: one second into the take (past the attack), 30 s. Its gain = the pair recording's own gain (render_reaper.js
// --gainWindow), so the held dyad sits at the level the rack gives the music — lowered only if that would put it over −1 dBTP.
// THE LABEL'S FIGURE and the pair's name order are read from the chart SVG (never retyped); the section's end from the save's morph curves.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const FF = (() => { try { return execFileSync('where', ['ffmpeg'], { encoding: 'utf8' }).split(/\r?\n/)[0].trim(); } catch (e) { return 'ffmpeg'; } })();
const DIR = 'midi/demo-bloom-heldmax';
const HELD = 'notation/audio/raw/demo-bloom-heldmax-float.wav';
const TOL = 0.04, DEPTH_TIE = 0.10, STATIC_S = 30, INTO = 1, PEAK = -1;

// the pairs: the chart's short names → the lanes, the long names on the label, the pair recording
const PAIRS = {
  'Fl + Vn2': { id: 'flvn2', parts: [0, 4], names: 'Flute + Violin 2' },
  'Vn1 + Va': { id: 'vn1va', parts: [3, 5], names: 'Violin 1 + Viola' },
  'Bcl + Vc': { id: 'bclvc', parts: [1, 6], names: 'Bass Clarinet + Cello' },
};

// ---- the chart: row labels and peak figures, in document order
const svg = fs.readFileSync(path.join(ROOT, 'docs/notation_instructions/images/morph_sequence_chart.svg'), 'utf8');
const rows = [...svg.matchAll(/>([A-Za-z0-9]+ \+ [A-Za-z0-9]+)</g)].map(m => m[1]).filter(l => PAIRS[l]);
const figs = [...svg.matchAll(/&#8776; ([\d.]+) Hz/g)].map(m => m[1]);
if (rows.length !== 3 || figs.length !== 3) throw new Error('the chart: expected three BLOOM rows and three figures, read ' + JSON.stringify({ rows, figs }));

// ---- the save: BLOOM's morph group (the first in time) and each part's last curve end in it
const save = rd('scores/piece-septet.json');
const morphs = save.objects.filter(o => o.type === 'waveCurve' && o.morphBend);
const groups = {};
for (const o of morphs) (groups[o.groupId || o.id] = groups[o.groupId || o.id] || []).push(o);
const bloom = Object.values(groups).sort((a, b) => Math.min(...a.map(o => o.startSeconds)) - Math.min(...b.map(o => o.startSeconds)))[0];
const bloomT0 = Math.min(...bloom.map(o => o.startSeconds));

const measured = rd(DIR + '/measured.json');
const truePeak = (from, to) => {
  const t = spawnSync(FF, ['-hide_banner', '-nostats', '-ss', String(from), '-to', String(to), '-i', path.join(ROOT, HELD), '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  const m = t.slice(t.lastIndexOf('Summary:')).match(/True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS/);
  return m ? +m[1] : null;
};

const out = [];
rows.forEach((label, row) => {
  const P = PAIRS[label], chartHz = +figs[row];
  const takes = measured.filter(r => r.id === P.id);
  if (!takes.length) throw new Error(P.id + ': no measured takes');
  const judged = takes.map(r => {
    const off = r.spectrum.rate ? Math.abs(r.spectrum.rate - chartHz) / chartHz : 1;
    const harm = r.spectrum.rate ? [1, 2, 3].find(h => Math.abs(r.envelope.rate - h * r.spectrum.rate) / (h * r.spectrum.rate) <= 0.05) || null : null;
    const why = [];
    if (!(r.minAfterAttackDb > -12)) why.push('does not hold');
    if (off > TOL) why.push('rate ' + (off * 100).toFixed(1) + ' % from the chart');
    if (!harm) why.push('envelope at no multiple of the rate');
    return { take: r.take, slot: r.slot, rate: r.spectrum.rate, offPct: +(off * 100).toFixed(1), envelope: r.envelope.rate, harmonic: harm,
      depth: r.envelope.depth, balanceDb: r.spectrum.balanceDb, ok: !why.length, why };
  });
  const ok = judged.filter(j => j.ok);
  if (!ok.length) throw new Error(P.id + ': no take passes — ' + JSON.stringify(judged.map(j => [j.take, j.why])));
  const deepest = Math.max(...ok.map(j => j.depth));
  const pick = ok.filter(j => j.depth >= deepest * (1 - DEPTH_TIE)).sort((a, b) => a.offPct - b.offPct)[0];

  const rec = rd('notation/audio/raw/demo-bloom-' + P.id + '-render.json');
  const from = pick.slot + INTO, tp = truePeak(from, from + STATIC_S);
  const staticGain = +Math.min(rec.gainDb, PEAK - tp).toFixed(2);
  const end = Math.max(...bloom.filter(o => P.parts.includes(o.layer)).map(o => o.endSeconds));
  out.push({
    id: P.id, row, chartLabel: label, names: P.names, parts: P.parts.join(','), chartHz: figs[row],
    label: 'Bloom — ' + figs[row] + ' Hz — ' + P.names,
    still: null,
    static: { take: pick.take, slot: pick.slot, from, seconds: STATIC_S, measuredHz: pick.rate, offPct: pick.offPct, depth: pick.depth,
      balanceDb: pick.balanceDb, truePeakFloat: tp, gainDb: staticGain, gainFrom: rec.gainDb === staticGain ? 'the pair recording' : 'capped at ' + PEAK + ' dBTP' },
    section: { t0: +(bloomT0 - 1).toFixed(2), t1: +(end + 3).toFixed(2), lastCurveEnd: +end.toFixed(2), audio: 'notation/audio/demo-bloom-' + P.id + '.wav', gainDb: rec.gainDb },
    takes: judged,
  });
});
// the peak instant for the still: slots.json carries it per take
const slots = rd(DIR + '/slots.json').slots;
for (const o of out) o.still = { t: slots.find(s => s.id === o.id).T };
fs.writeFileSync(path.join(ROOT, DIR, 'picked.json'), JSON.stringify({ made: new Date().toISOString(), rule: { tolPct: TOL * 100, depthTiePct: DEPTH_TIE * 100, holdDb: -12 }, pairs: out }, null, 1));
for (const o of out) {
  console.log(o.label + '  (the chart row "' + o.chartLabel + '")');
  for (const j of o.takes) console.log('   take ' + j.take + ' · ' + j.rate + ' Hz (' + j.offPct + ' %) · envelope ' + j.envelope + (j.harmonic ? ' = ' + j.harmonic + '×' : '') + ' · depth ' + j.depth + ' · balance ' + j.balanceDb + ' dB' + (j.ok ? '' : ' — out: ' + j.why.join(', ')) + (j.take === o.static.take ? '   ◄ PICKED' : ''));
  console.log('   static: ' + o.static.from + '–' + (o.static.from + o.static.seconds) + ' s of the held render · gain ' + o.static.gainDb + ' dB (' + o.static.gainFrom + ') · still at ' + o.still.t + ' s · section ' + o.section.t0 + '–' + o.section.t1 + ' s');
}
console.log('wrote ' + DIR + '/picked.json');
