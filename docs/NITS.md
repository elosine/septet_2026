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
