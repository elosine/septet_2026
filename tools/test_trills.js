// test_trills.js — PLAN 2f (2026-09-13): section 1's trills, the battery grown step by step.
//   2f.2 the glyphs — the trill sign and the neighbour's parentheses, stock size from Emmentaler
//   2f.3 the IR — trill zones as env trill events, eaten notes out, the composer's curve math, the validator
// Spec: docs/TRILL_NOTATION_SPEC.md. piece-septet.json is the composer's LIVE score: read, never written.
// --glyphs <path> / --extract <path> run the checks against another glyphs.json / extract_core.js (to see them go red once).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const J = p => JSON.parse(fs.readFileSync(path.isAbsolute(p) ? p : path.join(ROOT, p), 'utf8'));
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };
const eq = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, msg + ' (got ' + a + ', want ' + b + ')');

const glyphs = J(arg('--glyphs') || 'notation/lib/glyphs.json');

// ---- 2f.2 the glyphs (TRILL_NOTATION_SPEC §2–§3, GLYPH_SIZING §2) ----
{
  const tr = glyphs.articulation && glyphs.articulation.trill;
  ok(tr && tr.path, 'glyphs.articulation.trill exists (scripts.trill)');
  if (tr) {
    eq(tr.wSs, 2.396, 0.002, 'trill sign stored at STOCK width');
    eq(tr.hSs, 2.204, 0.002, 'trill sign stored at STOCK height');
    eq(tr.wSs * 0.70, 1.677, 0.002, 'trill sign at the device scale 0.70 = GLYPH_SIZING Ornaments 1.68 wide');
    ok(/scripts\.trill/.test(tr._provenance && tr._provenance.source), 'trill sign provenance names the Emmentaler glyph');
  }
  for (const k of ['leftParen', 'rightParen']) {
    const g = glyphs.accidental && glyphs.accidental[k];
    ok(g && g.path, 'glyphs.accidental.' + k + ' exists');
    if (g) {
      eq(g.wSs, 0.452, 0.002, k + ' stored at STOCK width');
      eq(g.hSs * 0.63, 1.326, 0.003, k + ' at parenScale 0.63 is LilyPond\'s TrillPitchParentheses height (probe 1.26 ink)');
      ok(g.anchors && g.anchors.center, k + ' carries a center anchor (the stamp aligns on it)');
    }
  }
  // the existing entries the tool re-grabs keep their own provenance (byte-stable re-run)
  ok(glyphs.articulation.snappizz && glyphs.articulation.snappizz._provenance.ported === '2026-09-11', 'snappizz untouched by the re-run (ported 2026-09-11)');
  // the stamps render them (touchpoints 2 and 4 already cover artic-* and accidental-*)
  const Stamps = require('../notation/lib/stamps.js');
  const S = Stamps.makeStamps(glyphs);
  let svgT = '', svgP = '';
  try { svgT = Stamps.toSvg(Stamps.scaled(S.articulation('trill'), 0.70), { xPx: 10, yPx: 10, ssPx: 7.9, align: 'center' }); } catch (e) { /* red below */ }
  try { svgP = Stamps.toSvg(Stamps.scaled(S.accidental('leftParen'), 0.63), { xPx: 10, yPx: 10, ssPx: 7.9, align: 'center' }); } catch (e) { /* red below */ }
  ok(/<path/.test(svgT), 'stamps: artic-trill renders a path at scale 0.70');
  ok(/<path/.test(svgP), 'stamps: accidental-leftParen renders a path at scale 0.63');
}

