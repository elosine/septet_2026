# RUNNING LOG — the lab journal

> **Why this exists** (composer, 2026-09-03): *"I'd like to keep a running journal like lab
> notes, so I can look back on decisions or comments, theory, philosophy, etcetera, or how
> we actually made something — if I wanted to write a paper later about this. And I would
> expect the AI agent to do this automatically as a habit."*
>
> Rules (from `live-electronics-engine`, adopted as this repo's D4): written **as the work
> happens**, at the end of any exchange that produced a decision, a result, a rejection, a
> measurement, or a theoretical point — never at session end. Each entry: what prompted
> it, in the composer's words; what was tried, in order; the numbers; what was rejected
> and why; what was decided and why that rather than the alternative. **Append-only;
> corrections are new entries.** Entries are numbered §N and never renumbered.
> Current state lives in `PROJECT_JOURNAL.md` §2 and `PLAN.md`; this is the trail.

---

# 2026-09-03 — session 1 (Claude Code / Fable 5.1)

## §1. The project opens: the call, the instrumentation, the lineage

The composer named the session *"Tempus Septet 2026"* and set the frame: *"I'll be
starting a new composition; the software will largely be based on the tuba piece but may
reference the other repos; the call is in this repo in the docs folder; it will be for
flute (piccolo/bass flute), bass clarinet, piano, violin 1, violin 2, viola, cello."* —
the full septet the call allows. First instruction: *"don't port or do anything yet, but be
ready to discuss a plan."*

The call (`docs/Tempus-Lab2026_Application_English.pdf`, read in full): TEMPUS LAB 2026,
Ensemble Tempus Konnex, Leipzig. Deadline 2026-10-15 23:59 CET. Max 12 min. PDF score,
max DIN A3. €25 fee. Concerts 26/27/28 Nov 2026; if selected, score + parts free of charge
4 weeks before. Instrument list: flute (incl. piccolo, alto, bass), clarinet (incl. bass),
piano, vn I, vn II, va, vc — *"compositions featuring instruments not listed above will
not be considered."* (Flag: electronics are not listed. Journal Q3.)

## §2. The survey — what the tuba stack is and how tuba-bound it is (measured, not inferred)

Read-only pass over #4 (`for_seven_tubas`, 857 commits, last commit 2026-09-03), #3 (49
commits, paused 2026-08-10 at the first score objects), #2 (237 commits, composition
complete, perf-score pipeline), #1 (deployed at justinwenloyang.com). Method: docs first
(CLAUDE.md, journals §1/§2, PLAN, ARCHITECTURE), then targeted greps — no whole-file reads
of code.

**The tuba-coupling count** (`grep -ic tuba`, source files only):

| file | mentions | what they are |
|---|---|---|
| `sandbox/instruments.js` | 93 | the palette itself — 100 % rewrite |
| `score/public/composer.html` | 46 | TRACKS array (10), lane labels, a select, 2 `INSTRUMENTS.tuba1`, 1 port arithmetic |
| `tools/pitch_beat.js` | 24 | tuba-piece research (beating pairs) — not ported |
| `score/public/clusterview.html` | 13 | research view — port, low priority |
| `notation/lib/layout.js` | 2 | comments |
| `notation/registry/container.json` | 2 | notes |
| `score/server.js` | 1 | the banner comment |

Conclusion: **the engine is instrument-agnostic by construction; the palette is the whole
coupling.** Sizes for scale: composer.html 810 KB; server.js 54 KB, zero dependencies;
notation `layout.js` 136 KB; `glyphs.json` holds **9 glyph kinds and exactly one clef
(bass)**; `grep -ril treble notation/` → nothing. So notation's multi-instrument gaps
(clefs, transposition, piano grand staff, chord columns) are real and are phase-2 work.

**Rejected framing, for the record:** "port the notation engine and adapt it now." The
composer's own reasoning settled it (§3 below): the IR layer decouples composing from
notation, so the engine is carried over untouched and adapted when a real page exists.

## §3. The composer's plan, in his words (dictated; cleaned from speech-to-text, content untouched)

> *"As a general rule, I don't want to get too bogged down in technical details of porting
> and code and such, but I want to do a good, solid job and not leave out things now that
> might bite later. So, essentially, I just finished the tuba piece, so I'll be using very
> similar structures. So I think the first step is to figure out what it takes to bring the
> composer module over — how to get a clean port that preserves all the functionality —
> and then just an evaluation of if that's enough for now to get started, or do we really
> need to consider the notation layer from the start. I think not, probably, because of the
> IR layer. This will be essentially the same format as the tuba score; it will still be an
> animated score using the similar animated devices. And I'll be finishing up the
> performance score parts in the tuba piece, and then we can port those over here when the
> time comes."*

> *"The strings, the samples, and everything, and how to work with the sample libraries are
> done in the string quartet piece. And the piano is the same thing — library, everything
> established in the piano-percussion piece. So I want to start laying out a plan of porting
> the composer module and, of course, all the IR and whatever infrastructure we need, and
> setting up the Reaper session and establishing all the MIDI rules and how to achieve
> different articulations and effects using the sample libraries."*

> *"Ideally, I would compose a piece with the sample libraries and the composer score, and
> then we would notate the piece like I did with the tuba piece in a separate phase, and
> then we would prepare the performance versions in a third phase. And as part of the
> notate phase there's a phase 2b, the presentation score — a video for the submission and
> also a print score — and then the performance score before rehearsals begin. But the tuba
> modules should be in place by then, so we'd probably just use the exact same one."*

> *"One thing to think about is I may just use the IRCAM Solo Instruments 2 for the strings.
> I may not; it depends on the functionality, so we'll do a compare. The string quartet was
> done with Xsample, but I think it was a bit idiosyncratic. Also look in the bass clarinet
> harp piece, because we used Xsample bass clarinet and I think worked out some more of how
> to use the control channels effectively with Xsample. It might be easier to deal with
> Xsample; I just need to compare the functionality with the IRCAM to see if one is better
> than the other. It might be easier to work all in IRCAM, but I don't wanna lose any of
> that Xsample functionality for the strings."*

Recorded as D2 (format), D3 (phases) and PLAN 0d (the strings compare).

## §4. Decisions D1–D6 and what was rejected (see journal §4 for the canonical text)

- **Seeding method.** Three options were put: (a) clone-and-prune the tuba repo (the string
  quartet's own IV.3 recipe), (b) copy-forward selected folders with the palette rewritten
  (how #4 was made from #3, its D1), (c) extract a shared engine package. **(b) chosen.**
  (a) rejected because 528 JSON research files and 84 tuba docs would sit in every cold
  session's path (#3's D5 minimal-reading principle); (c) rejected for the calendar — six
  weeks to the deadline — not on merit; it returns after the septet.
- **Ports 5300/4800** so the tuba servers (5200/4700) keep running while the performance
  modules are built there.
- **The flute doubling = one track with an instrument switch** (D6). The alternative —
  three tracks — was rejected because the animated score reads one lane per player, and a
  player cannot be three lanes.

## §5. Libraries on hand — facts from the manuals, not memory

- SI2 manual (`#3/docs/manuals/extracted/IRCAM_Solo_Instruments_2_manual.txt`), Instrument
  List pp. 51–62: **FLUTE in C** (aeolian … flatterzunge … jet-whistle, key-click, play-and-
  sing, ~30 techniques), **CLARINET in B♭**, **VIOLIN / VIOLA / VIOLONCELLO** each with
  mute and lead-mute variants, ~40 techniques each incl. transitions (ordinario-to-sul-
  ponticello, ordinario-to-tremolo, pressured-to-ordinario), artificial harmonics,
  behind-the-bridge, col legno battuto/tratto, pizzicato-bartok, sul-ponticello-tremolo,
  trills. **No piccolo, no bass flute, no bass clarinet, no piano in SI2.** Parts "written
  at actual pitch" — the library plays sounding pitch; transposition is ours.
- Xsample: the woodwinds catalog text lists **Piccolo (348 samples), Alto Flute (493), Bass
  Flute (425)** — the catalog, not proof of ownership. Bass clarinet owned and deep-mapped
  in #3 (CC0 presets 1–88; CC1 MW crossfade *"like an actual player doing a crescendo"*;
  CC68/24 legato → glissando; CC82 round-robin; quarter-tone bend range).
- #1 used **X-Sample Contemporary Solo Strings**: CC0 articulations 89 senza vib, 95 pizz,
  71 pizz open (one-shot), 97 Bartók (one-shot), plus molto-vib and behind-the-bridge
  values; **12 MIDI channels in 3 banks (base/vibrato/volume) because CC120/123 did not
  reliably reset CC state** — a crescendo ending at CC7=127 left the channel loud. Gliss
  keyswitches B0 (mode) / G#1 (down) / A1 (up); CC68/24 legato "to investigate".
- #2 piano: **8Dio Steinway Grand** (velocity, CC64, range 21–108, port `Piano1` ch 1) and
  **IRCAM Prepared Piano 2** (harmonics ch 3/4 with CC21 pitch shift, 19.048 cents per
  step, 85 ms CC lead; muted ch 5).

Open (journal Q1/Q2): which flute-family library is installed; strings library verdict.

## §6. Flags raised, none resolved

1. **Electronics.** The call lists instruments only. If the live-electronics engine is to
   enter this piece, ask `scores@tempus-konnex.com` before designing around it.
2. **Page size.** #4 prints tabloid (279 × 432 mm); A3 is 297 × 420 mm — tabloid's long
   side is 12 mm over. Plan for A3 landscape (a format entry in `export_print.js`).
3. **Duration.** The tuba piece ran 12:29; this one is capped at 12:00.
4. **Penn State** (tuba repo): abstract hosting + form due Fri 2026-09-04, 11:59 pm ET.

## §7. The kit installed; what was deliberately not done

