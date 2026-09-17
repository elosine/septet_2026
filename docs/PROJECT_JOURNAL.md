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

**FIRST — HIS STANDING RULE (2026-09-11):** after `/clear` + `/postclear`: play back, then **STOP and ask**. No edits, no builds,
no tool calls beyond the resume reads. Start only on his word. *(At `/session-start`: orient, agree the agenda, then work.)*

### CHECKPOINT — 2026-09-17 (session 15, Opus 5) — NEXT: N2 THE PRINT SCORE (PLAN 2b), FABLE PLANS *(mid-session checkpoint)*

**His word:** *"lets move to print score next, prep for clear"*.

**Session 15 in one line:** N1 the performance instructions drafted end to end and copy-edited (his seven "good"s, RUNNING_LOG §603–§604) ·
N0 the Bloom practice videos built, his "videos good", online, linked from the page, archived (`notation/video/approved/2026-09-17-bloom-practice/`,
§595–§602). PLAN 2h.7 done.

**The task now: PLAN 2b the presentation score — not started.** Known going in (from the record, not re-derived):
- `tools/export_print.js` still lays out as the tuba did: on piece-septet it drew SIX systems, no piano, no part labels (PLAN 2b "FOUND", §552;
  NITS "FOR PLAN 2b"). The model to port is the video exporter's septet frame (§558): the realized ensemble (`video-jury` — the bass clarinet in C),
  the techniques registry, lanes weighted by the ensemble, the piano's grand staff, the labels.
- His order (§515): the demo video ✓ → the performance instructions ✓ (drafted; open items below) → **the print score**.
- The Tempus copy carries the demo video's link at the top — https://youtu.be/x8EZ3B1EvbE (the call takes a print score only).
- The cover needs the title and the ensemble line (item 1 below). Where the instructions page goes in the print — open.
- A3 landscape; format entry + cover + performance notes as in #4; **deadline 2026-10-15**.

**► PLANNED 2026-09-17 (Fable, RUNNING_LOG §606)** — his word: *"no need for the full planning protocol, lets just gather necessary data, resolve
any issues and make plan"*. The plan is in PLAN 2b: top line **1 ⚠ the septet frame · 2 the paper (A3, marks) · 3 the proof pages, his eye ·
4 the front matter · 5 the full render, his eye · 6 archive + docs.** Measured: tabloid is 12 mm over A3 (the call refuses it) · 57 pages at the
video's density · the instructions need TWO pages (three columns of content, clipped silently today) · #4's PDF was 4 MB · no anonymity asked.

