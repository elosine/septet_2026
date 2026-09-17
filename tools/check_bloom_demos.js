#!/usr/bin/env node
// check_bloom_demos.js — the Bloom practice videos, measured after the build (PLAN 2h.7.4, 2026-09-17; the tuba's PHASE 5, cut to fit).
//
//   node tools/check_bloom_demos.js [bclvc vn1va flvn2]      (default: every video that exists)
//
// Per video (notation/video/renders/demos/bloom-<id>.mp4), from midi/demo-bloom-heldmax/picked.json:
//   LENGTH   video = audio = 30 + (t1 − t0) to the frame; both streams start at 0
//   LABEL    the label band of a frame 1 s in differs from the bare still (PSNR < 30 dB) — the label is on the picture
//   JOIN     the first section frame against a direct probe at t0 (PSNR ≥ 35 dB), and against the still (must be lower: the right source)
//   SOUND    the first sound after the join (−80 dB) against the pair recording's own first sound after t0 (±50 ms)
//   RATE     the static's beating measured in the FINISHED file (the AAC encode) against the picked take (±2 %) and the chart (±4 %)
//   LEVEL    the static's RMS against the music's RMS in the 6 s around the peak instant, and the true peak of both parts (≤ −1 dBTP + 0.2)
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const { measure, readMono } = require('./measure_beating.js');
const FF = (() => { try { return execFileSync('where', ['ffmpeg'], { encoding: 'utf8' }).split(/\r?\n/)[0].trim(); } catch (e) { return 'ffmpeg'; } })();
const FP = FF.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1');
const DEMOS = 'notation/video/renders/demos', TMP = DEMOS + '/tmp';
const picked = JSON.parse(fs.readFileSync(path.join(ROOT, 'midi/demo-bloom-heldmax/picked.json'), 'utf8')).pairs;
const run = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
const frame = (video, t, out) => run(FF, ['-v', 'error', '-y', '-ss', String(t), '-i', video, '-frames:v', '1', out]);
const psnr = (a, b, crop) => {
  const f = crop ? '[0:v]crop=' + crop + ',format=rgb24[a];[1:v]crop=' + crop + ',format=rgb24[b];[a][b]psnr' : '[0:v]format=rgb24[a];[1:v]format=rgb24[b];[a][b]psnr';
  const m = run(FF, ['-i', a, '-i', b, '-lavfi', f, '-f', 'null', '-']).stderr.match(/average:([\d.]+|inf)/);
  return m ? (m[1] === 'inf' ? Infinity : +m[1]) : null;
};
const firstSound = (file, from, to) => {
  const t = run(FF, ['-hide_banner', '-nostats', '-ss', String(from), '-to', String(to), '-i', file, '-af', 'silencedetect=noise=-80dB:d=0.05', '-f', 'null', '-']).stderr;
  if (!/silence_start: 0\b|silence_start: -?0\.0/.test(t)) return 0;
  const m = t.match(/silence_end: ([\d.]+)/); return m ? +m[1] : null;
};
const truePeak = (file, from, to) => {
  const t = run(FF, ['-hide_banner', '-nostats', '-ss', String(from), '-to', String(to), '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr;
  const m = t.slice(t.lastIndexOf('Summary:')).match(/True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS/); return m ? +m[1] : null;
};
const rms = (file, from, to) => { const x = readMono(file, from, to); let e = 0; for (const v of x) e += v * v; return +(10 * Math.log10(e / x.length + 1e-20)).toFixed(1); };

const want = process.argv.slice(2);
let failures = 0;
for (const p of picked) {
  const video = path.join(DEMOS, 'bloom-' + p.id + '.mp4');
  if (want.length ? !want.includes(p.id) : !fs.existsSync(path.join(ROOT, video))) continue;
  if (!fs.existsSync(path.join(ROOT, video))) { console.log(p.id + ': MISSING ' + video); failures++; continue; }
  const S = p.static.seconds, t0 = p.section.t0, t1 = p.section.t1, total = S + (t1 - t0);
  const rows = [], ok = (name, pass, text) => { rows.push((pass ? '  ok   ' : '  FAIL ') + name.padEnd(7) + text); if (!pass) failures++; };

  const streams = JSON.parse(run(FP, ['-v', 'error', '-show_entries', 'stream=codec_type,start_time,duration,nb_frames', '-of', 'json', video]).stdout).streams;
  const v = streams.find(s => s.codec_type === 'video'), a = streams.find(s => s.codec_type === 'audio');
  ok('LENGTH', Math.abs(+v.duration - total) <= 1 / 30 + 1e-3 && Math.abs(+a.duration - +v.duration) <= 0.03 && +v.start_time === 0 && +a.start_time === 0,
    'video ' + (+v.duration).toFixed(3) + ' s (' + v.nb_frames + ' frames) · audio ' + (+a.duration).toFixed(3) + ' s · expected ' + total.toFixed(3) + ' · starts ' + v.start_time + ' / ' + a.start_time);

  const fLabel = path.join(TMP, 'chk-' + p.id + '-label.png'), still = path.join(TMP, p.id + '-still.png');
  frame(video, 1, fLabel);
  const band = psnr(fLabel, still, '1500:90:60:30'), rest = psnr(fLabel, still, '1920:700:0:300');
  ok('LABEL', band != null && band < 30 && rest >= 35, 'the label band differs from the bare still (PSNR ' + band + ' dB) · the notation below matches it (' + rest + ' dB)');

  const fJoin = path.join(TMP, 'chk-' + p.id + '-join.png');
  frame(video, S, fJoin);
  run('node', ['tools/export_video.js', '--ir', 'piece-septet', '--view', 'video', '--parts', p.parts, '--probe', String(t0), '--probeDir', TMP]);
  const probe = path.join(TMP, 'piece-septet_video_t' + t0.toFixed(3).replace('.', '-') + '.png');
  const right = psnr(fJoin, probe), wrong = psnr(fJoin, still);
  ok('JOIN', right >= 35 && right > wrong, 'the first section frame against a probe at ' + t0 + ' s: ' + right + ' dB · against the still: ' + wrong + ' dB');

  const recFirst = firstSound(p.section.audio, t0, t0 + 20), vidFirst = firstSound(video, S, S + 20);
  ok('SOUND', recFirst != null && vidFirst != null && Math.abs(vidFirst - recFirst) <= 0.05,
    'the first sound ' + (vidFirst == null ? '?' : vidFirst.toFixed(3)) + ' s after the join · the recording ' + (recFirst == null ? '?' : recFirst.toFixed(3)) + ' s after ' + t0 + ' (Δ ' + (vidFirst != null && recFirst != null ? ((vidFirst - recFirst) * 1000).toFixed(0) : '?') + ' ms)');

  const f0 = { bclvc: 261.8, vn1va: 587, flvn2: 881 }[p.id];
  const m = measure(video, 0, S, f0);
  const vsTake = Math.abs(m.spectrum.rate - p.static.measuredHz) / p.static.measuredHz, vsChart = Math.abs(m.spectrum.rate - +p.chartHz) / +p.chartHz;
  ok('RATE', vsTake <= 0.02 && vsChart <= 0.04, 'the static beats at ' + m.spectrum.rate + ' Hz in the mp4 · the take ' + p.static.measuredHz + ' (' + (vsTake * 100).toFixed(1) + ' %) · the label ' + p.chartHz + ' (' + (vsChart * 100).toFixed(1) + ' %) · depth ' + m.envelope.depth);

  const peakT = S + (p.still.t - t0);
  const sRms = rms(video, 1, S - 1), mRms = rms(video, peakT - 3, peakT + 3), sTp = truePeak(video, 0, S), mTp = truePeak(video, S, total);
  ok('LEVEL', sTp <= -0.8 && mTp <= -0.8, 'the static RMS ' + sRms + ' dBFS · the music at its peak instant (' + peakT.toFixed(1) + ' s) ' + mRms + ' dBFS · true peaks ' + sTp + ' / ' + mTp + ' dBTP');

  console.log(p.id + ' — ' + p.label + ' — ' + video + ' (' + (fs.statSync(path.join(ROOT, video)).size / 1048576).toFixed(1) + ' MiB)');
  rows.forEach(r => console.log(r));
}
console.log(failures ? failures + ' check(s) FAILED' : 'all checks passed');
process.exit(failures ? 1 : 0);
