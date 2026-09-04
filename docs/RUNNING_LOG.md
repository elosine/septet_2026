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

## §32. The three silent strings, found by following the chain one step at a time

Composer, after the guessing got thick: *"let's be more systematic … Let's follow the chain
together and figure out where it's breaking down one step at a time. Only talk right now."*
The chain, six steps (app → Chrome → loopMIDI port → Reaper track → Kontakt instance → a
slot listening on the channel → the instrument). Known: Vn1 works end to end; Vn2, Va, Vc
silent even from the direct port probe, with the track meter flashing (MIDI reaches the
track); Kontakt's own keyboard sounds them (instrument and audio fine). The decisive test was
the composer's: **he switched Vn2's track input to the Vn1 port** — the same note on the same
port and channel sounded Vn1 and left Vn2 silent → the fault is inside Vn2's Kontakt. He then
said *"you would have had to send it on A2"* and sent the screenshot: **Contemporary Violin,
`MIDI Ch: [A] 2`** — and the earlier viola/cello screenshots had read `[A] 3` and `[A] 4`.
**Cause:** the quartet's habit (one port, a channel per instrument: vn1 = 1, vn2 = 2, va = 3,
vc = 4) applied to a rack where each instrument has its own port and the channels are D11's
banks (slot 1 on [A] 1, then 2–4). Vn1 was right by coincidence of its number. **Fix:** on
Vn2, Va, Vc set the four slots to [A] 1–4; Vn2's input back to `Vn2`. Lesson for the ledger:
per-instrument port ⇒ every instrument starts at channel 1; and the "switch the silent
track's input to a working port" test isolates the plugin in one move.

## §33. The composer's first material, and the tool it asks for (filed as PLAN 1c / 1d, not started)

Composer, mid-rack-test: *"I've made a save file called scattered strike zero one. Can we do a
little bit like the ostinato database from the two piano two percussion piece? I want to
capture all the onsets for each scattered strike and their relationship, and then I want to
be able to stretch it out or warp — capture its absolute rhythmic displacement, but also some
sort of normalized version that can be transformed, multiplied, or stretched. Then I want to
capture the harmony in each one, that's with all the notes. But for the rhythms, if there are
any that are essentially simultaneous, let's come up with a threshold, maybe somewhere around
fifty milliseconds, where you could still hear two things apart, maybe a little bit more,
maybe sixty — and redact the ones that fall too close. But the harmonies, let's capture
everything. Then I want a way to reorchestrate these and hear them in the ensemble, an easy
way where I can rearrange, place different notes to different instruments, change octaves,
change articulations. If we can do it right in the composer score somehow, that would be
ideal, otherwise in a lab. Then start a scattered strike database. … Not only the small
timing differences in a single strike, but also the way it is as is, the gaps between the
strikes — the timing of the whole sequence captured; in the database, the inter-strike
distances. … And add to the to-do: collect up a harmony database from all my pieces — the two
piano piece's chord shapes, the tuba piece's blasts — into a single database. Do the above
first."* Filed as **PLAN 1c** (capture tool + panel; thresholds as dials, 60 ms simultaneity,
~500 ms strike gap as #2's ostinato DB) and **1d** (the harmony database, after 1c). The
precedents on hand: `bank/ostinato_timing_db_2p2p.json` (ingestions + per-sample stats +
attacks, two thresholds) and the blast panel's Hear / Insert / Replace controls. **The save
is not on disk yet** — `scores/` holds no "scattered strike" file at 19:00; the composer is
asked to check the session name and press Save.

## §34. The first material is on disk: `ScatteredStrikes01`

The score server (the preview-tool instance) had died a second time today — the composer's
Save answered *"TypeError: Failed to fetch"* — restarted, the page not reloaded, Save
pressed again: **`scores/ScatteredStrikes01.json`, 211 KB, 577 notes, all on the piano lane
(technique `main`), 0.6 – 73.1 s**, played on the Keystation into the score's record panel.
The console `copy(JSON.stringify(Composer.collectData()))` fallback was given for the next
time (it prints `undefined` and fills the clipboard — normal). From here the composer runs
the server himself (`start_score_server.bat` / `node score/server.js`) so it no longer depends
on this session's tools. The file is the seed for PLAN 1c; committed as material.

## §35. 0e closed: "rack works"

Composer, after setting viola and cello to [A] 1: *"rack works"* — `rack-test` plays through
every port from the composer app on Chrome; the keyboard plays through the app. **PLAN 0e
DONE**, and 0h's first check (every track sounds from the score app through its own port)
passed. The composer now runs the server himself (`cd C:\Users\jwloy\GitHub\septet_2026` ·
`node score\server.js`). Left open in the rack, by decision: one instrument per Kontakt track
today; the three curve copies on [A] 2–4 are added when 0c.7 wires the curve routing.

## §36. PLAN 1c.1 — the scattered-strike database exists

