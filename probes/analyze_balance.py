#!/usr/bin/env python3
"""analyze_balance.py - measure the ENSEMBLE BALANCE recording and print the trims.
RUNNING_LOG S41 (composer, 2026-09-04: "an easy but data based way to normalize the volume
between instruments ... a 127 flute is same perceived loudness as 127 violin").

    python probes/analyze_balance.py <recording.wav> [--schedule probes/balance_schedule.json]
                                     [--target quietest | -18] [--weight k | flat]
                                     [--out bank/balance.json]

The recording is the rack's REC track, started BEFORE probes/balance_probe.ps1 and stopped
after it. The timetable (the schedule file) says when every note was played; the recording's
own start is found from its first onset, each note's window is refined to its local onset, and
the level is the loudest 1 s RMS inside the note - flat (dBFS) and K-weighted (the ITU-R
BS.1770 pre-filter: a +4 dB high shelf above ~1.7 kHz and a 38 Hz high-pass, applied in the
frequency domain - the "perceived" reading, numpy only).

Per instrument: level127 = the mean over its three pitches at velocity 127 (dB); level64 the
same at 64; trim = target - level127, target = the QUIETEST instrument's level127 by default
(cuts only, so nothing can clip) or a dB figure. Writes bank/balance.json (measurements with
provenance + the trims) and prints the Reaper fader values to type in.
"""
import argparse, json, os, sys, datetime
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass

# ---- BS.1770 K-weighting as a magnitude response (48 kHz reference coefficients) ----
_SHELF = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_HPF = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])
def _mag(b, a, f):
    w = 2 * np.pi * f / 48000.0
    z = np.exp(-1j * w)
    num = b[0] + b[1] * z + b[2] * z * z
    den = a[0] + a[1] * z + a[2] * z * z
    return np.abs(num / den)
def k_weight(f):
    f = np.minimum(f, 23999.0)
    return _mag(*_SHELF, f) * _mag(*_HPF, f)

def db(x): return 20 * np.log10(max(x, 1e-9))

def level(seg, sr, weight):
    """loudest 1 s window (RMS) in the segment, flat and K-weighted, in dB(FS)."""
    win = min(len(seg), int(sr * 1.0)); hop = max(1, int(sr * 0.05))
    best_flat, best_k = 1e-9, 1e-9
    f = np.fft.rfftfreq(win, 1 / sr); wk = k_weight(f)
    for s in range(0, max(1, len(seg) - win + 1), hop):
        w = seg[s:s + win]
        rms = float(np.sqrt(np.mean(w * w) + 1e-18))
        if rms > best_flat: best_flat = rms
        if weight:
            spec = np.fft.rfft(w * np.hanning(len(w)))
            # Parseval, one-sided spectrum, de-windowed: rms^2 = 2 * sum|X W|^2 / (N * sum h^2)
            p = np.sum((np.abs(spec) * wk) ** 2) / np.sum(np.hanning(len(w)) ** 2)
            rk = float(np.sqrt(2 * p / len(w) + 1e-18))
            if rk > best_k: best_k = rk
    return db(best_flat), (db(best_k) if weight else None)

