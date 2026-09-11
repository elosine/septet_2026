// test_septet_notation.js — PLAN 2a (2026-09-11): the notation engine made
// for seven parts. The tuba batteries prove the engine is unchanged WITHOUT
// the ensemble; this one proves what it does WITH it:
//   2a.1 the container — lanes from the registry, the grand staff as one
//        lane of two staves (coords.withStaves), D10 order and groups
//   2a.2 clefs — every clef's staff positions; the clef each system carries
//   2a.3 written pitch — the B♭ bass clarinet a major ninth above sounding
//   2a.4 chords — piece #2's LilyPond-locked note column and accidental
//        column (its measured cases), and the extractor's simultaneities
//   2a.5 techniques — every key the score uses classifies; unknown throws
//   2a.6 the real save — piece-septet extracted, laid out and rendered
// piece-septet.json is the composer's LIVE score: it is read, never written,
// and asserted by INVARIANTS (every part present, every chunk valid), never
// by counts that his next edit would change.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const J = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const Layout = require('../notation/lib/layout.js');
const Render = require('../notation/lib/render.js');
const Coords = require('../notation/lib/coords.js');
const Classify = require('../notation/lib/classify.js');
const Extract = require('../notation/lib/extract_core.js');
const CC = require('../notation/lib/chord_column.js');

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };
const eq = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, msg + ' (got ' + a + ', want ' + b + ')');
const sp = (step, alter, octave) => ({ step, alter, octave });

const ens = J('notation/registry/ensemble.json');
const tech = J('notation/registry/techniques.json');
const C = J('notation/registry/container.json');
const glyphs = J('notation/lib/glyphs.json');

// ---- 2a.2 clefs: staff positions (ss from the middle line, up = +) ----
eq(Layout.staffPos(sp('B', 0, 4), 'treble'), 0, 1e-12, 'treble: B4 = middle line');
eq(Layout.staffPos(sp('G', 0, 4), 'treble'), -1, 1e-12, 'treble: G4 = the line the clef names');
eq(Layout.staffPos(sp('E', 0, 4), 'treble'), -2, 1e-12, 'treble: E4 = bottom line');
eq(Layout.staffPos(sp('F', 0, 5), 'treble'), 2, 1e-12, 'treble: F5 = top line');
eq(Layout.staffPos(sp('C', 0, 4), 'treble'), -3, 1e-12, 'treble: middle C = first ledger below');
eq(Layout.staffPos(sp('C', 0, 4), 'alto'), 0, 1e-12, 'alto: C4 = middle line');
eq(Layout.staffPos(sp('F', 0, 3), 'alto'), -2, 1e-12, 'alto: F3 = bottom line');
eq(Layout.staffPos(sp('G', 0, 4), 'alto'), 2, 1e-12, 'alto: G4 = top line');
eq(Layout.staffPos(sp('D', 0, 3), 'bass'), 0, 1e-12, 'bass: D3 = middle line (unchanged)');
ok(Layout.staffPosBass(sp('A', 0, 3)) === Layout.staffPos(sp('A', 0, 3), 'bass'), 'staffPosBass is the bass case of staffPos');
for (const k of ['bass', 'treble', 'alto']) ok(glyphs.clef[k] && glyphs.clef[k].path, 'glyphs.json holds the ' + k + ' clef');
ok(glyphs.clef.treble.anchors.gLine && glyphs.clef.alto.anchors.cLine, 'clef anchors name their lines');

