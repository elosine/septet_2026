# PROJECT JOURNAL — septet 2026 (the Tempus septet)

> One file. Seven sections. Everything important lives here.
> §2 is read at every session start — keep it ~40 lines; trim old sessions to one line each.
> The lab journal (`RUNNING_LOG.md`) is the raw trail underneath; this is the curated state.

---

## §1 Quick-Start

- **The piece:** flute (piccolo, bass flute) · bass clarinet · piano · vn 1 · vn 2 · va · vc,
  for the TEMPUS LAB 2026 call (`docs/Tempus-Lab2026_Application_English.pdf`).
  Deadline **2026-10-15 23:59 CET** · max **12 min** · PDF score ≤ **DIN A3** · fee €25 ·
  concerts 26–28 Nov 2026, Leipzig · if selected, score + parts due 4 weeks before.
- **The stack:** piece #4's, copied forward, palette rewritten (D1). Composer score `:5300`,
  sandbox `:4800`. Same delivery format as the tuba piece: animated score; presentation
  score (video + print) for the submission; performance score ported from #4 later (D2, D3).
- **Phases (D3):** 0 setup → 1 compose (sample libraries + composer score) → 2 notate
  (2a engine adaptation · 2b presentation score) → 3 performance versions → 4 submission.
- **Reference repos** (read-only, additional working dirs): #4 tubas · #3 bcha · #2 2p2p ·
  #1 sq1 · `live-electronics-engine` (its journaling practice only — no electronics, no
  code from it in this piece; composer 2026-09-03). Consult per named question only.
- **The IR contract (D9):** the composer save is the ground truth; the IR is derived from
  it by the extractor and is the single source for the animated score, video, print and
  stands. Composing never waits on it.
