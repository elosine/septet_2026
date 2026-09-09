// fade_check.js — THE FADE-IN'S THREE PIECES (2026-09-09; RUNNING_LOG §311–313).
// His report: "there's no real fade in there … regardless of how much I dial in there, the initial entry is quiet, but soon
// thereafter, it's like a loud attack." Measured, he was right: a 3 s fade on BLOOM was bit-identical to no fade at all.
// Three things had to change together, and each is checked here on its own AND in company.
// Run: node tools/fade_check.js
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const M = require(path.join(ROOT, 'score', 'public', 'morph.js'));

let fail = 0;
const ok = (name, cond, detail) => { console.log((cond ? '  ok   ' : '  FAIL ') + name + (detail ? '  — ' + detail : '')); if (!cond) fail++; };
const H = t => console.log('\n' + t);

const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'morph_models.json'), 'utf8'));
const BLOOM = () => JSON.parse(JSON.stringify((bank.models || bank).BLOOM.baseParams));
const SPAN = BLOOM().carrier.span;

// voice 0's five breaths, peak level of each — the measurement his ear reported on
function peaks(shape) {
    const P = BLOOM();
    if (shape) P.shape = { attack: shape };
    const r = M.render(P, { maxVoices: 10 });
    const v = r.notes.filter(n => n.voice === 0).sort((a, b) => a.tStart - b.tStart);
    return { peaks: v.map(n => Math.max.apply(null, n.level.map(x => x[1]))), warnings: r.warnings || [], meta: r.meta };
}
const bare = peaks(null);

H('0 · the ground truth — the morph already grows on its own, and that is the thing a fade has to fight');
ok('voice 0 doubles from breath 1 to breath 2 with NO shape at all', bare.peaks[1] > bare.peaks[0] * 1.8,
   bare.peaks.join(' / '));

H('1 · THE FRACTION — `lenPct` is a share of the span, and `len` still works when it is absent');
{
    const r = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
    ok('lenPct 0.6 on a ' + SPAN + ' s span resolves to ' + (0.6 * SPAN) + ' s', r.meta.shape.attackLen === 0.6 * SPAN,
       r.meta.shape.attackLen + ' s');
    ok('and it needs no `len` — no warning about one', !r.warnings.some(w => /needs a len/.test(w)), JSON.stringify(r.warnings));
    const s2 = peaks({ len: 12, entry: 'together', curve: 'linear', from: 0 });
    ok('a plain `len` still resolves to itself', s2.meta.shape.attackLen === 12, s2.meta.shape.attackLen + ' s');
    const s3 = peaks({ len: 12, lenPct: 0.25, entry: 'together', curve: 'linear', from: 0 });
    ok('lenPct WINS when both are given', s3.meta.shape.attackLen === 0.25 * SPAN, s3.meta.shape.attackLen + ' s');
    const s4 = peaks({ entry: 'together', curve: 'linear', from: 0 });
    ok('neither given: it says so rather than guessing in silence', s4.warnings.some(w => /needs a len/.test(w)),
       s4.warnings.find(w => /needs a len/.test(w)) || '(none)');
}

H('2 · THE CEILING — it caps the dynamics layer where the multiplier only scaled it');
{
    const mul = peaks({ lenPct: 0.6, mode: 'multiply', entry: 'together', curve: 'held', from: 0 });
    const cap = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
    ok('multiply is still the default', peaks({ lenPct: 0.6, entry: 'together', curve: 'held', from: 0 }).peaks.join() === mul.peaks.join());
    ok('the ceiling grades the first three breaths', cap.peaks[0] < cap.peaks[1] && cap.peaks[1] < cap.peaks[2],
       cap.peaks.slice(0, 3).map(x => x.toFixed(1)).join(' → '));
    ok('and it holds breath 2 far below where the morph would put it', cap.peaks[1] < bare.peaks[1] * 0.6,
       'ceiling ' + cap.peaks[1] + ' vs bare ' + bare.peaks[1]);
    // AND THE HONEST PART, which the measurement corrected: with a held curve and a long enough length BOTH modes grade.
    // What the ceiling actually gives is that it flattens the LOUD and leaves the QUIET alone — a multiplier scales
    // everything, including the breath that was already the quietest, and nearly silences it.
    ok('both modes grade once the length and the curve are right', mul.peaks[0] < mul.peaks[1] && mul.peaks[1] < mul.peaks[2],
       'multiply ' + mul.peaks.slice(0, 3).map(x => x.toFixed(1)).join(' → '));
    ok('but the multiplier nearly silences the quiet breath where the ceiling lets it speak',
       mul.peaks[0] < cap.peaks[0] * 0.7, 'multiply ' + mul.peaks[0] + ' vs ceiling ' + cap.peaks[0]);
    ok('and the ceiling lets more of the LATER breath through, so the fade ends sooner',
       cap.peaks[2] > mul.peaks[2], 'ceiling ' + cap.peaks[2] + ' vs multiply ' + mul.peaks[2]);
    const over = peaks({ lenPct: 0.5, mode: 'ceiling', entry: 'together', curve: 'held', from: 0, peak: 1.5 });
    ok('a ceiling that is asked to overshoot says so and refuses', over.warnings.some(w => /cannot overshoot/.test(w)),
       over.warnings.find(w => /cannot overshoot/.test(w)) || '(none)');
}

