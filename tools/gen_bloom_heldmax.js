#!/usr/bin/env node
// gen_bloom_heldmax.js — the Bloom practice videos' held dyads (PLAN 2h.7.2, 2026-09-17; docs/plans/BLOOM_PRACTICE_VIDEOS.md §4 step 2).
//
// Each pair's fastest beating HELD for 32 s — the music never holds it (every span re-strikes in ~5 s). The tuba built its dyads from
// arithmetic (gen_demo_heldmax_midi.js: note + bend computed from the save); here nothing is computed that the composer did not send:
// each part is THE CAPTURE FROZEN at its pair's peak instant (RENDER.md rule 1 — the composer is the engine).
//
//   node tools/gen_bloom_heldmax.js [--capture midi/piece-septet.capture.json] [--out midi/demo-bloom-heldmax]
//
// Per part, at the peak instant T, read off the capture (the part's own port):
//   the note sounding at T — its channel (the morph rotates channels span by span), pitch, velocity
//   EVERY channel's last controller values and last pitch bend before T — the articulation (CC0), the level (CC7), the glissando's position
//   CC7 left as it was at T (--cc7 at, the default: the pure freeze — no design call on loudness; --cc7 max raises it to the span's top).
//
// TAKES (--takes K, default 6). MEASURED 2026-09-17 (RUNNING_LOG §600): the SAME file rendered twice beats at different rates — every
// Xsample part lands ±1–2 c from its bend on each note-on (the SI2 flute is exact: 892.66 Hz in four renders), so one strike is a draw.
// Each pair is struck K times in its own slots; measure_beating.js reads every take and pick_bloom_takes picks the one nearest the chart.
// Nothing is tuned: the pick chooses among the sampler's own draws.
// Timeline (60 BPM, 1 beat = 1 s): pair k's slot starts at 10 + 40·k s — the state at slot − 0.6 s, the note-on at the slot, the
// note-off 32 s later, the channel re-centred after. Out: one format-0 file per rack track that plays a used port (NN <track>.mid, as
// export_midi.js names them, for render_reaper.js --dir) + slots.json (every value, and the rate the frozen bends give).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const CAP = arg('capture', 'midi/piece-septet.capture.json');
const OUT = path.join(ROOT, arg('out', 'midi/demo-bloom-heldmax'));
const PPQ = 960, SLOT0 = 10, SLOT_STEP = 36, HOLD = 32, TAKES = +arg('takes', 6);
// --cc7 at (default): the pure freeze, CC7 as the capture had it at T · --cc7 max: the sounding channel's CC7 raised to its span's top 
const CC7_MODE = arg('cc7', 'at');

// the pairs, in the chart's BLOOM order (top → bottom); T = the peak instant measured from the save's morph curves (RUNNING_LOG §595)
const PAIRS = [
  { id: 'flvn2', label: 'Flute + Violin 2', T: 226.6, chartHz: 21.5, ports: ['Flute', 'Fluteb', 'Vn2'] },
  { id: 'vn1va', label: 'Violin 1 + Viola', T: 222.9, chartHz: 16.1, ports: ['Vn1', 'Va'] },
  { id: 'bclvc', label: 'Bass Clarinet + Cello', T: 214.8, chartHz: 7.2, ports: ['BassCl', 'Vc'] },
];
// the rack's track NAME → its port (export_midi.js RACK_PORT) and its number in midi/piece-septet/
const TRACKS = [['01', 'Flute SI2', 'Flute'], ['03', 'Fluteb SI2', 'Fluteb'], ['04', 'Bass Clarinet XS', 'BassCl'], ['05', 'Bass Clarinet XS', 'BassCl'],
  ['11', 'Vn1 XS', 'Vn1'], ['12', 'Vn2 XS', 'Vn2'], ['13', 'Va XS', 'Va'], ['14', 'Vc XS', 'Vc']];