// ---- 2f.3 the IR (TRILL_NOTATION_SPEC §1) ----
{
  const Extract = require(arg('--extract') ? path.resolve(arg('--extract')) : '../notation/lib/extract_core.js');
  const SonifyCore = require('../score/public/sonify_core.js');
  const score = J('scores/piece-septet.json');
  const W = [0, 176], PARTS = [0, 1, 2, 3, 4, 5, 6];
  const base = {
    scoreName: 'piece-septet', window: W, parts: PARTS, id: 'trill-battery', profile: 'trance', metaLayer: 7,
    registry: J('notation/registry/classes.json'), sampleLengths: J('bank/sample_lengths.json'),
    techniques: J('notation/registry/techniques.json').techniques,
  };
  const off = Extract.extract(score, Object.assign({}, base, { options: { chords: true } })).doc;
  const on = Extract.extract(score, Object.assign({}, base, { options: { chords: true, trills: true } })).doc;
  const zones = score.objects.filter(o => o.type === 'zone' && o.midiModel === 'trill' && o.trill && o.startTime >= W[0] && o.startTime < W[1] && PARTS.includes(o.layer));
  const trillIds = new Set(score.objects.filter(o => o.type === 'zone' && o.midiModel === 'trill').map(o => o.id));
  const eaten = score.objects.filter(o => o.type === 'waveCurve' && o.mutedBy && trillIds.has(o.mutedBy) && o.startSeconds >= W[0] && o.startSeconds < W[1] && PARTS.includes(o.layer));
  const trEv = on.events.filter(e => e.env === 'trill');

  ok(!off.events.some(e => e.env === 'trill'), 'trills OFF: no env trill event (every existing page extracts as before)');
  ok(eaten.every(o => off.events.some(e => e.source.objectId === o.id)), 'trills OFF: the eaten notes are still extracted (' + eaten.length + ')');
  ok(zones.length > 0, 'the live score holds trill zones in 0–176 s (' + zones.length + ')');
  ok(trEv.length === zones.length && zones.every(z => trEv.filter(e => e.source.objectId === z.id).length === 1), 'trills ON: every trill zone in window × parts is exactly one env trill event');
  ok(!on.events.some(e => eaten.some(o => o.id === e.source.objectId)), 'trills ON: no event sources a note a trill ate (mutedBy)');
  ok(on.events.length === off.events.length - eaten.length + zones.length, 'trills ON: events = off − eaten + trills (' + on.events.length + ')');
  const chunkOf = id => on.chunks.find(c => c.events.includes(id));
  let bad = [];
  for (const e of trEv) {
    const z = zones.find(q => q.id === e.source.objectId);
    const c = chunkOf(e.id);
    const s = e.level && e.level.samples;
    const nb = e.trill && e.trill.neighbour;
    const STEPS = 'CDEFGAB';
    const nextStep = STEPS[(STEPS.indexOf(e.pitch.spelled.step) + 1) % 7];
    if (!c || c.events.length !== 1 || c.class !== 'trill' || c.part !== z.layer) bad.push(e.id + ' chunk');
    if (!s || s.length !== 101 || s.some(v => !(v >= 0 && v <= 1))) bad.push(e.id + ' samples');
    if (Math.abs(e.onset - z.startTime) > 1e-9 || Math.abs(e.duration - (z.endTime - z.startTime)) > 1e-9) bad.push(e.id + ' span');
    if (!nb || nb.midi !== e.pitch.midi + z.trill.interval) bad.push(e.id + ' neighbour midi');
    else if (nb.spelled.step !== nextStep && Math.abs(nb.spelled.alter) <= 1 && !(Extract.naiveSpell(nb.midi).step === nb.spelled.step)) bad.push(e.id + ' neighbour step ' + nb.spelled.step);
  }
  ok(!bad.length, 'every trill event: its own chunk (class trill, the zone\'s part) · 101 samples in 0–1 · the zone\'s span · neighbour = pitch + interval, the next letter up' + (bad.length ? ' — ' + bad.slice(0, 6).join(', ') : ''));

  // THE CURVE: the port equals composer.html's own getYAtPos, lifted from the live file (with a smooth node,
  // the case sonify_core.evalWaveCurve does not cover)
  const html = fs.readFileSync(path.join(ROOT, 'score/public/composer.html'), 'utf8');
  const i0 = html.indexOf('    getYAtPos(wc, pos) {');
  const i1 = html.indexOf('\n    },', i0);
  ok(i0 > 0 && i1 > i0, 'composer.html still defines getYAtPos (the port\'s reference)');
  if (i0 > 0 && i1 > i0 && Extract.curveYAtPos) {
    const body = html.slice(html.indexOf('{', i0) + 1, i1);
    const ref = new Function('wc', 'pos', body).bind({ computeSegY: SonifyCore.computeSegY });
    const syn = { nodes: [{ pos: 0, y: 1 }, { pos: 0.3, y: 9, smooth: 0.8 }, { pos: 0.7, y: 2, smooth: 0.5 }, { pos: 1, y: 7 }],
      segments: [{ model: 'bezier', slope: 0.4 }, { model: 'ctrl', slope: 0, cx: 0.3, cy: 0.9 }, { model: 'bezier', slope: -0.2 }] };
    let maxD = 0, maxDev = 0;
    for (let k = 0; k <= 400; k++) {
      const pos = k / 400;
      maxD = Math.max(maxD, Math.abs(Extract.curveYAtPos(syn, pos) - ref(syn, pos)));
      maxDev = Math.max(maxDev, Math.abs(ref(syn, pos) - SonifyCore.evalWaveCurve(syn, pos) * 10));
    }
    ok(maxD < 1e-12, 'curveYAtPos === composer.html getYAtPos on a smoothed curve, 401 points (max diff ' + maxD + ')');
    ok(maxDev > 0.05, 'the smoothed test curve is one sonify_core.evalWaveCurve gets wrong (max ' + maxDev.toFixed(3) + ' of 10) — the port is not vacuous');
  } else ok(false, 'extract_core exports curveYAtPos');

  // THE REFERENCE: each trill's samples equal an independent reading of its window over its span
  {
    let worst = 0;
    const win = { A: 8, B: 9, C: 10 };
    for (const e of trEv) {
      const z = zones.find(q => q.id === e.source.objectId);
      const L = z.trill.curveRef === 'auto' ? 8 : win[z.trill.curveRef];
      if (L == null) continue;
      const cs = score.objects.filter(o => o.type === 'waveCurve' && o.layer === L && !o.groupId && o.sonifyNote == null && o.endSeconds > z.startTime && o.startSeconds < z.endTime);
      if (!cs.length || cs.some(c => c.nodes.some(n => n.smooth > 0))) continue;
      for (let i = 0; i <= 100; i += 10) {
        const sec = z.startTime + (z.endTime - z.startTime) * i / 100;
        const c = cs.find(o => sec >= o.startSeconds && sec <= o.endSeconds);
        if (!c) continue;
        const v = Math.max(0, Math.min(1, SonifyCore.evalWaveCurve(c, (sec - c.startSeconds) / (c.endSeconds - c.startSeconds))));
        worst = Math.max(worst, Math.abs(v - e.level.samples[i]));
      }
    }
    ok(worst < 2e-3, 'every trill\'s samples match its window read independently (sonify_core, no smooth nodes) — worst ' + worst.toFixed(5));
  }

  // THE SPELLING RULE, by cases
  if (Extract.spellNeighbour) {
    const S = (st, al, oc) => ({ step: st, alter: al, octave: oc });
    const f = s => s.step + (s.alter > 0 ? '#'.repeat(s.alter) : 'b'.repeat(-s.alter)) + s.octave;
    const cases = [[S('C', 0, 4), 61, 'Db4'], [S('C', 0, 2), 38, 'D2'], [S('E', 0, 4), 65, 'F4'], [S('B', 0, 3), 60, 'C4'], [S('B', 0, 3), 61, 'C#4'],
      [S('C', 1, 4), 63, 'D#4'], [S('G', 1, 3), 57, 'A3'], [S('B', 1, 3), 62, 'D4']];
    const got = cases.map(([m, n, want]) => [f(Extract.spellNeighbour(m, n)), want]);
    ok(got.every(([g, w]) => g === w), 'neighbour spelling: next letter up; a double accidental falls back — ' + got.map(([g, w]) => g + (g === w ? '' : '≠' + w)).join(' '));
  } else ok(false, 'extract_core exports spellNeighbour');

  // THE VALIDATOR accepts a trill page and still refuses a broken one
  if (!trEv.length) ok(false, 'ir_validate checks skipped: the extraction holds no trill event');
  else {
    const { spawnSync } = require('child_process');
    const tmp = path.join(require('os').tmpdir(), 'trill-battery.ir.json');
    const doc = JSON.parse(JSON.stringify(on));
    fs.writeFileSync(tmp, JSON.stringify(doc));
    const r1 = spawnSync(process.execPath, [path.join(ROOT, 'tools/ir_validate.js'), tmp, '--against-source', '--complete'], { encoding: 'utf8' });
    ok(r1.status === 0, 'ir_validate: the trills-ON extraction is VALID against source and complete' + (r1.status ? ' — ' + (r1.stdout + r1.stderr).split('\n').slice(0, 3).join(' | ') : ''));
    const broken = JSON.parse(JSON.stringify(on));
    broken.events.find(e => e.env === 'trill').trill.interval += 1;
    fs.writeFileSync(tmp, JSON.stringify(broken));
    const r2 = spawnSync(process.execPath, [path.join(ROOT, 'tools/ir_validate.js'), tmp, '--against-source', '--complete'], { encoding: 'utf8' });
    ok(r2.status !== 0 && /interval/.test(r2.stdout + r2.stderr), 'ir_validate: a wrong interval is refused');
    const missing = JSON.parse(JSON.stringify(on));
    const gone = missing.events.find(e => e.env === 'trill');
    missing.events = missing.events.filter(e => e !== gone);
    missing.chunks = missing.chunks.filter(c => !c.events.includes(gone.id));
    fs.writeFileSync(tmp, JSON.stringify(missing));
    const r3 = spawnSync(process.execPath, [path.join(ROOT, 'tools/ir_validate.js'), tmp, '--against-source', '--complete'], { encoding: 'utf8' });
    ok(r3.status !== 0 && /trill .* has no event/.test(r3.stdout + r3.stderr), 'ir_validate --complete: a missing trill is refused');
    fs.unlinkSync(tmp);
  }
}

console.log(pass + ' passed, ' + fail + ' failed');
console.log(fail ? 'TRILLS RED: ' + fail + ' failure(s)' : 'TRILLS GREEN: 2f.2 glyphs · 2f.3 IR');
process.exit(fail ? 1 : 0);
