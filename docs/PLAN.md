# PLAN — septet 2026

> **Rules:** IDs are stable — never renumber, only append. Status: `todo` / `doing` /
> `done` / `deferred` / `dropped`. Position = order. Every item keeps a one-line ***why***.
> Same conventions as pieces #3 and #4.

## The piece in one line

Flute (picc/bass fl) · bass clarinet · piano · 2 vn · va · vc, ≤ 12 min, for TEMPUS LAB
2026 (deadline 2026-10-15). Animated score, the tuba piece's format; a PDF + video for the
submission; parts + performance score only if selected (concerts 26–28 Nov 2026).

## The timeline that binds everything

| | |
|---|---|
| 2026-09-03 | project opened, kit installed (0a) |
| ~2026-09-10 | **0 closed:** first sound from every instrument through the score app |
| 2026-09-10 → 10-05 | **1 compose** (notation work interleaved from the first real page) |
| ~2026-10-05 → 10-13 | **2b presentation score:** print PDF (A3) + video |
| 2026-10-15 | **4 submission** (deadline 23:59 CET) |
| early Nov | selection announced; if selected → **2a/2c parts** + **3 performance score** by ~10-29 |

---

## 0. Setup — `doing`

- **0a — PM kit** — `done 2026-09-03` — journal · plan · planner · RUNNING_LOG (lab
  journal) · COMPOSITION_NOTES (sketch pad) · AI_METHODOLOGY + SESSION_HYGIENE (from #4) ·
  HOW_WE_WORK + SESSION_PROTOCOL (from #3) · checkpoint/postclear commands · .gitignore.
  *Why:* the session skills are wired to it; decisions survive clears from minute one.

- **0b — Composer module port** — `done 2026-09-03` *(RUNNING_LOG §9: copy byte-exact →
  patch script with asserted match counts → verified in the running app: 36/36 routes,
  save/version/load round trip, zero console errors, four panels open, UI save on disk;
  two defects found only by running: the literal eleven-lane table, the server dying on a
  missing-file stream. Web MIDI port check deferred to 0e — the in-app browser denies MIDI.)*
  — **the safe port that preserves all functionality.**
  *Why:* the composer will use "very similar structures" to the tuba piece; the app is the
  composing surface from day one.
  - **0b.1 — Copy the folder set from #4** (byte-exact, then adapt): `score/` (server.js,
    snapshots.js, palette.json, public/*) · `sandbox/` (serve.js, index.html,
    instruments.js, motives/ empty) · `tools/model_bank.js` · `bank/` **model and preset
    files only** (morph_models/params/recipes, shape_presets, texture_models/params,
    pulse_palette, panel_snapshots, sample_lengths) · `probes/` senders + `cc7_map.json` ·
    `docs/instrument_map.json` skeleton · `start_score_server.bat`. **NOT copied:** the
    tuba material banks (CLOUD02*, CLUST01*, VERT01*, DB3*, GESTURE*, cluster_bank,
    blast_taxonomy, actuals) — piece data.
  - **0b.2 — Re-palette:** `TRACKS` = 7 instrument-keyed tracks (`flute`, `bass_clarinet`,
    `piano`, `violin1`, `violin2`, `viola`, `cello`; top→bottom score order), `META_LAYER = 7`,
    lane HTML + the track `<select>`, title/session name, ports 5300/4800, the two
    `INSTRUMENTS.tuba1` lookups → the selected track's instrument, the one
    `'tuba' + (10 - k)` port spot → recipe lookup, `layoutVersion` bumped with its migration
    for 7 + META. **Per-track pitch axis** from each instrument's range (piano 21–108;
    piccolo to 108; bass flute down to 48; bass clarinet to 34; strings by instrument).
  - **0b.3 — Bank skeletons:** empty-but-valid `cluster_bank.json`, `blast_taxonomy.json`,
    `bank/actuals/`, `bank/texture_actuals/` so every route answers and every panel opens.
  - **0b.4 — Verify in the running app** (AI_METHODOLOGY rule 4): server up on 5300 ·
    every panel opens without console errors · save → version → load → discard round trip ·
    Web MIDI lists the 7 ports · a note from each track reaches its port (0e first).
  - **0b.5 — Sandbox up** on 4800 with the empty motive library; thru path per #4 P6.
  - **0b.6 — Grep audit** for stragglers: `tuba`, `10 -`, `=== 10`, `7tubas`, `5200`, `4700`.

- **0c — Instrument recipes (`sandbox/instruments.js`)** — `todo` — one entry per track:
  techniques with `{channel, port?, cc0?, ks?, range}`, per-library mechanism.
  *Why:* the recipes ARE how the AI and the app produce the right MIDI for each sound.
  - **0c.1 — Flute track (D6 doubling model):** SI2 flute in C (one UVI part per PRESET: 19 presets, 30 technique keys, nine of the presets
    keyswitched — RUNNING_LOG §20) is
    the track's instrument now. **Piccolo vs bass flute: composer undecided** ("we'll just
    make those adjustments if the time comes") — the switch technique and its library are
    added when chosen; the track model already allows it.
  - **0c.2 — Bass clarinet:** Xsample, from #3's `sandbox/instruments.js` (`mechanism: "cc0"`,
    13 starter presets) + `XSAMPLE_BASSCL_map.md`. Copy, don't re-research.
  - **0c.3 — Piano:** 8Dio Steinway (main, velocity + CC64) + IRCAM Prepared Piano 2
    (harmonics CC21, muted) from #2's `instrument_map.json` (`Piano1` ch 1–5). One track,
    preparations as techniques.
  - **0c.4 — Strings ×4: Xsample Contemporary Solo Strings (D7).** `mechanism: "cc0"` as
    the bass clarinet; seed the technique list from #1's `cc_mapping_registry.json` (CC0
    89 senza vib · 95 pizz · 71 pizz open · 97 Bartók · molto vib · behind the bridge, with
    their one-shot/persistent state rules) + the gliss keyswitches (B0 / G#1 / A1) + CC68/24
    legato. One port per instrument; **channels by event class (D11): main 1 · curve
    2 / 3 / 4**, the same CC0 set loaded in every slot.
  - **0c.5 — Transposition + clef metadata per instrument** recorded now (bass clarinet
    written a major 9th up; piccolo 8vb; bass flute 8va; alto clef for viola) — unused
    until phase 2, free to record, expensive to rediscover.
  - **0c.6 — One-shot sounding lengths (D9; NAMING.md §2.7):** rows in
    `bank/sample_lengths.json[technique][midi]` for every septet one-shot technique (pizz,
    Bartók, slap, key click, staccato, …), measured as piece #4 measured the tubas; the
    app's `techLength` and the extractor read the same table. Until then the extractor uses
    the drawn length and warns (0i, run D: six warnings on ten notes).
  - **0c.7 — The channel map and the router (D11):** every Kontakt instrument gets
    `channels: { main: 1, curve: [2, 3, 4] }`; `sonify_core`'s route picks `main` for
    `sonifyMode 'plain'` / `'ks'` and the next curve channel, round-robin per instrument, for
    curve mode; the prelude on a curve channel writes CC0 + the start value of every
    controller the event uses (CC7; CC1; CC4 + channel pressure); the stop-sweep already
    visits every channel in the map; the keyswitch comes from the technique (`tech.ks`) when the
    object carries no `ksNote` (the flute's KS presets). Flute: decide curve copies of `ord`
    (and which others) in the thirteen free Fluteb slots vs the tuba law. Fix the
    `oneShot` comment (NITS: the sampler does not revert; the notation rule did).

- **0d — Xsample dynamics nailed: CC7 and CC state** — `todo` *(repurposed 2026-09-03:
  the library compare was decided by the composer → D7; what remains is his one named
  risk: "we just need to get the CC7 nailed down")*. Bounded, measured, not a survey:
  - **0d.1 — CC7 → dB curve** on one Xsample string preset and the bass clarinet, with
    #4's `probes/cc7_calibration_probe.ps1` (port/channel are parameters; 33 steps,
    retriggered note per step). #3 never measured CC7 on Xsample — only the CC1 crossfade.
  - **0d.2 — State rule verified by ear + probe:** does CC7 persist as channel state
    (the quartet's finding: a crescendo ending at CC7=127 left the channel loud; CC120/123
    did not reset it)? Recipe rule regardless of the answer: **every event's prelude writes
    its own CC7 — never rely on a reset.** Channel banks are in from the start (D11): the
    main channel's CC7 is never moved; the rule binds the curve channels.
  - **0d.3 — Which lane does what:** CC1 = timbre-dynamics on MW presets (#3's standing
    recipe: sustained dynamics = CC1 curves), CC7 = level; how the app's level lane maps to
    each. Written as `docs/XSAMPLE_DYNAMICS_RECIPE.md`, one page, with the numbers.
  - **0d.4 — The Xsample controller probes, none measured before:** **CC4 vs channel
    pressure** for vibrato width (a held note, one controller at a time — the quartet sent
    both and never learned which one Xsample obeys) · the CC1 crossfade's settle time before
    a note-on · CC0 switch latency (a note right after a preset change). Each on one string
    preset and the bass clarinet; numbers into the recipe doc.
  *Why:* the composer's own risk statement; D11 keeps the banks by design, and 0d decides
  what the preludes must write and how early; the recipes (0c) inherit whatever 0d finds.

- **0e — loopMIDI + Reaper rack** — `doing 2026-09-03` *(composer at the machine, AI walks
  the R-steps as in #3; RUNNING_LOG §15–17)* — **the layout (D10 order, D11 banks):** eight
  loopMIDI ports, case-exact — `Flute` · `Fluteb` (the SI2 flute's 28 techniques, 16 + 12,
  the tuba pattern) · `BassCl` (exists from #3, reused) · `Piano` (one port, two tracks:
  8Dio in Kontakt on ch 1, IRCAM PP2 in UVI with parts on ch 3 / ch 5 — #2's proven layout)
  · `Vn1` `Vn2` `Va` `Vc`; ten Reaper tracks in score order — Flute SI2 · Fluteb SI2 ·
  Bass Clarinet XS · Piano 8Dio · Piano PP2 · Vn1 XS · Vn2 XS · Va XS · Vc XS · REC; every
  Kontakt track holds its Xsample instrument in **four slots on ch 1–4** (main, curve
  A/B/C); every track: input = its port, Source channel All, no map-to-channel, **input
  monitoring ON** (Principle 1); Reaper never owns the Keystation (hardware inputs disabled,
  auto-enable off); `reaper/septet_rack.rpp` committed, Media/Backups/AutoSaves ignored.
  **R-steps** (one at a time, the composer at Reaper, the AI verifying what it can):
  R1 loopMIDI: add `Flute` `Fluteb` `Piano` `Vn1` `Vn2` `Va` `Vc` — AI verifies via winmm
  `done 2026-09-03` (8/8 exact, out + in; 41 MIDI outs on the machine) · R2 new project → `reaper/septet_rack.rpp`; MIDI Devices → Reset all → enable the
  eight ports as inputs; hardware inputs disabled; auto-enable off; auto-save prefs
  `done 2026-09-03` (Reaper 7.72; the eight inputs enabled per `reaper.ini`'s masks, the
  UMC1820 input off; the auto-enable option not verifiable from the ini) ·
  R3 Flute SI2 (UVI, the first 16 PRESETS as parts A1–A16 in the browser's order — the
  roster is in `sandbox/instruments.js`, RUNNING_LOG §20; keyswitch notes verified on the red
  keys) `todo` · R4 Fluteb SI2 (the last three presets: Staccato, Trills KS, Whistle Tones; 13 slots free)
  `todo` · R5 Bass Clarinet XS (Kontakt 8, four slots ch 1–4; #3's configured track can be
  imported) `todo` · R6 Piano 8Dio (Kontakt, ch 1) `todo` · R7 Piano PP2 (UVI, harmonics A3,
  muted A5) `todo` · R8–R11 Vn1 / Vn2 / Va / Vc XS (Kontakt 8, four slots each) `todo` · R12
  REC (audio, record output stereo, receive from the track under test) `todo` · R13 save +
  commit; on the composer's Chrome the app's Web MIDI list shows the eight ports `todo`.
  *Why:* it is the whole audition path; #3 lost a session to monitoring being off.

- **0f — The AI's MIDI generation path** — `todo` — three routes, all inherited, wired to
  the septet recipes: (i) **live** — app objects → `compiler.js`/`sonify_core.js` → Web MIDI
  → loopMIDI, recipe resolution `tech.port || inst.port`, channel, CC0 prelude, keyswitch
  notes; (ii) **offline** — `tools/midi_out.js` SMF writer → Reaper import (timing
  separated from the browser scheduler); (iii) **probes** — `probes/*.ps1` winmm sender
  for calibration batteries. Per-library CC lanes catalogued: CC1 (Xsample MW dynamics),
  CC7 (UVI level; #4 measured the CC7→dB curve), CC64/CC21 (piano), bend range per
  library (#4 measured 1.99 st on SI2; Xsample editable to ±1 oct). *Why:* "setting up AI
  ability to generate the proper MIDI signals, control channels, etc. to manage these
  instruments" — the composer's stated third pillar.

- **0g — Notation/IR infrastructure carried over now, adapted later** — `done 2026-09-03` *(RUNNING_LOG §12: 97 files byte-exact, 11 batteries green on staged tuba goldens, exporters run, 22/22 routes live)* — copy
  `notation/{lib,registry,schema,app}` (no `ir/` pages), `tools/{notate_section, notate_block,
  ir_extract*, ir_validate*, export_print, export_video, test_render, test_layout,
  test_animobj, test_coords, prove_unmoved}`, `print/` (build.sh, cover generator, no PDFs),
  `notation/GLYPH_EXTENSION_CONTRACT.md`, `docs/NOTATION_STANDARDS.md` + `IR_SCHEMA_v0.md`
  as reference copies; `package.json` with resvg; fonts policy from #4 (never committed).
  Run the test batteries once to prove the copy is whole. **Adaptation list, for phase 2a
  (recorded so it does not bite):** treble + alto clef glyphs and per-part clef · written
  pitch (transposition) per part · piano grand staff with chord columns, accidental stacks,
  ottava (rules in #2's `CHORD_SPACING_RULES.md`, `dimensions_table.json`) · instrument
  change marks for the flute doubling · string/wind technique marks · A3 format entry ·
  rehearsal marks as IR data · parts = `frameParts` subset + own pagination + cues.
  *Why:* "of course all the IR and whatever infrastructure we need" — copying costs
  nothing now; adapting waits for real material.
  **Found by RUNNING the copy (0g), added to the 2a list so it does not bite:**
  `notation/lib/classify.js` maps `layer === 10` → META shape (the tuba META layer; ours
  is 7 — 0i meets this first; the fix is D9 §5's one fixed layer convention) · the
  notation app's parts list is T1–T10 and its built-in IR ids are the tuba pages (it shows
  "IR fetch 404" until a septet page exists) · `export_print.js` + `print/score/build.sh`
  assume Tabloid 17×11, ten lanes, `IR=db1`, `OUT=BCB-score-DRAFT.pdf`, section marks from
  `ACT-` markers (→ A3 landscape, seven lanes, septet names) · `print/cover/make_cover.ps1`
  carries the tuba title/subtitle, Letter/Tabloid sizes and an `$OUT` path into #4's
  scratchpad · `export_midi.js` writes ports in the fixed T1..T10(b) order (→ the 0e port
  list, at 0f) · `playability.js` / `test_playability.js` read the tuba doc
  `docs/SI2_staccato_lengths.md` (→ the septet's sample-length tables, 0c/0d) ·
  `test_midiplayer` / `test_sonify_core` / `test_extract_played` need a septet score,
  recipes and their own snapshot · every `tools/fixtures/*_snapshot.json` is a hash of tuba
  pages — regenerate with `--update` on the first septet pages. **Not carried, by name:**
  `notation/ir/*` (18 tuba pages + manifest; staged for the batteries per
  `notation/ir/README.md`), `notation/app/proof*.svg` + `proofs_v0/`,
  `notation/audio/demo-heldmax.mid`, `notation/video/`, the score-arc and demo tools
  (`extract_section`, `build_versions`, `gen_demo_heldmax_midi`), and
  `docs/NOTATION_ARCHITECTURE.md` (read in #4, cited by path).

- **0h — Gate: phase 0 closed** — `todo` — every track sounds from the score app through
  its own port with the right technique switching; a save round-trips; the sandbox
  captures a motive into the library; 0i's extraction passes; `RUNNING_LOG` has the
  numbers. *Why:* one verified gate instead of seven confidence claims.

- **0i — The S1 data contract for the IR (D9), proved** — `done 2026-09-03` *(RUNNING_LOG §13; the conventions in `docs/NAMING.md` §2; proof saves `scores/0i-test*.json`, page `notation/ir/0i-test-b.ir.json`)* — (a) the septet save
  carries, from the first object: instrument-keyed tracks · a technique key on every
  sounding object · the flute's instrument-in-hand as track data · stable ids · **one
  fixed layer convention** for META shapes vs notes (written into `NAMING.md` here) · the
  sounding-length rule per material · group ids on gestures. (b) **Proof:** a 30-second
  septet test save through `tools/notate_section.js --score <test> --w0 0 --w1 30` and
  `tools/ir_validate.js --against-source`; read what fails and fix the S1 side now; file
  the septet classifier / class-registry work under 2a. *Why:* the composer: *"I want to
  make sure that's understood and that's in there from the beginning."* The IR is derived
  from S1, so S1's shape is the only thing that can bite later.

## 1. Compose — `todo` (starts the moment 0h passes; tools built per need, the #3/#4 MO)

- Sketch pad: `docs/COMPOSITION_NOTES.md` — the opening is already there (ensemble attack →
  curve-based tremolos with fp entries → tremolo fugue → density-build sound mass).
- Tuba engines to pull per need: `compiler.js` swell clouds and grain envelopes (present
  in the port), texture/pulse/multitempo panels (present), density-build recipes
  (`CURVE_DATABASE.md` MAXDENSE-1 / BUILD-1 — data in #4, consult when the mass is built).

## 2. Notate — `deferred` until the first real page exists

- **2a — Engine adaptation** — the 0g list. Start with the page the opening needs.
  **First lines, from 0i (RUNNING_LOG §13):** technique → notation class as registry data
  (`classes.json` + `classify.js` rules — every septet key throws today, by design) ·
  `classify.js` META layer = `tracks.length`, not the literal 10, and `notate_section`'s
  default parts from the score (until then `--parts 0-6`) · part labels from
  `tracks[].short` · the seven-lane container · **score order and bracketing per D10**
  (the composer score's order top to bottom; winds bracket · piano brace · strings bracket).
- **2b — Presentation score** — print PDF (A3 landscape, format entry + cover + performance
  notes page as in #4) + video (`export_video.js`, Reaper render at fixed BPM, sync proof
  as #4's PHASE 5). **Deadline-bound: 2026-10-15.**
- **2c — Parts** — only if selected; due ~2026-10-29.

## 3. Performance score — `deferred` — port #4's modules when they exist there (D2).

## 4. Submission package — `todo` — form (PDF), bio (½ page), work description (optional
  ½ page), fee €25 + payment PDF, score PDF ≤ A3. Field-by-field record in RUNNING_LOG.

---

## Standing mandates (apply to everything)

- **M1 — Re-examine, don't re-implement** (#3 D4): every ported workflow gets the question
  "fewest manual steps between intention and hearing it?"
- **M2 — Engine vs palette seam** (#3 D3): architecture piece-agnostic; this piece's
  instruments/techniques/objects are data. Keep the seam clean; extract nothing yet.
- **M3 — Notation-first identity** (#3 D7): a sound's identity is its performer-facing
  description; MIDI is a rendering. Hacks live in the recipe, never in the identity.
- **M4 — The piece is the goal** (`AI_METHODOLOGY.md`): fix what blocks, file the rest.

## Parking lot

- ~~Electronics eligibility under the call~~ — **no electronics in this piece** (composer
  2026-09-03); `live-electronics-engine` stays attached for its journaling practice only.
- Shared engine package across pieces — after the septet (D1).
- Rehearsal marks as score data; the conductor role — the tuba performance arc (its
  `ARCHITECTURE.md`) will settle these; inherit, don't redo.
- Beating-frequency / demo-recording apparatus from #4 — only if the music asks.