Installed: CLAUDE.md, README, journal, PLAN, PLANNER, this log, COMPOSITION_NOTES, NITS,
AI_METHODOLOGY + SESSION_HYGIENE (copied from #4, provenance note prepended), HOW_WE_WORK +
SESSION_PROTOCOL (copied from #3, one line changed: explicit staging instead of `git add -A`),
`.claude/commands/{checkpoint,postclear}` (from #4; the push line now follows this repo's
policy), `.gitignore` (from #4, trimmed). **No code copied** — PLAN 0b waits for the go.
The `live-electronics-engine` folder was granted as an additional working directory.

## §8. The composer's four answers, and the IR question settled

**The IR, in the composer's words:** *"I want to clarify one thing about the IR layer. I
was under the impression that this was basically the peak — this was the data layer that
would be created in the composition stage and then be used for all the other layers, just
converting the data. So I want to make sure that's understood and that's in there from the
beginning — or correct me if I'm misunderstanding something."*

**The answer, checked against the tuba repo rather than remembered:** half right, and the
half that matters. The IR IS the single source for every downstream score — the animated
notation app loads the IR first (`notation.html` `loadIr`), then fetches the save named in
`ir.source.score` only for the continuous data the IR references; print and video take
`--ir` and nothing else; #4's ARCHITECTURE.md line 354: *"everything draws from the IR
(save → IR → print / video / stands — one source, proven byte-identical for print vs
video)."* But it is **not created in the composition stage**: it is *derived* from the
composer save by the extractor (`notate_section.js` → `extract_core.js`), with provenance
on every node, deterministic derived ids, and authored overlays that re-attach by id, so
it can be regenerated whenever the save moves. The composer save (S1) stays the ground
truth of the composition. Consequence: composing never waits on the IR, and "in there from
the beginning" means the *save's shape* must carry what extraction needs — recorded as D9
with the seven-point list, and PLAN 0i proves it by running the extractor on a septet
test save instead of trusting the list. *Rejected framing:* "author the IR during
composition" — it would create a second copy of the composition to keep in sync, which is
exactly what #4's "reference, don't copy" law forbids.

**The flutes:** *"I'm not sure yet if I'm using piccolo or bass flute, but you're right,
it's on the same track in the score, so we'll just make those adjustments if the time
comes."* → CN-2; PLAN 0c.1 reworded; Q1 narrowed to "which one, and is its library
installed."

**Strings:** *"Let's go with the Xsample for the strings. I believe we've overcome most of
the hurdles with the bass clarinet, or at least re-examined them, so I probably shouldn't
have as much anxiety about that. We know how to switch techniques; we have a grasp on the
control channels, and a lot of them were used in the string quartet effectively. I think we
have to get some of the volume switching right — I guess I have a little bit of anxiety. I
don't want to get too bogged down in that, but we'll cross that when we get there. We just
need to get the CC7 nailed down."* → D7. The anxiety is well placed and bounded: #3's
Xsample findings are about CC1 (the MW crossfade) — a grep of the bass clarinet map and
the quirks ledger finds **no CC7 measurement on Xsample at all**; the quartet's three
channel banks exist because CC7 state persisted and CC120/123 did not reset it. So PLAN 0d
is repurposed from "library compare" to "CC7 → dB measured with #4's probe (it takes port
and channel as parameters) + the state rule verified + a one-page dynamics recipe." Small,
measurable, and it closes the one thing the quartet never closed.

**Electronics:** *"No live electronics in this piece. That was just to get you access to
some of the journaling techniques. I don't think we'll use any of the code from that
repo."* → Q3 closed; CLAUDE.md and the parking lot say so.

**Push:** *"Q4: go ahead and push after every commit."* → D8; CLAUDE.md, the checkpoint
command and the inherited HOW_WE_WORK / SESSION_PROTOCOL lines amended in place.

## §9. PLAN 0b — the composer module ported, and verified in the running app

**Prompted by:** the composer's *"go on 0b"*. Done on Fable in the same session (no
clear), because the plan was already written and the composer said go.

**0b.1 — the copy, byte-exact first.** `score/` (server, snapshots, palette, public/*),
`sandbox/` (serve, index, instruments), `tools/model_bank.js`, ten `bank/*.json` model and
preset files, `probes/*.ps1|*.py` + `cc7_map.json`, `docs/instrument_map.json`,
`start_score_server.bat`. `cmp`/`diff -rq` confirmed identical to `for_seven_tubas` before
any edit. NOT copied: the tuba material banks (CLOUD02*, CLUST01*, VERT01*, DB3*, GESTURE*,
cluster_bank, blast_taxonomy, actuals), `sandbox/motives/*` (4 tuba motives).

**0b.2 — the re-palette, as one patch script that asserts every match count before it
writes** (scratchpad `port_0b2.py`; it refused to run once — a string I expected once
occurred twice — and wrote nothing until the count was corrected). What changed, and why:
- `composer.html`: title · session default `septet` · seven lane `<div>`s and the track
  `<select>` (7 + META) · lane CSS 10 % × 10 → 14.2857 % × 7 · `TRACKS` = the seven
  instrument-keyed tracks with a `short` label · `META_LAYER` 10 → 7 · `layoutVersion` 3
  (+ a loud `console.warn` when a ten-lane tuba save is opened, never a silent drop) ·
  the record panel's technique list now follows the selected lane's instrument · the
  blast/cluster panel resolves port/channel/CC0 from the lane's recipe (`cgRoute`) instead
  of `'tuba' + n` arithmetic · every literal `10` that meant "lane count" → `META_LAYER`.
- **The one design addition: range-aware lane assignment.** `laneCanPlay(lane, pitch)`;
  a lane whose instrument cannot play the pitch scores `'hard'` in `assignBlast`,
  `assignCluster` and `bestLaneFor`, so the placement engines route around it the way they
  route around a busy player. The tubas were interchangeable; a violin lane is not a cello
  lane. Verified live: flute cannot take MIDI 40, cello can, violin 1 can take 100.
- `sonify_core.js`: the lane → instrument key now comes from the SAVE's own track table
  (`score.tracks[layer].instKey`), fallback `'tuba'+(n+1)` so piece #4 saves still play.
- `compiler.js`: `spec.parts || 10` (×7) → `partsDefault()` = `META_LAYER` at call time;
  `pulse_seq.js` / `multitempo.js` `LANES` likewise; `texture_panel.js` ten-player
  defaults → `META_LAYER`. `server.js` → port 5300; `sandbox/serve.js` → 4800.
- `auditionNote` gained an optional `cc0` (the Xsample articulation prelude) so an
  audition lands on the technique it names; the cluster-panel callers and the property
  panel's audition pads pass it through.

**0b.3 — bank skeletons:** empty-but-valid `cluster_bank.json` and `blast_taxonomy.json`
with the tuba files' key sets; `pulse_palette.json` emptied (its entries referenced tuba
sonorities S008–S047 and the Pulse/MT panels warned on every open); `palette.json` emptied.
`sandbox/instruments.js` rewritten as the seven-instrument SKELETON — every channel and
range marked provisional until 0e/0c: flute 28 SI2 techniques over `Flute` + `Fluteb`,
bass clarinet = piece #3's 13 CC0 presets verbatim, piano 3 preparations on one port,
strings = the quartet's 8 CC0 values with one-shot flags.

**0b.4 — verified in the running app, not by reading:**
- HTTP battery: **36/36 routes 200** (every script, every `/api/*` the page fetches, the
  static `/docs`, `/bank`, `/probes`, `/sandbox/instruments.js`).
- Save API: save → `versioned:false`; save again → `versioned:true`; list · load ·
  versions all correct; files seen on disk (270 bytes each); deleted after.
- Page: `Composer initialized`, **zero console errors** on a fresh tab; `TRACKS` = the
  seven ids; `META_LAYER` 7; `Composer.lanes` = lane1..lane7 + laneMeta with META at
  index 7; the track select = 7 + META; record panel = 7 lanes / 28 flute techniques;
  per-track ranges as written.
- Panels: Morph · Texture · Pulse · MT all open, no errors.
- UI save: clicking Save wrote `scores/septet.json` (layoutVersion 3, seven tracks) plus
  a version snapshot; both deleted afterwards — the composer names the first real file.
- Sandbox on 4800: instrument menu = the seven, technique menu = 28 for the flute,
  `/motives` 200. **Web MIDI cannot be verified in the in-app browser** ("MIDI access
  denied" is its policy) — the port list check moves to 0e, on the composer's Chrome.

**Two defects the running app found that reading did not:**
1. `this.lanes` was a literal list of eleven element ids (`lane1..lane10, laneMeta`) —
   seven lanes left three nulls and put META at index 10, so `init()` threw on the first
   load and the record panel never populated. Now derived from `TRACKS`.
2. **The server died mid-port**: it served the page at the moment the stale instrument
   file was deleted, and `fs.createReadStream` on a missing file raised an unhandled
   stream error that killed the process. Guarded with an existence check → 404. The
   probes route already had the guard; the generic static route too.

**Deferred, filed in NITS:** `clusterview.html` / `chordview.html` still address `tuba1..`
ports (tuba research viewers, inert until a cluster bank exists) · `multitempo.js` `LO/HI`
30–67 is the tuba range · probes' `$Port = 'tuba1'` defaults · the copied texture/morph
presets carry "10 tubas" labels · `docs/instrument_map.json` has zero instruments.

**Deliberately left in place:** the bank presets tuned on tubas (morph models, texture
models/params, shape presets, panel snapshots) — the composer's own reference material,
labelled by origin; replaced by septet presets as they are made.

## §10. Correction to §9: a day-one canonical stub exists after all

§9 says the UI-saved `scores/septet.json` was deleted and "the composer names the first
real file." After that, a cold reload of the app showed one 404: the app's default session
is bound to `septet`, and with no file of that name every fresh start opened on "Score not
found". So `scores/septet.json` was written again through the running server — an empty
score with the seven-track table, `layoutVersion` 3 and a metadata note saying what it is —
and **committed as the day-one canonical stub** (commit `6d6a6f3`), exactly as piece #4
carried its `7tubas.json` stub from day 1. The piece itself will live in the `piece-sNN`
chain once composing starts (piece #4's NAMING.md); the stub only makes the cold start
clean. Filed as a correction rather than an edit to §9, per the journal rules.

## §11. Session 1 checkpoint (before the clear)

Wrapped on Fable at the composer's `/checkpoint`. Position: 0a ☑ · 0b ☑ · next 0g + 0i
(Opus, one session). The working tree was clean after `6d6a6f3`; the preview servers on
5300/4800 belong to this session and stop with it — the next session starts them from
`.claude/launch.json` (`score`, `sandbox`) or with `node score/server.js`.

## §12. PLAN 0g — the notation/IR stack carried over, and proven whole by its own batteries

**Prompted by:** the composer's go after the postclear check-in — *"A) good to go; stay
with fable for now"* — 0g then 0i in one session on Fable, not the Opus the checkpoint had
pencilled in (offered as B1/B2; the composer chose B1).

**0g.1 — the copy, byte-exact.** 97 tracked files from `for_seven_tubas`, listed with
`git ls-files` (so loose local files could not come along), moved by a tar pipe, then every
one `cmp`-ed against its source: **97/97 identical.** By area: `notation/lib` 21 ·
`registry` 4 · `schema` 3 · `glyph_sources` 5 · `app` 3 (`notation.html` + the two Crimson
Pro faces) · `GLYPH_EXTENSION_CONTRACT.md` · `audio/.gitignore` · tools 22 — the
checkpoint's nine (notate_section, notate_block, ir_extract, ir_extract_golden,
ir_validate, ir_validate_battery, export_print, export_video, prove_unmoved) plus, by the
rule *carry the method, not the renders*: the glyph-capture pipeline (`port_glyphs` + three
`glyph_probe_*`, with `notation/glyph_sources/` and `fixtures/lp_probes/` — 2a needs
treble and alto clefs), `pattern_analyze` (the D63 analyser behind `--pattern`),
`protrusion_detect`, `audit_playability`, `export_midi` and `test_sonify_core` (both named
by NOTATION_WORKFLOW), `notate_morph` (the CLI for the copied `morph_overlays.js`),
`make_cut` (the video's cut list), `set_brick` + `move_object` (the S1 editors the notation
loop used), `v0_proofs` (the true-size container proofs the septet's own A3 / seven-lane
container will need) · 13 test batteries (every `test_*` that exercises `notation/lib`) ·
`tools/fixtures` 15 · `print/` 7 (`score/build.sh`, the `cover/` generator + SVGs) ·
`docs/NOTATION_STANDARDS.md` + `NOTATION_WORKFLOW.md` as reference copies with one
provenance line prepended — the only two files not byte-identical, by design.

**Deliberately NOT copied, by name:** the 18 tuba IR pages + `index.json` (see 0g.2),
`notation/app/proof*.svg` + `proofs_v0/` (tuba renders), `notation/audio/demo-heldmax.mid`,
`notation/video/`, #4's `package-lock.json` (regenerated here under the septet's name), the
score-arc and demo tools (`extract_section`, `build_versions`, `gen_demo_heldmax_midi`, the
`cres_*` / `piece_s*` / `cloud02*` generators), `docs/NOTATION_ARCHITECTURE.md` (read in
#4, cited by path).

**Three small things of our own:** `package.json` written for this repo — the same single
dependency `@resvg/resvg-js ^2.6.2`, and `pngjs ^7.0.0` recorded as *optional* because
`export_video --probe` needs it behind a try/catch and #4 had it installed but never
declared it (`npm install` → resvg 2.6.2 + pngjs 7.0.0, lockfile generated) ·
`.gitignore`: `fonts/` narrowed to `/fonts/` — the inherited pattern matches a `fonts`
directory at ANY depth and would have swallowed `notation/app/fonts/` (in #4 those two
files were tracked before the rule existed); Crimson Pro is SIL OFL, redistributable, and
the app, `export_print` and `export_video` read it from there · `notation/ir/README.md` —
what lives there, and the staging recipe of 0g.2.

**0g.2 — the decision the checkpoint did not foresee: the batteries hard-code tuba pages.**
`test_render / layout / animobj / splice / extract_played / midiplayer / pattern_fit /
notate_block`, `ir_extract_golden` and `ir_validate_battery` read
`notation/ir/{trance-bar-01, morph-window-01, db1, db1-all-x01, trance-section-01,
section1-e20, section1-e30, density-apex-01}` by name and, through `--against-source`,
nine tuba scores (`tranceA002f`, `piece-final-draft-001`, `piece-s25-finished01`,
`piece-s23`, `piece-s27`, `piece-s28`, `cloud02-10track`, `cloud02i-b`, `cloud02i-b2`).
Options weighed: (a) commit the pages as fixtures — 14 MB of another piece's notation in
this repo, `db1` alone 6.6 MB, and the checkpoint said not to; (b) repoint ten test files
at a fixtures directory — an adaptation now, after which `cmp` no longer proves the copy;
(c) **stage the pages and scores temporarily, run everything, delete, write the recipe
down** — chosen. PLAN 0g's own words are "run the test batteries ONCE to prove the copy is
whole"; the septet's pages and re-snapshotted fixtures replace the tuba goldens at 2a.
Staged 27 files; removed 28 (the smoke page of 0g.4 included); `git status` afterwards
showed only the intended additions and nothing left behind in `scores/`.

**0g.3 — the batteries, on the staged goldens (Node 24.12):**

| battery | result |
|---|---|
| test_coords · test_stamps | GREEN — these need no pages; they run in the repo as committed |
| test_render · test_layout · test_animobj · test_splice · test_graphic | GREEN — census, clipping, staff math, A3 census, beaming, parachute, section smoke, every snapshot stable |
| test_pattern_fit | GREEN — 85 checks |
| ir_extract_golden | GREEN — extraction reproduces trance-bar-01 (19 events, 2 chunks) |
| ir_validate_battery | GREEN — 30 red + 6 green cases all behaved (36) |
| test_notate_block | GREEN — 65 passed, 0 failed |
| test_extract_played | RED, 1 failure: snapshot drift. **RED in #4 itself too** (run there read-only, nothing written): its fixture dates from #4 commit `faea00f` and the section1 pages moved on. The source's stale snapshot, not the copy → NITS |
| test_playability | RED: ENOENT `docs/SI2_staccato_lengths.md` — the tuba sample-length doc; the septet's tables come at 0c/0d |
| test_midiplayer · test_sonify_core | RED: `r.port` null — a tuba lane resolves to key `tuba1`, which the septet's `sandbox/instruments.js` skeleton does not carry, so the route is null. **Correction to §9:** the `'tuba'+(n+1)` fallback yields the KEY only; with no tuba recipe here a #4 save does not play in this repo. It was never going to need to |

Eleven GREEN. The four RED all trace to the septet's own tables or to the source — none to
the copied code.

**0g.4 — the 0i tool chain end to end, on known-good input:**
`node tools/notate_section.js --score tranceA002f --w0 58.4 --w1 66.8 --id 0g-smoke --exp`
(the golden's own window, all parts) → `READY: 107 events, 15 chunks {simple-bar: 15} ·
VALID vs source`, manifest entry written. Then, as an independent process,
`node tools/ir_validate.js notation/ir/0g-smoke.ir.json --against-source --complete` →
`VALID (107 events, 15 chunks, 0 overlays; against-source checked; completeness checked)`.
(The golden holds 19 events / 2 chunks for the same seconds because it was cut to one
part; `ir_extract_golden` reproduces it with its own parameters.) **The validator takes a
PATH, not an id** — the checkpoint's `ir_validate.js <id>` form dies with ENOENT
`<repo>/<id>`; the §2 instruction for 0i is corrected.

**0g.5 — the exporters.** `export_print.js --ir db1 --pages 1-2` → a 2-page PDF (145 KB)
through Chrome headless: Tabloid 17×11, ten lanes, 11.41 s/page, 67 pages for 753 s,
section marks BLOOM / CONVERGENCE / BALANCE / TRANCE read from the score's `ACT-` markers —
every one of those numbers is the tuba geometry; the A3 / seven-lane entry is on the 2a
list. `export_video.js --ir db1 --view video --probe 5` → one page rasterized through
resvg, `db1_video_t5-000.png` (60 KB), looked at: ten bass-clef staves, the cursor, the GC
bars, swells, heads with go lines — a real frame.

**0g.6 — verified in the running app.** `score/server.js` on 5300 (its inherited routes
already served `/notation/`): **22/22 routes 200** — the page, the ten lib scripts it
loads, `glyphs.json`, the three registry files, the schema, both fonts,
`/sandbox/instruments.js`, `/sonify_core.js`, `/api/notation/renders`,
`/probes/cc7_map.json`. `/notation/ir/index.json` is 404 by design — the manifest is
optional in the app (`try { … } catch { /* manifest optional */ }`) and `notate_section`
creates it. The app loads with its controls (view · parts T1–T10 · window / pages) and
shows `Error: IR fetch 404`, because its built-in picker names a tuba page: the pre-2a
state, exactly what PLAN 0g means by "carried over now, adapted later".

**What running it found that reading would not** (all filed in PLAN 0g's 2a list so they
do not bite): `classify.js` line 25 — `obj.layer === 10` → META shape, while the septet's
META is layer 7 — 0i meets this first · notation.html's T1–T10 parts and tuba IR ids ·
export_print / build.sh / make_cover geometry and names (and make_cover's `$OUT`
hard-coded to #4's scratchpad) · export_midi's port order · playability's tuba doc · the
snapshot fixtures are tuba hashes.

## §13. PLAN 0i — the S1 → IR contract, proved on a septet save

**Prompted by:** the 0i instruction in journal §2 — *make a 30-second test save, run it through
`notate_section` and `ir_validate`, read what fails, fix the S1 side now, file the classifier
work under 2a* — straight after 0g, under the same go from the composer.

**0i.1 — the test save, written by the app.** Composer app on :5300 (checked live: `Composer`
ready, 8 lanes, the seven tracks, `META_LAYER` 7, `nextId` 1, zero console errors on load).
In the page, twelve objects were built with the app's OWN insert-time object literals — the
blast/cluster insert shape: `wc-N` ids from `Composer.nextId`, `nodes` / `segments`,
`sonifyNote`, `technique`, `sonifyMode: 'plain'`, `recVel`; the META shape on `META_LAYER`
with the gesture's `groupId`; a marker `mk-1` with `time` / `label` — and saved with the
app's `saveSession()`, so the serializer (`collectData`: `layoutVersion` 3, `tracks`,
`objects`, `nextId`) and the server's `saveComposerScore` are the app's, not a hand-written
file. Content, 30 s, three lanes + META: flute (part 0) `ord` 1–3 s C5 · `ord` 5–7.5 s E5
with a three-node crescendo envelope · `staccato` 9 s G5; violin 1 (part 3) five `pizz` at
12.0 / 12.25 / 12.5 / 12.75 / 13.0 s (G4 A4 B4 C5 D5) under `groupId grp-0i-01`, plus the
gesture's META shape on layer 7, 12.0–13.3 s; cello (part 6) `arco` 15–22 s C3 · `bartok`
25 s G2; marker `ACT-0i-test` at 0. **`scores/0i-test.json`** (5118 B, the real septet
technique keys) and **`scores/0i-test-b.json`** (5139 B, the same objects with pizz →
staccato, arco → ord, bartok → staccato: the keys the tuba classifier knows). Both kept as
evidence (NAMING.md §1).

**0i.2 — four extractions, the failures read:**

| run | command | result |
|---|---|---|
| A | `--score 0i-test` (default `--parts 0-9`) | THROW `classify: no rule claims object wc-5 — {"layer":3,"technique":"pizz",…}` |
| B | `--score 0i-test --parts 0-6` | the same throw on `pizz` — the technique vocabulary, not the layer |
| C | `--score 0i-test-b` (default parts) | THROW `no rule claims object wc-10 — {"layer":7,…}` (no technique): **the META shape swept in as a sounding object** — `classify.js` line 25 says META = layer 10, and the default parts `0-9` include our layer 7 |
| D | `--score 0i-test-b --parts 0-6` | **READY: 10 events, 6 chunks {unresolved 5, simple-bar 1} · VALID vs source · in the picker**; 6 warnings `no staccato sample length for midi 67…79; using drawn length` |

Then, as an independent process, `node tools/ir_validate.js notation/ir/0i-test-b.ir.json
--against-source --complete` → `VALID (10 events, 6 chunks, 0 overlays; against-source
checked; completeness checked)`.

**0i.3 — what the page says** (`notation/ir/0i-test-b.ir.json`): `source {score: 0i-test-b,
window [0, 30], parts [0..6]}`; every event `derived`, ids `ev-wc-N`, chunk ids
`ch-<part>-wc-N`; the flute's three objects classified `ord-sustained` ·
`drawn-crescendo-curve` (the three-node envelope) · `fixed-oneshot`; **the five-note violin
run promoted to `trance-stream` and fitted as one `simple-bar` — unit 250 ms, beat 0.5 s
(120 bpm), subdivision 2, max error 0** — DB-6's segmentation-by-behaviour works on septet
data unchanged; the cello's two as `ord-sustained` + `fixed-oneshot`. The ORD family carries
its drawn duration (D9); the one-shots carry the drawn length with a warning, because the
copied `sample_lengths.json` is the tuba's and has no rows for these pitches.
`provenance.build` records the exact command. Markers are skipped by the extractor by design
and `--complete` does not count them; print reads them for section marks.

**0i.4 — in the running notation app:** `notation/ir/index.json` now lists the page (written
by notate_section; the app merged it — the built-in select is empty in this copy, so the
picker IS the manifest). Selecting it: no error, view `video`, the page renders — the
flute's events on the first staff with go lines and dynamics, the violin bar's GC device —
inside the tuba's 1920×1080 ten-lane video frame with T1–T10 labels (`container.json` and
the app's part labels: 2a).

**0i.5 — the D9 §5 checklist, verdicts:**
- **instrument-keyed tracks** — ✓ `tracks[].instKey`, `layoutVersion` 3; the extractor
  addresses parts by index, never by name.
- **a technique key on every sounding object** — ✓ the app's insert paths always write it;
  **rule written (NAMING.md §2.3):** a lane object without `sonifyNote` + `technique` is
  not sound.
- **the flute's instrument-in-hand as track data** — **resolved as a property of the
  technique recipe, not a separate field** (D6: piccolo / bass flute are techniques of the
  flute track; the note's `technique` says which instrument is in hand; clef and
  transposition metadata at 0c.5). Pending CN-2 for which instrument.
- **stable, never-reused ids** — ✓ `nextId` only grows; the derived ids are functions of
  the source ids, so authored overlays re-attach on regeneration.
- **one fixed layer convention** — **written (NAMING.md §2.2):** sounding = 0…6, META = 7 =
  `tracks.length`, never with `sonifyNote`. S1 is right; the pipeline's literal 10 is 2a's
  first line (`classify.js:25`, and notate_section's default parts). Until then:
  `--parts 0-6`.
- **the sounding-length rule per material** — **the S1 side named:**
  `bank/sample_lengths.json[technique][midi]`, read by the app's `techLength` and by the
  extractor alike; the septet's one-shot rows are measured at 0c/0d (PLAN 0c.6 added).
- **group ids on gestures** — ✓ member notes and the META shape share `groupId`.

**Filed under 2a** (PLAN): the technique → class map as registry data (every septet key
throws today, by design — CL-5, never a silent unknown); `classify.js` META layer from
`tracks.length`; notate_section's default parts from the score; part labels from
`tracks[].short`; the seven-lane container. **Decided against:** moving septet META shapes to
layer 10 to suit the tuba code — S1 must not contort to the pipeline (D9 §4) — and patching
the classifier now: 0g's rule is *carried over now, adapted later*, and the engine stays
byte-identical to #4 until a real page needs otherwise.

**Also this act:** `.gitattributes` with `*.sh text eol=lf`. Both repos run
`core.autocrlf=true` with no attributes; `print/score/build.sh` is LF today only because a
tool wrote it and it was never re-checked-out — a fresh clone would CRLF it and bash would
die on the carriage returns. One line here; #4's copy has the same exposure and is not ours
to touch.

**Position at the end of the act:** 0a · 0b · 0g · 0i closed. 0e (loopMIDI + Reaper rack)
needs the composer at the machine; 0c follows from the rack as built; 0d from 0c. The
AI-alone work that remains before 0e is 0c.5 (transposition + clef metadata) and nothing
else on the critical path.

## §14. Score order — the composer score follows the orchestral standard (D10)

**Prompted by** the composer, straight after 0i: *"Can you look at a standard orchestration
for the score layout? We'll lay out the composer score the same. My guess is strings at the
bottom, piano in the middle, flute on top. And then the others in between."*

**What the standard says** (Adler, *The Study of Orchestration*; Gould, *Behind Bars*, the
score-order chapter): woodwinds · brass · percussion · harp and keyboards · voices · strings,
top to bottom; inside a family, high to low. Applied to these seven: **flute · bass clarinet
· piano · violin 1 · violin 2 · viola · cello** — the guess, exactly. The bass clarinet takes
the clarinet's row under the flute (no oboe, no bassoon here); a piccolo or bass flute stays
on the flute's row (D6); the cello is the lowest string.

**The one alternative, and why not:** chamber music with piano and strings alone — trio,
quartet, quintet — puts the piano at the BOTTOM, under the strings; *Pierrot Lunaire*'s own
score does the same (flute, clarinet, violin, cello, recitation, piano). That is the
"piano as the partner of a string group" reading. A mixed ensemble with winds is read as a
small orchestra today (Ligeti's Chamber Concerto: winds, brass, keyboards, strings), and the
Tempus septet is that kind of ensemble. Orchestral order it is.

**Verified in the running app, not asserted:** on http://localhost:5300/composer.html the
lane labels sit in DOM order Flute | Bass Cl. | Piano | Violin 1 | Violin 2 | Viola | Cello
| META, and the screenshot shows the 0i test material where the order predicts it — the
flute's three shapes on the top lane, the cello's long note on the bottom one. The app was
ported at 0b with `TRACKS` in this order, so nothing changes; D10 records that this is now a
decision, not an accident of the port.

**What follows for phase 2** (PLAN 2a, one clause added): the notation score, the print
score and the parts keep the same top-to-bottom order; bracket groups winds · piano brace ·
strings.

## §15. 0e opens — where CC7 and control state stand (found in the sources), and the port / rack layout proposed

**Prompted by** the composer: *"let's establish where we are with CC seven and other control
channel messages. I don't have perfect recall about this. In the string quartet, I believe we
had a separate cc7 track and a separate track for the vibrato width; but we may have resolved
this in the tuba piece. Towards the end, there are some swells, and it could be that we reset.
We figured out how to reset everything in time … there were tests. I know we ran the test, so
let's find those and see where we are. … the tubas needed two tracks to handle all the presets
… we may need to do that as well for these instruments. Let's figure out the loopMIDI port
layout and the reaper layout, and then we'll start building."* Also settled at the top: the
Reaper session is laid out in score order (D10).

**1. The quartet (#1) — the memory is right: state was isolated by CHANNEL BANKS.**
`string_quartet_no1-composer/docs/PROJECT_JOURNAL.md` lines 64 and 240–243: 12 MIDI channels
in three banks — base (1–4), vibrato (5–8: CC4 + channel pressure), volume (9–12: CC7 ramps for
crescendo / long-tone gliss / pizz tremolo). *"Why separate banks? The synth doesn't reliably
respond to CC120/CC123 for state reset. A crescendo ending at CC7=127 leaves the channel
permanently loud. Isolating by bank prevents cross-contamination."* Secco cut-offs used CC7→0
because CC120/123 were ignored (`MIDI_MUSIC_GENERATION.md` line 285). The
`cc_mapping_registry.json` carries the CC0 articulation ids (89 arco/senza · 95 pizz · 71 pizz
open · 97 Bartók · 53 bow overpressure) with their state rules (`persistent` vs `one-shot`
with a revert pattern) — that is the seed of 0c.4.

**2. The tuba piece (#4) — resolved differently: OWN the state per event, don't isolate it.**
- *The loudness lane:* curve material (swells, morphs, drawn crescendos) is a CC7 stream
  through the MEASURED CC7→dB map — `probes/cc7_calibration_probe.ps1` (33 steps, retriggered
  note per step) + `probes/analyze_cc7.py` → `probes/cc7_map.json` (2026-08-10, tuba1 ch1,
  pitch 45, floor −120 dB, span 58.1 dB). One-shots and keyboard material play by velocity with
  **CC7 pinned at 127 before every note** (journal line 1269; RUNNING_LOG line 4648: *"CC7 =
  loudness … velocity is not the dynamic carrier"*, *"swell works"*).
- *The residue, and the reset the composer remembers:* `docs/ISSUES.md` **I1 "CC7 residue:
  tracks stuck quiet"** — swell grains end at zero, the last CC7 on the channel ≈ 0, UVI keeps
  channel volume per channel independent of patch. **Cure (2026-08-13):** (1) the stop-flush
  sweeps all-notes-off + CC7=127 + every technique's CC0 default across the ENTIRE technique
  map; (2) a **CC7 Reset** button in the composer top bar, same sweep on demand; (3) sandbox
  per-note immunity. **The test:** `cc7test-1track` — 20 back-to-back short surges on Tuba 1;
  equal loudness first-to-last = healthy lifecycle. I2 is the same anatomy for CC0 sub-patch
  state (the sweep re-asserts each technique's cc0 default).
- *"Reset everything in time" — the CC7 timing law* (`docs/MORPH_FINDINGS.md` "The CC7 timing
  law", day 14, ear-verified — composer: *"Blip gone."*): a cold attack needs real CC7 settle
  time — 2–5 ms is not enough, **250 ms is clean**; restoring CC7 upward while the release tail
  rings (~0.69 s) blips, so the **restore is delayed 2 s past the note-offs**. Constants
  `CC_LEAD_MS 250`, `TAIL_MS 2000` in `score/public/morph_emit.js`; panic = note-offs + CC123
  at once, bend centred at once, CC7=127 restore at +2 s. Also: SI2 responds to velocity AND
  CC7 (D36, then re-read: the "attack at CC7=0" was the timing, not the velocity).
- **So in #4 there are no CC7 or vibrato banks.** One UVI multi per port, one channel per
  technique, and the EMITTER owns the state: prelude (CC0 + CC7, 150–250 ms ahead) → note →
  delayed restore → stop-sweep. The two-track pattern the composer remembers is the UVI
  16-part limit only: `Tuba1 SI2` (16 techniques) + `Tuba1b SI2` (the rest) on ports `tuba1` /
  `tuba1b` — 20 tracks for ten tubas, plus a `REC` track. (`7_tubas_rack.rpp` carries the
  `Tuba8 SI2` / `Tuba8b SI2` pair TWICE — a duplicate not to inherit.)

**3. What is NOT settled, and is exactly PLAN 0d.** Everything above was measured on SI2 in
UVI. The septet's bass clarinet and strings are **Xsample in Kontakt**: CC1 is the timbre
dynamic on MW presets (#3 `XSAMPLE_BASSCL_map.md`: *"CC1 pre-set needed on MW presets (at 0 =
near silence)"*, the standing recipe "sustained dynamics = CC1 curves"); CC7 is Kontakt's
volume — it worked as the crescendo ramp on the quartet's Xsample strings, but its dB law was
never measured (#3 measured only the CC1 crossfade); vibrato width on Xsample was CC4 (+
aftertouch) in the quartet. **The rule to test at 0d.2, stated now:** the per-event prelude
writes EVERY CC the technique uses — CC0, CC1, CC4, CC7 — and the stop-sweep restores every
default; channel banks return only if the ear test on Xsample fails.

**4. The rack pattern, from #3's ledger and #4's rack (`SAMPLER_QUIRKS.md` Reaper section):**
one Reaper track per loopMIDI port · port name = the recipe's port, case-exact · track input =
that port, Source channel **All**, no "map input to channel" · **input monitoring ON** (the
`REC` line's 3rd field = 1 — *"the #1 silent killer … cost us a full session"*) · new loopMIDI
ports appear only after Preferences → MIDI Devices → Reset all MIDI devices, then Enable
input · hardware inputs (Keystation, UMC1820) **disabled** in Reaper and auto-enable OFF —
hardware MIDI is single-client on Windows and Reaper would starve Chrome's Web MIDI · a `REC`
audio track (record mode: output, stereo) receiving from the track under test — #4's received
Tuba 1 only; the probes' `.wav` come from it.

**5. The machine today** (winmm, 2026-09-03): 33 MIDI outs — `tuba1..10` + `b`, `Accordion`,
`BassCl`, `Harp`, `Piano1`, `Piano2`, `Perc1-A/B/C`, `Perc2-A/B/C`, `reaper1`, the UMC1820,
the GS synth. loopMIDI running; Reaper not running. **`BassCl` already exists** (piece #3,
same instrument, same name as the septet skeleton) — reuse it.

**6. The layout PROPOSED to the composer** (decision pending; PLAN 0e rewritten when
confirmed):

| # | loopMIDI port | Reaper track (score order, D10) | plugin | channels |
|---|---|---|---|---|
| 1 | `Flute` | Flute SI2 | UVI Workstation, SI2 Flute multi | 16 techniques, one per part A1–A16 |
| 2 | `Fluteb` | Fluteb SI2 | UVI Workstation, second instance | the remaining 12 (the tuba pattern) |
| 3 | `BassCl` (exists) | Bass Clarinet XS | Kontakt 8, Xsample bass clarinet | ch 1; CC0 selects the preset |
| 4 | `Piano` | Piano 8Dio | Kontakt 8, 8Dio Steinway | ch 1 |
| 4 | `Piano` (same) | Piano PP2 | UVI Workstation, IRCAM Prepared Piano 2 | parts A3 harmonics, A5 muted — #2's proven layout (`HARMONICS_PIANO_PLAN.md` Phase 6) |
| 5–8 | `Vn1` `Vn2` `Va` `Vc` | Vn1 XS · Vn2 XS · Va XS · Vc XS | Kontakt 8, Xsample Contemporary Solo Strings | ch 1 each; CC0 articulations; no banks unless 0d.2 fails |
| — | — | REC | audio, record output stereo | receive from the track under test |

Eight ports (seven new), ten tracks. Rejected: a separate CC7 or vibrato track per instrument
(#1's bank scheme) — #4 showed the emitter can own the state, and the app already has the
prelude, the restore and the sweep; a second port for the piano's second plugin — #2 ran both
on one port with plugin-side channel filters and it worked.

**7. Checked in this repo, not assumed:** the ported composer app already carries the whole
#4 mechanism — the `CC7 Reset` button (`composer.html` line 453, "All-notes-off + CC7=127 on
every port/channel"), the stop-flush sweep (line 9028), and `morph_emit.js` with
`CC_LEAD_MS = 250` and `TAIL_MS = 2000`. Nothing to port for 0e; 0d measures whether Kontakt /
Xsample obey the same law.

## §16. The bank design, worked out — why the timing law is not enough, and what a channel buys

**Prompted by** the composer, on reading §15: *"let's continue to work out the CC seven and
vibrato because that was the same issue we had in the string quartet because there's going to be
events that happen right after a crescendo much sooner than two seconds. And there might be
events before a crescendo in less than two hundred fifty milliseconds. So for example, I might
have a crescendo in the violin that goes to secco, so immediate off, ramp down CC seven, but then
the next event might come in in a hundred and fifty milliseconds or in two hundred milliseconds.
So probably better to continue using multiple channels. … most events will get sent to the main
stream channel … any volume change ones will go to another track that just handles CC seven …
we'll just use velocity on the main channel for just standard dynamics. … The same principle
applies to vibrato. I forgot the combination, but there's a couple different channels I have to
use to get molto vibrato or no vibrato. So that has to have its own channel because it can't be
reset in time. … since bass clarinet is Xsample as well, we might as well treat it that way.
And, actually, maybe all the instruments. Give me your analysis, and then maybe we'll figure this
out as we build, because we can do the port allocation after making the tracks in Reaper."*

**1. What the two numbers are, and therefore what a channel buys.** Both of #4's constants are
the cost of MOVING a controller on a channel where a note is sounding or about to sound: the
sampler smooths CC7, so a level written just before a note-on bleeds into the attack (hence
250 ms of lead), and a level restored while the release rings yanks the tail (hence the 2 s
wait). A channel whose CC7 is never moved has no timing problem at all. That is the entire
case for the composer's main channel: CC7 written once (127, by the sweep) and never touched;
dynamics by velocity; the next plain note after a crescendo needs no lead whether it comes
150 ms or 2 s later. On a curve channel every event writes its own start level in its
prelude, so the only collision left is two CURVE events on the same channel closer than the
lead time (crescendo-to-secco, then another curve 150 ms later): the second one's prelude
would jump the level while the first is still being cut. Alternating between two curve
channels removes that; a third covers a third curve inside the window. **So curve channels
are round-robin, not one-per-controller.** The composer's exact scenario — main-channel note
150–200 ms after a secco — never touches a curve channel at all.

**2. Vibrato, found rather than remembered.** The quartet (`AI_VIBRATO_PROMPT_GUIDE.md`,
`MIDI_MUSIC_GENERATION.md` §9) drove vibrato width with **CC4 and channel pressure sent
together, same value**, on the "senza vibrato" preset (CC0 89) in its own bank; the doc never
settled which of the two Xsample obeys (*"channel pressure / vibrato: may be simpler — after
note-off, reset channel pressure to 0. Needs testing"*). **Molto vibrato is a different
sampled preset** (CC0 2 arco, CC0 70 pizz), i.e. an articulation, not a curve; the registry's
`one-shot` is the NOTATION rule (*"revert to base mode after the note"*), the sampler keeps
the selection until the next CC0. (Consequence for the septet skeleton: its `oneShot: true`
comment says the preset reverts by itself — it does not; every note's prelude writes its own
CC0, so no revert is ever needed. NITS.) The residue argument for width is identical to CC7's:
a width curve leaves CC4 / pressure on its channel, and a plain note on the main channel never
sees it. **The point that decides the layout:** a note that swells AND changes its vibrato
width is ONE note on ONE channel — so any channel that carries curves must accept every
continuous controller. A dedicated vibrato channel is therefore just one more curve channel;
the split is by EVENT CLASS (plain vs curve-bearing), not by controller. Molto vibrato as a
preset lives on the main channel like pizz, selected by the prelude's CC0.

**3. Per instrument.**
- **Strings ×4 (Kontakt):** one Kontakt instance per track holding the same Xsample
  instrument three times — slot 1 = ch 1 MAIN · slot 2 = ch 2 CURVE A · slot 3 = ch 3 CURVE B
  (a fourth, ch 4 CURVE C, if the music ever puts three curves inside 250 ms). Every slot has
  the whole CC0 articulation set, so a pizz-tremolo swell or an arco swell both work on a
  curve channel. One port per instrument, unchanged.
- **Bass clarinet (Kontakt):** the same three slots. Its MW presets take CC1 as the timbre
  dynamic (#3's standing recipe: sustained dynamics = CC1 curves) — CC1 is continuous state
  too, so CC1 curves ride the curve channels; a plain note on an MW preset writes a static CC1
  in its prelude on the main channel (the settle time Kontakt needs for that is 0d's to
  measure; #3's XC1 seam test found the crossfade itself seamless).
- **Flute (SI2 in UVI):** channel = technique, 16 + 12 parts — no spare channel per
  technique, so banks cost slots. Either the tuba law as it stands (proven on this engine; the
  app's cold/warm entry logic), or curve copies of the few curve-bearing techniques (`ord`,
  `aeolian`, `flz` …) in the four free Fluteb slots. Decide at 0c once the composer's UVI
  order is transcribed; recommendation: a curve copy of `ord` at least.
- **Piano:** main only — velocity and pedal; a piano cannot swell. PP2 parts as planned.

**4. What the app needs (0c / 0f), and it is small.** `sandbox/instruments.js` gains per
instrument `channels: { main: 1, curve: [2, 3] }`; `sonify_core`'s route (today
`ch = tech.channel`) picks main for `sonifyMode 'plain'` / `'ks'` and the next curve channel,
round-robin per instrument, for curve mode — the S1 field that classifies the event already
exists (NAMING.md §2.3; `sonifyMode`). The prelude on a curve channel writes CC0 + the start
values of every controller the event uses (CC7; CC1; CC4 + pressure); the stop-sweep already
visits every channel in the map (`composer.html` line 9042). `CC_LEAD_MS` / `TAIL_MS` stay,
and only curve channels ever see them.

**5. What 0d must measure on Kontakt / Xsample, none of it measured before:** the CC7 → dB
law (Kontakt volume; the quartet's crescendos used it, nobody measured it) · the CC1
crossfade's settle time before a note-on · **CC4 vs channel pressure** for width (a 30-second
probe: a held note, one controller at a time) · CC0 switch latency (a note right after a
preset change).

**6. Reaper consequence:** ports unchanged (eight); each Kontakt track holds three slots on
ch 1–3, track input = its port, all channels, monitoring on; the UVI tracks unchanged. The
R-steps stand, with one added step per Kontakt track: duplicate the instrument twice, set the
slot channels 1 / 2 / 3.

**Proposed to the composer:** main + curve A/B (or A/B/C from the start as cheap insurance)
for the five Kontakt instruments; the quartet's literal three banks (main / CC7 / vibrato)
rejected for the one-note-two-curves case; flute per 0c; piano main only.

## §17. D11 taken ("b"); PLAN 0e rewritten as the R-steps; R1 handed to the composer

**The composer's answer to §16's three options: "b"** — main + curve A / B / C on every
Kontakt port, from the start. Recorded as **D11** (journal §4) with the reasoning and the
rejected alternatives; PLAN 0c.4 / 0c.7 (the `channels` map and the router), 0d.2 / 0d.4 (the
Xsample controller probes), and 0e (the layout and R1–R13) rewritten to match.

**Working assumptions carried forward, offered in §15 and not objected to:** the piano's two
plugins on ONE port `Piano` with plugin-side channel filters (8Dio ch 1; PP2 parts A3 / A5),
and the existing `BassCl` port reused as-is. Either is a one-line change if the composer
prefers otherwise while building.

**Verification the AI can do without Reaper:** the winmm device list (the `MidiDevs` snippet,
§15 item 5) shows every loopMIDI port as a MIDI out and in; a name typo shows up there before
it can cost an hour in Reaper. The rack file itself is checked the same way as #4's: `REC`
line third field = 1 on every instrument track, one `<VST` per track, track order = D10.

**R1, as given to the composer:** in loopMIDI add seven ports, names exactly `Flute`,
`Fluteb`, `Piano`, `Vn1`, `Vn2`, `Va`, `Vc` (`BassCl` exists). Nothing else in this step.

## §18. R1 verified — the eight ports exist, exact names

Composer: *"done"*. winmm listing (the `MidiDevs` snippet): `Flute` · `Fluteb` · `BassCl` ·
`Piano` · `Vn1` · `Vn2` · `Va` · `Vc` — every one present as a MIDI out AND a MIDI in, exact
case, no near-miss names, no unexpected extras; the machine now has 41 MIDI outs (34 + 7).
`reaper/` created for R2 (the project file is the first thing to live there;
Media / Backups / AutoSaves under it are gitignored).

## §19. R2 verified — the project exists; Reaper's MIDI inputs read from its ini

Composer: *"reaper done"*. `reaper/septet_rack.rpp` is in the repo (Reaper **7.72/win64**,
header `<REAPER_PROJECT 0.1`, zero tracks, 2 069 bytes, CRLF as Reaper writes it); a
`reaper/Backups/` appeared beside it and is gitignored. Reaper's device state is not in the
project but in `%APPDATA%\REAPER\reaper.ini`: `midiins` is a bitmask over the winmm INPUT
device indices — low word `2147450868` = `0x7FFF7FF4`, high word `midiins_h` = `4095`. Read
against the device order: index 2 (`BassCl`) enabled; indices 33–39 (`Flute` `Fluteb` `Piano`
`Vn1` `Vn2` `Va` `Vc`, the seven added at R1, at the end of the list) enabled through the high
mask; index 0 (`UMC1820 MIDI In`, the only hardware input present — the Keystation is not
connected today) disabled. The tuba-era inputs stay enabled from #4's days; harmless. The
"auto-enable new devices" option leaves no key I can find in the ini — not verified; the
hardware input being off is what matters until the keyboard is plugged in. The project file
is committed now, as #3's D6 and PLAN 0e intend.

## §20. R3 correction — the flute roster is 19 PRESETS, not 28 techniques; the channel table re-ordered

**Prompted by** the composer's screenshot of the UVI browser at R3 (*"these are what are
available, can you re-order the channel table"*): 19 Flute presets — `Aeolian KS · Chromatic
Scale · Cresc & Decrescendo KS · Durations KS · FX KS · Finger Modes KS · Flatterzunge ·
Fortepiano · Multiphonics Menu · Ord & Aeolian KS · Ord & Flatterzunge KS · Ordinario ·
Pizzicato · Play & Sing KS · Quartertones Ordinario · Sforzando · Staccato · Trills KS ·
Whistle Tones`. The 0b skeleton had listed the MANUAL's 28 techniques as 28 UVI parts — the
same mistake the tuba piece corrected on its day 1: SI2 ships single-technique patches plus
"KS" patches that hold two or three techniques switched by a keyswitch note.

**Read from the manual** (#3's `docs/manuals/extracted/IRCAM_Solo_Instruments_2_manual.txt`,
pp. 10–12 "Layers & Keyswitches – Flute"): Aeolian KS = Aeolian & Ordinario C1 · Aeolian C#1 ·
Cresc & Decrescendo KS = Crescendo C1 · Cresc→Decresc C#1 · Decrescendo D1 · Durations KS =
0.5 s C2 · 1 s C#2 · FX KS = Jet Whistle C1 · Key Click C#1 · Tongue Ram D1 · Finger Modes
KS = Harmonic C1 · Discolored C#1 · Ord & Aeolian KS = Ord→Aeolian C1 · Aeolian→Ord C#1 ·
Ord & Flatterzunge KS = Ord→Flz C1 · Flz→Ord C#1 (the TRANSITIONS, not plain ord + flz) ·
Play & Sing KS = sung C4 at C1 · Unison C#1 · Trills KS = minor 2nd C1 · major 2nd C#1.
**Octave calibration, not assumed:** the manual writes the same C1/C#1/D1 for every
instrument's Cresc & Decrescendo KS, and the tuba piece MEASURED that preset's switches at
MIDI 24/25/26 (UVI display C0/C#0/D0) — so the manual's names are scientific (C4 = 60), manual
C1 = MIDI 24, and UVI's display sits one octave lower (#3's octave ledger). The one preset
the manual puts elsewhere is Durations KS (C2/C#2 = 36/37); all keyswitches are verified on
UVI's red keys at R3 before 0c trusts them.

**The new roster** (`sandbox/instruments.js`, flute block): one UVI part per preset in the
browser's alphabetical order — A1 Aeolian KS · A2 Chromatic Scale · A3 Cresc & Decrescendo
KS · A4 Durations KS · A5 FX KS · A6 Finger Modes KS · A7 Flatterzunge · A8 Fortepiano · A9
Multiphonics Menu · A10 Ord & Aeolian KS · A11 Ord & Flatterzunge KS · A12 Ordinario · A13
Pizzicato · A14 Play & Sing KS · A15 Quartertones Ordinario · A16 Sforzando on `Flute`;
Staccato · Trills KS · Whistle Tones as A1–A3 on `Fluteb` (13 slots free for 0c.7's curve
copies). **30 technique keys** over the 19 parts: a key names what the player does
(`ord_to_flz`, `key_click`, `dur_1s` …), `preset` names the UVI patch, and a KS mode carries
`ks` = its switch note, latched by the prelude (`tech.ks` — wired at 0c.7; today the app
latches only an object's own `ksNote`, the tuba path; the number is inert until then). Gone
from the skeleton: `whistle_sweep` and `note_durations` (not presets); new: `fortepiano`,
`multiphonics` (one multiphonic per key, C3–F5 = MIDI 48–77 per the manual's table), the two
duration modes. Alphabetical order chosen so the composer loads by walking down the list;
Staccato landing on the second instance costs nothing — a port name in a recipe.

## §21. R3, part A1 — the flute's keyswitch zone is an octave above the tuba's (read from the screen)

Composer's UVI screenshot of A1 (Aeolian KS), asked *"can you confirm what you see"*: grey keys
(unmapped) at the far left · ONE red key at UVI **C1** · tan keys C#1–B2 (extended range,
stretched) · white keys **C3–B4** (the native samples: MIDI 60–83, sounding C4–B5) · tan again
from C5 up, cut by the frame. So the switch is at MIDI **36**, not the 24 I had taken from the
tuba's measured zone — SI2 puts each instrument's KS keys just under ITS OWN extended range,
and the flute's starts at C#1. Applied: every flute `ks` +12 (36/37/38; Durations KS 48/49),
Aeolian KS native range 60–83 recorded, the header comment corrected. Open: the manual lists a
second switch (C#1 = Aeolian); the black key beside the red one looks plain black in the image —
composer to confirm on screen. Each further KS preset gets the same look as it loads.

## §22. R3 — the flute parts registered from the composer's UVI screenshots, one line each

- **A2 Chromatic Scale:** no red keys (no keyswitch) · white from C2 (MIDI 48) rightward past
  C5, the right end cut by the frame (top provisional 96) · no tan keys — the whole mapped range
  is native · **two PURPLE keys, C3 and C4** (MIDI 60, 72), a colour the manual's legend does
  not define; the tuba piece met one purple key (Filtered by Voice, G0) and flagged it "anomaly,
  verify". Guess, not knowledge: the scale sample's octave anchors. Asked the composer.
- **A3 Cresc & Decrescendo KS:** red **C1 and C#1** (36, 37) — the black key is red here, so a
  black-key switch does render red (A1's C#1 therefore really is plain black) · D1 looks grey,
  though the manual lists a third switch there (decrescendo) — recorded as 38 with a verify flag
  · white **C3 → C6 and past it** (60–96, the flute's full range; frame cut near D6) · grey
  D1–B2, no tan: no extended range on this preset.
- **A4 Durations KS:** red **C2** (48) — the manual's C2, confirming the octave rule once more ·
  C#2 looks black (the 1 s mode unconfirmed, as A1's second switch) · white C3 → C6+ (60–96) ·
  grey below C3, no tan.
- **A5 FX KS:** red **C1 + C#1** (36, 37) · D1 is TAN, not red — the manual's third switch
  (tongue ram) does not show; same pattern as A3's D1 · tan D1–B1 (38–47) and from C5 up (84+):
  extended both sides · white **C2–B4** native (48–83) · **purple C4** (72) again.
  **Pattern so far:** UVI colours at most two red keys even where the manual lists three; and
  purple keys appear on Chromatic Scale (C3, C4) and FX (C4). Both to be resolved by playing at
  0c, not by staring at the screen.
- **A6 Finger Modes KS:** red **C1** (36); C#1 not red · white only from about **G4 (display)
  to C6 and past** — MIDI ≈79–96, the upper register, where harmonic and discoloured fingerings
  exist · grey everywhere below, no tan. The low bound is read off the picture (±1 key); 0c
  reads it from the GUI's range field.
- **A7 Flatterzunge:** no red keys · white **C3 → C6** and grey past C6 — so the flute's top is
  display C6 = MIDI 96 exactly, which fixes the "cut" tops of A3/A4 at 96 as well · no tan.
- **A8 Fortepiano:** as A7 — no red keys, white C3 → C6 (60–96), grey beyond, no tan.
- **A9 Multiphonics Menu:** no red keys · white **C3 → F5 on the display = MIDI 60–89**, thirty
  keys, one multiphonic each — the manual's table runs C3..F5 too, so THAT table is in display
  names, unlike its keyswitch pages; the roster's 48–77 (my scientific reading) corrected to
  60–89 · tan below C3 and above F5 (transposed multiphonics, extended both sides).
- **Composer's request at A9, filed as PLAN 0c.8:** *"can we make a todo for later to walk a9, I
  believe you would play through the range while I record and then analyze the file; I want to
  make a correspondence to the key and the approximate pitch content of the multiphonic."*
  Noted alongside: the SI2 manual carries a thirty-row table of exactly that correspondence
  (key → pitches with quarter-tone marks, at mf) — the walk seeds from it and verifies it by
  recording and spectrum, and the same recording yields the sounding lengths (0c.6).
- **A10 Ord & Aeolian KS · A11 Ord & Flatterzunge KS:** both the same picture — red **C1**
  (36), C#1 not red (the second transition unconfirmed on screen), white **C3 → C6** (60–96),
  grey elsewhere, no tan.
- **A12 Ordinario:** no red keys · white **C3 → C6** (60–96), B2 grey — the manual's "B3 with
  special extension" is not in this patch · no tan.
- **A13 Pizzicato:** no red keys · white **C3 → C5** native (60–84) · tan below C3 and above C5.
- **A14 Play & Sing KS:** red **C1** (36), C#1 not red · tan **C#1 → B2** (37–59), extended
  below · white from **C3** (60); the frame is cut around E4, so the top is provisional (96).
- **A15 Quartertones Ordinario:** no red keys · white **C3 → C6** (60–96) · grey elsewhere, no
  tan. Whether a key sounds the quarter-tone above or below its name is a 0c ear question.
- **A16 Sforzando:** no red keys · white **C3 → C6** (60–96) · grey elsewhere, no tan.
  **The `Flute` instance is fully registered (A1–A16).** Summary of the sixteen: keyswitch
  presets show one red key at C1 (36), two on A3 and A5 (C1 + C#1), Durations at C2 (48); the
  manual's further switches are unconfirmed on screen. Native ranges: the full 60–96 on A3, A4,
  A7, A8, A10, A11, A12, A15, A16; A2 from 48; A5 48–83 (tan both sides); A6 ≈79–96; A9 60–89
  (tan both sides); A13 60–84 (tan both sides); A1 60–83 (tan); A14 from 60 (top cut). Purple
  keys on A2 (C3, C4) and A5 (C4), meaning open.
- **Fluteb A1 Staccato:** no red keys · white **C3 → C6** (60–96) native · tan below C3 and
  above C6 — the one full-range patch that also carries a stretched extension both sides.
- **Fluteb A2 Trills KS:** red **C1** (36), C#1 not red (major-2nd mode unconfirmed on screen) ·
  white **C3 → C6** (60–96) · grey elsewhere, no tan.
- **Fluteb A3 Whistle Tones:** no red keys · white **C2 → C5** (48–84) native · tan below C2 and
  above C5. **All nineteen parts registered** — 30 technique keys, every one with a range read
  from the screen; keyswitch numbers 36/37/38 (Durations 48/49) with the second and third
  switches flagged "verify by playing" where UVI showed no red key.

## §23. R3 + R4 verified from the project file; two lessons about reading a `.rpp`

Composer: *"done"* after the input/monitoring detour (the default theme hides the input
selector and the speaker until the track is armed or the arm button is right-clicked — the
question *"the big speaker icon, that's input monitoring on, correct?"* answered yes from the
screenshot, then from the file). `reaper/septet_rack.rpp`, 184 KB, two tracks:

| track | REC line | read |
|---|---|---|
| `Flute SI2` | `REC 1 5216 1 0 …` | armed · MIDI input (≥ 4096), channel 0 = all · **monitor 1 = ON** · record mode 0 = input |
| `Fluteb SI2` | `REC 1 5280 1 0 …` | the same |

Both hold one `VSTi: UVIWorkstation (UVI) (34 out)` — the VST2 build, where the tuba rack
used the VST3 (`VST3i: UVIWorkstation`); no consequence for MIDI, noted so nobody "fixes" it.

**Lesson 1 — Reaper's MIDI device index is Reaper's own.** `(5216 − 4096) / 32 = 35` and
`(5280 − 4096) / 32 = 37`, but winmm today lists `Flute` at 23 and `Fluteb` at 34 (the
loopMIDI enumeration also moved since R1: `Flute` was 33). Decoding the field against winmm
names the wrong ports; the composer's screenshot (`MIDI: Flute: All ch`, `MIDI: Fluteb: All
c…`) is the identity check, the file proves arm / all-channels / monitoring / mode. **Lesson 2
—** my first decode read the wrong columns because `grep -n` glues the line number to the
leading spaces; the REC fields are arm · input · monitor · mode, counted after the word `REC`.

## §24. R5 — the bass clarinet's keyswitch zone decoded against the manual

**Prompted by** the composer at Kontakt, ten screenshots of `Bass Clarinet.nki` (Preset
Designer, Preset Mode on/off, KS Bank 1–3, toggle and trill & slide modes) and *"can you help me
figure out the key switches?"*, with his own readings: *"a-1 low velocity switches to key switch
mode, high velocity tune base note mode, a#-1 high toggle switch mode(?), low back to key
switch, b high trill and slide mode, c0 high in keyswitch mode pre16 flutter tongue velocity
and the rest of the reds are different presets but we are using cc0 to switch those; toggle
switch mode: c–eb 0 are more presets but when you select one it toggles off … the pink/purple
keys starting at e0 make the 0s seen in the image … trill and slide mode c–d more presets, d#
turns legato button on, e I'm not sure, f0 yellow?, f# toggles round robin off for a moment
then goes back to repetition rnd, same with g# and a?"* — and *"looks like black keys are range
in this one"* (Kontakt greys the unmapped keys; the normally coloured keys A#0–F4 on the
display ARE the range, MIDI 34–65, matching the GUI's `low: A#0 / high: F4`).

**Read in the AIL Extended Scripting manual (#3, pp. 3, 8, 22)** — every observation lands:
the three green keys are velocity-split function keys (low = bank 1/2/3; high = tune-base /
toggle / trill-and-slide modes); the ten red keys per bank are stored preset switches; in
toggle mode the six magenta keys E0–A0 switch sound slots 1–6 and the `<0>`/`<1>` row is
their state; in trill & slide mode D#0/E0 are half- and whole-tone trills (aftertouch = speed
— the trill engages legato, hence the button lighting), F0 resets the slot round-robin counter,
F#0/G0 slide down/up on release, G#0/A0 slide down/up in legato (they swap in the "slides"
sounds, which is the round-robin display flicker); Preset Mode off is Phrase Mode, the yellow
keys playing Phrase Designer phrases. Manual names are scientific and Kontakt shows an octave
lower — the same trap as SI2's manual, the same fix. **Everything is also a CC#0 value**
(88–117, 118–122, 126/127), so the recipes never send a switch note; the floor rule (never a
note below 34) is confirmed as the whole safety story. Written into the bass clarinet header of
`sandbox/instruments.js`; the trills and slides noted as 0c candidates (CN-4 will want them).