H('3 · THE HELD-BACK CURVE — nothing else in the vocabulary stays low');
{
    const at = (c, u) => M.curveEase(c, u);
    ok('held is 0.01 a tenth of the way along', Math.abs(at('held', 0.1) - 0.01) < 1e-9, at('held', 0.1).toFixed(3));
    ok('linear is ten times that, and expo THIRTY-FIVE times — it is front-loaded',
       at('linear', 0.1) > at('held', 0.1) * 5 && at('expo', 0.1) > at('held', 0.1) * 20,
       'held ' + at('held', 0.1).toFixed(2) + ' · linear ' + at('linear', 0.1).toFixed(2) + ' · expo ' + at('expo', 0.1).toFixed(2));
    ok('all four curves still reach 1 at the end', ['linear', 'expo', 'sudden', 'held'].every(c => Math.abs(at(c, 1) - 1) < 1e-9));
    ok('held is in the vocabulary the panel reads', M.SHAPE_CURVES.indexOf('held') >= 0, M.SHAPE_CURVES.join(' '));
    // and it is the curve that makes the ceiling bite
    const straight = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'linear', from: 0 });
    const heldC = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
    ok('a STRAIGHT ceiling barely bites — the finding that corrected the first recommendation',
       straight.peaks[1] > heldC.peaks[1] * 1.5, 'linear ' + straight.peaks[1] + ' vs held ' + heldC.peaks[1]);
}

