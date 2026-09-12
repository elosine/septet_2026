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
no tool calls beyond the resume reads. Start only on his word.

**SESSION 9 — 2026-09-12, Fable 5.1 (+ Opus 5 for the four) — (mid-session checkpoint, written on Fable at his /checkpoint; the
rule is WRAP ON OPUS — next time switch first).** *(RUNNING_LOG §405–§410; STRIKES_TOOL §AH; CN-65 · CN-66 · CN-67; SWEEP #10.)*

- **CHECKPOINT 2 — 2026-09-12 evening, Fable 5.1 — PLAN 1t WRITTEN AT HIS WORD ("assumption yes. can you make plan for opus to build
  after clear").** The afternoon was one planning conversation (RUNNING_LOG §411–§418; CN-68 → CN-72): the chain — strikes alternating
  with crescendos — settled as ITEM BY ITEM IN THE SCORE: the drawer makes only the strikes; a panel on a selection makes the crescendos.
  **Chords mode and fill mode DEPRECATED at his word (§413)** — left in the code, not offered again.
  **NEXT CONCRETE STEP: `/clear` → switch to OPUS → `/postclear` → BUILD PLAN 1t** on a copy at :5301, steps 1–6 in order, the walk
  with his scenario, then he hears it. **Resume reads: PLAN 1t · STRIKES_TOOL §AI.** Nothing else — the plan is self-contained.
  CN-65 (N1) is paused, not dropped: his CN-67 verdict and the strikes-page eye are still pending. Committed and pushed: the five docs.
  His score files stay uncommitted (the list below unchanged).
- **The task: HIS FIRST PASS AT CN-65 IN THE DRAWER — composing, not building.** He is in the composer at :5300, the strikes drawer
  open, the chord-per-onset card in use. Everything built today is pushed; the page needs CTRL+SHIFT+R after each build.
- **Built today, all in `score/public/strike_sounds.js`, all pushed:** the four (§407: rested-first · `piano count` · the top-up that may
  double · `piano 8va`) · **`banner in turn` starts at the HIGHLIGHTED strike** (§408 — #14 highlighted → onsets get #14, #15 …) ·
  **CN-67: the piano in ONE HAND per onset, the hands alternating** (§409 — `hands: one, alternating` on the piano row, `hand` per
  onset; the window one reach wide, wholly above or below the last piano chord, side alternating; leftovers → doubles → the same
  pitch again at the octave, his word) · `piano 8va` released to **±4** · the strip's rings: **piano solid blue, ensemble dashed
  gold, the count `4+5`** (§410).
- **Latest deliverable:** his take `ChordStrikes01a-even` in `bank/panel_snapshots.json` (onset 1 ← #0 · max 4 · piano 4 · 8va −1;
  onsets 2–14 ← #1 … #13) — verified in the file. A second pattern was in hand at the checkpoint (from **#23**, 7 notes, 840 ms, gap
  140, one hand) — his tab, unsaved as a take unless he took it.
- **NEXT CONCRETE STEP (his, not the AI's):** keep composing the CN-65 passage in his tab — `banner in turn` from the highlighted
  strike · `piano count` per onset · `hands: one, alternating` · Hear · take. **The AI's next step:** answer what he asks, log any
  fault to `docs/SWEEP_LIST.md` (batch, don't fix — unless it blocks, as today's two did), journal as it happens. When he stops:
  his verdict on CN-67 in the app (it is proven headlessly only, §409) → STRIKES_TOOL §AH6 marked walked or not.
- **Resume reads: nothing beyond §2.** (STRIKES_TOOL §AH only if a drawer fault comes up; CN-65/CN-67 in COMPOSITION_NOTES only if
  the passage's rule is in question.)
- **Pending from him:** SWEEP #10 — `max` counts the piano in; he wants `max` = the six and the piano by `piano count` alone ("leave
  it for now") · CN-67's L.H./R.H. marking in the notation (a later rule) · the older list below unchanged.
- **Deferred still:** AH5 proper (the piano's own voicing per onset — CN-67 is its one-hand half) · the hand override · AB3.

**Last session (8 — 2026-09-10 → 11, Claude Code / Opus 5 + Fable 5.1) — RUNNING_LOG §352–§401n.** A long session in three movements:

- **The tools stopped being the work.** He named the one-fault-at-a-time loop as the problem; `docs/SWEEP_LIST.md` opened (log a
  fault while composing, batch the fix). Then the strikes drawer was unblocked to his brief (chords at an onset, NOTES mode), the
  passage collection built, and the piano's balance measured — **his own finding:** the probe's CC7 127 wiped every plugin trim, so
  a plugin volume knob is the wrong place for a per-voice trim in this system.
- **PHASE 2 OPENED — the notation layer.** **PLAN 2a built** (engine → seven parts: clefs, written pitch, the piano's grand staff,
  #2's chord rules, 148 techniques classified). **PLAN 2d built** (notate while composing: ids never re-issued · the choices
  sidecar · **R** rebuilds the page from the last Save · orphans listed, never dropped · move-to-part in the note card · **G** beams).
- **SECTION 1's STRIKES NOTATED, rule by rule with him (§399–§401n).** Every strike at its own onset with its own GC ("as
  millisecond/pixel accurate as possible"); the tuba staccato look; the stack on the head side mirrored with a classic stem; fff
  and the technique text on every note; the flute's tongue rams folded into C3–D4 and written at the fingering (+M7) with a range
  alert; the grand staff's gap at **6 ss** (#2's LilyPond-measured standard); the piano's GC one lane tall landing between its
  staves; ottava from the 4th ledger line. **`docs/NOTATION_STANDARDS.md` §1 is the index: rule → registry key → journal §.**
- **Two silences and a zoom, all diagnosed not guessed:** the notation player passed no `score.tracks`, so every septet note
  resolved to no instrument (§401f); it also stretched notes to the IR's sample-true lengths, now the composer score's own
  (§401g); the page that "didn't fit" was Chrome's per-origin zoom on :5300, CTRL+0 (§401i).

**STATE — THE STRIKES 0–176 s ARE ON THE PAGE (session 8 end). RUNNING_LOG §399–§404. RESUME FROM HERE.**

- **Nothing in flight; everything pushed.** The IR `strike1` = **511 strikes, 0–176 s, 15 pages**, built from `piece-septet`
  ITSELF (RUNNING_LOG §402 — he ran `foldFlute()` and Saved at 22:40, and removed a doubled piano note at 67.79; the copy is
  deleted, score and page are one thing again). **Trills (zones) and the morph curves (from 183 s) are deliberately NOT notated —
  next notation session, his word.**
- **⚠ DO NOT PRESS R ON THE STRIKES PAGE** (RUNNING_LOG §403): R strips the recorded window and forces `--all`, so it widens 0–176 s to the whole piece and pulls in the morph material. A deletion in the composer → Save → the AI rebuilds (`--score piece-septet --w0 0 --w1 176 --bricks --id strike1 --exp`). **Parked fix (his "leave for now"): option A — R honours an IR's recorded window; `--all` gets its own key.**
- **Unseen / unheard by him:** the 15 pages; MIDI after the three fixes (ports · tracks · score lengths) — his SPACE is the test.
- **After the first wrap (§402–§404), all pushed:** he deleted three doubled piano notes (67.79 · 156.20 · one more) and ran
  `foldFlute()` himself — so the page is built from `piece-septet` ITSELF, the copy is gone, and **511 strikes** stand. Then
  **§404 THE BUFFER AFTER THE CLEF:** a page cut can land exactly on a note's onset, and its unit (head · accidental · ledgers,
  up to 3.4 ss) then hangs into the gutter over the clef — `page_rules.musicStartBufferSs: 4.2` opens each page window that
  many staff spaces early. Proven across all 15 pages: leftmost ink 73.4 px against a 72 px gutter.
- **NEXT CONCRETE STEP:** his eye and ear over the 15 pages (:5300 → `/notation/app/notation.html` → CTRL+SHIFT+R → picker
  "piece-septet · strikes 0–176 s" → video · SPACE for MIDI). Then the next notation session: **trills' written look, then the
  morph curves** — planning method on Fable, build on Opus after a clear.
- **Session 9 (2026-09-12) in one line:** the four (§407) · `banner in turn` from the highlighted strike (§408) · CN-67 one hand,
  alternating (§409) · 8va ±4 · the strip's blue piano rings (§410) · SWEEP #10 logged. He is composing CN-65 in the drawer.
- **Pending decisions from him:** the **15 geometry touches** around the piano over 0–176 s (§401n — the piano's stack meets BCl's
  or Vn1's in the band between lanes; fix ladder = flip a chain · per-page nudge · more piano air) · the Vn1 high-note spill
  (~1 ss over its lane top) · whether the ottava hook's 0.30 ss reads · the drawer verdicts (STRIKES_TOOL §AG) · whether to commit
  his two passages · track 7's Kontakt.
- **Deliberately uncommitted — all his:** `scores/piece-septet.json` (his 14:31 editing) · `bank/panel_snapshots.json` ·
  `reaper/septet_rack.rpp` · `bank/passages/accentedcres01*.json` · `scores/SeptetSec03-Materials-B/-C/-D/-a.json`.
  *(The IR and its picker row are committed as of §402 — built from his score, no copy in the way.)*
- **Unsaved working copies** (`tools/unsaved_check.js`): cres-run01 · cres2strike · piano-harmonics-test · Sec3-Materials (never
  saved) · SeptetSec03-Materials-D · trill-curve-test · trillBuildTst — **D17: his to Save or Reload, never the AI's to touch.**
- **Servers the AI started** (his to keep or kill): #2's performance score :3001 (`pno2perc2-perf-3001`) · the tuba's :5200
  (`tubas-5200`) — launch entries in `.claude/launch.json`.
- **Tests:** `node tools/test_septet_notation.js` (86) · `test_identity` (20) · the tuba battery staged per
  `notation/ir/README.md` — layout · render · animobj · splice · stamps · coords · graphic · pattern_fit GREEN (render's snapshot
  regenerated once on purpose, §401b); the standing REDs unchanged.
- **Resume reads:** `docs/NOTATION_STANDARDS.md` §1 · RUNNING_LOG **§401n–§403**. Nothing else pre-emptively.

**NEXT STEPS · MODEL · CLEAR** *(the running thread — THE RHYTHM, CLAUDE.md. Keep current.)*

| # | Step | Model | Clear first? |
|---|---|---|---|
| ~~N0~~ | ~~BUILD the four~~ — **done 2026-09-12 (RUNNING_LOG §407):** built, harnessed, walked on a copy at :5301, 86 green, pushed | — | — |
| **N1b** | **► NEXT — BUILD PLAN 1t** (the chain: the crescendo panel on a selection · the playhead-to-end key · `unison` · free/busy ticks · the piano block on the plain strike), steps 1–6 in order on a copy at :5301, the walk with his scenario (§416's eight steps), then his ear. Read PLAN 1t + STRIKES_TOOL §AI only | **Opus** | **yes — clear now, switch, /postclear** |
| **N1** | **PAUSED for N1b (2026-09-12 evening) — he was composing CN-65 in the drawer** (from #0 in `ChordStrikes01a-even`, a second pattern from #23). The AI answers, logs faults to SWEEP_LIST, journals. Then: **his verdict on CN-67 in the app** (headless-proven only) — then his eye and ear over the strikes 0–176 s (:5300 → `/notation/app/notation.html` → CTRL+SHIFT+R → picker → video · SPACE) | **Fable** (composing questions) · **Opus** for any fix he does ask for | no |
| ~~N2~~ | ~~The fold in his tab → rebuild from `piece-septet` → delete the copy~~ — **done 2026-09-11 late (RUNNING_LOG §402)** | — | — |
| **N3** | **The 15 geometry touches** + the Vn1 spill — his verdict, then the fix ladder | **Opus** | no |
| **N4** | **Next notation session: trills' written look, then the morph curves** — planning method, then build | **Fable** to plan, **Opus** to build | **yes** — wrap on Opus, clear, switch |
| **N5** | Still open from before: the drawer verdicts (STRIKES_TOOL §AG) · the pinned player (§AF2) · the rhythm drawer remodel (§AE, one decision from him) · PLAN 1q proper | **Opus** | no |

**The standing rule:** Fable for the turns where a wrong reading costs a day; Opus for every turn where the plan is already on
paper. Wrap on Opus, always. **Fable's allotment is the one he watches** — fewest round trips, no Fable subagents, minimal
resume reads.

**Earlier sessions, one line each:** **8** (2026-09-10 → 11) above. **7** (2026-09-09 → 10) the strikes drawer revised overnight
at his commission (the sound at an onset: note · chord · crescendo with Hear = Insert), the console lines `crescRun` ·
`chordRun` · `goTo`, then a defect-clearing day whose nine faults were all one rule wired into one path and not its sibling
(→ PLAN 1q-PRINCIPLE) — §324–351. **6** (2026-09-09) the morph's fade found to live in CC7, timestamped playback, the note card
— §311–323. **5** folded into 6. **4** (2026-09-06 → 08) the BEATING tool (parked), the morph panel the tuba way, the crescendo
suite 1l–1o, D11's curve channels — §111–310. **3** (2026-09-04 → 06) the piece to #31 / 72 s, the drawer U5–U13b, the trill
module phases 0–3, the curve windows (D18–D21) — §65–110. **2** the strikes drawer and the sandbox. **1** the port from the tuba piece.

**Open questions:** Q7 the bass clarinet's bottom B♭1. *(Q1 closed 2026-09-11: no flute doubling, CN-62. Q5 closed 2026-09-11:
A3 landscape, RUNNING_LOG §380.)*

**Blockers:** none.


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
- **The title — tentative: _Scattered Substance_** *(2026-09-11, CN-64)*. Confirm or change before the cover and the
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
