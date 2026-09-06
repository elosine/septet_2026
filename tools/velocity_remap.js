#!/usr/bin/env node
// velocity_remap.js — PLAN 1g item 1, to-do 4 (2026-09-06): from the sweep (bank/velocity_map.json), the velocity each
// instrument must be sent so that a curve height sounds as loud as it does on the violins.
//
//   The ensemble's one scale is the violins': a curve height h (0 … 1) means velocity 65 + 62·h ON THE VIOLINS, and the
//   loudness the violins make there (the mean of violin 1 and violin 2, mean of their three registers) is the TARGET for
//   everyone. For every other instrument and each measured register, the measured velocity → level curve is made
//   monotone (pool-adjacent-violators: a sampler's layer steps, e.g. the piano's 112 > 127, the viola's 64 > 80 at A5, are
//   flattened, never inverted) and inverted by linear interpolation: the velocity that lands on the target. Where the
//   target lies outside what the instrument reaches (below its softest measured note, or above its 127) the velocity is
//   clamped and counted.
//
//   node tools/velocity_remap.js [--in bank/velocity_map.json] [--out bank/velocity_remap.json] [--lo 65] [--hi 127]
//
// Output: per instrument, per measured pitch, a table indexed by the anchor velocity 65 … 127 (one entry per step) giving
// the instrument's velocity; the app interpolates between the nearest measured pitches (velocity_for in composer.html).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
const IN = path.resolve(ROOT, opt('in', 'bank/velocity_map.json')), OUT = path.resolve(ROOT, opt('out', 'bank/velocity_remap.json'));
const LO = +opt('lo', 65), HI = +opt('hi', 127);
const ANCHORS = ['violin1', 'violin2'];

const V = JSON.parse(fs.readFileSync(IN, 'utf8'));
const key = V.weighting === 'k' ? 'dbK' : 'dbFlat';

// a curve = [{ v, db }] sorted by v, found only
function curveOf(rows) { return rows.filter(q => q.found && q[key] != null).map(q => ({ v: q.vel, db: q[key] })).sort((a, b) => a.v - b.v); }
// pool adjacent violators: db non-decreasing with v
function monotone(c) {
    const blocks = c.map(p => ({ sum: p.db, n: 1, vs: [p.v] }));
    let i = 0;
    while (i < blocks.length - 1) {
        if (blocks[i].sum / blocks[i].n > blocks[i + 1].sum / blocks[i + 1].n) {
            blocks[i] = { sum: blocks[i].sum + blocks[i + 1].sum, n: blocks[i].n + blocks[i + 1].n, vs: blocks[i].vs.concat(blocks[i + 1].vs) };
            blocks.splice(i + 1, 1); i = Math.max(0, i - 1);
        } else i++;
    }
    const out = [];
    blocks.forEach(b => b.vs.forEach(v => out.push({ v, db: b.sum / b.n })));
    return out;
}
const lerp = (a, b, t) => a + (b - a) * t;
function dbAt(c, v) {   // linear in dB between the measured velocities, held flat beyond the ends
    if (v <= c[0].v) return c[0].db; if (v >= c[c.length - 1].v) return c[c.length - 1].db;
    for (let i = 0; i < c.length - 1; i++) if (v >= c[i].v && v <= c[i + 1].v) return lerp(c[i].db, c[i + 1].db, (v - c[i].v) / (c[i + 1].v - c[i].v));
    return c[c.length - 1].db;
}
function velFor(c, target) {   // the lowest velocity that reaches the target; clamped at the ends; -1 / +1 = clamped low / high
    if (target <= c[0].db) return { v: c[0].v, clamp: target < c[0].db - 0.05 ? -1 : 0 };
    if (target >= c[c.length - 1].db) return { v: c[c.length - 1].v, clamp: target > c[c.length - 1].db + 0.05 ? 1 : 0 };
    for (let i = 0; i < c.length - 1; i++) {
        if (target >= c[i].db && target <= c[i + 1].db) {
            const span = c[i + 1].db - c[i].db;
            const t = span > 1e-9 ? (target - c[i].db) / span : 0;   // a flat step: its lowest velocity
            return { v: lerp(c[i].v, c[i + 1].v, t), clamp: 0 };
        }
    }
    return { v: c[c.length - 1].v, clamp: 0 };
}