**Caught in the screenshots:** the slot's header reads `MIDI Ch: Omni`. Under D11 each of the
four slots must sit on its own channel (1–4); Omni would sound all four on every note.
- **R5 ranges, composer sending only the presets whose range differs from the standard
  A#0–F4 (34–65):** #5 Flutter Tongue MW and #16 Flutter Tongue Velocity stop at **C4 (60)**;
  #1 Senza Vibrato MW, #2 Natural Vibrato MW and #11 Air Noises are the standard 34–65
  (screenshots); the rest of the roster takes #3's GUI-read table (§6d) — slap, key noises,
  crescendo, triple tongue 34–65; glissando 34–42 and the multiphonics 34–46 were already in.
  #2 Natural Vibrato MW added to the roster (cc0 1). Still unranged: #15 Senza+Flutter Vel×MW
  and #34 Flutter LOCK — the composer sends them only if they differ.
- **Confirmed on screen, R5:** #7 Glissando Undefined MW Shape `low A#0 / high F#1` = 34–42,
  #10 Multiphonics Velocity `A#0–A#1` = 34–46 — both exactly as #3's table had them; the
  roster already carried these. (The multiphonics preset's `Legato Int.` reads 39, like Air
  Noises — factory values, noted for 0c.)
- **#15 Senza Vibrato + Flutter Tongue Velocity × MW:** `A#0–C4` = 34–60 — capped like the two
  flutter presets (the flutter layer sets the ceiling). Only #34 Flutter LOCK remains unread;
  its name says it will be 34–60 too — the composer sends it only if not.
