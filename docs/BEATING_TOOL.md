# BEATING_TOOL — the beatings: a pair of players on one pitch, a gap that beats

*Requirements gathered 2026-09-06 evening (RUNNING_LOG §145–166; CN-28, CN-29, CN-33, CN-34), planned whole as PLAN 1f (eight
steps, the fixed format); built step by step from 2026-09-07. Status per section as it gets built, the way STRIKES_TOOL.md and
TRILLS_TOOL.md do it. The composer's word for the object: **"beating is good"** (§146). The tool is the successor, for this piece, of
the tuba piece's morph tool — `docs/MORPH_NOTES.md` is the memory for that tool's all-purpose revision (D22).*

## 0 · The picture

> *"strikes with morph chords, like freeze frames or old time slide show … 'morph events'"* (CN-28) · *"the expansion of pitch to
> expand beating, the rebreath … and the Crescendo … the multiple pairs"* (CN-29) · *"the atom will be a pair of players"* (§146) ·
> *"a panel, and I can see the pair represented by some sort of curve … it'll be bipolar … everything should have handles … hit
> space bar to play that configuration"* (§147) · *"the axis should be beats per second"* (§148)

Section 2's material: strikes whose chords are held and beat, the slide show. A **beating** is one pair of players on one centre
pitch, both bending around it by mirrored curves (a flat partner = one holds), the gap between them beating; up to three pairs make
a pattern; the piano is out (CN-34: an anchor only). The beating is **its own thing** in the score (§160): no mute rule, no eating,
no overlap avoidance — the accents added by hand.

## 1 · Decisions taken (2026-09-06)

