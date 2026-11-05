#!/usr/bin/env node
// ottava_reshow_check.js — THE OTTAVA AT THE SEAM (day 49, for_seven_tubas RUNNING_LOG 121; NITS day 47, the
// audit's item 3): a GROUP bracket cut by a seam is drawn to the row's edge on the row of its head and shown
// again on the next row — the sign in parentheses at the row's start, the dashes running on to the hook.
// A head's own sign (the hook left of the head) belongs to its row alone. The piece has no group bracket on a
// seam today (none of its 79 cross one at the iPad's size, nor on the display), so the case is made by hand.
//   node tools/ottava_reshow_check.js      (exit 1 on any failure)
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Coords = require(path.join(ROOT, 'notation', 'lib', 'coords.js'));
const Render = require(path.join(ROOT, 'notation', 'lib', 'render.js'));
const G = require(path.join(ROOT, 'notation', 'lib', 'glyphs.json'));
let pass = 0, fail = 0;
const assert = (c, name, d) => { if (c) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (d !== undefined ? ' — ' + JSON.stringify(d) : '')); } };
const SEC_PER_SS = 0.0717, SS_PX = 10, GUTTER = 40, PX_PER_S = SS_PX / SEC_PER_SS;
const lg = G.ottavaText.vb8;
function row(window) {
  const widthPx = GUTTER + (window[1] - window[0]) * PX_PER_S;
  return { view: Coords.makeView({ widthPx, heightPx: 200, window, gutterPx: GUTTER, systems: Coords.systemsForParts([0]), ssPerSystem: 20 }), widthPx };
}
function render(model, r, clamp) {
  return Render.renderSection(model, r.view, G, Object.assign({ engraving: {} }, clamp ? { clamp: { x0Px: GUTTER, x1Px: r.widthPx }, clipId: 'c' } : {}));
}
const group = { systems: [{ part: 0, items: [{ k: 'ottava', t: 10, dx0Ss: 0.25, dx1Ss: 8, ySs: -5, label: 'vb8', dir: 'below' }] }] };
const head = { systems: [{ part: 0, items: [{ k: 'ottava', t: 10, dx0Ss: -2.2, dx1Ss: -1.07, ySs: -5, label: 'vb8', dir: 'below' }] }] };
const A = row([8, 10.2]), B = row([10.2, 12.4]);   // the head on row A, the hook (10 + 8 ss = 10.57 s) on row B
const sign = s => s.includes(lg.path.slice(0, 40));
const parens = s => (s.match(/class="ottava-reshow"/g) || []).length;
const dashes = s => (s.match(/<line /g) || []).length;
console.log('-- the group bracket, cut at the seam');
const gA = render(group, A, true), gB = render(group, B, true);
assert(sign(gA) && parens(gA) === 0, 'row A: the sign once, no parentheses', { sign: sign(gA), parens: parens(gA) });
assert(dashes(gA) >= 1, 'row A: dashes run toward the edge', dashes(gA));
assert(sign(gB) && parens(gB) === 2, 'row B: the sign again, in parentheses', { sign: sign(gB), parens: parens(gB) });
assert(dashes(gB) >= 2, 'row B: dashes on to the hook, and the hook', dashes(gB));
const xs = [...gB.matchAll(/<line x1="([\d.]+)"/g)].map(m => +m[1]);
assert(xs.every(x => x >= GUTTER - 0.01 && x <= B.widthPx + 0.01), 'row B: every line inside the row', xs);
console.log('-- the same bracket without the stand\'s clamp (the film, the print): unchanged — the next row shows nothing');
assert(!sign(render(group, B, false)) && parens(render(group, B, false)) === 0, 'row B without clamp: no ottava ink');
console.log('-- a head\'s own sign: its row only');
assert(sign(render(head, A, true)), 'row A: the head\'s sign');
assert(!sign(render(head, B, true)) && parens(render(head, B, true)) === 0, 'row B: nothing re-shown for a head\'s sign');
console.log((fail ? 'FAIL' : 'PASS') + ' — ottava_reshow_check: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