def envelope(x, sr, hop_ms=10):
    hop = int(sr * hop_ms / 1000); n = len(x) // hop
    e = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-18)
    return 20 * np.log10(e), hop

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('wav')
    ap.add_argument('--schedule', default=os.path.join(ROOT, 'probes', 'balance_schedule.json'))
    ap.add_argument('--target', default='quietest')
    ap.add_argument('--weight', default='k', choices=['k', 'flat'])
    ap.add_argument('--out', default=os.path.join(ROOT, 'bank', 'balance.json'))
    ap.add_argument('--offset', type=float, default=None, help='recording start of the schedule, in s (default: detected from the first onset)')
    a = ap.parse_args()

    S = json.load(open(a.schedule, encoding='utf-8'))
    x, sr = sf.read(a.wav, always_2d=True); x = x.mean(axis=1)
    env, hop = envelope(x, sr)
    floor = float(np.percentile(env, 5))
    notes = S['notes']
    # the recording's start: the first frame 20 dB over the floor = the first note's onset
    if a.offset is None:
        idx = np.argmax(env > floor + 20)
        if not (env > floor + 20).any(): sys.exit('no onset found: is this the right file?')
        offset = idx * hop / sr - notes[0]['tOnMs'] / 1000
    else: offset = a.offset
    print(f'{os.path.basename(a.wav)}: {len(x)/sr:.1f} s @ {sr} Hz | noise floor {floor:.1f} dB | schedule starts at {offset:+.3f} s in the file')

    rows = []
    for n in notes:
        t_on = n['tOnMs'] / 1000 + offset; t_off = n['tOffMs'] / 1000 + offset
        # refine to the local onset: the first frame 15 dB over the floor within -0.1 ... +0.4 s of the expected time
        f0 = max(0, int((t_on - 0.1) * sr / hop)); f1 = min(len(env), int((t_on + 0.4) * sr / hop))
        loc = np.argmax(env[f0:f1] > floor + 15) if f1 > f0 else 0
        found = (env[f0:f1] > floor + 15).any() if f1 > f0 else False
        on = (f0 + loc) * hop / sr if found else t_on
        seg = x[int(on * sr): int(min(len(x), (t_off + 0.2) * sr))]
        if not len(seg): flat, kk = -99.0, -99.0
        else: flat, kk = level(seg, sr, a.weight == 'k')
        rows.append(dict(n, onset=round(on, 3), found=bool(found), dbFlat=round(flat, 2), dbK=(round(kk, 2) if kk is not None else None)))

    key = 'dbK' if a.weight == 'k' else 'dbFlat'
    insts = {}
    for r in rows:
        d = insts.setdefault(r['inst'], {'label': r['label'], 'port': r['port'], 'tech': r['tech'], 'techLabel': r['techLabel'], 'notes': []})
        d['notes'].append({'pitch': r['pitch'], 'vel': r['vel'], 'onset': r['onset'], 'found': r['found'], 'dbFlat': r['dbFlat'], 'dbK': r['dbK']})
    for k, d in insts.items():
        v127 = [q[key] for q in d['notes'] if q['vel'] == 127 and q['found']]
        v64 = [q[key] for q in d['notes'] if q['vel'] == 64 and q['found']]
        d['level127'] = round(float(np.mean(v127)), 2) if v127 else None
        d['level64'] = round(float(np.mean(v64)), 2) if v64 else None
        d['spread127'] = round(float(max(v127) - min(v127)), 2) if len(v127) > 1 else None
    levels = [d['level127'] for d in insts.values() if d['level127'] is not None]
    if not levels: sys.exit('no note found at all')
    target = min(levels) if a.target == 'quietest' else float(a.target)
    for d in insts.values():
        d['trimDb'] = round(target - d['level127'], 1) if d['level127'] is not None else None

    print(f"\nweighting {a.weight} | target {target:.2f} dB ({'the quietest instrument' if a.target == 'quietest' else 'given'})\n")
    print(f"{'instrument':10} {'port':7} {'technique':32} {'127 (dB)':>9} {'spread':>7} {'64 (dB)':>8} {'127-64':>7} {'TRIM':>6}   notes at 127 (pitch: dB)")
    for k in S['order']:
        d = insts.get(k)
        if not d: continue
        n127 = ' '.join(f"{q['pitch']}:{q[key]:.1f}" + ('' if q['found'] else '?') for q in d['notes'] if q['vel'] == 127)
        l127 = f"{d['level127']:.1f}" if d['level127'] is not None else '  -'
        l64 = f"{d['level64']:.1f}" if d['level64'] is not None else '  -'
        diff = f"{d['level127'] - d['level64']:.1f}" if d['level127'] is not None and d['level64'] is not None else '  -'
        sp = f"{d['spread127']:.1f}" if d['spread127'] is not None else '  -'
        tr = f"{d['trimDb']:+.1f}" if d['trimDb'] is not None else '  -'
        print(f"{d['label']:10} {d['port']:7} {d['techLabel'][:32]:32} {l127:>9} {sp:>7} {l64:>8} {diff:>7} {tr:>6}   {n127}")
    missing = [f"{r['label']} {r['pitch']}@{r['vel']}" for r in rows if not r['found']]
    if missing: print('\nNOT FOUND (no onset where the timetable expects one): ' + ', '.join(missing))
    print('\nReaper: type each TRIM into the track\'s volume field (double-click the fader) - the piece\'s fff is then matched across the ensemble.')

    out = {'measuredAt': datetime.datetime.now().isoformat(timespec='seconds'), 'wav': os.path.basename(a.wav), 'schedule': os.path.relpath(a.schedule, ROOT).replace('\\', '/'),
           'scheduleGeneratedAt': S.get('generatedAt'), 'weighting': a.weight, 'targetDb': round(target, 2), 'targetRule': a.target, 'noiseFloorDb': round(floor, 1), 'offsetS': round(offset, 3),
           'instruments': {k: insts[k] for k in S['order'] if k in insts}}
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(out, open(a.out, 'w', encoding='utf-8'), indent=1)
    print(f'-> {os.path.relpath(a.out, ROOT)}')

if __name__ == '__main__':
    main()
