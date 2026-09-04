# PROJECT PLANNER — septet 2026

> **What this is** (the tuba piece's device, kept): the working view of the PIECE as a
> collapsible outline — SECTION → container → gesture → decisions. Raw ideas land in
> `COMPOSITION_NOTES.md` verbatim first and get folded into a tier here. Engineering
> detail stays in `PLAN.md`. Rewritten freely; the sketch pad is the append-only record.

**NOW ►** 2026-09-03 — phase 0 (setup). 0b done (composer app :5300, sandbox :4800);
0g done (the notation/IR stack here, proven whole — RUNNING_LOG §12); **0i done: a septet
save written by the app extracts to a VALID page** — the S1 conventions are in
`docs/NAMING.md` §2, the two bites (technique vocabulary, META layer) filed under 2a
(RUNNING_LOG §13). **0e DONE:** eight loopMIDI ports, the rack `reaper/septet_rack.rpp` (ten tracks in score
order), every instrument's full preset menu in `sandbox/instruments.js`, and **the rack sounds
on every port from the composer app** (`rack-test`, RUNNING_LOG §35). The first material is
in: `scores/ScatteredStrikes01.json` (577 piano strikes, 73 s). Next: **PLAN 1c** (the
scattered-strike database + reorchestration panel, from that file), 0d (the Xsample
measurements), the rest of 0c (0c.5–0c.8), 0h gate. Still open in the rack: the three
curve copies (A2–A4) per Kontakt track, added when the curve routing is wired (0c.7). **PLAN 1c built:** the strike database (`bank/scattered_strikes.json`, 46 strikes) and **the STRIKES drawer in the composer score** (`Strikes` button; RUNNING_LOG §39; the requirements in `docs/STRIKES_TOOL.md`) — **the composer's morning test is next.** Nothing composed yet; the
opening idea is on the sketch pad (CN-1); piccolo vs bass flute undecided (CN-2).

---

## The piece — outline (v0, from CN-1)

**Duration cap:** 12:00 (the call). **Forces:** fl(picc/bfl) · bcl · pno · vn1 · vn2 · va · vc.

1. **OPENING — the attack** · one ensemble attack, then straight into
2. **CURVE-BASED TREMOLOS** · each entry is a fortepiano (attacked, then continuing in
   tremolo); the tremolo shaped by a curve (open: which parameter the curve drives —
   speed, amplitude, pitch spread, or several)
3. **TREMOLO FUGUE** · the tremolo material treated fugally (staggered entries across the
   seven voices — subject/answer relations to be defined)
4. **→ DENSITY-BUILD SOUND MASS** · the fugue resolves into a density build like the tuba
   piece (its recipes: `CURVE_DATABASE.md` MAXDENSE-1 / BUILD-1 in #4)
5. *(the rest: open)*

## Open musical questions (for the composer, when the sandbox exists)

- What does "curve-based" govern in the tremolos? (the tuba piece's META curves were
  density/level targets — is the tremolo the same idea at the note level?)
- Which instrument carries the initial attack? (piano + Bartók pizz + slap tongue are the
  natural percussive attacks in these libraries; the tuba piece's "surge" was a swell)
- Fugue: real pitch subject, or a textural "subject" (a tremolo shape) — the answer decides
  whether the sandbox needs a pitch-transform tool early.
