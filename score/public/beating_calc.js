// beating_calc.js — the beating math (PLAN 1f; docs/BEATING_TOOL.md): a pure module shared by the composer page (window.BeatingCalc)
// and the node tools (require), the accel calculator's pattern — no DOM, no MIDI, no players. A BEATING (the composer's word,
// RUNNING_LOG §146) is one pair of players on one centre pitch, both bending around it by mirrored curves, the gap beating.
//
// STEP 1 — THE PALETTE (2026-09-07): who may bend how far, and who may pair with whom.
//   players(recipe)                      the bending players in score order (the piano is out, CN-34: `beating: false`)
//   ordinaryVoice / ordinaryRange        the instrument's ordinary voice (the recipe's `ordinary`) and its measured range [lo, hi]
//   bendLimits(recipe, inst)             { playerSt, samplerSt, measured, limitSt, limitCents } — the player's semitone (his rule) and the
//                                        sampler's range (the bend probe → bendRangeSt); the limit is the smaller
//   holds(recipe, inst, pitch)           can this player sit on this pitch: inside the ordinary range and able to bend
//   pairsFor(recipe, pitch, interval)    every pair of two players that can play the pair's two notes — at unison both hold the pitch;
//                                        at an interval one holds the lower note and the other the upper (the assignment follows the
//                                        ranges: the higher-ranged player takes the upper note when both could)
//   pairingTable(recipe, pitches, iv)    pairsFor over a list of pitches (the panel's dimming, the doc's table)
//   INTERVALS                            unison · m3 · M3 · P4 · P5: semitones, the just ratio, the coincident partial (§148: at a fifth
//                                        the beating is between the lower's 3rd and the upper's 2nd partial — p = 3), the just offset
//                                        in cents against equal temperament (+2 · −2 · −14 · +16, the tool's zero)
// STEP 2 — the beating math proper (rate ↔ cents by pitch and interval, the curves and their difference, the breaths, the stretch)
// follows in this file.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BeatingCalc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const ORDER = ['flute', 'bass_clarinet', 'piano', 'violin1', 'violin2', 'viola', 'cello'];   // D10 score order
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

  // the intervals inside a pair (RUNNING_LOG §148): ratio p:q, the beating between the lower's p-th and the upper's q-th partial,
  // p times the unison's rate per cent; the just offset = 1200·log2(p/q) − 100·semitones (the tempered interval already beats by it)
  const INTERVALS = {};
  for (const [key, label, semitones, p, q] of [['unison', 'unison', 0, 1, 1], ['m3', 'minor third', 3, 6, 5], ['M3', 'major third', 4, 5, 4], ['P4', 'fourth', 5, 4, 3], ['P5', 'fifth', 7, 3, 2]]) {
    INTERVALS[key] = { key, label, semitones, ratio: [p, q], partial: p, justOffsetCents: +(1200 * Math.log2(p / q) - 100 * semitones).toFixed(3) };
  }
  const intervalOf = iv => (typeof iv === 'string' ? INTERVALS[iv] : iv) || INTERVALS.unison;

  // ---- the palette ----
  function players(recipe) { return ORDER.filter(k => recipe[k] && recipe[k].beating !== false && (recipe[k].playerBendSt == null || recipe[k].playerBendSt > 0)); }
  function ordinaryVoice(recipe, inst) {
    const I = recipe[inst]; if (!I || !I.techniques) return null;
    return I.techniques.find(q => q.key === I.ordinary) || null;
  }
  function ordinaryRange(recipe, inst) {
    const I = recipe[inst]; if (!I) return null;
    const q = ordinaryVoice(recipe, inst);
    const lo = q && q.rangeLow != null ? q.rangeLow : I.rangeLow, hi = q && q.rangeHigh != null ? q.rangeHigh : I.rangeHigh;
    return lo == null || hi == null ? null : [lo, hi];
  }
  function bendLimits(recipe, inst) {
    const I = recipe[inst]; if (!I) return null;
    const playerSt = I.playerBendSt != null ? I.playerBendSt : 1;                    // his rule: within a semitone at the most
    const samplerSt = I.bendRangeSt != null ? I.bendRangeSt : null;                 // the probe's number; null = unknown (the piano)
    const limitSt = samplerSt == null ? playerSt : Math.min(playerSt, samplerSt);
    return { playerSt, samplerSt, measured: !!I.bendMeasured, mutableByMidi: !!I.bendMutableByMidi, limitSt, limitCents: limitSt * 100 };
  }
  function holds(recipe, inst, pitch) {
    const I = recipe[inst]; if (!I || I.beating === false) return false;
    if (I.playerBendSt != null && I.playerBendSt <= 0) return false;
    const r = ordinaryRange(recipe, inst); if (!r) return false;
    if (typeof pitch !== 'number' || !isFinite(pitch)) return false;
    const q = ordinaryVoice(recipe, inst);
    if (q && q.silentKeys && q.silentKeys.includes(pitch)) return false;
    return pitch >= r[0] && pitch <= r[1];
  }
  // the pairs that can play the two notes of the pair on this pitch: pitch = the LOWER note (§158), the partner above by the interval
  function pairsFor(recipe, pitch, interval) {
    const iv = intervalOf(interval);
    const lowerNote = pitch, upperNote = pitch + iv.semitones;
    const P = players(recipe);
    const out = [];
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const a = P[i], b = P[j];
      const aLo = holds(recipe, a, lowerNote), aHi = holds(recipe, a, upperNote), bLo = holds(recipe, b, lowerNote), bHi = holds(recipe, b, upperNote);
      let lower = null, upper = null, flexible = false;
      if (iv.semitones === 0) { if (aLo && bLo) { lower = a; upper = b; } }
      else {
        const ab = aLo && bHi, ba = bLo && aHi;
        if (ab && ba) { flexible = true; const top = k => (ordinaryRange(recipe, k) || [0, 0])[1]; if (top(b) >= top(a)) { lower = a; upper = b; } else { lower = b; upper = a; } }
        else if (ab) { lower = a; upper = b; }
        else if (ba) { lower = b; upper = a; }
      }
      if (lower) out.push({ players: [a, b], lower, upper, lowerNote, upperNote, interval: iv.key, flexible });
    }
    return out;
  }
  function pairingTable(recipe, pitches, interval) {
    const t = {};
    for (const p of pitches) t[p] = pairsFor(recipe, p, interval);
    return t;
  }
  // one line per player for a readout
  function describePalette(recipe) {
    return players(recipe).map(k => {
      const r = ordinaryRange(recipe, k), b = bendLimits(recipe, k), q = ordinaryVoice(recipe, k);
      return k + ': ' + (q ? q.key : '?') + ' ' + (r ? noteName(r[0]) + '–' + noteName(r[1]) + ' (' + r[0] + '–' + r[1] + ')' : '?') +
        ' · player ±' + b.playerSt + ' st · sampler ' + (b.samplerSt == null ? '?' : '±' + b.samplerSt + ' st' + (b.measured ? '' : ' (provisional)')) + ' · limit ±' + b.limitCents + ' c';
    });
  }

  return { ORDER, INTERVALS, intervalOf, noteName, midiHz, players, ordinaryVoice, ordinaryRange, bendLimits, holds, pairsFor, pairingTable, describePalette };
});
