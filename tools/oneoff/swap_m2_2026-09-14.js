// Kept for the record (RUNNING_LOG §467 / §471). A one-off of 2026-09-14; paths point at this repo's root. Not a tool.
// swap_m2.js — M2 (grp-morph-03): the cello's seat given to the bass clarinet (composer, 2026-09-14, session 11).
// Replaces the BCl (lane 1) and Vc (lane 6) lines with the seat-swapped render of ACT-SPECTRAL-04; the other four lanes are
// untouched (the engine renders them identically — verified before writing). Files the render as ACT-SPECTRAL-05.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = 'C:/Users/jwloy/GitHub/septet_2026', SCR = path.dirname(__filename);
const M = require(ROOT + '/score/public/morph.js'), SEP = require(ROOT + '/score/public/morph_septet.js'), BC = require(ROOT + '/score/public/beating_calc.js');
const recipe = vm.runInNewContext(fs.readFileSync(ROOT + '/sandbox/instruments.js', 'utf8') + '\n;INSTRUMENTS;', {});
const tracks = vm.runInNewContext(fs.readFileSync(ROOT + '/score/public/composer.html', 'utf8').match(/const TRACKS = (\[[\s\S]*?\]);/)[1], {});
const env = { recipe, tracks, BC, M, SEP };
const clone = o => JSON.parse(JSON.stringify(o));
const assert = (c, m) => { if (!c) { console.error('ABORT: ' + m); process.exit(1); } console.log('ok  ' + m); };

// ---- the files, backed up first ----
const PIECE = ROOT + '/scores/piece-septet.json', MODELS = ROOT + '/bank/morph_models.json';
const rawP = fs.readFileSync(PIECE, 'utf8'), rawM = fs.readFileSync(MODELS, 'utf8');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(SCR + '/piece-septet.before-swap-' + stamp + '.json', rawP);
fs.writeFileSync(SCR + '/morph_models.before-swap-' + stamp + '.json', rawM);
const P = JSON.parse(rawP), MB = JSON.parse(rawM);
const indentOf = (raw, obj) => { for (const ind of [0, 1, 2, 4, '\t']) { const s = JSON.stringify(obj, null, ind); if (s === raw) return { ind, nl: '' }; if (s + '\n' === raw) return { ind, nl: '\n' }; } return null; };
const indP = indentOf(rawP, P), indM = indentOf(rawM, MB);
assert(indP !== null, 'piece-septet.json round-trips exactly (indent ' + JSON.stringify(indP) + ') — only the edits will change');
assert(indM !== null, 'morph_models.json round-trips exactly (indent ' + JSON.stringify(indM) + ')');

// ---- the converter: render notes → the panel's waveCurve objects; proven against spectralMorph.json (his Insert of the same take) ----
// the engine's own conversion (morph.js toScoreObjects) — the same function the panel's Save as ACTUAL / Insert go through
function toObjects(notes, lanes, t0, groupId, label, nextId) {
  return M.toScoreObjects({ notes, meta: { lanes } }, t0, { groupId, label, startId: nextId });
}
const A = JSON.parse(fs.readFileSync(ROOT + '/bank/actuals/ACT-SPECTRAL-04.json', 'utf8'));
const base = A.provenance.resolvedParams, pairs = A.provenance.pairs;
const S = JSON.parse(fs.readFileSync(ROOT + '/scores/spectralMorph.json', 'utf8'));
const key = o => { const c = clone(o); delete c.id; delete c.groupId; return JSON.stringify(c); };
const sOrder = (a, b) => a.startSeconds - b.startSeconds || a.layer - b.layer;
const hisInsert = S.objects.filter(o => o.type === 'waveCurve' && o.morphBend).sort(sOrder).map(key);
const mine = toObjects(A.notes, base.lanes, 0, 'x', 'SPECTRAL DRIFT', 1).sort(sOrder).map(key);
assert(hisInsert.length === 89 && mine.length === 89 && hisInsert.every((k, i) => k === mine[i]), 'the converter reproduces his Insert of the take, 89/89 objects field for field');

// ---- the renders: as stored, and with the seat swapped ----
const render = (params, prs) => { const c = SEP.cast(clone(params), prs, env); return { c, r: M.render(c.params, { maxVoices: 6, palette: c.palette }), lanes: c.params.lanes }; };
const R0 = render(base, pairs), sw = SEP.swapSeat(pairs.map(p => ({ a: p.a, b: p.b, on: p.on })), 0, 'a', 1), R1 = render(base, sw);
const perLane = R => { const o = {}; R.r.notes.forEach(n => (o[R.lanes[n.voice]] = o[R.lanes[n.voice]] || []).push(n)); return o; };
const L0 = perLane(R0), L1 = perLane(R1);
assert(sw.map(p => p.a + '+' + p.b).join(' ') === '1+6 3+5 0+4', 'the swapped cast: BCl+Vc · Vn1+Va · Fl+Vn2 (' + sw.map(p => p.a + '+' + p.b).join(' ') + ')');
assert([0, 3, 4, 5].every(L => JSON.stringify(L0[L]) === JSON.stringify(L1[L])), 'the four other lanes render identically with the seat swapped');
assert(!(R1.c.warnings || []).length, 'no cast warnings');

