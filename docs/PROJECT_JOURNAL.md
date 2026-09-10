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

**Last session (6 — 2026-09-09, Claude Code / Opus 5) — RUNNING_LOG §311–323.** A whole day on ONE thing that turned into five:
the morph's fade-in, and then the editing interface around the piano parts he recorded against it.

- **THE FADE, three wrong builds and then his own design (§311–317).** A 3 s fade on BLOOM was bit-identical to no fade
  (`lenPct` added). Then the emitter was found striking every note at the velocity for that note's PEAK, so no fade setting could be
  heard between breaths (§314). Then his algorithm was built in LEVEL space and still did not fade — because **the drawn 0–10 scale is
  anchor velocities 65…127 = 9.96 dB, and level 0 sends CC7 88** (§316, measured on a plain drawn note with no morph in it).
  **`attack.mode: 'fade'` now lives in CC7** and leaves every written dynamic untouched (§317). `fade-in-slow` = 60 % · fade · linear.
- **TIMESTAMPED PLAYBACK, and the rack it hung (§318–320).** The panel's Play never got §103's Web MIDI timestamps; both CC7 streams
  were per frame. Both converted — and §319 **hung his rack**, because it queued the whole run on the strength of an `out.clear()` that
  **Chrome does not implement**. Rebuilt bounded: never more than 250 ms in the driver, refilled from a timer.
- **THE NOTE CARD and the editing blockers (§321–323).** Stacked notes now cycle on every lane (click the same spot again) · a
  `marks on/off` toggle for the conflict boxes · `score/public/note_card.js` — select a note, get **voice · pitch · dyn · start ·
  length**, every change auditioned at once and the MIDI channel printed. Grain drag fixed (a flat capture had no peak for `grainDur`
  to anchor on; the 0.5 s minimum length; handles wider than the note). **Hung held notes fixed**: the note-off was going to the
  technique's channel while the note-on went to a D11 curve channel — and for the flute a different PORT.
- **He answered two himself:** the silent piano voices were *"the mic choices were all turned off"*, not the app; and his rack's piano
  gain is confirmed **+7.00 dB** on both tracks, matching `balance.json`.

**NEXT UP — all of it his ear, none of it AI work:**
1. ► **THE FADE.** Morph panel → BLOOM → preset `fade-in-slow` (or SHAPE·attack: *how* **fade**, *len % of span* 0.6, *curve* linear,
   *from* 0) → Play. Expect one strike weight throughout and CC7 climbing from **0** across the first 60 %, the morph carrying on
   unchanged after. **Nothing in §311–323 has been heard by him.**
2. ► **The editing card**, on the piano takes he recorded: cycle a stacked note, change its voice, pitch, dyn, drag its edges.
3. ► The six older listenings still waiting: **1o** crescendo strikes · **1n** a filled section · **1m** crescendos · **1k** chords ·
   **1j** the piano's lines · **1i** the piano's harmonics · and `cresc-secco-test`.
4. Then the three tails: 1k step 7 (the piano's chord remainder, CN-52) · 1i item 2 (the harmonics' CC21 shift) · 0c.7 (a) (trills and
   beatings still on MAIN).

**Session 7 (2026-09-09, Claude Code / Fable 5.1) — mid-session, decided and built (RUNNING_LOG §324; promote to §4 at the wrap):**
- **The strikes column holds every harmony** of the morph menu as collapsible banners; **a harmony clicked IS a strike** (one simultaneity, the
  defaults) and behaves exactly like a strike click. Rejected: keeping the rhythm dials across a harmony click (a minutia — one line if wanted).
- **The rhythm is its own source** — *rhythm from* `own` (default; byte-identical to before) or any strike #0…#45; laid in place. **Rule 1**
  (counts differ): stack OR repeat, both his — *"Can we have either"*; fewer notes leave the last onsets empty. **Rule 2:** the accents travel
  with the rhythm, the pitches with the harmony. Not built: the rhythm collection (his own played rhythms) — waits until he has played them.

- **The crescendo run is a console line, not a panel (evening; §325; PLAN 1p):** `crescRun({...})` writes the gesture at the playhead,
  SPACE plays it, the next call replaces it, `crescRun.keep()` freezes one. Rejected for now: a card (B), the drawer (its Hear never
  swells — plain note-ons; NITS). **He has heard none of it yet.** The morning's feature queue AB1–AB3 (STRIKES_TOOL §AB) is collected, not built.

- **The thread not to lose (03:00; §328; PLAN 1q; STRIKES_TOOL §AC):** the strikes drawer is to be REVISED — the gesture as five choices
  (rhythm · players · pitch rule · sound · place), Hear playing what Insert writes, profiles for standing settings, the console line as
  the power path. A sketch is written; the plan comes by the planning method when he says so. **crescRun now has: the rhythm from a take,
  the s3 profile (575 · his order · Bb3 up), a length ramp; his lines of the night are in §326–327.**

- **chordRun (04:30; §330; PLAN 1r):** a series of chords dealt over the free players as one console line — 1k's engine, a take's rhythm or
  an even row, `tech: 'staccato'`. Chords mode's screen failed him twice; the diagnosis and the fixes are in §330 and NITS. **Unheard by him.**
  The piano-as-two-hands build (CN-60, §329) is next on his word, `one voice` staying the default.

- **THE OVERNIGHT BUILD (06:30, his commission; STRIKES_TOOL §AD; PLAN 1q doing; RUNNING_LOG §333):** the strikes drawer revised without a
  plan, at his word — the sound at an onset (note · chord · crescendo with a begin/end anchor and a percentage length; Hear with the ramp)
  and accents on crescendos in the score's card; the rhythm part untouched. **REVERT POINT: git tag `pre-revision-2026-09-10`** —
  `git checkout pre-revision-2026-09-10 -- score/public` puts the drawer back as it was at 06:30; or, in the app, the console line
  `localStorage.setItem('septet.strikes.classic', '1')` and a reload leaves the new files out. He checks in in the morning.

