# NAMING — score files, and the S1 data conventions the IR depends on

> Opened 2026-09-03 at PLAN 0i, the proof of the IR contract (journal D9). Two things live
> here because both are "what a save file is allowed to look like": the file-naming system
> inherited from piece #4 (`for_seven_tubas/docs/NAMING.md`) and **the S1 conventions that
> the extractor reads** — D9 §5's list, each one stated as a rule the composer app already
> follows. Rewritten freely; the reasoning is in RUNNING_LOG §13.

## 1. Score files (`scores/`)

| Pattern | What it is |
|---|---|
| `septet` | the day-one canonical stub — the default session so a cold start opens without a 404 (RUNNING_LOG §10). Not the piece. |
| `piece-<anything>` | **the piece** — any name starting `piece-` lives in the Piece menu (D17: no numbering chain any more; a milestone is a named version, e.g. `piece-septet-v1.5`) |
| `<name>-v<label>` | **a named version** — a frozen copy written by "Name version" beside its base file (`ScatteredStrikes01-v1.5`); never overwritten; committed; listed with its base in the menus |
| `<name>-work` | **the working copy** — every open goes through one; autosave writes here, never the file; gitignored; discarded on Save and on Reload, so one that differs from its file = unsaved edits |
| `cont-<family>-<nnn>` | a single shape / container, if the container way of working returns; families grow as needed |
| `0i-test`, `0i-test-b` | the PLAN 0i proof saves (RUNNING_LOG §13) — test material, kept as evidence; never part of the piece |
| `trill_playing_samples`, `-viola`, `-cello` | the composer's trill captures (2026-09-05, score-lane `Rec` on accent senza vib) — the source of `bank/trill_timing_db.json`; committed, never overwritten |
| `trill-*` | trill tests written by `tools/trill_curve_gen.js` (a curve + his timing under it); `trill0-listen` = the rejected formula file (RUNNING_LOG §99) |
| everything else | research archive — frozen experiment renders; never overwritten |

