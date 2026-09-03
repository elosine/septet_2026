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

**Last session:** *2026-09-03 (session 1, Claude Code / Fable 5.1)* — **Project opened; the
port planned; the kit installed.**
- Read the call; surveyed all four music repos + `live-electronics-engine`; map → §1.
- Composer fixed the delivery format (animated score, as the tuba piece) and the three
  phases (compose → notate → performance), with the presentation score as 2b (D2, D3).
- Lab-journal habit adopted from `live-electronics-engine` → `RUNNING_LOG.md` (D4);
  sketch pad opened → `COMPOSITION_NOTES.md` with the first idea (the opening).
- Port plan written to `PLAN.md` §0 (0b–0h) with the bites-later items named; no code
  ported yet — **awaits the composer's go on the plan.**

*Same session, later:* the composer answered the four questions (RUNNING_LOG §8): strings =
**Xsample** (D7) · push after every commit (D8) · no electronics, the live-electronics repo
is for its journaling practice only · flute: piccolo vs bass flute undecided, same track,
adjust when chosen. **The IR contract stated as D9** — S1 (the composer save) is the ground
truth, the IR is derived from it and is the single source for every downstream score.

*Same session, act three — **PLAN 0b DONE** (composer: "go on 0b"):* the composer score
app and sandbox ported, re-paletted to seven instrument-keyed tracks, and **verified in the
running app** (36/36 routes, save/version/load round trip, zero console errors, four
panels, UI save on disk — RUNNING_LOG §9). Two defects found only by running (the literal
eleven-lane table; the server dying on a missing-file stream), both fixed. Range-aware
lane assignment added (`laneCanPlay`). `sandbox/instruments.js` is the seven-instrument
skeleton, every channel/range provisional until 0e/0c. Apps: `node score/server.js` →
http://localhost:5300/composer.html · `node sandbox/serve.js` → http://localhost:4800.