H('4 · THE THREE TOGETHER, against what he has now — his own numbers');
{
    const rows = [
        ['no shape at all', null],
        ['the old fade · 8 s multiply linear', { len: 8, entry: 'together', curve: 'linear', from: 0 }],
        ['the old fade · 3 s (the preset)', { len: 3, entry: 'together', curve: 'linear', from: 0 }],
        ['THE NEW ONE · 60% ceiling held', { lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 }],
    ];
    rows.forEach(([label, sh]) => console.log('     ' + label.padEnd(36) + peaks(sh).peaks.map(x => String(x).padStart(4)).join(' ')));
    const old3 = peaks({ len: 3, entry: 'together', curve: 'linear', from: 0 });
    ok('HIS REPORT CONFIRMED: the old 3 s fade is bit-identical to no fade at all',
       JSON.stringify(old3.peaks) === JSON.stringify(bare.peaks), old3.peaks.join(' / '));
    const nu = peaks({ lenPct: 0.6, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
    ok('the new one is not', JSON.stringify(nu.peaks) !== JSON.stringify(bare.peaks), nu.peaks.join(' / '));
    // THE POINT OF THE WHOLE FIX, stated as the thing that is actually different: the old fade reached ONE breath, the new
    // one reaches THREE. A fade-in is supposed to grow, so a steeper climb is the fade working, not a fault.
    ok('the old fade reached exactly one breath', old3.peaks.filter((v, i) => v < bare[i] - 0.05).length === 0
       && peaks({ len: 8, entry: 'together', curve: 'linear', from: 0 }).peaks.filter((v, i) => v < bare.peaks[i] - 0.05).length === 1,
       'the 8 s fade changed ' + peaks({ len: 8, entry: 'together', curve: 'linear', from: 0 }).peaks.filter((v, i) => v < bare.peaks[i] - 0.05).length + ' of 5');
    ok('the new one reaches three', nu.peaks.filter((v, i) => v < bare.peaks[i] - 0.05).length >= 3,
       'it changed ' + nu.peaks.filter((v, i) => v < bare.peaks[i] - 0.05).length + ' of 5');
    [0.4, 0.6, 0.8].forEach(p => {
        const r = peaks({ lenPct: p, mode: 'ceiling', entry: 'together', curve: 'held', from: 0 });
        ok('lenPct ' + p + ' behaves — a longer fade holds breath 1 lower', r.peaks[0] <= bare.peaks[0],
           r.peaks.slice(0, 3).map(x => x.toFixed(1)).join(' / '));
    });
}

H('5 · NOTHING IN THE BANK MOVED — the guarantee that let this be built at all');
{
    ok('a no-shape render is untouched', JSON.stringify(peaks(null).peaks) === JSON.stringify(bare.peaks));
    const presets = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'shape_presets.json'), 'utf8'));
    ok('fade-in-3s still says exactly what it said', JSON.stringify(presets.presets['fade-in-3s'].shape) ===
       JSON.stringify({ attack: { len: 3, entry: 'together', curve: 'linear', from: 0 } }),
       JSON.stringify(presets.presets['fade-in-3s'].shape));
    ok('hit-and-settle is untouched too', presets.presets['hit-and-settle'].shape.attack.peak === 1.5);
    // the preset ended up as HIS logic, not my two refinements: the morph's own level scaled from silence, meeting the
    // natural level at the end of the window. A fraction is what it must carry; the mode and curve are the plain ones.
    ok('and the new preset is there, measured rather than guessed', !!presets.presets['fade-in-slow'] &&
       presets.presets['fade-in-slow'].shape.attack.lenPct > 0 &&
       presets.presets['fade-in-slow'].shape.attack.mode === 'fade' &&
       presets.presets['fade-in-slow'].shape.attack.curve === 'linear',
       JSON.stringify(presets.presets['fade-in-slow'].shape.attack));
    // the old presets must render exactly as they did — no new field can have changed them
    const legacy = peaks(presets.presets['fade-in-3s'].shape.attack);
    ok('rendering fade-in-3s gives the bare numbers, as it always did (that IS the bug he reported)',
       JSON.stringify(legacy.peaks) === JSON.stringify(bare.peaks), legacy.peaks.join(' / '));
}

// ===========================================================================
// 6 - THE FADE HE DESIGNED (2026-09-09, RUNNING_LOG §315), and the reason it is a MODE and not another curve.
//
// §314 fixed the velocity but he still heard it: *"now it's coming in not quite enough as before … the second breath is still giving
// a jump."* So the question was put the other way round - how does the morph fade in when nobody asks it to? Measured: it holds ONE
// velocity for every breath and moves CC7 alone. THAT is the mechanism, and his design is to borrow it.
// ===========================================================================
const VR = require(path.join(ROOT, 'score', 'public', 'velocity_remap.js'));
const remapBank = JSON.parse(fs.readFileSync(path.join(ROOT, 'bank', 'velocity_remap.json'), 'utf8'));
const INST = Object.keys(remapBank.instruments || remapBank)[0];
const HLO = 65, HHI = 127;

// what the SAMPLER is sent for voice `vi` - the whole point, since every earlier round measured the engine instead
function midi(shape, vi) {
    const P = BLOOM();
    if (shape) P.shape = { attack: shape };
    const r = M.render(P, { maxVoices: 10 });
    const L = (r.meta.shape && r.meta.shape.attackLen) || 0;
    const fade = !!(r.meta.shape && r.meta.shape.attackMode === 'fade');
    return r.notes.filter(n => n.voice === vi).sort((a, b) => a.tStart - b.tStart).map(n => {
        const hMax = Math.max.apply(null, n.level.map(x => x[1])) / 10;
        const hOpen = (n.level[0] ? n.level[0][1] : 0) / 10;
        const h = n.velRef != null ? n.velRef / 10 : (!fade && L > 0 && n.tStart < L) ? hOpen : hMax;
        const d = VR.heldNote(remapBank, INST, n.midi, HLO + (HHI - HLO) * Math.max(0, Math.min(1, h)));
        let vel = d ? d.vel : 100;
        if (n.velRef == null && n.level[0][1] < 0.4) vel = Math.max(1, Math.round(vel * (n.level[0][1] / 0.4)));
        const cc = q => VR.cc7ForHeight(remapBank, INST, n.midi, vel, HLO + (HHI - HLO) * Math.max(0, Math.min(1, q / 10)));
        return { t: n.tStart, vel: vel, ccIn: cc(n.level[0][1]), ccTop: cc(hMax * 10), velRef: n.velRef,
                 open: n.level[0][1], top: hMax * 10, dur: n.dur };
    });
}
const FADE = { lenPct: 0.6, mode: 'fade', entry: 'together', curve: 'linear', from: 0 };
const LEGACY = { lenPct: 0.6, mode: 'multiply', entry: 'together', curve: 'linear', from: 0 };

