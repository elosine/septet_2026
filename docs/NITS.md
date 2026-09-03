# NITS — deferred small stuff

> Things worth fixing that are **not** blocking the piece (`AI_METHODOLOGY.md` rule 1: fix
> what blocks the work or what will break; record the rest here). One bullet each: what it
> is, what was observed, why it is deferred. Enough context to act on cold. Delete when
> fixed. **Never ask the composer to triage this file.**

- **`score/public/clusterview.html` and `chordview.html` still address `tuba1..tuba10(b)`
  ports and tuba channel numbers** (2026-09-03, PLAN 0b). They are piece #4's cluster-bank
  and chord-bank research viewers; the septet's banks are empty, so they are inert. Re-palette
  through `INSTRUMENTS` the first time a cluster/chord bank exists here.
- **`multitempo.js` `LO = 30, HI = 67`** is the tuba bank's playable range (2026-09-03).
  Per-lane ranges belong there when the MT rig is first used on the septet.
- **`probes/*.ps1` default `$Port = 'tuba1'`** (2026-09-03). Parameters, not logic — set the
  septet port when a probe is run (PLAN 0d starts with `cc7_calibration_probe.ps1`).
- **Copied presets carry "10 tubas" labels** in `bank/texture_params.json`,
  `texture_models.json`, `morph_models.json`, `morph_recipes.json` (2026-09-03). Honest
  provenance; relabel only when a septet preset replaces one.
- **`docs/instrument_map.json` has zero instruments** ("Loaded 0 instruments" on every
  page load) (2026-09-03). The composer app's InstrumentRegistry is piece #2 lineage and is
  not what routes MIDI here (`sandbox/instruments.js` is). Fill or retire at PLAN 0c.
- **Web MIDI cannot be exercised from the in-app browser** ("MIDI access denied"); every
  MIDI-path verification runs on the composer's Chrome at 0e (2026-09-03).
- **Piece #4's own `tools/test_extract_played.js` is RED in the source repo** (2026-09-03,
  PLAN 0g): its snapshot fixture was last written at #4 commit `faea00f` (D1) and the
  section1 pages moved on; the copy here inherits that state. Not ours to fix (never edit
  #4); noted so nobody hunts the drift in this repo's copy. Re-snapshot with `--update` on
  the septet's first pages (PLAN 2a).
- **`tools/notate_section.js` prints "all ten parts" when `parts.length === 10`** (2026-09-03).
  Cosmetic; seven here — change the literal when 2a touches the file.
- **`sandbox/instruments.js` header says `oneShot: true` "marks Xsample presets that revert to
  the base mode after one note"** (2026-09-03, RUNNING_LOG §16). Piece #1's registry says the
  opposite: `one-shot` is the NOTATION rule (revert to base mode explicitly after the note); the
  sampler keeps the CC0 selection until the next CC0. Harmless here because every note's
  prelude writes its own CC0; fix the comment and the flag's meaning at PLAN 0c.
- **`sonify_core` route resolution falls back to `techs[0]` for an unknown technique key,
  silently** (2026-09-03, first sound). With the full rosters in, the 0i test saves' string
  notes (`ord`, `staccato`, `pizz`, `arco`, `bartok`) resolve to preset #1 of the string menu
  (Vibrato Velocity + MW inverted) with no warning. Make the fallback loud (console.warn +
  a visible mark on the object), and re-key or retire `scores/0i-test*.json` at 0c.7. Not
  blocking: fresh notes pick a real key from the menu.