*Same session, act four — after the checkpoint clear, on Fable (composer: "stay with fable
for now"): **PLAN 0g DONE.*** The notation/IR stack — engine, registry, schema, glyph
pipeline, extractor, validator, print + video exporters, 13 test batteries, fixtures, print
skeleton, resvg — copied byte-exact from #4 (97 files, `cmp` 97/97) and **proven whole in
this repo**: 11 batteries GREEN against the tuba goldens staged temporarily (not stored
here; `notation/ir/README.md` has the recipe), 4 RED for reasons in the septet's own tables
or the source's own stale snapshot, none in the copied code; `notate_section` →
`ir_validate` ran end to end on a tuba window (107 events, 15 chunks, VALID);
`export_print` wrote a 2-page PDF through Chrome headless; `export_video --probe`
rasterized a frame through resvg; 22/22 notation routes 200 on the running server and the
app loads (it shows "IR fetch 404" until a septet page exists — the pre-2a state).
RUNNING_LOG §12.

**Next up:** **0i** (prove a septet save extracts to IR — the first known bite is
`classify.js` treating layer 10 as META; ours is layer 7); **0e** loopMIDI + Reaper rack
with the composer; **0c** recipes; **0d** CC7 nailed; **0h** gate → compose.

**NEXT STEPS · MODEL · CLEAR:**
1. ☑ 0b wrapped, checkpoint, clear; resumed on Fable (the composer's choice over the
   planned Opus: "stay with fable for now").
2. ☑ **0g** — the stack is here and proven whole (RUNNING_LOG §12). ► **0i now, same
   session**: a 30-s septet test save (through the app's own save path) →
   `node tools/notate_section.js --score <name> --w0 0 --w1 30 --id 0i-test` →
   `node tools/ir_validate.js notation/ir/0i-test.ir.json --against-source --complete`
   (the validator takes a PATH); read what fails; fix the S1 side now (D9 §5); file the
   classifier / registry work under 2a.
3. **0e with the composer at Reaper** (any model, conversation): loopMIDI ports `Flute`
   (+`Fluteb`), `BassCl`, `Piano`, `Vn1`, `Vn2`, `Va`, `Vc`; one Reaper track per port,
   monitoring ON; rack committed; the app's Web MIDI port list checked on Chrome.
4. **0c recipes on Opus** from the rack as built (UVI slot order = ground truth).
5. **0d on Fable + the composer's ear**: CC7 → dB on one Xsample string preset and the bass
   clarinet with `probes/cc7_calibration_probe.ps1`; state rule; the dynamics recipe.

**Open at session end** *(mid-session checkpoint, 2026-09-03, Fable — written for an AI
that has never seen this conversation):*
- **Task and state:** phase 0 setup. 0a, 0b and 0g are CLOSED and pushed. Nothing is
  half-built. The composer score app and sandbox run (RUNNING_LOG §9); the notation stack
  is in the repo and its batteries pass on staged tuba goldens (§12); `scores/septet.json`
  is the committed day-one stub (§10).
- **Latest deliverable:** the notation/IR stack — `notation/`, the notation `tools/`,
  `print/`, `package.json` (resvg + pngjs) — plus the composer module from 0b. Apps:
  http://localhost:5300/composer.html · http://localhost:5300/notation/app/notation.html ·
  http://localhost:4800 (`.claude/launch.json`: `score`, `sandbox`).
- **Next concrete step (PLAN 0i), as an instruction:** (1) read `notation/lib/classify.js`
  and the header of `notation/lib/extract_core.js` for what the classifier expects of an S1
  object (layer convention, `technique`, `groupId`, `sonifyNote`, `startSeconds` /
  `endSeconds`, `nodes`) — known bite: `layer === 10` is META there, ours is layer 7.
  (2) Make a 30-second test save with a handful of notes on three lanes THROUGH THE
  RUNNING APP's own save path (so the file is what the app writes; by hand from
  `scores/septet.json` only as a fallback, with the app's object shape). (3) Run
  `node tools/notate_section.js --score <name> --w0 0 --w1 30 --id 0i-test --label "0i test"`,
  then `node tools/ir_validate.js notation/ir/0i-test.ir.json --against-source --complete`
  (the validator takes a PATH, not an id). (4) Read what fails; fix the S1 side now (the
  D9 §5 list: technique key on every sounding object, instrument-in-hand, stable ids, one
  layer convention, sounding-length rule, group ids); file classifier / class-registry work
  under PLAN 2a. Journal every number as you go (RUNNING_LOG §13).
- **Resume reads:** journal §4 **D9** · `RUNNING_LOG.md` **§12** · `docs/PLAN.md` **0i** ·
  `notation/ir/README.md`.
- **Pending the composer:** piccolo vs bass flute (CN-2) — not blocking. 0e needs the
  composer at Reaper; do not attempt it alone.
- **Deliberately uncommitted:** nothing after the 0g commit.

**Open questions:**
- **Q1 flute doubling instrument:** piccolo or bass flute — composer undecided; SI2 flute
  in C is the track's instrument until then; the switch recipe is added when chosen.
  Library for the chosen instrument to confirm then (SI2 has neither).
- **Q5 print format:** #4's tabloid is 432 mm long, past A3's 420 mm. Plan for A3 landscape.
- *(Q2 strings → D7 · Q3 electronics → none in this piece · Q4 push → D8. Closed.)*

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

---

## §5 Playbooks

- **Sound research (mapping a sample library):** piece #3's journal §5.1 — the escalation
  ladder (manual → forums → transcripts → frame analysis → hands-on probes → hacks) and the
  CC/control probe protocol with scope tags (`engine` / `group` / `patch`). Reuse as written.
- **Composer-score save files:** #4's `docs/SAVE_FILES.md` + `NAMING.md` (piece menu,
  working copies, "Save as next", variants, restore). Reuse as written once 0b lands.

---

## §6 Done

- 2026-09-03 — **0a** PM kit installed (journal, plan, planner, lab journal, sketch pad,
  methodology, protocol, hygiene, commands, gitignore, CLAUDE.md, README).
- 2026-09-03 — **0b** composer module ported from piece #4 and verified live: score app
  :5300 (seven instrument-keyed lanes + META), sandbox :4800, bank skeletons, the
  seven-instrument recipe skeleton (RUNNING_LOG §9).

---

## §7 Human Notes

*(The composer's own to-dos and reminders. Reviewed at every session end.)*

**Active:**
- Penn State abstract (tuba repo): host as a doc + submit the form by **Fri 4 Sept, 11:59 pm ET**.
- Decide piccolo vs bass flute when the music asks (Q1); confirm that library is installed.

**Completed:**
