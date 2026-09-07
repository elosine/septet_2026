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

## 4 · The beating math — `built 2026-09-07 (PLAN 1f step 2; RUNNING_LOG §169) — checked in node, nothing heard yet`

> *"there'll be single events … longer events … bring in the indicator from the tuba piece … the dotted go line … on sliders … a
> warning … maximum breath length or bow length … continuous … or designate when the bows should change … an opportunity for the
> shuffle"* (composer, §152)

`score/public/beating_calc.js`, the second half (page and tools alike); `tools/beating_calc_check.js`, 77 checks. **One call turns a
pair's description into each player's chain of notes**: `renderPair(spec, recipe)` and, for several pairs at offsets,
`renderPattern({ length, pairs, offsets }, recipe)`.

- **Units.** Time in seconds inside the event; every curve over normalised time 0 → 1 (so a typed duration re-samples it); a player's
  **rate in beats per second, signed** (above the centre +, below −); **cents** against the player's own centre; **level 0 → 1** = the
  score's curve height (D23) — the tick applies 1g's remap, not this module.
- **The conversion** (§148): a player's rate against a partner at the centre, on the interval's coincident partial p —
  cents = 1200·log2(1 + rate ÷ (p·f)), and back exactly. The register law is inside: 1 beat per second is 13.18 c at C3 (the tuba's
  13.19 of D28 to the rounding), 6.60 c at C4, 26.27 c at C2. The same cents beat 3× at a fifth, 4× at a fourth, 5× at a major third.
- **The heard beating** = the gap between the two players' coincident partials: beat = p·f·|2^(cU/1200) − 2^(cL/1200)|. The panel draws
  ONE heard-rate curve per pair and `mirrored()` splits it bipolar, half each — so the drawn height is the beating heard (a 3-hump
  gives ±9.9 c each at C4 and 2.99 beats per second at the peak); `flatPartner()` gives it all to one player (one holds — the
  trainable form). Two signed curves may also be given outright. **The zones:** < 1 flanger · 1–15 beating · > 15 roughness.
- **Curves and shapes.** Breakpoints `[[p, v], …]`, linear between, held flat beyond the ends; a number is a flat line. The menu:
  `flat · rampOut · rampIn · hump · arc (a raised cosine, nine points) · burst` — a few points, every one a handle for step 4. **The
  slide** = a player's curve read later by so many seconds (before its start the first value holds, after its end the last).
  Proven: mirrored humps in phase = a pulse 0 → max → 0; the upper slid by half the length = a plateau at half the peak; two curves
  on the same side, one slid = the beat dies to a momentary unison and returns.
- **The breaths** (§152). Three modes per player: `one` (a single note the whole length — flagged past the ceiling) · `continuous`
  (one long note, marked for the notation: re-bow / re-breathe at will) · `designated` (the marks as note boundaries — hand-placed,
  kept; the rest dealt). **The deal** (the tuba carrier's rule, per instrument): a target length with jitter (35 %), capped by the
  ceiling, seeded (another seed = another deal, the same seed the same); the pair's two players half a breath apart; no span ever
  longer than its ceiling, the last at least 40 % of the target. **The ceilings** — DEFAULTS, his ear to tune them (§11): flute 8 s
  breath · bass clarinet 10 s · violins and viola 12 s bow · cello 10 s; louder = shorter (× 0.85 above level 0.5, × 0.7 above 0.75);
  the winds re-enter after a 0.5 s gap, a bow changes without one. Continuity across a breath is free: the next note reads the same
  curves where the last stopped.
- **The re-key** (#1's convention, §150): where a player's cents pass the sampler's range the note splits, the key moves a semitone
  and the bend is re-based against it, the seam flagged `sampler-range`. Under his semitone and the measured ranges it never happens;
  the module does it anyway.
- **The output.** Per player a chain of notes `{ key, keyOffset, startS, endS, breath, bend: [[dt, cents]…] (note-relative, the tuba's
  morphBend shape, 50 ms steps), level: [[dt, 0…1]…], flags }`; per pair the panel's lines (`samples`: the rates, the cents, the beat,
  the zone, the level), the zones, `maxBeat`, `maxCents`, the breath marks and spans, the flags; per pattern the notes in absolute time
  at the rows' offsets, the length, the flags and the **META contour** (the crescendo's mean across the pattern, 33 points, §160).
  **The flags:** `player-limit` (past playerBendSt) · `sampler-range` (re-keyed) · `roughness` (the zone) · `ceiling` (a span past the
  breath or bow) · `out-of-range` (a player who cannot hold the note).
