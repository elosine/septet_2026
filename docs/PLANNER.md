# PROJECT PLANNER — septet 2026

> **What this is** (the tuba piece's device, kept): the working view of the PIECE as a
> collapsible outline — SECTION → container → gesture → decisions. Raw ideas land in
> `COMPOSITION_NOTES.md` verbatim first and get folded into a tier here. Engineering
> detail stays in `PLAN.md`. Rewritten freely; the sketch pad is the append-only record.

**NOW ►** 2026-09-07 (about 01:00, building PLAN 1f autonomously at his word — *"run the plan independantly … I'll check in after the build"*, RUNNING_LOG §167) — **1f step 1 (the palette) BUILT and its bend probe RUN in his rack** (§167–168; `docs/BEATING_TOOL.md` §3): SI2 ±2.00 st, the Xsample five ±0.96–0.99 st, RPN 0 ignored on all six, the residue real on all six, the pre-arm fine; `beating_calc.js` (the palette part) + its check; the numbers in the recipe as MEASURED_BEND. **1f step 2 (the beating math) BUILT** (§169; BEATING_TOOL §4): `renderPair` / `renderPattern` / `stretch`, the shapes, the mirror and the slide, the breaths dealt inside the ceilings, the re-key, the flags — 77 checks, nothing heard. **1f step 3 (one pair in the score) BUILT** (§170; BEATING_TOOL §5): the `beating` zone on two lanes, B on a strike note, the snippet with `_bend` events through `bendRangeSt`, the tick's centre after the end, the P row, ▶ hear — verified on a copy by the decoded MIDI (the beat rate within 0.002/s of the math, the just offsets at every interval, save / reload / drag / stretch / delete); **his ear pending** (unison, fifth, fourth). **1f step 4 (the panel) BUILT** (§171; BEATING_TOOL §6): `beating_panel.js` — bound to a selected beating by P / B or holding a pattern until Insert; the mirrored curves with handles on rails, the band by zone, shapes and draw, the mirror lock and ALT-drag, the slide, the crescendo and breath lanes (sliders, the ceiling, shuffle), the offset rail, the length box, SPACE, takes — verified with real DOM events on a copy; **his test pending**. **1f step 5 (the pitch side) BUILT** (§172; BEATING_TOOL §7): the strike menu from the bank, the keyboard beside the rows (the chord lit, the unplayable keys dimmed, the pairs' notes ringed), a note armed and clicked or dragged onto a pair, the relations dealt from a root and folded — verified with real DOM events on a copy; **his test pending**. **1f step 6 (insertion) BUILT** (§173; BEATING_TOOL §9): insert @ playhead from the panel — the beatings under one group with a META shape (the crescendo's mean), the shape's drag / stretch / delete carrying them (the three group paths learned zones), re-insert replacing at the same time, a second group elsewhere, select + P loading the group, nothing around it touched — verified on a copy; **his test pending**. **► next: step 7, verify and document** (the end-to-end on a copy, BEATING_TOOL complete, MORPH_NOTES §1 and §4, NAMING §2, the journal's §4 decisions, the help line, PLAN 1f marked built); then his check-in — his listening at 3–7 and the first pattern in the piece placed by him. Earlier — 2026-09-06 (checkpoint, evening) — **section 1 is drafted: the piece to 175.7 s** in `scores/piece-septet.json` = his `v1.23-sec1DraftDone` (48 strikes, 69 trills; from 135.84 s the trills are minor 2nds, CN-32); **this session:** 1g done · 0d done · **1h built** (the acceleration calculator `score/public/accel_calc.js` + the drawer's run dials, the free dealer and the whole-strike pool, the even run; RUNNING_LOG §125–142) · the version suggestion, the All-trills attack batch, the free trill's 0.17 s end, the multi-selection group drag (§139–144); **PLAN 1f opened, evening (RUNNING_LOG §145–151): the object is a *beating* (a pair of players on one pitch, a gap that beats), the beating panel his picture, the axis beats per second, the piano out; the eight-line top line in PLAN 1f, steps 1–6 (the palette · the beating math · one pair in the score, heard · the panel · the pitch side · insertion — the beating out of the strike chain, §160) agreed and written; PLAN 1f planned whole and confirmed ("yes that's it", §166) — eight steps in the fixed format, nothing built; **next: build step 1, the palette (the bend probe — his rack window), and step 2, the beating math, while the probe waits; then 3 → 7 on a copy, his listening at each**, then the build of step 1 — the bend probe in his rack**, the run dials' calibration ladder on his go, phase 5 (the weave) when the trills ask. Phase 0 so far: 0a · 0b · 0d · 0e · 0g · 0i · 0j · 0k.1–0k.4 done; piccolo vs bass flute (CN-2) open.

## The piece — outline (v1 — CN-1 · CN-5 · CN-8 · CN-10)

**Duration cap:** 12:00 (the call). **Forces:** fl(picc/bfl) · bcl · pno · vn1 · vn2 · va · vc.

1. **OPENING — the scattered strikes, expanded** (CN-5 · CN-8 · CN-10) · the piano's 46 recorded strikes
   orchestrated one by one in the drawer (#0–#16 by 2026-09-04 night), then as ensemble processes:
   climbing scales through the ensemble · one accel/decel spread across the players (CN-3's ramps) ·
   antiphonal blocks from sub-ensembles · circular chord cycles as a Risset ladder through the registers
   (CN-7; CN-13: per-player tone rows completed over curves, performer jitter periodic → non-periodic) ·
   **the spreads' expansion** (CN-12): each strike's span wider than the last, anchored at its first impact.
   CN-1's single attack is one strike among them. **Next section @ 27.76 s** (CN-14): one strike re-struck,
   its spacing evened, each re-strike longer (his example ×1.5 from 100 ms), accelerating toward its last
   impulse once long enough to hear — to build at his word (STRIKES_TOOL V, SPREAD). Then straight into
2. **CURVE-BASED TREMOLOS** (the tool: `TRILLS_TOOL.md`, PLAN 1e — spec 2026-09-05) · each entry is a fortepiano (attacked, then continuing in
   tremolo); the tremolo shaped by a curve (open: which parameter the curve drives —
   speed, amplitude, pitch spread, or several); **the tremolo fork** (CN-11): the tremolos become
   their own branch, expanded like the strikes —
3. **TREMOLO FUGUE** · the tremolo material treated fugally (staggered entries across the
   seven voices — subject/answer relations to be defined) → **stretto** → accelerations and
   decelerations, singly or stacked (CN-3 layered) → **vibrato rate** speeding up and slowing down (CN-11)
4. **→ DENSITY-BUILD SOUND MASS** · the fugue resolves into a density build like the tuba
   piece (its recipes: `CURVE_DATABASE.md` MAXDENSE-1 / BUILD-1 in #4)
5. *(the rest: open)*

**CN-28 (2026-09-06) re-forms the middle** — *(AI reading, to confirm with him)*: **section 2 = strikes with morph chords**
("freeze frames / an old-time slide show": morph events launched from strikes, the tuba morph engine — PLAN 1f); **section 3 =
patterned or call-and-response strikes with crescendos** (STRIKES_TOOL V); the tremolos → fugue → mass of v1 after, or
interleaved — his to say.

## Open musical questions (for the composer, when the sandbox exists)

- What does "curve-based" govern in the tremolos? (the tuba piece's META curves were
  density/level targets — is the tremolo the same idea at the note level?)
- Which instrument carries the initial attack? (piano + Bartók pizz + slap tongue are the
  natural percussive attacks in these libraries; the tuba piece's "surge" was a swell)
- CN-10: which partition makes the sub-ensembles (strings / winds + piano · high / low · other)? And
  does the Risset ladder run on the recorded strikes' harmony or on CN-6's chosen harmony?
- Fugue: real pitch subject, or a textural "subject" (a tremolo shape) — the answer decides
  whether the sandbox needs a pitch-transform tool early.
