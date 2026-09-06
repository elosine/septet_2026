# MORPH_NOTES — the central notes for the morph tool (this piece → the eventual revision)

> **Why this file (composer, 2026-09-06, CN-29):** *"I'm going to be using the morph textures a lot in the future for this piece
> and the next piece. I'd like to eventually make it an easier to use all purpose tool. But for now and maybe for the next piece,
> will adjust it for the current use, but I want to institute a process where we're taking notes in a central document that will
> inform the eventual revision."*

**The process (standing, from 2026-09-06; also in CLAUDE.md):** every remark about the morph tool — an awkwardness, a wish, a
piece-specific adjustment made, what an all-purpose tool would need — goes into §3 the moment it is said, dated, his words
verbatim, the AI's reading marked. The tool is adjusted for the current use in the app; this file is the memory for its revision
into an easy all-purpose tool, after this piece or the next. §3 is append-only, like the lab journal; §4 is the digest, rewritten
freely.

## 1 · What exists (2026-09-06)

- The tuba piece's morph engine, carried by the port: `score/public/morph.js` · `morph_emit.js` · `morph_panel.js`; a morph note
  carries `morphBend` (note-relative cents breakpoints), sent as pitch bend by the plain-note tick and centred again on stop.
- Its documentation in #4 (`for_seven_tubas/docs`): `MORPH_FINDINGS.md`, `MORPH_NOTATION.md`; the convergence textures in
  `CURVE_DATABASE.md`. The beating-frequency apparatus of #4 is parked here (PLAN's parking lot: "only if the music asks").
- Not yet adapted to the septet's palette: the pairs (seven unlike instruments, not seven tubas), the pitch-bend range per
  instrument (Xsample: editable in ¼-tone steps; SI2 flute, the pianos: to check), the notation (phase 2a).

- **The dynamics are solved for any curve-driven object (2026-09-06, PLAN 1g, RUNNING_LOG §115–120):** `score/public/velocity_remap.js` gives
  a morph event its loudness in the ensemble's one scale — `velocityFor / cc7For` per note (attacks, trills), `heldNote / cc7ForHeight`
  for a sustained sound (the velocity for the top of its curve, CC7 following the height), measured per instrument and register
  (`bank/velocity_remap.json`). The morph's pitch bend rides on top; its loudness need not be designed again.

## 2 · For this piece — "morph events" (CN-28 · CN-29)

His picture: **single morph events** — e.g. unison → maximum beating, "like in convergence", over a set time — then **longer
ones**; **strikes with morph chords**, "freeze frames or old time slide show" (CN-28): each strike a slide, the morph the dissolve.

**The four elements, his:** (1) **the expansion of pitch to expand beating** — the glissando apart; (2) **the re-breath / re-bow**
("rebreath, so to speak, or rebo[w]") — the re-articulation; (3) **the crescendo**; (4) **the multiple pairs** — each pair with its
own glissando / beating pattern, not all following one curve. *"So those four things, how to arrange them in short events and over
longer events."* Short events: one breath, no re-breath, the pairs' glissando patterns differing. Long events: the same elements
with re-breaths.

**Open, for the requirements talk (PLAN 1f), when reached:** how a morph event is launched from a strike (the strike's chord → the
pairs?) · which pairs (fixed by instrument, or by the chord's voicing) · the per-pair curve (drawn? the curve windows A / B / C, as
the trills read them?) · the crescendo — CC7, velocity, or the samples' own dynamics · the re-breath rule (where, how often, staggered
between pairs?) · the beating measure (Hz from the cents apart, per register) · notation.

## 3 · Log (append-only; his words verbatim, the AI's reading marked)

### 2026-09-06 — CN-29, the note that made this file

> *"A to do note for later when we get to the morph section. I'd like to... I'm going to be using the morph textures a lot in the
> future for this piece and the next piece. I'd like to eventually make it an easier to use all purpose tool. But for now and maybe
> for the next piece, will adjust it for the current use, but I want to institute a process where we're taking notes in a central
> document that will inform the eventual revision. For this one, this piece. I want to create single morph events. Like, for
> example, going from Unison to max beating, beating, like in convergence. over a certain amount of time. And then longer ones. So
> I see the elements as the expansion of pitch to expand beating, the rebreath, so to speak, or rebo. and the Crescendo So a way to
> think about these three things in the short events or also the multiple pairs. So each pair might not be following the same
> glissando or beating glissando. So those four things, how to arrange them in short events and over longer events. I'm imagining
> shorter events. It's no rebreath, just one breath, but ways to work in different patterns of glissando for different pairs. Like I
> said, this is just a note. We'll tackle this in earnest when we get to the section."*
> *(2026-09-06, session 4, mid-session; speech-to-text, content untouched — "rebo" read as "rebow")*

**AI reading (not the composer's words):** two things at once — a process (this file) and the first requirements of the morph
event: four elements (pitch expansion → beating · re-breath / re-bow · crescendo · the pairs' own curves), arranged in short events
(one breath) and long ones (with re-breaths). Nothing built; the talk comes with the section (PLAN 1f).

## 4 · For the eventual revision (the digest — rewritten freely)

- *(seed)* A morph event as ONE object: pairs · a glissando / beating curve per pair · a re-articulation pattern · a dynamic curve ·
  a duration — instead of the tuba piece's per-note bends assembled by hand.
- *(seed)* The all-purpose form: instrument-agnostic pairs, the bend range from the recipe, the curves from the score's curve
  windows, the notation as a rate / beating curve (as the trill's `tr` + span).
