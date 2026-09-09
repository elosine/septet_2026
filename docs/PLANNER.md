# PROJECT PLANNER — septet 2026

> **What this is** (the tuba piece's device, kept): the working view of the PIECE as a
> collapsible outline — SECTION → container → gesture → decisions. Raw ideas land in
> `COMPOSITION_NOTES.md` verbatim first and get folded into a tier here. Engineering
> detail stays in `PLAN.md`. Rewritten freely; the sketch pad is the append-only record.

**NOW ►** 2026-09-09 — **THE MORPH'S FADE-IN IS BUILT AS HE DESIGNED IT, AND THE PIANO TAKES CAN BE EDITED. WHAT IS LEFT, AGAIN, IS HIS EAR** (RUNNING_LOG §311–323; D32–D34). **The fade took three wrong builds**, and his own question ended it: *"in the morphs without any fade in … how do you achieve that fade in?"* — measured, the morph already fades with **ONE velocity and a rising CC7** (103 every breath, CC7 76 → 86 → 109), where both of my attack modes moved the velocity BETWEEN breaths, which is heard as a lurch. His look-ahead algorithm — per part take the velocity of the breath in progress at the window's end, and ramp to that part's natural level there — is now `attack.mode: 'fade'`. It was built once in LEVEL space and still did not fade, until §316 measured why on a plain drawn note with no morph in it at all: **the drawn 0–10 scale is anchor velocities 65…127, −39.18 … −29.22 dB — 9.96 dB end to end, and level 0 sends CC7 88.** No ramp built there can start from silence. So the fade lives in CC7, leaves every WRITTEN dynamic untouched (a faded render is byte-identical to the unfaded one but for two stamps), and reaches CC7 **0**. `fade-in-slow` = 60 % · fade · linear. **Playback then moved onto Web MIDI timestamps** in both the panel and the score (§103's fix, which `morph_emit.js` had never received) — which made the CC7 stream frame-proof and, for the first time, MEASURABLE in the harness; §320 is the entry where that same change **hung his rack**, because it queued the whole run trusting a `MIDIOutput.clear()` that **Chrome does not implement**, and the cure is the bound: never more than 250 ms in the driver. **Then the interface around the piano parts he recorded** (§321–323): stacked notes cycle on every lane, a `marks on/off` toggle for the conflict boxes, **`note_card.js`** (voice · pitch · dyn · start · length, every change auditioned and the MIDI channel printed), the grain-drag defects that made a captured note un-draggable, and a **hung-note bug** whose note-offs went to the technique's channel while the note-ons went to a D11 curve channel — and, for the flute, to another port entirely. **He found two himself**: the silent piano voices were the mic positions, not the app. **NOTHING FROM THIS DAY HAS BEEN HEARD BY HIM** — the fade first, then the card on his takes, then the six older listenings.

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