// ---- the edit ----
const T0 = 314.000, GID = 'grp-morph-03';
const m2 = P.objects.filter(o => o.groupId === GID && o.morphBend);
assert(Math.min(...m2.map(o => o.startSeconds)) === T0 && P.objects.find(o => o.type === 'marker' && o.groupId === GID).time === T0, 'M2 starts at exactly ' + T0);
const removeIds = new Set(m2.filter(o => o.layer === 1 || o.layer === 6).map(o => o.id));
assert(removeIds.size === 31, '31 notes to remove on lanes 1 and 6 (BCl 16 + Vc 15)');
const newNotes = R1.r.notes.filter(n => R1.lanes[n.voice] === 1 || R1.lanes[n.voice] === 6).sort((a, b) => a.tStart - b.tStart || a.voice - b.voice);
const newObjs = toObjects(newNotes, R1.lanes, T0, GID, 'SPECTRAL DRIFT', P.nextId);
assert(newObjs.length === 29 && newObjs.filter(o => o.layer === 1).length === 14 && newObjs.filter(o => o.layer === 6).length === 15, '29 new notes: BCl 14 + Vc 15');
const firstIdx = P.objects.findIndex(o => removeIds.has(o.id));
const kept = P.objects.filter(o => !removeIds.has(o.id));
const insertAt = kept.findIndex(o => P.objects.indexOf(o) >= firstIdx);
kept.splice(insertAt < 0 ? kept.length : insertAt, 0, ...newObjs);
P.objects = kept; P.nextId += newObjs.length;

// ---- the take, ACT-SPECTRAL-05 ----
const span = Math.max(...R1.r.notes.map(n => n.tStart + n.dur));
const midis = R1.r.notes.map(n => n.midi);
const A5 = { entity: 'ACT-SPECTRAL-05', kind: 'actual', label: 'SPECTRAL-05 · ' + Math.round(span) + ' s · piece-septet · Vc↔BCl seats swapped', tags: A.tags,
  spanSec: +span.toFixed(2), parts: 6, register: Math.min(...midis) + '–' + Math.max(...midis),
  objects: toObjects(R1.r.notes, R1.lanes, 0, 'grp-actual', 'SPECTRAL DRIFT', 1), notes: R1.r.notes,
  provenance: Object.assign(clone(A.provenance), { resolvedParams: Object.assign(clone(base), { lanes: R1.lanes }), pairs: sw, captured: '2026-09-14',
    palette: R1.c.palette.map(x => ({ lane: x.lane, label: x.label, technique: x.technique, reachCents: x.reachCents, lo: x.lo, hi: x.hi })),
    note: "ACT-SPECTRAL-04 with pair 1's seats swapped (the bass clarinet takes the cello's seat: it holds, the cello travels). Composer, 2026-09-14, session 11. Placed in piece-septet at 314.000 as M2's BCl + Vc lines by swap_m2.js; the other four lines of M2 were left as they were (identical render)." }),
  placements: [] };
assert(!fs.existsSync(ROOT + '/bank/actuals/ACT-SPECTRAL-05.json'), 'ACT-SPECTRAL-05 does not exist yet');
fs.writeFileSync(ROOT + '/bank/actuals/ACT-SPECTRAL-05.json', JSON.stringify(A5, null, 2));
if (!MB.models.SPECTRAL.actuals.includes('ACT-SPECTRAL-05')) MB.models.SPECTRAL.actuals.push('ACT-SPECTRAL-05');
fs.writeFileSync(MODELS, JSON.stringify(MB, null, indM.ind) + indM.nl);
fs.writeFileSync(PIECE, JSON.stringify(P, null, indP.ind) + indP.nl);
console.log('WRITTEN: piece-septet.json (nextId ' + P.nextId + '), ACT-SPECTRAL-05.json, morph_models.json');

// ---- verify from disk ----
const B = JSON.parse(rawP), N = JSON.parse(fs.readFileSync(PIECE, 'utf8'));
const bi = {}; B.objects.forEach(o => bi[o.id] = o); const ni = {}; N.objects.forEach(o => ni[o.id] = o);
const removed = B.objects.filter(o => !ni[o.id]), added = N.objects.filter(o => !bi[o.id]), changed = N.objects.filter(o => bi[o.id] && JSON.stringify(bi[o.id]) !== JSON.stringify(o));
assert(removed.length === 31 && removed.every(o => o.groupId === GID && (o.layer === 1 || o.layer === 6)), 'removed 31, all M2 lanes 1/6');
assert(added.length === 29 && added.every(o => o.groupId === GID) && changed.length === 0, 'added 29 in M2, no other object changed');
assert(Object.keys(N).filter(k => JSON.stringify(N[k]) !== JSON.stringify(B[k])).join() === 'objects,nextId', 'top level: only objects and nextId differ');
const now = N.objects.filter(o => o.groupId === GID && o.morphBend); const LBL = ['Fl', 'BCl', 'Pno', 'Vn1', 'Vn2', 'Va', 'Vc'];
for (const L of [0, 1, 3, 4, 5, 6]) { const ns = now.filter(o => o.layer === L).sort((a, b) => a.startSeconds - b.startSeconds); const g = ns.slice(1).map((o, i) => o.startSeconds - ns[i].endSeconds);
  let lo = Infinity, hi = -Infinity; ns.forEach(o => o.morphBend.forEach(([t, c]) => { lo = Math.min(lo, o.sonifyNote * 100 + c); hi = Math.max(hi, o.sonifyNote * 100 + c); }));
  console.log('  M2 ' + LBL[L] + ': ' + ns.length + ' notes ' + ns[0].startSeconds.toFixed(2) + '→' + ns[ns.length - 1].endSeconds.toFixed(2) + ' s, gaps ' + Math.min(...g).toFixed(3) + '–' + Math.max(...g).toFixed(3) + ', travel ' + (hi - lo).toFixed(1) + ' c, ids ' + ns[0].id + '…' + ns[ns.length - 1].id); }
console.log('piano notes 183–440 untouched:', N.objects.filter(o => o.layer === 2 && !o.groupId && o.startSeconds >= 183 && o.startSeconds < 440).length);
