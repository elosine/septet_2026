// morph_septet.js — THE MORPH PANEL'S CAST FOR THE SEPTET (2026-09-07, RUNNING_LOG §197–203; MORPH_NOTES §3; CN-37).
//
// The tuba piece's morph engine (morph.js) maps voices 1:1 onto lanes 0 … n−1 and carries the tuba's constants; this module puts
// the septet in front of it without touching how it schedules: PAIRS. A pair is two seats (lanes) — the default cast Vc + Va low,
// Vn1 + Vn2 in the middle, Fl + BCl on top (his word; the piano out, CN-34) — and takes two adjacent pitches of the model's set
// (a doubled pitch in BLOOM, two that close to one in CONVERGE, two chord notes in BALANCE). From the cast it derives what the
// engine needs: the source (and target) pitches FOLDED so both players of a pair hold theirs (D26: the pair moves by octaves as one
// unit, a tie down; no octave serving both → the pair is silent and says so), the `lanes` list in pitch order, and the PALETTE per
// voice (the player's ordinary voice, its measured range, its bend reach = the smaller of a whole tone — his word, §199 — and the
// sampler's measured range, the breath or bow ceiling) that morph.js takes as `opts.palette`. Pure: no DOM, no MIDI; loads on the
// page (window.MorphSeptet) and in node (module.exports) for tools/morph_septet_check.js.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.MorphSeptet = api;
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const MORPH_PLAYER_ST = 2;                        // a whole tone: "well within the range for any player … with their embouchure" (§199)
const SHIFTS = [0, -12, 12, -24, 24, -36, 36];    // the fold's tries: as written, then a tie DOWN (§180), by octaves
const DEFAULT_PAIRS = [{ a: 6, b: 5 }, { a: 3, b: 4 }, { a: 0, b: 1 }];   // Vc + Va · Vn1 + Vn2 · Fl + BCl (CN-37)
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

// the lanes that may hold a morph voice: every track whose recipe bends (the piano's `beating: false` keeps it out)
function bendingLanes(env) {
    const out = [];
    (env.tracks || []).forEach((t, i) => { const I = env.recipe[t.instKey]; if (I && I.beating !== false && (I.playerBendSt == null || I.playerBendSt > 0)) out.push(i); });
    return out;
}
function instOf(env, lane) { const t = env.tracks[lane]; return t ? t.instKey : null; }
function labelOf(env, lane) { const t = env.tracks[lane]; return t ? (t.short || t.label || String(lane)) : String(lane); }

// one voice's palette entry for a lane
function paletteFor(env, lane) {
    const BC = env.BC, key = instOf(env, lane), I = key && env.recipe[key];
    if (!I) return null;
    const voice = BC.ordinaryVoice(env.recipe, key), range = BC.ordinaryRange(env.recipe, key) || [I.rangeLow, I.rangeHigh];
    const samplerSt = I.bendRangeSt || 2;
    return {
        lane: lane, instKey: key, label: labelOf(env, lane),
        technique: voice ? voice.key : (I.ordinary || 'ord'),
        lo: range[0], hi: range[1],
        reachCents: Math.round(Math.min(MORPH_PLAYER_ST, samplerSt) * 100),
        samplerSt: samplerSt,
        ceiling: level01 => BC.ceilingFor(key, level01).seconds,
        gapS: BC.ceilingFor(key, 0.5).gapS,
        kind: BC.ceilingFor(key, 0.5).kind,
    };
}

// D26: the fold of a pair as ONE unit — the octave shift under which seat a holds every note in notesA and seat b every note in
// notesB (the pair's notes, and for CONVERGE their targets); as written first, then down, then up; null when no octave serves both
function foldPair(env, instA, instB, notesA, notesB) {
    const BC = env.BC;
    for (const sh of SHIFTS) {
        const okA = notesA.every(n => BC.holds(env.recipe, instA, n + sh));
        const okB = notesB.every(n => BC.holds(env.recipe, instB, n + sh));
        if (okA && okB) return sh;
    }
    return null;
}