- **#21 Glissando Undefined MW:** `A#0–F#1` = 34–42, the wheel-shaped sibling of #7 (#3's
  table listed them together). Added to the roster (cc0 20).
- **#22 Multiphonics MW:** `A#0–A#1` = 34–46 on screen — as the roster had it (mp_loop, cc0 21).
- **#29 Flutter Tongue Velocity + MW inverted:** `A#0–C4` = 34–60 — the fourth flutter preset
  at the same ceiling; added to the roster (cc0 28). Rule of thumb now on record: **every
  flutter-tongue preset tops out at C4 (60), everything else at F4 (65)**, glissandi at F#1
  (42), multiphonics at A#1 (46).
- **#34 Flutter LOCK: `low G2 / high A5` = 55–93** — the exception that corrects the rule
  just written: the C4 ceiling belongs to the flutter-tongue SAMPLE presets (#5, #15, #16,
  #29); #34 is an Ensemble-routed LOCK construction (slot 4 active, Slot rr 2, Trigger off),
  bright and high, and sits mostly ABOVE the standard zone. Registered as 55–93. **Every bass
  clarinet technique in the roster now has a range** (16 techniques after the R5 additions).
- **The Preset Menu, whole** (composer's two screenshots, *"presets menu"*): 33 factory presets
  1–33, **#34 Flutter LOCK** — piece #3's first bespoke preset, verified there 2026-08-05 — and
  **Free Preset slots from #35** for our own. The roster now carries all 34 (cc0 = N − 1),
  keys kept for the sixteen already there, with **`mw: true` on the sixteen wheel-shaped
  presets** (the CC1 dynamic — curve-channel material under D11; Velocity presets are
  main-channel material). Ranges: the read ones as registered; the standard zone assumed for
  the rest (the composer sends only what differs); the four **Pseudo Contrabass / Pseudo
  Clarinet presets (#30–33) flagged VERIFY** — a pseudo instrument may shift the zone.
  Names worth knowing for CN-4: #24–26 Vibrato MW / Velocity / inverted, #27 Secco, #28
  Portato, #20 With Accent, #3–4 Staccato MW Shape (the wheel shapes short notes).

## §25. R5 verified from the project file

Composer: *"bcl done"*. `reaper/septet_rack.rpp` (1.48 MB now — Kontakt's state with four
instruments inside): `Bass Clarinet XS` · `REC 1 4608 1 0` = armed · MIDI input, all channels ·
monitoring ON · record mode input · `VST3i: Kontakt 8`. The input value 4608 is the same
number piece #3's Bass Clarinet track carried for the same port — Reaper's own device index,
stable on this machine. The four slot channels (D11: 1–4) live inside Kontakt's binary chunk
and cannot be read from the file; a one-note test at 0h proves them (one voice on ch 1, not
four). Three tracks done, in score order.
- **Standing reminder, composer at R6:** *"please remind me with each instrument to check the
  instrument plugin gain."* Added to PLAN 0e's per-track rule (UVI part volume / Kontakt
  instrument volume at unity, part reverb off) — the baseline 0d's CC7 law is measured against;
  #4 never recorded a number for its "gain staging calibrated", only the check. Applies
  retroactively to the three tracks already built.

## §26. R6 — the plucked piano exists after all (Spitfire), and joins the Steinway's Kontakt

Composer, loading track 5: *"plucked piano also spitfire, let's set up the loopmidi and track
name etc"* — a Kontakt screenshot with Spitfire's **Plucked Piano** loaded (MIDI Ch: Omni,
the whole keyboard blue, red keyswitches around C#-1 / D#-1, "Reset on key F-1"). Piece #2
had reserved `Piano` channel 2 for a plucked piano with the library "TBD"; the septet has one.
**Decision, by the standing rules:** no new port (one player, one port, D-lineage from #3),
no new track — the plucked piano is a technique on **channel 2** of `Piano`, loaded as a
second instrument slot in the SAME Kontakt instance as the Steinway (slot MIDI channels
[A] 1 and [A] 2); the track is renamed `Piano Kontakt`; the Prepared Piano 2 (UVI) stays the
second track, R7, on channels 3 / 4 / 5. Recipe: `plucked` (ch 2, 21–108); PLAN 0e amended.
Gain check applies to both instrument slots (the composer's standing reminder).
- **R6, slot 1 settled:** *"8dio replacing spitfire grand"* — `8DIO_1969_Legacy_Piano` on
  MIDI Ch [A] 1, DEFAULT preset, the full 88 blue (21–108). The 8Dio panel carries its own
  GAIN knob besides Kontakt's header volume — both count for the gain check, both left at
  default. Its preset list (Staccato, Reversed, Glisten, Infinity, Ethereal, Glockiano,
  Suppressiano, Emperor, Golden, The Future) is noted as candidate techniques for later.

## §27. R6 verified from the project file

Composer: *"done"*. `Piano Kontakt` · `REC 1 5408 1 0` = armed · MIDI input, all channels ·
monitoring ON · input mode · `VST3i: Kontakt 8`; the file is 2.8 MB with two Kontakt states
inside. The two slots (8Dio 1969 Legacy Piano on [A] 1, Spitfire Plucked Piano on [A] 2)
sit in Kontakt's binary chunk — not readable from the file; the one-note test at 0h proves
them. Four tracks in score order: Flute SI2 · Fluteb SI2 · Bass Clarinet XS · Piano Kontakt.
- **R7, composer: *"maximizer and tilt fx bypass?"*** — yes, both. A maximizer is a limiter
  and would flatten the very level relationships 0d measures; the tilt EQ colours the raw
  sample. The rack stays dry and unprocessed; colour is added later in Reaper, measurably.
  The per-track rule now says: reverb off, built-in dynamics / EQ bypassed, gains at unity.
- **R7, PP2's keyboard colours, from the manual not the screen:** the low blue/grey keys are
  **Bar Hits — "mapped from C-1 to G#-1, each of the piano's metal bars recorded in unique
  ways: hands, sticks or mallets"** (the cast-iron plate, not the wood — the composer's guess
  in kind); the **yellow octave is the octave SELECTED in PP2's Edit page** — PP2 assigns
  preparations and parameters per octave (Init / Randomize / Copy-Paste Octave, MIDI Select
  picks the octave by playing a key), and the keyboard highlights the selected one. Not a
  sound; a cursor. Bar hits (MIDI 0–8) sit below anything the app sends — a candidate
  technique for later, like the 8Dio presets. PP2's Maximizer found on its FX page (threshold
  −1 dB, ceiling −0.1 dB) — bypassed per the rule.

## §28. R7 closed by the composer; the per-instrument file read stops here

Composer, after the Piano PP2 chain showed a live Kontakt 8 ahead of the UVI (a duplicated
track, most likely): *"its fine lets move on no need to read each inst. you can read at end."*
So: R7 done on his word; the file is read once at R13 with everything in it, and the double
instrument on `Piano PP2` is the first thing checked then. R8–R11 (the four strings) handed
over as one recipe: Kontakt 8, the elastic Xsample string instrument four times on [A] 1–4,
gains at unity, inputs Vn1 / Vn2 / Va / Vc all channels, arm, monitor. Asked for the violin's
preset menu and each instrument's standard-preset range to build the rosters as the bass
clarinet's was built.

## §29. R8–R11 — the string rosters built from the composer's Kontakt menus; a CC#0 correction

**Prompted by** the composer's screenshots at the string tracks: the cello's whole Preset Menu
(1–88, four clips), the violin's menu through #27 (*"let me know if the one menu differs and I
can clip rest"* — it does not, except the string names in #31–38 and #73–76: cello / viola
C G D A, violin G D A E, by the library's pattern), the GUI ranges of a standard preset on
each instrument — **cello `C1–B4` = 36–83, violin `G2–F6` = 55–101, viola `C2–A5` = 48–93**
(Kontakt display, C3 = 60) — and *"extra blue key at top"*: the Preset / Phrase Mode switch
(the AIL manual: A#7, or CC#0 126/127), above anything the app sends.

**Written into `sandbox/instruments.js`:** one generator `xsStringTechs(strings, lo, hi)`,
instantiated per instrument — **88 techniques each, cc0 = preset − 1**, `mw: true` on the 33
wheel-shaped presets, position-based keys for the per-string presets (`nh_sul1..4`,
`pizz_h_sul1..4`) so the four instruments share every key, the D11 channel map
`{ main: 1, curve: [2, 3, 4] }` on each. Per-preset range exceptions come as the composer
sends them (his rule: only where the range changes).

**The correction, worth a line in the D-log's shadow:** the 0b skeleton carried piece #1's
registry values — arco 89, pizz 95, Bartók 97. The Xsample manual's CC#0 table (§15's read)
says 88–117 select the KEYSWITCH BANKS' stored presets 1–30, i.e. those numbers meant
"whatever the quartet had stored in slot 2 / 8 / 10 of its own Kontakt" — not portable. The
direct presets are Senza Vibrato Velocity #6 (cc0 5), Pizzicato Velocity #70 (cc0 69), Bartók
Pizzicato #80 (cc0 79); the skeleton's 71 / 2 / 70 / 6 / 80 were direct and right (Pizzicato
Open Strings #72, Vibrato MW #3, Pizzicato Vibrato #71, Arco Open Strings #7, Behind Bridge
#81). Piece #1's `cc_mapping_registry.json` is therefore only half-portable; noted for any
future reuse of it.
- **A slip, on the record:** commit `7d85803` shipped an `instruments.js` that THROWS
  (`VN_RANGES` read before its `const` initialized — the table runs before the declaration).
  The node check caught it, but my command chain ran the commit on a separate line after the
  heredoc, so the failure did not stop it. Fixed one commit later (`dd45f61`: a hoisted
  function, like `xsStringTechs`), verified in node and in the running app (zero errors, the
  seven counts intact, violin #7 55–76). Rule for me: the commit belongs in the same `&&`
  chain as the check, always.
- **R8–R11 done** on the composer's *"done"* (file read deferred to R13 by his rule). Nine
  instrument tracks now exist in score order; R12 (REC) and R13 (save, the file read, the Web
  MIDI list on Chrome) remain.
- **Composer, R12/R13 in one breath:** *"all saved, composer score running in browser"* · a
  question — *"from the composer score, can I also have the other pianos in the midi play
  menu — plucked, muted, harmonics"* (the piano lane's technique list already carries the
  four; verified in the running app, below) · **CN-5** (scattered strikes) to the sketch pad ·
  **PLAN 1a** (a more fluid way to draw curves) as a todo.

## §30. R12 + R13 — the rack read whole

Composer: *"all saved, composer score running in browser."* `reaper/septet_rack.rpp`, 6.47 MB,
ten tracks in score order:

| track | REC line | read |
|---|---|---|
| Flute SI2 · Fluteb SI2 | `REC 1 … 1 0` | armed · MIDI all channels · monitoring ON · UVI (VST2) |
| Bass Clarinet XS | `REC 1 4608 1 0` | armed · MIDI all · monitoring ON · Kontakt 8 |
| Piano Kontakt | `REC 1 5408 1 0` | armed · MIDI all · monitoring ON · Kontakt 8 |
| Piano PP2 | `REC 1 5408 1 0` | same port as Piano Kontakt · **UVI only now** — the stray Kontakt of 18:02 is gone |
| Vn1 · Vn2 · Va · Vc XS | `REC 1 5440/5472/5504/5536 1 0` | armed · MIDI all · monitoring ON · Kontakt 8 each |
| REC | `REC 0 0 1 1` | un-armed · audio input · record mode 1 = output (stereo) · no receives yet |

Every instrument track: exactly one plugin, input = its port on all channels, monitoring on.
What the file cannot show: the slot channels inside Kontakt (D11's 1–4) and the UVI part
channels — the one-note test proves those. **A todo from the composer, filed as PLAN 1b:**
*"revisit save file logic, try to simplify/make more logical."* The piano lane's technique
menu (`recTechSel`) carries main · plucked · harmonics · muted when the piano lane is
selected — his *"can I also have the other pianos in the midi play menu"* is already yes.
- **First sound, 2026-09-03 evening:** the composer at the app on Chrome: flute and violin
  sounded; *"cello not sounding, how to draw notes, with keyboard plugged in no sound"*. The
  keyboard: winmm now lists `Keystation 88 MK3` at input index 40 and `MIDIIN2` at 41, and
  `reaper.ini`'s `midiins_h = 4095` covered indices 32–43 — **Reaper had the Keystation
  enabled** (the single-client trap of #3's ledger, I3 in #4's) — the composer cleared it:
  *"midi keyboard works now"*. The cello: two checks handed over (the Vc track's input meter
  when the app auditions; Kontakt slot 1 on [A] 1). Found while looking: `sonify_core`'s route
  falls back to `techs[0]` for an unknown technique key — the 0i test saves carry the
  pre-roster string keys (`ord`, `staccato`, `pizz`, `arco`), so their string notes now audition
  as preset #1 "Vibrato Velocity + MW inverted", silently. NITS.
- **Plucked piano silent after choosing "Normal" from Spitfire's Presets menu.** The
  screenshot says why: header `Memory: 0` with "Purge unused" selected — the purge unloaded
  every sample, and Kontakt plays silence for purged samples rather than reloading them. Fix:
  Purge ▾ → Reload all samples. Started `docs/SAMPLER_QUIRKS.md` for the septet's own
  findings (this, the Keystation grab, the hidden input selector, the octave traps, the FX
  bypass rule, the CC#0 correction) on top of #3's ledger.

## §31. First sound: the cello bisected, a probe born, `rack-test` written for the composer

Composer: *"no cello, what is the fix? unclear"* — then, to a note sent straight into the `Vc`
port from PowerShell (winmm, CC7 127 · CC0 5 = Senza Vibrato Velocity #6 · C3 for 2 s, and
the same on Vn1 as the control): *"yes heard cello"*. So Reaper, the port and Kontakt's slot
1 on [A] 1 are right; the silent path was the APP's: the old `0i-test-b` cello note carries
`technique: 'ord'`, which no longer exists for the strings, and `sonify_core` falls back to
`techs[0]` = preset #1 "Vibrato Velocity + MW inverted" — a wheel-driven preset, silent where
the wheel sat (the NITS entry of the hour). The probe is kept as
**`probes/port_note_probe.ps1`** (-Port -Channel -CC0 -Note -Ms): the bisecting tool for every
"X is silent" from now on — sounds → the app's fault; silent → the rack's.

*"and can you just add notes to each part via a save file pls"* — **`scores/rack-test.json`**,
written by the app itself (its object shape, its `saveSession`): a marker `ACT-rack-test` and
eleven notes 2 s apart, one per PORT and per piano technique — Flute `ord` (Flute ch 12) ·
`staccato` (Fluteb ch 1) · bass clarinet `senza_vel` (#13) · piano `main` / `plucked` /
`harmonics` / `muted` (ch 1 / 2 / 3 / 5) · vn1 · vn2 · va · vc `senza_vel` (#6) — every route
checked against the rosters before saving (all resolve, with their CC0). Play walks the rack
in score order; a silent slot names its own port and channel.