- **Apps (0b, live since 2026-09-03):** `node score/server.js` → http://localhost:5300/
  composer.html · `node sandbox/serve.js` → http://localhost:4800 · `.claude/launch.json`
  names them `score` / `sandbox`. `scores/septet.json` = the committed day-one stub; the
  piece goes in the `piece-sNN` chain (#4's NAMING.md). Recipes: `sandbox/instruments.js`
  (provisional until 0e/0c).

### Map of piece #4 (survey 2026-09-03) — what the port inherits

- **Composer score app** `score/` — zero-dependency Node server (`server.js`, 54 KB) +
  `public/composer.html` (810 KB) + panels: `compiler.js` (meta-curve → swell schedules,
  Roads grain envelopes), `morph*.js`, `texture_*.js`, `pulse_seq*.js`, `multitempo*.js`,
  `tonality.js`, `sonify_core.js`, `clusterview.html`, `chordview.html`, `planner.html`.
  Tracks are **instrument-keyed** (`tracks: {tuba1..tuba10}`, `{id,label,instKey}`); the
  META drawing lane is `META_LAYER = 10`. Tuba coupling: the `TRACKS` array, ten lane
  labels + a `<select>`, two `INSTRUMENTS.tuba1` lookups, one `'tuba' + (10 - k)` port
  spot, `layoutVersion` migration code. **Storage is two object types** (`waveCurve`,
  `marker`); the piece is the `piece-sNN` save chain (`docs/SAVE_FILES.md`, `NAMING.md`).
- **Server routes** the app needs: `/api/composer/*` (save/load/list/versions/discard/
  palette/mtime), `/api/motives*`, `/api/snapshots`, `/api/taxonomy`, `/api/clusterbank`,
  `/api/actuals*`, `/api/morph*`, `/api/texture*`, `/api/pulsepalette`, `/api/shapepresets`,
  `/api/generate-ostinato`, `/api/notation/renders`; static `/docs/`, `/bank/`, `/notation/`,
  `/probes/`. Requires only `./snapshots.js` and `../tools/model_bank.js` (which requires
  `score/public/morph.js`). Reads `bank/*.json` at request time — **empty valid skeletons
  needed** for cluster_bank, blast_taxonomy, actuals, or the panels 404.
- **Sandbox** `sandbox/` — `serve.js` (3 KB), `index.html` (25 KB), `instruments.js` (30 KB,
  100 % palette: per-instrument `{label, port, rangeLow, rangeHigh, techniques:[{key, label,
  channel, port?, cc0?, ks?, range}]}`), `motives/` (the shared library, D9 linked blocks).
- **Notation** `notation/` — `lib/` (layout 136 KB, render, glyphs.json with **9 glyph
  kinds and ONE clef = bass**, animobj, coords, static_page, splice, playability,
  extract_core), `registry/` (container.json = engraving data), `schema/` (IR v0 + JSON
  schema; **a gate on the file — an unknown kind deletes the page**), `app/notation.html`,
  `ir/` (pages). Parts are lane indices; `frameParts` renders any subset. **No transposition,
  no treble/alto clef, single staff per part, no chord columns** — the phase-2 gaps.
- **Print** `print/score/build.sh` + `tools/export_print.js` (Chrome headless PDF, vector,
  `--format tabloid-landscape`; A3 = one more format entry) · **video** `tools/export_video.js`
  (resvg, the repo's only dependency) · cover `print/cover/`.
- **Tools** `tools/` (100+): generic — `midi_out.js` (SMF writer), `model_bank.js`,
  `notate_section.js`, `ir_extract/validate`, `export_*`, `test_*`; the rest is tuba research.
  **Probes** `probes/*.ps1` = the winmm P/Invoke MIDI sender the AI drives (from #3's SB0).
- **Docs kit** copied here: `AI_METHODOLOGY`, `SESSION_HYGIENE`, `.claude/commands/
  {checkpoint,postclear}`; from #3: `HOW_WE_WORK`, `SESSION_PROTOCOL`.

### Libraries on hand (from the manuals in #3 and the maps in #1/#2)

- **IRCAM Solo Instruments 2 (UVI):** flute in C, clarinet in B♭, violin/viola/cello (+ mute,
  lead-mute variants), tuba, harp, accordion, … — **no piccolo, no bass flute, no bass
  clarinet, no piano.** Channel-per-technique switching; overflow instance when > 16.
- **Xsample:** bass clarinet owned and deep-mapped (#3: CC0 articulation select, CC1 MW
  dynamics crossfade, CC68/24 legato→gliss, CC82 RR, ¼-tone bend); **Contemporary Solo
  Strings** used in #1 (CC0 articulations, 3 channel banks because CC state won't reset,
  gliss keyswitches B0/G#1/A1). The Xsample woodwinds catalog lists piccolo, alto and bass
  flute — ownership unknown.
- **Piano (#2):** 8Dio Steinway Grand (Kontakt, velocity, CC64); IRCAM Prepared Piano 2
  (harmonics with CC21 pitch shift, muted). Port `Piano1`, channels 1–5.

---

## §2 Resume Here

**Session 4 — 2026-09-06 (in progress, Claude Code / Fable 5.1) — RUNNING_LOG §111–124.** The composer composes and tests on his
own server (:5300); the AI built at his word, one chunk at a time:
- **Tools on his hands (§111–114):** the bend cursor only when Points is off; TRILLS phase 4 (a trill runs to the player's next
  strike note, a stretch regenerates at once); a nudged trill keeps its attack note (a 60 ms eating window; the drag keeps a
  trill's start; the articulation switch arbitrated on a shared sampler slot — the tail and the lead); the drawer's pick no
  longer parks the playhead, `⌖ original` on request, an insert replaces only at its own time (strikes recur, CN-28); a
  duplicated trill complete at once.
- **PLAN 1g done (§115–120, D23):** a curve height is the same loudness on every instrument — the velocity and CC7 sweeps
  through the bridge, the per-instrument remap anchored on the violins (velocity for the layer, a CC7 trim for the rest on the
  stepped samplers; `bank/velocity_remap.json`, `score/public/velocity_remap.js`), the trill's velocity switch (new trills follow
  the curve 65 → 127; the panel's Velocity row and the **All trills** batch), the ordinary voice per instrument, the notation
  rule (height = ppp … fff; NAMING §2.9), crescendos on held notes. The analyzer's own 2 dB Hann error found and fixed on the way.
- **PLAN 0d done (§122):** the samples' true ranges and one-shot lengths — 46 techniques measured; the Bartók tops E6 / E5 / B4,
  the gettato tops B6 / E6 / E5; `MEASURED_RANGES` in the recipe; `tools/range_check.js`; the trill label's attack warning.
- **His score edited at his word (§123–124):** 16 out-of-range strike notes and the two bass clarinet trills folded down in
  `scores/piece-septet.json` (snapshots `piece-septet-v1.9-beforeFold` / `-beforeTrillFold`); the checker clean.
- **PLAN 1h built (§125–129, CN-30):** the acceleration calculator (`score/public/accel_calc.js`, the math alone, page and tools;
  `tools/accel_calc_check.js`, 52 checks) and the drawer's run dials — `run` (six shapes, the tuba curve dial among them), its dial, the
  length by steep / notes / ms, jitter, hold, mirror, a level ramp through the remap, decelerations; his take 34-a unchanged; the same evening the free dealer and the whole-strike pitch pool (§135–138), the even run (§142); §139: the version suggestion
  counts suffixed names, the All-trills attack batch, a free trill ends 0.17 s before the next strike note; §141: the minor-2nd script; §143: Reload is the way back to a named version (Name version saves the file too); §144: a
  multi-selection drag carries the strikes' groups. No
  calibration (his word). **107.81 s = the next section's start** (CN-30). CN-31: Lake George's pointillistic multitempo section.
- **Process:** `docs/PLANNING_METHOD.md` (state and restate → the top line → one step at a time: goal, sub-steps, into the plan),
  the user-level `/plan-item` skill and trigger lines; `docs/MORPH_NOTES.md` (D22, a standing practice); CN-28 (the form's
  middle: strikes with morph chords → PLAN 1f; patterned / call-and-response strikes) and CN-29 (the morph event's four elements).

**Last session (3, 2026-09-04 → 06):** the piece to #31 / 72 s; the drawer U5–U13b; the trill module phases 0–3 and the curve
windows (D18–D21); the timestamped playback. RUNNING_LOG §65–110.

**NEXT STEPS · MODEL · CLEAR:**
1. ☑ 0a · 0b · 0d · 0e · 0g · 0i · 0j · 0k.1–0k.4 · 1a · 1b · 1c (U1–U13b) · 1e phases 0–4 · 1g · 1h DONE and pushed.
2. ► **The composer composes** (any model): section 1 drafted to 175.7 s (v1.23-sec1DraftDone; 48 strikes, 69 trills, minor 2nds from 135.84 s); his report on the day's tools (the run dials, the free dealer, the even run, the attack batch, the group drag) — a bug: the data first, fix, verify on a copy, journal, commit, push.
3. **1f the morph events** (Fable; talk first — PLANNING_METHOD, MORPH_NOTES §1–2) as section 2 begins; **TRILLS_TOOL phase 5, the
   weave** on his go; the run dials' calibration ladder (1h item 6) on his go; the notation of trills at 2a.
4. **0c / 0h** (the recipes' completion; the phase-0 gate) when the music asks; 0d.3 / 0d.4 remain as the remainder.

**Open at session end** *(mid-session checkpoint, 2026-09-06 ~22:30, for an AI that has never seen this conversation):*
- **Task and state:** the composer composes and tests with the day's tools; **section 1 is drafted** — his `v1.23-sec1DraftDone` is
  the saved `scores/piece-septet.json` (175.7 s, 639 objects, 48 strike groups, 69 trills, the ones from 135.84 s minor 2nds, CN-32).
  Nothing half-built; every page change of the day verified on a `zz-ai-*` copy on :5301 and pushed (RUNNING_LOG §125–144). His app
  needs a hard reload (CTRL+SHIFT+R) for the page changes since his last one.
- **Latest deliverable:** §144 — a multi-selection drag carries a strike's whole group (`composer.html` `startGroupDrag`). Before it:
  §142 the even run · §139 the version suggestion, the All-trills attack batch, the free trill's 0.17 s end · §138 the free dealer and
  the whole-strike pool · §129 the acceleration calculator (`score/public/accel_calc.js`, `tools/accel_calc_check.js`, 57 checks) and
  the drawer's run dials (PLAN 1h, six items built).
- **Next concrete step:** read his report. A bug: the data first — `scores/piece-septet.json` (or `-work.json` when it is newer: his
  unsaved edits), the recipe, the bank — then fix, verify on a copy (`cp scores/piece-septet.json scores/zz-ai-<x>.json` ·
  `preview_start score-5301` · `Composer.loadSession('zz-ai-<x>')` · real DOM events · delete the copy and its `-work` after), journal,
  commit, push. When he reaches the morph section: **PLAN 1f, talk first** — `/plan-item` (PLANNING_METHOD: the data first, one topic,
  the top line, one step at a time) after reading `docs/MORPH_NOTES.md` §1–2. The run dials' calibration ladder (1h item 6) only on
  his go.
- **Resume reads:** `docs/PLANNING_METHOD.md` · `docs/PLAN.md` 1h (built; its six items say what exists) and 1f · `docs/STRIKES_TOOL.md`
  §W (the run menu, the dealing, the pool) · RUNNING_LOG §125–126 (the shapes in numbers), §138 (the free dealer), §143 (the save
  system's rule for versions), §144 (the group drag) · `docs/NAMING.md` §1 (a suffixed version name counts as its number; the AI's
  snapshots carry his current number with a suffix, never a new one) · `docs/MORPH_NOTES.md` §1–2 when 1f comes.
- **How the AI works the app and the rack:** the Browser pane on :5301 (`preview_start score-5301`), a `zz-ai-*` copy of a score,
  deleted after (its `-work` too; stop the server first); the pane's hidden tab collapses rects; its console log is cumulative across
  loads (count the load blocks); a trill's property panel renders only with `Composer._panelOverride = true` set AFTER
  `selectObject(z)`; a trill's sounding pitches are the `notes` arrays of its `midiSnippet` events (the `_cc` events come first); a
  drag is driven through the real handler (`startGroupDrag` / `startWCBodyDrag` with a fake startEvent, then MouseEvents on
  window); drive the ticks synchronously with `performance.now` patched. **This shell's heredoc** collapses a double backslash AND
  refuses a text carrying a quoted single letter (`'s'`) — such files go through the file tool, then `cat >>`; patches to the page go
  through a node script with `String.raw` anchors that must match exactly once (`${}` inside String.raw still interpolates — avoid).
  The rack: `tools/reaper_job.js` (heartbeat · tracks · fader · run · chunk); a probe run = `bash tools/probe_run.sh <schedule>
  <analyzer flags>` (PROBE_SCRATCH = a scratch dir); the probe kit `tools/balance_schedule.js` (--sweep, --sweep2, --proof
  [--repeat], --held, --ranges) → `probes/balance_probe.ps1` → `probes/analyze_balance.py`; the self-tests `probes/selftest_*.py`.
- **Pending the composer:** the calibration ladder of the run dials (his words → the numbers; §130–134 hold the first entries) on his
  go · the bass clarinet's attack articulation for the batch (no marcato sfz in its library: With Accent #20 / Staccato #19 / Secco
  #27) · his verdict on the trills at the new loudness · the cello's attack (the marcato has a sample at G#5) · "the range walk"
  (meaning unconfirmed) · the plucked piano silent in the rack (NITS) · the 0j piano trim +7 vs +5.3 (NITS) · CN-2 (piccolo vs bass
  flute) · Q7 (the low-C bass clarinet).
- **Deliberately uncommitted (his, not the AI's to commit):** `scores/piece-septet.json` (his saved score = v1.23) · his named versions
  `scores/piece-septet-v1.7 · v1.8 · v1.8-startTrills · v1.9 · v1.10-preAccelNear105 · v1.12-preTrillFix · v1.15-newAccel ·
  v1.18-preReload · v1.19-marcatoApplied · v1.20-preTrillm2 · v1.21-postm2Trill · v1.22-beforeDelete · v1.23-sec1DraftDone.json`
  (NAMING §1 says versions are committed — at session end on his word) · `scores/piece-septet-v1.9-beforeFold.json` and
  `-beforeTrillFold.json` (the AI's snapshots before the folds) · `scores/trillBuildTst.json` (his test score) ·
  `bank/panel_snapshots.json` (his takes).

**Open questions:** Q1 the flute doubling (piccolo vs bass flute; SI2 flute in C until then) · Q5 print format (A3 landscape;
#4's tabloid is 432 mm) · ~~Q6 the violins' Bartók top~~ measured 2026-09-06: E6 (88), the viola's E5, the cello's B4 (§122) ·
Q7 the bass clarinet's bottom B♭1 (34) — confirm the ensemble's instrument reaches low C.

**Blockers:** none.

---

## §3 Principles

*(Lessons never to repeat. Numbered, append-only. 1–7 inherited from #3/#4 with their
sources; verified here only when they bite.)*

1. **Check Reaper input monitoring before blaming the instrument** (#3 P1) — armed +
   input-assigned + MIDI flicker ≠ monitored; the silent killer.
2. **When a working reference exists, diff the files, don't iterate guesses** (#3 P2).
3. **The IR schema is a gate on the file** (#4) — a new overlay kind must enter
   `notation/schema` in the same commit or the page is rejected and deleted. Snapshot first.
4. **Never `git add -A`** (#4 D30) — two agents may share a tree; stage explicit paths.
5. **Only delete IDs you created in the same breath** (#4 sandbox lessons) — cleaning up
   "everything present" destroyed composer data twice.
6. **MIDI thru must never listen to the loopMIDI output ports** (#4) — they echo into a
   feedback storm.
7. **Schedule playback with a ~150 ms lead** (#4) so the first note never races the
   all-notes-off before it.
8. **Object ids are per save — never delete or replace by id alone** (this repo, 2026-09-03,
   RUNNING_LOG §39; P5's cousin). `wc-40` exists in every score; the first Replace-in-place
   deleted six unrelated objects from the score that happened to be open. Any tool that removes
   objects it did not create in the same breath must first prove the loaded save is the source
   (`pieceBase(sessionName) === source`) — and refuse otherwise.
9. **Verify against the composer's running server; never hold his port and never save from the
   AI's pane** (2026-09-03). The AI's browser pane has no Web MIDI and its autosave would write
   into whatever save is open — set the session to `untitled` before any Insert test, clean up,
   reload. A hidden pane never fires `requestAnimationFrame`: test scripts must not await one.
10. **When downstream meters freeze at identical values, dump mute / solo / routing first**
    (2026-09-04, RUNNING_LOG §59; P1's cousin). Six tests were read behind a muted folder parent
    before the state dump showed `REC mute 1`.
11. **Learn a plugin's vocabulary by diffing the GUI's change, not by guessing from strings**
    (2026-09-04, §59). The plugin binary said "Out 2"; the state the GUI wrote said
    `$Engine/Out 2`. One click by the composer and a diff settled an hour of hypotheses.

---

## §4 Decisions

*(Append-only: ID, date, decision, why, what was rejected.)*

- **D1** *(2026-09-03)* — **Base = piece #4's stack, ported by copy-forward of selected
  folders with the instrument palette rewritten.** *Why:* the composer just finished the
  tuba piece and will use "very similar structures"; #4's app is instrument-keyed already
  (its D8) and #3 proved heterogeneous tracks with per-library mechanisms. *Rejected:*
  clone-and-prune the tuba repo (857 commits of tuba research in every cold session's way);
  extracting a shared engine package now (right shape, wrong six weeks — after the septet).
- **D2** *(2026-09-03, composer)* — **Same delivery format as the tuba piece:** animated
  scrolling score with the same animated devices; a presentation score (video + print) for
  the submission; the performance score before rehearsals, **ported from the tuba modules
  once they exist there** ("I'll be finishing up the performance score parts in the tuba
  piece, and then we can port those over here when the time comes").
- **D3** *(2026-09-03, composer)* — **Three phases:** compose with the sample libraries and
  the composer score → notate as a separate phase (2a engine adaptation; **2b presentation
  score** = video for the submission + print score) → performance versions before
  rehearsals. **The notation layer is not needed to start composing, because of the IR
  layer** — but its infrastructure is carried over now (PLAN 0g) so nothing is lost.
- **D4** *(2026-09-03, composer)* — **The lab journal and the sketch pad are standing
  habits, unprompted.** `RUNNING_LOG.md` = decisions, comments, theory, philosophy, how a
  thing was made, dead ends, corrections — for a paper later; `COMPOSITION_NOTES.md` = the
  composer's musical ideas verbatim. Rules adopted from `live-electronics-engine`
  (CLAUDE.md § Standing practice). *Rejected:* one merged file — state and record would blur.
- **D5** *(2026-09-03)* — **Ports 5300 (score) / 4800 (sandbox)**, distinct from #4's
  5200/4700 and #3's 5100/4600, so the tuba repo's servers and this repo's can run together
  while the tuba performance modules are still being built.
- **D6** *(2026-09-03)* — **The flute player is ONE track; the instrument in hand
  (flute / piccolo / bass flute) is a switch on that track,** carried by the technique
  recipe (port/channel/range for MIDI now; clef + transposition for notation in phase 2).
  *Why:* a doubling modelled as three tracks would notate as three staves and break the
  one-player = one-lane reading the animated score depends on. *Reversible* if the sandbox
  shows the switch needs to be its own object.
- **D7** *(2026-09-03, composer)* — **Strings = Xsample Contemporary Solo Strings.** *Why
  (composer):* the quartet's work transfers — technique switching, the control channels
  "used effectively" there — and piece #3 re-examined the same Xsample controller model on
  the bass clarinet (CC0 preset select, MW dynamics, CC68/24 legato → gliss). *Rejected:*
  SI2 strings for uniformity — "I don't wanna lose any of that Xsample functionality."
  *Named residual risk, the composer's own:* **volume — "we just need to get the CC7 nailed
  down"** → PLAN 0d, a bounded measurement, not an open-ended survey.
- **D8** *(2026-09-03, composer)* — **Push automatically after every commit**, staging
  explicit paths only (piece #4's D30 adopted; the inherited "ask push now?" in
  HOW_WE_WORK / SESSION_PROTOCOL is superseded, noted in place).
- **D9** *(2026-09-03)* — **The IR contract, stated from the beginning.** The composer's
  understanding: *"the IR is the data layer created in the composition stage and then used
  for all the other layers, just converting the data."* The precise form, as piece #4 built
  it (verified in `notation/app/notation.html` `loadIr`, `tools/export_print.js` /
  `export_video.js` `--ir`, and ARCHITECTURE.md "everything draws from the IR"):
  1. **The composer-score save file (S1) is the ground truth of the composition** — curves
     and markers on instrument-keyed tracks, one timecode in seconds.
  2. **The IR is DERIVED from S1** by an extractor (`tools/notate_section.js` →
     `notation/lib/extract_core.js`): a classifier over rules turns S1 objects into semantic
     events / chunks / groups with provenance on every node; derived ids are deterministic
     functions of source ids; notational decisions attach as authored overlays that
     re-attach by id when the IR is regenerated; the continuous (envelopes, curves) is
     referenced, never copied.
  3. **The IR is then the single source for every downstream manifestation** — the
     animated notation score, the video, the print score, and the performance stands (a
     live view of the IR, per #4's architecture). Print vs video proved byte-identical in #4.
  4. So the IR is **created from the composition, not during it**, and is regenerable at
     any time because S1 stays live. Composing never waits on the IR; the IR never freezes
     the composition. This is what makes "notate as a separate phase" (D3) safe.
  5. **What must be true of S1 from the beginning** (the real "in there from the start"):
     instrument-keyed tracks (have) · a technique key on every sounding object (the recipe
     key = the IR's `technique`) · the flute's instrument-in-hand as track data (D6) ·
     stable, never-reused object ids (have) · **one fixed convention for which layer holds
     META shapes vs notes** (the tuba classifier had to absorb drift between scores) · the
     real-sounding-length rule per material (#4's D9: one-shots carry sample-true length)
     · group ids on gestures. **Proof, not assertion: PLAN 0i** runs the tuba extractor and
     validator on a small septet save.
  6. **What IS piece-specific in the pipeline:** the classifier rules and the class
     registry (`notation/registry/classes.json`; #4's trance-stream / density-cloud
     classes). Those get septet classes in phase 2a. The schema, validator, layout and
     renderers do not change for that.
- **D10** *(2026-09-03, composer)* — **The composer score's lane order is the standard
  orchestral score order, top to bottom: flute (with its doublings) · bass clarinet · piano ·
  violin 1 · violin 2 · viola · cello.** The composer: *"look at a standard orchestration for
  the score layout. We'll lay out the composer score the same. My guess is strings at the
  bottom, piano in the middle, flute on top. And then the others in between."* The standard
  (Adler, *The Study of Orchestration*; Gould, *Behind Bars*): woodwinds · brass · percussion ·
  harp and keyboards · voices · strings, high to low within a family — for these seven,
  exactly the guess (the bass clarinet takes the clarinet's place under the flute; a piccolo
  or bass flute stays on the flute's line, D6). The one other convention, piano at the
  bottom, belongs to chamber music with piano and strings alone (trio, quartet, quintet;
  *Pierrot Lunaire*'s own score puts the piano last); a mixed ensemble with winds reads in
  orchestral order today. **Verified in the running app:** the lanes already sit in this
  order (TRACKS as ported at 0b — RUNNING_LOG §14). *Consequence for phase 2:* the notation
  score, the print and the parts keep the same order; bracket groups winds / piano brace /
  strings (PLAN 2a).
- **D11** *(2026-09-03, composer)* — **Channel banks by EVENT CLASS, from the start, on every
  Kontakt / Xsample port** (bass clarinet, vn 1, vn 2, va, vc): **ch 1 MAIN** — plain notes,
  dynamics by velocity, articulation by the prelude's CC0, keyswitches; no continuous
  controller is ever written here — and **ch 2 / 3 / 4 CURVE A / B / C**, used round-robin
  for any event that carries a continuous controller (CC7 level, CC1 timbre dynamic, CC4 +
  pressure vibrato width, bend), each event writing its own start values in its prelude. The
  composer: *"there's going to be events that happen right after a crescendo much sooner
  than two seconds … a crescendo in the violin that goes to secco … the next event might
  come in in a hundred and fifty milliseconds … So probably better to continue using
  multiple channels."* Offered A (main + two curve channels), B (main + three), C (the
  quartet's literal main / CC7 / vibrato banks); the composer chose **B** ("b"). *Why:* #4's
  250 ms lead and 2 s restore are the cost of moving a controller on a channel where a note
  sounds; a channel that is never moved has no timing cost, so the main channel is free of
  the law entirely; the only collision left is two curve events on one channel inside the
  lead window, and three curve channels cover three of them — cheap insurance, a Kontakt slot
  costs RAM only. *Rejected:* one channel per CONTROLLER (the quartet's scheme), because a
  note that swells and changes its vibrato width at once is one note on one channel — the
  split must be by event class. Flute (UVI, channel = technique) is decided at 0c: curve
  copies of the curve-bearing techniques in the four free Fluteb slots, or the tuba law as
  it stands; piano main only. Vibrato found, not remembered: width = CC4 + channel pressure
  (which one Xsample obeys is 0d's to measure); molto vibrato is a preset (CC0 2 / 70) and
  lives on the main channel. RUNNING_LOG §15–16.
- **D12** *(2026-09-03, composer, over the requirements session — `docs/STRIKES_TOOL.md` R1–R6, L,
  S)* — **The strikes tool is ONE full-width drawer in the composer score, built on the
  three-list model.** Pitches (the harmony), onsets (the rhythmic positions) and players are three
  independent lists paired freely; "as played" is one pairing; voicing presets move octaves only;
  an articulation is a layer on a voice — the pitch stays the harmony's, the articulation's KIND
  (pitched / fixed-pitch / noise / multiphonic) decides whether a stand-in sounds. Ranges: the
  shuffle never produces a misfit, a hand choice folds by octave or is skipped. The 60 ms grouping
  is re-derived after every transform, never frozen. Duration and dynamics as played, each with a
  multiplier (and a flatten switch). The keyboard shows the ensemble's span with an `88` toggle.
  *Why:* the composer wanted to "place different notes to different instruments" by hand AND to
  shuffle; keeping the three lists independent makes every combination reachable without modes.
  *Rejected:* the v1 table panel (a note list with per-row menus — no picture of the harmony);
  a floating panel (too small for five columns — "full size drawer"); a four-way switch for the
  piano's role (replaced, on the composer's push, by per-note flags with quick buttons);
  freezing the redaction grouping at capture (the grouping must follow the transformed rhythm).
- **D13** *(2026-09-04, composer)* — **The ensemble balance anchors on the violins, by
  measurement.** One probe run (every instrument's plain technique × 3 pitches × velocity 127 /
  64, recorded on the REC folder), the loudest 400 ms K-weighted RMS per note, trims = the
  violins' level minus each instrument's; applied as Reaper track faders (flute −21 · bcl −9 ·
  pianos +7 · va −3.5 · vc −1 · vn 0) and recorded as `balanceDb` in the recipe. *Why:* the
  composer's ear ("flute sounds quite loud") wanted "a 127 flute the same perceived loudness as a
  127 violin", data-based; the violins as anchor keeps the mockup at a normal level. *Rejected:*
  anchoring on the quietest (the piano — everything −7…−28 dB); velocity scaling (changes the
  sample layer); CC7 offsets (the app pins CC7 = 127 per event, and CC7 is the dynamics channel);
  the tuba rule's sampler-master trims (GUI-only, no number in the file — amended for this rack).
- **D14** *(2026-09-04, composer: "B")* — **A strike articulation that needs its own loudness gets
  its own lane:** a separate sampler output into a child Reaper track with its own fader, fed by a
  post-FX pre-fader send of the plugin's outputs 3/4. The flute's Pizzicato part → UVI `Out 2` →
  `Flute strikes`; the bass clarinet's slap → a second Kontakt slot on [A] 5 → output st.2 →
  `BassCl strikes`; the recipe routes by channel. Measured: the tongue ram lands level with the
  Bartók pizz. *Rejected:* CC7 per technique (cuts only, eats the dynamics range, a stray note
  is loud).
- **D15** *(2026-09-04, composer: "lets do a comprehensive survey and find the best, fast and
  reliable and most functions")* — **Reaper and the samplers are handled as code, through our own
  bridge, not an MCP server.** A Lua loop inside Reaper (from `__startup.lua`) answers job files in
  ~30 ms with the whole ReaScript API; its runtime is machine-level so every project uses it; UVI's
  state is XML edited by `tools/uvi_state.js`; Kontakt's multi is built by scripts on the Kontakt
  Lua API (developer features on); host automation for CC7-free knobs when a static sampler knob
  is wanted; the composer's hands only for what none of these reach. *Why:* every rack change
  becomes a job with a read-back instead of a screenshot conversation; the same foundation
  serves the live-electronics project and the next piece. *Rejected:* the seven community MCP
  servers (the same bridge underneath, a Python stack and a fixed vocabulary each); computer-use
  as the primary path (slow, medium reliability).
- **D16** *(2026-09-04, composer)* — **The flute's SI2 Pizzicato sample stands in for the written
  TONGUE RAM** ("pizzicato sounds loud in sample, just note that we'll notate this as tongue
  ram"): `notate: "tongue ram"` on `flute.pizzicato` — the first technique → notation mapping
  field, read by the notation layer at 2a. The patch's own tongue-ram keyswitch is unverified.
- **D17** *(2026-09-04, composer: "It's a bit too complex for me … I do want some sort of auto save
  … I don't want to have it override … I want to be able to keep kind of a running version … give it
  a name … let's try it")* — **The save system: ONE rule for every score, piece or experiment.**
  Opening a score puts you in its working copy (`<name>-work`, gitignored; autosave writes there);
  the file changes only on Save (+ a silent snapshot); "Name version" saves the file and freezes
  `<name>-v<label>` (committed, never overwritten); "Reload" drops the working copy; the `piece-`
  prefix alone decides the menu (Piece / Experiments). Hints: a `?` strip in the app. Session end:
  `tools/unsaved_check.js` before the commit. *Why:* piece #4's D10 protected `piece-*` names only,
  so the experiments — where the composing actually happened — were autosaved in place, and the
  four verbs (Save · Save as next · Variant · Restore) could not be remembered between sessions.
  Reaper's model (the file only on Save, backups out of sight) is the precedent. *Rejected:* Word's
  AutoSave-into-the-file (the override the composer named); a numbering chain (`sNN`, load-bearing
  nowhere); two folders (one folder, one prefix, is the whole rule); a Restore menu (the snapshots
  stay as the AI's net). RUNNING_LOG §67–68.
- **D18** *(2026-09-05, composer: "these don't sound right … those [piece #2's] sound a lot smoother" · "a" — adapt his samples)*
  — **The trill's timing is his own playing.** His capture files (trill playing on accent senza vib; violin, viola, cello) are
  ingested into `bank/trill_timing_db.json` with every note indexed by the speed he was playing at (a local rate mapped 0–1
  over the instrument's range), its gap, velocity, length and role (lo / hi); a trill is generated by piece #2's lookup — the
  curve's height is a speed level, the attacks he played at that level cycled in turn, stretch → smooth → speed. *Why:* the
  formula (a linear rate ramp, flat velocities) was rejected by ear; piece #2's smoothness was human timing, curve-indexed.
  *Rejected:* the rate table of the first spec; re-recording single-ramp bursts in #2's protocol (kept as an option; not
  needed — speed-indexing takes the long wavy takes as they are). RUNNING_LOG §100–101.
- **D19** *(2026-09-05, composer: "still sounds quite jumpy … different playback? embedded midi?" · "yes please fix the piece")*
  — **All playback is scheduled with Web MIDI timestamps and a 100 ms lookahead.** Plain notes, curve grains and KS notes
  (`tickCurvePlayback`) follow the zone tick's pattern; stop clears the queue. *Why:* the frame-polled path started every
  note on the next animation frame — a 0–17 ms wobble per note, audible on trills and the runs' tails. *Rejected:* keeping the
  frame path for the strikes (the same wobble, smaller). RUNNING_LOG §102–103.
- **D20** *(2026-09-05, composer, CN-20 / CN-22 / CN-26 / CN-27)* — **The trill object and its rules.** A zone with the trill
  embedded as a MIDI snippet, regenerated from its curve at every play start; the second pitch the upper whole step by default,
  the interval auditioned by chips before it is taken; the attack = the first note with its own articulation, length and
  velocity (the notation will say fp or sfz); eat by rule — a note of that player starting under the trill is silent and
  faint, M gives it back, delete restores; the reference curve live (`auto · A · B · C · lane · flat`), bake freezes a copy;
  `1 2 3` on the zone, the sampled curve drawn in it, the panel on P only; overlapping trills warn; a dragged trill keeps
  its pitch; the drawer skips a trilling player at insert. *Rejected:* the panel on selection (too many controls in view); a
  re-deal around busy players (needs the target time at deal time). RUNNING_LOG §104, §108–109.
- **D21** *(2026-09-05, composer, CN-23 → CN-25: "just click to add a point … it fills the curve … hold a line and drag …
  like Logic Pro")* — **The curve windows: points → fill → shape.** META stays the gestures' window, out of the curve path;
  three curve windows A / B / C float exactly over Violin 2, Viola and Cello, translucent, click-through; `✒ Points` places dots
  (a click inside a curve joins it at once; beyond an end the selected curve grows; a far click waits for `Fill`, which
  makes a new curve), dots always visible, drag to move, double-click or ALT-click removes (ends shrink the curve; one dot
  left collapses the line); hold the line and drag up / down to bend it — the line passes through the mouse where held; lines
  only, several curves per window. *Why:* piece #2's object was "too many controls" and its slope wheel "too sensitive"; the
  first phase-2 form (trace-fit + control diamonds) had a diamond that did nothing on plain curves. *Rejected:* the freehand
  trace on the curve windows; diamonds, the wheel, slope dials; a lane-header curve selector. RUNNING_LOG §106–107, §110.


- **D22** *(2026-09-06, composer, CN-29: "institute a process where we're taking notes in a central document that will inform the eventual revision")*
  — **The morph notes.** Every remark about the morph tool goes into `docs/MORPH_NOTES.md` the moment it is said, dated, verbatim, the
  AI's reading marked; the tool is adjusted for the current use now and revised into an all-purpose tool after this piece or the
  next. A standing practice in CLAUDE.md. *Why:* the morph textures will carry this piece's section 2 and the next piece; without a
  memory of what was awkward, the revision would start from nothing. *Rejected:* notes in the lab journal only (scattered across
  entries), a rewrite now (the composer: "for now … adjust it for the current use").
- **D23** *(2026-09-06, composer: "the curve has a different translation to the graphic notation than it does to the MIDI … I have to tweak
  the MIDI a bit … sixty five for the lowest point … it represents three p's in the notation")* — **The curve's two translations.** A
  curve's height IS the dynamic for the notation and the IR (0 = ppp, 1 = fff, the eight marks at equal steps; the IR carries each
  curve-driven object's range as names, e.g. "p → f", so the page may later be redrawn at full height with the range named —
  a per-event choice at the notation stage). Velocity 65 → 127 in the ensemble's one scale — the violins' — is the playback
  rendering of the same height, translated per instrument and register through the measured remap (with a CC7 trim on the stepped
  samplers); one curve drives a trill's speed and its loudness. NAMING §2.9, TRILLS_TOOL §10, NOTATION_WORKFLOW §7. *Why:* the
  rendering must never leak into the notation (M3); the MIDI has to be tweaked to sound right and the page must not inherit the
  tweak. *Rejected:* a named dynamics table as the scale (p = 49 …) — he moved to a measured velocity floor; velocities read as
  dynamics by the extractor (the tuba piece's velocity band — kept for the strikes only, whose velocities are as played).

---

## §5 Playbooks

- **Sound research (mapping a sample library):** piece #3's journal §5.1 — the escalation
  ladder (manual → forums → transcripts → frame analysis → hands-on probes → hacks) and the
  CC/control probe protocol with scope tags (`engine` / `group` / `patch`). Reuse as written.
- **Composer-score save files:** #4's `docs/SAVE_FILES.md` + `NAMING.md` (piece menu,
  working copies, "Save as next", variants, restore). Reuse as written once 0b lands.

---

**Verifying the composer app from the AI's browser pane (2026-09-03):** the composer runs
`node score\server.js` himself — open http://localhost:5300/composer.html with `preview_start
{url}`, never start a second server on 5300. Before any test that mutates objects: set
`Composer.sessionName = 'untitled'` (autosave skips it), clear `autoSaveTimer`, and remove the
test objects after; reload the page at the end. The pane has no Web MIDI (Hear must fail with a
status line, not an exception) and `requestAnimationFrame` never fires while it is hidden.

---

**Working the rack through the bridge (2026-09-04):** `node tools/reaper_job.js heartbeat` first
(alive? which project?). Read before writing (`tracks`, `chunk`). Write, then read back in the
same job. Prove routing with `jobs/peakwatch.lua` + a probe note (`probes/port_note_probe.ps1`),
never by ear over CRD. Sampler internals: UVI by `tools/uvi_state.js` (decode → edit → `--push`
→ read back; the output token is `$Engine/Out n`); Kontakt by a Lua script the composer drops on
the rack (`reaper/kontakt/*.lua`, a JSON read-back in `reaper/kontakt/out/`). After editing
`bridge.lua`: `node tools/reaper_job.js reload`. The composer's CTRL+S is the truth; the bridge
never saves unasked. Gotchas: the Bash tool rewrites `\n` and `\b` inside heredocs — put
patches in a script file; the AI's browser pane has no Web MIDI and never fires rAF while hidden.

**The AI's browser-pane harness, gotchas (2026-09-05, RUNNING_LOG §103, §107, §109):** a hidden or background tab pauses
`requestAnimationFrame` and throttles timers to about once a second — drive the app's ticks synchronously with simulated
time, never with `setInterval`; the pane's `getBoundingClientRect` can return collapsed rectangles while `offsetTop` /
`offsetHeight` are right — measure geometry by offsets and confirm by screenshot; `MouseEvent` client coordinates are
integers; a synthetic keydown must be dispatched on an Element (the handlers call `e.target.matches`); the console log keeps
entries across reloads — an old error can outlive its fix, so parse every loaded script inside the page (`new Function`)
before believing it; Web MIDI is denied — a fake output object records what the ticks would send. Bash calls over ~8 KB are
cut mid-way — write patch scripts to the scratchpad, splice by exact anchor, and `node --check` every inline block.

---

## §6 Done

- 2026-09-03 — **0a** PM kit installed (journal, plan, planner, lab journal, sketch pad,
  methodology, protocol, hygiene, commands, gitignore, CLAUDE.md, README).
- 2026-09-03 — **0b** composer module ported from piece #4 and verified live: score app
  :5300 (seven instrument-keyed lanes + META), sandbox :4800, bank skeletons, the
  seven-instrument recipe skeleton (RUNNING_LOG §9).
- 2026-09-03 — **0g** the notation/IR stack ported byte-exact (97 files) and proven whole
  (RUNNING_LOG §12); **0i** the S1 → IR contract proven on a septet save, NAMING.md §2 (§13).
- 2026-09-03 — **0e** the rack: eight loopMIDI ports, `reaper/septet_rack.rpp`, every preset
  menu rostered with ranges in `sandbox/instruments.js`, "rack works" from the composer app (§35).
- 2026-09-03 — **1c.1** the scattered-strike database (`tools/strike_db.js`,
  `bank/scattered_strikes.json`, §36); **1c.2** the STRIKES drawer built and verified in the
  running app (§39) — `built`, awaiting the composer's listening pass.
- 2026-09-04 — **1c.2 U1–U4** the drawer's first feature update, verified (§64); the drawer full
  height + tab (§40).
- 2026-09-04 — **0j** the ensemble balance measured and applied (D13, D14; §41–47, §60–61);
  `bank/balance.json`, `bank/balance_fl_bcl.json`.
- 2026-09-04 — **0k.1–0k.4 + the foundation of 0k.5** the Reaper bridge, UVI as XML, Kontakt as
  Lua, the two strike lanes, `reaper/bridge/README.md` (D15; §48–63).

- 2026-09-04 — **the first piece file:** `scores/piece-septet.json` (+ `piece-septet-v1.1`), the
  three orchestrated strikes from the drawer, the raw piano chords removed (CN-8, RUNNING_LOG §69);
  **1b** the save system rebuilt as one rule (D17, §67–68); **1c.2** the drawer's takes in the repo
  (O v2, §65–66) and `Insert @ original time` (Q v2, §68).
- 2026-09-05 — **1c.2 U5–U13b** the drawer's second feature update (the gap law, the accel run with the round robin,
  re-deal; §73–92); **the piece to #31** (72 s) as accelerating runs.
- 2026-09-05 — **1e phases 0–3** the trill module: the timing table from the composer's own playing (D18, §100–101), the
  scheduled playback (D19, §102–103), the trill object with the interval audition, the attack note and the eating rule (D20,
  §104, §109), the curve windows A / B / C with points → fill → shape (D21, §105–107, §110); **1a** the curve drawing.

---

## §7 Human Notes

*(The composer's own to-dos and reminders. Reviewed at every session end.)*

**Active:**
- Decide piccolo vs bass flute when the music asks (Q1); confirm that library is installed.
- **Test the trills and the curve windows on the piece** (reload): T on a strike note · `1 2 3` on the zone · P for the
  attack and the interval · `A B C`, `✒ Points`, `Fill`, hold the line to bend · SHIFT-drag a span, T. Say what bites; then
  phases 4–5 or the chain from #32 or the 0d window.
- **Move notes in the scattered strikes; the range walk** — *(composer, 2026-09-06, verbatim: "Some to do reminders for me.
  Move notes in scattered strikes. Shift them so they are more playable, and the range walk.")* — the strikes' notes shifted
  for playability; **"the range walk"** in his words, its meaning to be confirmed with him *(AI reading: either the 0d sweep of
  each technique's sampled range, or a passage that walks each instrument's range)*.
- **Normalized trill loudness** — *(composer, 2026-09-06, verbatim: "Another to do normalized trill loudness.")* — *(AI reading: the
  trill's velocities are his played ones, 41–123 by speed (RUNNING_LOG §100); a loudness normalization — a level knob or a target
  per instrument — for the trill module, phase 4b or 5, on his word)*.
- *(AI-added, the composer's standing reminder from the rack session:)* **check each instrument
  plugin's gain** (unity; preset FX such as the maximizer / tilt bypassed) whenever a Kontakt or
  UVI instrument is loaded or its preset changed — SAMPLER_QUIRKS.md has the rule.

- **Next piece (after the septet): the "Lake George" piece** — pairs: english horn/bassoon,
  horn/trumpet, cello/bass, + percussion; start with a morph section (composer, 2026-09-04;
  verbatim in COMPOSITION_NOTES). **Animated conductions** for its delicate, quiet material —
  a pinch → lift → open hand gesture, to be captured from video and re-animated in the score
  (composer, 2026-09-04 session 3; verbatim in COMPOSITION_NOTES).

**Completed:**
- ~~Penn State abstract (tuba repo), due Fri 4 Sept~~ — done (composer, 2026-09-04).
- ~~Test the STRIKES drawer with U1–U4~~ — done (composer, 2026-09-04); the drawer has been composing the piece since.
