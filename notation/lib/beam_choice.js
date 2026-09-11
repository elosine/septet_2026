// beam_choice.js — [PLAN 2d.2, the septet — 2026-09-11] A BEAM AS DATA: the per-note engraving devices that draw one beam over
// a set of notes, and the sidecar's beam choices turned into those devices on top of a freshly extracted IR.
//
// ONE code path for a beam. The device rules were notate_section.js --beam's (day 24, the composer's mixed pair); they live here
// now and the tool calls them, so a beam made on the command line and a beam chosen in the app are drawn by the same numbers
// (registry engraving.layout.figures.beam). (2026-09-10's lesson: every fault that day was a rule wired into one code path and
// not its sibling.)
//
// The sidecar (notation/choices/<score>.choices.json — IR_SCHEMA_v0 §6b) is a data layer only: its choices become ordinary §6
// `engraving` overlays appended IN MEMORY to the IR the app loaded, never written into the IR file. Where no choice exists the
// engine's own result stands. layout.js keeps one engraving value per note, last one wins, so a choice appended after the IR's
// own overlays is what that note draws.
// Pure, dual-load, no state.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BeamChoice = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // HOW MANY BEAMS a member carries is derived from its technique rather than asked for: a SHORT fixed one-shot (staccato) is
  // the "sixteenth" and takes two levels; anything that rings (fortepiano, cuivre, ord) is the long note and takes the primary
  // beam only. The second level then has no neighbour to connect to and layout draws it as a STUB on the short note.
  const RINGS_DEFAULT = ['fortepiano', 'cuivre', 'ord'];

  // members: the IR events of ONE beam, in onset order · FIG: registry engraving.layout.figures.beam · key: the beamGroup name.
  // → { rings, ringIdx, gcRule, gcIdx, devices: [ { event, device } ] }
  function beamDevices(members, FIG, key) {
    const F = FIG || {};
    const rings = new Set(F.ringTechniques || RINGS_DEFAULT);
    // WHO CARRIES THE GC (figures.beam.gc): 'ring' = the first member that rings (the long note — composer, day 24: "let's
    // shift the GC to the half note"), 'first' = member 1, false = none. A group with no ringing member falls back to the
    // first, so the cue never vanishes.
    const ringIdx = members.findIndex(e => rings.has(e.technique));
    const gcRule = F.gc != null ? F.gc : 'first';
    const gcIdx = gcRule === 'ring' ? (ringIdx >= 0 ? ringIdx : 0) : gcRule === 'first' ? 0 : -1;
    const devices = members.map((e, i) => {
      const firstOnly = v => v === 'first' ? i === 0 : !!v;
      const dev = {
        nhStem: 'beam', beamGroup: key,
        noteBeams: rings.has(e.technique) ? 1 : 2,
        beamPos: i, noteUnits: 1,
        // the standards (registry engraving.layout.figures.beam): no go lines, GC on the ringing note, every head centred on
        // its go time, dynamics together above the beam.
        // THE GO LINE MARKS DISPLACEMENT (D58): in a beam only the GC-bearing member is displaced — pushed clear of the impact
        // disc — so only it carries a go line. Every other head sits with its LEFT EDGE on its own go time (D59) and needs none.
        goLine: F.goLine === 'gc' ? (i === gcIdx) : firstOnly(F.goLine != null ? F.goLine : false),
        gc: i === gcIdx,
        dynAboveBeam: F.dynAboveBeam != null ? !!F.dynAboveBeam : true,
      };
      // 'before' is the layout default (the unit hangs ahead of the go time to clear the disc), so it is expressed by NOT
      // setting an anchor.
      const anch = i === gcIdx ? (F.gcAnchor || 'before') : (F.anchor || (i === 0 ? F.firstAnchor : null));
      if (anch && anch !== 'before') dev.nhAnchor = anch;
      return { event: e.id, device: dev };
    });
    return { rings, ringIdx, gcRule, gcIdx, devices };
  }

  // The sidecar's choices on top of a fresh IR → { overlays, report }. A choice names NOTE ids (docs/NOTATION_IDENTITY.md); each
  // is looked up as ev- + id. All present → 'applied' · some missing → 'partial', drawn on the notes that remain · none left →
  // 'orphaned' · notes in two parts → 'refused', with the reason. Nothing is dropped: the report carries every choice, whatever
  // became of it (2d.4 lists it).
  function applyChoices(choicesDoc, ir, FIG) {
    const evById = new Map(((ir && ir.events) || []).map(e => [e.id, e]));
    const partOf = new Map();
    for (const c of (ir && ir.chunks) || []) for (const id of c.events || []) partOf.set(id, c.part);
    const overlays = [], report = [];
    for (const ch of (choicesDoc && choicesDoc.choices) || []) {
      const rec = { id: ch.id, kind: ch.kind, drawn: false };
      report.push(rec);
      if (ch.kind !== 'beam') { rec.status = 'unknown-kind'; continue; }
      const ids = (ch.target && ch.target.notes) || [];
      const present = ids.filter(id => evById.has('ev-' + id));
      rec.notes = ids.length; rec.present = present.length;
      rec.missing = ids.filter(id => !evById.has('ev-' + id));
      rec.status = present.length === 0 ? 'orphaned' : present.length < ids.length ? 'partial' : 'applied';
      const members = present.map(id => evById.get('ev-' + id)).sort((a, b) => a.onset - b.onset || (a.id < b.id ? -1 : 1));
      rec.t = members.length ? members[0].onset : null;
      const parts = new Set(members.map(e => partOf.get(e.id)));
      rec.part = parts.size === 1 ? [...parts][0] : null;
      if (members.length < 2) continue;                                  // one note is not a beam; the choice stays, listed
      if (parts.size > 1) { rec.status = 'refused'; rec.why = 'a beam joins notes of one part — these are in parts ' + [...parts].join(', '); continue; }
      // the beamGroup is the CHOICE's own name — never a chunk's, which renames when its earliest note moves (decision B)
      for (const d of beamDevices(members, FIG, 'bmc-' + ch.id).devices)
        overlays.push({ id: 'ov-choice-' + ch.id + '-' + d.event, kind: 'engraving', target: { event: d.event },
          value: { device: d.device }, provenance: 'authored' });
      rec.drawn = true;
    }
    return { overlays, report };
  }

  return { beamDevices, applyChoices, RINGS_DEFAULT };
}));
