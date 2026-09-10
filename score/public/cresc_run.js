// cresc_run.js — CRESC RUN: a set of overlapping crescendos whose onsets accelerate and whose lengths shorten — ONE LINE PER VERSION
// (CN-59, 2026-09-09 evening; RUNNING_LOG §325).
//
// His words: *"The first gesture in my third section for this piece will be a set of overlapping crescendos. They'll go from PPP to FFF,
// and their onsets will accelerate. And their durations will shorten each new onset. The issue is I don't have the specs. I don't know
// what those are yet. So I need to hear a few versions … and then settle on the one I want."* — and, on the drawer: *"everything I want
// to set is so difficult to find … We could just do it in the save score, and you could perhaps give me a console script every time."*
//
// So: no panel. In the score's console (F12 → Console), one line writes the gesture at the playhead as one group; SPACE plays it (the
// score's own playback — the crescendo's CC7 ramp on the curve channels, 1l); the next line REPLACES it; `crescRun.keep()` freezes the
// one he likes so the next line starts a new one beside it. Every number is a plain option:
//
//   crescRun({ gap0: 2, gapN: 0.5, steep: 0.85, len: 2 })
//
//   gap0 · gapN    the first and the last gap between onsets, in SECONDS (attack to attack, whoever plays)
//   steep          each gap as a fraction of the one before (0.85 = a steady push; 0.7 = a rush) — the count follows
//   n              OR the number of onsets (then steep follows)
//   shape          'geometric' (default) · 'curve' (+ curve −1…1: bloom … surge) · 's' (+ ease) · 'twoPhase' (+ knee) · 'lateRush' (+ gamma) · 'even'
//   hold           extra onsets at the last gap after the ramp
//   len            each crescendo's length as a MULTIPLE of the gap to the next onset (2 = twice the gap: they shorten with the rush)
//   lenS           OR one fixed length in seconds for all of them
//   lenN · lenSN   the same two, at the END of the run — a ramp: len 2 → lenN 4 makes the overlap grow; lenS 2.2 → lenSN 1.4 in seconds
//   dyn            ['ppp', 'fff'] — from → to (ppp pp p mp mf f ff fff)
//   secco          true (the cut at the end) · false (let it ring)
//   players        the lanes, in the order of the round robin — default the six bending players, no piano: [0, 1, 3, 4, 5, 6]
//   pitches        a list of MIDI notes dealt in turn (each folded into the player's range), or 'keyboard' = what the strikes drawer holds
//   at             seconds; default the playhead
//
// A crescendo can never run into that player's next sound: its length is capped 0.17 s before it (1l's end rule), and it is never
// shorter than 0.30 s (the floor) — the readout says how many were capped or floored. The numbers of a call are remembered, so the next
// call can change ONE: crescRun({ steep: 0.8 }). crescRun.fresh() forgets them. crescRun.presets holds three starting points.
(function (root) {
'use strict';
const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const CR = () => root.Cresc || null;
const AC = () => root.AccelCalc || null;
const GROUP = 'grp-crun';                                   // the working run's group — replaced by every call
const DEFAULTS = { gap0: 2, gapN: 0.5, steep: 0.85, shape: 'geometric', hold: 0, len: 2, dyn: ['ppp', 'fff'], secco: true,
                   players: [0, 1, 3, 4, 5, 6], pitches: [41, 48, 55, 62, 69, 76] };
const r3 = x => Math.round(x * 1000) / 1000;

function pitchList(p) {
    if (p === 'keyboard') {
        const D = root.StrikeDrawer;
        const vs = D && D.voices && D.voices.length ? D.voices.map(v => v.pitch) : null;
        if (!vs) { console.warn('[crescRun] the strikes drawer holds nothing — using the default stack'); return DEFAULTS.pitches.slice(); }
        return vs;
    }
    if (typeof p === 'string') p = p.split(/[\s,]+/);
    const out = (Array.isArray(p) ? p : [p]).map(x => { if (typeof x === 'number') return x; const CRe = CR(); const m = /^([A-Ga-g])(#|b)?(-?\d)$/.exec(String(x).trim()); if (!m) return NaN; const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1].toUpperCase()]; return base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12; }).filter(x => isFinite(x));
    return out.length ? out : DEFAULTS.pitches.slice();
}

function crescRun(opts) {
    const C = C_(), CRe = CR(), A = AC();
    if (!C || !CRe || !A) { console.error('[crescRun] needs the score, cresc.js and accel_calc.js'); return null; }
    opts = opts || {};
    const last = crescRun.last || {};
    const o = Object.assign({}, DEFAULTS, last, opts);
    // n and steep are two ways of saying one thing: the one given in THIS call wins; else the one the last call used
    if ('n' in opts) { delete o.steep; } else if ('steep' in opts) { delete o.n; }
    if ('lenS' in opts || 'lenSN' in opts) { delete o.len; delete o.lenN; if (o.lenS == null) o.lenS = o.lenSN; }
    else if ('len' in opts || 'lenN' in opts) { delete o.lenS; delete o.lenSN; if (o.len == null) o.len = DEFAULTS.len; }
    if (o.steep == null && o.n == null) o.steep = DEFAULTS.steep;
    if (o.n != null && !('steep' in opts)) delete o.steep;   // a remembered count keeps ruling; the default steepness must not creep back beside it
    if (o.len == null && o.lenS == null) o.len = DEFAULTS.len;
    crescRun.last = Object.assign({}, o);

    // ---- the onsets: the drawer's own acceleration calculator (1h), in ms
    const spec = { shape: o.shape, gapStart: o.gap0 * 1000, gapEnd: o.gapN * 1000, length: o.n != null ? { count: o.n } : { ratio: o.steep },
                   hold: { gaps: o.hold || 0 }, curve: o.curve, ease: o.ease, knee: o.knee, gamma: o.gamma };
    const R = A.run(spec);
    const onsets = R.onsets.map(ms => ms / 1000);
    const N = onsets.length;
    const t0 = o.at != null ? +o.at : +C.getTimeAtPlayhead().toFixed(3);

    // ---- who and what
    const lanes = (o.players || DEFAULTS.players).map(Number).filter(l => l >= 0 && C.trackInstrument(l));
    if (!lanes.length) { console.error('[crescRun] no playable lanes in players'); return null; }
    const pool = pitchList(o.pitches);
    const dynLo = CRe.dynHeight(Array.isArray(o.dyn) ? o.dyn[0] : 'ppp'), dynHi = CRe.dynHeight(Array.isArray(o.dyn) ? o.dyn[1] : 'fff');

    // ---- the plan: onset i → lane (round robin) → pitch (dealt in turn, folded), then the length: len × the gap to the NEXT onset
    // (whoever plays it), capped 0.17 s before that player's next sound — the run's own or the score's — and floored at 0.30 s
    C.pushUndoState();
    const before = C.objects.length;
    C.objects = C.objects.filter(x => x.groupId !== GROUP);
    const replaced = before - C.objects.length;
    const ML = (typeof META_LAYER !== 'undefined') ? META_LAYER : root.META_LAYER;
    const plan = onsets.map((t, i) => ({ i, at: r3(t0 + t), lane: lanes[i % lanes.length], gap: i < N - 1 ? onsets[i + 1] - t : (i > 0 ? t - onsets[i - 1] : o.gap0) }));
    let pi = 0;
    plan.forEach(p => {
        // crescFold gives { pitch, fold } (the octave folds counted), or null when no octave of the pitch fits the player
        for (let tries = 0; tries < pool.length; tries++) { const raw = pool[pi % pool.length]; pi++; const f = C.crescFold(raw, p.lane); if (f && f.pitch != null) { p.pitch = f.pitch; p.fold = f.fold; p.raw = raw; break; } }
        if (p.pitch == null) { const f = C.crescFold(60, p.lane); p.pitch = f && f.pitch != null ? f.pitch : 60; p.raw = null; }
    });
    const made = [], capped = [], floored = [];
    let maxEnd = t0;
    plan.forEach(p => {
        const later = C.objects.filter(x => x.layer === p.lane && x.sonifyNote != null && x.layer !== ML)
            .concat(plan.filter(q => q.lane === p.lane && q.at > p.at + 1e-6).map(q => ({ startSeconds: q.at })));
        // the length, and its ramp along the run (his "make each one overlap more and more", 2026-09-09 late): a multiple of the gap, len → lenN,
        // or seconds, lenS → lenSN — linear over the onsets; one number = the same throughout
        const p01 = N > 1 ? p.i / (N - 1) : 0;
        const want = o.lenS != null
            ? (o.lenSN != null ? +o.lenS + (+o.lenSN - +o.lenS) * p01 : +o.lenS)
            : ((o.lenN != null ? +o.len + (+o.lenN - +o.len) * p01 : +o.len) * p.gap);
        const e = CRe.endFor(p.at, later, {});
        let dur = want;
        if (e.how === 'toNextNote' && e.end - p.at < want) { dur = e.end - p.at; capped.push(p.i); }
        if (dur < CRe.DEFAULTS.minS) { dur = CRe.DEFAULTS.minS; floored.push(p.i); }
        const tech = C.ordinaryTech(p.lane) || {};
        const T = (typeof TRACKS !== 'undefined' ? TRACKS : root.TRACKS || [])[p.lane] || {};
        const wc = CRe.make(p.at, p.pitch, { lane: p.lane, tech: tech.key, label: T.short }, [], { durS: dur, dynLo, dynHi, secco: o.secco !== false });
        if (!wc) return;
        wc.id = 'wc-' + (C.nextId++);
        wc.groupId = GROUP;
        wc.properties.cresc.end = 'run';
        wc.properties.cresc.run = { i: p.i, of: N, gapS: r3(p.gap), len: o.lenS != null ? null : o.len, lenS: o.lenS != null ? o.lenS : null, capped: capped.includes(p.i), raw: p.raw };
        wc.performanceNotes = 'cresc ' + wc.properties.cresc.shape + ' ' + wc.properties.cresc.ratio + '× ' + CRe.dynName(dynLo) + '→' + CRe.dynName(dynHi) + ' ' + dur.toFixed(2) + ' s (cresc run ' + (p.i + 1) + '/' + N + ')';
        maxEnd = Math.max(maxEnd, p.at + dur);
        C.objects.push(wc);
        made.push({ i: p.i, at: p.at, lane: p.lane, pitch: p.pitch, dur: r3(dur), gap: r3(p.gap) });
    });
    C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: ML, groupId: GROUP,
        startSeconds: t0, endSeconds: r3(maxEnd),
        nodes: [{ pos: 0, y: 7.8, smooth: 0 }, { pos: 1, y: 7.8, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
        color: '#C2410C', fillMode: 'bottom', opacity: 0.5, performanceNotes: 'cresc run (drag = move, box = stretch) — ' + JSON.stringify(opts), properties: { crescRun: o } });
    C.lastInsertGroup = GROUP;
    C.curveDirty(); C.renderAll(); C.markDirty(); if (C.scheduleConflictRefresh) C.scheduleConflictRefresh();

    // ---- the readout: what was written, and how thick it is
    const voicesAt = t => made.filter(m => m.at <= t && t < m.at + m.dur).length;
    const samples = []; for (let t = t0; t < maxEnd; t += 0.05) samples.push(voicesAt(t));
    const avg = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 0, peak = samples.length ? Math.max(...samples) : 0;
    const gaps = R.gaps.map(g => g / 1000);
    const text = made.length + ' crescendos over ' + r3(maxEnd - t0) + ' s at ' + t0.toFixed(2) + ' s · gaps ' + gaps[0].toFixed(2) + ' → ' + gaps[gaps.length - 1].toFixed(2) + ' s (' + R.shape + (o.n != null ? ', ' + N + ' onsets' : ', steep ' + (+o.steep).toFixed(2)) + ')'
        + ' · lengths ' + made[0].dur.toFixed(2) + ' → ' + made[made.length - 1].dur.toFixed(2) + ' s · ' + CRe.dynName(dynLo) + '→' + CRe.dynName(dynHi) + (o.secco === false ? ' · no secco' : ' · secco')
        + ' · ' + avg.toFixed(1) + ' voices sounding, peak ' + peak
        + (capped.length ? ' · ' + capped.length + ' capped at the player\'s next entry' : '') + (floored.length ? ' · ' + floored.length + ' at the 0.30 s floor' : '')
        + (replaced ? ' · replaced the previous run' : '') + ' — SPACE plays from the playhead · CTRL+Z undoes';
    console.log('%c[crescRun] ' + text, 'color:#e8a06a');
    console.table(made.map(m => ({ n: m.i + 1, at: m.at, player: ((typeof TRACKS !== 'undefined' ? TRACKS : root.TRACKS || [])[m.lane] || {}).short || m.lane, pitch: CRe.nm(m.pitch), gap: m.gap, length: m.dur })));
    if (C.saveStatus) C.saveStatus.textContent = text;
    return { text, made, onsets, spec: o, group: GROUP };
}
// freeze the current run under its own group, so the next call writes a new one beside it
crescRun.keep = function (name) {
    const C = C_(); if (!C) return null;
    const tag = 'grp-crun-kept-' + (name ? String(name).replace(/[^A-Za-z0-9_-]+/g, '-') : Date.now().toString(36));
    let n = 0; C.objects.forEach(x => { if (x.groupId === GROUP) { x.groupId = tag; n++; } });
    if (!n) { console.warn('[crescRun] nothing to keep — write a run first'); return null; }
    C.markDirty(); C.renderAll();
    console.log('%c[crescRun] kept ' + n + ' objects as ' + tag + ' — the next call starts a new run', 'color:#e8a06a');
    return tag;
};
crescRun.fresh = function () { crescRun.last = null; console.log('[crescRun] forgot the last settings — the defaults apply'); };
crescRun.presets = {
    push:   { gap0: 2.0, gapN: 0.5, steep: 0.85, len: 2,   dyn: ['ppp', 'fff'] },   // a steady push, ~3 voices sounding
    rush:   { gap0: 1.5, gapN: 0.3, steep: 0.78, len: 1.5, dyn: ['ppp', 'fff'] },   // tighter and steeper
    pile:   { gap0: 2.5, gapN: 0.6, steep: 0.85, lenS: 4,  dyn: ['ppp', 'fff'] },   // long ones piling up while the onsets close in
};
crescRun.DEFAULTS = DEFAULTS; crescRun.GROUP = GROUP; crescRun.last = null;
root.crescRun = crescRun;
}(typeof self !== 'undefined' ? self : this));
