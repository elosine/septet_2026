# PROJECT PLANNER — septet 2026

> **What this is** (the tuba piece's device, kept): the working view of the PIECE as a
> collapsible outline — SECTION → container → gesture → decisions. Raw ideas land in
> `COMPOSITION_NOTES.md` verbatim first and get folded into a tier here. Engineering
> detail stays in `PLAN.md`. Rewritten freely; the sketch pad is the append-only record.

**NOW ►** 2026-09-06 (checkpoint) — **the piece is composed to #33 (103 s)** in `scores/piece-septet.json` with 22 trills, every strike and trill inside its measured range (§123–124); **this session: 1g done** (a curve height = the same loudness on every instrument; the trill's velocity switch; the ordinary voice; the notation rule D23; crescendos) **and 0d done** (the samples' true ranges and lengths — the Bartók tops E6 / E5 / B4); the trill module's phases 0–4, the curve windows, the drawer's fixes all pushed; **1h built** (the acceleration calculator `score/public/accel_calc.js` + the drawer's run dials, §129 — his hands on the run at 107.81 s, CN-30; the calibration of words to numbers on his go) — the composer's hands next, then phase 5 (the weave) and 1f (the morph events, talk first) on his go. Phase 0 so far: 0a · 0b · 0d · 0e · 0g · 0i · 0j · 0k.1–0k.4 done; piccolo vs bass flute (CN-2) open.

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