// ---- 2a.3 written pitch + the grand staff, through the one resolver ----
const pos = Layout.positionResolver(ens);
{
  const r = pos(1, 46);                       // sounding B♭2 (A#2) -> written C4
  ok(r.key === 1, 'bass clarinet: one staff');
  eq(r.ySs, -3, 1e-12, 'bass clarinet: sounding B♭2 is written C4 (+M9), a ledger below the treble staff');
  eq(pos(1, 55).ySs, -0.5, 1e-12, 'bass clarinet: sounding G3 is written A4');
  const up = pos(2, 60), lo = pos(2, 59);
  ok(up.key === '2:0' && lo.key === '2:1', 'piano: middle C on the upper staff, B3 on the lower');
  eq(up.ySs, -3, 1e-12, 'piano: middle C in treble');
  eq(lo.ySs, 2.5, 1e-12, 'piano: B3 in bass');
  eq(pos(5, 60).ySs, 0, 1e-12, 'viola: middle C on the alto middle line');
  eq(pos(6, 50).ySs, 0, 1e-12, 'cello: D3 on the bass middle line');
  eq(pos(0, 72).ySs, 0.5, 1e-12, 'flute: C5 in treble, sounding = written');
}

// ---- 2a.1 the container: ensemble order, groups, lanes and staves ----
ok(JSON.stringify(ens.parts.map(p => p.id)) === JSON.stringify(['flute', 'bass_clarinet', 'piano', 'violin1', 'violin2', 'viola', 'cello']), 'D10 order: flute · bass clarinet · piano · strings');
ok(JSON.stringify(ens.groups.map(g => g.kind + ':' + g.parts.join(','))) === JSON.stringify(['bracket:0,1', 'brace:2', 'bracket:3,4,5,6']), 'D10 groups: winds bracket · piano brace · strings bracket');
{
  const score = J('scores/piece-septet.json');
  ok(ens.parts.every(p => score.tracks[p.part] && score.tracks[p.part].id === p.id && score.tracks[p.part].short === p.short),
    'the ensemble registry matches piece-septet\'s tracks (id + short)');
  ok(ens.metaLayer === score.tracks.length, 'META layer = tracks.length');
}
{
  const sys = Coords.systemsForParts([0, 1, 2, 3], { topPad: 0, botPad: 0, gap: 0, weights: [1, 1, 2, 1] });
  sys.forEach((s, i) => { s.ssPerSystem = 12 * [1, 1, 2, 1][i]; });
  const all = Coords.withStaves(sys, p => (p === 2 ? 2 : 1));
  const v = Coords.makeView({ widthPx: 1000, heightPx: 500, window: [0, 10], systems: all });
  ok(all.length === 6, 'withStaves: the two-staff part adds two sub-systems and keeps its lane');
  eq(v.system('2:0').ssPx, v.system(0).ssPx, 1e-9, 'withStaves: the grand staff\'s staves are the players\' size');
  eq(v.system('2:0').yTopPx, v.system(2).yTopPx, 1e-9, 'withStaves: the upper staff starts at the lane top');
  eq(v.system('2:1').yBotPx, v.system(2).yBotPx, 1e-9, 'withStaves: the lower staff ends at the lane bottom');
}