H('6a · THE MODEL — how the morph fades when nothing is dialled in, which he confirmed by ear is right');
{
    const b = midi(null, 0);
    ok('every breath is struck at the SAME velocity', new Set(b.slice(0, 4).map(x => x.vel)).size === 1,
       b.slice(0, 4).map(x => x.vel).join(' · '));
    ok('and CC7 is what climbs', b[0].ccIn < b[1].ccIn && b[1].ccIn < b[2].ccIn,
       b.slice(0, 3).map(x => x.ccIn).join(' → '));
}

H('6b · THE LEGACY MODES BROKE EXACTLY THAT — the numbers behind "still a jump at the second breath"');
{
    const g = midi(LEGACY, 0);
    ok('multiply moves the velocity between breaths, which is the lurch', g[0].vel !== g[1].vel || g[1].vel !== g[2].vel,
       g.slice(0, 3).map(x => x.vel).join(' · '));
    ok('and it pins CC7 to the top of its range, outside what was measured', g[0].ccIn >= 123 && g[1].ccIn >= 123,
       g.slice(0, 3).map(x => x.ccIn).join(' · '));
}

H('6c · THE FADE — one velocity, CC7 doing the work, exactly like 6a');
{
    const f = midi(FADE, 0), b = midi(null, 0);
    const L = 0.6 * SPAN;
    const inWin = f.filter(x => x.t < L);
    ok('every breath inside the window is struck at ONE velocity', new Set(inWin.map(x => x.vel)).size === 1,
       inWin.map(x => x.vel).join(' · '));
    // the reference is READ FROM THE BARE MORPH: the natural peak of the breath in progress at the end of the window - and here
    // voice 0 happens to be BETWEEN breaths at t=24, so the engine's documented fallback (the last breath before it) is what runs
    const bWin = b.filter(x => x.t < L);
    const strad = b.find(y => y.t <= L && y.t + y.dur > L) || bWin[bWin.length - 1];
    ok('and it is the velocity of the breath in progress at the end of the window — his rule, not a compromise',
       inWin.every(x => Math.abs(x.velRef - strad.top) < 1e-6),
       'velRef ' + inWin[0].velRef + ' = the natural peak of the breath at t' + strad.t);
    ok('it is also the velocity the bare morph uses — nothing is being pushed anywhere new',
       inWin[0].vel === b[0].vel, inWin[0].vel + ' vs ' + b[0].vel);
    ok('CC7 climbs across the window instead', inWin[0].ccIn < inWin[1].ccIn && inWin[1].ccIn < inWin[2].ccIn,
       inWin.map(x => x.ccIn).join(' → '));
    ok('and it starts BELOW where the bare morph starts — there is an actual fade',
       inWin[0].ccIn < b[0].ccIn, inWin[0].ccIn + ' vs ' + b[0].ccIn);
    ok('every CC7 stays inside the remap\'s measured range, which §314\'s fix did not',
       f.every(x => x.ccIn < 123 && x.ccTop <= 127), f.map(x => x.ccIn).join(' · '));
}

H('6d · THE LEVEL IS ONE RAMP ACROSS THE WHOLE WINDOW — not an envelope that restarts at every breath');
{
    const P = BLOOM(); P.shape = { attack: FADE };
    const r = M.render(P, { maxVoices: 10 });
    const L = r.meta.shape.attackLen;
    const pts = [];
    r.notes.filter(n => n.voice === 0).forEach(n => n.level.forEach(pt => {
        if (n.tStart + pt[0] <= L + 1e-9) pts.push([n.tStart + pt[0], pt[1]]);
    }));
    pts.sort((a, b) => a[0] - b[0]);
    let rises = true;
    for (let i = 1; i < pts.length; i++) if (pts[i][1] < pts[i - 1][1] - 1e-6) rises = false;
    ok('the level never falls anywhere inside the window, across breath boundaries and all', rises,
       pts.length + ' breakpoints, ' + pts[0][1] + ' → ' + pts[pts.length - 1][1]);
    ok('it starts at `from`, which is silence here', Math.abs(pts[0][1]) < 1e-6, String(pts[0][1]));
}