- **The name and the atom:** a *beating* (a strike, a trill, a run, a beating); the pair is the unit — the one thing the tuba engine
  never had (#4 day 13, finding 3: *"the pair is not the unit; the voice is"*).
- **The panel over the shuffle:** direct manipulation — a row per pair, mirrored curves with handles on rails, a crescendo lane, a
  breath lane, shapes from a menu or the trill's curve tool, the space bar, a typed duration, takes. The shuffle drawer of §146
  **parked** (*"hold on the shuffle for now"*); it returns later as a writer into the same rows (step 8).
- **The axis is beats per second**, the cents derived per player from the pitch and the interval (the register law, D28: a fixed
  cents doubles per octave). The tool's zero at an interval is the JUST interval (the tempered one already beats).
- **The piano is out** (CN-34): six players, up to three pairs.
- **The beating out of the strike chain** (§160): *"it'll just be its own thing"* — no mute, no eating, no exit at the next strike
  note, no greying; the score's ordinary conflict marks apply as to any note.
- **The breath model** (§152): single events on one bow or breath; longer ones with the dotted go line at each breath on sliders, a
  ceiling warning, *continuous* (the performer re-bows at will) or *designated* (the marks placed), a seeded shuffle for the breaths.
- **The player's range:** *"usually within semitone at the most"* (§150) — one semitone for all six, the winds' by embouchure.
- **The bend convention** (#1's, §150): the bend before the note, the centre after, re-key past the sampler's range.

## 2 · The anatomy — seven elements (§146)

the pair · its pitch · the beating curve (bloom out of unison, close into it, hold) · the crescendo · the breaths · the timing
between players (inside a pair the phase, between pairs the offsets) · the entry and the exit; the frame = the length and the pair
count.

## 3 · The palette — `built 2026-09-07 (PLAN 1f step 1; RUNNING_LOG §167–168; the probe run in the rack the same night)`

> *"we did string probes for the string quartet … figure out how we did pitch bend there … the same with UVI … the realistic range
> for a real player … embouchure bend … usually within semitone at the most"* (composer, §150)

**What the tool knows now, for each of the six bending players** — `score/public/beating_calc.js` (the palette part; page and
tools alike, the accel calculator's pattern) over the recipe `sandbox/instruments.js`; checked by `tools/beating_calc_check.js`.

| player | ordinary voice | range (measured 0d) | player's bend | sampler's bend per full bend (measured 2026-09-07) | limit |
|---|---|---|---|---|---|
| flute | `ord` (SI2, UVI) | C4–C7 (60–96) | ±1 st | ±2.00 st (the tuba's 1.99 confirmed) | ±100 c (the player's) |
| bass clarinet | `senza_vel` (#13, Xsample) | A#1–F4 (34–65) | ±1 st | ±0.98 st | ±98 c (the sampler's) |
| violin 1 | `senza_vel` (#6, Xsample) | G3–F7 (55–101) | ±1 st | ±0.96 st | ±96 c |
| violin 2 | `senza_vel` (#6) | G3–F7 (55–101) | ±1 st | ±0.97 st | ±97 c |
| viola | `senza_vel` (#6) | C3–A6 (48–93) | ±1 st | ±0.99 st | ±99 c |
| cello | `senza_vel` (#6) | C2–B5 (36–83) | ±1 st | ±0.97 st | ±97 c |
| piano | — | — | 0 (`beating: false`) | — | never offered |

- **The recipe fields** (`sandbox/instruments.js`): `playerBendSt` (his rule, 1 for all six; the winds' to be narrowed by his ear
  when heard) · `bendRangeSt` (the sampler's — the probe's numbers, written by `tools/apply_bend_ranges.js` as the generated
  `MEASURED_BEND` block; `bendMeasured`, `bendMutableByMidi`, `bendResidueCents` beside it) · `beating: false` on the piano.
  `BeatingCalc.bendLimits(recipe, inst)` returns both and the smaller as the limit in cents — on the five Xsample instruments that is
  the sampler's, a hair under the semitone; the panel's ceiling stays in beats per second (step 4) and shows the cents so this limit
  is visible.
- **The pairing rule** — `BeatingCalc.pairsFor(recipe, pitch, interval)`: at unison both players must hold the pitch on their
  ordinary voice; at an interval one holds the lower note and the other the upper (the pitch assigned is the pair's LOWER note, §158);
  when either could take either note the higher-ranged player takes the upper. A silent key inside a measured range is refused.
  The panel offers only these (step 5's keyboard dims the rest).

| pitch | unison pairs | at a fifth (lower < upper; * = either way possible) |
|---|---|---|
| C2 (36) | BCl+Vc | BCl<Vc* |
| C3 (48) | BCl+Va · BCl+Vc · Va+Vc | BCl<Vn1 · BCl<Vn2 · BCl<Va* · BCl<Vc* · Va<Vn1 · Vc<Vn1 · Va<Vn2 · Vc<Vn2 · Vc<Va* |
| G3 (55) | 10 (all but the flute's) | the flute only ever the upper: BCl<Fl · Vn1<Fl · Vn2<Fl · Va<Fl · Vc<Fl; the rest either way |
| C4 (60) | all 15 | 15 |
| C5 (72) | 10 (the bass clarinet gone) | 10 |
| C6 (84) | Fl+Vn1 · Fl+Vn2 · Fl+Va · Vn1+Vn2 · Vn1+Va · Vn2+Va | 6 |
| F#6 (90) | the same 6 | 5 (the viola can no longer take the upper) |
| C7 (96) | Fl+Vn1 · Fl+Vn2 · Vn1+Vn2 | none (G7 is above every range) |
| F7 (101) | Vn1+Vn2 | none |

- **The intervals inside a pair** (`BeatingCalc.INTERVALS`, §148): unison 1:1 · minor third 6:5 · major third 5:4 · fourth 4:3 ·
  fifth 3:2. The beating is between the coincident partials — the lower's p-th against the upper's q-th — so a cent of detuning beats
  p times the unison's rate (1 · 6 · 5 · 4 · 3) and fainter. The just offsets against equal temperament, the tool's zero: fifth
  +1.955 c · fourth −1.955 c · major third −13.686 c · minor third +15.641 c.

**The bend probe** — the tuba's `probes/bend_probe.ps1` + `analyze_bend_probe.py` adapted to this repo's kit:

- `node tools/balance_schedule.js --bend` → `probes/bend_schedule.json`: the six players on their ordinary voices, each at the
  middle of its measured range (flute F#5 78 · bass clarinet D3 50 · violins F#5 78 · viola B4 71 · cello C4 60), velocity 100, 2 s
  held + 2 s settle; eight slots each — an unbent reference · +50 % · +100 % · −100 % of full bend · a +50 % bend left UNRESET and
  the plain note after it (the residue) · RPN 0 asked for 12 semitones then +100 % · RPN 0 back to 2 and +100 % again. 48 notes,
  3.5 minutes. The bend rides in the prelude 300 ms before the note (after CC7 / CC0), the centre 400 ms after the note-off.
- `probes/balance_probe.ps1` plays it (the `bend` · `rpn` · `reset` events, 2026-09-07; it also centres the bend on every channel
  it closes); `tools/probe_run.sh` records it through the bridge and picks `probes/analyze_bend.py` by the schedule's `"bend": true`
  (an unarmed REC track now aborts the run instead of analysing a stale take).
- `probes/analyze_bend.py` reads per slot the cents that sounded (the tuba's method: f0 by energy-normalised autocorrelation within
  ±6 semitones of the written note; the RPN slots also an octave up, where an honoured RPN 0 = 12 puts full bend) and derives per
  player the **range in semitones** (the median over the three fractions, the spread), the **residue**, the **pre-arm** (onset vs
  settled at the 300 ms lead), **RPN honoured** (= MIDI can change the range) and **restored**; writes `bank/bend_ranges.json` and
  `probes/last_bend_analysis.json`. `probes/selftest_bend.py` proves it on a synthetic take with six unlike simulated players
  (ranges 0.5–2 st, two honouring RPN, tuning offsets): every reading within 0.2 c, every derivation right (2026-09-07).
- `node tools/apply_bend_ranges.js` writes the measured ranges into the recipe as `MEASURED_BEND` (applied at load:
  `bendRangeSt`, `bendMeasured`, `bendMutableByMidi`, `bendResidueCents`); the provisional values stay wherever the probe read nothing.
- **The one-line run** (Reaper and the rack up, the REC track armed, nothing else sending MIDI):
  `bash tools/probe_run.sh probes/bend_schedule.json` — then `node tools/apply_bend_ranges.js`.
- **Result (2026-09-07, `01-REC-260907_0015.wav`, 48/48 slots aligned, every player OK; RUNNING_LOG §168):**

| player | pitch | reference | +50 % | +100 % | −100 % | range | spread | residue after an unreset +50 % | RPN 0 | restored |
|---|---|---|---|---|---|---|---|---|---|---|
| flute | F#5 | +4.7 c (the sample sharp) | +104.9 | +204.8 | −195.4 | **2.00 st** | 0.00 | +100 c | ignored | yes |
| bass clarinet | D3 | −1.7 | +46.9 | +96.1 | −99.6 | **0.98 st** | 0.01 | +49 c | ignored | yes |
| violin 1 | F#5 | +1.6 | +49.4 | +98.0 | −96.3 | **0.96 st** | 0.02 | +50 c | ignored | yes |
| violin 2 | F#5 | +1.5 | +49.8 | +99.0 | −95.1 | **0.97 st** | 0.01 | +50 c | ignored | yes |
| viola | B4 | −1.3 | +48.3 | +97.3 | −96.6 | **0.99 st** | 0.04 | +49 c | ignored | yes |
| cello | C4 | −0.3 | +47.9 | +99.1 | −96.9 | **0.97 st** | 0.03 | +48 c | ignored | yes |

  What it says: **the five Xsample instruments are set to ±1 semitone** in Kontakt (0.96–0.99 measured, linear; the
  quarter-tone-step setting MORPH_NOTES §1 named), **the SI2 flute to ±2** (the tuba's 1.99 again); **no range can be changed by
  MIDI** (RPN 0 ignored on all six — the re-key is the only way past a sampler's range, never needed under the player's semitone);
  **the residue is real on every instrument** (an unreset bend stays on the channel: the tick's `resetMorphBend` matters on all six,
  and the player now centres the bend on every channel it closes); **the pre-arm at 300 ms is enough** — the onset scoop of the bent
  notes equals the unbent reference's own (the samples' attacks: the bass clarinet's reed starts +14 c sharp, the bows 5–10 c flat,
  the flute in tune, all inside the first 80 ms); the baselines: SI2's F#5 sample is 4.7 c sharp, the rest within ±2 c.

**Still the tuba's, until step 3:** the tick's bend arithmetic at `composer.html` (`morphBend` → 14-bit at a fixed 1.99 st) — step 3
reads `bendRangeSt` of the instrument instead; `resetMorphBend` (the centre on stop) stays as it is.

**Open, for the composer:** the winds' real embouchure range by ear once a beating is heard (the 1 st is his ceiling, not a
measurement) · whether the curve channels' copies of the Xsample instruments (D11: 2–4) share the main channel's bend range — the
probe reads the technique's own channel; assumed the same until a beating plays on a curve channel.

## 4 · The beating math — step 2 `todo`

A pure module (this file's `beating_calc.js`, extended): rate ↔ cents by pitch and interval, the two curves and their difference,
the breaths, the duration stretch; `tools/beating_calc_check.js` extended. *(PLAN 1f item 2.)*

## 5 · The beating object — step 3 `todo`

One pair in the score, heard: the object on its two lanes, its notes regenerated at play (D20), the bend through the instrument's
own range, 1g's remap; unison first, then fifth and fourth by ear. *(PLAN 1f item 3.)*

## 6 · The panel — step 4 `todo`

> *"a screen, a panel, and I can see the pair represented by some sort of curve … it'll be bipolar … I can slide one over … everything
> should have handles … hit space bar to play that configuration … audition that configuration over different durations"* (§147)

Rows, the mirrored curves with handles on rails, the crescendo and breath lanes, the beating band tinted by zone, shapes and
freehand, the slide, the space bar, the duration box, takes. *(PLAN 1f item 4.)*

## 7 · The pitch side — step 5 `todo`

> *"the menu of strikes … it appears on the keyboard … assign a pitch to a pair … the chord or sonority is between the three pairs …
> internally, there's Unison, but I also would like to try fourths, fifths"* (§148)

The strikes menu → the drawer's keyboard inside the panel, a pitch per pair (the lower note), the sonority between pairs by
relation from a root, the interval inside a pair. *(PLAN 1f item 5.)*

## 8 · The breaths (§152) — inside steps 2 and 4

> *"there'll be single events … longer events … bring in the indicator from the tuba piece … the dotted go line … on sliders … a
> warning … maximum breath length or bow length … continuous … or designate when the bows should change … an opportunity for the
> shuffle"* (§152)

## 9 · Insertion — step 6 `todo`

> *"keep the beating out of the strike chain so unlike the trills … we'll just add accents manually, but it doesn't have to do things
> like avoid overlaps and gray out notes … it'll just be its own thing"* (§160)

At the playhead, its own group and META shape, re-insert replaces, select-and-P, stretch regenerates; nothing around it touched.
*(PLAN 1f item 6.)*

## 10 · Notation (phase 2a) `deferred`

Two curves per part (the gliss above, the crescendo below), the two written pitches at least a quarter tone apart, a go line at
every breath, the beat rate at both ends of the gliss — the tuba's settled form (`for_seven_tubas/docs/MORPH_NOTATION.md`).

## 11 · Open, for the composer, when reached

- the winds' embouchure range by ear (§3) · the breath and bow ceilings per instrument, tuned by ear (step 2's defaults) · his
  verdicts on the fifth and the fourth inside a pair (step 3) · where the first pattern goes in the piece (step 7).

## Log (append-only)

- **2026-09-07 — step 1 built:** the palette (§3): the recipe fields, `beating_calc.js` (the palette part, 37 checks), the bend
  probe on this kit (the schedule, the player's bend events, the analyzer and its self-test, the applier, the runner's switch);
  **the probe run in his rack the same night** (the bridge up and idle, at his word to run the plan independently): SI2 ±2.00 st,
  the Xsample five ±0.96–0.99 st, RPN ignored everywhere, the residue real everywhere, the pre-arm fine — written into the recipe.
