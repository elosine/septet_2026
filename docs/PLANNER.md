# PROJECT PLANNER — septet 2026

> **What this is** (the tuba piece's device, kept): the working view of the PIECE as a
> collapsible outline — SECTION → container → gesture → decisions. Raw ideas land in
> `COMPOSITION_NOTES.md` verbatim first and get folded into a tier here. Engineering
> detail stays in `PLAN.md`. Rewritten freely; the sketch pad is the append-only record.

**NOW ✦** 2026-09-11 afternoon — **PLAN 2d.4 BUILT: ORPHANS LISTED, NEVER DROPPED** (RUNNING_LOG §394). After R, a page choice whose notes are gone is flagged in its file, and cleared when they come back; a count in the bar ("1 orphan · 1 partial", absent at zero) and **O** open the list; each line offers **go there** and **discard** only. Proven on a copy, the mirror included. **His :5300 still needs one restart** for R, discard and the flags. **Next: 2d.5 "move to part" in the note card, Opus, after a clear.** · *Earlier:* 2026-09-11 midday — **PLAN 2d.1–2d.3 BUILT** (RUNNING_LOG §391–393): a note's id is never re-issued (undo and load fixed; `tools/test_identity.js`) · the choices sidecar — a beam chosen on the page survives every rebuild (`notation/choices/`, IR_SCHEMA_v0 §6b) · **R** refreshes the notation page from the last Save, in place, and the stale notice now sees pitch, voice and new notes. **His :5300 needs one restart for R.** **Next: 2d.4 orphans (⚠), Opus, after a clear.** · *Earlier:* 2026-09-11 night — **PLAN 2d PLANNED: NOTATE WHILE COMPOSING** (RUNNING_LOG §389–390). One file, ever: `piece-septet.json` is the music; the IR is rebuilt from it at one key (R); the notation layer's own ink choices (beams first; clefs, breaks, slurs later) live in a sidecar keyed to note ids, survive every rebuild, and orphan loudly, never silently (the O list). "Move to part" in the note card keeps the id; `moveNote` for the AI; one composer tab per score. His binding goal: *"I don't want to create another layer of work for myself"* — a memory, not a form. **Next: build 2d.1 → 2d.6 on Opus after a clear.** · *Earlier the same evening:* **2a is in front of him**; since the build, B pins/hides the presentation score's bottom bar (Z was already zoom) and the part labels sit centred on their staff's middle line (RUNNING_LOG §387–388). **Next: his verdicts on the page (Fable).** · *Earlier:* **PLAN 2a BUILT: THE NOTATION ENGINE FOR SEVEN PARTS** (RUNNING_LOG §384–386). piece-septet renders in the notation app as seven lanes — treble · treble (B♭ bass clarinet, written +M9) · the piano's grand staff in one taller lane · treble · treble · alto · bass — with the winds and strings bracketed and the piano braced (LilyPond's own glyphs), chords laid out by #2's locked LilyPond rules, every one of the 148 techniques classified (only tongue ram named). 70-check battery GREEN; the tuba suite unchanged. **Next: his eye** (:5300 → /notation/app/notation.html → CTRL+SHIFT+R → "piece-septet · 2a proof"); **before 2b: the resvg panic, trills into the IR, the exporters onto the app's lanes** (NITS 2026-09-11). · *Earlier the same day:* **PHASE 2 OPENED AT HIS WORD: THE NOTATION LAYER** (RUNNING_LOG §379–383; PLAN §2). A faithful, all-inclusive port of #4's presentation score — every notation-app toolbar feature, the video exporter, the PDF exporter — all already in this repo by 0g; the work is adaptation to seven parts. Top line: 1 engine → seven parts (**2a.1–2a.6, written, next, Opus after a clear**) · 2 first page from `piece-septet` · 3 audio · 4 video (V-MAIN + zoom master → V-TOP/V-BOT; V-CUT from his cut list later) · 5 print A3 landscape · 6 authoring. Decided: A3 (Q5) · no flute doubling (CN-62, Q1) · bass clarinet treble clef, B♭ +M9 · the piano one taller lane. The drawer's verdicts (below) wait beside it. · *Before that, 2026-09-10 late:* **THE STRIKES DRAWER IS UNBLOCKED, UNHEARD** (RUNNING_LOG §376–378; STRIKES_TOOL §AG; CN-61). A chord on every onset of his rhythm lives in NOTES mode (double-click a dot, click a harmony); chords mode is labelled `chords (old)`. Built and walked: the `percussive · spiccato · staccato` sets · shape first · transpose ±8va/±½ · the onset card's max / every-onset max / deal / reshuffle / ♪ / rest · **the piano takes the remainder, two hands, the middle dropped, ≥ 100 ms** · Insert = Hear 76 of 76. **Next: his ear after CTRL+SHIFT+R.** · *Earlier the same day:* **THE TOOLS WERE THE WORK, AND HE NAMED THE PROBLEM** (RUNNING_LOG §352–375). He stopped the one-fault-at-a-time loop: *"these tools are failing me and just getting in the way ... I need to find a way to move forward."* **`docs/SWEEP_LIST.md` is open** — a fault met while composing is LOGGED, not fixed; the sweep batches them later. Nine entries, most closed the same day. **Built and pushed, all unheard by him:** duplicate a note (CTRL+drag, and a button in the note card) · `crescStrikes()` with `.set({tech,dyn,ms})`, `.clear()`, `.adopt()` — a piano strike at the end of every crescendo · **the PASSAGE COLLECTION** (`bank/passages/`, capture a range or the whole score, insert at the playhead in any score; round-trip proved field-by-field on 1029 objects) — **he has captured two.** **THE PIANO BALANCE, measured at last** (§357–375): plucked / harmonics / muted had NEVER been probed and rode a +7 dB trim measured on the Steinway alone. Now split onto their own Reaper tracks with their own faders. **THE DAY'S SHARPEST FINDING IS HIS:** the probe sent **CC7 127** before every note — MIDI volume — which wiped every plugin trim he set, and the app sends CC7 too, so **a plugin volume knob is the wrong place for a per-voice trim in this system.** Three AI explanations were wrong before he found it. **Left on the rack:** `PianoPlucked Kontakt` fader −7.8 → **−1.2** (it double-applies the old track's +7), and confirm track 7's Kontakt no longer holds Plucked Piano. **The delivery rules that came out of the day:** never hand him a paste · never verify by assigning the property under test · say which layer changed (page reload vs server restart) · match a process to its PORT not its command line · when a change vanishes, ask what wrote over it.

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