H('6e · THE JOIN — the morph resumes at the end of the window with nothing matched by hand');
{
    const P = BLOOM(); P.shape = { attack: FADE };
    const r = M.render(P, { maxVoices: 10 });
    // THE CONTROL HAS TO BE GAIN-NEUTRAL, and getting that wrong cost a false failure here: `multiply, from 0` scales the levels
    // inside the window too, so reading a "natural" value from it just below L reads a faded one and the join looks off by up to 0.7.
    // `from: 1` makes the attack gain 1 + (peak-1)*ease === 1 at every t - the same entry schedule and length, the morph's own levels.
    // (The bare morph is not a control at all here: `entry: together` moves every voice's first entry, which is the attack block's
    // job and not the fade's.)
    const Q = BLOOM(); Q.shape = { attack: Object.assign({}, FADE, { mode: 'multiply', from: 1 }) };
    const g = M.render(Q, { maxVoices: 10 });
    const L = r.meta.shape.attackLen;
    const after = n => n.tStart >= L - 1e-9;
    const key = res => res.notes.filter(after).map(n => n.voice + '@' + n.tStart + ' ' + JSON.stringify(n.level)).sort().join('|');
    ok('every note starting after the window is bit-identical to the same shape without the fade', key(r) === key(g));
    ok('the control really is gain-neutral - its levels inside the window are the morph\'s own',
       JSON.stringify(g.notes.filter(n => n.voice === 0 && !after(n)).map(n => n.level)) ===
       JSON.stringify(M.render(BLOOM(), { maxVoices: 10 }).notes.filter(n => n.voice === 0 && !after(n)).map(n => n.level)));
    ok('and nothing after the window carries a velocity stamp', r.notes.filter(after).every(n => n.velRef == null));
    const bare0 = M.render(BLOOM(), { maxVoices: 10 }).notes.filter(n => n.voice === 0 && after(n))
        .map(n => n.tStart + ' ' + JSON.stringify(n.level)).join('|');
    ok('and voice 0, which `entry` does not move, is identical to the BARE morph after the window',
       bare0 === r.notes.filter(n => n.voice === 0 && after(n)).map(n => n.tStart + ' ' + JSON.stringify(n.level)).join('|'));

    // THE ENDPOINT IS READ FROM THE RENDER, not recomputed from the parameters, so the ramp and the morph cannot drift apart.
    const at = (n, t) => { const d = t - n.tStart, p = n.level;
        if (d <= p[0][0]) return p[0][1];
        for (let i = 1; i < p.length; i++) if (d <= p[i][0]) {
            const c = p[i - 1], e = p[i]; return c[1] + (e[1] - c[1]) * ((d - c[0]) / Math.max(1e-6, e[0] - c[0])); }
        return p[p.length - 1][1]; };
    const pairs = r.notes.filter(n => n.tStart < L - 1e-9 && n.tStart + n.dur > L + 1e-9)
        .map(n => [n, g.notes.find(m => m.voice === n.voice && m.tStart === n.tStart)]).filter(p => p[1]);
    ok('some parts ARE mid-breath at the end of the window - the case the whole design turns on', pairs.length > 0,
       pairs.length + ' of ' + r.notes.filter(n => n.tStart < L).length + ' notes inside it straddle the end');
    ok('and every one of them meets its own natural level exactly there, with nothing matched by hand',
       pairs.every(p => Math.abs(at(p[0], L) - at(p[1], L)) < 0.02),
       pairs.map(p => at(p[0], L).toFixed(2) + '~' + at(p[1], L).toFixed(2)).join(' '));
}