**► BUILT 2026-09-17 (Opus, §608): 2b.1 the septet frame · 2b.2 A3 · 2b.3's proof pages rendered.** `Coords.ensembleFrame` is shared by both
exporters (the video's seven dumped pages byte-identical before/after); `tools/check_print_frame.js` PASSES at four moments — eight systems, the
seven labels, two brackets, one brace, census identical. A3 is drawn 419.7 × 296.8 mm so the MediaBox lands INSIDE the call's ceiling. Staff
7.55 mm, 63 pages at the film's density.

**Also built 2026-09-17 (§609): 2b.4 the front matter.** His density pick: **10.3, the film's own — 63 pages, staff 7.55 mm.** The A3 cover is drawn
in #4's house style (`print/cover/make_cover_septet.ps1` → `cover-septet-a3-landscape.svg`, title 73.5 pt); the instructions print as TWO pages, broken
at "Acoustic Beating", each about three quarters full; the four video links are clickable annotations. `tools/check_print_front.js` PASSES and is
proven to fail on an overflowing split.

**Next concrete step: HIS EYE on two PDFs in `print/score/`** — `PROOF-A3-frame.pdf` (4 pages of music, one per section) and
`PROOF-front-matter.pdf` (cover · instructions ×2 · one music page). His notes → fixed in one pass (2j's way) → **2b.5 the full render**
(2b.5.1 rebuild the IR first, 2b.5.2 rewrite `print/score/build.sh` for the septet) → 2b.6 archive + docs.

**Answered 2026-09-17 (D58, §607):** A **yes** — *Scattered Substance*, "for flute, bass clarinet, piano and string quartet" · B **no section
marks** · C **a** — one PDF, the instructions page's demo link is enough, no Tempus copy. **Open with him:** the time ruler (he asked what it
is; keep it or not is his word) · **his standing word for this build: "check in before moving on"** — the builder starts only on his go.

**Resume reads:** `docs/PLAN.md` — the 2b item whole (search `- **2b — Presentation score**`, ~60 lines) · `docs/RUNNING_LOG.md` §608 (what the
build did and what was measured). Nothing else.

**Model:** **Opus builds** (a written plan) · Fable only if a proof page raises a judgment call.

**Standing warning added 2026-09-17:** `tools/export_print.js` and `tools/export_video.js` now share `Coords.ensembleFrame` — a change to the frame
math moves BOTH, so re-run `node tools/check_print_frame.js` and dump two video pages against a baseline before believing it.

**Decisions pending the composer** *(carried from N1; only item 1 touches 2b)*:
1. ~~The title and the ensemble line~~ — **CONFIRMED 2026-09-17 (D58):** *Scattered Substance* · "for flute, bass clarinet, piano and string quartet".
2. The score-in-C line — his "The full score is in C." stands unless he picks another (§591).
3. Three fact flags left as written on the page (§569): the crescendo's "dynamic 1 to dynamic 2" vs the image's ppp → fff · Spectral "Performers …
   glissando" (the flute and bass clarinet hold) · "two curves for each performer" (the piano has none).
4. Tuba text on the page he has not reviewed: the intro paragraph · the Conduction Tools' first two paragraphs · the Crescendos paragraph.
5. AI calls he may undo: the practice-video links in the chart's row order · Bass Clarinet + Cello's held dyad take 6 over take 4 (§600).

**Deliberately uncommitted** (`git status --short`) — **his, per D40, never staged by the AI:**
- `scores/piece-septet.json` (M) — his Save of 09-17 11:04, metadata only (§598: the objects equal `bc54cdc`)
- `reaper/septet_rack.rpp` (M) · `bank/panel_snapshots.json` (M) — his rack, his panel
- `bank/passages/` 4materials · accentedcres01 · accentedcres01-2 · chordcyc01 · chstr02 · section3 (untracked)
- `scores/` Sec3 · SeptetSec03-Materials-B · -C · -D · piece-septet-v1.31 · -v1.32 · -v1.33 · spectralMorph (untracked)
- two AI copies, deletable at his call: `scores/zz-ai-run-nosecco.json` · `scores/zz-ai-1t-walk.json`
- unsaved working copies (`node tools/unsaved_check.js`, unchanged): cres-run01 · cres2strike · piano-harmonics-test · trill-curve-test ·
  trillBuildTst · zz-ai-1t-walk

**Gitignored, left on disk on purpose:** the practice videos' archived mp4s (his to back up) · their duplicates and scratch in
`notation/video/renders/demos/` (deletable) · `notation/audio/demo-bloom-*.wav` and `raw/demo-bloom-*` — **keep
`raw/demo-bloom-heldmax-float.wav`**, the picks belong to that render · `reaper/demo-bloom-*_render.rpp`.
**Running:** his :5300 and Reaper; the AI's Browser pane has one tab on the instructions page. Nothing of the AI's running.

### PARKED — 2026-09-17 (session 15) — N1 THE PERFORMANCE INSTRUCTIONS: DRAFTED, COPY-EDITED *(parked at his move to the print score; its open items are carried in the checkpoint above — kept for the page's section table)*

**Sessions 14–15 in one line:** the tuba's instructions page copied (nouns only), then revised section by section to his dictation; every image is
now this piece's; the morph sequence chart built; the legend and instrumentation drafted at his request and trimmed to his notes (RUNNING_LOG §565–§593).

**The deliverable:** `docs/notation_instructions/index.html` (+ `styles.css`, `images/`), served by his :5300 at
http://localhost:5300/docs/notation_instructions/index.html.

**HIS RULE FOR THIS PAGE (§569, standing):** the prose is HIS. The AI swaps images, changes nouns, and inserts what he dictates VERBATIM
(logged verbatim in RUNNING_LOG). Where a fact has moved it SAYS so in chat and leaves the sentence. Draft or offer wording only when he asks.

| section (page order) | text | images |
|---|---|---|
| title + subtitle | *Scattered Substance*, "for flute, bass clarinet, piano and string quartet" — both still his to confirm (CN-64) | — |
| Demo Recording with Score Following Video | the link alone, 1.3 em — https://youtu.be/x8EZ3B1EvbE (no Tempus mention, his word) | — |
| intro paragraph | the tuba's ("computer-animated score, served from the cloud …"), not yet reviewed by him | — |
| Instrumentation | the seven instruments (AI draft; no doublings — Q1 piccolo / bass flute open) · "Bass clarinet to low C." · "The full score is in C. Parts will be transposed." | — |
| Animated Conduction Tools | the tuba's + "go-time for events" (§590) + his example sentence (§568) | Vn1 Bartók pizz 20.5 s · Vn1 trill 140 s, the trill and its curve only (§592) |
| Gradient Curves → Crescendos · Trills | his intro (§575) · the crescendo paragraph = the tuba's · Trills: "The curves describe the trill intensity, both volume and speed." (§582) | Va surge 527 s · Bcl trill opening 129 s |
| Acoustic Beating | all his: the beating paragraph · the two sections + Bloom · Spectral's strategy · the Bloom demo paragraph (§593) · the Notation paragraph (§586). One placeholder line: "Bloom practice videos — to be added" | the morph sequence chart (§576–§580) · Va Bloom entry 182–189 s + Va 196–203 s, stacked (§588) |
| Notation Legend | the Ped. GLYPH inline "(with no release sign) — hold the pedal until the sound has died away or until the next note." · "Let ring slurs — …" · "sempre secco — continue secco for the crescendo gestures." · "Dynamics. In the first movement … In the third movement …" (§591) | the piano's let-ring slurs: a plucked note 212.8 s + an ordinary note 217.6 s, side by side |

**Tools:** `tools/capture_lane.js` (`--part fl|bcl|pno|vn1|vn2|va|vc --t --span --padBot --onlyOnsets a-b --out`; each image's command sits in an HTML
comment beside it) · `tools/gen_morph_chart.js` (the chart) · `tools/gen_m2_chart.js` (superseded arrows figure, kept, not on the page).

*(Its next-step, resume-reads and model lines are retired — N1 parked 2026-09-17; the open items live in the checkpoint above.)*

**Deliberately uncommitted at this checkpoint:** his files only, unchanged from session 13's list below (D40) · the six unsaved working copies unchanged
(`node tools/unsaved_check.js`) · no AI copies added.

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md. Keep current.)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| ~~N0~~ | ~~the Bloom practice videos (PLAN 2h.7)~~ — **DONE 2026-09-17** (§602: "videos good", online, linked, archived) | — | — |
| N1 | the performance instructions — PARKED: drafted and copy-edited; the pending items 2–5 in the checkpoint above, at his convenience | Opus | no |
| **N2** | **► PLAN 2b the print score — PLANNED (§606); build 2b.1 the septet frame → 2b.2 A3 + marks → 2b.3 four proof pages, his eye** · then 2b.4 front matter (cover waits on CN-64) · 2b.5 full render, his eye · 2b.6 archive | **Opus builds** | **switch to Opus now; no clear needed (the session is short) — clear after 2b.3's proof pages** |
| **N3** | Later, noted: the performance score carries D50 (PLAN 3's acceptance line) · its own pitch form (D55) | — | — |
| **N4** | Still his, from before: the chain and crescendo runs by ear (§420–§426) · CN-67 in the app · the 15 geometry touches + the Vn1 spill (§401n) · the drawer verdicts (STRIKES_TOOL §AG) · the pinned player (§AF2) · the rhythm drawer remodel (§AE) · SWEEP #4 · #10 · #11 · #12 | Fable to hear · Opus to fix | no |

### SESSION END — 2026-09-16 (session 13, Fable 5.1 ⇄ Opus 5) — SITTING F DONE: the audio re-render and the demo video, approved, archived as the submission copy, online

**Last session (13, 2026-09-16):**
- **Fable** — PLAN 2i.8 the crescendo run's 78 swells as the surge (D54, his eye "good") · PLAN 2j the proofing pass: eight notes collected, fixed
  in one pass, his "all good" (D56: no group of three) · PLAN 2k the pitch form per realization — the presentation's bass clarinet in C (D55).
- **Opus — 2i.9 the audio re-render** (RUNNING_LOG §553–§555): capture → checked export → Reaper; two of the AI's tool bugs found and fixed on the
  way (export check (e) assumed a 199 c bend range — the Xsample parts bend ~1 st; the bridge guard's heartbeat race). 630.100 s, −1.0 dBTP,
  −21.8 LUFS float. **His ear: "render good".**
- **Opus — 2i.10 the demo video** (§556–§564): the exporter draws the septet frame (pages identical to his page but the bcl's C clef, by design) ·
  close-ups as GROUPS at 1.85× (D57) · `make_cut.js` on the septet's sections, **seed 53** his pick · cross 5, his "clips look good" · the
  picture holds through the audio tail · PHASE 5 checks. **His eye: "video good"** → `notation/video/approved/2026-09-16-submission/` ·
  **online https://youtu.be/x8EZ3B1EvbE**.
- Discussed, not decided: the cover's ensemble line — the AI recommended *"for flute, bass clarinet, piano and string quartet"* (§564).

**Open at session end:**
- **`V-CUT.mp4` is not in git** (`notation/video/**/*.mp4` ignored) — the approved copy and `notation/video/renders/piece-septet-V-CUT-seed53.mp4`
  (the same bytes, 51 MiB each) live on this machine only; the YouTube upload is the other copy. His to back up; the renders/ duplicate is deletable.
- The render and the video are snapshots of the save of 16:03 (`bc54cdc`): a later Save means a re-render (RENDER.md §1) and a video re-render
  (the command is in the archive README, ~15 min).

**Decisions pending the composer:** the title *Scattered Substance* (CN-64) and the cover's ensemble line — before 2b's cover. **AI calls he
may overturn:** the close-ups as groups at 1.85× (D57) · the ppp velocity 9 (§550) · print borrowing the `video-jury` realization (§552).

**Open questions:** does "the same crescendo in several parts" mean both players on every onset (§413, his word first) · the piano's device in
the morphs (2h.5). **Blockers:** none.

**Deliberately uncommitted — all his:** `bank/panel_snapshots.json` · `reaper/septet_rack.rpp` · `bank/passages/` 4materials · accentedcres01 ·
accentedcres01-2 · chordcyc01 · chstr02 · section3 · `scores/` Sec3 · SeptetSec03-Materials-B · -C · -D · piece-septet-v1.31 · -v1.32 · -v1.33
· spectralMorph · plus two AI copies, deletable at his call: `scores/zz-ai-run-nosecco.json` · `scores/zz-ai-1t-walk.json`. **Unsaved working
copies** (`node tools/unsaved_check.js`, unchanged since checkpoint #2; piece-septet clean): cres-run01 · cres2strike · piano-harmonics-test ·
trill-curve-test · trillBuildTst · zz-ai-1t-walk. **Running:** nothing of the AI's (his :5300 and Reaper; the Browser pane closed).

**Standing warnings:** ⚠ **CTRL+SHIFT+R detaches the ♪ render** — click it again (§460); an IR rebuild does not, **but a change to
`notation/lib/*.js` needs a page reload** · ⚠ **do not press R on the strikes page** (§403) · **one open composer tab per score** (2d.5.8) ·
the piano never swells (CN-34) · the MAIN IR is 5.2 MB and the page re-fetches it every second (NITS).

**Tests:** `tools/test_morph_notation.js` (178) · `test_cross_staff.js` (79) · `test_surge_run.js` (30) · `test_step_dynamics.js --save` (15) ·
`test_septet_notation.js` (101) · `test_trills.js` (92) · `test_identity.js` (20) · `score/tools/check_cresc_panel.js` (35) ·
`morph_septet_check.js` · `trill_conflicts.js --list` (3, accepted) · check_fill · check_containers · check_cresc_deck · the tuba battery per
`notation/ir/README.md`. **The video:** `export_video.js --probe/--half/--dumpPage` + the archive README's PHASE 5 measures.

**Earlier sessions, one line each:** **12** (2026-09-14) PLAN 2i sittings A–E2: go-to-time, D53, the save edits, the cross-staff groups,
`--max16`, section 3's dynamics; step 8 designed (D54) — §515–§530. **11** (2026-09-14) the morph section notated — D44–D50; section 3
planned (D51, D52) — §464–§514. **10** (2026-09-13) trills notated (D41, D42); the first recording (§453); D43; section 1 complete —
§427–§463. **9** (2026-09-12) PLAN 1t the chain; the first full draft tagged `Scattered_Substance-finalDraft_1.0` — §405–§426. **8**
(2026-09-10 → 11) SWEEP_LIST · 2a + 2d · section 1's strikes notated — §352–§404. **7** the strikes drawer revised (§324–351). **6** the
morph's fade in CC7, the note card (§311–323). **4** BEATING, the morph panel, the crescendo suite, D11 (§111–310). **3** the piece to #31,
the trill module 0–3, D18–D21 (§65–110). **2** the strikes drawer and the sandbox. **1** the port.

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
12. **Measure the layer that reaches the INSTRUMENT, not the layer you built** (2026-09-09,
    §314 and §316). Three rounds were spent tuning a fade whose level curve was correct all
    along: the fault was first in the velocities the emitter chose and then in the CC7 the
    score's held-note law produces, and both were invisible while the measurement stopped at
    the engine's own output. Print the MIDI.
13. **Never queue what cannot be un-queued** (2026-09-09, §320 — and it hung his rack).
    Timestamped scheduling needs a BOUND as much as it needs timestamps: hold at most a
    fraction of a second in the driver and refill from a timer, so a stop is always within
    that fraction of silence. **`MIDIOutput.clear()` is in the Web MIDI spec and Chrome does
    not implement it** — the prototype carries `send` and `constructor`. A capability check is
    only defensive once you have looked at which way it falls.
14. **Where a note is STARTED by one piece of routing, it must be STOPPED by the same one**
    (2026-09-09, §323). A held note was closed on the technique's channel while it had been
    opened on a D11 curve channel — and, for the flute, on another port. Two copies of a
    routing rule drift, and the symptom is always a hung note. One function decides where a
    note goes; everything that touches that note calls it.
15. **Write the assertion after the number, never before it** (2026-09-09, §314 and §317).
    Four checks in two days failed on their first run because they were written to the story
    being told rather than to what had been measured — twice quoting a figure from a different
    instrument. Measure, then assert.
16. **Build on a `zz-ai-` copy from the FIRST command, not the second** (2026-09-09, §321).
    A verification run started against `piece-septet` itself; the objects were removed inside
    the minute and the work file checked clean on disk, but the rule exists precisely so that
    never depends on noticing.

---

17. **The notehead's left edge is the moment; the go line marks displacement** (2026-09-14, D49,
    RUNNING_LOG §496 — piece #4's D59/D58 promoted here at the composer's word). A head is placed
    off its time only for a reason (a GC disc to clear, a trill's after-go unit) and then, and
    only then, carries a go line. Before drawing any new device, ask: is the head on its time? If
    not, why — and does the go line say so?

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
- **D24** *(2026-09-06, composer, the PLAN 1f requirements talk — RUNNING_LOG §146–160; CN-28, CN-29, CN-33, CN-34)* — **The
  beating: the object, the panel, the axis, the piano, the chain, the breaths.** (1) **The object is a *beating*** ("beating is
  good"): one pair of players on one centre pitch, both bending around it by mirrored curves, the gap beating — **the pair is the
  unit**, scheduled and designed as one. *Why:* what is heard is the gap between two players; the tuba engine never had it (#4 day
  13, finding 3: "the pair is not the unit; the voice is" — the gap fell out of two independent staggers). *Rejected:* the voice as
  the unit with the pair emergent (the tuba's engine reused as it was). (2) **The panel of direct manipulation** — a row per pair,
  the two curves as mirror images, handles on rails, shapes from a menu, the space bar, a typed duration — over the shuffle drawer
  the AI first proposed (§146). *Why:* his picture, §147: "I can see the pair represented by some sort of curve … it'll be bipolar … I
  can slide one over … everything should have handles". *Parked, not rejected:* the shuffle as a writer into the same rows (item 8).
  (3) **The axis is beats per second** — the tool finds the cents per player from the pitch and the interval. *Why:* the register
  law (D28 of the tuba piece: a fixed cents doubles per octave) — a drawn height must mean the same beating on any pitch; "beat
  about twice a second" is an instruction, a cents value is not. *Rejected:* cents as the axis. (4) **The piano is out of the
  beating** (CN-34): six players, up to three pairs; the piano an anchor only. (5) **The beating is out of the strike chain**
  (§160: "it'll just be its own thing"): no mute rule, no eating, no exit at the next strike note, no overlap avoidance, no greying;
  the accents by hand. *Rejected:* the trill's chain (the mute rule, the eating, the default exit at the next strike note) that
  the AI's first proposal for insertion carried. (6) **The breath model** (§152): single events on one bow or breath; longer ones
  with the dotted go line at each breath, on sliders, a warning at the ceiling, *continuous* (re-bow at will) or *designated* (the
  marks placed), a seeded shuffle so he need not place each. The plan: PLAN 1f (eight steps), the document `docs/BEATING_TOOL.md`,
  the tool notes `docs/MORPH_NOTES.md` (D22).
- **D25** *(2026-09-07, the AI's build of PLAN 1f steps 1–7 at his word "run the plan independantly … I'll check in after the
  build" — RUNNING_LOG §167–174; his listening pending)* — **The build's own decisions, each verified in the running app.**
  (1) **The sampler's bend range is measured, not assumed** — the bend probe run in his rack: SI2 ±2.00 st, the five Xsample
  instruments ±0.96–0.99 (set to a semitone in Kontakt), RPN 0 ignored on all six (no range can be changed by MIDI), the residue real
  on all six; the player's limit is the smaller of his semitone and the sampler's (§168). *Rejected:* the tuba's 1.99 as a constant.
  (2) **The beating's notes travel as timestamped snippet events** — `_bend` events beside the notes and CC7, through the zone tick —
  not the plain-note tick's per-frame bend poll (D19's lesson, §103; §170). (3) **One truth in the panel:** a bound row's block IS
  the zone's (a live reference); edits regenerate the zone, debounced; no copy, no apply (§171). *Rejected:* an apply button.
  (4) **The drawn curve wins:** the row's *from / to / shape* until a handle moves; then the heard curve is breakpoints (§171).
  (5) **The mirror lock:** a locked drag edits the heard curve (half each); ALT-drag unlocks into two explicit curves; the body
  slide is the phase (§147's prediction proven: in phase a pulse, slid a plateau, both on one side a momentary unison). (6) **The
  breath deal keeps hand marks and re-deals the rest** (`keep`); the ceilings a default table for his ear (§169, §171). (7) **A
  pattern is a group with a META shape whose contour is the crescendo's mean**; a re-insert replaces only at the same time (the
  strikes drawer's §113 rule); the zones ride the existing group machinery (§173). (8) **The keyboard is drawn again in the panel,
  the drawer's picture** — not a call into the drawer, whose drawing is bound to its own DOM (§172). *Why all of these:* the plan's
  words, and every one proven on a copy of the piece by the decoded MIDI or real DOM events before it was called built.
- **D26** *(2026-09-07, composer: "a for the octive displacement" — RUNNING_LOG §199–200)* — **A morph pair folds as one unit.** When a
  player swapped into a pair cannot hold the pair's pitch, the pair moves by octaves together to the nearest octave both players hold —
  the unison kept, the beating as designed; no octave serving both → the line names the player who cannot, the pair silent until he
  swaps again. The beating drawer's rule (§180, D25) extended to the morph panel's pairs. *Why:* the beating is the material; an
  octave pair beats at twice the rate for the same cents and sounds thinner. *Rejected:* (b) only the player who cannot reach folds,
  the pair an octave apart — the register kept at the sound's expense.
- **D27** *(2026-09-07 late, composer: "What if I want to try several things? … be able to go back to the first try or the second try or
  the third try or back to nothing" → "build restore good"; RUNNING_LOG §215–216)* — **Restore returns.** A named version can be made the
  piece file again; the file as it stands is frozen first under the next label with `-before-restore`; the unsaved edits are dropped;
  the app reopens on the restored file. D17's one rule stands (working copy · Save · Name version · Reload); Restore is the way back to a
  chosen point that Reload (the last Save) cannot reach. *Why:* branching tries at the start of section 2 — every try a frozen version,
  any of them or the start recoverable. *Rejected:* the tuba's numbering chain that D17 removed (Restore comes back without it); the
  AI swapping files by hand at each branch (works, slow).

- **D28** *(2026-09-08, the crescendo suite's talk — CN-48 · CN-54 · CN-55 · CN-56; RUNNING_LOG §252–310)* — **A crescendo is an ordinary
  held note whose curve rises, and every crescendo tool writes that same object.** `waveCurve` + `sonifyNote`, two nodes carrying the
  dynamic range, one segment carrying the shape, `properties.cresc` carrying the provenance — so drag, stretch, delete, undo, save, the
  tick and the extractor all work with no new case. The standard is **surge 5×**, named by his own listening test; the end is a CLIFF,
  0.17 s before that player's next sound, else 5 s; **secco** is on by default. *Why:* four tools (1l · 1m · 1n · 1o) had to agree, and a
  new object type would have needed four of everything. *Rejected:* a `crescendo` type of its own (every score operation rewritten); a
  zone like the trill's (the trill needs a zone because it generates notes; a crescendo generates nothing).

- **D29** *(2026-09-08, the AI's measurement of his own texture at 135.78 s — RUNNING_LOG §285–286, §303)* — **A tool's rule is measured
  against what he already wrote before it is built.** Twice in one day this changed the design. His STATED selection rule for the
  sequence filler (*"the empty instrument with the shortest available space"*) was measured on his own 44 trills and DROPPED — it gives a
  median long of 0.13 s with 40 of 46 under 0.4 s, the very *"lot of short longs in a row"* he wanted to avoid, and his hand never did it
  (he took the third-to-fifth roomiest). And 1l's 0.17 s end gap, chosen independently, turned out to be exactly the median gap of his own
  hand-made trills. *Why:* his practice is more reliable evidence than his description of it, and cheaper to consult than to guess wrong
  and rebuild. *Rejected:* building the stated rule and letting him find it wrong by ear (a wasted build and a bad first impression).

- **D30** *(2026-09-08, composer, CN-56: "instead of a strike or short note, it'd be the onset of the crescendos"; RUNNING_LOG §304)* —
  **A new kind of SOUND is a switch, not a new mode.** The strikes drawer's `sound: attack | crescendo` sits BESIDE `mode: notes | chords
  | fill`, so *chords + crescendo* is PLAN 1o and every rhythm shape, voicing, order, span, take and insert serves both. *Why:* a fourth
  mode would have duplicated the whole notes/chords screen for one changed fact, and every later fix would have to be made twice.
  *Rejected:* a *swells* mode of its own (clean box, doubled maintenance). **The same reasoning put TIME CONTAINERS in the drawer's own
  `shape` menu** rather than inside 1o, so they serve attacks as well as swells.

- **D31** *(2026-09-08, composer, CN-56: "it'd be worth abstracting it into its own module because this is a type of technique I do a
  lot of"; RUNNING_LOG §305, §310)* — **A technique he uses across pieces is built standalone from the first line, not extracted later.**
  `score/public/time_containers.js` knows nothing of the drawer, the score, crescendos or MIDI: it takes numbers and gives back numbers.
  *Why:* extraction after the fact never happens on a deadline, and the next piece (Lake George) will want it. *Rejected:* building it
  inside the drawer and abstracting it "when there is time" — which is how the beating drawer became a parked rebuild.

---

- **D32** *(2026-09-09, composer's design, RUNNING_LOG §315–317)* — **A fade is expressed in CC7, never in level.** The morph's
  `attack.mode: 'fade'` leaves every level untouched and multiplies CC7 by a weight running from `from` to exactly 1 at the window's
  end, under ONE velocity per part (the breath in progress when the window ends). *Why:* the drawn 0–10 level scale is a scale of
  anchor velocities 65…127 — **9.96 dB end to end, with level 0 sending CC7 88** — so a ramp built there cannot start from silence
  however it is dialled, which is what he heard three times; CC7 is the fader and reaches 0, and his instruction was literal from the
  first: *"we start at the beginning zero CC7."* A second consequence earns it on its own: **a faded render is now byte-identical to
  the unfaded one but for two stamps**, so an inserted fade cannot write different WRITTEN DYNAMICS into the score than the morph it
  came from. *Rejected:* `multiply` and `ceiling`, which scale the level — kept as legacy and checked inert, but they move the
  velocity between breaths, which is heard as a lurch at every re-breath and not as a fade.
- **D33** *(2026-09-09, RUNNING_LOG §319–320)* — **Playback is scheduled with Web MIDI timestamps inside a bounded horizon,
  refilled from a timer.** The panel's Play holds at most 250 ms in the driver; the score's CC7 stream tops up 200 ms ahead in 20 ms
  steps. *Why:* timestamps make the timing immune to frame rate — which `requestAnimationFrame` is not, and which also made the fade
  impossible to measure in the harness — while the bound is what makes a stop possible at all. *Rejected:* queueing the whole run
  (tried, and it hung his rack: `MIDIOutput.clear()` does not exist in Chrome, so nothing could cancel it); and leaving the streams on
  rAF, which §103 chose reasonably before a fade existed to argue with it.
- **D34** *(2026-09-09, RUNNING_LOG §321)* — **A note is edited from its own card, not from the properties panel.**
  `score/public/note_card.js`: select a pitched note on a player's lane and get voice · pitch · dyn · start · length, **every change
  auditioned the instant it is made, with the MIDI channel printed beside it**. *Why:* his own constraint — *"I don't wanna go back and
  forth and say, tell AI to do this and then have it not work"* — argues for one self-contained thing that can be verified end to end
  rather than four patches inside a UI already misbehaving; and a voice that does not speak is what cost him the afternoon, so the card
  must prove a sound came out rather than merely look correct. *Rejected:* extending the existing properties panel (entangled with the
  code that was already failing him).

- **D35** *(2026-09-11, composer, RUNNING_LOG §399–§401m)* — **Section 1's strikes are notated TIME-ACCURATELY: every note at its
  own onset with its own GC**, drawn in the tuba's staccato vocabulary (filled 16th-flag head · staccato dot · accent · the
  technique's symbol or text · fff · go line · GC), the whole stack on the HEAD side and mirrored with a classic stem direction.
  *Why:* his own words — *"this is meant to be as time accurate as possible, most players should have a different go time"*: the
  147 ms spread of the first strike is composed, not performance noise, and the page is time-proportional, so each player reads
  exactly when their own attack lands. *Rejected:* writing the seven notes as one simultaneity at the first onset (the tuba's
  "one shot, one go"); a fold tolerance (onsets within N ms become a column) — both erase the roll he wrote. *Rejected on the way:*
  #2's chrome convention (text and accent above, dynamic under the flag) — our stack is kept and mirrored instead; stems forced up
  (one round, to keep the chain off the flag) — the classic rule restored once the chain moved to the head side.
  **Every rule is registry data, indexed in `docs/NOTATION_STANDARDS.md` §1.**
- **D36** *(2026-09-11, composer, RUNNING_LOG §401g)* — **For this piece the notation app's player sounds the COMPOSER SCORE's own
  note lengths, not the IR's.** *Why:* his *"should be precisely what I hear in the composer score"* — the tuba's day-22 rule (the
  IR is authoritative for sound) stretched every fixed one-shot to its sample-true length, so a 0.13 s jeté was held 1.22 s.
  *Rejected:* keeping the IR authoritative and shortening the samples in the IR (the IR's durations are the notation's truth —
  the ring bar and the written length depend on them); switching per technique (two rules where one will do).
  `playback.scoreDurations: true`; false restores the tuba behaviour.
- **D37** *(2026-09-11, composer, RUNNING_LOG §401k)* — **The piano's grand staff has its own inter-staff gap: 6 ss**, treble
  bottom line → bass top line, the two staves centred in the lane; the piano lane re-weighted 2 → 1.576 so its outer air equals a
  player's. *Why:* he saw the septet's staves sitting as far apart as two players' (12.46 ss) and said *"I don't think that's
  generally how it's done"* — he was right: piece #2 locked 6 ss off its own LilyPond reference (D.9.1), and LilyPond 2.24 itself
  puts a PianoStaff's staves at basic-distance 9 = a 5 ss gap while two instruments get 10.5 = 6.5. *Rejected:* LP's 5 (one number
  away, kept as the alternative); leaving the uniform spacing (reads as two unrelated staves, which is what he saw).
- **D38** *(2026-09-11, composer, RUNNING_LOG §400–§401)* — **The flute's tongue rams are folded into sounding C3–D4 and written at
  the FINGERING (sounding + M7).** *Why:* a tongue ram has no air stream, so the tube sounds only its lowest mode — the technique
  exists only in that 9th, whatever is fingered; 61 of his 70 rams in 0–183 s sounded above it (the sample plays at any pitch, a
  flutist cannot). Folding is a change to the MUSIC, done in HIS tab by `foldFlute()`, one undo step. *Rejected:* keeping the
  pitches and writing tongue pizzicato instead (at pitch, but soft — the strikes are fff); dropping only the 14 strays (leaves the
  part split between two registers). A written note outside B3–C♯5 now warns at build and shows red on the page.

- **D39** *(2026-09-12, composer, RUNNING_LOG §422–§424)* — **The crescendo panel's `ends: next strike` = the next ATTACK after the
  onset, for every player launched from it; the "next strike" is any plain note, not only a drawer group; a harmony can be typed.**
  *Why:* his *"one note is longer than the other"* · *"I want to be able to go from one onset to the next onset"* — the crescendos from
  one onset all end together, on the first attack after it, the selection's own later onsets included; a note placed by hand must count
  as the next strike or the chain cannot be composed freely. *Rejected:* rule B (§421, built the same evening — n notes at the next onset
  = n landings, each crescendo on its own note of the next strike), undone at his word; a "next strike" only the drawer's groups could be.
- **D40** *(2026-09-12, composer, RUNNING_LOG §426; CN-74)* — **The first full draft is tagged `Scattered_Substance-finalDraft_1.0`, and
  the tag carries the score:** `scores/piece-septet.json` (his Save) is committed at it. *Why:* a draft tag on a commit without the score
  would mark the tools, not the piece. *Kept as before:* the takes, the passages, the rack, the section-3 material files and his v1.31
  backup stay uncommitted — his. *(The AI's reading of "this is Scattered_Substance-finalDraft_1.0"; the title itself stays tentative
  per CN-64 until he says otherwise.)*
- **D41** *(2026-09-13, composer, RUNNING_LOG §440)* — **One MAIN notation file: `notation/ir/piece-septet.ir.json`, the whole piece,
  first in the picker ("piece-septet · MAIN notation score"), built with every rule in force (`--all --bricks --trills`).** His: *"could we
  have a main notation score save file? That's the primary file and have that updated."* Updated by Save in the composer, then **R** on the
  notation page (R re-runs the recorded build over the whole score — `notate_section` now keeps the page's label and picker position).
  Each new notation rule is added to that build and the file rebuilt. *Why whole piece:* R always rebuilds the whole score (§403), so only a
  whole-piece page refreshes truthfully. *Rejected:* a section-only main file; a second whole-score page beside `piece-septet`.
  `strike1` / `trill1` stay as experiment pages (history).
- **D42** *(2026-09-13, composer, RUNNING_LOG §446–§447)* — **THE CURVE LOOK, ALL PIECES: piece #2's final performance score.** One closed
  path — fill = the colour at 0.3, a 2 px stroke of the same colour round the whole shape, opacity 0.3 on the path (interior 9 %, outline
  30 %). **limeGreen `#99FF00`** for dynamics (the trills, surges, the morph crescendo); **brightOrange `#F04B00`** for the morph glissando.
  His: *"record this as the standard ... when I actually make the rehearsal scores and the final performance score, I want these standards
  in there as well and across the board ... moving forward in the tuba, this piece, and other pieces."* Spec: `docs/CURVE_LOOK.md`;
  registry `envCurve` / `crescCurve` / `glissCurve`; `render.js curvePathD42`. Piece #4's presentation score stays as delivered.
  *Rejected:* the tuba's fill-only look (fill 0.3 dark green, 0.22 lime/orange, no outline).
  **Extended the same day (§448) to the meters:** #2's curve follower exactly — 8 px, right edge 3 px left of the cursor, the full-lane
  outline 1.5 px @ 0.8, the fill @ 0.3 drawn first (piece #4's 0.6 superseded). The motive pie and the line-wedge meter recorded as #2's
  spec (CURVE_LOOK §7), not used here.
- **D43** *(2026-09-13, composer, RUNNING_LOG §455–§463)* — **THE BEAMED GROUP: strikes too close for their own GCs share one.** A gap
  under **0.4 s** in one part → a pair, written 16th · 16th rest · 16th · 16th rest, the beam carried over the last rest; under **0.25 s**
  → four straight 16ths; the piano's closing run (169 notes, 581.2–624.0 s) **four at a time**. **GC on the first note only · no go line on
  any note · every head's left edge on its own go time** (onsets never move) · **no tempo mark** · one dynamic on the first note, every head
  its dot and accent · **accents on one row on the beam side.** His: *"the beams allow players to play several notes on one gc"*; *"it will
  be like the tuba density builds but with some differences."* **The three trill × GC arc meetings are accepted** — *"performers can time
  the gc and start the trill immediately after or cheat if they have to."* *Why a gap trigger and not named spans:* the density is
  measured, not chosen per passage (section 1 holds one such gap; after 183 s there are 218). *Rejected:* Gould's beam between the grand
  staff's staves — his dictation puts it **above the treble staff, stems down into the bass** (§463, to be built) so the gap where the
  piano's ball lands stays clear; a printed tempo (the scroll carries the time); one mark per head (the tuba's ambient + deviation instead).
  **Open:** ~~eight per GC if four still crowds (§463)~~ · the triple in the six other parts · a `--pairs`-shaped build flag. Spec:
  `docs/NOTATION_STANDARDS.md` §2; build: `--cluster … --gridDiv --restAfter` (`tools/notate_section.js`).
  **Addendum 2026-09-14 (CN-78, RUNNING_LOG §464):** **max FOUR per GC — 1, 2 or 4, never eight.** A group on one staff: as normal, every rule
  above. A group on both staves of the grand staff: TRY one beam above the treble staff, the lower notes' stems reaching down into the bass —
  **designed and built when section 3 is notated, not before** (his "I want to actually figure this out and implement it when we notate
  section three. Not now").
- **D44** *(2026-09-14, composer, RUNNING_LOG §464–§465; CN-79)* — **A morph voice whose whole travel is under 20 c is written CRESCENDO-ONLY:**
  one written pitch, no gliss line, no quarter-tone head, no orange curve — the green crescendo alone (the tuba's BALANCE form); **the build
  tool alerts every time the rule applies, and he looks at each case.** His: *"ok b for the rule but alert in the future and I want to look at
  these case by case."* *Why:* the tuba rule ("any gliss is at least a quarter tone; scale is not category") would draw M2's flute — 4 c over
  116 s, a voice already in tune with the B♭ series the SPECTRAL model focuses on (§465) — as a full-height C→C¼♯ glissando that is not
  there; the cello's 14 c is a tuning shade. *Rejected:* 10 c (the cello would still get a curve); the tuba rule unchanged. Spec:
  `docs/NOTATION_STANDARDS.md` §3.
- **D45** *(2026-09-14, composer, RUNNING_LOG §469–§472; CN-80; the mock `docs/images/morph_header_arrow_cents_mock_2026-09-14.svg`)* —
  **THE MORPH HEADER'S PITCH FIGURE: the arrowed natural AND the cents, for every piece from here.** The altered head is written to the
  nearest eighth tone — an ordinary or quarter-tone sign with an arrow for ±25 c, the arrow on the nearest sign (Gould / Saariaho / Poppe) —
  with the exact deviation in cents above it (Haas / Tenney; "+25", "−14"; a 0 dropped). His: *"This is good. Let's record this as the
  standard … use this notation for the morph sections."* **Piece #4's rehearsal and performance scores take it when they are made; its
  presentation score stays as delivered** (his: *"just for the performance slash rehearsal scores when we get to those"*). *Why:* M1's voices
  travel exactly an eighth tone; the tuba's "at least a quarter tone" wrote that twice too big, and a cents number alone gives no shape
  at a glance. *Rejected:* the quarter-tone grid alone (the tuba's, "what I'm doing now"); the arrow alone (exact only at 25 c); the cents
  alone. The curve stays the displacement map; D44 stands. Spec: `docs/NOTATION_STANDARDS.md` §3; build: PLAN 2h.2.
  **SETTLED the same day (§473–§474; CN-81) — this form supersedes the arrowed natural above:** (1) **quarter-tone accidentals only**
  (♮ ♯ ♭ ¼♯ ¼♭, never ¾ — respell to the simpler sign), **no arrows**; (2) the destination head is the **nearest quarter-tone spelling**, the
  residual within ±25 c; (3) **the residual as a signed cents number above the destination head, written from 7 c** (`--centsMin 7`, a
  purpose-oriented flag — the JND of beating, ballparked: the rate moves ≈ f/1700 Hz per cent, its JND ≈ 10 %; 7 c sits with the pitch JND
  and the player's ±5–10 c accuracy; a future piece may set 0); (4) **ties at exactly 25 c spell toward the start** (C +25 / C −25);
  (5) **the heads in TIME order** — start left, destination right, the number on the destination (the tuba's lowest-left order superseded;
  **piece #4's performance scores to fix this too**). *Why:* the nearest spelling with a signed residual is the practice (Tenney's cents
  school, Helmholtz–Ellis, Haas); quarter-tone signs cap the residual at 25 c, which players read as intonation shading; the arrow only
  repeated the sign. *Rejected:* "never a down arrow" (the head at or below, +0–49 — used by nobody, D −5 c would read D¼♭ +45); chromatic
  signs with ±50 (the cello's E♭ +48 vs E¼♭ −2); a 10 c threshold; the arrowed eighth-tone natural of the first form.
- **D46** *(2026-09-14, composer, RUNNING_LOG §473)* — **THE MORPH HEADER'S DYNAMIC FIGURE IS FIXED — niente circle · arrow · `fff` on every
  part of every morph — AND THE CRESCENDO CURVE IS ABSOLUTE ON THAT SCALE.** The header is the legend of the bottom half-lane (bottom =
  niente, top = fff); the curve's height is the sound's level on it, not normalised to its own peak: *"if the swell goes from niente to mf
  the curve will only go up that high, somewhere past 1/2 max curve height but the header will still show niente to fff."* Until further
  notice. *Why:* one legend for every morph, the curve then tells the truth about the amount. *Rejected:* the marks from the data through
  the ladder (put to him as the recommendation); the tuba's per-curve normalisation of the crescendo (kept for the gliss, whose amount the
  pitch figure states). The level scale is D23's, the D32 fade weight multiplied in (AI's reading, marked). Spec: NOTATION_STANDARDS §3.
- **D47** *(2026-09-14, composer, RUNNING_LOG §475)* — **NO FLOOR ON THE MORPH CRESCENDO; THE ARC THROUGH THE BREATH PEAKS; 100 SAMPLES/S.**
  The morph is drawn the tuba's way — the fade from silence from the baseline — not the trills' (their floor at 1 stays theirs): *"the tuba
  piece looks fine even though it goes to zero in the curve … drawing the same way as the tuba is good"* → *"a"*. *Why:* the trills' floor
  cured 3 s curves starting at 0.015 and mid-phrase dips to zero, faults the morph's smoothed arc does not have; M1's 5–18 s under 10 % at
  the start IS the fade. The arc's anchors at the breath peaks (not the tuba's fixed fractions of the span) because the tuba's fit sagged to
  0–5 % between M1's breaths, and D46 wants the height to be the level reached. *Rejected:* the trills' floor on the morphs (a 7 px band
  where there is nothing); the raw per-breath level (9–16 humps per part; the tuba's principle is one arc per part). His eye on M1's first
  page decides; the floor stays a flag. Spec: NOTATION_STANDARDS §3; build: PLAN 2h.2.
- **D48** *(2026-09-14, composer, RUNNING_LOG §476)* — **NO BEATING INDICATION ON THE SCORE; THE RATES GO TO THE PRACTICE VIDEOS.** A set
  for this piece like the tuba's — *"they can see the speed and hear it in isolation"* — BLOOM first, SPECTRAL his to think about. *Settled 2026-09-17 (§584): no SPECTRAL demos.* *Why:*
  only M1's C4 pair beats at a countable rate (≈ 7 Hz; D5 ≈ 16, A5 ≈ 22 are roughness); M2's pairs are not mirrors. *Rejected:* a rate at
  each end of the gliss on the score (the tuba's committed-never-built form); deferring. **The piano's notes in the morphs deferred the same
  day** — built after the morphs (PLAN 2h.5).
- **D49** *(2026-09-14, composer, RUNNING_LOG §496–§497)* — **THE NOTEHEAD'S LEFT EDGE IS THE MOMENT · THE GO LINE MARKS DISPLACEMENT** —
  piece #4's D59 and D58 promoted to this piece's principles (§3 P17; NOTATION_STANDARDS §0): *"lets promote this … as a principle
  somewhere, go ahead and make changes and draw morphs this way"*. Applied first to the morph section's piano (`main` · `plucked` ·
  `byPairBeam`): no GC displaces them, so `nhAnchor: leftEdge`, `goLine: false`; their pizz. and Ped. start at the head's left edge, the
  dynamic centred; the beamed pair carries no go line (the beamed group's regime, D43). *Why:* his own scrolling-reader argument and the
  time-space tradition (D59); a go line on a head already on its time is Tufte's 1+1=3 at the datum (D58). *Rejected:* (B) left edge on
  the moment AND one go line per gesture — the line would run along the head's edge, D58's "third when"; (C) the tuba's lone unit before
  its line — inconsistent with D59 and with the pairs. **Owed, not now:** the audit of every other device of the score against the two
  principles (NITS 2026-09-14) — the strikes' and trills' go lines are justified; the surge/fp/ord inheritances are the ones to look at.
- **D50** *(2026-09-14, composer, RUNNING_LOG §501–§503)* — **THE PIANO'S WRITTEN DYNAMIC IN THE MORPH SECTION COMES FROM THE ENSEMBLE,
  ON THE PAGE ONLY.** His rule: *"if there are three or more at that top dynamic, then the piano will match that top dynamic. If not, then
  the piano will come in at one under the top dynamic"*; in the one pair whose notes differed, *"make the 2nd note 1 level more than the 1st
  one"*; **a2** — the save's velocities untouched. The other parts' dynamic = their sounding breath's level × the CC7 fade weight as a D23
  mark. *Mechanism (his question — "confirm that these will hold … and be ported over to the performance scores … even though I'm not
  updating the original composer score dynamics"):* the rule is a flag in the MAIN file's recorded build (`--ensembleDyn 205-428@2`, D41),
  so every rebuild recomputes it from the save; its result is written INTO the IR (`device.dynFixed`), which D9 makes the single source of
  every downstream score; `tools/test_morph_notation.js` fails if the flag drops out, if the IR stops matching the rule, or if any of the 32
  drawn marks moves; PLAN 3 (the performance score) carries it as an acceptance line. *Rejected:* changing the save's velocities (a1 — the
  piano's velocity table has five marks, the rule uses eight, and the recording stays his); a hand-typed table of marks (it would not follow a
  deliberate change to the morph levels, and nothing would say it had gone stale).
- **D51** *(2026-09-14, composer, RUNNING_LOG §508 · §510)* — **THREE STRIKES UNDER THE TRIGGER ARE ONE GROUP ON ONE GC — the beamed
  group admits 1 · 2 · 3 · 4 (CN-78's "1, 2 or 4" amended).** His word: *"The triples A good"* to the three options (A three allowed, one
  GC · B pair + single, two GCs · C change a note). Written as the pair with a third unit — 16th · rest · 16th · rest · 16th · rest, one
  beam continuing over the last rest, the written 16th = half the gap, one GC on the first. *Why:* both triples are nearly even (Vc 488.51 s
  0.344 · 0.325; Va 622.01 s 0.347 · 0.341), and pair + single would land the single's own GC 0.33 s after the pair's — the crowding the
  rule exists to prevent. *Rejected:* B (that crowding) · C (a change to the music for a notation convenience). Built at PLAN 2g.5.
- **D52** *(2026-09-14, composer, RUNNING_LOG §513–§514)* — **SECTION 3'S STRIKES TAKE ONE DYNAMIC PER PART PER BAND (on change);
  SECTION 1 KEEPS ITS MARK ON EVERY STRIKE — two rules, by texture.** His word: *"A good"* to §513's three options. *Why:* section 1 is
  sparse (500 strikes, all fff; a player should not look back 30 s for the dynamic — his §401d choice stands); section 3 is dense (932
  strikes in 180 s, six time bands p → fff, CN-83): 932 marks would be clutter, ~42 say everything. *Rejected:* B on-change piece-wide
  (section 1 would fall to 7 marks) · C on-change + restatement after a long gap (one rule, one more parameter). Built at PLAN 2i.7 with the
  existing `dynOnChange` machinery (§401d left it in layout, unused); NOTATION_STANDARDS takes the row then.
- **D53** *(2026-09-14, composer, RUNNING_LOG §517–§518)* — **THE SINGLE STRIKES STAY AS THEY ARE: head before the go line and the GC,
  the go line, the GC — by the reading rule, not by any collision; the two principles (D49) are SCOPED to units without a GC.** His word:
  *"the single strikes GCs should remain as they are … the one plus one equals three rule from Tufte. So if a performer is looking at the GC
  hit the go time, they don't need to also see the notation at the same time."* *Why:* the audit (§517) found the strikes' reason on record
  ("to clear the disc") gone since D60 (0 of 999 heads reach it) and the beamed groups on their time — but the placement is his reading
  convention, and the rule was misread as a mandate over it: *"Somehow that rule was misconstrued … I don't want it to affect the audits the
  way it has."* *Rejected:* A the single strikes join the beamed groups' regime (every strike 85 ms right, both pages re-seen) · C the tuba's
  original Option B (drop the go line, keep the hang). NOTATION_STANDARDS §0 carries the scope line; the audit is not repeated over strikes.

## §5 Playbooks

- **Sound research (mapping a sample library):** piece #3's journal §5.1 — the escalation
  ladder (manual → forums → transcripts → frame analysis → hands-on probes → hacks) and the
  CC/control probe protocol with scope tags (`engine` / `group` / `patch`). Reuse as written.
- **Composer-score save files:** #4's `docs/SAVE_FILES.md` + `NAMING.md` (piece menu,
  working copies, "Save as next", variants, restore). Reuse as written once 0b lands.
- **D54** *(2026-09-15, composer, RUNNING_LOG §530)* — **THE CRESCENDO RUN'S SWELLS DRAW THE STANDARD SURGE SHAPE, NOT THE SAVE'S CURVE; "SEMPRE
  SECCO" ONCE PER PART.** The 78 swells (526.8–559.4 s, six parts in rotation, the piano out) wear the tuba's surge device; the drawn curve is the
  crescendo tool's own ratio-5 surge as a TEMPLATE — at 100/s, no floor, the 90° cut at the note end, ppp → fff + arrow — a picture of the
  intention, unlike the morphs' absolute curve (D46). The IR keeps the save's curve (bent for the sampler's ear, CN-49's listening tests), so the
  sound is untouched: the substitution is a drawing rule on the device. His: CN-84 *"these ones will still have the standard surge shape"* · the
  word ONCE per part at its first swell — *"b"* — over the AI's lean of every swell (the animated score shows one window; 78 small words). The
  performance instructions must say: secco = the strings damp at the cut, the winds take the word for the shape; the morph curves are absolute,
  these show the shape. *Why the template, not the save:* the save's shape serves the sampler, the page serves the player. *Rejected:* the word on
  every swell · re-baking the template into the IR's samples (the IR would lie about the sound) · a build flag (the rule is the device's look, not a
  section's). Build: PLAN 2i.8 (8.1–8.7); the meter rides the template by D50's one source.
- **D55** *(2026-09-16, composer, RUNNING_LOG §541–§542)* — **THE PITCH FORM IS A PROPERTY OF THE REALIZATION: A FULL SCORE READ TOGETHER IS IN C;
  A SCORE READ BY ONE PLAYER IS TRANSPOSED.** The presentation score (print + the jury's video) and the full ensemble rehearsal score show the
  bass clarinet at sounding pitch on a bass clef; the sectional scores, the individual rehearsal scores and any part show it in B♭ on a treble
  clef, sounding a major ninth lower (§382's French form, which stays the default and the working page's view). The IR is always sounding (D9);
  the shift is one registry override per realization applied at layout (`writtenOf`), never a second IR. **The standing requirement:** every
  later score version declares its pitch form before it is built, and the mechanism — the override, its guard, the front-matter line ("score
  in C; the bass clarinet sounds as written" · the part "in B♭, sounding a major ninth lower") — is in place before the first of them (PLAN 2k,
  after the proofing pass, before 2b). His words: *"the whole transposing instrument mechanism … the standards and rules we need in place so
  that we can display a full score in C, i.e. the presentation score and the full ensemble rehearsal score. And then the other ones in the
  transposition."* *Why C for the shared scores:* the reader of a full score reads harmony, and new-music practice since the mid-20th century
  is the score in C with transposed parts (§541). *Open, for PLAN 3:* the performance score the players read in concert — one shared display —
  takes its form when PLAN 3 is designed.
- **D56** *(2026-09-16, composer, RUNNING_LOG §545 · CN-87)* — **NO GROUP OF THREE: A RUN OF THREE IS A PAIR AND A SINGLE; THE PIANO'S RUN IS
  2s, THEN 4s, THEN THE LAST NOTE ALONE.** The count of 2 · 3 · 4 in a row (the piano at 611) or 3 · 3 (the viola at 622–623) reads as compound
  meter — ONE-two, ONE-two-three, ONE-two-three-four — so the odd note goes where it reads as an event, never as a third group-size. His
  verdicts on every three in the piece: Vc 488.51 → 2 + 2 + 1 · Vn1 620.56 → 2 + 1 · Va 622.01 → 2 + 1 · Va 623.20 → 2 + 1 · the piano's run
  → 42 pairs, 17 fours from 611.50, and the piano's last note in the piece (624.00) its own GC — *"pno at end my solution, 2s then 4s then
  last one single"*. Supersedes D51's admission of the triple (2026-09-14): the triple's writing stays in the engine (`--threes 3`) for
  another piece; this piece builds `--threes 2+1`. *Rejected:* a GC on the third note alone (2 · 1 · 4 — a third size in a row) · a five
  (over CN-78's four) · the odd note at the START of the fours (a pickup; weaker than the arrival).

- **D57** *(2026-09-16, composer + AI, RUNNING_LOG §556–§563)* — **THE DEMO VIDEO: THE WIDE SHOT WITH CLOSE-UPS; THE CLOSE-UPS ARE GROUPS AT
  1.85×; A NEW SEEDED CUT (53); THE TUBA'S 5-FRAME CROSS-DISSOLVE; THE PICTURE HOLDS THROUGH THE AUDIO'S TAIL.** His word: *"I want the demo video
  to include portions close up as well … a new random selection for the close up sections and incorporating the transitions we used in the
  tuba video"*; *"a, seed 53 — clips look good"*; *"video good, archive it as the submission copy"*. **The AI's call (a look detail under
  #4's D1):** the tuba cut its 2× master at y = 1080 (ten equal lanes); the septet's piano lane is 1.576, so y = 1080 fell inside Vn1 and
  the strings at 2× (1122 px) cannot fit a frame — so V-TOP = Fl · BCl · Pno and V-BOT = the strings, at 1.85× (the strings' measured ink
  568 px → 1051), centred, the rest paper (registry `realizations.video-cut`). *Rejected:* 2× with the strings cropped (the cello's GC dots
  lost) · a zoom per group (two masters, two sweep speeds) · a resampled crop (blur). The seed: of 300, only 53 and 72 gave two close-ups in
  every section and 4/4; 53 gives each section one top and one bottom. The tail: the render ends 5.1 s after the score's material, so the
  picture rests at the end while it rings (`--t1 630.1`). Archived `notation/video/approved/2026-09-16-submission/`.
- **D58** *(2026-09-17, composer, RUNNING_LOG §607 · CN-64)* — **THE TITLE IS _SCATTERED SUBSTANCE_; THE ENSEMBLE LINE IS "for flute, bass
  clarinet, piano and string quartet"; THE PRINT SCORE CARRIES NO SECTION MARKS; ONE PDF, NO SEPARATE TEMPUS COPY.** His word, to the three
  questions of §606: *"A yes · B no marks what is the ruler? · c a"*. The title is no longer tentative (CN-64) — the cover, the instructions
  page and PLAN 4's form all take it. No marks above the music (the AI had recommended `I · II · BLOOM · II · SPECTRAL · III`). The demo link at
  the head of the instructions page (page 2) is the score telling the jury the video exists — the 09-14 "Tempus copy only: a link at the top"
  is met by it, so there is one PDF. **The time ruler: KEPT** (his *"a keep; go for build"*, §608) — a tick a second, m:ss every five.

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

- 2026-09-16 — **THE DEMO VIDEO, THE SUBMISSION COPY** (RUNNING_LOG §553–§564; D57). The audio re-rendered from the proofed save (630.100 s,
  −1.0 dBTP; his "render good") and the animated presentation score cut with close-ups (seed 53, cross 5; PHASE 5 measured; his "video good")
  — archived `notation/video/approved/2026-09-16-submission/`, online **https://youtu.be/x8EZ3B1EvbE**. PLAN 2i closed through step 10.
- 2026-09-12 — **THE FIRST FULL DRAFT — `Scattered_Substance-finalDraft_1.0`** (RUNNING_LOG §426; CN-74; D40). The chain (PLAN 1t) planned
  and built in a day and composed with all evening (§411–§424); the piano cut and the morph M2 moved to 314 s (§425); the score committed
  and tagged at his word. The title is still tentative (CN-64).
- 2026-09-09 — **THE MORPH'S FADE-IN, and the note-editing interface around it** (RUNNING_LOG §311–323; D32–D34). The fade took three
  wrong builds before his own question found it — *"in the morphs without any fade in … how do you achieve that fade in?"* — and the
  answer was that the morph already fades with ONE velocity and a rising CC7. `attack.mode: 'fade'` now does that, in CC7 space, after
  §316 measured why level space could not: the drawn 0–10 scale spans **9.96 dB** and its floor is CC7 88. Playback moved onto Web MIDI
  timestamps in both the panel and the score — which also made the stream measurable for the first time, and which hung his rack once
  on the way (§320, `MIDIOutput.clear()` does not exist in Chrome). Then the editing: stack cycling on every lane, a conflict-marks
  toggle, `note_card.js`, the grain-drag fixes, and a hung-note bug whose note-offs had been going to the wrong channel — and, for the
  flute, the wrong port. — `built`; **none of it heard by him yet.**

- 2026-09-08 — **THE CRESCENDO SUITE, all four items** (RUNNING_LOG §252–310; D28–D31; docs/CRESCENDO.md, STRIKES_TOOL §Y and §Z):
  **1l** the object, the standard named by his own listening test, and ONE spacing rule with its gesture clause · **1m** the **C** key,
  the card and the harmony bar · **1n** the sequence filler — a long on every attack of a pattern, each in another instrument · **1o**
  the sound switch and TIME CONTAINERS. Nine new modules, 150 node checks, four browser walks, eleven defects found and fixed on those
  walks. Planned end to end by `docs/PLANNING_METHOD.md`, which twice caught a design error before it was built. — `built`;
  **his ear on all four is the one thing outstanding**.

- 2026-09-07 — **1f** the beatings, steps 1–7 built overnight at his word (RUNNING_LOG §167–174; D24, D25): the palette with the
  bend probe run in the rack (§168), the math (77 checks), the object (B, the snippet's bend events, the tick), the panel, the pitch
  side, the insertion — each verified on a copy by the decoded MIDI or real DOM events — `built`; **his listening at 3–7 pending**;
  item 8's four held things stand.
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
- **Piece #4 (the tubas): check the morph headers' pitches** *(found by the AI, 2026-09-14, RUNNING_LOG §477; NITS)* — the tuba's header
  overlays carry no pitch, so every header head is drawn at F2 (`db1`'s 30 headers, the three morph pages). Right only for parts that start
  on F2. Look at the tuba's presentation score's morph pages in a tuba session; its rehearsal / performance scores take D45 anyway.
- **Practice videos for the morphs, with the beating speed** *(composer, 2026-09-14, D48: "lets locate the hz notate to the practice videos,
  I'll make a similar set like the [tuba's] was for this piece as well. So at least for the bloom section, I'll have to think about the
  spectral section. But this way, they can see the speed and hear it in isolation.")* — at the performance stage (PLAN 2h.7); the tuba's set
  as the model.
- **The title — tentative: _Scattered Substance_** *(2026-09-11, CN-64; used unqualified in the draft tag name 2026-09-12, CN-74)*. Confirm or change before the cover and the
  Tempus format entry are written (PLAN 2b authoring). Written down in CN-64, PLANNER and PLAN 2b.
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
  plugin's gain** (unity; preset FX such as the maximizer / tilt bypassed) **and that its MIC
  POSITIONS are enabled** whenever a Kontakt or UVI instrument is loaded or its preset changed —
  SAMPLER_QUIRKS.md has both rules. *(The mic half is his own find of 2026-09-09: a piano voice
  was silent with the app routing it correctly — "ok fixed the mic choices were all turned off."
  A part with its mics off looks healthy and makes no sound.)*

- **Next piece (after the septet): the "Lake George" piece** — pairs: english horn/bassoon,
  horn/trumpet, cello/bass, + percussion; start with a morph section (composer, 2026-09-04;
  verbatim in COMPOSITION_NOTES). **Animated conductions** for its delicate, quiet material —
  a pinch → lift → open hand gesture, to be captured from video and re-animated in the score
  (composer, 2026-09-04 session 3; verbatim in COMPOSITION_NOTES).

**Completed:**
- ~~Penn State abstract (tuba repo), due Fri 4 Sept~~ — done (composer, 2026-09-04).
- ~~Test the STRIKES drawer with U1–U4~~ — done (composer, 2026-09-04); the drawer has been composing the piece since.