- **The stretch:** `stretch(spec, seconds)` — the curves are already normalised; the slides and the hand-placed marks scale; dealt
  breaths re-deal at the new length.

*Verified in node only (the plan's checks: rate → cents → rate exact on 250 points; the fifth at 3×; the just offsets on the upper
note; the pulse, the plateau, the momentary unison; a 40 s event breathed inside the ceilings and staggered; the stretch; every flag;
a three-pair pattern). Nothing heard until step 3.*

## 5 · The beating object — `built 2026-09-07 (PLAN 1f step 3; RUNNING_LOG §170) — verified on a copy by the decoded MIDI; his ear pending`

> *"So we'll be able to adjust the maximum beating. Yes."* (composer, §154 — the rate row; the 3 per second is only the birth default)

**A beating is a zone** (`midiModel: 'beating'`) on the launching player's lane with a `beating` block:

| field | meaning |
|---|---|
| `partnerLayer` | the partner's lane; the zone carries both players — one object, two lanes (a dashed bracket on the partner's) |
| `pitch` | the pair's LOWER note (§158); at unison both sit on it |
| `interval` | `unison · m3 · M3 · P4 · P5` — the partner above by the just interval, its bend carrying the just offset |
| `rateFrom`, `rateTo`, `shape` | the heard beating in beats per second across the length: `ramp` (out of unison) · `hump` (out and back) · `arc` · `flat`; `beat` (a drawn curve) overrides them from step 4 |
| `share` | how the beating is split between the two (0.5 = mirrored, half each — the drawn height is the beating heard) |
| `levelLo`, `levelHi` | the crescendo follows the beating between these two heights (0 → 1 = the curve height, D23) |
| `breath` | `{ mode: one · continuous · designated, seed, target, marks }` (§4's model) |
| `slide` | `{ lower, upper }` seconds — a player's curve read later (step 4's phase slide) |
| `launchedFrom` | the strike note's id when born on one — a record only, no link (§160) |