- **The save system (D17, composer 2026-09-04; RUNNING_LOG §67–68) — one rule for every score,
  piece or experiment:** open a score → you are in its working copy (autosave lives there; the file
  changes only on Save) · **Save / CTRL+S** when it's good · **Name version** when a chunk is done
  (saves the file AND freezes `<name>-v<label>`; the next label is suggested: 1.1, 1.2 … — a name with a suffix, `v1.10-preAccelNear105`, counts as its number, RUNNING_LOG §139; the AI's snapshots carry the current number with a suffix, never a new one) · **Reload**
  if it went wrong (drops the unsaved edits; asks once). The `?` button shows this line in the app.
  Piece #4's "Save as next" / "Variant" / "Restore" are gone; the Save snapshots in `scores/versions/`
  (cap 20, gitignored) remain as a silent net the AI can dig into on request.
- Everything in `scores/` **is committed** except `*-work.json` and `versions/` — autosave
  has eaten a score in every previous piece and git is the only net under it. At session end
  `node tools/unsaved_check.js` lists working copies that hold edits their file does not; the AI
  asks before the commit.
- **`midi/`** — Standard MIDI exports of captures (`tools/score_to_midi.js`: one named track per lane, channel 1, no CC0 /
  CC7), for auditioning articulations in Reaper. **`bank/trill_timing_db.json`** — the trill timing table
  (`tools/trill_ingest.js`), rebuilt from the capture files; committed (RUNNING_LOG §101).

## 2. The S1 conventions the IR reads (D9 §5, proved at 0i)

The extractor (`tools/notate_section.js` → `notation/lib/extract_core.js`, classifier
`notation/lib/classify.js`) reads a save file directly. These are the properties it relies
on; the composer app writes every one of them today. **Change the app and these together,
or not at all.**

1. **Tracks are instrument-keyed.** `tracks[i] = { id, label, short, instKey }`,
   `layoutVersion: 5` (v3 = META alone at 7; v4 = one evening's three META lanes; v5 = META + the curve windows 8–10 — RUNNING_LOG §107). `instKey` names the recipe in `sandbox/instruments.js`. Part
   numbers in the IR are the track indices 0–6 (flute 0 · bass clarinet 1 · piano 2 ·
   violin 1 3 · violin 2 4 · viola 5 · cello 6).
2. **One layer convention, fixed:** sounding objects sit on layers `0 … tracks.length-1`;
   **layers ≥ `tracks.length` are the META side — 7 = META (`META_LAYER`: the gestures' shapes, the stamps), 8 / 9 / 10 =
   the curve windows A / B / C (reference curves: `waveCurve` with `curveName`; their pending dots: `curveDot` — drawing
   state, never sound; TRILLS_TOOL §3b, RUNNING_LOG §107) — and none of them ever carries `sonifyNote`.** The app's own discriminator ("a lane curve without `sonifyNote` is not
   sound") is the rule. *Pipeline note (PLAN 2a):* `classify.js` still says META = layer
   10, the tuba layout; until it derives the META layer from `tracks.length`, run
   `notate_section.js --parts 0-6` — the default `0-9` sweeps layers 7–9 into the parts (and 10 is a curve window too) and
   the classifier throws on the META shape (RUNNING_LOG §13, run C).
3. **Every sounding object carries `sonifyNote` (MIDI) and `technique`.** The technique
   key is the recipe key from `sandbox/instruments.js` — the same string is the IR event's
   `technique`. A lane object without both is not a sound (a hand-drawn shape) and must
   not sit on a sounding layer.
4. **Ids are stable and never reused:** `wc-N` / `mk-N` from the app's `nextId`, which only
   grows. The IR's derived ids are functions of these (`ev-wc-N`, `ch-<part>-wc-N`), so a
   regenerated page re-attaches the composer's authored overlays by id.
5. **Gestures carry `groupId`** on every member note, and the gesture's META shape carries
   the same `groupId` on the META layer — the app's insert-time shape.
6. **Markers live in `objects` as `{ type: 'marker', layer, time, label, … }`.** The
   extractor skips them (`--complete` does not count them); `export_print` reads them for
   section marks — **a section mark is a marker whose label starts with `ACT-`** (piece #4's
   rule, inherited by the exporter).
7. **The real sounding length of a one-shot** comes from `bank/sample_lengths.json`
   `[technique][midi]` (seconds) — the app's `techLength` and the extractor read the same
   table. The copied table is the tuba's (`staccato` / `cuivre` / `fortepiano`, a few
   pitches); **the septet's one-shot techniques (pizz, Bartók, slap, key click, staccato …)
   need their own measured rows — PLAN 0c/0d.** Until then the extractor warns and uses the
   drawn length. **Measured 2026-09-06 (RUNNING_LOG §122):** the septet's one-shots have their rows — pizzicato, tongue_ram,
   staccato (flute), slap, stac_vel, secco, bartok_vel, gettato_vel, marcato_stac_vel, spicc_vel, harmonics — keyed by technique
   (the strings share a key across the four instruments: the mean where their registers overlap); the tuba's rows are gone. A
   technique's true range lives in the recipe's `MEASURED_RANGES` (`rangeLow / rangeHigh` measured, `zoneLow / zoneHigh` the preset's zone).
8. **The flute's instrument in hand (D6)** is not a separate field: piccolo / bass flute
   enter as techniques of the flute track's recipe (their own port/channel/range now; clef
   + transposition metadata at 0c.5), so the technique key on the note says which
   instrument is in hand. Pending CN-2 (which of the two).
9. **A curve-driven object's dynamic is its curve's height — never its velocities (D23, 2026-09-06).** For a trill zone
   (`midiModel: 'trill'`) and every later object whose loudness a curve drives (the morph events, a crescendo on a held note),
   the height of the curve it reads — the trill's `curveRef` resolved as the app resolves it: A / B / C, the lane's own curve, or the
   flat `level` — IS the dynamic: 0 = ppp, 1 = fff, between them the eight marks ppp · pp · p · mp · mf · f · ff · fff at equal
   steps of height (index = round(7 × height); a curve rising two thirds of the way is f). The velocities and CC7 values in
   `midiSnippet` are the playback rendering — 65 → 127 in the ensemble's one scale, remapped per instrument through
   `bank/velocity_remap.json` (RUNNING_LOG §115–119) — and carry no notational meaning. **The extractor writes each such object's
   dynamic range as names**, `dynamicRange: { lo: 'p', hi: 'f' }`, from the curve's lowest and highest points over the object's
   span, beside the sampled curve, so the notation can draw the curve at its true heights or redraw it at full height with the
   range named at its start (NOTATION_WORKFLOW §7). The strikes' notes (`sonifyMode: 'plain'`, `recVel`) keep
   NOTATION_STANDARDS' velocity band: their velocities are as played, the composition's own.
10. **A beating (PLAN 1f, 2026-09-07; `docs/BEATING_TOOL.md`) is a zone with `midiModel: 'beating'`** on the launching player's
    lane, carrying its partner's lane in its `beating` block: `{ partnerLayer, pitch (the pair's LOWER note, MIDI), interval
    ('unison' | 'm3' | 'M3' | 'P4' | 'P5' | 'P8' — the partner above at the JUST interval, its bend carrying the just offset; at most
    an octave apart, RUNNING_LOG §180), **srcPitch** (the note as given — the sonority's or typed; `pitch` is what sounds after the
    pair's fold by octaves as one unit, BEATING_TOOL §12), **fold** (the octaves moved, `pitch − srcPitch` in octaves), **noteIndex**
    (which note of the panel's sonority the pair holds, or null — the take's `harmony` + `voicing` name that sonority), **skip** (true =
    nobody plays it: the snippet has no events and says `skipped`),
    rateFrom, rateTo, shape | beat (the heard-rate curve: breakpoints over normalised time, beats per second — a point may carry a
    third element for the segment after it: `[cx, cy]`, a quadratic Bézier CONTROL POINT in the curve's units (the score's curve
    windows' bend, BEATING_TOOL §14), or a number, the older power slope), adsr { attackS, releaseS } (the hold shape's attack and
    release in SECONDS — the hold absorbs the length), share (how the
    beating is split between the two, 0.5 = mirrored), rate { lower, upper } (two explicit rate curves when the mirror is
    unlocked), levelLo, levelHi | levelCurve (the crescendo, 0 → 1 = ppp → fff: one curve, or `{ lower, upper }` — one per player,
    2026-09-07), breath { mode: 'one' | 'continuous' | 'designated', seed, marks { lower, upper } (hand-placed marks, seconds), deal,
    phase (0 = unison breaths, 0.5 = staggered) }, slide { lower, upper } (seconds), noteIs ('lower' | 'upper': the note given is the
    pair's upper note — the fourth ↔ fifth inversion), launchedFrom (a record of the strike note it was born on — no link) }`. A pair
    may have **no note yet** (`pitch: null`, born empty in the panel): it makes no sound and is skipped at insert. **Its sounding notes are never loose score objects:** they are generated at every play
    start (`BeatingCalc.renderPair` in `score/public/beating_calc.js`) and embedded as the zone's `midiSnippet` — per player one
    sustained note per breath (`notes` events, the partner's with their own `port` / `channel`), each with a bend stream (`_bend`
    events, 14-bit through the recipe's measured `bendRangeSt`) and a level stream (`_cc: 7` through the remap). **The extractor at
    2a reads the block, not the snippet:** the two parts (the zone's layer and `partnerLayer`), the two written pitches (`pitch` and
    `pitch` + the interval's semitones), which player has the upper note (`renderPair(...).players`), the beat rate over the span
    (`.beat`), each player's cents over time (`.samples[].centsL / centsU`), the breaths (`.breaths.lower / upper.spans`) and the
    level (the curve height IS the dynamic, item 9). **A pattern is a group** (item 5): its beatings and a META shape share a
    `groupId` of the form `grp-beating-<t×10>-<n>`, the shape's contour the crescendo's mean across the pattern. **The panel's takes**
    (`bank/panel_snapshots.json`): the `beatings` bucket holds a sequence — `{ length, seqSpan, harmony, voicing, rows: [{ layer, offset,
    length, locked, levelLock, mute, solo, scale, b }] }` — the `beatingPairs` bucket one pair's settings — `{ layer, length, locked,
    levelLock, scale, b }` — and the `beatingShapes` bucket a shape — `{ curve (normalised, its maximum 1, slopes kept), from }` — all
    2026-09-07. The notation form
    (phase 2a): two curves per part — the glissando above, the crescendo below — the two written pitches at least a quarter tone
    apart, a go line at every breath, the beat rate at both ends of the glissando (the tuba's MORPH_NOTATION; BEATING_TOOL §10).

11. **A morph note (the tuba's morph panel on the septet, 2026-09-07; RUNNING_LOG §204)** is an ordinary sounding `waveCurve` —
    `sonifyNote` the played key, `technique` the player's ordinary voice (the recipe key), the level curve in 0–10 — plus `morphBend`
    (note-relative `[[dtSec, cents], …]` against the key; the tick sends it through the instrument's measured `bendRangeSt`) and
    `morphFlags`; a morph is a group `grp-morph-NN` with a marker `MORPH …` on layer 0 and a META contour on `META_LAYER`; the cast
    (which lanes, the pitches folded per pair) lives in the panel's params (`lanes`, `source`) and in an ACTUAL as saved. The
    extractor at 2a reads `morphBend` (the tuba's `tools/notate_morph.js`).
    **The pitch source (RUNNING_LOG §208):** a kept sonority lives in `bank/panel_snapshots.json` under the `morphPitches` bucket —
    `{ state: { notes (MIDI), from, take, k, seed, perPair }, comment }` — and the starters in `bank/morph_pitches.json` (`sets[]`, the
    same fields plus `name`); the panel's own state (the source chosen, the root, the take) is the browser's, never the score's.

## 3. Not S1's business (where the piece-specific work goes)

- **Technique → notation class** is registry data + classifier rules
  (`notation/registry/classes.json`, `classify.js`) — the tuba vocabulary today (`ord`,
  `staccato`, `cuivre`, `fortepiano`, morph). Every septet key (pizz, arco, bartok, flz,
  slap, …) throws "no rule claims object" by design (CL-5, never a silent unknown). That is
  PLAN 2a's first job: a per-instrument technique → class map, data not code.
- **Part labels** in the notation app are still T1–T10; 2a takes them from
  `tracks[].short`.