// the anchor: the violins' mean curve (mean over registers, then over the two violins)
const anchorRows = [];
for (const k of ANCHORS) { const d = V.instruments[k]; if (!d) throw new Error('no ' + k + ' in the bank'); Object.values(d.vel).forEach(rows => anchorRows.push(...rows)); }
const byV = {}; anchorRows.filter(q => q.found).forEach(q => { (byV[q.vel] = byV[q.vel] || []).push(q[key]); });
const anchor = monotone(Object.keys(byV).map(v => ({ v: +v, db: byV[v].reduce((a, b) => a + b, 0) / byV[v].length })).sort((a, b) => a.v - b.v));
const steps = []; for (let v = LO; v <= HI; v++) steps.push(v);
const targetDb = steps.map(v => dbAt(anchor, v));

const out = { generatedAt: new Date().toISOString(), source: path.relative(ROOT, IN).replace(/\\/g, '/'), measuredAt: V.measuredAt, weighting: V.weighting, windowS: V.windowS,
    anchor: { instruments: ANCHORS, curve: anchor.map(p => ({ v: p.v, db: +p.db.toFixed(2) })) }, scale: { lo: LO, hi: HI, note: 'a curve height h means anchor velocity lo + (hi - lo) * h; the tables are indexed by that anchor velocity' },
    targetDb: targetDb.map(x => +x.toFixed(2)), instruments: {} };
const report = [];
for (const [k, d] of Object.entries(V.instruments)) {
    const inst = { label: d.label, tech: d.tech, pitches: [] };
    for (const [pitch, rows] of Object.entries(d.vel)) {
        const raw = curveOf(rows); if (raw.length < 3) continue;
        const c = monotone(raw);
        const table = [], flags = { low: 0, high: 0 };
        for (const t of targetDb) { const r = velFor(c, t); table.push(+r.v.toFixed(1)); if (r.clamp < 0) flags.low++; if (r.clamp > 0) flags.high++; }
        const pooled = raw.filter((p, i) => Math.abs(p.db - c[i].db) > 0.05).map(p => p.v);
        inst.pitches.push({ pitch: +pitch, measured: raw.map(p => ({ v: p.v, db: +p.db.toFixed(2) })), monotone: c.map(p => ({ v: p.v, db: +p.db.toFixed(2) })), pooledVelocities: pooled, table, clampedLow: flags.low, clampedHigh: flags.high });
        // the check: the level this register makes at the remapped velocity, at h = 0, 0.5, 1
        const chk = [0, 0.5, 1].map(h => { const i = Math.round(h * (steps.length - 1)); const v = table[i]; return { h, v, db: dbAt(c, v), target: targetDb[i] }; });
        report.push({ inst: d.label, pitch: +pitch, chk, flags, pooled });
    }
    inst.pitches.sort((a, b) => a.pitch - b.pitch);
    out.instruments[k] = inst;
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

console.log('anchor (the violins, ' + key + '): ' + anchor.map(p => p.v + ':' + p.db.toFixed(1)).join('  '));
console.log('target: h=0 (anchor ' + LO + ') ' + targetDb[0].toFixed(1) + ' dB · h=0.5 ' + targetDb[Math.round((steps.length - 1) / 2)].toFixed(1) + ' · h=1 (anchor ' + HI + ') ' + targetDb[steps.length - 1].toFixed(1));
console.log('\ninstrument       pitch   h=0: send -> level (target)      h=0.5: send -> level (target)     h=1: send -> level (target)    clamped   pooled steps');
let worst = 0;
for (const r of report) {
    const cell = c => { const err = c.db - c.target; if (!(r.flags.low && c.h === 0) && !(r.flags.high && c.h === 1)) worst = Math.max(worst, Math.abs(err)); return String(c.v.toFixed(0)).padStart(4) + ' -> ' + c.db.toFixed(1) + ' (' + c.target.toFixed(1) + ')'; };
    console.log(r.inst.padEnd(16) + String(r.pitch).padStart(4) + '   ' + r.chk.map(cell).join('   ') + '   ' + (r.flags.low ? 'low ' + r.flags.low : '') + (r.flags.high ? 'high ' + r.flags.high : '') + (!r.flags.low && !r.flags.high ? '-' : '') + '        ' + (r.pooled.length ? r.pooled.join(' ') : '-'));
}
console.log('\nworst level error at the unclamped checkpoints: ' + worst.toFixed(2) + ' dB (interpolation only; the measurement itself repeats to 0.3)');
console.log('-> ' + path.relative(ROOT, OUT));