// ---- 2a.4 the note column: piece #2's LilyPond cases (CHORD_SPACING_RULES §3.4) ----
{
  const W = 1.18;
  const col = ys => CC.noteColumn(ys.map(y => ({ ySs: y })), 'up', W, 1).map(r => r.xOffsetSs);
  const Y = (s, o) => Layout.staffPos(sp(s, 0, o), 'treble');
  ok(JSON.stringify(col([Y('C', 4), Y('E', 4)])) === JSON.stringify([0, 0]), 'column: a third stacks (C4/E4)');
  ok(JSON.stringify(col([Y('C', 4), Y('D', 4)])) === JSON.stringify([0, W]), 'column: a second — the upper note steps right (C4/D4)');
  ok(JSON.stringify(col([Y('D', 4), Y('C', 4)])) === JSON.stringify([W, 0]), 'column: the same, in either input order');
  ok(JSON.stringify(col([Y('C', 4), Y('C', 4), Y('D', 4)])) === JSON.stringify([0, W, 0]), 'column: C4 C#4 D4 — C#4 steps right, C4 and D4 share (LP chord 9)');
  ok(JSON.stringify(col([Y('G', 4), Y('G', 4), Y('C', 5)])) === JSON.stringify([0, W, 0]), 'column: G4 G#4 C5 — G#4 steps right (LP chord 7)');
  const b = (s, o) => Layout.staffPos(sp(s, 0, o), 'bass');
  ok(JSON.stringify(col([b('B', 2), b('E', 3), b('E', 3)])) === JSON.stringify([0, 0, W]), 'column: B2 Eb3 E3 — E3 steps right (LP chord 6)');
  ok(JSON.stringify(col([Y('C', 4), Y('D', 4), Y('F', 4)])) === JSON.stringify([0, W, 0]), 'column: C4 D4 F4 — D4 steps right (LP chord 10)');
  const down = CC.noteColumn([{ ySs: 0 }, { ySs: 0.5 }], 'down', W, 1).map(r => r.xOffsetSs);
  ok(JSON.stringify(down) === JSON.stringify([-W, 0]), 'column: stem down walks from the top; the lower note steps left');
}
// ---- 2a.4 the accidental column: collide -> next slot; clear -> own head ----
{
  const P = { gapToNotehead: 0.1, minLateralGap: 0.1, yTol: 0.05 };
  const heads = [{ xLeft: 0, ySs: 0, hSs: 1 }, { xLeft: 0, ySs: 0.5, hSs: 1 }];
  const a = { w: 0.6, topExt: 1.2, botExt: 1.2 };
  const r = CC.accidentalColumn([Object.assign({ ySs: 0 }, a), Object.assign({ ySs: 0.5 }, a)], heads, [], P);
  eq(r[1].rightEdge, -0.1, 1e-9, 'accidentals: the top one sits the notehead gap left of the heads');
  eq(r[0].rightEdge, r[1].leftEdge, 1e-9, 'accidentals: a colliding one takes the next full slot to the left');
  const far = CC.accidentalColumn([Object.assign({ ySs: 0 }, a), Object.assign({ ySs: 5 }, a)],
    [{ xLeft: 0, ySs: 0, hSs: 1 }, { xLeft: 0, ySs: 5, hSs: 1 }], [], P);
  eq(far[0].rightEdge, far[1].rightEdge, 1e-9, 'accidentals: vertically clear ones share the column next to the heads');
  const led = CC.accidentalColumn([Object.assign({ ySs: -3 }, a)], [{ xLeft: 0, ySs: -3, hSs: 1 }], [{ ySs: -3, xLeft: -0.3 }], P);
  eq(led[0].rightEdge, -0.4, 1e-9, 'accidentals: a ledger at the accidental\'s line pushes it clear (H.4c.3)');
}
// ---- 2a.4 the extractor's simultaneities: opt-in, the tuba unchanged ----
{
  // onsets: a dyad (0, 5 ms), a single note, a triad spread over 16 ms (1.000,
  // 1.008, 1.016 — piece-septet's piano at 432.337/.345/.353, which a 15 ms
  // window split; CHORD_TOL is 40 ms)
  const ON = [0, 0.005, 0.5, 1.0, 1.008, 1.016];
  const mk = (o, i) => ({ id: 'wc-' + i, type: 'waveCurve', layer: 2, technique: 'main', startSeconds: o, endSeconds: o + 0.5, sonifyNote: 60 + i, nodes: [{}, {}], segments: [] });
  const score = { objects: ON.map(mk) };
  const params = { scoreName: 't', window: [0, 3], parts: [2], id: 't', registry: J('notation/registry/classes.json'), sampleLengths: {}, techniques: tech.techniques };
  const withC = Extract.extract(score, Object.assign({ options: { chords: true } }, params)).doc;
  ok(withC.chunks.map(c => c.events.length).join(',') === '2,1,3', 'chords: 0 / 0.005 s is one chord, 1.000-1.016 s another, 0.5 s a single note (got ' + withC.chunks.map(c => c.events.length).join(',') + ')');
  ok(withC.chunks.every(c => c.span[1] > c.span[0]), 'chords: every chunk span increases');
  const byId = new Map(withC.events.map(e => [e.id, e]));
  ok(withC.chunks.every(c => c.events.every(id => byId.get(id).onset >= c.span[0] - 1e-9 && byId.get(id).onset < c.span[1])), 'chords: every event inside its own chunk\'s span');
  const without = Extract.extract(score, Object.assign({ options: {} }, params)).doc;
  ok(without.chunks.every(c => c.events.length >= 1) && without.chunks.length !== withC.chunks.length, 'chords: off by default (the tuba rule stands without the option)');
}

