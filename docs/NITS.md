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
- ~~FIXED 2026-09-03 (with the strikes drawer, RUNNING_LOG §39): selects and number inputs blur on `change`; SPACE on a focused select toggles play.~~ **Pull-down menus in the composer score trap the spacebar** (composer, 2026-09-03, first
  sound): after a `<select>` is used it keeps focus, so SPACE opens the dropdown instead of
  play/pause. Fix: blur any select on `change` (and on ESC), or a capturing keydown handler
  that blurs the active select before the transport reads SPACE. One line; do it at the next
  pass over `composer.html`, and check the same for the number inputs (Start / End).
- ~~FIXED 2026-09-03 (RUNNING_LOG §39): `initZoneMidi()` runs at the end of `init()`.~~ **After a page reload the composer app is silent until the first Play / audition / CC7
  Reset / record-arm** (composer, 2026-09-03, first sound; console showed `_zoneMidiOutputs`
  empty, `_hwInput` NONE on a freshly reloaded page). `initZoneMidi()` — which populates the
  output map AND binds the keyboard (`bindHwInput`) — is kicked lazily by those actions
  (`tickZoneMidiPlayback`, the CC7 Reset / record-arm handlers). So a reloaded page has a dead
  keyboard and no outputs until one of them fires. Fix: call `initZoneMidi()` once on load
  (or on the first user gesture / focus), so the keyboard and playback are live immediately.
  Workaround meanwhile: click CC7 Reset (or press Play once) after every reload.
- **A stand-in survives a voicing change in the STRIKES drawer** (2026-09-04, seen in the composer's
  screenshot: Bass Cl. `E3*` for an E5 voice, where a fresh stand-in would be E4 — one octave down into
  the slap preset's 34–65). `fitVoice` computes `standIn` only when it is null, so `applyVoicing`'s
  re-fit keeps the stand-in chosen for the voice's earlier pitch (or the variant the composer picked in
  the T panel — indistinguishable after the fact). Noise techniques barely care; fixed-pitch ones (open
  strings) would. Fix at the next drawer pass: recompute on a pitch change unless picked by hand (a
  `standInByHand` flag). Not blocking — the row always shows the key that will sound.
- **Plain-note playback is frame-polled** (`tickCurvePlayback`; 2026-09-05, RUNNING_LOG §102): a note starts on the
  first animation frame after its onset (0–16.7 ms at 60 fps, more under load), note-offs likewise, each note
  independently. Chords: inaudible; the accel runs' tails (gaps under 50 ms): smeared. Fix: schedule plain notes with
  Web MIDI timestamps and a 100 ms lookahead exactly as `tickZoneMidiPlayback` does — a page change, no data change.
  Not blocking composing; do it before the demo is judged, and with the trill object (phase 1), which needs the same.
  **Fixed the same evening (RUNNING_LOG §103):** the tick schedules every note with a timestamp and a 100 ms lookahead;
  stop clears the queue; verified on the piece's runs #28–#31.

- **2026-09-06 — the 0j trims were derived with a tapered K-window (RUNNING_LOG §119):** re-analyzed with the corrected analyzer
  (`bank/balance_rect.json`) the piano's trim comes out +5.3 dB, not the +7 on its fader (its 127 sits 1.7 dB above the violins); the
  remap measures with the trims in force and absorbs it, so nothing is wrong in playback. Re-trim only if the strikes' balance
  (set by ear) is revisited; the strikes' K readings in `bank/balance.json` carry the same taper error for transient-rich samples.

- **2026-09-06 — the Spitfire plucked piano is silent at every key** (the ranges probe, §122): the Piano port's channel 2 produced
  nothing from A0 to C8 — not loaded, or not routed, in the rack. Nothing in the piece uses it; check when it is wanted.
- **2026-09-06 — 16 strike notes in the piece sit above their technique's measured top** and play silent (the list in §122;
  `node tools/range_check.js scores/<score>.json` reprints it): the composer's to fold down or re-pick in the drawer, which folds against
  the measured ranges from now on. Two bass clarinet trills are written above its top and fold at playback; their labels show the
  written pitch.
- **2026-09-06 — the staccato family's rings are capped** at the ranges probe's 1.15 s window on many keys (the bass clarinet's
  staccato, the strings' staccato / spiccato / marcato staccato, the piano's harmonics): the bank's length is a lower bound there.
  A longer-slot probe of those alone if the IR ever needs the exact tail.
- **2026-09-06 — the drawer's level ramp (PLAN 1h) sends the remapped velocity without the per-note CC7 trim** the trill engine adds
  on the deterministic samplers (§119): on a ramped strike run the flute and the piano may sit up to one layer step loud. Add the trim
  when the drawer's play path gets per-note CC7 (its notes are one-shots at fixed velocities today).
- **2026-09-06 — the compiler's own accel (`compiler.js` `spec.accel`, the tuba's clouds) keeps its copy of the law** the calculator
  now carries (`accel_calc.js`; the `raw` route reproduces it with `curveZero: −0.4`): route it through the module when the clouds are
  next touched, so one law lives in one place.
- **The beating drawer's zoom is too sensitive and does not centre on the mouse as expected** (composer, 2026-09-07 night, "zoom
  scroll too sensitive; and zoom center point should be at mouse, I now have to zoom and scroll" — saved as feature requests at his
  word, RUNNING_LOG §189). The zoom steps by the score's 1.18 / 0.85 per wheel event, which a fine-stepping wheel or a trackpad fires
  many times per notch; `zoomBy` keeps the second under the mouse in place but clamps the window's start at 0, so near the start the
  view cannot centre. To do: scale the factor by the wheel's delta (one notch = one step), and let the window start before 0 when the
  mouse asks for it.
- **A zoom for the sequence strip** (composer, 2026-09-07 night, "zoom func for sequence") — the strip has its own fixed span (the
  timeline box); it should zoom and scroll like the lanes, ideally sharing their window. Saved, not built.
