// velocity_remap.js — the remap lookup shared by the composer page and the node tools (PLAN 1g item 1, RUNNING_LOG §116).
//
// The ensemble has one loudness scale: the violins' velocity (65 at the bottom of a curve, 127 at its top by default).
// bank/velocity_remap.json (tools/velocity_remap.js, from the sweep) holds, per instrument and measured register, the
// velocity that instrument must be sent to sound as loud as the violins do at each anchor velocity. velocityFor()
// interpolates between the measured registers and holds the nearest beyond them; without a bank, or for an instrument
// the bank lacks, the anchor velocity passes through unchanged (the pre-sweep behaviour).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VelocityRemap = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function clampV(v) { return Math.max(1, Math.min(127, Math.round(v))); }
  // bank: the parsed remap; instKey: the recipe's key ('flute' …); pitch: MIDI; anchorVel: the ensemble's scale (the violins')
  function velocityFor(bank, instKey, pitch, anchorVel) {
    const a = clampV(anchorVel);
    const inst = bank && bank.instruments && instKey ? bank.instruments[instKey] : null;
    if (!inst || !inst.pitches || !inst.pitches.length) return a;
    const lo = bank.scale && bank.scale.lo != null ? bank.scale.lo : 65;
    const ps = inst.pitches;   // sorted by pitch by the tool
    const idx = tbl => Math.max(0, Math.min(tbl.length - 1, a - lo));
    const at = p => p.table[idx(p.table)];
    if (pitch == null || pitch <= ps[0].pitch) return clampV(at(ps[0]));
    if (pitch >= ps[ps.length - 1].pitch) return clampV(at(ps[ps.length - 1]));
    for (let k = 0; k < ps.length - 1; k++) {
      if (pitch >= ps[k].pitch && pitch <= ps[k + 1].pitch) {
        const t = (pitch - ps[k].pitch) / (ps[k + 1].pitch - ps[k].pitch);
        return clampV(at(ps[k]) + (at(ps[k + 1]) - at(ps[k])) * t);
      }
    }
    return clampV(at(ps[ps.length - 1]));
  }
  // what the bank says about a register's reach (for a status line): the clamp counts of the nearest measured pitch
  function reach(bank, instKey, pitch) {
    const inst = bank && bank.instruments && instKey ? bank.instruments[instKey] : null;
    if (!inst || !inst.pitches || !inst.pitches.length) return null;
    const p = inst.pitches.reduce((b, q) => Math.abs(q.pitch - pitch) < Math.abs(b.pitch - pitch) ? q : b, inst.pitches[0]);
    return { pitch: p.pitch, clampedLow: p.clampedLow, clampedHigh: p.clampedHigh };
  }
  return { velocityFor, reach };
});