// ---- 2a.5 techniques: every key the score uses classifies; unknown throws ----
{
  const score = J('scores/piece-septet.json');
  const used = new Set(score.objects.filter(o => o.type === 'waveCurve' && o.layer < ens.metaLayer && o.technique).map(o => o.technique));
  for (const k of used) ok(tech.techniques[k], 'techniques.json lists "' + k + '" (used in piece-septet)');
  ok(Object.values(tech.techniques).every(t => t.family === 'oneshot' || t.family === 'sustained'), 'every technique has a family');
  ok(tech.techniques.pizzicato.notate === 'tongue ram', 'the flute pizzicato is written tongue ram (composer, RUNNING_LOG §44)');
  let threw = false;
  try { Classify.classify({ id: 'x', type: 'waveCurve', layer: 0, technique: 'no_such_key', nodes: [{}, {}] }, { metaLayer: 7, techniques: tech.techniques }); } catch (e) { threw = true; }
  ok(threw, 'an unlisted technique still THROWS (CL-5)');
  ok(Classify.classify({ id: 'm', type: 'waveCurve', layer: 7 }, { metaLayer: 7 }) === 'meta-shape', 'layer 7 is META for the septet');
  ok(Classify.classify({ id: 'm', type: 'waveCurve', layer: 10 }) === 'meta-shape', 'layer 10 is still META for the tuba (no context)');
}

