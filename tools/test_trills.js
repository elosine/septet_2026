// test_trills.js — PLAN 2f (2026-09-13): section 1's trills, the battery grown step by step.
//   2f.2 the glyphs — the trill sign and the neighbour's parentheses, stock size from Emmentaler
// Spec: docs/TRILL_NOTATION_SPEC.md. piece-septet.json is the composer's LIVE score: read, never written.
// --glyphs <path> runs the glyph checks against another glyphs.json (to see them go red once).
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

console.log(pass + ' passed, ' + fail + ' failed');
console.log(fail ? 'TRILLS RED: ' + fail + ' failure(s)' : 'TRILLS GREEN: 2f.2 glyphs');
process.exit(fail ? 1 : 0);