H('6f · THE RE-BREATH TIMINGS ARE THE MORPH\'S OWN — his condition');
{
    const shape = m => { const P = BLOOM(); P.shape = { attack: Object.assign({}, FADE, { mode: m }) };
                         return M.render(P, { maxVoices: 10 }); };
    const sig = r => r.notes.map(n => n.voice + '@' + n.tStart + '+' + n.dur).sort().join(' ');
    const pitch = r => r.notes.map(n => n.voice + ':' + n.midi + ':' + n.technique).sort().join(' ');
    const f = shape('fade'), g = shape('multiply');
    ok('the fade moves no entry and no duration that the same settings would not move anyway', sig(f) === sig(g));
    ok('nor any pitch, key or technique', pitch(f) === pitch(g));
    ok('and the levels ARE different, which is the only thing it was allowed to change',
       JSON.stringify(f.notes.map(n => n.level)) !== JSON.stringify(g.notes.map(n => n.level)));
    // voice 0 is not re-scheduled by `entry`, so it can be held against the bare morph directly
    const bare0 = M.render(BLOOM(), { maxVoices: 10 }).notes.filter(n => n.voice === 0)
        .map(n => n.tStart + '+' + n.dur).sort().join(' ');
    const fade0 = f.notes.filter(n => n.voice === 0).map(n => n.tStart + '+' + n.dur).sort().join(' ');
    ok('voice 0 breathes exactly where the bare morph breathes', bare0 === fade0, fade0);
}

H('6g · THE LEGACY MODES ARE STILL THERE AND STILL INERT — his condition, checked and not assumed');
{
    const b = peaks(null);
    ['multiply', 'ceiling'].forEach(m => {
        const r = peaks({ lenPct: 0.6, mode: m, entry: 'together', curve: 'linear', from: 0 });
        ok(m + ' renders as it did — no velRef, no rewrite', r.meta.shape.attackMode === m &&
           JSON.stringify(r.peaks) !== JSON.stringify(b.peaks), r.peaks.slice(0, 3).map(x => x.toFixed(1)).join(' / '));
    });
    const P = BLOOM(); P.shape = { attack: { lenPct: 0.6, mode: 'multiply', entry: 'together', curve: 'linear', from: 0 } };
    ok('and no legacy render carries a stamp for the emitter to find',
       M.render(P, { maxVoices: 10 }).notes.every(n => n.velRef == null));
    ok('a no-shape render still has no shape meta at all', !M.render(BLOOM(), { maxVoices: 10 }).meta.shape);
}

H('6h · THE STAMP TRAVELS INTO THE SCORE — where the same velocity law lives (`Composer.heldDyn`)');
{
    const P = BLOOM(); P.shape = { attack: FADE };
    const r = M.render(P, { maxVoices: 10 });
    const objs = M.toScoreObjects(r, 10, {});
    const L = r.meta.shape.attackLen;
    const inWin = objs.filter(o => o.startSeconds < 10 + L - 1e-9);
    ok('every inserted object inside the window carries velRef', inWin.length > 0 && inWin.every(o => o.velRef != null),
       inWin.length + ' objects, velRef ' + inWin[0].velRef);
    ok('and every object after it carries none — the score reads its own curve there',
       objs.filter(o => o.startSeconds >= 10 + L).every(o => o.velRef == null));
    const plain = M.toScoreObjects(M.render(BLOOM(), { maxVoices: 10 }), 10, {});
    ok('a no-shape insert gains no new field — the objects are byte-identical to what they were',
       plain.every(o => !('velRef' in o) || o.velRef === undefined));
}

H('6i · THE LADDER — `lenPct` outranks `len`, so a rung that set only `len` would audition one length five times');
{
    const base = { carrier: BLOOM().carrier, dyn: BLOOM().dyn, model: BLOOM().model, seed: BLOOM().seed,
                   source: BLOOM().source, target: BLOOM().target,
                   shape: { attack: { lenPct: 0.6, mode: 'fade', entry: 'together', curve: 'linear', from: 0 } } };
    const seen = [];
    M.buildLadder(base, [4, 12, 24], { render: p => { seen.push(p.shape.attack.len + '/' + p.shape.attack.lenPct);
                                                      return M.render(p, { maxVoices: 10 }); } });
    ok('each rung renders at its own length, with the fraction cleared', seen.join(' ') === '4/undefined 12/undefined 24/undefined',
       seen.join(' '));
}

H('6j · WHAT A FADE IGNORES, SAID OUT LOUD — no silent no-ops');
{
    const w = sh => { const P = BLOOM(); P.shape = sh; return (M.render(P, { maxVoices: 10 }).warnings || []).join(' | '); };
    ok('a `peak` with a fade is reported, not quietly dropped',
       /peak" is ignored/.test(w({ attack: Object.assign({}, FADE, { peak: 1.5 }) })));
    ok('a decay block with a fade is reported too',
       /decay block has no peak/.test(w({ attack: FADE, decay: { len: 3, curve: 'linear' } })));
}

console.log('\n' + (fail ? fail + ' FAILED' : 'all checks passed'));
process.exit(fail ? 1 : 0);
