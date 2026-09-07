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
  - **0c.8 — The multiphonics walk (flute A9)** — `todo` *(composer, 2026-09-03: "walk a9 … you
    would play through the range while I record and then analyze the file; I want to make a
    correspondence to the key and the approximate pitch content of the multiphonic")* — a
    probe in the `sample_length_probe.ps1` mould plays the thirty keys C3–F5 (display; MIDI
    60–89), each held ~2 s with a gap, on port `Flute` channel 9, while Reaper's REC track
    records; an analyser (per-note spectral peaks → pitches ± cents, plus the sounding length
    for 0c.6) writes `bank/flute_multiphonics.json` (key → pitch content) and
    `docs/FLUTE_MULTIPHONICS_map.md`. **Seed first from the manual:** SI2's own table (#3
    `docs/manuals/extracted/IRCAM_Solo_Instruments_2_manual.txt` lines 3032–3062) already lists
    each key's pitches with quarter-tone marks and the dynamic (mf) — the walk verifies and
    refines it by ear and spectrum. *Why:* a multiphonic is chosen by its sound, and the
    notation (2a) needs the pitch content, not the trigger key.
    `oneShot` comment (NITS: the sampler does not revert; the notation rule did).

- **0d — The samples' true ranges and lengths, per technique in use** — `done 2026-09-06 (RUNNING_LOG §122); 0d.3 / 0d.4 remain as the remainder` *(re-scoped 2026-09-06 at the composer's
  "now the instrument ranges, whats to be done?" · "ok go ahead with the ranges, hands off"; 0d.1's CC7 curves were measured by 1g (§115), 0d.2's
  rule holds by construction — every event writes its own CC7; 0d.3 / 0d.4 stay below as the remainder)*. **Result when done:** for
  every technique the piece uses, the app knows where the sample sounds (its true bottom and top) and how long a one-shot really
  rings; a note outside is folded or flagged in the drawer and the trill panel; the extractor reads the true lengths. The steps:
  1. fix the list: the 14 instrument-and-technique pairs in use, the drawer's strike palette, the trill attack candidates (§99's rows);
  2. build the probe on the balance kit (`balance_schedule.js --ranges`): every semitone of each one-shot in use, every second
     semitone of the rest, across the technique's zone at 127, each note left to ring; the analyzer measures per note whether it
     sounded and how long it rang;
  3. run it through the bridge, about twenty-five minutes, hands off;
  4. analyze: the keys that sounded → the true range (gaps named); the ring → the length per key;
  5. write the ranges into the recipe (a generated block `MEASURED_RANGES` applied at load) and the one-shots' lengths into
     `bank/sample_lengths.json` (NAMING §2.7's rows);
  6. the app: the drawer and the trill panel fold or flag against the true ranges (the attack articulation too), the extractor
     reads the lengths; a list of the notes already in the piece that fall outside their technique's range.
  **All six done 2026-09-06 (§122):** 46 techniques measured, the Bartók tops E6 / E5 / B4, the gettato tops B6 / E6 / E5, the one-shot
  lengths in the bank, the recipe's `MEASURED_RANGES`, `tools/range_check.js` — 16 silent strike notes in the piece named for him.
  *Was:* **0d — Xsample dynamics nailed: CC7 and CC state** — *(repurposed 2026-09-03:
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

- **0e — loopMIDI + Reaper rack** — `done 2026-09-03` *(the rack sounds on every port: `rack-test` played whole, RUNNING_LOG §35; composer at the machine, AI walks
  the R-steps as in #3; RUNNING_LOG §15–17)* — **the layout (D10 order, D11 banks):** eight
  loopMIDI ports, case-exact — `Flute` · `Fluteb` (the SI2 flute's 28 techniques, 16 + 12,
  the tuba pattern) · `BassCl` (exists from #3, reused) · `Piano` (one port, two tracks:
  Kontakt with 8Dio Steinway on ch 1 + Spitfire Plucked Piano on ch 2, IRCAM PP2 in UVI with
  parts on ch 3 / 4 / 5 — #2's layout plus the plucked piano it never had a library for)
  · `Vn1` `Vn2` `Va` `Vc`; ten Reaper tracks in score order — Flute SI2 · Fluteb SI2 ·
  Bass Clarinet XS · Piano Kontakt · Piano PP2 · Vn1 XS · Vn2 XS · Va XS · Vc XS · REC; every
  Kontakt track holds its Xsample instrument in **four slots on ch 1–4** (main, curve
  A/B/C); every track: input = its port, Source channel All, no map-to-channel, **input
  monitoring ON** (Principle 1); **plugin gain checked on every instrument as it is loaded**
  (composer, 2026-09-03: "remind me with each instrument to check the instrument plugin gain" —
  UVI part volume and Kontakt instrument volume at 0 dB / unity, part reverb off, **and any
  built-in dynamics or EQ in a preset bypassed** — PP2 ships with a Maximizer and a Tilt EQ
  (composer, R7) — so every
  track starts from the same baseline and 0d's CC7 law is measured against it; #4's ISSUES I1
  names "UVI part volume knobs" as a quiet-track cause); Reaper never owns the Keystation (hardware inputs disabled,
  auto-enable off); `reaper/septet_rack.rpp` committed, Media/Backups/AutoSaves ignored.
  **R-steps** (one at a time, the composer at Reaper, the AI verifying what it can):
  R1 loopMIDI: add `Flute` `Fluteb` `Piano` `Vn1` `Vn2` `Va` `Vc` — AI verifies via winmm
  `done 2026-09-03` (8/8 exact, out + in; 41 MIDI outs on the machine) · R2 new project → `reaper/septet_rack.rpp`; MIDI Devices → Reset all → enable the
  eight ports as inputs; hardware inputs disabled; auto-enable off; auto-save prefs
  `done 2026-09-03` (Reaper 7.72; the eight inputs enabled per `reaper.ini`'s masks, the
  UMC1820 input off; the auto-enable option not verifiable from the ini) ·
  R3 Flute SI2 (UVI, the first 16 PRESETS as parts A1–A16 in the browser's order — the
  roster is in `sandbox/instruments.js`, RUNNING_LOG §20; keyswitch notes verified on the red
  keys) `done 2026-09-03` (all 16 parts registered from screenshots, §22; track verified from the file, §23) · R4 Fluteb SI2 (the last three presets: Staccato, Trills KS, Whistle Tones; 13 slots free)
  `done 2026-09-03` (§22–23) · R5 Bass Clarinet XS (Kontakt 8, four slots ch 1–4; #3's configured track can be
  imported) `done 2026-09-03` (track verified from the file, §25; the 34-preset roster + keyswitch map, §24) · R6 Piano Kontakt (8Dio 1969 Legacy Piano ch 1 + Spitfire Plucked Piano ch 2) `done 2026-09-03` (§27) · R7 Piano PP2 (UVI, harmonics A3,
  muted A5) `done 2026-09-03` (composer: read the file at the end, not per instrument — the Piano PP2 chain showed a second, live Kontakt beside the UVI at 18:02; re-check at R13) · R8–R11 Vn1 / Vn2 / Va / Vc XS (Kontakt 8, four slots each) `done 2026-09-03` (on the composer's word; rosters §29; file read at R13) · R12
  REC (audio, record output stereo, receive from the track under test) `done 2026-09-03` (§30) · R13 save +
  commit; on the composer's Chrome the app's Web MIDI list shows the eight ports `done 2026-09-03` (the file read in §30; the Chrome port list confirmed by the composer).
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
  **Added from the sketch pad (CN-9, 2026-09-04):** **grace-note figures** — the piccolo–bass
  clarinet looping line (CN-4) uses them; the tuba vocabulary has none. Needs an IR grace group
  attached to a host event (flagged in the save, not guessed from durations) · a render (small
  notes, one slashed beam, left of the host) · the scrolling-score reading (the figure is
  played into the host's onset — the host stays the beat). Notation model: Ferneyhough,
  *Etudes Transcendantales* No. 1, the oboe part — read the attachment, the beam and the
  time-source rule from the score. **Added (CN-11, CN-13, 2026-09-04):** *the row over a curve* — a
  tone row written once, a curve or duration line for its span, a spacing instruction (even → irregular,
  "performer jitter"), a direction; and a *vibrato-rate ramp* (speeding up / slowing down) as a written
  line or text; *feathered beams* for a strike that accelerates within itself (CN-14).

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

- **0j — Ensemble balance: per-track trims from one measured run** — `kit built 2026-09-04,
  awaiting the composer's recording` *(composer: "an easy but data based way to normalize the
  volume between instruments … a 127 flute is same perceived loudness as 127 violin";
  RUNNING_LOG §41–42)* — `tools/balance_schedule.js` (the timetable from the recipe file:
  plain technique × 3 pitches × vel 127 / 64) → `probes/balance_probe.ps1` (plays it into the
  ports while the REC track records) → `probes/analyze_balance.py` (loudest 1 s RMS per note,
  flat + K-weighted; trim = quietest − level at 127) → `bank/balance.json`. The trims live as
  TRACK GAIN in the rack (every playback path, no app code) and as `balanceDb` in
  `sandbox/instruments.js`. *Rejected:* velocity scaling (changes the sample layer), a CC7
  offset (eats the dynamics channel). Re-run whenever a library or preset changes.
- **0k — The Reaper bridge, the sampler setups as code, and B applied** — `doing 2026-09-04`
  *(composer: "what capabilities does ai have and what are the mechanisms … comprehensive
  survey … best, fast and reliable and most functions" → `docs/REAPER_CONTROL.md`; RUNNING_LOG
  §48–51; "just slot it in to the plan")* — **the running order** (► = active):
  1. ☑ **0k.1 the bridge** (proven 2026-09-04, RUNNING_LOG §53: 31 ms round trip) — `reaper/bridge/bridge.lua` (defer loop, inbox → pcall → outbox
     JSON, heartbeat) + `tools/reaper_job.js`; the AI appends the startup line to
     `%APPDATA%\REAPER\Scripts\__startup.lua`; the composer starts it once now (Actions →
     ReaScript: Load…); proof = the `tracks` job lists the rack.
  2. ☑ **0k.2 the Kontakt proof** (all three proven 2026-09-04, RUNNING_LOG §55–56) (Piano Kontakt): `reaper/kontakt/proof_readback.lua` (every
     slot's name / channel / output / volume → a file) · a write (Plucked −6 dB, read back,
     restored) · a load (a second Plucked into a free slot on [A] 5, output 2, read back,
     removed). Composer: Options → Developer once; drag the script onto the rack.
  3. ☑ **0k.3 the UVI proof** (proven with audio 2026-09-04, RUNNING_LOG §57–59; token `$Engine/Out n`) (Flute SI2): `tools/uvi_state.js` decode → unchanged re-encode →
     `SetTrackStateChunk` through the bridge → UVI still plays; then part 13 → outputs 3/4,
     seen in the GUI and in the track's routing.
  4. ☑ **0k.4 apply B** (2026-09-04, RUNNING_LOG §60–61: faders on the violin anchor, two strike lanes proven with meters, re-measured on target) (§47): faders flute −21 · bcl −9 · piano +7 · vn 0 · va −3.5 · vc −1 by
     the bridge; `Flute strikes` child track on UVI outs 3/4 (+21); a second bass-clarinet
     slot on [A] 5 → output st.2 → `BassCl strikes` (+13) by a Kontakt script; recipe
     `slap.channel = 5` + `balanceDb`; re-measure `-Only flute,bass_clarinet`; SAMPLER_QUIRKS.
  5. ► **0k.5 the setup scripts + the foundation for other projects** — begun 2026-09-04 (RUNNING_LOG §62: the bridge's runtime machine-level, a project guard, generic transport / marker / arm / reload jobs, `reaper/bridge/README.md` as the install guide for the live-electronics repo and the next piece, `curve_slots.lua` written for 0c.7); verified §63 (runtime relocated, reload-from-a-job proven); `curve_slots.lua` runs at 0c.7; the drawer's feature update U1–U4 built and verified (RUNNING_LOG §64) — the composer's test next — one Kontakt Lua per track type (the ×4 curve slots for
     0c.7, the piano pair, the bass clarinet) and the UVI XML tool as the standing way to
     configure; host automation for CC7-free knobs (§50) when a static sampler knob is wanted.
  Then back to the drawer's feature update (STRIKES_TOOL U1–U4) when the composer says.
  *Why:* every later rack change becomes a job with a read-back instead of a screenshot
  conversation. *Rejected:* community MCP servers; CC7 trims; GUI-only trims.
## 1. Compose — `todo` (starts the moment 0h passes; tools built per need, the #3/#4 MO)

- **1a — A more fluid way to draw curves in the score** — `built 2026-09-05 with TRILLS_TOOL phase 2 (RUNNING_LOG §105): trace, then adjust — drag a node, drag the diamond to bend, double-click to add / remove; re-trace a region to replace it` *(composer, 2026-09-03: "todo:
  figure out a more fluid way to draw curves in the score")* — freehand or pen-style entry that
  becomes a node curve, instead of node-by-node placement. *Why:* the curve is the piece's
  primary continuous notation (D9; NOTATION_ARCHITECTURE amendment 1) and CN-1, CN-3, CN-5 all
  live in curves; drawing speed is composing speed.
  *Composer, 2026-09-04, the shape of it:* *"for easier wave-curves, i can plot high and low
  points including plateaus, system will plot the entire wave-curve, I can then easily, easier
  than now, adjust individual slopes, so something like click on segment, mouse scroll up/down
  left/right, (we need to better callibrate the mouse adjustment), click off or another"* —
  *AI reading:* extrema-first drawing (click the peaks, troughs and plateau ends; the curve is
  fitted through them), then per-segment shaping: click a segment to select it, the wheel bends
  its slope (vertical = curvature / exponent, horizontal = where the bend sits), click elsewhere
  to release; the wheel's gain per notch calibrated so one notch is a visible, repeatable step.
  *Composer, 2026-09-05:* *"my curve idea was just an idea … there was the wave-curve object from the two-percussion
  piece — essentially, just too many controls … a simpler version of that, where I can trace a long curve and then make
  some adjustments along the way"* — the design in `TRILLS_TOOL.md` §3: trace, simplify to a few nodes, three gestures.
- **1b — Revisit the save-file logic; simplify, make it more logical** — `done 2026-09-04 (D17 — one rule: working copy · Save · Name version · Reload, hints in the app, tools/unsaved_check.js at session end; RUNNING_LOG §67–68)` *(composer,
  2026-09-03: "todo: revisit save file logic, try to simplify/make more logical")* — the
  inherited chain (canonical `piece-sNN` · `-work` autosave copy · `Save as next` · `Variant` ·
  `Restore` snapshots, NAMING.md §1) is three pieces' accretion; design the septet's own rule set
  before the first real save (`piece-s01`), so no file is ever renamed after the fact. *Why:*
  autosave has eaten a score in every previous piece; the logic must be obvious to be safe.
- **1c — The scattered-strike database + the reorchestration panel** — `doing 2026-09-03; the drawer's feature series U1–U13b built 2026-09-04/05 at the composer's word (STRIKES_TOOL.md; RUNNING_LOG §64–92)` *(1c.1 `tools/strike_db.js` + `bank/scattered_strikes.json` done, RUNNING_LOG §36; **1c.2 the STRIKES drawer `score/public/strike_drawer.js` built and verified in the running app, §39** — the requirements A–T with statuses in `docs/STRIKES_TOOL.md`; O v2 2026-09-04 — takes in `bank/panel_snapshots.json`, SPACE owned by the drawer while open, RUNNING_LOG §65; Q v2 — `Insert @ original time` into any open score, §68; **the composer's listening pass is next**, then double stops, the K lock, the harmony collection + Messiaen (M/N/P, = 1d) and the `kind` field in the recipes)* *(composer,
  2026-09-03, on his first material save "scattered strike 01"; RUNNING_LOG §33 has the words)*
  — the piece's first compositional tool, in the piece #2 ostinato-timing-DB mould
  (`bank/ostinato_timing_db_2p2p.json`: ingestions with provenance, per-sample stats, two
  thresholds). **1c.1 the capture** (`tools/strike_db.js`, from a save + window): strikes =
  onset clusters separated by a strike gap (dial, ~500 ms as #2); per strike, EVERY onset's
  displacement from the strike's first onset, absolute (s) and normalized (0–1 over the
  strike's span, plus units of its median gap) so it can be multiplied, stretched, warped; the
  harmony = ALL notes (pitch, instrument, technique) — nothing redacted; the rhythm = the
  onsets after redacting any within the **simultaneity threshold, default 60 ms** (composer:
  "somewhere around fifty milliseconds … maybe sixty" — the dial); and the SEQUENCE: the
  inter-strike distances first-onset to first-onset, absolute and normalized ("the timing of
  the whole sequence captured"). Written to `bank/scattered_strikes.json` with provenance
  (score, window, object ids). **1c.2 the panel** (in the composer score, the `*_panel.js`
  pattern; a lab only if the score cannot host it): pick a strike (or a sequence) from the DB
  → a table of its notes with per-note INSTRUMENT, OCTAVE ± and TECHNIQUE choices → time
  transforms (multiply, stretch, warp curve) → Hear through the rack → Insert at the playhead
  as objects with a `groupId` and the gesture's META shape (NAMING.md §2). The blast panel's
  Hear / Insert / Replace column controls are the precedent; the difference is MANUAL
  assignment ("I can choose to place different notes to different instruments"). *Why:* CN-5
  and CN-6 are built from these strikes; the database makes a strike reusable material rather
  than a one-off.
- **1e — The trill module: trills grown from the strikes, on reference curves** — `phases 0–4 built 2026-09-05/06 (RUNNING_LOG §97–111; D18–D21); phases 5–6 ahead`
  *(composer, CN-19: "one of the onsets in one of these strikes launches a trill … attacked, sforzando, directly into a
  trill … the system would know to eat the bass clarinet notes for strike eleven and twelve")* — the spec is
  `docs/TRILLS_TOOL.md`: the trill object on the ostinato engine with per-instrument speed tables and a fp envelope ·
  three META lanes with trace-then-adjust drawing · the live curve reference (portable) · launch from a strike note ·
  eat by mute-rule · one availability model shared with the accel dealer · the weave later · notation as `tr` + span.
  Phases 0–6 there; step 0 is a listening exercise with today's zones. *Why:* CN-1 / CN-6's tremolos on curves are
  the piece's second material, and the composer wants them to grow out of the strikes (CN-19).
- **1d — The harmony database, gathered from all the pieces** — `todo` *(composer, same
  breath: "collect up a harmony database from all my pieces … the two piano two percussion
  piece where I have things called chord shapes, and then in the tuba piece … blasts … gather
  up all the harmonies into a single database")* — after 1c. Sources: #2's chord shapes (its
  save schema `databases.chordShapes`, and its banks), #4's blasts / sonorities
  (`blast_taxonomy.json`, the pulse palette's S-numbers, the cluster bank), the septet's own
  strikes (1c). One `bank/harmony_db.json`: pitch-class set + voicing + provenance (piece, file,
  id, date) per entry; the 1c panel reads it as a second source. *Why:* the composer's
  harmonic vocabulary as one addressable table.

- **1f — The beatings: a pair of players on one pitch, a gap that beats — the beating panel (section 2, CN-28 · CN-29 · CN-33)** —
  `doing` — **building since 2026-09-07 at his word (*"will you be able to run the plan independantly? can you do so, and I'll check
  in after the build"*, RUNNING_LOG §167): step 1 built (§167–168), step 2 built (§169), step 3 built (§170), step 4 built (§171), step 5 built (§172), step 6 built (§173)** (the requirements talk 2026-09-06 evening, RUNNING_LOG
  §145–166; PLANNING_METHOD phase 3 from step 1) *(composer,
  2026-09-06: CN-28 "strikes with morph chords, like freeze frames or old time slide show … 'morph events'" · CN-29 "the expansion of
  pitch to expand beating, the rebreath … and the Crescendo … the multiple pairs" · "beating is good" · "the atom will be a pair of
  players" · "a panel, and I can see the pair represented by some sort of curve … it'll be bipolar … everything should have handles …
  hit space bar to play that configuration" · "the axis should be beats per second")*. **Was:** "1f — Morph events" — the tuba
  piece's morph engine made launchable from a strike; superseded by the talk, the engine's parts reused where they fit (the bend
  arithmetic, the re-key, the breath rule; `docs/MORPH_NOTES.md` is the memory for the all-purpose revision, D22).
  **Decided in the talk:** the object is a **beating** (his word; a strike, a trill, a run, a beating): one pair of players on one
  centre pitch, both bending around it by mirrored curves (a flat partner = one holds), the gap beating; its seven elements — the
  pair · its pitch · the beating curve (bloom out of unison, close into it, hold) · the crescendo · the breaths · the timing between
  players (inside a pair the phase, between pairs the offsets) · the entry and the exit; the frame the length and the pair count. The
  **panel** (his picture): a row per pair, up to three; per row the two mirrored pitch curves slid against each other for phase, a
  crescendo layer, a breath layer, a derived line showing the beat rate that results; shapes from a menu with handles on rails (a
  flat line for a held level, a hump, the long arc) or redrawn with the trill's curve tool (D21); a whole pair slid in time; the space
  bar plays the configuration; a typed duration replays it stretched; takes. **The axis is beats per second** (the tool finds the cents
  per player from the pitch and the interval; at a fifth / fourth / major third the beating is between coincident partials — 3× / 4× /
  5× the unison's rate per cent, fainter). **The pitch side:** the strikes' played chords (the bank) on the drawer's keyboard → a
  centre pitch per pair; the sonority between the pairs (unison · thirds · fifths · other); inside a pair unison, fourths / fifths /
  thirds to try. **The piano is out of the beating** (CN-34): six players, up to three pairs. The shuffle drawer of §146 parked —
  the same rows and curves are what a deal would fill later. The top line agreed 2026-09-06 (§148–149):
  1. **The palette** (how far each player may bend, by sampler and by hand, and who may pair with whom) — `built 2026-09-07
     (RUNNING_LOG §167–168; docs/BEATING_TOOL.md §3): the recipe's playerBendSt · bendRangeSt · beating fields; beating_calc.js
     (the palette part: players, ranges, bend limits, the pairing rule; 37 checks); the bend probe on this kit (balance_schedule.js
     --bend → balance_probe.ps1 → probe_run.sh → analyze_bend.py, self-tested → bank/bend_ranges.json → apply_bend_ranges.js) —
     RUN IN HIS RACK THE SAME NIGHT: SI2 ±2.00 st, the Xsample five ±0.96–0.99 st (set to a semitone in Kontakt), RPN 0 ignored on
     all six, the residue real on all six, the pre-arm at 300 ms fine; the numbers in the recipe as MEASURED_BEND`. *Result when
     done:* the tool knows, for each of the six bending players, how far a note may bend and by whom — the sampler's range, measured
     in his rack, and the player's, his rule; which two players can sit on which pitch, from the ordinary voices' measured ranges,
     so the panel offers only pairs that can play; the score's bend path, still fixed at the tuba's two semitones, ready to read the
     instrument's range instead. The to-dos:
     - adopt the quartet's convention (#1, RUNNING_LOG §150): the bend before the note, the centre after, re-key past the range —
       the centring already in the score's tick (`resetMorphBend`);
     - one bend probe for the six players on their ordinary voices: the tuba's `probes/bend_probe.ps1` + `analyze_bend_probe.py`
       adapted to this repo's kit and ports (0 · +50 % · +100 % · −100 %, then a second note after an unreset bend, for the residue);
       he runs it in the rack;
     - the analyzer writes the sampler's range per instrument to the bank (`bank/bend_ranges.json`: semitones per full bend, and
       whether the range can be changed by MIDI);
     - the player's range in the recipe: one semitone for all six, the winds' by embouchure (his rule: "usually within semitone at the
       most"); the panel's ceiling stays in beats per second, the cents shown so the limit is visible;
     - the pairing table computed from the ordinary voices' measured ranges (`MEASURED_RANGES`): any two of the six whose ranges hold
       the pitch; at a fourth or fifth each holds its own note; the panel offers only those;
     - the sampler's range as a recipe field the tick reads at step 3 (the tuba's 1.99 stays until then);
     - `docs/BEATING_TOOL.md` opened with the numbers (the TRILLS_TOOL pattern); MORPH_NOTES §1 updated.
  2. **The beating math** (a pure module: rate to cents by pitch and interval, the two curves and their difference, the breaths, the
     duration stretch) — `built 2026-09-07 (RUNNING_LOG §169; docs/BEATING_TOOL.md §4): beating_calc.js's second half — the
     conversion (13.18 c = 1 beat/s at C3), the heard beating from the two players' cents, the shapes, mirrored / flat partner, the
     slide, the three breath modes and the seeded deal with the ceiling table, the re-key, the notes with note-relative bend and level
     breakpoints, renderPattern with the META contour, stretch, the flags; beating_calc_check.js 77 checks — nothing heard`. *Result when done:* one pure module, page and tools alike, turns a pair's description — the centre
     pitch, the interval inside the pair, the two rate curves (one per player, signed, in beats per second, as the panel slides them),
     the crescendo curve, the length, the breath rule — into each player's chain of notes, one per breath, each carrying its bend in
     cents over time and its level over time; the upper player sits on the just interval, every rate becomes the cents that produce
     it on that pitch and that partial; it also returns what the panel shows and checks — the beat rate over time (the difference of
     the two curves), the cents each player reaches, flags where a player's semitone, the sampler's range or the roughness zone is
     crossed, a re-key where the sampler's range would be passed; a typed duration re-samples the same curves. Checked in node,
     nothing heard yet. *(composer, 2026-09-06, RUNNING_LOG §152: "single events … one bow or breath … longer events … the dotted go
     line … on sliders … a warning … maximum breath length or bow length … continuous … or designate when the bows should change …
     an opportunity for the shuffle")*. The to-dos:
     - the conversion: the pair's coincident partial from its interval (unison 1:1 · fourth 4:3 · fifth 3:2 · the thirds 5:4, 6:5);
       the upper player's offset to the just interval; each player's signed rate curve → cents over time; the difference → the
       beat-rate line with its zones (flanger below 1 per second, roughness above about 15);
     - time: the curves normalised to the event's length, so a typed duration re-samples them; a slide is an offset of one player's
       curve;
     - three breath modes per player: one breath (the short event, a single note) · continuous (one long note; the performer re-bows
       at will and the notation says so) · designated (the breath marks as note boundaries, placed by hand or dealt);
     - the breath shuffle, the tuba carrier's rule per instrument (`morph.js` `buildCarrier`): a target length with jitter, a ceiling
       by instrument, register and loudness, the gap (about half a second for the winds, none for a bow change), the pair's two
       players half a breath apart by default or aligned for the pulse; seeded, so reshuffle = a new seed; hand-moved marks kept, the
       rest re-dealt;
     - the ceiling table for the six (the winds' breath, the strings' bow), defaults tuned by his ear later; a flag on any note past
       it — the sliders, the dotted go lines and the warning display are the panel's (step 4);
     - continuity across a breath: the next note starts at the pitch and level where the last ended; a re-key where the sampler's
       range is passed, flagged;
     - the output: per player a chain of notes with note-relative bend and level in the score's units (the tick applies 1g's remap);
       the pattern's notes for several pairs at their offsets; the flags (a player's semitone, the sampler's range from step 1's bank,
       the roughness zone, the ceiling);
     - the check script in node (`tools/beating_calc_check.js`, the accel calculator's pattern): rate → cents → rate; the fifth at 3×
       per cent; the just offsets (+2 · −2 · −14 · +16 c); mirrored humps in phase = a pulse, slid = a plateau; breath lengths inside
       the ceiling and staggered; the stretch; the flags; the tuba's number reproduced (13.19 c = 1 beat per second at C3, D28).
  3. **One pair in the score, heard** (the object on its two lanes, its notes, playback through the bend and 1g's remap; unison first,
     then fifth and fourth by ear) — `built 2026-09-07 (RUNNING_LOG §170; docs/BEATING_TOOL.md §5): the beating zone with its
     block, B on a strike note (the nearest pairing lane the partner, a 6 s bloom 0 → 3/s), the snippet regenerated at play with
     per-event routing and _bend events, the tick's bend through bendRangeSt and the centre after the end, the P row, ▶ hear;
     verified on a copy at 175.6 s by the decoded MIDI — the beat rate within 0.002/s of the math, the just offsets on the upper
     note at every interval, save / reload / drag / stretch / delete, the checker clean. HIS EAR PENDING (unison, fifth, fourth)`. *Result when done:* a beating exists as a score object and he has heard one. B on a
     strike note makes a beating on that lane and its partner's: the note's pitch the centre, the partner the nearest lane that can
     pair with it by step 1's table, a bloom from unison to 3 beats per second over 6 s, one breath, the crescendo following the
     beating curve. At play it regenerates its notes from its settings as the trill does (D20): one sustained note per player, bent
     per frame through that instrument's own range from step 1, the bend set before the note starts and centred when it stops, the
     loudness through 1g's remap; a stretch of its edge regenerates it; a minimal properties row on P changes the partner, the
     interval, the two rates, the length and the breath mode (the maximum beating adjustable from here on — the 3 per second is only
     the birth default; a handle at step 4; the ceiling the player's semitone, flagged). The curve panel is step 4, the mute rule and
     the group step 6. Verified on a copy of the piece at 175.7 s by decoding the MIDI the tick sends, then by his ear. *(composer,
     2026-09-06, RUNNING_LOG §154)*. The to-dos:
     - the object: a `beating` on the launching lane carrying its partner's lane, the trill's zone as the model — the pair's settings
       (centre pitch, interval, the two rate curves, the crescendo curve, length, breath mode and marks, seed); drawn as a bracket on
       both lanes, selectable, draggable, its right edge a stretch; saved and loaded; the group drag carries it (§144);
     - regeneration at play start and after a drag or stretch: step 2's module makes the notes, one per breath per player, kept as
       the object's own snippet (the trill's `midiSnippet` pattern), never as loose score notes — removing the beating removes all;
     - the tick: the bend per frame from the note's breakpoints through that instrument's range (step 1's recipe field replacing the
       tuba's 1.99 at `composer.html:10112`); the bend joined to the pre-arm so the note starts at pitch; centred at the note's end
       and on stop (`resetMorphBend`); the level through 1g's held-note path (`heldNote / cc7ForHeight`); the timestamped scheduler
       (D19);
     - the launch: B on a strike note, or at the playhead with nothing selected, makes the beating with the defaults above; the
       strike note itself stays as it is (the mute rule is step 6);
     - the properties row on P: partner · interval (unison, fourth, fifth, the thirds) · rate from and to · length · breath mode; the
       zone's label names the pair, the interval and the top rate;
     - Hear from the row, or the space bar with the object selected: the pair alone through the same tick path;
     - verified on a `zz-ai-*` copy of the piece at 175.7 s on :5301: launched on a strike, the notes on both lanes, the tick's MIDI
       captured and decoded — the beat rate over time matching the curve within 0.1 beats per second, the just offsets at the fifth
       (+2 c) and the fourth (−2 c), the bend before the note-on and centred after, the CC7 through the remap, nothing stray on other
       channels; save, reload, drag and stretch keep it; the checker clean;
     - his ear: unison first, then the fifth and the fourth; the verdicts to MORPH_NOTES §3 and BEATING_TOOL.md; commit, push.
  4. **The panel** (rows, the mirrored curves with handles on rails, the crescendo and breath lanes, the beating band, shapes and
     freehand, the slide, the space bar, the duration box, takes) — `built 2026-09-07 (RUNNING_LOG §171; docs/BEATING_TOOL.md §6):
     score/public/beating_panel.js — a floating panel bound to a selected beating (P, B) or holding a pattern until Insert; per row
     the mirrored rate curves with handles on rails, the band by zone, shapes and draw mode, the mirror lock and ALT-drag, the
     body slide, the crescendo lane, the breath lane with sliders / ceiling / shuffle, the offset rail; the length box, SPACE, the
     takes (the beatings bucket); verified with real DOM events on a copy. HIS TEST PENDING`. *Result when done:* the beating panel opens on P for a
     selected beating, or empty from the toolbar for a new one, and holds a pattern of up to three pairs, one row each. In a row the
     two players' rate curves as mirror images above and below a centre line, the beating that results drawn between them, a
     crescendo lane and a breath lane beneath. Every curve has handles on rails: the top sets the level, the ends resize, the body
     slides. A shape pops in from a menu (a flat line, a ramp out or in, a hump, the long arc) and can be reshaped or redrawn freehand
     with the trill's curve tool (D21). The two curves of a pair move as mirrors until unlocked and slid for phase. A whole row slides
     in time against the others. The breath lane shows the dotted go lines on sliders and the warning past the ceiling, with a shuffle
     that deals staggered breaths of the right length. The space bar plays the configuration through the same path as the score; a
     duration box replays it stretched; a take saves a configuration he likes. Every edit regenerates the objects, so a pattern in the
     score changes as he drags. **Settled with the goal (RUNNING_LOG §156):** a floating panel like the strikes drawer with the curve
     tool's gestures inside it, the score's curve windows A / B / C left to the trills; the beating shown as the band between the two
     curves, filled and tinted by zone (flanger · beating · roughness) with the rate in numbers at the handle while dragging; mirror
     lock on by default, one modifier key to move a single curve. *(composer, 2026-09-06, §147: "a panel, and I can see the pair
     represented by some sort of curve … it'll be bipolar … everything should have handles … hit space bar to play that
     configuration … audition that configuration over different durations")*. The to-dos:
     - the chassis: a floating, draggable panel on the strikes drawer's pattern; P on a selected beating loads its pattern and edits it
       live; a Beating button opens an empty pattern that lives in the panel until Insert (step 6); keys scoped to the panel's focus;
       takes as in the strikes drawer (`bank/panel_snapshots.json`, a `beatings` bucket), named, saved with the repo;
     - the row, one per pair, up to three: the pair's label (players, centre pitch, interval — step 3's fields; the pitch side proper
       is step 5); the two rate curves mirrored above and below a centre line; the band between them tinted by zone with the rate in
       numbers at the handle; the crescendo lane; the breath lane; add and remove a row;
     - shapes with handles: the menu — flat · ramp out · ramp in · hump · the long arc · burst — each a few points with handles for the
       level, the ends, the peak's place and the body on a rail, numbers typed beside them; the crescendo lane from the same menu in
       level units; freehand: the trill's curve tool inside the row to redraw any curve, a shape becoming editable points;
     - the mirror lock and the phase slide: on by default (drag one, the other mirrors); one modifier key moves a curve alone; the band
       shows the result at once;
     - the row offset and the length: a rail handle slides a whole pair in time against the others; the duration box sets the
       pattern's length — the curves normalised, the marks scaled, the breaths re-dealt past the ceiling;
     - the breath lane: the marks as dotted go lines on sliders per player; the ceiling drawn and a warning past it; the three modes
       (one · continuous · designated); the shuffle button dealing staggered breaths of the right length from a seed, hand-moved marks
       kept;
     - audition: the space bar with the panel focused plays the pattern through the score's tick — all pairs, real time — and stops on
       space again; every edit regenerates the pattern's objects, debounced;
     - verified on a `zz-ai-*` copy with real DOM events (a shape popped, a level dragged, a slide, an unlock and slide, a row offset, a
       duration change, a shuffle), each changing the objects' notes as predicted and decoded; the takes round-trip; nothing outside
       the pattern touched; then his test, the verdicts to MORPH_NOTES §3 and BEATING_TOOL.md, commit, push.
  5. **The pitch side** (the strikes menu → the keyboard, a pitch per pair, the sonority between pairs, the interval inside a pair)
     — `built 2026-09-07 (RUNNING_LOG §172; docs/BEATING_TOOL.md §7): in beating_panel.js — the strike menu from the bank
     (numbered as the drawer), the keyboard beside the rows (the chord's dots, the unplayable keys dimmed from step 1's table, the
     pairs' notes as rings), arm-and-click or drag onto a row = the pair's lower note, the relations from a root (unison in one
     octave · across octaves · thirds · fourths · fifths · a typed stack) dealt and folded into the pairs' ranges, a launched
     beating opening on its strike; verified with real DOM events on a copy. HIS TEST PENDING`. *Result when done:* the panel's pitches are chosen the way the strikes drawer chooses them. A strikes menu lists the
     played chords from the bank; clicking one puts that chord on a keyboard inside the panel. A click on a keyboard note and then on
     a row gives that pair its pitch, and the keyboard dims the notes the pair cannot play (step 1's table). The sonority between the
     pairs can also be dealt by relation from a root note — unison, thirds, fourths, fifths, or a typed stack — folded into range.
     Each row's interval places the partner's note above the pitch at the just interval (unison by default; fourths, fifths and the
     thirds to try), and the keyboard shows both notes of the pair. Which player takes the upper note follows the ranges. A pattern
     launched from a strike starts with that strike's chord as its source. **Settled with the goal (RUNNING_LOG §158):** the
     assigned pitch is the pair's lower note, the partner above it by the interval; unison between the pairs offered two ways — all
     pairs on one note in one octave (a six-player field on one pitch, the tuba's bloom) and the pitch class spread across octaves;
     the strikes drawer's own keyboard reused inside the panel (the fold arrows and the range dimming for free). *(composer,
     2026-09-06, §148–149: "the menu of strikes … it appears on the keyboard … assign a pitch to a pair … the chord or sonority is
     between the three pairs … the forty five or forty six played chords … internally, there's Unison, but I also would like to try
     fourths, fifths")*. The to-dos:
     - the source menu: the bank's played chords, numbered as the strikes drawer numbers them; beside it the relations from a root —
       unison in one octave · unison across octaves · thirds · fourths · fifths · a typed stack; a pattern launched from a strike
       opens on that strike;
     - the keyboard: the strikes drawer's own, reused inside the panel; the chosen chord lit; with a row selected, the notes outside
       both its players' ranges dimmed from step 1's table; the fold arrows as in the drawer;
     - assigning: click a note then a row, or drag the note onto the row; the note is the pair's lower note; the row's interval places
       the partner above it at the just interval; the keyboard shows both notes in the row's colour; the player above chosen by range;
       a row's players changed by chips and re-checked against the table;
     - the relations dealt: from the root (a keyboard click or typed), the pairs' pitches by the relation, folded into the pairs'
       ranges by the drawer's fold rule, the pairs from the bottom up;
     - the interval per row: unison · minor third · major third · fourth · fifth; the just offset applied by step 2's module and shown
       in the cents readout;
     - the row's label (the two players, the lower note, the interval, the upper note) mirrored into the beating object's fields; the
       objects regenerated on any pitch change;
     - verified on a `zz-ai-*` copy: a strike picked puts its chord on the keyboard; a note assigned sets the object's pitch; an
       interval changed moves the partner and its just offset in the decoded MIDI; a note outside a pair's range dimmed and refused; a
       relation dealt from a root gives the pairs' pitches as predicted, folded; a launched pattern opens on its strike; then his
       test, the verdicts to MORPH_NOTES §3 and BEATING_TOOL.md, commit, push.
  6. **Insertion** (at the playhead, its own group and META shape, re-insert replaces, select-and-P, stretch regenerates; nothing
     around it touched) — `built 2026-09-07 (RUNNING_LOG §173; docs/BEATING_TOOL.md §9): insert @ playhead from the panel — a
     beating zone per row under one group with a META shape (the crescendo's mean, 33 nodes); the shape's drag, box stretch and
     delete carry the beatings (the three group paths learned zones); re-insert replaces at the same time, elsewhere a second
     group; select + P loads the group; a selected strike note's pitch and onset as the starting point, no link; no mute, no
     eating; verified on a copy. HIS TEST PENDING`. *Result when done:* a pattern made in the panel lands in the score at the playhead as one gesture,
     its own thing. It arrives as its beating objects under one group with a META shape, so the group drag carries it, a delete
     removes all of it, and a stretch of the shape regenerates it. It touches nothing around it: no note muted, no note greyed, no
     overlap avoided; the score's ordinary conflict marks apply to its notes as to any other, and the accents are his to add by hand.
     Its length is the pattern's own. Inserting again from the same panel replaces the earlier insert at its own time and nowhere
     else. Select a beating and P reopens its pattern in the panel. One convenience: with a strike note selected, B and the panel
     take its pitch and its onset as a starting point, with no link made. The META shape's contour from the crescendo's mean, as the
     tuba's. **Decided with the goal (RUNNING_LOG §160, composer): "keep the beating out of the strike chain so unlike the trills …
     we'll just add accents manually, but it doesn't have to do things like avoid overlaps and gray out notes … it'll just be its
     own thing"** — the mute rule, the eating and the exit at the next strike note of the first proposal dropped; step 3's B launch
     reads the same way. The to-dos:
     - Insert @ playhead from the panel: the pattern's objects on their pairs' lanes at the playhead time, the row offsets kept, under
       one new group with a META shape on the META layer whose contour is the crescendo's mean across the pattern; the panel
       remembers which group it made;
     - the starting point: with a strike note selected, its pitch goes to the first row and its onset becomes the insert time;
       nothing stored linking the two;
     - the group's behaviour: the group drag carries every object (the single-shape path and §144's multi-selection path alike); a
       delete of the shape removes all of it; an edge stretch of the shape scales the pattern by step 2's stretch (the curves
       normalised, the breaths re-dealt), each object regenerated on mouseup;
     - re-insert: from the same panel state the earlier group is removed and the new one placed at its own time; an insert at another
       time makes a second group (the strikes drawer's rule, CN-28 / §112);
     - select + P: a selected beating loads its whole group into the panel, all rows, edits live; the panel's Insert then acts as a
       replace;
     - nothing else touched: no mute stamps, no eating, no greying; the conflict checker reads its notes like any other — verified,
       not assumed;
     - verified on a `zz-ai-*` copy at 175.7 s: a three-pair pattern inserted lands on six lanes under one group with its shape; the
       group dragged 2 s moves all of it with the offsets kept; the shape stretched × 1.5 regenerates with the breaths re-dealt; a
       re-insert replaces and the object count holds; an insert elsewhere makes a second group; a delete removes all and nothing
       else changes; save and reload keep it; the checker clean; then his test, the verdicts to MORPH_NOTES §3 and BEATING_TOOL.md,
       commit, push.
  7. **Verify and document** (the whole tool end to end on a copy; the tool's doc, the morph notes, the naming doc, the journal; his
     listening) — `todo`. *Result when done:* the whole tool has run end to end on a copy of the piece at 175.7 s — from the strikes
     menu to a three-pair pattern shaped, slid, breathed, inserted and played in context among the strikes around it, its MIDI
     decoded and matching what the panel shows. `docs/BEATING_TOOL.md` exists, gathered piece by piece with what was built stamped
     (the STRIKES_TOOL / TRILLS_TOOL pattern). MORPH_NOTES says what exists now and carries the digest for the revision. NAMING §2
     carries the beating object's conventions for the IR (D9: the composer save is the ground truth). The journal holds the
     decisions with their whys. PLAN 1f is marked built. The app's help line says how a beating is made. He has heard the first
     pattern in the piece on his own server after a hard reload, his verdicts filed. The piece file stays his: every run on a copy,
     the first pattern in the piece placed by him. *(RUNNING_LOG §163)*. The to-dos:
     - the end-to-end on a `zz-ai-*` copy at 175.7 s: a strike picked from the menu, three pairs assigned, shapes popped and dragged,
       one pair unlocked and slid, a row offset, breaths dealt, a duration set, inserted at the playhead, played among the strikes
       around it; the tick's MIDI decoded for the whole pattern against the panel; the checker clean; the copy and its working file
       deleted after;
     - `docs/BEATING_TOOL.md`: the requirements gathered piece by piece — the anatomy, the panel, the pitch side, the breaths, the
       insertion — each with his words and stamped with what was built and when; the open questions for him at the end;
     - MORPH_NOTES: §1 rewritten to what exists now (the beating math, the object, the panel; what the tuba files still hold); §4 the
       digest for the revision;
     - NAMING §2: the beating object for the IR — its type and fields, its generated notes, the curve height as the dynamic (D23) —
       so the extractor at 2a knows what it reads;
     - the journal: §4 the decisions with their whys and the rejected alternatives (the name and the atom · the panel · the axis ·
       the piano out · the beating out of the strike chain · the breath model); §2 updated; PLAN 1f marked built;
     - the app's help line (`?`): how a beating is made — B, P, the panel, Insert;
     - his hard reload and his listening on his server, the first pattern in the piece placed by him; the verdicts to MORPH_NOTES §3
       and BEATING_TOOL.md; commit, push.
  8. **Later** (the shuffle as a writer; cycles of beatings for section 3, CN-33; the training material on the full beating curve;
     the notation at 2a) — `deferred`. *Result when done:* four things stand in the plan as named, not built, each with the line that
     will start it:
     - **the shuffle as a writer** — dealing cards, rates, entries, pairings and pitches into the same rows (§146), when hands prove
       too slow;
     - **cycles of beatings for section 3** — strikes with crescendos on the beating pairs (CN-33), when the section is reached;
     - **the training material on the full beating curve** — rendered from the tool so the players hear the bottom, the middle and
       the top (CN-33), at the performance-score stage;
     - **the notation of a beating** at phase 2a — two curves per part and the beat rate written at the ends of the glissando, the
       tuba's settled form (`for_seven_tubas/docs/MORPH_NOTATION.md`) as the start.
  *Why:* section 2's material in his form of 2026-09-06 — strikes whose chords are held and beat, the slide show — and the beating
  textures he means to use "a lot in the future for this piece and the next piece"; the pair as the unit is the one thing the tuba
  engine never had (#4 day 13, finding 3).
- **1g — Balanced dynamics for curve-driven playback: trills first, then crescendos and the morph events** — `done 2026-09-06 (RUNNING_LOG §115–120; D23)`
  *(composer, 2026-09-06: "get balanced level playback through MIDI for trills using the curve shapes, and hopefully this will extend
  to other types of articulations like crescendos")*. Reordered 2026-09-06 at his word: one item at a time, the simplest terms.
  1. **Normalize the volume between instruments** — `done 2026-09-06 (§115–119)` — the bottom and the middle of the curve; the top (127) is already done by the
     instruments' individual gains (0j). The to-dos:
     - ~~build the probe~~ — done 2026-09-06 (`tools/balance_schedule.js --sweep`, the player's cc7, the analyzer's sweep report, the self-test; §115);
     - ~~run it in his rack and record it~~ — done 2026-09-06, driven through the bridge (`reaper/Media/01-REC-260906_1140.wav`, 357 notes; §115);
     - ~~analyze the recording~~ — done 2026-09-06: `bank/velocity_map.json` (consistent with the balance run within 1.0 dB; the ensemble at 127 within 1.8 dB; the velocity and CC7 curves per register; §115);
     - ~~compute, per instrument, the velocity that matches the violins at each curve height; save it as the remap~~ — done 2026-09-06 (`tools/velocity_remap.js` → `bank/velocity_remap.json`, per register, within 0.03 dB where reachable, the clamps counted; §116);
     - ~~make the app send the remapped velocity~~ — done 2026-09-06 (`velocity_remap.js` shared by the page and the tools, `velocityFor(layer, pitch, anchorVel)`, the trill reads it through `velocityAt`; §117);
     - ~~check: all seven at bottom, middle and top, read the levels — within about 1.5 dB~~ — **done 2026-09-06 (§118–119):** the second
       sweep, the hybrid remap (velocity for the layer, a CC7 trim for the rest on the deterministic samplers), the analyzer's Hann
       error found and fixed; the final proof: five of seven within 1 dB at every height, the cello and the bass clarinet within their
       own round-robin scatter (±2 to ±4 dB per note). `bank/velocity_remap.json` is the remap the app reads.
     *Result:* the same curve height is the same loudness on every instrument — **achieved 2026-09-06, item 1 closed** (§119).
  2. **The curve's meaning for the notation** — `done 2026-09-06 (D23; NAMING §2.9, TRILLS_TOOL §10, NOTATION_WORKFLOW §7)`. *Result:* a curve's actual heights are its dynamics — bottom ppp, top fff, a curve
     rising two thirds of the way is f — and the notation never reads velocities; the IR carries every curve-driven object's dynamic
     range in names (e.g. "p → f"), so at the notation stage he may redraw a curve at full page height with "p → f" written at its
     start (a per-event choice, taken later, with the range names as the anchor). The to-dos:
     - the contract line in NAMING §2: the curve's height is the dynamic (0 = ppp, 1 = fff); velocities are rendering, never read
       as dynamics; the extractor writes each curve-driven object's dynamic range as names (phase 2a is built to this);
     - the notation line in TRILLS_TOOL §10: a trill is written as `tr` over its span, its dynamics read from its curve;
     - decision D23 in the journal, with the why: the MIDI is tweaked to sound right, the notation must not inherit the tweak;
     - a note in NOTATION_WORKFLOW: the rescaling option — the page curve at full height, the range named at its start.
  3. **The trill's velocity switch** — `built 2026-09-06 (§117)`. *Result:* a trill's loudness follows its curve, 65 at the bottom to 127 at the top in the
     ensemble's one scale (the violins' numbers), each instrument translating it through item 1's remap; each trill has a switch,
     curve or as played, and two boxes for its own low and high; the attack keeps its own settings. (The flute audition dropped
     2026-09-06 — the probe comes first.) The to-dos:
     - add the switch to the trill object: curve or as played; new trills start in curve mode; existing trills keep as played until
       he switches them;
     - add the two boxes, low and high, defaults 65 and 127, per trill;
     - the engine computes each note's velocity from the curve height at that note, between the low and the high, then through the
       instrument's remap from item 1 (a pass-through until the probe runs); the attack note stays out of it;
     - show the switch and the boxes in the trill's panel; the mode in the zone's label;
     - verify in node and on a copy of the piece: bottom and top of a known curve give the two numbers, the middle the middle, the
       attack unchanged, an as-played trill unchanged.
  4. **The ordinary voice** — `built 2026-09-06 (§117)`. *Result:* a new trill plays the instrument's ordinary voice (strings Senza Vibrato #6, flute Ordinario,
     bass clarinet Senza Vibrato Velocity #13, piano main); a trill copied or dragged to another lane takes that lane's voice instead
     of silently falling back to the lane's first preset, as it does today (§115). The to-dos:
     - name the ordinary voice per instrument in the recipe;
     - a new trill starts on that voice instead of the capture's accent senza vibrato;
     - when a trill lands on another lane, by drag or by copy, its articulation is checked against that lane's list — not there →
       reset to the lane's ordinary voice; the same check for the attack articulation;
     - the panel and the label show what actually sounds, never the first entry by accident;
     - verify on a copy of the piece: a new trill on each of the seven lanes, and a copy dragged from the flute to each other lane,
       all sending the right articulation switch. His existing tutti copies are corrected by the third to-do at their next
       regeneration (play start).
  5. **Extend to crescendos** — `done 2026-09-06 (§120)`. *Result:* a crescendo drawn as a curve on a sustained note balances across the instruments the same
     way a trill does, through the same idea of remap; the same for the morph events' crescendo later and for any object whose
     loudness a curve drives. The to-dos:
     - settle the carrier: a held note cannot change velocity mid-note, so its crescendo rides on CC7 — what the app already streams
       from a curve on a sustained note, through the tuba piece's CC7 table;
     - ~~measure CC7 → loudness per instrument~~ — done 2026-09-06 inside item 1's sweep (the cc7 role; `bank/velocity_map.json`; §115);
     - ~~compute a CC7 remap per instrument anchored on the violins~~ — done 2026-09-06 (§120: the held note's velocity for the top of
       its curve, CC7 for the height, live from the measured curves — `heldNote / cc7ForHeight`);
     - ~~the sustained-note stream reads the remap instead of the tuba table~~ — done 2026-09-06 (the tick's pre-arm, record and stream;
       the tuba map only without a remap);
     - ~~the two functions for the morph events and any later curve-driven object~~ — done (`velocity_remap.js`; MORPH_NOTES §1);
     - ~~check: all seven holding a note at bottom, middle and top~~ — done 2026-09-06 (§120): six of seven within 1.4 dB at every
       height, the cello within its own scatter.
  *Why:* the piece's second material is curve-driven; if the curve's bottom is a different loudness on each instrument, no ensemble
  balance can be composed — and the rendering must never leak into the notation.
- **1h — The acceleration calculator and the drawer's run dials: any feel of the rush by dialing, the math a module for every panel** — `built 2026-09-06 (RUNNING_LOG §125–129; CN-30)`
  *(composer, 2026-09-06: "I'd like to try another variety that's more gradual … a long and gradual ramp up to the end" · "make sure we
  have all the right dials and numbers in there so that when I am ready to calibrate a certain flow then we can" · "modularize the math
  part of it … reuse the acceleration calculator for other types of sounds and other panels")*. The top line agreed 2026-09-06; the
  step-by-step skipped at his word ("a simpler plan").
  1. **The calculator module** — `built (§129)`: `score/public/accel_calc.js`, the math alone, page and tools alike — the two ends in
     either order; the length by any one of steepness / count / duration; the shapes: geometric (U13's law, reproduced to a nanosecond),
     curve (the tuba dial: bloom ← even → surge), S-curve, two-phase, late rush, linear ms; jitter (fixed or ramped, seeded); a hold at
     the landing; a level ramp with its own curve; a mirror. `tools/accel_calc_check.js` (52 checks, PASS).
  2. **The drawer reads it** — `built (§129)`: the accel block's `run` menu and its dial, `length` by steep / notes / ms with the one in
     charge outlined, jitter, hold, mirror, vel → vel (through 1g's remap); decelerations (`→ last` above the gap); the strip, the
     readout and Hear follow; takes from before the dials get the defaults.
  3. **Verify and document** — `done (§129)`: on a copy of his piece with real DOM events (his take 34-a unchanged: 18 notes · 4201 ms ·
     steep 0.842; an insert at 107.807 s exact to the millisecond); STRIKES_TOOL §W marked built; committed and pushed.
  4. **The free dealer and the pitch pool** — `built 2026-09-06 (§135–138)` *(composer: "I'm not sure the redeal is working, sounds
     like a loop" → the dealt laps read off a copy: the shuffle and the re-deal worked; what looped was the lap of seven and the cards'
     five pitch classes → "c, build both pls")*: a `deal` menu — round robin (as built) or free (no lap: each note to any player the
     re-attack rule allows, at random, never the one who just played while another is free, a lean toward whoever has waited longest;
     the rule a guarantee, flagged when nobody is free) — and a `pitches` menu — the cards, or every distinct pitch the strike holds,
     drawn to completion then reshuffled, folded into the receiving player's range as before. Verified on the copy: 102 notes, the
     closest two of one player 267 ms apart, ten pitch classes; the old round robin deals identically.
  5. **The even run** — `built 2026-09-06 (§142)` *(composer: "a spread out strike, evenly spread out, but then have it last a certain
     duration and have a return or loop like the acceleration … the same mix of the instruments and pitches around and choose from the
     full range of played pitches")*: `run` → even — one gap throughout (the gap box; `→ last` ignored), the length by ms (every gap
     exactly the length ÷ the count) or by notes; the dealing (round robin or free) and the pitch pool as for any run. The calculator's
     default shape pinned to geometric; the tail check reads the run's actual smallest gap.
  6. **Later, on his go:** the calibration ladder (his words → the dial's numbers, done the way the tuba's dens8 ladder was); other
     panels adopting the module — the trills, the compiler's clouds (its own copy of the law stays until touched; NITS), the morph
     events.
  *Result when done:* any feel of the rush is reachable by dialing, and one calculator serves every panel that accelerates. *Why:* the
  drawer's one shape was the crash (§125–126: half the notes in the last quarter whatever the boxes said); the piece's next section
  (107.81 s, CN-30) wants a ramp heard all the way; a module because the same math will drive other sounds and panels.
- Sketch pad: `docs/COMPOSITION_NOTES.md` — the opening is already there (ensemble attack →
  curve-based tremolos with fp entries → tremolo fugue → density-build sound mass).
- Tuba engines to pull per need: `compiler.js` swell clouds and grain envelopes (present
  in the port), texture/pulse/multitempo panels (present), density-build recipes
  (`CURVE_DATABASE.md` MAXDENSE-1 / BUILD-1 — data in #4, consult when the mass is built).

## 2. Notate — `deferred` until the first real page exists

- **2a — Engine adaptation** — the 0g list. Start with the page the opening needs.
  *Technique → notation mappings to honour (from the recipe's `notate` field): flute `pizzicato`
  sample → written **tongue ram** (composer, 2026-09-04, RUNNING_LOG §44).*
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