- **THE OVERNIGHT BUILD IS DONE (09:00; §334):** the sound at an onset (a chord dealt over the free players — double-click a dot, click a
  row), the crescendo's `% of the gap` and `starts / ends on the onset`, Hear that swells, the ACCENT row in the score's crescendo card.
  Verified on a copy with real events; **unheard by him.** The morning's walk is in STRIKES_TOOL §AD. Revert: the tag, or the classic flag.

**CHECKPOINT (mid-session, 2026-09-10 ~09:30, before a /clear — session 7, Claude Code / Fable 5.1):**
- **Task and state:** the overnight revision is BUILT, verified on a copy, committed and pushed (09ca201); nothing is in flight. He is about to
  test it by ear. The console lines of the night (crescRun · chordRun · goTo) are in and documented (§325–332).
- **Latest deliverable:** §334 — strike_sounds.js (a chord at an onset), swell_ui.js (% of the gap · starts/ends on the onset · Hear with the
  ramp), cresc_card.js (the ACCENT row). The walk for him is in STRIKES_TOOL §AD. Revert: tag pre-revision-2026-09-10 / the classic flag.
- **NEXT CONCRETE STEP:** his verdicts on the revision, fix what he marks. Then, on his word: the piano as two hands in the chord deal
  (CN-60, §329 — the top line agreed, no plan; `one voice` stays the default). PLAN 1q built · 1k step 7 planning · 1p/1r built.
- **Pending decisions:** none. **Resume reads:** RUNNING_LOG §324–334 in order; STRIKES_TOOL §AA–§AD; NITS 2026-09-10.

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md; restored 2026-09-10 after
it was found missing from this repo's CLAUDE.md, which is why the advice had gone quiet. Keep current.)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| 1 | **His ear on the overnight revision** — the walk in STRIKES_TOOL §AD; chords at an onset, the crescendo's % and anchor, Hear's ramp, accents in the score's card | conversation, either — **Opus** while he is listening and reporting | no |
| 2 | **Fix what he marks** — small, named defects against a built thing | **Opus** | no |
| 3 | **A defect whose cause is unknown**, or a verdict on how a gesture should behave | **Fable** | **yes** — wrap on Opus, `/clear`, switch, `/postclear` |
| 4 | **The piano as two hands** (CN-60, §329) — the top line is agreed and written; steps 1–5 are a spec | **Opus** | **yes** at the start (a fresh context for a build) |
| 5 | The six older listenings (1o · 1n · 1m · 1k · 1j · 1i) and the three tails | **Opus** to run, **Fable** only for a verdict that reframes | at each chunk wrap |

**The standing rule:** Fable for the turns where a wrong reading costs a day; Opus for every turn where
the plan is already on paper. Wrap on Opus, always.


**Open at session end** *(written cold, 2026-09-09)*:

- **Task and state:** the AI's work is done and pushed; **nothing is in flight.** He is composing and recording piano into
  `piece-septet` on his own server (:5300). **Four files changed today that need a hard reload (CTRL+SHIFT+R) before anything is
  judged:** `morph.js` · `morph_emit.js` · `composer.html` · the new `note_card.js`.
- **Latest deliverable:** §321–323 — the note card, the stack cycling, the marks toggle, the grain-drag fixes and the hung-note fix.
  All verified in the running app on a `zz-ai-` copy (deleted). 62 checks in `tools/fade_check.js`, `morph_septet_check` ALL PASS.
- **NEXT CONCRETE STEP:** none for the AI. **Wait for his verdicts**, fix what he marks. If he wants to keep building instead, item 4
  above is the queue.
- **Resume reads:** RUNNING_LOG §311–323 (the fade's whole arc, in order) · `docs/MORPH_NOTES.md` §3 (the last four entries are this
  day) · `docs/PANEL_CAPTURES.md` (his BLOOM settings of 2026-09-09) · `docs/NITS.md` (two new).
- **The deliberately-uncommitted list:** `scores/piece-septet.json`, `bank/morph_models.json`, `reaper/septet_rack.rpp`, four new
  `bank/actuals/ACT-*.json` and three `scores/piece-septet-v1.28–1.30-*.json` — **all his own work from today, none of it the AI's,
  none of it committed.** `tools/unsaved_check.js` still reports the same three working copies as yesterday (`piano-harmonics-test`,
  `trill-curve-test`, `trillBuildTst`) — D17: his to Save or Reload, never the AI's to touch.
- **A known failing check, not a regression:** `tools/cresc_check.js` fails one assertion. It hard-codes **18** morph re-breath pairs
  read out of his live `piece-septet.json`, and that morph is no longer in it. It failed identically before this session. → NITS.

**Earlier sessions, one line each:** **5** — folded into 6 above (same day). **4** (2026-09-06 → 08) the BEATING tool (parked), the
morph panel the tuba way + the pitch source, three piano/strike tools (1i · 1j · 1k), **the crescendo suite 1l–1o**, D11's curve
channels wired — §111–310. **3** (2026-09-04 → 06) the piece to #31 / 72 s, the drawer U5–U13b, the trill module phases 0–3, the curve
windows (D18–D21), timestamped playback — §65–110. **2** the strikes drawer and the sandbox. **1** the port from the tuba piece.

**Open questions:** Q1 the flute doubling (piccolo vs bass flute) · Q5 print format (A3 landscape) · Q7 the bass clarinet's bottom B♭1.

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
