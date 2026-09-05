// trill_engine.js — the trill's timing from the composer's own playing (TRILLS_TOOL phase 1, 2026-09-05;
// RUNNING_LOG §101 / §104). One implementation for the score page (window.TrillEngine) and the node tools
// (require). The table is bank/trill_timing_db.json (tools/trill_ingest.js): per instrument, every attack he
// played, indexed by the speed he was playing at (curvePosition 0–1), with its gap, velocity, length and role
// (lo / hi note of the pair). The lookup is piece #2's ostinato model: at each moment the curve's height is a
// speed level; the attacks within ±WINDOW of it are cycled in turn; stretch (anchored at his fastest gap) →
// smooth (toward the local mean) → speed; his length (capped at 1.8 × gap) and velocity.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.TrillEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const WINDOW = 0.05;
  const STAND_IN = { violin2: 'violin1' };   // the same library — until an instrument has samples of its own

  // the table for an instrument, or a stand-in (violin 1's timing is pitch-agnostic and serves everyone until
  // the flute, bass clarinet and piano are sampled — the panel says so)
  function pickTable(db, instKey) {
    if (!db || !db.instruments) return null;
    const ins = db.instruments;
    const key = ins[instKey] ? instKey : (STAND_IN[instKey] && ins[STAND_IN[instKey]]) ? STAND_IN[instKey]
      : ins.violin1 ? 'violin1' : Object.keys(ins)[0];
    return key ? { key, table: ins[key], standIn: key !== instKey } : null;
  }

  // o: { table, levelAt(sec) → 0..1, start, end (seconds), pitch, interval (signed semitones), smooth, stretch,
  //      speed, seed, roles (true: a lo note draws from his lo gaps, a hi from his hi), accent, attackVel }
  // → { notes: [{ t, len, vel, pitch, level, gap }], rateRange: [slow, fast] }   (t, len in seconds; gap in ms)
  function generate(o) {
    const table = o.table, smooth = o.smooth != null ? o.smooth : 0.7, stretch = o.stretch || 1, speed = o.speed || 1;
    const roles = o.roles !== false, interval = o.interval == null ? 2 : o.interval;
    let seed = (o.seed || 1) >>> 0; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    const all = table.samples.flatMap(s => s.attacks).filter(a => a.gapToNextMs != null);
    if (!all.length) return { notes: [], rateRange: table.rateRange || [0, 0] };
    const pool = { lo: all.filter(a => a.role === 'lo'), hi: all.filter(a => a.role === 'hi'), any: all };
    for (const k in pool) { if (!pool[k].length) pool[k] = all; pool[k].sort((a, b) => a.curvePosition - b.curvePosition); }
    const minGap = Math.min.apply(null, all.map(a => a.gapToNextMs));
    let lastRegion = -1; const cyc = { lo: 0, hi: 0, any: 0 };
    const pick = (level, role) => {
      const arr = pool[role]; let near = arr.filter(a => Math.abs(a.curvePosition - level) <= WINDOW);
      if (!near.length) near = [arr.reduce((b, a) => Math.abs(a.curvePosition - level) < Math.abs(b.curvePosition - level) ? a : b, arr[0])];
      const region = Math.round(level / WINDOW);
      if (region !== lastRegion) { lastRegion = region; for (const k in cyc) cyc[k] = Math.floor(rnd() * 1e6); }
      return { a: near[cyc[role]++ % near.length], near };
    };
    const notes = []; const span = o.end - o.start; let t = 0, k = 0;
    while (t < span && k < 20000) {
      const level = Math.max(0, Math.min(1, o.levelAt(o.start + t)));
      const role = roles ? (k % 2 === 0 ? 'lo' : 'hi') : 'any';
      const { a, near } = pick(level, role);
      let gap = minGap + (a.gapToNextMs - minGap) * stretch;
      if (smooth > 0) { const local = near.reduce((s, x) => s + x.gapToNextMs, 0) / near.length; gap += (minGap + (local - minGap) * stretch - gap) * smooth; }
      gap = Math.max(20, gap * speed);
      const vel = (k === 0 && o.accent) ? (o.attackVel || 127) : a.avgVelocity;
      notes.push({ t: o.start + t, len: Math.min(a.noteDurationsMs[0], gap * 1.8) / 1000, vel, pitch: o.pitch + (k % 2 === 0 ? 0 : interval), level, gap });
      t += gap / 1000; k++;
    }
    return { notes, rateRange: table.rateRange || [0, 0] };
  }

  // the notes as a zone snippet's events, relative to t0 (seconds), the CC7 / CC0 lead first
  function snippetEvents(notes, t0, cc0) {
    const r1 = x => Math.round(x * 10) / 10;
    const ev = [{ onsetMs: 0, _cc: 7, _ccValue: 127 }];
    if (cc0 != null) ev.push({ onsetMs: 0, _cc: 0, _ccValue: cc0 });
    for (const n of notes) ev.push({ onsetMs: r1((n.t - t0) * 1000), notes: [n.pitch], velocity: n.vel, durations: [r1(n.len * 1000)] });
    return ev;
  }

  const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const noteName = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  const INTERVALS = [[1, 'm2'], [2, 'M2'], [3, 'm3'], [4, 'M3'], [5, 'P4'], [6, 'TT'], [7, 'P5'], [8, 'm6'], [9, 'M6']];

  return { WINDOW, pickTable, generate, snippetEvents, noteName, INTERVALS };
});