**`tools/strike_db.js`** (dependency-free node) captured `scores/ScatteredStrikes01.json` into
**`bank/scattered_strikes.json`** (201 KB). The thresholds came from the data, not a guess:
of the 576 onset gaps, 398 are under 20 ms, 56 in 20–40, 26 in 40–60, then a thin tail, and
the between-strike gaps sit at 0.65–4.2 s — so **strike gap 500 ms** (46 strikes; 0.3 s
would give 58, 1 s gives 28) and **simultaneity 60 ms** (the composer's "maybe sixty"), both
dials on the command line. Census: 46 strikes · notes per strike 2 / 10 / 35 (min / median /
max) · 139 rhythmic onsets kept (1 / 2.5 / 9 per strike), 438 redacted into their groups ·
strike spans 8 ms – 1.67 s (median 147 ms) · inter-strike 652 – 4164 ms (median 1489) ·
pitches 23–105, all piano, velocities 33–127. Per strike the DB holds every note with its
displacement three ways (ms, 0–1 of the span, units of the median kept gap), the harmony
(midis, pitch classes, instruments), the rhythm after redaction with the redacted ids grouped
under the onset they merged into, and stats; the sequence holds the inter-strike distances
absolute, normalized by span and in units of the median gap, plus each gap from a strike's
last onset to the next first. Ids are functions of the save's object ids
(`ss-ScatteredStrikes01-wc-40`), so re-ingesting replaces rather than duplicates.

## §37. PLAN 1c.2 — the STRIKES panel, v1, verified in the running app

**`score/public/strike_panel.js`** (hooked after the multitempo panel in `composer.html`), in
the multitempo panel's mould: the same anchored button, draggable window, MorphEmit MIDI glue
(`ensureMidi` / `routeFor` / `noteOn` / `noteOff`, `panic()` the one stop path, timers in
`E._timers`), the same absolute time base. What it does: **strike** picker from
`bank/scattered_strikes.json` (46 entries, refetch button) → a table of the strike's notes —
note name / midi, dt ms, velocity, and per note an **instrument** select (the seven lanes),
an **octave** shift (−3…+3) and a **technique** select (that instrument's roster) — with
`spread` (notes low→high across the lanes low→high, each on its plain technique, pulled into
range by octaves) and `as played` (back to the save); **time ×**, **warp** (an exponent over
the strike's span), **rhythm only** (every note at its redaction group's onset), loop;
**Hear** through the rack (CC7 pinned per route, CC0 sent 30 ms before each note so per-note
techniques work on one channel, the 250 ms cold-attack lead); **Insert @ playhead** (the
blast-insert object shape: `groupId` on every note, the META shape on `META_LAYER`,
`sonifyMode 'plain'`, `recVel`, `srcKind 'strike'`, undo state pushed). Out-of-range rows show
red and are skipped.

**Two bugs found by running, both the same lesson:** `Composer`, `TRACKS`, `META_LAYER` are
script-level `const`s in `composer.html` — global LEXICAL scope, not `window` properties — so
`root.Composer` is undefined from another file; the panel now reads them as free identifiers
(`typeof Composer !== 'undefined' ? Composer : …`). The symptoms were lanes of −1 after
`spread` and an Insert that quietly wrote nothing.

**Verified in the running app** (the composer's own server on 5300, my browser pane): the
button appears next to MT; the panel opens; the DB loads (46); strike #3 (20 notes, 482 ms)
spreads over lanes 0–6 as `0:ord 1:senza_vel 2:main 3–6:senza_vel`, 0 out of range; time × 2
puts the last onset at 964 ms (= 482 × 2); Insert at 21.81 s wrote 21 objects (20 notes,
lanes 0–6, + 1 META shape, layer 7) under `grp-strike-3-218`; Hear reports the browser's Web
MIDI block gracefully where MIDI is denied. The composer's listening pass is the next step;
sequence playback (a whole sequence with its inter-strike gaps) and 1d are after.

## §38. The strikes tool, requirements gathered — `docs/STRIKES_TOOL.md` opened

Composer, with the tuba Blast Sandbox's vertical keyboard as "image one": *"let's talk
through a plan to build this together … Let's start with the keyboard … this will show the
notes as I played them on the piano, in each of the scattered strikes … one at a time … Then I
want some preset buttons … one the original, one spread out (try to achieve an even spread),
one cluster together, and then I'll be able to move that cluster to different octaves; one
clustered low and clustered high … I'll want to add some when I'm working … and a reshuffle
… if it's a cluster high, I can just hit reshuffle and reshuffle the notes into a different
high cluster. Gather these requirements and organize them for now."* Organized into
`docs/STRIKES_TOOL.md` (A keyboard view · B voicing presets · C reshuffle · D the v1 panel's
functions to re-fit), each with the words, the AI's reading, and a status; two blocking
questions asked (what "cluster together" means — chromatic packing or the played chord
squeezed; keyboard range). Reuse found: `chordview.html`'s keyboard + pitch-class palette,
`vert_bank.js`'s even-spread by octave displacement.

## §39. PLAN 1c.2 — the STRIKES drawer built (steps 1–3 + a first cut of the rest), verified in the running app

Composer, closing the requirements session: *"do the build, and then … after everything's
documented and committed and pushed, if you could run a session end, and then I'll try the tool
out in the morning."* Built overnight, against the composer's own running server on :5300 (the
AI's pane holds no port); the composer's test is the next step.

**What exists — `score/public/strike_drawer.js` (~800 lines), replacing the v1 panel
(`strike_panel.js` removed):** a full-width drawer from the bottom of the composer score
(the `Strikes` button beside `MT`; drag its top edge to resize; ✕ or the button closes it).
Left → right: (0) the SEQUENCE list of the source save — index · go time · note count · range,
click = select, and the score's playhead parks on the strike (Q); (1) the vertical KEYBOARD,
ensemble span C2–C7 with the `88` toggle (R6), uniform semitone rows (Z1/Z2/Z3 zoom), every
voice a dot in its pitch-class colour with its name — hollow = a stand-in sounds instead of the
pitch (S), a ring = the piano also plays it (H); click a key or a dot to toggle the piano flag;
(2) the ORCHESTRATION, seven rows in score order with `shuffle`, `may fold`, top → / bottom →
locks, `as played`, and an articulation `<select>` per row grouped by kind (pitched / fixed /
noise / multiphonic), the assigned notes shown with ↑↓ when folded and `*` when standing in;
dotted lines from each dot to its player; (3) the ARTICULATION picker (click a player's name):
the full roster by kind plus the VARIANT list (open strings for fixed-pitch techniques, the
technique's keys for noise / multiphonic) with ▶ to hear each and click to select (T);
(4) the RHYTHM strip, rows shared with the keyboard, time left → right with a ruler, the
60 ms bands drawn LIVE from the current onsets (J's rule), and the controls: span ×, shape
(as played / even / front-loaded / back-loaded / centre / edges / random) with an amount
blend, jitter, reverse, rotate, reshuffle; ORDER presets (as played / low → high / high → low /
outside-in / inside-out / random), shuffle order, and click-two-dots-to-swap (K). Bottom bar:
voicing presets original · spread out · cluster (± octave) · cluster low · cluster high ·
high + low · reshuffle voicing (B, C; cluster = the smallest chromatic span, R5); Hear piano ·
Hear orchestrated · Stop (G); dur × · dyn × · flatten (R2, R4); the piano quick buttons none ·
one · top+bottom · rest · all (H); Insert @ playhead · Replace in place · back · save / load
take (O, Q). SPACE inside the drawer = hear / stop, never the score's transport.

**The model as coded (L):** `voices[]` = the harmony (pitch0 as played, pitch after the voicing
preset, lane, fold, tech, standIn, piano flag, slot); the onset PATTERN is derived from the
as-played onsets by the transforms; the ORDER maps voice → slot. Every transform re-derives
the bands. The shuffle draws players at random without replacement, never a misfit (the
technique's range from `instruments.js`; folding by octave only when `may fold` is on; locks
first). A hand assignment that misfits folds (↑↓) or is marked ✕ and stays silent. Fixed /
noise / multiphonic articulations get a default stand-in (nearest open string; the folded pitch
inside the technique's range), overridable in the variant list. Hear = MorphEmit's routes, CC7
127 per route, CC0 30 ms before each note, one absolute time base, `panic()` the one stop.
Insert = blast-insert object shape (`groupId grp-strike-<index>-<t×10>`, `sonifyNote`,
`technique`, `sonifyMode 'plain'`, `recVel`, `srcKind 'strike'`) + the META shape on layer 7,
undo pushed, META window opened.

**Verified in the running app (the composer's server, the AI's pane, zero console errors):**
strike #3 of ScatteredStrikes01 (20 notes, span 482 ms): all six voicings produce the expected
registers (cluster 51–59 → 63–71 at +1 oct; high + low = two packed clusters 39–47 / 88–95);
shuffle without folding assigns all seven players inside their ranges (0 misfits, checked
against the technique ranges); with folding + locks, top → Flute and bottom → Cello hold;
stand-in on `arco_open_vel` → nearest open string (F2 → G2); the seven rhythm shapes, reverse,
rotate, jitter, span × 2 give the intended onset patterns; bands regroup live (4 as played → 7
even); all six orders correct; Insert wrote 7 notes + 1 META object in one group in 13 ms;
Replace inside the source save removed the originals and re-inserted at t0; the piano quick
buttons count as designed (topbot 3 = own + top + bottom; rest = own + the 13 unassigned);
takes save and load back; Hear fails gracefully with the app's own message when Web MIDI is
blocked (this pane) — the composer's Chrome has it.

**Found and fixed while verifying — a real hazard:** object ids are PER SAVE (`wc-40` exists in
every score), so the first Replace deleted six unrelated objects from whatever score was
loaded. Rule now: Replace only inside the strike's own source save or its `-work` copy
(`pieceBase(sessionName) === strike.source`); otherwise it refuses with a status line and
does nothing. Second: the drawer's footer clipped its second row at a fixed height — the
drawer is now a flex column (footer never clipped). Third, a pane fact for the record: a
hidden browser pane never fires `requestAnimationFrame`, so a test script that awaits one
stalls — the dotted lines are drawn in a rAF (fine when the page is visible), tests call
`renderLines()` directly.

**Two page bugs from the first-sound session fixed in `composer.html` (NITS):** a `<select>`
or number input blurs on `change` and SPACE on a focused select toggles play instead of the
dropdown; `initZoneMidi()` runs once at the end of `init()` so a reloaded page has its
outputs and keyboard immediately. **Server:** `POST /api/strikes/ingest {score, gap, sim}`
runs `tools/strike_db.js` (the drawer's `rescan`) — the composer's running server predates it;
**restart `node score\server.js` once in the morning.**

**Not built tonight, by design (the composer listens first):** I double stops (a second flag on
the strings); K's lock; M / P the harmony collection and the Messiaen sets (index H001…,
PLAN 1d); N harmony swap by voice rank; the snapshot API beyond takes-in-localStorage;
the `kind` field in `instruments.js` (S — tonight a name rule classifies the rosters: cello
52 pitched / 30 fixed / 6 noise); Q's delete. NITS keeps the still-open `techs[0]` fallback.

## §40. The morning test begins — the drawer goes full height, and a tab that survives the toolbar

Composer, first look, with two screenshots (a wide screen and a 1920 px one): *"can't see
strikes button in main score in smaller screen, strikes pannel only half page height can we
make it full page height?"* On the 1920 px screen the score's toolbar wraps and the panel
buttons (Pulse · MT · Strikes) land on a second row over the Flute lane's label.

Done, verified in the pane against the composer's running server, no console errors:
- **A fixed `STRIKES ▴` tab at the bottom-right edge of the page**, independent of the toolbar
  (hidden while the drawer is open). The toolbar button stays.
- **Full page height by default** (100vh); `↕ half` in the drawer header returns to 58vh; the
  drag handle sets any height and remembers it (`cfg.full`, `cfg.heightPx`).
- **The keyboard rows fit the drawer** (`fit`, the default; Z1–Z3 remain explicit zooms): at
  720 px the rows come out 10 px, at 1080 px ~16 px — no more 7 px labels.
- The saved-settings key bumped to v2 so yesterday's stored row height cannot defeat the fit.

*Not done:* the toolbar's own wrapping on smaller screens (a page matter, not the drawer's) —
NITS when it bites elsewhere.

## §41. Ensemble balance — "a 127 flute is the same perceived loudness as a 127 violin"

Composer, first listening in the drawer (remote over Chrome Remote Desktop, Reaper switched to
WASAPI shared so CRD carries its audio): *"can we figure out an easy but data based way to
normalize the volume between instruments, flute sounds quite loud, so balance in the ensemble,
a 127 flute is same perceived loudness as 127 violin."*

The AI's proposal (piece #4's method, `probes/cc7_calibration_probe.ps1` → the REC track →
`probes/measure_rms.py`, turned into a balance probe): one scripted run plays every port's
plain technique at three pitches (25 / 50 / 75 % of the range) at velocity 127 and 64, on a
fixed schedule; the composer records the run once on the rack's REC track; an analyzer slices
the WAV by the schedule and reports per instrument the loudest 1 s RMS (K-weighted option for
"perceived") and the trim to a common target. Apply the trims as TRACK GAIN in the rack (every
playback path benefits, no app code, headroom untouched) and record them as data in
`sandbox/instruments.js` (`balanceDb`) + SAMPLER_QUIRKS. Rejected: velocity scaling in the app
(changes the sample layer, i.e. the timbre); a CC7 offset per instrument (eats the dynamics
channel's headroom). Caveat stated: equal RMS at 127 = fff matched across the ensemble, a
baseline the composer balances musically afterwards. Awaiting the composer's pick.

## §42. The balance kit built: timetable → probe → recording → trims (PLAN 0j)

Composer: *"A, go ahead"* (§41's option A — Reaper track gain, measured). Three pieces, all
data-driven from the recipe file, none touching the app:

- **`tools/balance_schedule.js`** — reads `sandbox/instruments.js` (evaluated as the browser
  script it is) and writes `probes/balance_schedule.json`: every track in score order, its
  PLAIN technique (ord · main · senza_vel — the flute's Ordinario on Flute ch 12, the bass
  clarinet's Senza Vibrato Velocity #13, the 8Dio piano ch 1, the strings' Senza Vibrato
  Velocity #6), three pitches at 25 / 50 / 75 % of that technique's range, velocity 127 then
  64; 1.5 s notes, 1 s gaps, 2 s between instruments, 3 s lead-in — **42 notes, 122 s.**
  Pitches: flute 69 78 87 · bcl 42 50 57 · piano 43 65 86 · vn 67 78 90 · va 59 71 82 ·
  vc 48 60 71.
- **`probes/balance_probe.ps1`** — plays the timetable straight into the loopMIDI ports
  (winmm, the port_note_probe pattern): CC7 127 + CC0 (or the UVI keyswitch) 300 ms before
  each note, absolute Stopwatch timing so drift cannot accumulate, all ports opened once,
  all-notes-off on close. `-DryRun` prints the timetable; `-Only violin1,cello` a subset.
- **`probes/analyze_balance.py`** — slices the REC-track recording by the timetable: finds the
  recording's start from the first onset (20 dB over the 5th-percentile floor), refines every
  note to its local onset (−0.1 … +0.4 s window), takes the loudest 1 s RMS in the note,
  flat and K-weighted (BS.1770's shelf + high-pass as a magnitude response in the FFT
  domain — numpy only, no scipy on this machine). Per instrument: the mean of the three
  pitches at 127 (and at 64, and the 127−64 difference, and the spread across pitches);
  **trim = target − level127, target = the quietest instrument** (cuts only, nothing can
  clip) or `--target -18`. Writes `bank/balance.json` with provenance.

**Self-test** (a synthetic recording from the timetable — sine bursts with known gains
0 / −6 / +3 / −9 / −8.5 / −4 / −12 dB, a −80 dB floor, the probe starting 2.345 s into the
file): all seven trims recovered exactly (±0.0 dB), the start detected at 2.34 s (10 ms
hops). The K-weighted path first came out 46.8 dB low — the FFT-domain RMS was normalized
by N twice; fixed (Parseval, one-sided, de-windowed) and re-run: within 0.5 dB of flat for
mid-band tones, +1.5 dB on the highest ones as the shelf intends.

**Gotchas met:** PowerShell 5.1 reads a BOM-less `.ps1` as ANSI — em dashes inside strings
broke the parser; the probe and the analyzer are pure ASCII now. Python printing "−" and "→"
to the cp1252 console raised UnicodeEncodeError — the analyzer reconfigures stdout to UTF-8.

**The run, for the composer (over CRD, Reaper on WASAPI shared):** arm the REC track
(output-stereo), record; `.\probes\balance_probe.ps1` from the repo root; stop after "done";
`python probes\analyze_balance.py <that wav>`; type the TRIM column into each track's volume
field. Then the trims are written into `sandbox/instruments.js` (`balanceDb`) and
SAMPLER_QUIRKS, and the rack file re-saved.

## §43. The first test's second batch: solo, the strike defaults, the level test revised, the wave-curve idea

Composer, three messages while the balance run waited at step 1:
- *"can there be a larger gap between piano keyboard and instruments, cant see where the lines
  are drawn to; can we make the default sound for all stacatto, no stac atto for piano so leave
  as is; collect these and I'll have you do a feature update all at once"* → STRIKES_TOOL U1, U2.
- *"can we solo individual voices or a collection; and new default: flute pizzicato (can you
  explain this technique, tongue ram?), violins-bartok pizz, vla/vc, gettato, bass clarinet slap
  tongue, all fff=127; and then sorry can you revise the level test keep what you have and add
  above articulations against each other"* → U3; U2 revised (the strike defaults replace the
  staccato idea); the balance run revised.
- *"a todo when we get there, for easier wave-curves, i can plot high and low points including
  plateaus, system will plot the entire wave-curve … click on segment, mouse scroll up/down
  left/right, (we need to better callibrate the mouse adjustment), click off or another"* →
  PLAN 1a, verbatim, with the AI's reading (extrema-first drawing, per-segment wheel shaping).

**The level test revised (PLAN 0j):** `tools/balance_schedule.js` now adds a second pass —
each instrument's STRIKE articulation the same way as its plain one (flute Pizzicato on Flute
ch 13, range 60–84 → pitches 66 72 78; bass clarinet Slap Tongue #6 cc0 5; violins Bartók
Pizzicato #80 cc0 79; viola/cello Gettato #21 cc0 20; the piano has none) — **78 notes,
224 s**; `--nostrike` gives the old run, `--strike inst=key` swaps one. `analyze_balance.py`
keeps the trims from the plain pass and prints a second table: each strike articulation's
level at 127, its distance from the instrument's plain level, and its level AFTER the trim —
the number that says whether the strikes sit level with each other once the faders are set,
and the spread across them. Self-test re-run: plain trims exact, the strike table prints
(0.0 dB differences by construction — the synthetic file gives both passes the same gain).
Where a strike articulation lands off the others after the trims, the remedy is a
per-technique gain, not a fader — decided when the numbers are in (a CC7 offset in the note's
prelude is the candidate, the tuba piece's per-event CC7 ownership makes it cheap).

**Tongue ram vs flute pizzicato (answered in chat):** *pizzicato* on the flute is a tongue
pizzicato — the tongue snaps off the closed lips (or the palate) with the fingering held, a
short pitched "plip" at roughly the fingered pitch, quiet, dry; *tongue ram* — the lips seal
the embouchure hole and the tongue is rammed into it, the tube becomes a closed pipe and
speaks a loud percussive "pop" a major seventh BELOW the fingered pitch (the manual's KS on
the FX preset, SI2 does the transposition itself — verify in 0c.8 which pitch the key sounds).
Both are strikes; the pizzicato is the softer, higher, more pitch-true of the two.

## §44. U4 (a narrower rhythm strip); the flute pizzicato notates as tongue ram

Composer: *"more features, you can save horizontal space by reducing the rhythm zoom/width of
bands; idont see a tongue ram in the sampler correct me if wrong, pizzicato sounds loud in
sample, just note that we'll notate this as tongue ram."*

- **U4** queued (STRIKES_TOOL): the rhythm strip narrower by default, the bands at true width.
- **Tongue ram in the sampler:** the recipe lists `tongue_ram` on the Flute FX KS preset from
  the SI2 manual (third keyswitch, D1 = 38) — but the composer's A5 screenshot showed only
  C1/C#1 red and the composer does not see one in the sampler. Marked UNVERIFIED in the recipe;
  settled by pressing D1 on the FX part (Flute ch 5) some day; not needed now.
- **Decision (composer): the SI2 Pizzicato sample is what sounds, and it is NOTATED as tongue
  ram** — the loud, popping sample is closer to the written tongue ram than to a tongue
  pizzicato. Recorded as `notate: "tongue ram"` on `flute.pizzicato` in `sandbox/instruments.js`
  (the first use of a technique → notation mapping field; the notation layer reads it at 2a),
  in SAMPLER_QUIRKS, and as a 2a note in PLAN.

## §45. The first balance take is digital silence — the REC track had nothing routed into it

Composer: *"recording"* → the AI ran `probes/balance_probe.ps1` (the composer: *"can you
run?"*): 78 notes, done in 222.5 s, every note printed on time. Reaper wrote
`reaper/Media/10-REC-260904_1247.wav` (270.7 s, 44.1 kHz, 24-bit stereo — the RECORD_PATH is
`Media`, gitignored). The analyzer: *no onset found*. Inspected: **peak −240 dBFS, every
second −240 dB** — digital silence for the whole take, the file complete and closed.

**Diagnosis from the rack file, not a guess:** the REC track's line is `REC 0 0 1 1 …` —
record mode 1 = "output (stereo)", input 0 = hardware mono input 1, monitor on; there is **no
`AUXRECV` anywhere in the file and no folder (`ISBUS 0 0` on every track)**. So REC's output
= its own hardware input (silent on WASAPI shared, and not the rack's audio in any case) —
the instrument tracks reach the master directly and never pass through REC. Piece #4's REC
track must have been fed live (receives that were never saved) — the ported rack carries only
its shell.

**The fix chosen:** make REC a FOLDER PARENT of the nine instrument tracks (REC first in the
list, `ISBUS 1 1`; the last child `ISBUS 2 -1`; the children's `MAINSEND 1 0` then means
"to the parent"), REC's input set to none. Its output becomes the mix of the nine, "record
output (stereo)" captures exactly that, and the master still hears everything through REC.
Done by editing the `.rpp` after the composer saves the live project (so the edit starts from
the truth), then File → Open to reload. Rejected: nine receives written by hand (the AUXRECV
field list is version-dependent — a folder is two flags); recording the master (Reaper has no
such input).

## §46. The balance run measured — the numbers, the window question, and what the strikes say

The second take (`reaper/Media/01-REC-260904_1313.wav`, 255 s, REC now a folder parent of the
nine tracks — the composer found the folder button; the flute pre-trimmed by the composer
after a +0.5 dB clip on the first attempt) — **no clipping, highest sample peak −1.6 dBFS**,
all 78 notes on time; the schedule found 21.99 s into the file.

**The window matters.** The first pass used the loudest 1 s RMS (piece #4's measure): it
undersells anything that decays — the piano read −38 and the flute pizzicato −44. Re-measured
with **400 ms** (BS.1770's momentary integration) for the sustained sounds and **50 ms** to
read the strikes at their own length; the analyzer now takes `--win` (default 0.4) and a
`--min −70 dBFS` "found" rule (a note below it did not sound), the floor clamped at −90 dB
(digital silence between notes had put it at −180). K-weighted throughout.

**Sustained (plain) at 127, 400 ms:** flute −6.6 · bass clarinet −18.4 · piano −34.4 ·
violin 1 −27.7 · violin 2 −27.2 · viola −23.9 · cello −26.3 dB. Peaks: −1.6 · −7.7 · −20.6 ·
−23.5 · −22.7 · −15.9 · −14.7. The flute is 21 dB above the violins, the piano 7 dB below them
— the composer's ear ("flute sounds quite loud") in numbers. 127 → 64 drops 7 (flute), 10–12
(the rest), 5.6 (viola).

**Strikes at 127, 50 ms:** flute pizzicato −19.9 (14 dB under the flute's sustained; its
sample PEAK is level with the ordinario's, −1.9 vs −1.6 — a loud instant, little energy) ·
bass clarinet slap −24.8 (6 under) · Bartók −21 (6 ABOVE the violin's sustained; peak 14 dB
above) · gettato −24 / −26 (level with the sustained). After per-instrument trims anchored on
the sustained sounds the strikes spread **20 dB** (Bartók −22 … flute pizzicato −42). That is
the finding: **one gain per instrument balances the sustained sounds; the strikes then land
where the samples put them — a flute tongue pizz far under a Bartók pizz, as in life.** If
the composer wants the strikes level with each other, that is a per-TECHNIQUE gain (a second
table, applied by the app), decided after listening in the drawer.

**Two range facts from the data:** the violins' Bartók Pizzicato has NO sample at B♭6 (90) —
both violins silent there (found rule) — its top is somewhere in 79–89, to be read from the
GUI; the cello's Senza Vibrato is 12 dB softer at B4 (71) than at C3 (48).

**The anchor.** Trims to the quietest (the piano) would pull the flute −28 dB and everything
else −7…−16 — a quiet mockup. Proposed anchor instead: the violins' level (−27.45): flute
−21 · bass clarinet −9 · piano +7 · violin 1 0 · violin 2 0 · viola −3.5 · cello −1 (the
analyzer's `--target -27.45`), applied at the sampler instance masters (piece #4's
gain-staging rule, the composer's own instinct today: "trim at instrument?"), faders at 0.
`bank/balance.json` holds the 400 ms measurement with provenance.

## §47. Decision: the balance anchors on the violins (A); the strikes at those trims

Composer: *"for gain anchor on violin, and clarify strikes? what will they be at adjusted
values and remember flute pizz meant to actually be tongue ram so louder, what is it like if
strikes at different gains you send cc msg or different tracks?"*

**A adopted** — trims (400 ms, K, target −27.45 = the violins): flute −21 · bass clarinet −9
· piano +7 · violin 1 0 · violin 2 0 · viola −3.5 · cello −1, at the sampler masters.

**The strikes at those trims (50 ms reading + trim):** Bartók −21 (both violins) · piano's
own note −21 · cello gettato −27 · viola gettato −28 · bass clarinet slap −34 · flute
pizzicato −41. So the two wind strikes fall 13 and 20 dB under the string strikes — and the
flute's is meant to be a TONGUE RAM, a loud pop, not a tongue pizz.

**Mechanisms compared (the AI's analysis, given in chat):** (1) CC7 per technique in the
note's prelude — the app already owns CC7 per event, but CC7 only cuts, so a boost means
raising the instrument's master and cutting every other technique, and CC7 is also the
dynamics channel (a 20 dB offset eats a third of its span); a stray note without the offset
is loud. (2) Separate CHANNELS/parts with their own gain — the flute's pizzicato is already
its own UVI part (ch 13): put the −21 on the SUSTAINED parts, leave the pizzicato part at 0,
and the tongue ram lands at −20, level with the Bartók, no CC, no new track; the bass
clarinet's slap is a CC0 preset inside one Kontakt instrument, so it gets a second slot of
the same instrument on a strike channel (D11 leaves 5+ free) with its own slot volume (+12
max) — the recipe's `channel` field routes it. Recommended (2): static, D11-shaped, nothing
to go wrong at play time. Awaiting the composer's pick.

## §48. B adopted; the survey: how the AI can handle Reaper and the samplers (→ `docs/REAPER_CONTROL.md`, PLAN 0k)

Composer: *"B, can we figure out how you can handle reaper instruments? lets discuss and make a
plan first? what capabilities does ai have and what are the mechanisms, co-work? mcp? custom
reaper scripts lua? lets do a comprehensive survey and find the best, fast and reliable and most
functions, solutions"*.

**Surveyed** (the table in REAPER_CONTROL.md §2): the `.rpp` file (proven, slow loop) · ReaScript
Lua through a file bridge (a defer loop from `__startup.lua` polling an inbox — the whole API,
live, ~30 ticks/s, one file to install; the pattern of Reaper Daemon and the file-mode MCP
servers) · the web interface and OSC (triggers, thin on data) · the command line (offline
renders) · seven community MCP servers (TwelveTake 176 tools, xDarkzx 172, bonfire via
python-reapy, total-reaper-mcp, yeeking, mthines, wegitor — all the same bridge underneath, each
with a Python stack and a fixed vocabulary) · MIDI to the samplers (playing and preset selection,
not configuration) · the sampler internals (GUI-only: desktop automation or the composer's hands
= co-work) · the plugin state blob (never).

**The finding that decides the plan:** CC7 is mapped to the Kontakt slot / UVI part volume by
default, and the app pins CC7 = 127 before every event — so a static trim on those faders is
reset at the first note; the instance masters (piece #4's calibration knob) are GUI-only, no
API, no number in the file. Reaper's faders and gain plugins are exact, bridge-settable,
readable, saved as numbers. **Hence: instrument trims on the Reaper faders; a strike technique
with its own gain on a child track fed by a sampler sub-output** (UVI part → outs 3/4; a second
Kontakt slot on the strike channel → output st.2), set once in the GUI. Piece #4's gain-staging
rule amended for this rack, for that reason.

**Recommended:** build our own bridge (~100 lines of Lua + a Node job runner), not an MCP
install — nothing between the AI and the API, no dependency, verifiable by read-back. Plan 0k
in four steps (bridge · jobs · apply B · the co-work protocol). Awaiting the composer's go.

## §49. UVI Workstation's state is XML — the plugin's insides are text (amends §48)

Composer: *"so, how about the initial set up, i had to insert the instrument and add a multi and
change a# etc. bypass effects x 19. any solutions to this? hybrid? other methods to access fx
plugin interface? i think uvi has some sort of programmable messages?"*

Checked in the rack file rather than guessed: the Flute SI2 track's `<VST` block, base64
→ bytes: a 312-byte header, then a **zlib stream that inflates to 3.5 MB of XML**
(`<UVI4><Engine …><Synth DisplayName="Master" Gain="0.79432821">` — the composer's −2 dB
of this morning, as a number), then a short tail. In the XML: sixteen `<Part … Gain=
MidiChannel= OutputName= Mute= …>`, each `<Program … ProgramPath="$IRCAM Solo Instruments
2.ufs/Presets/05 Flute/…uvip" BypassInsertFX=…>`, every insert effect with its own
`Bypass="0|1"` (1790 bypassed flags in the file — the composer's nineteen clicks, as text).
The PP2 track the same (47 MB of XML). Kontakt's chunk is the NKI binary (KSP script text
visible inside, no structure to edit) — not this route.

**So, for UVI, the plugin interface IS accessible without the GUI:** parts, channels, gains,
outputs, preset paths, effect bypasses are attributes; a change = decode → edit → deflate →
re-encode → back into the track (live through the bridge's `SetTrackStateChunk`, or the file
+ reload). Two things to prove before trusting it: the round trip (re-encode unchanged and
have UVI accept it) and one visible edit (a part's channel) seen in the GUI. This amends
§48's "instance masters are GUI-only": true for Kontakt, false for UVI. Kontakt's setup
stays GUI + duplication (a finished track's chunk copied to an identical instrument, track
templates), with desktop automation for the repeated clicks and a possible KSP multi-script
for runtime settings (unexplored).

## §50. Kontakt's "#000 … #511" parameters — host automation, a third door into the samplers

Composer, a screenshot of Reaper's Param menu on the Piano Kontakt track (FX parameter list:
#000, #001 … ): *"also the param i dont know if these would be useful"*. They are Kontakt 8's
host-automation slots (VST3 exposes 512 unnamed ones; UVI Workstation has its own set). Each
is BLANK until a knob inside Kontakt is assigned to it (Kontakt → Automation → Host
Automation → drag the slot onto the knob), a one-time GUI drag per knob per instance; after
that the knob is a number the bridge sets and reads (`TrackFX_SetParam`), saved in the `.rpp`.
The catch: the obvious knob, the slot's Volume, is the one CC7 drives — the app's CC7 = 127
pin would overwrite a trim there at the first note. Useful on knobs CC7 does not touch: the
8Dio panel's own GAIN, the Xsample instrument's volume control, Kontakt's Output-section
faders. So for Kontakt: setup stays GUI once; STATIC trims can become numbers through host
automation on a CC7-free knob; the rest of the AI-side control is Reaper's. Not needed for
UVI (the XML route, §49). Filed in REAPER_CONTROL as mechanism 8b.

## §51. Kontakt's developer features = the Kontakt Lua API — the Kontakt side becomes a script too

Composer, a screenshot of Kontakt 8 → Options → Developer ("Enable developer features — Lua
API, repacking NKRs …"): *"kontakt dev features?"*. Read the Kontakt 8 API Reference Manual
(NI, 2024-09-26 edition; 64 pages, fetched as PDF and text-extracted) rather than guessed.

**What the API does, at the MULTI level** (exact names): `load_instrument(filename, slot)`
(an .nki into a slot; returns the index) · `set_instrument_midi_channel(idx, ch)` — *0 = omni,
1…64 = channels 1–16 across ports A–D* (the [A] 1…4 of D11) · `set_instrument_output_channel
(idx, ch)` ("check how many outputs are available first") · `set_instrument_volume(idx, dB)`
(up to +12) · pan · mute · solo · tune · polyphony · name · `set_instrument_options` (key /
velocity ranges, transpose, voice stealing) · `save_multi(filename, {mode=…})` / `load_multi`
· `reset_multi` · `get_instrument_indices`, `get_num_instruments`, all the getters for
read-back · multi-script and instrument-script sources get/set. Indices: 128 per slot (slot 3
= 256). Below that, the instrument level: groups, zones, modulation — instrument building.

**How a script runs:** inside Kontakt (the plugin instance too — the main menu's "Run Lua
script…" F11, Ctrl+F11 to repeat; scripts also appear in Kontakt's Files browser and run by
double-click or by drag-and-drop onto the rack, from Explorer as well), or as a command-line
argument to the STANDALONE Kontakt (output to a terminal). Enabled by the Developer checkbox
(a security note: scripts can read/write files — run only ours).

**So the Kontakt setup is a script:** one Lua file per Kontakt track type (the bass clarinet,
the piano pair, the violin ×4 curve slots, viola, cello) that loads the .nki(s) into the
slots, sets [A] 1–4, outputs, names, volumes; run once per instance by a drag onto the rack
(three seconds), verified by the getters printed back. The state then lives in the `.rpp` as
before. Combined with §49 (UVI = XML) and §50 (host automation for CC7-free knobs), every
sampler-internal step the composer did by hand this week has a scripted form; what stays
manual is dragging one script onto each Kontakt instance and, in UVI, nothing.

The manual: https://docs.native-instruments.com/pdf-guides/kontakt/Kontakt_8_API_Reference-en_260924.pdf
(NI's document; not stored in the repo). Filed as REAPER_CONTROL mechanism 8c; PLAN 0k.5.

## §52. 0k.1 built: the bridge, the job runner, the Kontakt proof script — awaiting the first heartbeat

Composer: *"just slot it in to the plan and what are the steps now?"* → PLAN 0k carries the
running order (bridge ► · Kontakt proof · UVI proof · apply B · setup scripts).

Built: `reaper/bridge/bridge.lua` (a defer loop: oldest `inbox/*.lua` → `load` in a sandboxed
env with `reaper` → `xpcall` with traceback → `outbox/<name>.json` {ok, result | error, ms,
project} → the job moved to `done/`; a heartbeat file each second with Reaper's version, the
project, the track count, the play state; a one-copy guard on extstate; `atexit` cleanup; a
JSON encoder of its own) · `tools/reaper_job.js` (atomic drop into the inbox — temp name then
rename — and a 30 ms poll for the answer; jobs `heartbeat · tracks · fader · save · chunk ·
run <file> · -e <lua>`) · `reaper/bridge/install.md` · `reaper/kontakt/proof_readback.lua`
(every slot's name / MIDI channel / output / volume / pan / mute / solo / polyphony / tune →
`reaper/kontakt/out/readback_<time>.json`, nothing changed).

Installed: `%APPDATA%\REAPER\Scripts\__startup.lua` was present but EMPTY (Reaticulate's
folder, no startup line) — now the one `dofile` line; the runtime folders exist and are
gitignored. The heartbeat is absent until the composer starts the bridge once in the running
Reaper (Actions → ReaScript: Load… → bridge.lua) — the first proof is that heartbeat and the
`tracks` job listing the rack.

## §53. 0k.1 PROVEN: the bridge answers in 31 ms

Composer ran `bridge.lua` through "ReaScript: Run ReaScript (EEL2 or Lua)…" (the console:
`[bridge] 0.1 (2026-09-04) watching …eaperridge\inbox`). The first check from the AI
had run seconds before the load — no heartbeat; the second: **alive, Reaper 7.72/x64, the
rack project, 10 tracks**, and the `tracks` job answered with the whole rack — **0 ms inside
Reaper, 31 ms round trip** through the files — every track's name, fader (all 0 dB), arm (all
armed), folder depth (REC +1 … Vc −1: the folder the composer built this morning, seen from
inside), record mode (REC = 1, output), and FX (UVI ×3, Kontakt 8 ×6). PLAN 0k.1 ☑ → 0k.2.

## §54. 0k.3 half-proven: the live UVI state read and rebuilt through the bridge (not yet pushed)

`tools/uvi_state.js` (info · decode · roundtrip · encode, `--push` to write into the running
instance) read the Flute SI2 track's chunk THROUGH THE BRIDGE — the live state, not the file:
16 parts, `MidiChannel` 0-based (Part 13 = channel 13 = the Pizzicato, as the recipe says),
every part +6.00 dB, the master −2.00 dB (the composer's trim of this morning, live),
programs by name and path, 3 528 052 bytes of XML, a 312-byte header, no tail. The header
has ONE length field (offset 288 = 12 + compressed) — the tool rewrites any field equal to
the old compressed length + k, generically. Unchanged re-encode: compressed 105 275 →
105 354 bytes (a different zlib, the same XML), self-decode identical. The push (the same
state back into the instance, then a read-back) waits for its turn after the Kontakt proof
— the running order — and for the composer's ear on the instance afterwards.

## §55. 0k.2 step 1 PROVEN: the Kontakt Lua API runs inside the plugin instance in Reaper

Composer: *"neither is that easy, other way or more clear instructions"* (the drag / F11) →
the clear route: Kontakt → Options → Developer → enable; the **KONTAKT ▾ menu → "Run Lua
script…"** → the file. *"ok ran"* — twice (14:55, 14:58). `reaper/kontakt/out/readback_*.json`:
multi "New (default)", 2 instruments — **Plucked Piano: slot 2 (idx 128), MIDI channel 2,
output 0, volume −0.02 dB, polyphony 32 · 8DIO_1969_Legacy_Piano: slot 3 (idx 256), MIDI
channel 1, output 0, −0.02 dB, polyphony 896** — slot 1 is empty (the Spitfire grand the 8Dio
replaced). The API's index arithmetic confirmed (128 per slot). One bug of mine: `ok and v or
'ERR'` turns a legitimate `false` (mute, solo) into "ERR false" — fixed with an if.
`proof_write.lua` (Plucked −6 dB → read back → restored → read back, a file with both) is the
next drag; the load proof needs the library's `.nki` path — read from Native Instruments'
registry entries rather than searched for.

## §56. 0k.2 PROVEN, all three: the Kontakt multi is code

- **Write** (`proof_write.lua`, 15:09): Plucked Piano volume −0.02 → set −6.0 → read back
  **−6.0** → restored → read back **−0.02**. `ok: true`.
- **Load** (`proof_load.lua`, 15:08 and 15:10): `load_instrument("H:/…/Plucked Piano.nki", 0)`
  → returned index **0** (the empty slot 1); `set_instrument_midi_channel(0, 5)` → read back
  **5** ([A] 5); `set_instrument_output_channel(0, 1)` → read back **1** (st.2 — the output
  section accepted a second channel); volume −3.0; instruments 2 → **3** → `remove_instrument`
  → **2**. Every call `ok`, nothing left behind.
- The instrument files, found on disk (the registry lists only Kontakt's own content;
  non-Player libraries are not registered; the chunk stores paths encoded): Spitfire
  `H:/Spitfire Audio Plucked Piano KONTAKT-iPirateU/Instruments/Plucked Piano.nki` · 8Dio
  `H:/8Dio - 1969 Steinway Legacy Grand Piano (Kontakt)/Instrument/8DIO_1969_Legacy_Piano.nki`
  · Xsample `C:/Users/jwloy/Documents/Xsample Sample Library/Xsample_Collection/Instruments
  Elastic/Woodwinds/Bass Clarinet.nki` (piece #3 also kept a `Bass Clarinet BCHA.nki` in its
  `reaper/nki_backups` — which one the septet's slot holds, the read-back will say).

**So the bass-clarinet strike slot (0k.4) is one script:** load the .nki into a free slot,
channel 5, output st.2, name it, done — and the four curve slots per string track (0c.7) the
same way. PLAN 0k.2 ☑ → 0k.3 (the UVI push).

## §57. 0k.3 round trip PROVEN: UVI took the pushed state and gave it back

`node tools/uvi_state.js roundtrip "Flute SI2" --push`: the live chunk read through the
bridge → XML → re-encoded (my zlib: 105 354 bytes; the header's one length field rewritten)
→ `SetTrackStateChunk` returned **true** (142 007 bytes) → read back: **the XML identical to
what was pushed, and the compressed stream back at UVI's own 105 275 bytes** — i.e. UVI
inflated my stream, took the state, and re-serialized it itself. That is the proof that the
plugin accepts a rebuilt state, not merely that Reaper stored my bytes. Next: the visible
edit (Part 13 → the second output pair), whose vocabulary is read from the XML first.

## §58. 0k.3: the XML edit is LIVE and honoured — and UVI's extra outputs are silent in this instance

The vocabulary, read from the plugin binary rather than guessed: UVI Workstation's output pairs
are "Out 2" … "Out 17" (17 pairs = the 34-out VST2 build); UVI's support notes say the same
(Main Out, Out 2, Out 3 …) and put the selector in the SETTINGS tab. The composer's Settings
tab showed **A13 Flute Pizzicato → Out 2** after the AI's text edit — the GUI reading the
pushed state.

**Proof method for audio, built on the way:** `reaper/bridge/jobs/peakwatch.lua` — a job that
starts its own defer loop and records each track's channel maxima (`Track_GetPeakInfo`) for
3 s into `outbox/peakwatch.json`; launch it, fire the note from outside (timing no longer
matters), read the file. (`Track_GetPeakHoldDB` returned the same −1.5 on every track and
channel — not a per-channel meter; abandoned.) `jobs/flute_strikes_track.lua` built the
**Flute strikes** child track (index 3, +21 dB accepted by `D_VOL` beyond the fader range, a
post-FX pre-fader send flute 3/4 → child 1/2, the flute at 4 channels, its parent send 2
channels) in 166 ms.

**Results (maxima, dB):** ordinario on Main: flute ch1/2 −2.8/−3.3, REC the same, nothing on
3/4 or the child (control) · **pizzicato on Out 2: nothing anywhere** · ordinario moved to
Out 2 by XML: it LEFT the main out (ch1/2 silent — the edit is live) but **nothing on plugin
outputs 3/4**, even after re-instantiating the plugin (`TrackFX_SetOffline` true/false) ·
ordinario back on Main by XML: ch1/2 −2.8/−3.4 again. Pin mappings read back as default
(out 3 → track ch 3, out 4 → ch 4; the plugin declares 34 outs).

**So:** text edits of UVI's state work end to end; the remaining question is on the plugin /
host side — why this VST2 instance's outputs beyond the first pair carry nothing (a Reaper
plugin-output count still at 2 from instantiation? a UVI preference for multi-out?). Part 13
reverted to Main so the pizzicato sounds meanwhile. Awaiting the FX window's "n/34 out"
pin connector and UVI's preferences, from the composer's screen.

## §59. 0k.3 PROVEN end to end — the token was a path; the "dead" meters were a mute

**The missing piece, learned by diffing rather than guessing:** the composer set A13's output in
UVI's Settings tab; the state diff against the baseline was ONE attribute: `OutputName=
"$Engine/Out 2"` — a path, not the bare "Out 2" the plugin's strings show. With that token,
written by text: the pizzicato **leaves the flute's main channels (−154 dB), arrives on the
flute's channels 3/4 (−2.3 / −2.8), on the `Flute strikes` track (−2.3 / −2.8), on REC and the
master (−0.9 / −1.4)**; the ordinario control stays on 1/2 and never touches the strikes track.
UVI's insides are text, proven with audio. `tools/uvi_state.js set-output "<track>" <part>
"Out n" --push` now does it in one line (prefix added, read back).

**Two things that cost an hour, for the record.** (1) The `Flute strikes` child was built at
+21 dB absolute — wrong by design: the +21 is RELATIVE to the flute's coming −21 fader, so the
child belongs at 0 dB; the pizzicato's sample peak is −1 dBFS, and the GUI test put +20 dBFS
into REC. (2) After that blast, **REC was muted** (the composer's hand, understandably — a muted
folder parent silences every instrument and freezes their meters), and the next six tests were
read behind that mute: the send, the parent-send channel count, a plugin reload and a mute
"kick" were all suspected before the state dump showed `REC mute 1`. Lesson (P10 candidate):
**when downstream meters freeze at identical values, dump mute / solo / routing FIRST.**
Unmuted through the bridge; the parent send back to "all channels" is harmless (REC has two).

Method notes: `Track_GetPeakInfo` reads a track's INPUT (pre-fader) level — the child read
the source's level at +21 while REC read +20; a job may start its own defer loop (peakwatch)
so note timing from outside stops mattering; `TrackFX_SetOffline` true/false re-instantiates a
plugin from its state (UVI needs ~30 s to reload 16 parts). PLAN 0k.3 ☑; 0k.4's flute lane
exists (`Flute strikes`, send flute 3/4 → child, post-FX pre-fader, 0 dB).

## §60. 0k.4: B applied — the faders, two strike lanes, the recipe

- **Faders (A, the violins' level), set through the bridge in one job:** Flute SI2 −21 ·
  Fluteb SI2 −21 · Bass Clarinet XS −9 · Piano Kontakt +7 · Piano PP2 +7 · Vn1 0 · Vn2 0 ·
  Va −3.5 · Vc −1 · the lanes 0. Recorded in the recipe as `balanceDb` per instrument.
- **The flute lane:** UVI Part 13 (Pizzicato = the written tongue ram) → `$Engine/Out 2` by
  text → plugin pins 3/4 → track channels 3/4 → a post-FX pre-fader send → `Flute strikes`
  (0 dB, index 3). Proven with meters (§59).
- **The bass-clarinet lane:** `bcl_strike_slot.lua` run by the composer inside the instance:
  the multi had 4 instruments (slot 1 "Bass Clarinet" on [A] 1, output 0), the script loaded
  the same `.nki` into slot 5 (index 512), named it "Bass Clarinet STRIKE", MIDI channel 5,
  output st.2, 0 dB — read back exactly. `jobs/strike_lane.lua` built `BassCl strikes` (index
  6, channels 3/4 → lane, 0 dB). **Slap on channel 5 → bcl ch 3/4 −15.2 / −14.2 → the lane →
  REC and master at −15.2 (no trim on that path); senza on channel 1 → bcl ch 1/2 −8.9 → REC
  −17.9 (the −9 fader applied); each path silent on the other.**
- **The recipe:** `bass_clarinet.slap.channel = 5` (+ `lane`), `flute.pizzicato.lane`,
  `balanceDb` on all seven. The app routes by channel, so the drawer's slap now plays the
  strike slot after a page reload. The balance timetable regenerated from the recipe (the
  slap now on channel 5) for the re-measurement of the two instruments.
- Unsaved in Reaper until the composer's CTRL+S (the rule): the lanes, the faders, the UVI
  routing, the Kontakt slot.

## §61. 0k.4 CLOSED: the re-measurement lands on the anchor; the strikes on their lanes

`reaper/Media/01-REC-260904_1553.wav` (the flute + bass clarinet timetable, 24 notes, 71 s;
no clipping, peak −0.7 dBFS), analyzed against the violins' anchor −27.45:
- **Sustained at 127 (400 ms, K):** flute Ordinario **−27.6** (residual +0.1) · bass clarinet
  Senza **−27.5** (+0.0). The faders set through the bridge did exactly what §47 said.
- **Strikes at 127 on their lanes (50 ms):** flute Pizzicato / tongue ram **−19.8** — level
  with the Bartók pizz (−21, §47) as B intended; bass clarinet slap **−25.0** — 4 dB under the
  Bartók, the gettati at −27 / −28 just below it. The lanes sit at 0 dB: the strikes simply
  keep their untrimmed level while the sustained sounds took the trims — no positive gain
  anywhere, nothing near clipping.
- `bank/balance_fl_bcl.json` (400 ms) holds the run; the 50 ms reading is in this entry.

**The state of the rack after today** (SAMPLER_QUIRKS ledger updated): faders flute −21 ·
Fluteb −21 · bass clarinet −9 · both pianos +7 · violins 0 · viola −3.5 · cello −1 · lanes 0;
`Flute strikes` (UVI Part 13 → `$Engine/Out 2`) and `BassCl strikes` (Kontakt slot 5 "Bass
Clarinet STRIKE", [A] 5, output st.2) fed by post-FX pre-fader sends of channels 3/4; the
recipe carries `balanceDb`, `slap.channel = 5`, `lane` on both strike techniques. PLAN 0k.4 ☑.
What remains of 0k is 0k.5, the setup scripts as the standing way (the ×4 curve slots for
0c.7 etc.) — not needed today.
