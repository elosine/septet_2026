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
    ok('and the new preset is there, measured rather than guessed', !!presets.presets['fade-in-slow'] &&
       presets.presets['fade-in-slow'].shape.attack.mode === 'ceiling');
    // the old presets must render exactly as they did — no new field can have changed them
    const legacy = peaks(presets.presets['fade-in-3s'].shape.attack);
    ok('rendering fade-in-3s gives the bare numbers, as it always did (that IS the bug he reported)',
       JSON.stringify(legacy.peaks) === JSON.stringify(bare.peaks), legacy.peaks.join(' / '));
}

console.log('\n' + (fail ? fail + ' FAILED' : 'all checks passed'));
process.exit(fail ? 1 : 0);