// THE CAST: params (the model's, resolved and nudged) + pairs [{ a, b, on }] → the engine's params and palette, and the pairs' story
function cast(params, pairsIn, env) {
    const M = env.M, warnings = [];
    const pairs = (pairsIn && pairsIn.length ? pairsIn : DEFAULT_PAIRS).map((p, i) => ({ i: i, a: p.a, b: p.b, on: p.on !== false }));
    const P = JSON.parse(JSON.stringify(params || {}));
    const src0 = (P.source && P.source.kind !== 'vert' && Array.isArray(P.source.midi)) ? P.source.midi.slice().sort((x, y) => x - y) : [];
    if (P.source && P.source.kind === 'vert') warnings.push('CAST: a chord by id (source.kind vert) is not resolved by the panel — give pitches');
    const want = pairs.length * 2;
    const src = (src0.length > want && M && M.reduceSource) ? M.reduceSource(src0, want) : src0;   // the tuba's eight → six, whole clusters kept
    if (src0.length > want) warnings.push('CAST: ' + src0.length + ' pitches for ' + pairs.length + ' pairs — reduced to ' + src.length + ' (whole clusters kept)');
    const tgt = (P.target && Array.isArray(P.target.midi)) ? P.target.midi.slice().sort((x, y) => x - y) : null;
    const voices = [];
    pairs.forEach(p => {
        const nA = src[2 * p.i], nB = src[2 * p.i + 1];
        p.notesIn = [nA, nB]; p.shift = null; p.silent = true; p.why = '';
        const iA = instOf(env, p.a), iB = instOf(env, p.b);
        if (nA == null || nB == null) { p.why = 'no pitches for this pair in the set'; return; }
        if (!iA || !iB) { p.why = 'a seat without a player'; return; }
        const tA = tgt ? tgt[2 * p.i] : null, tB = tgt ? tgt[2 * p.i + 1] : null;
        const sh = foldPair(env, iA, iB, tA != null ? [nA, tA] : [nA], tB != null ? [nB, tB] : [nB]);
        if (sh == null) { p.why = 'no octave serves ' + labelOf(env, p.a) + ' + ' + labelOf(env, p.b) + ' for ' + nm(nA) + ' · ' + nm(nB); warnings.push('CAST: pair ' + (p.i + 1) + ' silent — ' + p.why); return; }
        p.shift = sh; p.silent = false;
        p.notesOut = [nA + sh, nB + sh];
        p.targetsOut = tgt ? [tA + sh, tB + sh] : null;
        voices.push({ pitch: nA + sh, lane: p.a, pair: p.i, tgt: tA != null ? tA + sh : null });
        voices.push({ pitch: nB + sh, lane: p.b, pair: p.i, tgt: tB != null ? tB + sh : null });
    });
    voices.sort((x, y) => x.pitch - y.pitch);           // the engine's voice order is by pitch; the lanes follow it
    voices.forEach((v, k) => { v.voice = k; });
    pairs.forEach(p => { p.voices = voices.filter(v => v.pair === p.i).map(v => v.voice); });
    // pairs that interleave in pitch confuse a model that pairs by sorted order (CONVERGE's targets) — said, not fixed
    for (let k = 0; k + 1 < voices.length; k++) {
        const a = voices[k], b = voices[k + 1];
        if (a.pair !== b.pair) {
            const pa = pairs[a.pair], pb = pairs[b.pair];
            const inside = (pa.notesOut[0] < pb.notesOut[1] && pb.notesOut[0] < pa.notesOut[1]);
            if (inside) warnings.push('CAST: pairs ' + (a.pair + 1) + ' and ' + (b.pair + 1) + ' interleave in pitch (' + pa.notesOut.map(nm).join('·') + ' / ' + pb.notesOut.map(nm).join('·') + ') — the model pairs by pitch order');
        }
    }
    P.source = { kind: 'pitches', midi: voices.map(v => v.pitch) };
    if (tgt) P.target = Object.assign({}, P.target, { midi: voices.map(v => v.tgt).filter(t => t != null) });
    P.lanes = voices.map(v => v.lane);
    P.voices = voices.length;
    const palette = voices.map(v => paletteFor(env, v.lane));
    return { params: P, pairs: pairs, voices: voices, palette: palette, warnings: warnings };
}

// the render heard or inserted: only the voices of the ticked pairs (the render itself is of every pair — a pair alone is heard in
// its place, and an inserted pair keeps its timing)
function filterResult(result, castInfo) {
    if (!result || !castInfo) return result;
    const keep = new Set();
    castInfo.pairs.forEach(p => { if (p.on && !p.silent) p.voices.forEach(v => keep.add(v)); });
    const notes = result.notes.filter(n => keep.has(n.voice));
    return Object.assign({}, result, { notes: notes, meta: Object.assign({}, result.meta, { heardVoices: Array.from(keep).sort((a, b) => a - b) }) });
}

// a seat changed: the player chosen takes the seat, and whoever sat there takes the player's old seat (every player sits once)
function swapSeat(pairs, k, seat, lane) {
    const P = pairs.map(p => ({ a: p.a, b: p.b, on: p.on !== false }));
    const was = P[k][seat];
    if (was === lane) return P;
    let other = null;
    P.forEach((p, i) => { ['a', 'b'].forEach(s => { if (p[s] === lane) other = { i: i, s: s }; }); });
    P[k][seat] = lane;
    if (other) P[other.i][other.s] = was;
    return P;
}

function describePair(env, p) {
    const seats = labelOf(env, p.a) + ' + ' + labelOf(env, p.b);
    if (p.silent) return seats + ' · ✕ ' + (p.why || 'silent');
    const asIn = p.notesIn.map(nm).join(' · ');
    const mark = p.shift ? ' → ' + p.notesOut.map(nm).join(' · ') + (p.shift > 0 ? ' ↑' : ' ↓') : '';
    return seats + ' · ' + asIn + mark;
}

return { MORPH_PLAYER_ST, SHIFTS, DEFAULT_PAIRS, nm, bendingLanes, instOf, labelOf, paletteFor, foldPair, cast, filterResult, swapSeat, describePair };
}));