const cap = JSON.parse(fs.readFileSync(path.join(ROOT, CAP), 'utf8'));
const INST = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'sandbox', 'instruments.js'), 'utf8') + '\n;INSTRUMENTS;', {});
const rangeOfPort = new Map();   // export_midi.js check (e): each port's MEASURED bend range
for (const I of Object.values(INST)) {
  const ports = [I.port].concat(((I.channels && I.channels.curve) || []).map(c => c && c.port));
  for (const p of ports) if (p && !rangeOfPort.has(p.toLowerCase())) rangeOfPort.set(p.toLowerCase(), I.bendRangeSt || 1.99);
}
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const ST = e => e[2][0] & 0xF0, CH = e => e[2][0] & 15;

const slots = [], byPort = {};
PAIRS.forEach((P, k) => {
  const parts = [], emit = [];   // emit(S): one take's messages with its note-on at S
  for (const port of P.ports) {
    const ev = cap.events.filter(e => e[0] === port);
    const held = new Map();
    for (const e of ev) {
      if (e[1] > P.T) break;
      if (ST(e) === 0x90 && e[2][2] > 0) held.set(CH(e) + ':' + e[2][1], e);
      else if (ST(e) === 0x80 || (ST(e) === 0x90 && e[2][2] === 0)) held.delete(CH(e) + ':' + e[2][1]);
    }
    if (!held.size) continue;                       // the port is silent at T (the Flute port: the flute's morph plays on Fluteb)
    if (held.size > 1) throw new Error(port + ': ' + held.size + ' notes sound at ' + P.T + ' — a freeze needs exactly one');
    const on = [...held.values()][0], ch = CH(on), pitch = on[2][1], vel = on[2][2];
    const offE = ev.find(e => e[1] > P.T && CH(e) === ch && e[2][1] === pitch && (ST(e) === 0x80 || (ST(e) === 0x90 && e[2][2] === 0)));
    const off = offE ? offE[1] : Infinity;
    const onCh = ev.filter(e => CH(e) === ch);
    const last = pred => { let v = null; for (const e of onCh) { if (e[1] > P.T) break; if (pred(e)) v = e; } return v; };
    const cc0 = last(e => ST(e) === 0xB0 && e[2][1] === 0);
    const bendE = last(e => ST(e) === 0xE0);
    const cc7s = onCh.filter(e => ST(e) === 0xB0 && e[2][1] === 7 && e[1] >= on[1] - 0.5 && e[1] <= off);
    if (!cc7s.length) throw new Error(port + ': no CC7 inside the span ' + on[1] + '–' + off);
    const cc7max = Math.max(...cc7s.map(e => e[2][2]));
    const cc7atT = (last(e => ST(e) === 0xB0 && e[2][1] === 7) || { 2: [0, 7, null] })[2][2];
    const bend = bendE ? (bendE[2][1] | (bendE[2][2] << 7)) : 8192;
    const range = rangeOfPort.get(port.toLowerCase());
    if (!range) throw new Error(port + ': no measured bend range');
    const cents = (bend - 8192) / 8192 * range * 100;
    parts.push({ port, ch: ch + 1, pitch, vel, cc0: cc0 ? cc0[2][2] : null, cc7max, cc7atT, bend, bendAt: bendE ? bendE[1] : null,
      rangeSt: range, cents: +cents.toFixed(1), hz: +hz(pitch + cents / 100).toFixed(3), span: [on[1], off] });
    const evs = (byPort[port] = byPort[port] || []);
    // EVERY channel of the port as the capture left it at T — the last value of each controller and the last bend — not only the sounding
    // note's channel (the plan's 'the channels' whole state'; the first build sent the sounding channel alone). With --cc7 max the sounding
    // channel's CC7 is then raised to the span's top.
    const other = new Map();
    for (const e of ev) {
      if (e[1] > P.T) break;
      if (ST(e) === 0xB0) other.set('cc:' + CH(e) + ':' + e[2][1], e);
      else if (ST(e) === 0xE0) other.set('bend:' + CH(e), e);
    }
    emit.push(S => {
      const st = (b, t, kind) => evs.push({ t, kind, bytes: b });
      for (const e of other.values()) st(e[2].slice(), S - 0.6, ST(e) === 0xE0 ? 'bend' : 'cc');
      if (CC7_MODE === 'max') st([0xB0 | ch, 7, cc7max], S - 0.5, 'cc');
      st([0x90 | ch, pitch, vel], S, 'on');
      st([0x80 | ch, pitch, 0], S + HOLD, 'off');
      st([0xE0 | ch, 0, 64], S + HOLD + 3, 'bend');
    });
  }
  if (parts.length !== 2) throw new Error(P.id + ': ' + parts.length + ' parts sound at ' + P.T + ', expected 2');
  const rate = Math.abs(parts[0].hz - parts[1].hz);
  for (let j = 0; j < TAKES; j++) {
    const S = SLOT0 + SLOT_STEP * (k * TAKES + j);
    emit.forEach(fn => fn(S));
    slots.push({ id: P.id, take: j + 1, label: P.label, T: P.T, slot: S, hold: HOLD, chartHz: P.chartHz, frozenHz: +rate.toFixed(2), parts });
  }
});