// ---- 2a.6 the real save: extract, lay out, render ----
{
  const score = J('scores/piece-septet.json');
  const parts = ens.parts.map(p => p.part);
  const t1 = Math.max(...score.objects.filter(o => o.endSeconds != null).map(o => o.endSeconds)) + 1;
  const { doc } = Extract.extract(score, { scoreName: 'piece-septet', window: [0, t1], parts, id: 'septet-test',
    registry: J('notation/registry/classes.json'), sampleLengths: J('bank/sample_lengths.json'), profile: 'trance',
    options: { chords: true }, metaLayer: ens.metaLayer, techniques: tech.techniques });
  const partsSeen = new Set(doc.chunks.map(c => c.part));
  ok(parts.every(p => partsSeen.has(p)), 'piece-septet: all seven parts carry material');
  ok(doc.chunks.every(c => c.part < ens.metaLayer), 'piece-septet: nothing from META or the curve windows');
  const byId = new Map(doc.events.map(e => [e.id, e]));
  ok(doc.chunks.every(c => c.span[1] > c.span[0] && c.events.every(id => byId.get(id).onset >= c.span[0] - 1e-9 && byId.get(id).onset < c.span[1] + 1e-9)),
    'piece-septet: every chunk valid — increasing span, its events inside it');
  for (const c of doc.chunks) c.strategy = 'unresolved';   // the --bricks page (2a's proof page)
  const model = Layout.layoutSection(doc, glyphs, Object.assign({ frameParts: parts, ensemble: ens, techniques: tech }, C.engraving.layout));
  ok(JSON.stringify(model.systems.map(s => s.key + '/' + s.clef)) === JSON.stringify(['0/treble', '1/treble', '2:0/treble', '2:1/bass', '3/treble', '4/treble', '5/alto', '6/bass']),
    'layout: eight systems — seven parts, the piano on two staves — each in its own clef');
  const pChords = doc.chunks.filter(c => c.part === 2 && c.events.length > 1);
  ok(pChords.length > 0, 'piece-septet: the piano has chords');
  // NO CHORD COLLISIONS, anywhere: two heads on one staff within the chord
  // window and a step or less apart are drawn at ONE time (the fault found on
  // 2026-09-11: a triad's third note 16 ms late was drawn 16 ms right, into
  // the displaced head's x), and on OPPOSITE sides of the column — except
  // where the chord holds an altered unison, which forces the sides to
  // alternate so that two notes a step apart share a column: LilyPond's own
  // measured result (#2 CHORD_SPACING_RULES §3.4, chord 9: "C4 and D4 share
  // X; C#4 shifts right"), which #2 locked and chord_column.js ports.
  {
    let pairs = 0, bad = [];
    for (const s of model.systems) {
      const heads = s.items.filter(i => i.k === 'glyph' && /^notehead/.test(i.g));
      for (let i = 0; i < heads.length; i++) for (let j = i + 1; j < heads.length; j++) {
        const a = heads[i], b = heads[j];
        if (Math.abs(a.t - b.t) > 0.04 || Math.abs(a.ySs - b.ySs) > 0.5 + 1e-9) continue;
        pairs++;
        const sameTime = Math.abs(a.t - b.t) <= 1e-9;
        const apart = Math.abs(a.dxSs - b.dxSs) >= 0.9;
        const unisonChord = heads.filter(h => Math.abs(h.t - a.t) <= 1e-9).some((h, k, arr) => arr.some((h2, k2) => k2 !== k && Math.abs(h2.ySs - h.ySs) < 1e-9));
        if (!sameTime || (!apart && !(unisonChord && Math.abs(a.ySs - b.ySs) > 1e-9)))
          bad.push(s.key + ' @' + a.t.toFixed(3) + '/' + b.t.toFixed(3) + ' y' + a.ySs + '/' + b.ySs);
      }
    }
    ok(bad.length === 0, 'layout: no chord collisions (' + pairs + ' close pairs checked)' + (bad.length ? ' — ' + bad.slice(0, 4).join(', ') : ''));
  }
  // render one page in the jury frame with the app's own lane math
  const W = 1920, H = 1080, lanes = C.realizations['video-jury'].lanes;
  const topPad = lanes.padTopPx / H, botPad = lanes.padBotPx / H, gap = lanes.gapPx / H;
  const weights = parts.map(p => ens.parts.find(q => q.part === p).weight || 1);
  const unit = ((1 - topPad - botPad - gap * (parts.length - 1)) / weights.reduce((a, b) => a + b, 0)) * H;
  let systems = Coords.systemsForParts(parts, { topPad, botPad, gap, weights });
  const ssPer = unit / (C.staff.staffHeightPx / 4);
  systems.forEach((s, i) => { s.ssPerSystem = ssPer * weights[i]; });
  systems = Coords.withStaves(systems, p => { const e = ens.parts.find(q => q.part === p); return (e.staves && e.staves.length) || 1; });
  const t0 = doc.events.length ? Math.floor(doc.events[0].onset) : 0;
  const view = Coords.makeView({ widthPx: W, heightPx: H, window: [t0, t0 + 12], gutterPx: C.prefatory.gutterPx, systems, ssPerSystem: ssPer });
  ok(view.systems.filter(s => typeof s.part === 'number' || /:/.test(s.part)).every(s => Math.abs(s.ssPx * 4 - C.staff.staffHeightPx) < 1e-6), 'render: one staff size across the frame (' + C.staff.staffHeightPx + ' px)');
  const svg = Render.renderSection(model, view, glyphs, { engraving: C.engraving.render, ensemble: ens });
  ok(ens.parts.every(p => svg.includes('>' + p.short + '<')), 'render: every part labelled by its short name');
  ok((svg.match(/sysgrp-bracket/g) || []).length === 2 && (svg.match(/sysgrp-brace/g) || []).length === 1, 'render: two brackets and one brace');
  ok(!/NaN|Infinity/.test(svg), 'render: no NaN or Infinity in the page');

  // [PLAN 2d.2] THE CHOICES SIDECAR on the real save: a beam chosen over four notes of one part is drawn as ONE beam over exactly
  // those four; a partial choice still draws on what remains; an orphan, an unknown kind and a two-part beam draw nothing and are
  // all still reported — never dropped. The notes are taken from the save itself, never hard-coded (his next edit changes them).
  {
    const BC = require('../notation/lib/beam_choice.js');
    const partOf = new Map(); for (const c of doc.chunks) for (const id of c.events) partOf.set(id, c.part);
    const lanes = [3, 0, 1, 4, 5, 6].map(p => { const seen = new Set();
      return doc.events.filter(e => partOf.get(e.id) === p).sort((a, b) => a.onset - b.onset).filter(e => !seen.has(e.onset) && seen.add(e.onset)); });
    const lane = lanes.find(l => l.length >= 6), four = lane.slice(1, 5), wc = e => e.source.objectId;
    const other = doc.events.find(e => partOf.get(e.id) !== partOf.get(four[0].id));
    const FIG = C.engraving.layout.figures && C.engraving.layout.figures.beam;
    const choices = { score: 'piece-septet', version: 1, choices: [
      { id: 'c-1', kind: 'beam', target: { notes: four.map(wc) }, value: {}, orphaned: false },
      { id: 'c-2', kind: 'beam', target: { notes: [wc(lane[0]), wc(lane[5]), 'wc-999999'] }, value: {}, orphaned: false },
      { id: 'c-3', kind: 'beam', target: { notes: ['wc-999998', 'wc-999997'] }, value: {}, orphaned: true },
      { id: 'c-4', kind: 'slur', target: { notes: four.map(wc) }, value: {}, orphaned: false },
      { id: 'c-5', kind: 'beam', target: { notes: [wc(four[0]), wc(other)] }, value: {}, orphaned: false },
    ] };
    const { overlays, report } = BC.applyChoices(choices, doc, FIG);
    const st = Object.fromEntries(report.map(r => [r.id, r.status + (r.drawn ? '+drawn' : '')]));
    ok(JSON.stringify(st) === JSON.stringify({ 'c-1': 'applied+drawn', 'c-2': 'partial+drawn', 'c-3': 'orphaned', 'c-4': 'unknown-kind', 'c-5': 'refused' }),
      'choices: every choice reported — applied · partial · orphaned · unknown kind · a two-part beam refused (' + JSON.stringify(st) + ')');
    ok(overlays.length === 6 && overlays.every(o => o.kind === 'engraving' && o.value.device.nhStem === 'beam'),
      'choices: 4 + 2 engraving overlays, none for the three that do not draw (' + overlays.length + ')');
    ok(report.length === 5 && !!report.find(r => r.id === 'c-5').why, 'choices: nothing dropped — the refused beam says why');
    const withC = JSON.parse(JSON.stringify(doc));
    withC.overlays = withC.overlays.concat(overlays.filter(o => o.id.startsWith('ov-choice-c-1-')));
    const m2 = Layout.layoutSection(withC, glyphs, Object.assign({ frameParts: parts, ensemble: ens, techniques: tech }, C.engraving.layout));
    const beamsOf = mdl => mdl.systems.flatMap(s => s.items.filter(i => i.k === 'beam' && /^bmc-c-1(-|$)/.test(i.group || '')));
    const prim = beamsOf(m2).filter(b => b.group === 'bmc-c-1');
    ok(beamsOf(model).length === 0 && prim.length === 1 && (prim[0].tips || []).length === 4 &&
      prim[0].tips.map(t => t.t).join() === four.map(e => e.onset).join(),
      'choices: laid out, ONE beam over exactly those four onsets (' + prim.length + ' beam, ' + (prim[0] && prim[0].tips ? prim[0].tips.length : 0) + ' tips); without the choice, none');
    const d = BC.beamDevices(four, FIG, 'k').devices;
    ok(d.map(x => x.device.beamPos).join() === '0,1,2,3' && d.filter(x => x.device.gc).length === (FIG && FIG.gc === false ? 0 : 1),
      'choices: one device per note, in order, one GC');
  }
}

console.log(pass + ' passed, ' + fail + ' failed');
console.log(fail ? 'SEPTET-NOTATION RED: ' + fail + ' failure(s)' : 'SEPTET-NOTATION GREEN: clefs · written pitch · grand staff · D10 groups · #2 chord columns · simultaneities · techniques · piece-septet end to end');
process.exit(fail ? 1 : 0);