**Realization** (never stored as notes): at every play start, on Hear and after a drag or a stretch, `BeatingCalc.renderPair` makes one
sustained note per player per breath, each with its bend and level breakpoints; they become the zone's `midiSnippet` — the partner's
events routed per event to its own port and channel, `_bend` events (14-bit) for the pitch bend — and `tickZoneMidiPlayback` plays
them with Web MIDI timestamps (D19). Per player: 300 ms before its first note (the probe's lead) CC7 at the start level, the
articulation (the ordinary voice's CC0) and the first bend value; then per note the articulation and the bend again 20 ms before it
(a strike on the same slot may have switched the preset — its own thing, no arbitration), the note-on with the velocity 1g's remap
gives for the note's top level, the bend stream and the CC7 stream (only the changes; the CC7 through `cc7ForHeight`). **The bend is
converted through the instrument's measured range** (`bendRangeSt`, §3), **centred 400 ms after the zone's end** and on every stop
(`resetMorphBend`: the residue is real on all six). A play start inside the zone lands the latest articulation, CC7 and bend of each
slot first.

**On the page:** **B** on a selected strike note makes a beating there — the note's pitch the centre, the nearest lane that can pair
with it (step 1's table) the partner, a 6 s bloom 0 → 3 beats per second, one breath, the crescendo following the beating; B at the
playhead with nothing selected uses the lane's nearest earlier note (the trill's anchor rule) or the middle of the range; the piano
lane and a note nobody else can hold are refused with a message. The zone: selectable, draggable (50 ms steps, the start kept on
its note), the right edge a stretch (the curves stretch with it, the breaths re-deal), Ctrl-drag a copy; the group drag carries it
(§144). **P** opens its row: partner (the lanes that can play it) · pitch · interval chips · rate from / to and the shape · length ·
breath mode and seed · level low / high · a readout (max beats per second, each player's cents against its limit, the just offset,
the notes, the flags, the slots) · **▶ hear** (the pair alone, timestamped, with the bends, centred after). The label names the
pair, the note(s), the interval, the rates and shape, the max rate, the notes, the breath mode and any flag.

**Verified on `zz-ai-beating` (a copy of the piece) on :5301, 2026-09-07 (§170):** launched on the last strike note (the cello's F3
at 175.636 s) → Vc + Va on F3; the tick's MIDI captured on fake outputs over the zone and decoded: both slots (Va ch 1, Vc ch 1) and
nothing on any other port; the bend 300 ms before both note-ons; CC0 5 (senza vibrato) and CC7 (105 / 98 from the remap) at the
lead, 22 / 25 CC7 steps following the level; 122 bend steps each, mirrored (viola −14.8 c, cello +14.8 c at the peak = 3 beats per
second on F3); **the beat rate from the decoded bends within 0.002 beats per second of the module's line** at every 50 ms sample; the
centre at end + 0.4 s on both; the channels registered for the stop reset. The intervals: the upper note's first bend +1.958 c at the
fifth, −1.958 at the fourth, −13.68 at the major third, +15.64 at the minor third (the just offsets through the 0.97–0.99 st
quantization), the keys and the roles from the table (the cello below, the viola above). Save and reload keep the block byte for
byte; a body drag of +2 s moves the zone and its bracket and regenerates it; a right-edge stretch to 8.96 s regenerates the notes to
the new length with the curve stretched (the same peak, the ramp's middle at half); a delete removes the zone and its bracket and
leaves the strike; the strike note never muted; the range checker clean on the saved copy.

**Decided in the build (the whys in §170):** the notes travel as timestamped snippet events, not a per-frame bend poll (D19's
lesson); at unison who bends up and who down follows score order (it cannot matter); the partner by default is the nearest lane
that can pair, ties to the higher lane; "the space bar with the object selected" waits for the panel's own focus (step 4) — SPACE
stays the transport's; the partner lane's mute and solo are not consulted (the zone is on one lane — step 6's group may change
that); `tools/range_check.js` does not read a beating's snippet (its notes are inside the limits by construction; a nit).

**Open, for the composer (his ear):** unison first, then the fifth and the fourth; the two players' loudness match (the remap gives
the viola 127 and the cello 87 for the same level — 1g's measurement, to be heard); a strike on the same slot during a beating (the
shared channel: its CC7 and articulation land on the held note — if it bites, the strings' curve channels of D11 are the way out);
the winds' embouchure range; the ceilings (§4).

## 6 · The panel — `built 2026-09-07 (PLAN 1f step 4; RUNNING_LOG §171) — verified with real DOM events on a copy; his test pending`

> *"a screen, a panel, and I can see the pair represented by some sort of curve … it'll be bipolar … I can slide one over … everything
> should have handles … hit space bar to play that configuration … audition that configuration over different durations"* (§147)

`score/public/beating_panel.js` — a floating, draggable panel (the morph panel's chassis, the strikes drawer's takes and its
space-bar rule) holding a **pattern of up to three pairs, one row each**. Two ways in: **P on a selected beating binds the panel to
that zone** — the row IS the zone's block, every edit regenerates the zone live (debounced 120 ms) and redraws it on the score;
**B** makes a beating and opens the panel bound to it; the **Beating** button with nothing selected opens an **empty pattern that
lives in the panel until Insert** (step 6). ESC closes.

**A row:** the pair (the launching lane · the partner from the lanes that can play the note, step 1's table · the lower note ·
the interval chips) — then three lanes drawn in SVG:
- **the rate area:** the two players' rate curves as mirror images above and below a centre line (beats per second, ± the row's
  scale), the **band between them filled and tinted by zone** (grey flanger below 1, purple beating, red roughness above 15 — the
  gap IS the heard beating); the thin lines are the curves as played (slid), the bold ones the drawn curves with a **handle at every
  point** (drag up / down = the rate, sideways = its place; the ends stay at the ends; ALT-click removes a point; **the rate in
  numbers at the handle while dragging** — "2.35/s heard · 1.8 s"); a **shape** pops in from the menu (flat · ramp out · ramp in ·
  hump · long arc · burst) at the row's *to* rate; **draw** mode adds points by clicking (the trill's curve tool's gesture); the
  **mirror lock** on by default — drag one curve, the other mirrors; **ALT-drag moves a curve alone** (the block then carries two
  explicit curves, `rate.lower / upper`; the lock button relocks — the upper's shape becomes the heard curve again); **the body
  dragged sideways slides the curve in time** (the phase, `slide`; both while locked);
- **the crescendo lane:** the level 0 → 1 — *follows the beating* between low and high by default, or its own curve from the same
  shape menu, its points draggable, drawn by clicking (`levelCurve`);
- **the breath lane** per player: the spans as bars, the **marks as dotted go lines on sliders** — drag one and it becomes a hand mark
  the deal keeps (the nearest dealt mark gives way), click on the lane to add one, ALT-click to drop one; the **ceiling** named at
  the right and drawn as a red frame on any span past it, with a warning in the lane's line; the three modes; **shuffle** = a new
  seed, the hand marks kept.
- The **offset rail** slides a whole pair in time against the others (an unbound pattern's rows; a bound row sits at its zone).

**The pattern:** the **length box** (a typed duration re-samples every row: the curves are over normalised time, the slides and the
hand marks scale, the dealt breaths re-deal; a bound zone stretches with it); **+ pair** (up to three, the free lanes first);
**SPACE** with the panel open plays the pattern — all pairs, at their offsets, timestamped through the score's own event path
(`Composer.playBeatingEvents`, the tick's events) — and stops on SPACE again (the transport gets SPACE back when the panel closes);
**takes** — named, in `bank/panel_snapshots.json` under `beatings` (save · load · delete; a bound zone takes the first row's block);
**insert** waits for step 6.

**Verified on a copy (`zz-ai-beating`, :5301, 2026-09-07; §171), with real DOM events:** B on the last strike → the panel bound
(one row, the handles, 120 band slivers, the readout "max 2.987/s · viola ±14.8 c/99 · cello ±14.8 c/97"); **a hump popped** → the
block's `beat` = three points, the zone regenerated, its peak bend at the note's middle; **the peak handle dragged up 30 px** → the
heard peak 3 → 9.18 per second, the two curves ±4.59 mirrored, the readout ±44.9 c; **the upper curve's body dragged 52 px** → both
slides 0.655 s (locked), the beat 0 at the start, 7.1 at half, 2.0 at the end (the hump pushed right); **ALT-drag on the lower** →
unlocked ("free"), two explicit curves, only the lower's slide changed; **length 12** → the zone 12 s, both notes 12000 ms, the slide
scaled to 1.31 s; **shuffle** → designated, seed 2, one mark each (3.63 / 8.8 s), four notes; **the upper's mark dragged 40 px** → a
hand mark at 4.61 s, the dealt one gone; **shuffle again** → seed 3, the hand mark kept, a second dealt mark; **a take** saved, listed,
loaded (the state restored over a changed block), deleted — his strikes takes untouched, an empty `beatings` bucket left in the
file; **a new pattern** (Beating with nothing selected): bass clarinet + viola on D3, **+ pair** → flute + violin 1 on F#5, **the
second row's offset 1.5 s** → played with fake outputs: 1177 events on four ports, the second pair's note-ons 1.5 s after the
first's, stop silences.

**Decided in the build (§171):** the panel edits the zone's block in place (one truth, no copy); the drawn heard curve `beat`
replaces the row's *from / to / shape* the moment a handle moves (`shape: 'drawn'`); the band is drawn as a sliver per sample (the
zone can change along the way); the step-3 property row is retired — the panel is the editor, the property panel says so; the
"space bar with the object selected" of step 3 is the panel's SPACE.

**Open, for the composer (his test):** the feel of the handles on rails; whether the rate axis should follow the loudest row;
whether a bound panel should also take a whole pattern (step 6 groups it); the colours of the band's zones.

## 7 · The pitch side — `built 2026-09-07 (PLAN 1f step 5; RUNNING_LOG §172) — verified with real DOM events on a copy; his test pending`

> *"the menu of strikes … it appears on the keyboard … assign a pitch to a pair … the chord or sonority is between the three pairs …
> internally, there's Unison, but I also would like to try fourths, fifths"* (§148)

In the panel (§6), above the rows and beside them:
- **The strike menu** — the bank's played chords (`bank/scattered_strikes.json`, the strikes drawer's source) in sequence order,
  numbered as the drawer numbers them (`#23 · 34.22 s · 11 n · D#2–A4`); picking one puts its chord on the keyboard. **A beating born
  on a strike note (B) opens on that strike** — found by the note's id in the bank, else by its strike group's index
  (`grp-strike-23-…`), else by its onset.
- **The keyboard** — the drawer's drawing beside the rows: vertical keys, the C labels, the ensemble's span (C2–C7; `88` for the
  whole piano, ▲▼ counting what is out of view); the chord's notes as dots in their pitch-class colours with their names (a bigger
  dot for a doubling); **the keys the active pair cannot play dimmed** (step 1's table, at the row's interval: at unison both must
  hold the note, at an interval one the lower and the other the upper — for cello + viola at unison 25 of 61 keys are out); the
  rows' pair notes as rings in the row colours at the right (the lower note filled, the upper hollow).
- **Assigning** — click a dot or a key: the note is **armed** (the panel says so; ESC or a second click disarms); click a pair's row:
  the note becomes **the pair's lower note**, the interval places the partner above it, the objects regenerate; or **drag a dot onto a
  row** (the row outlines under the pointer). A note the pair cannot play is refused with the reason. A click on a row with nothing
  armed makes it the active pair (the keyboard dims for it).
- **The relations from a root** — `unison · 1 oct` (every pair on the root: a field on one pitch, the tuba's bloom) · `unison ·
  octaves` (the pitch class a pair per octave) · `thirds` (root · +4 · +7) · `fourths` (+5 · +10) · `fifths` (+7 · +14) · `stack`
  (typed semitones, one per pair); the root typed (`C4` or `60`, ENTER) or, with a relation just chosen, **clicked on the keyboard**;
  **deal** puts every pair's pitch by the relation, **folded by octave into what the pair can play** (the drawer's fold rule, the
  nearest octave to the target, ↑↓ said), the pairs from the bottom up; a pair out of reach is named and left.
- **The interval per row** — the chips of §5 (unison · m3 · M3 · P4 · P5); the just offset in the row's readout and on the upper note.
- **The row's label** — the panel's row header (players, the lower note, the upper note when an interval, the interval) and the
  zone's label (`beatingLabel`) say the same thing; the objects regenerate on any pitch change.

**Verified on a copy (`zz-ai-beating`, :5301, 2026-09-07; §172), with real DOM events:** B on the last strike (the cello's F3 in
strike #23) → the panel bound and the strike menu on **#23** (11 notes, the chord's dots with F3 among them), 25 keys dimmed for
Vc + Va; a dot (E3) clicked → armed, the row clicked → the zone on E3, regenerated (Va:52, Vc:52), the ring; the fifth → Vc:52 +
Va:59 (E3 + B3), the just +1.955 c in the readout and +1.958 in the upper note's first bend, both rings; C7 dimmed (0.22), armed with
the warning, refused on the row ("pair 1 cannot play C7 with its P5"), the pitch unchanged; a new two-pair pattern (BCl + Va, Fl +
Vn1): **fifths from C3** → C3 · G4 ↑ (G3 is below the flute; folded up); **unison · octaves from a clicked C4** (root mode) → C4 · C5;
strike #5 picked, **B6 dragged from the chord onto the second pair** → its pitch 95, the row outlined during the drag, the ghost
gone, a plain click still arms.

**Decided in the build (§172):** the keyboard is a copy of the drawer's drawing, not a call into the drawer (its drawing is bound to
its own DOM and voices); the drag is the panel's own mouse drag (an SVG dot cannot use the browser's drag), the row found by its own
mouseover as well as by hit-testing; the fold picks the nearest playable octave of the target, not the first that fits.

**Open, for the composer (his test):** whether the relations should also take the strike's own bass as the root; a doubling
between pairs (two pairs on one note) — allowed, nothing stops it; the pitch-class colours against the row colours.

## 8 · The breaths (§152) — the model built at step 2 (§4 above); the lane, the sliders and the warning at step 4

> *"there'll be single events … longer events … bring in the indicator from the tuba piece … the dotted go line … on sliders … a
> warning … maximum breath length or bow length … continuous … or designate when the bows should change … an opportunity for the
> shuffle"* (§152)

## 9 · Insertion — `built 2026-09-07 (PLAN 1f step 6; RUNNING_LOG §173) — verified on a copy; his test pending`

> *"keep the beating out of the strike chain so unlike the trills … we'll just add accents manually, but it doesn't have to do things
> like avoid overlaps and gray out notes … it'll just be its own thing"* (§160)

**insert @ playhead** in the panel puts the pattern into the score as **one gesture**: a `beating` zone per row on its launching
lane at the insert time plus the row's offset (its partner lane carried), all under **one new group** (`grp-beating-<t×10>-<n>`)
with a **META shape** on the META layer whose contour is **the crescendo's mean across the pattern** (`renderPattern`'s 33-point
contour, 0 → 1 as the window's 0 → 10) and whose span is the pattern's. The shape is the handle: **a drag moves the whole pattern**
(the single-shape path and §144's multi-selection path both carry zones now), **the box stretches it** (every beating's length by
the same factor, each regenerated on mouseup — the curves over the new length, the breaths re-dealt past the ceilings), **DELETE
removes all of it** (the beatings, their partner brackets, the shape). One undo step. The panel stays bound to the pattern after
the insert (`select + P` on any of its beatings opens the whole group, a row each with their offsets, edits live).

- **The starting point** (kept as a convenience): with a strike note selected when the panel opens new, its pitch goes to the first
  row and **its onset is the insert time** — the button says `insert @ 175.64 s`; nothing is stored linking the two
  (`launchedFrom` is cleared on the inserted beatings).
- **Re-insert:** the same panel inserting again **at the same time (within 100 ms) replaces its earlier insert** — the earlier
  group's objects removed, the new ones placed; a panel bound to a group replaces that group in place (its own time, wherever the
  playhead is) — so a row added or removed takes effect; **an insert at another time makes a second group**, the earlier kept
  (the strikes drawer's rule, §113).
- **Nothing else touched:** no `mutedBy`, no eating, no greying, no overlap avoidance; the score's ordinary conflict marks apply to
  its notes as to any other; the accents are his to add by hand.

**Verified on a copy (`zz-ai-beating`, :5301, 2026-09-07; §173):** the last strike note selected → Beating → three pairs (Vc + Va
on F3 · Fl + Vn1 on F#5 · BCl + Va on D3, offsets 0 · 1 · 2 s) → **insert** → 4 objects added at 175.636 s (the note's onset): three
beatings on their lanes with their brackets, the shape on META (33 nodes, 0.3 at the ends, 0.77 in the middle), the shape
selected, the panel bound to the pattern, the strike note untouched, no `mutedBy` anywhere; **the shape dragged 2 s** (through the
real handler) → every beating moved the same (1.964 s on the 50 ms grid), the lengths and the offsets kept, the brackets with them;
**the box stretched × 1.5** → the span and every beating's length × 1.5, all regenerated, the cello's 9 s bow re-dealt into 2 + 7 s
(past its 8.5 s ceiling), the viola's single bow under its 10.2; **re-insert** from the bound panel → the earlier group removed and
a new one placed at its own time (177.6 s), the object count holding; **an insert at 100 s** → a second group, the first kept;
**the first group's shape deleted** → its 4 objects and its brackets gone, everything else intact, the second group kept; **save
and reload** → the second group whole (3 beatings with their blocks, the shape), regenerated; `tools/range_check.js` clean.

**Decided in the build (§173):** the group id carries the insert time as the drawer's does; the zones ride the existing group
machinery (the three drag / stretch paths learned the zone's own time fields — nothing new on the zones); a re-insert replaces
only at the same time — a pattern may recur (CN-28); the panel binds to the pattern it inserts, so the next edit is live.

**Open, for the composer (his test):** whether the shape's contour should show the beating instead of the crescendo; the shape's
colour among the strikes' shapes on META; a pattern of one pair inserted from a bound lone beating (it stays a lone zone — B makes
those; insert makes groups).

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
- **2026-09-07 — step 2 built:** the beating math (§4): the conversion, the heard beating from the two players' cents, the shapes,
  the mirror and the slide, the three breath modes and the seeded deal with the ceiling table, the re-key, the notes with their bend
  and level breakpoints, the pattern and its contour, the stretch, the flags; 77 checks in node. Nothing heard.
- **2026-09-07 — step 3 built:** the beating object (§5): B on a strike note, the zone on two lanes, the snippet with per-event
  routing and `_bend` events, the tick's bend and centre, the P row, ▶ hear; verified on a copy by the decoded MIDI (the beat rate
  within 0.002/s of the math, the just offsets on the upper note, save / reload / drag / stretch / delete). His ear pending.
- **2026-09-07 — step 4 built:** the panel (§6): `beating_panel.js` — rows, the mirrored curves with handles on rails, the band by
  zone, the shapes and draw mode, the mirror lock and the slide, the crescendo and breath lanes, the offset rail, the length box,
  SPACE, takes; P / B / the Beating button; verified with real DOM events on a copy. His test pending.
- **2026-09-07 — step 5 built:** the pitch side (§7): the strike menu from the bank, the keyboard beside the rows with the chord lit
  and the unplayable keys dimmed, arming and dropping a note on a pair, the drag, the relations dealt from a root and folded, a
  launched beating opening on its strike; verified with real DOM events on a copy. His test pending.
- **2026-09-07 — step 6 built:** insertion (§9): insert @ playhead from the panel — the pattern's beatings under one group with a
  META shape (the crescendo's mean), the shape's drag / stretch / delete carrying the beatings, re-insert replacing at the same
  time, a second group elsewhere, select + P loading the group, nothing around it touched; verified on a copy. His test pending.
