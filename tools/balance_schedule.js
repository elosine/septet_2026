#!/usr/bin/env node
// balance_schedule.js — the ENSEMBLE BALANCE probe's timetable, generated from the recipe file.
// (composer, 2026-09-04: "an easy but data based way to normalize the volume between
// instruments … a 127 flute is same perceived loudness as 127 violin" — RUNNING_LOG §41.)
//
// For every track in score order, the instrument's PLAIN technique (the first of
// ord · main · senza_vel · senza_mw · staccato that it has) at three pitches — 25 / 50 / 75 %
// of that technique's range — at velocity 127 and 64; then (composer, 2026-09-04: "add above
// articulations against each other") the STRIKE articulation of each instrument the same way:
// flute pizzicato · bass clarinet slap tongue · violins Bartók pizz · viola/cello gettato; the
// piano has none (its main is its strike). One note at a time, a fixed timetable,
// so the recording can be sliced by the same file:
//
//   node tools/balance_schedule.js [--note 1500] [--gap 1000] [--lead 3000] [--vels 127,64]
//                                  [--only violin1,cello] [--nostrike] [--strike flute=pizzicato,cello=gettato_vel]
//                                  [--out probes/balance_schedule.json]
//
// Then: probes/balance_probe.ps1 plays it into the rack (record the REC track meanwhile) and
// probes/analyze_balance.py measures the recording → bank/balance.json + the trims.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };

const ORDER = ['flute', 'bass_clarinet', 'piano', 'violin1', 'violin2', 'viola', 'cello'];   // D10 score order
const PLAIN_PREF = ['ord', 'main', 'senza_vel', 'senza_mw', 'staccato'];
const FRACS = [0.25, 0.5, 0.75];
// the strike articulations (composer, 2026-09-04 — the drawer's new defaults, "all fff=127")
const STRIKE_TECHS = { flute: 'pizzicato', bass_clarinet: 'slap', violin1: 'bartok_vel', violin2: 'bartok_vel', viola: 'gettato_vel', cello: 'gettato_vel' };

// sandbox/instruments.js is a browser script (`const INSTRUMENTS = …`, no exports) — evaluate it
const src = fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8');
const INSTRUMENTS = vm.runInNewContext(src + '\n;INSTRUMENTS;', {});

const noteMs = +opt('note', 1500), gapMs = +opt('gap', 1000), leadMs = +opt('lead', 3000), instGapMs = +opt('instgap', 2000);
const preMs = 300;                                                       // CC7 / CC0 / keyswitch lead before each note
const vels = opt('vels', '127,64').split(',').map(Number);
const only = opt('only', '').split(',').filter(Boolean);
const noStrike = args.includes('--nostrike');
opt('strike', '').split(',').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); STRIKE_TECHS[k] = v; });
const out = path.resolve(ROOT, opt('out', 'probes/balance_schedule.json'));

const notes = [];
let t = leadMs, i = 0;
const add = (inst, I, tech, role) => {
    const lo = tech.rangeLow != null ? tech.rangeLow : I.rangeLow, hi = tech.rangeHigh != null ? tech.rangeHigh : I.rangeHigh;
    const pitches = FRACS.map(f => Math.round(lo + (hi - lo) * f));
    for (const vel of vels) for (const pitch of pitches) {
        notes.push({ i: i++, inst, label: I.label, role, tech: tech.key, techLabel: tech.label, port: tech.port || I.port, ch: tech.channel || 1,
                     cc0: tech.cc0 != null ? tech.cc0 : null, ks: tech.ks != null ? tech.ks : null,
                     pitch, vel, tPreMs: t - preMs, tOnMs: t, tOffMs: t + noteMs });
        t += noteMs + gapMs;
    }
    t += instGapMs;
};
const plan = [];
for (const role of ['plain', 'strike']) {
    if (role === 'strike' && noStrike) continue;
    for (const inst of ORDER) {
        if (only.length && !only.includes(inst)) continue;
        const I = INSTRUMENTS[inst];
        if (!I) { console.error('no recipe for', inst); process.exit(1); }
        let tech;
        if (role === 'plain') tech = PLAIN_PREF.map(k => I.techniques.find(q => q.key === k)).find(Boolean) || I.techniques[0];
        else { const k = STRIKE_TECHS[inst]; if (!k) continue; tech = I.techniques.find(q => q.key === k); if (!tech) { console.error('no technique ' + k + ' on ' + inst); process.exit(1); } }
        plan.push({ inst, role, tech: tech.key });
        add(inst, I, tech, role);
    }
}
const schedule = { generatedAt: new Date().toISOString(), source: 'sandbox/instruments.js', order: ORDER.filter(k => !only.length || only.includes(k)),
                   strikeTechs: noStrike ? {} : STRIKE_TECHS, plan, leadInMs: leadMs, preMs, noteMs, gapMs, instGapMs, vels, fracs: FRACS, totalMs: t, notes };
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(schedule, null, 1));
console.log('balance schedule → ' + path.relative(ROOT, out) + ' · ' + notes.length + ' notes · ' + (t / 1000).toFixed(1) + ' s');
for (const p of plan) {
    const n = notes.filter(q => q.inst === p.inst && q.tech === p.tech); if (!n.length) continue;
    console.log('  ' + p.role.padEnd(7) + n[0].label.padEnd(14) + n[0].port.padEnd(7) + ' ch' + String(n[0].ch).padEnd(3) + (n[0].cc0 != null ? 'cc0=' + n[0].cc0 : n[0].ks != null ? 'ks=' + n[0].ks : '      ').padEnd(8) +
                ' ' + n[0].techLabel.padEnd(34) + ' pitches ' + [...new Set(n.map(q => q.pitch))].join(' ') + '  t ' + (n[0].tOnMs / 1000).toFixed(1) + '-' + (n[n.length - 1].tOffMs / 1000).toFixed(1) + ' s');
}
