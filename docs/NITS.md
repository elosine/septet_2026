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
- **SPACE "unreliable" in the sequence — sometimes it plays a pair** (composer, 2026-09-07 night). Most likely the focus rule at work:
  SPACE plays what was last clicked (a row's controls make its pair the focus; the head reads `space → pair N`), so after an edit
  in a row SPACE plays that pair until ▶ sequence or the strip's background is clicked. To decide with him: keep the rule and make
  the head's `space → …` more visible, or make SPACE the sequence unless a row was clicked EMPTY (not a control), or give the
  sequence its own key. Saved at his word.
- **A double-click in a number box should highlight the number** (composer, 2026-09-07 night, "dbl clk in numbers highlights number").
  Chrome selects the number on a double-click by itself; if it does not in the drawer, something in the row is taking the click —
  to look at with him on the next round (a single click could also select all on focus). Saved at his word.
- **The curve's endpoints as the duration, the attack and release attached to them** (composer, 2026-09-07 night — "visual controls for
  the curves still not working … a list of things, behaviors I expect, and then we can work it out later"): forget the vertical edge
  lines; the curve's two ENDPOINTS control the duration; moving the first point carries the attack's end node with it (the attack
  keeps its length), moving the last point carries the release's start node with it (the release keeps its length), the sustain
  absorbs; the nodes inside still move on their own; moving or trimming the zone in the strip does the same as moving the endpoints.
  Saved at his word — the next model change to the lanes, to be agreed in one line before it is built (HOW_WE_WORK). **2026-09-07 late:** the build deferred to the REBUILD SESSION at his word (*"Just keep collecting the
  feature requests. We'll have a a rebuild session later"*, RUNNING_LOG §196); the one-line model was put to him at the resume with
  one open detail for then — an end dragged past an inner node: (a) the node waits dim beyond the cut as in §188, or (b) the end
  pushes it.
- **How the beating units are displayed in the main score** (composer, 2026-09-07 night, "we should revisit the way the beating units
  are displayed in the main score, but it's fine for now"): the zone on the launching lane with the partner's dashed bracket and a
  long label (BEATING_TOOL §5); to be revisited — what a beating should look like among the strikes and trills, on both lanes. Saved.
- **No per-player dynamic in the strikes drawer, and two partial inserts cannot be stacked at one time** (found 2026-09-07 late,
  answering the composer's "is there a way to just insert part of the strike … do I have to do it per instrument or Do I just use the
  d y n times?", RUNNING_LOG §196). `dyn ×` multiplies every voice's played velocity at once; the only per-player lever is solo (S) +
  insert, and an insert replaces an earlier insert of the same strike within 100 ms (§113), so "these two players at p, the rest at f"
  needs two inserts that cannot coexist. A strike note plays at its `recVel` with CC7 127 and its velocity has no editor in the score
  (the drawn height is a picture of it, not a control). For the rebuild session: a dynamic per player row (ppp … fff or a factor), or a
  velocity box on a selected strike note; and let a partial insert ADD to an earlier insert of the same strike at the same time when
  the players differ. The strikes' five velocity bands (≤ 45 ppp · 75 p · 100 mf · 118 f · 127 fff, `notation/registry/container.json`)
  are the tuba's provisional thresholds — re-set for the septet at 2a.
- **The Xsample instruments do not accept All Notes Off / All Sounds Off** (seen 2026-09-07 late in the composer's screenshot of the
  bass clarinet's Instrument Options → Controller: "Accept All Notes Off (#123) and All Sounds Off (#120)" unchecked; RUNNING_LOG §202).
  This is the sampler-side reason CC123 never stopped a trapped note (§176, §178); the app's cure — every long note released
  explicitly, ■ Panic — stands on its own. Ticking the box on the five Xsample instruments (and saving the Reaper project) would give
  Panic a second path at the sampler. His rack, his call; not needed for the piece. **2026-09-07 late, his "Is that something you can do script? because there's too many instances":** no — the Kontakt Lua API's `set_instrument_options` has no such entry (RUNNING_LOG §203), so it is a hand setting per instrument in Instrument Options → Controller; "put it on the to do list".
- **The Xsample instruments' bend range could go to ±2 st in Kontakt, if ever** (composer, 2026-09-07 late, after trying: "It's totally
  opaque to me … not worth my time. unless it's a blocker"; RUNNING_LOG §200–203). Not a blocker: the morph engine splits by the real
  excursion at the measured ±0.96–0.99 st (the quartet's key rule), a whole tone in one key. The gain of ±2 st: up to a major third
  per key, no seam on wide glissandi, no clamp at a note's start. Where: NOT in Instrument Options and NOT in the Lua API (no
  modulators; `set_instrument_options` has no such entry) — either the Xsample panel's `ind. PB` (untested) or the edit view: wrench
  → Group Editor → Edit All Groups → Source → Modulation → Pitch Bend intensity 2.00 st, per instrument, then save the Reaper project;
  after it, the probe is one command (`bash tools/probe_run.sh probes/bend_schedule.json` → `node tools/apply_bend_ranges.js`).
  His hands only (the AI cannot reach the modulators); "put it on the to do list".
- **The piano's `harmonics` technique has no loudness law of its own** (AI, 2026-09-08; RUNNING_LOG §218). PLAN 1g measured the piano on
  `main` (the Steinway), so a harmonic at the ensemble's placed level goes out at velocity 20–40 — inaudible against six strings; the
  piano-harmonics row has a level box with 7 as its default (velocity 109) in the meantime. The cure: a velocity / CC7 sweep of the
  IRCAM harmonics preparation on channel 3 through the bridge (`tools/velocity_remap.js`'s method) into `bank/velocity_remap.json`,
  keyed by technique. His rack; when the piano's part is being balanced.
- **The placed morph notes' level scale — is the score as loud as the panel's audition?** (AI, 2026-09-08; RUNNING_LOG §218). The
  engine writes each morph note's level curve as its 0–1 level values on the score's 0–10 scale (`morph.js toScoreObjects`, y ≤ 0.8 on
  the BLOOM at 183 s); the score's held-note law then plays them near the bottom of the ensemble's scale (velocity 64–80, CC7 108–123
  through the remap) while the panel's audition goes through the emitter's own law. Not heard as a defect by him so far; to check by
  ear (Play in the panel vs Play in the score at 183 s) before the morph section is balanced. If real: scale ×10 at insert (and at
  `--rebuild` for the actuals' objects), or make the held-note law read the morph's scale.

- **The lines' bar covers the first pixels of the piano lane** (AI, 2026-09-08; RUNNING_LOG §232). The strip sits at the lane's left end
  over the content, so a line scrolled under it cannot be clicked there; scroll it a little right. A place in the lane's label column
  (widened) would free the content; for the revision of the tool.

- ~~**THE MORPH'S FADE-IN DOES NOT FADE**~~ **FIXED 2026-09-09 (RUNNING_LOG §313)** — three pieces built: the length as a fraction of
  the span, a ceiling mode, and a held-back curve; the preset `fade-in-slow` is the one to use. *The original entry, kept:* (composer, 2026-09-09; measured, RUNNING_LOG §311; `docs/MORPH_NOTES.md` §3). `shapeGain` is a
  multiplier on ABSOLUTE gesture time and is exactly 1 past `attack.len`, so a fade shorter than one breath (6–10 s on BLOOM) shapes the
  first note only and the second breath enters at full level on a fresh note-on. **Measured: a 3 s fade — the preset's own default — is
  bit-identical to no fade at all; an 8 s fade moves one note's peak from 4.6 to 4.3 and changes nothing else.** `entry: ramp` cancels it
  outright, because the entries are spread across the very window the gain is measured in. Four options are written up in MORPH_NOTES:
  scale it as a fraction of the span · measure it from each voice's own entry · make it a rising CEILING on the dynamics layer rather
  than a multiplier · or just change the preset's number. **His analysis was asked for and given; nothing was changed.**

### `tools/cresc_check.js` asserts a hard-coded count against his live score (2026-09-09, §315)

One assertion reads `scores/piece-septet.json` and requires exactly **18** morph re-breath pairs to be the ones the plain spacing rule
would newly block. That morph is no longer in his score, so the count is 0 of 15 and the check fails — it failed identically before the
fade work, and nothing in the app is wrong. The fixture is the composer's working file, which he edits daily. **Fix when touched:** hold
the gesture clause against a stored fixture, or assert the invariant (every newly-blocked pair is either inside one gesture or a trill
followed by a strike) rather than a count.

### The panel and the score cannot show what they are SENDING (2026-09-09, §314 and §316)

Two bugs in two days were invisible for the same reason: every measurement stopped at the engine's level curve, and both faults were
downstream of it — §314 in the velocities the emitter chose, §316 in the CC7 the score's held-note law produces. **A readout of velocity
and CC7 per note — in the morph panel beside Play, and on a selected drawn note — would have ended each of them on the first day.**
Cheap to build (both numbers already exist at emit time) and it pays for itself the first time a dynamic does not sound right.

### ~~The morph panel's Play never got §103's timestamp fix, and both CC7 streams are still per-frame~~ — **BUILT the same day (§319)**

§103 moved the SCORE's notes onto Web MIDI timestamps with a 100 ms lookahead — the cure for *"still sounds quite jumpy"*. Two gaps are
left, found when a fade could not be verified in the harness:

- **`morph_emit.js` was never converted at all.** Every note-on, note-off, bend pre-arm and CC7 pre-arm in the panel's Play is a
  `setTimeout`. §102's finding was that attacks are what the ear locks onto, and this is the panel where every morph is auditioned.
  **The bigger of the two, and the pattern to copy is proven.**
- **The continuous CC7 stream is per-frame in both places**, by §103's deliberate choice (*"continuous controllers, not attacks"*). A
  fade argues with that choice, because there the stream carries the whole gesture. Measured: pre-scheduling would send the SAME number
  of messages (~1100 on a full BLOOM, unchanged from a 16.7 ms step to a 50 ms one, because CC7 is 7-bit and already deduped), with
  ~7 queued at a time on a 200 ms lookahead. It also makes the stream testable — the Browser pane throttles rAF to nothing while hidden.

Bend stays per frame either way: 14-bit and genuinely dense.

## 2026-09-09 — the harmony banners (STRIKES_TOOL §AA)

- **Two OPEN banners both stick.** Only open banners are sticky now (folded ones scroll away), but with STRIKES and BLASTS both open, both
  headers stick at the top while BLASTS' rows scroll and the later one covers the earlier. Harmless; the beating drawer has the same idiom.
- **The models' sets are absent from the banners until the morph panel has read its models** — the pitch menu's own rule (`this.models`),
  the crescendo bar has the same dependency. Open the morph panel once and reopen the drawer.
- **The Browser pane's "Return" is not ENTER** (RUNNING_LOG §324): it arrives as a keydown with an empty key; "Enter" is the real one. For the
  harness, not the app — noted so the next walk does not chase it again.
