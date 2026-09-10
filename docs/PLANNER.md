# PROJECT PLANNER — septet 2026

> **What this is** (the tuba piece's device, kept): the working view of the PIECE as a
> collapsible outline — SECTION → container → gesture → decisions. Raw ideas land in
> `COMPOSITION_NOTES.md` verbatim first and get folded into a tier here. Engineering
> detail stays in `PLAN.md`. Rewritten freely; the sketch pad is the append-only record.

**NOW ✦** 2026-09-10 (session 8) — **THE TOOLS WERE THE WORK, AND HE NAMED THE PROBLEM** (RUNNING_LOG §352–375). He stopped the one-fault-at-a-time loop: *"these tools are failing me and just getting in the way ... I need to find a way to move forward."* **`docs/SWEEP_LIST.md` is open** — a fault met while composing is LOGGED, not fixed; the sweep batches them later. Nine entries, most closed the same day. **Built and pushed, all unheard by him:** duplicate a note (CTRL+drag, and a button in the note card) · `crescStrikes()` with `.set({tech,dyn,ms})`, `.clear()`, `.adopt()` — a piano strike at the end of every crescendo · **the PASSAGE COLLECTION** (`bank/passages/`, capture a range or the whole score, insert at the playhead in any score; round-trip proved field-by-field on 1029 objects) — **he has captured two.** **THE PIANO BALANCE, measured at last** (§357–375): plucked / harmonics / muted had NEVER been probed and rode a +7 dB trim measured on the Steinway alone. Now split onto their own Reaper tracks with their own faders. **THE DAY'S SHARPEST FINDING IS HIS:** the probe sent **CC7 127** before every note — MIDI volume — which wiped every plugin trim he set, and the app sends CC7 too, so **a plugin volume knob is the wrong place for a per-voice trim in this system.** Three AI explanations were wrong before he found it. **Left on the rack:** `PianoPlucked Kontakt` fader −7.8 → **−1.2** (it double-applies the old track's +7), and confirm track 7's Kontakt no longer holds Plucked Piano. **The delivery rules that came out of the day:** never hand him a paste · never verify by assigning the property under test · say which layer changed (page reload vs server restart) · match a process to its PORT not its command line · when a change vanishes, ask what wrote over it.

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