// the format-0 writer of export_midi.js (60 BPM tempo, the name, events ranked off · cc · bend · on at a tick)
function writeType0(abs, name, events) {
  const vlq = n => { const o = [n & 0x7f]; n >>= 7; while (n > 0) { o.unshift((n & 0x7f) | 0x80); n >>= 7; } return o; };
  const rank = k => (k === 'off' ? 0 : k === 'cc' ? 1 : k === 'bend' ? 2 : 3);
  const ev = events.map(e => ({ tick: Math.round(e.t * PPQ), kind: e.kind, bytes: e.bytes })).sort((x, y) => x.tick - y.tick || rank(x.kind) - rank(y.kind));
  const data = [0x00, 0xff, 0x51, 0x03, 0x0f, 0x42, 0x40, 0x00, 0xff, 0x03, ...vlq(name.length), ...Buffer.from(name, 'ascii')];
  let last = 0;
  for (const e of ev) { data.push(...vlq(Math.max(0, e.tick - last)), ...e.bytes); last = e.tick; }
  data.push(0x00, 0xff, 0x2f, 0x00);
  const u32 = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  fs.writeFileSync(abs, Buffer.concat([Buffer.from('MThd'), Buffer.from([0, 0, 0, 6, 0, 0, 0, 1, (PPQ >> 8) & 255, PPQ & 255]), Buffer.from('MTrk'), Buffer.from(u32(data.length)), Buffer.from(data)]));
}

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (/\.(mid|evt)$/.test(f)) fs.unlinkSync(path.join(OUT, f));
const written = [];
for (const [nn, name, port] of TRACKS) {
  if (!byPort[port]) continue;
  const file = nn + ' ' + name + '.mid';
  writeType0(path.join(OUT, file), name, byPort[port]);
  written.push(file + ' (' + port + ', ' + byPort[port].filter(e => e.kind === 'on').length + ' notes)');
}
const end = SLOT0 + SLOT_STEP * (PAIRS.length * TAKES - 1) + HOLD + 6;
fs.writeFileSync(path.join(OUT, 'slots.json'), JSON.stringify({ made: new Date().toISOString(), capture: CAP, cc7: CC7_MODE, takes: TAKES, renderEnd: end, slots }, null, 1));
for (const s of slots.filter(x => x.take === 1)) {
  console.log(s.label + ' · ' + TAKES + ' takes, the first at ' + s.slot + '–' + (s.slot + s.hold) + ' s · frozen at ' + s.T + ' s · the frozen bends give ' + s.frozenHz + ' Hz (the chart: ' + s.chartHz + ')');
  for (const p of s.parts) console.log('   ' + p.port.padEnd(7) + ' ch ' + p.ch + ' · note ' + p.pitch + ' vel ' + p.vel + ' · CC0 ' + p.cc0 + ' · CC7 ' + p.cc7atT + ' at T → ' + p.cc7max + ' (the span max) · bend ' + p.bend + ' = ' + p.cents + ' c (±' + p.rangeSt + ' st) → ' + p.hz + ' Hz');
}
console.log('wrote ' + path.relative(ROOT, OUT) + ': ' + written.join(' · ') + ' · slots.json · render to ' + end + ' s');
