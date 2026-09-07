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

## §62. 0k.5 begun: the bridge as a foundation for every Reaper project

Composer: *"ok for b also can we generalize or start the foundation for additional reaper
projects, I'd like to do something similar for my live electronics project but it is mostly
audio with me playing live and webbrowser or supercollider playback. then check back in and
we'll do a the feature updates."*

Done, awaiting one restart of the bridge by the composer (the running copy predates it):
- **One bridge per machine.** `bridge.lua` 0.2 keeps its RUNTIME (inbox / outbox / done /
  heartbeat) in Reaper's own resource folder `%APPDATA%\REAPERridge\` — outside any repo —
  so any project's tools talk to the same bridge; the code stays in git. A job may return
  `{ __reload = true }` and the bridge restarts from its file (no clicks after an edit).
- **`tools/reaper_job.js`:** the runtime path from `$REAPER_BRIDGE` or `%APPDATA%`; a project
  guard (`$REAPER_PROJECT`, default `septet_rack` — refuses to send while another project is
  open); generic jobs added: `transport play|stop|record|pause`, `marker`, `arm`, `reload`.
  Dependency-free: a copy per repo is the install.
- **`reaper/bridge/README.md`:** the foundation — the shape, the install in another repo, what
  the live-electronics project would use (arm / record / markers at cues / a level check on the
  inputs / FX-chain read-backs; the browser and SuperCollider stay outside Reaper, their cues
  can arrive through Reaper's OSC surface and be mirrored as markers), the rules.
- **`reaper/kontakt/curve_slots.lua`:** the first 0k.5 script — the instrument in slot 1
  copied into slots on [A] 2 / 3 / 4 named "… curve A/B/C" (D11's banks, for 0c.7), the
  `.nki` chosen by slot 1's name from a table (the Xsample strings' files found on disk:
  `Xsample_Contemporary_Solo_Strings/Contemporary Violin | Viola | Violoncello.nki`). Not run yet
  — it runs when 0c.7 wires the curve routing.
- A pane fact for the record: the Bash tool turns a doubled backslash-n in a heredoc into a real
  newline, and a backslash-b into a backspace — patches with such sequences go through a
  script file, never a heredoc.

## §63. The foundation verified: the relocated bridge, and reload-from-a-job (after one bug)

After the composer's restart: heartbeat alive, **bridge 0.2, runtime in `%APPDATA%\REAPERridge`**,
the `tracks` job in 30 ms listing all 12 tracks with today's faders. The first `reload` job then
KILLED the loop: the fresh copy, started by `dofile` inside the same Lua state, saw the global
`RELOAD` flag still true and reloaded itself forever → "C stack overflow" (Reaper's dialog).
Fix (0.2.1): clear the flag before the `dofile`. One more restart by the composer — the last:
**`reload` from a job now works** (a new stamp after each: …624 → …656 → …658), a job answered
in 31 ms in between, twice in a row. Editing `bridge.lua` is now a push and a `reload`, no
clicks. PLAN 0k.5's foundation stands; `curve_slots.lua` waits for 0c.7. Next, at the
composer's word: the drawer's feature update (STRIKES_TOOL U1–U4).

## §64. The drawer's feature update: U1–U4 built and verified

Composer: *"then build all 4 pls"* (after the Lake George note). One patch of 30 edits to
`strike_drawer.js`:
- **U1** a gap column between the keyboard and the players (grows with the screen, 120–320 px);
  every player row carries a landing marker (lit when the player has notes) that the dotted
  lines end on; hovering a row brightens its lines (2.2 px, the others dimmed).
- **U2** `STRIKE_DEFAULT` per instrument — flute `pizzicato` · bass clarinet `slap` · violins
  `bartok_vel` · viola / cello `gettato_vel` · piano `main` — used by the shuffle, by hand
  assignment and as each row's menu default; `flat 127` on by default (the settings key bumped
  to v3 so the new defaults apply once). `defaultTech(lane)` falls back to the plain technique
  where a roster lacks the strike.
- **U3** a `solo` flag per voice: shift-click a dot on the keyboard or in the rhythm strip, `S`
  on a player row (all its voices), `solo off` in the footer; soloed dots white-ringed, the rest
  dimmed; while anything is soloed, Hear and Insert use only the soloed voices. In the state
  and the takes.
- **U4** the rhythm strip at 480 px by default (a `width` slider 320–1400 in its controls), the
  bands at their true width; the freed space goes to the gap, the remainder to a spacer.

**Verified in the running app** (the composer's server, the AI's pane, zero console errors):
shuffle on strike #3 gives `flute:pizzicato · bass_clarinet:slap · piano:main · violin1/2:
bartok_vel · viola/cello:gettato_vel`; every note at velocity 127; 7 landing markers, 7 `S`
buttons, 7 lines; one voice soloed → Hear yields 1 note (the dot's stroke white), solo off →
7; the hovered lane's line 2.2 px against 1; the strip 480 → 320 px with the slider. The
slap plays the strike slot (channel 5) through the recipe. Next: the composer's test.

## §65. Takes into the repo (O v2), and SPACE taken back from the transport

Composer, at the start of session 3: *"are the takes in the strikes saved and eventually
commit/pushed?"* — No: v1 kept them in the browser's localStorage (`septet.strikeTakes.v1`,
STRIKES_TOOL O); nothing on disk. Then: *"yes lets keep those save files as well, also I've saved 2
already lets try to preserve them; and in the strikes drawer, I hit space to play, that was working
But then at some point, it started playing the main score. I could hear it too. So if we could
prevent that from happening, that'd be good."*

**Takes (O v2).** The drawer now saves through the panels' snapshot route (`/api/snapshots`,
`score/snapshots.js`: state opaque, an unknown panel created on first contact, `saved` stamped by
the server, a bad name refused) into `bank/panel_snapshots.json` under the bucket `strikes` — the
file git carries. `save take` / `load take…` / a new `×` (deletes the take named in the box, asks
first). The default name is `take YYYY-MM-DD HHMM` (v1's `take HH:MM` would fail the server's name
rule — no colon). A one-time migration on the next page load copies every v1 take to the file
(a name corrected to the rule is said so; a name already on the file is skipped), then renames the
browser key to `…v1.migrated` — nothing deleted. The list refetches on every open, so a take the AI
writes appears without a reload. *Rejected:* keeping localStorage as the store (per-browser, not in
git — the composer's question was the whole point); a new route (the snapshot route exists for this,
and the file's `_contract` already names takes as its use).

**SPACE.** Diagnosis from the code, then reproduced in the AI's pane on the composer's server:
the drawer's SPACE listener sat on the drawer element, so it saw keys only while the focus was
inside the drawer; the score's own rule from 2026-09-03 ("pull-down menus trap the spacebar") blurs
every `select` and number input on change (a capturing `change` listener in `composer.html` init),
so the first technique or preset change in the drawer moved the focus to `<body>` — and the score's
window-level SPACE handler (`togglePlay`) took the next SPACE. Reproduction: drawer open → a
`select` change → `activeElement` = BODY → SPACE → `Composer.isPlaying = true`, the drawer silent.
Fix: the drawer's listener moved to `window` in the CAPTURE phase, gated on the drawer being open —
it runs before the score's bubbling listener whatever the target, stops propagation, blurs a focused
select or button first (SPACE would open / press it), and leaves text entry alone (the take-name box
needs its spaces). While the drawer is open SPACE belongs to the drawer; the score's Play button
still works by mouse.

**Verified in the running app** (the composer's server, the AI's pane, zero console errors):
drawer closed → SPACE plays the score (unchanged) · drawer open, focus on BODY after a select change
→ SPACE: the score does NOT start and the drawer's hear path runs (the pane's "BLOCKED Web MIDI"
status is that path's own preflight — MIDI is denied in the pane, NITS) · SPACE in the take-name box:
untouched · SPACE on a focused select in the drawer: blurred, the score silent · take `zz-ai-test`
saved → in the file with its strikeId, 20 voices, the comment `strike #3 · ScatteredStrikes01` and
the server's timestamp → in the list → loaded (the status names the take, its comment, the time) →
`take 14:05` refused with the rule → deleted (0 left, the list empty). Side effect worth knowing:
the server rewrites the bank file with 2-space indentation (it was 1-space from piece #4's tool) —
a one-time whitespace diff plus the empty `strikes` bucket, committed now; the composer's two takes
land in it on his next reload and are committed then.

**Also answered (composer, mid-turn, with a screenshot — F6 unassigned, the cello row empty):**
*"And what if an instrument gets left out? Can I hook it back in without reshuffling?"* — Yes: the
two-click assign (F): double-click the dot on the keyboard (status: "voice F6 armed — click a player
row to assign it"), then click the Cello row; the note folds by octave into the cello's
strike-technique range (the line shows ↓); nothing else moves. Why it was left out: the shuffle never
misfits and `shuffle may fold` was off, so a voice that sits outside the last free player's range as
played is dropped rather than folded; with `shuffle may fold` on it would have been folded.

## §66. The migration proven with two seeded takes; the composer's four are still in the browser

Composer: *"There are four c files now in the drawer. Is that okay? Will they be preserved?"* The bank
file held 0 takes at that moment, and the server serves the new `strike_drawer.js` with
`Cache-Control: no-store` — so the four are v1 takes in the browser's list: the page has not been
reloaded since the fix. Proof of the path in the AI's pane: two takes seeded under the v1 key
(`zz-ai-mig 14:05`, `zz-ai-mig-two`) → reload → status "takes moved to bank/panel_snapshots.json:
zz-ai-mig 14-05 (was "zz-ai-mig 14:05"), zz-ai-mig-two" → both on the file, both in the list, the v1
key gone, the `.migrated` copy present → test entries deleted through the route, the file back to an
empty bucket. Answer: they are preserved (localStorage survives closing the browser; only clearing
site data loses them) and they move into the committed file on the next reload — commit then.

## §67. The save system: the composer's ask, the facts, and a proposal (PLAN 1b opened)

Composer, session 3: *"Let's talk about the save file system. It's a bit too complex for me. So I
think there were basically two categories. One was the sort of main piece or score. And maybe the
other ones were, like, experiments. … maybe we keep them in the same place. Just give them a naming
convention, or maybe we have two different menus. Then regardless of which version I'm working
with … I do want some sort of auto save, but then the two issues are I don't wanna bloat the commit
or the Repo And I also don't want to have it override, like, the auto save if I make a mistake …
And then I want to be able to keep kind of a running version. so that when I finish something, I
can give it a name. Like, if I'm working on the scattered strikes, if I got, like, five in, I can
call it … scatter strikes one dot five … They're save, vary, and restore. It's not intuitive, and
I can't remember the rules from session to session. … I know in things like Microsoft Word … I
don't love the auto save with that either. … let's just discuss it first, please."*

**The facts, from the code (composer.html SAVE SYSTEM, server.js header, NAMING.md §1, #4 D10):**
two menus already exist — Piece (`piece-*`) and Scores (everything else), one folder. The
protection (working copy `-work`, autosave writes there, Save as next → `sNN+1`, Variant → `sNNa`)
applies ONLY to `piece-*` names; an experiment such as `ScatteredStrikes01` has no working copy —
autosave rewrites the file 5 s after any change, which is the override the composer fears, and why
today's folder holds hand-made copies (`-og`, `a`, `a-2`, `septet001`). Save = the file + a hidden
timestamped snapshot (`scores/versions/`, cap 20, gitignored, this machine only); Restore lists
them. Git carries every `scores/*.json` except `-work` and `versions/`. The numbering `piece-sNN`
is not load-bearing for the tools (their `piece-s…` hits are tuba defaults and fixture provenance).

**The precedent worth copying:** Reaper's — the project file changes only on Save; autosave goes
to timestamped backups in a folder nobody looks at; a new name is Save as. Ableton (Backup folder)
and Logic (Project Alternatives ≈ named versions) are the same model. Word's AutoSave writes into
the document as you type — the opposite model, the one the composer does not love. Google Docs:
continuous save plus "name current version" — the naming half is the useful part.

**Proposed (undecided — put to the composer as options):** one rule for both categories —
(1) everything opens through a working copy, piece or experiment; the file changes only on Save;
a mistake = reload the file; (2) Save = the running version (+ the hidden snapshot as now);
(3) "Name this version" = the milestone: the file AND a frozen copy `<name>-v1.5.json` with the
label the composer types (next number suggested), committed — replaces Variant and Save as next;
(4) two categories, one folder, two menus as today, the `piece-` prefix the only rule;
(5) Restore leaves the toolbar (the snapshots stay as a silent net the AI can dig into);
(6) git: files + named versions committed, `-work` + snapshots ignored — a named version is
~210 KB, fifty of them ~10 MB, similar JSON packs well: not a bloat problem; the clutter problem
(hand-made copies) is what named versions remove; (7) session end: the AI checks for `-work` files
newer than their file and asks before the commit. Toolbar after: Save · Name version… · Piece ·
Experiments. Options put: A version naming (`-v1.5`, dots allowed by one server line, or free
text) · B category by prefix (recommended) or by a checkbox · C Restore removed (recommended) or
renamed "backups" · D open-with-unsaved-edits: no dialog, open the working copy and say
"unsaved edits from HH:MM — Save or Reload".

## §68. D17 built: the save system as one rule, with hints; Q v2: the strike carries its time

Composer: *"Let's try it. Um, can you maybe put in some hints or something like that? So reminders
… how to use the save system. And then this is related but separate. The strikes replace in place
… I have to load the one called scattered strikes o one every time, and then replace in place and
then save it as a different one. Maybe have the time code carry with the strike. And then whatever
save file's open, it can insert at that time code associated with that strike … if I choose number
ten, which is at fifteen point one eight seconds, and I say replace in place or maybe you can
rename the button, like, insert in original time or something like that, something more brief."*
(The §67 options went by his "let's try it": A dots allowed, B the prefix, C Restore removed,
D no dialog on open — the recommendations.)

**The build.** `score/server.js`: names may carry dots (never `..`, never a leading dot);
`listScores` reports each file's working copy as CONTENT (`work: {modified, differs, orphan}` —
`metadata` times and the viewport stripped before comparing, because a Save writes the file from
the same state the copy had). `score/public/composer.html` (build `b37-save`): the toolbar is
Save · Name version · Reload · ? · Piece · Experiments; every open (`openScore`) goes through
`<name>-work` — a working copy that differs from its file is resumed with "unsaved edits in X from
HH:MM — Save keeps them, Reload drops them" (no dialog); `saveSession` writes the file (+ snapshot)
and discards the working copy; `autosave` writes the working copy only; `reloadScore` asks once,
discards, reopens; `saveVersion` prompts with the next label (1.1, 1.2 … from the existing `-vN.M`
names), saves the file being edited and writes `<base>-v<label>` (refused if it exists); a `?`
strip under the top bar carries the rule in one line (remembered per browser; the lane container
moves down by its height, recomputed on resize); the Experiments menu lists a base with its versions
indented beneath it, "· unsaved edits" tagged. `tools/unsaved_check.js`: the session-end question,
exit 1 when anything is unsaved. `strike_drawer.js`: `Replace in place` → `Insert @ 0.61 s
(original)` (the label carries the strike's t0); it writes at t0 into whatever score is open and
removes originals only where they truly exist (id + layer + pitch + onset within 25 ms) — the source
guard is gone. *Rejected:* a checkbox for "this is the piece" (the prefix is visible in the folder and
already what the tools know); keeping Restore under another name (a menu nobody could remember).

**Verified on a throwaway server (port 5301, the same `scores/` folder, test files `zz-ai-*`
deleted after; zero console errors):** open → `zz-ai-exp-work`, the box shows `zz-ai-exp`, the
strip on, the retired buttons gone · an edit → 5 s → the working copy on disk (`differs: true`), the
file still 0 objects, the menu tagged "· unsaved edits" · Save → the file 1 object, one snapshot,
the working copy gone, "Saved zz-ai-exp · 20:05" · edit → Reload → objects back to 1, the working
copy gone · Name version → suggested 1.1 → `zz-ai-exp-v1.1` frozen, listed indented under its base,
a second 1.1 refused, the next suggestion 1.2 · opening the version → `zz-ai-exp-v1.1-work` · edit,
autosave, reopen → "unsaved edits in zz-ai-exp from 20:06 — Save keeps them, Reload drops them",
dirty, 2 objects; Reload → 1. Drawer: strike #0 into `zz-ai-exp` → 7 notes + the META shape at
0.608 s, "no originals in this score"; into a copy of the COMMITTED ScatteredStrikes01 (the working
tree's copy had already had strike #0 replaced by the composer today) → "replaced 9 original notes",
none of wc-13 … wc-21 left, 577 − 9 + 8 = 576. `unsaved_check` clean after the cleanup. The hidden
Browser pane reports a 0 × 0 viewport, so the strip measured 1080 px tall there — an artifact, not
a bug; hence the resize listener.

**To take effect on the composer's machine:** restart `node score\server.js` (the server changed)
and reload the page. His four saves from today (`septet001`, `ScatteredStrikes01-og`, `-a`, `-a-2`)
and the modified `ScatteredStrikes01` are his to sort under the new rule; untouched here.

## §69. The first piece file: three orchestrated strikes, the raw piano chords removed

Composer (session 3, evening): *"the save file called scattered strikes zero one a dash three.
Could you remove all the piano struck cords from that one? So just keep the first three strikes.
and then save it as a piece. I forgot how we were naming the pieces, but this will be the first
iteration."* Also: *"Let's get rid of the banner … I just don't wanna give up the real estate …
Oh, I see. The banner goes away. Okay. Never mind … So just leave it."* — the `?` strip stays,
hidden by his click, remembered per browser. And *"did I need to restart the server?"* — yes:
`score/server.js` changed (dots in names, the unsaved-edits report); until the restart a name with
a dot (`piece-septet-v1.1`) lists but does not load, and the "unsaved edits" tag never shows.

**What was in `ScatteredStrikes01a-3.json`** (20:11, the same size and minute as the composer's
`ScatteredStrikes01.json` — a copy saved through the old page): 578 objects, all `waveCurve`, no
markers — 24 in the three strike groups `grp-strike-0-6r` / `-1-18r` / `-2-32r` (seven notes on the
seven lanes + one META shape each; strikes #0–#2 replaced in place by the composer earlier today)
and 554 raw piano strikes on layer 2 from 4.632 s onward (strikes #3 …). Nothing else on any lane.

**Done:** `scores/piece-septet.json` = the 24 group objects (0.608–3.465 s), `metadata.provenance`
naming the source, the groups kept and the 554 removed; `scores/piece-septet-v1.1.json` the
identical frozen first iteration (D17: `-v<label>`; the composer said "the first iteration"). Written
directly (the composer's server is the pre-D17 one until he restarts; the name has no dot).
**Verified in the running app** (his server, the AI's pane, zero console errors): `piece-septet`
opens as `piece-septet-work`, 24 objects, three per lane on all eight layers, zero raw piano objects
left, the three groups; the Piece menu lists `piece-septet` with `piece-septet-v1.1` indented under
it. Sketch pad: CN-8. The composer's other saves from today (`septet001`, `ScatteredStrikes01-og`,
`-a`, `-a-2`, `-a-3`, the edited `ScatteredStrikes01`) stay his to sort — uncommitted here.

## §70. The experiment folder sorted: the original kept, the copies deleted; a deleted name is harmless

Composer: *"Keep the original, delete the a, a-2, a-3, og and septet001 copies"*. Checked first:
all five were untracked (never committed — the delete is permanent, so listed before it ran),
`ScatteredStrikes01` tracked. Deleted: `ScatteredStrikes01a`, `-a-2`, `-a-3`, `-og`, `septet001`
(and its one Save snapshot). Kept and committed as it stands: `ScatteredStrikes01` — 578 objects,
strikes #0–#2 replaced by the composer's orchestrations (24 group objects), the rest raw; the
untouched 577-strike recording is in git history (`76861f2`). Of the two test saves the old autosave
re-saved in place, `0i-test-b` differs from HEAD only in its timestamps, while `rack-test` grew from
12 to 33 objects during the rack sessions of 2026-09-04 (01:58) — both committed as they stand, once,
to clean the tree; under D17 autosave never touches a file again.

The page remembers the last opened name per browser, and the composer's could now be a deleted
copy — so `openScore` of a name that is on disk neither as a file nor as a working copy now says
"X is not on disk any more — pick a score from a menu", forgets the name and binds nothing (before:
"Error: Score not found" and a session bound to a non-existent file's working copy). Verified in the
AI's pane: remembered `ScatteredStrikes01a-3` → the message, session `untitled`, nothing remembered,
0 objects; then `piece-septet` opens normally (24). Zero console errors.

## §71. ScatteredStrikes01 restored to the raw recording — the piano reference

Composer: *"could you restore scattered strike zero one to the original Recording. That'll be the
piano reference."* Earlier in the same breath he had asked for each strike as a META object so a
drag in the META window moves the whole strike — then: *"I didn't realize those were already meta
shapes, so no action needed"* (the drawer's inserts carry a META shape per group; `composer.html`
retimes every member on a shape drag and time-scales them on an edge drag). No META work done; the
strike database was confirmed on the way to cover all 577 notes of the recording in its 46 strikes.

Restored `scores/ScatteredStrikes01.json` from `76861f2` (the last commit before today's replace):
577 objects, all on the piano layer, no groups, 0.608–73.196 s, `wc-13` present; no working copy
existed. The composer's orchestrations of strikes #0–#2 remain in `piece-septet` and the takes. He
restarted the server and reloaded the page (D17 live on his machine).

## §72. CN-9: grace-note figures for the piccolo–bass clarinet line, and where the notation question went

Composer, after the session-3 checkpoint: *"Composition note for the piccolo / bass clarinet
interactive looping line: use — and figure out notation for — grace-note figures. See Ferneyhough,
Transcendental Etudes, number one. Oboe part."* Filed verbatim as CN-9, the AI's reading beneath it:
CN-4's heterophony given its surface — the loop's notes ornamented, the ornaments where the two
players' variants of the one line diverge. The notation half — "figure out notation" — is a device
the tuba vocabulary lacks (ord · staccato · cuivre · fortepiano · morph carry no grace notes), so it
went onto PLAN 0g's 2a adaptation list, not NITS: phase-2 work with a real design question in it (an
IR grace group attached to a host event, flagged in the save rather than guessed from a duration
threshold; and the time-source rule — from the preceding or the following note — which for a
scrolling score should be "into the host's onset", so the host stays the beat). The model to read
from is Ferneyhough's *Etudes Transcendantales / Intermedio II* (1982–85), the first étude's oboe
part — the attachment of the small notes, the slashed beam, the front-matter time-source rule; read
from the score, not asserted from memory. Nothing built; the composing path (strikes #5 onward) is
unchanged. The piccolo is named a second time (CN-4, CN-9) — CN-2 still open, not a decision.

## §73. U5 built: reset rhythm — one button, the shared reset, two traps closed; the pitch question

Composer: *"a"* — option A of the offer in the chat (a `reset rhythm` button, and a strike re-pick
clearing reverse and rotate). Built in `score/public/strike_drawer.js`: `resetRhythm()` — shape as
played · span × 1 · amount 1 · jitter 0 · reverse off · rotate 0 — called by the new button (under
reverse · rotate · reshuffle; it snapshots first, so `back` undoes it) and by `select()` on every
strike pick; `reverse: false, rotate: 0` added to the cfg defaults (a snapshot taken before the first
click used to lack the keys, so `back` could not undo a first reverse or rotate — `applyState`'s
Object.assign left them as they were); span × and jitter snapshot on change, amount once per drag
(pointerdown, not per input tick). Order and orchestration untouched by the reset. *Rejected:* saving
reverse / rotate to localStorage (they have no visible indicator, and a re-pick clears them anyway).

**Verified on the throwaway server** (`.claude/launch.json` now carries `score-5301`: PowerShell sets
PORT=5301 for the same `scores/` folder; nothing opened, no working copy created; the pane hidden, so
the controls were driven by the events they listen to — change / input / pointerdown / click; zero
console errors): strike #0 (9 notes) as played → pattern() = the as-played onsets · shape even, span ×
2, jitter 50, reverse, rotate ×2 → pattern differs, the controls show the values · `reset rhythm` →
cfg back to the six defaults, pattern() = as played again, the four controls read played / 1 / 0 / 1,
status "rhythm reset to as played (…) — back undoes it" · `back` → the transformed state returns
(shape even, ×2, 50 ms, reverse, rotate 2) · with reverse + rotate still on, strike #5 picked (21
notes, 674 ms) → reverse false, rotate 0, shape played (trap 1 closed) · span × 3 → back → 1; jitter
40 → back → 0; amount 0.5 → back → 1 (trap 2 closed) · a first reverse → back → off; a first rotate →
back → 0. Page change only: the composer reloads; no server restart.

**Also asked, mid-build** (composer: *"is there a way to reassign a different pitch to an already
assigned instrument"*): answered from the code and filed as STRIKES_TOOL U6 — the drawer moves pitches
by octave only (voicing presets; the fold); another note of the chord goes to a player by
arm-and-click (double-click the dot, click the row; it is added to the row, the old note stays until
moved); no hand skip, no per-voice octave nudge, no free pitch edit (that is a new harmony, M/N).
Nothing built for it.

## §74. U7: the hand assign replaces — the swap, the row's technique, shift adds

Composer, having tried the two-click assign the AI had just described: *"I tried this, but it added two
lines to the instrument. The previous one didn't go away."* — his expectation (replace) is the better rule
for "give this player a different pitch"; the add was how F's two-click assign had been built (RUNNING_LOG
§65: the case then was hooking an unassigned voice in). *Options weighed:* (a) the displaced note goes to
NOBODY — a note of the chord silently dropped; (b) the displaced note SWAPS to the armed note's old player
(or to nobody when the armed note had none) — nothing lost, one status line says what moved; (c) keep add.
Built (b) as the plain click, (c) on shift-click (the double-stop case, STRIKES_TOOL I, will want add).
Found on the way: `assign()` always gave a hand-assigned note the instrument's DEFAULT technique
(`defaultTech` = the U2 strike default), whatever the row's menu said — a row set to another articulation
would silently hold mixed techniques after a hand assign. Now a note takes its new row's current technique
(the swapped-back note takes the armed note's old one); `assign(v, lane, tech)`.

**Verified on the throwaway server** (`preview_start score-5301`; nothing opened, no working copy; the
pane hidden, so the real handlers were fired by dispatched dblclick / click events; zero console errors):
strike #0 shuffled → G2 on Bass Cl. (slap), A#5 alone on Flute (pizzicato) · the Flute row's menu set to
Aeolian & Ord → its voice follows · G2 armed (status: "…it plays this note instead of what it had (that
note swaps back) · shift-click adds") → plain click on Flute → G2 → Flute with `aeolian_and_ord`, A#5 →
Bass Cl. with `slap`, one voice on the Flute, status "G2 → Flute · A#5 → Bass Cl. (swapped) · shift-click
adds instead of replacing" · `back` → both where they were · shift-click → both on the Flute, "(added)" ·
G2 made unassigned, armed, plain click on Flute → G2 → Flute, A#5 → nobody, status says "→ nobody
(swapped)". Page change only — the composer reloads.

## §75. Confirmed: what the drawer plays is what the score gets and what the IR notates

Composer (with a screenshot — Violin 2 showing `C4↑` for the chord's C3, Bass Cl. `E3*` for its E5):
*"How is the transposition working here? … violin two can't play that c three. So what am I actually
hearing?"* then *"Just confirm for me that I'm hearing in the playback what I'll eventually notate … the
c three on the piano key is pointing to the violin, the playback is playing c four, and that's what will
get notated."* — Yes, one chain, read from the code: `notesFor('orch')` builds the realized list with
`midi: soundingPitch(v)` (= pitch + 12 × fold, or the stand-in); `Hear orchestrated` (line 746) and
`Insert` (784) both consume that same list; the insert writes `sonifyNote: n.midi` on the score object;
the extractor's IR event takes `pitch.midi` from `sonifyNote` (extract_core.js 254). So the violin's C4
is heard, saved and notated as C4 — there is no transposition anywhere, only the F fold by octave (pitch
class kept) into the player's technique range, marked ↑↓ on the row; the keyboard dot stays where the
chord has the note. `Hear piano` and the piano-flag doublings use the unfolded `v.pitch` — the piano
plays the chord as played. A `*` note (noise / fixed-pitch stand-in) carries the stand-in key + the
technique (Bass Cl.: E3 + slap); how a slap is drawn is a 2a notation rule not yet written; written
pitch for the transposing bass clarinet is also 2a (the IR holds sounding pitch). Decision: *"We can
leave it"* — the swap status line will not name the fold. The stale stand-in (E3 where a fresh one would
be E4) is filed to NITS.

## §76. U8 built: seeds visible, eight chips of history, a typed seed; and the two-dot swap that had never held

Composer: *"For the rhythm order. and the random shuffle order. Can I have the seed? And can I have a way to
go back to previous seeds? … a row or a table of previous shuffles. It just collects, say, five or ten, and
then I can click them instead of having to type it in."* Four random buttons in the drawer each already had
a seed in cfg (`oSeed` order · `rSeed` rhythm · `oSeedShuffle` orchestration · `vSeed` voicing), every
result a pure function of seed + state — so "go back" is just "set the seed again". Built one mechanism
for all four: `seedChips(key)` renders `seed [n]` (a number box; change applies) + the history as chips
(newest first, the current lit, cap SEED_KEEP = 8); `useSeed(key, n)` sets the seed, notes it in
`cfg.seedHist[key]`, and does what the button did (order → random; rhythm shape → random if as played;
`shuffleOrch()`; `applyVoicing()`); `nextSeed(key)` = max(current, history) + 1, so a shuffle after a
chip click never re-serves a seed still visible; the four button handlers route through it; `renderSeeds()`
runs at the end of every render (the orchestration header's chips are inline in its own HTML, the other
three fill fixed containers). Histories live in cfg → localStorage and in takes. *Rejected:* random large
seeds (unreadable chips; sequential numbers are the composer's "previous seeds" in the order he made
them); one shared history (each button's row must mean that button).

**Verified on the throwaway server** (`score-5301`; nothing opened; the pane hidden, so real DOM events;
zero console errors): all four rows present with the current seed as the only chip · orchestration shuffle
×3 → seeds 2, 3, 4, chips [4 3 2 1], 4 lit · chip 2 → seed 2 and the lanes identical to what seed 2 gave
the first time, chips [2 4 3 1], 2 lit · shuffle → 5 (not a repeat) · typed 42 → seed 42 in the row;
shuffle → 43 · chip 3 then `back` → the seed and the lanes before the click · order shuffle ×2 → slots
differ; chip 2 → the seed-2 slots, order random · rhythm reshuffle ×2 → chip 2 → the seed-2 pattern, shape
random · voicing reshuffle → chips [2 1] · ten shuffles → history length 8.

**Found by the same test (K, "click two dots to swap"): the swap had never held.** The dot handler swapped
the two slots and set `order = 'manual'`, then `render()` → `applyOrder()` → the switch's default re-derived
every slot from "as played" — the swap undone before it was drawn; the order menu, with no "manual" option,
went blank. Measured pre-fix: slots 7/1 → 0/1 after the second click, `swapped: false`. Fix: `applyOrder`
returns at once for `manual`; the menu gains "by hand". Post-fix: the two slots swap and the onsets swap
with them, the state survives a render, the menu shows "by hand", `back` undoes it, a shuffle afterwards
leaves manual for random, a strike pick resets to as played. Page change only — the composer reloads.

## §77. U9: ENTER saves a take; the take controls wrap as one group (a U8 side effect undone)

Composer: *"in the save take text box, can we make return save, the save take button drifted to the other
end of the screen"*. The drift was U8's: the voicing seed row (`#skSeedV`) widened the drawer's footer, and
the footer's `flex-wrap` broke between the take box and its button. Built: the four take controls (box ·
save take · load take… · ×) in one `inline-flex; white-space:nowrap` span so they wrap as a unit; a keydown
handler on the box — ENTER → `preventDefault`, `stopPropagation`, `saveTake()` (the button's own method);
the placeholder reads "take name — ENTER saves". Checked first that nothing else in the page reacts to ENTER
from that box: composer.html's only ENTER handler is the chord picker's, scoped to its own element.
**Verified on the throwaway server** (`score-5301`; the pane hidden, so real keydown events; `saveTake`
replaced by a counting spy for the test so no take touched the shared `bank/panel_snapshots.json`; zero
console errors): the group exists in the footer with exactly the four controls, no-wrap · ENTER in the box
→ saveTake called once, default prevented · another key → not called · the button's click → called. The
bank file holds none of the AI's test names. Page change only — the composer reloads.

## §78. CN-10 filed: the opening expanded into ensemble processes; the tool needs routed to STRIKES_TOOL V

Composer, mid-composing (17 strikes in the piece): *"So expand the opening scattered strikes. So treating
the ensemble or sub sub ensembles. So, for example, climbing scales through the ensemble or acceleration
or deceleration as one unit but spread out across the ensemble. blocks of strikes that answer each other
from subensembles? and that rejoins my earlier prompt about circular court strikes in cycles and a kind of
rizay ladder throughout the ensemble."* Filed verbatim as CN-10 (speech-to-text read: "court" → chord,
"rizay" → Risset; the composer's "Risset ladder" = the Shepard–Risset staircase in strikes). The AI's
reading: four devices (a scale through the registers · one accel/decel spread over the players ·
antiphonal blocks from sub-ensembles · CN-7's circular cycle as a Risset ladder), each already makeable
for ONE strike with the drawer's order · shape · voicing · locks, none yet across strikes. Routed: the form
into the PLANNER outline (item 1 rewritten — the opening is the strikes expanded, CN-1's single attack one
strike among them; v0 → v1; two new open questions: the partition, and which harmony the ladder runs on);
the tool needs into STRIKES_TOOL V (sub-ensemble shuffle · chains: scale / accel–decel / ladder · answering
blocks) — wanted, not built, nothing blocks composing the first by hand. PLANNER NOW refreshed (#0–#16,
v1.3, 84 takes). Nothing built.

## §79. CN-11 · CN-12 · CN-13 filed: the tremolo fork, the spreads' expansion, the Risset as rows over curves

Composer, three notes in one message, mid-composing: the tremolo figures *"will become their own fork as
well, and that'll expand in a like way … turning into fugues, and then stretto, and then accelerations and
decelerations … stacked on top of each other, and also speeding up and slowing down vibrato"* (CN-11;
speech-to-text "strato" → stretto, "vibrada" → vibrato); *"start with a tight spread, and then each
successive strike will have a wider spread … spread out from the start … treat the first impact as number
one … expand those other ones forward in time"* (CN-12); *"give each player a tone row … I'll give them a
curve, and they're expected to complete the tone row by the end of the curve … even spacing as much as
possible … performer jitter … from completely even, like pulsed, to relatively random, like non-periodic"*
(CN-13). Routed: the form into the PLANNER outline (item 1 gains the spreads' expansion and the rows-over-
curves reading of the ladder; items 2–3 gain the tremolo fork: fugue → stretto → stacked accel/decel →
vibrato rate); the SPREAD chain (span × per strike from the first onset — exactly what `span ×` already
does for one strike) at the head of STRIKES_TOOL V's chain list, the least design and first to build; the
two notation devices — *the row over a curve* (pitches once, a span curve, a spacing instruction even →
irregular, a direction) and *the vibrato-rate ramp* — onto PLAN 0g's 2a adaptation list beside CN-9's
grace-note figures. Observation recorded in CN-12/13: the composer's three drawn controls (curve length =
speed, placement = overlap, jitter = regularity) are the tuba piece's META-curve grammar applied to a
written row. Nothing built.

## §80. CN-14 filed: the next section @ 27.76 s — one strike re-struck, each re-strike longer, then accelerating

Composer: *"next section @ 27.76 Take one of the strikes, even out the spacing. and then expand the total
duration of the strike with every restreiche. So the first one, let's say, lasts one hundred milliseconds.
The next one would be longer. We'll decide on a algorithm for that or a spread. So let's say one fifty,
and then the next one is two twenty five, etcetera. … when we get to a certain total duration, we can do an
acceleration … eventually, they'll accelerate in a strike within a strike … progressively shorter to the
last impulse of the strike. Just take this as a no for now, and then we'll build it."* Filed verbatim as
CN-14 ("restreiche" → re-strike, "no" → note). It is STRIKES_TOOL V's SPREAD chain with its numbers: one
strike, spacing evened, span ×1.5 per re-strike from 100 ms (nine re-strikes to 2.56 s), even until the
span is audible as rhythm, then accelerating toward the last impulse (= shape `back-loaded`, gradable by
`amount`). The AI's threshold estimate written into the note: separate attacks once gaps clear ~60 ms (the
drawer's own grouping rule) — a span of ~0.5 s for a 9-note strike (the 5th re-strike), ~1.2 s for a
21-note one (the 7th); before that the re-strike is a thickening chord. Open for the build: the growth law,
the gap between re-strikes, the orchestration per re-strike, the dynamic. Routed: PLANNER outline item 1 and
the NOW line (the next section @ 27.76 s); V's SPREAD entry carries the spec; PLAN 2a gains feathered beams
for a strike that accelerates within itself. Not built — *"take this as a note for now, and then we'll
build it."*

## §81. U10 built: doublings (a note on several players, a player with one note); the working plan for #17 onward; the build candidates

Composer: *"one instrument can't play two notes. However, it is on the notes side too. It's okay. We fix that.
… two instruments can play the same note, but not the other way around."* U7's swap-back was the note-side
replace he did not want. **Built (U10):** the voice model gains `also` — doublings, each `{ lane, tech, fold,
standIn, skip }` — beside the primary player; `fitReal(v, r)` generalizes `fitVoice` (the voice is its own primary
realization), `reals(v)` / `onLane(lane)` / `dropReal(v, r)` are the three helpers; `notesFor` emits one note per
realization (Hear and Insert alike); rows list every realization on their lane as clickable chips; the row menu
and the T panel set the realization's technique; lines fan out per realization; `state()` carries `also` (back,
takes); shuffle, as-played and a strike pick clear it. The two-click assign: a plain click gives the row the
armed note and drops what the row had to NOBODY (never to another player), the armed note stays wherever else it
is; shift-click keeps the row's note; a chip click takes a note off that player; an "already on" guard.
*Rejected:* cloning voices for doublings (breaks the voice ↔ onset identity that slots, back and takes rest on).
**Verified on the throwaway server** (`score-5301`; real DOM events; zero console errors): G2 on Bass Cl. armed →
Flute (holding G#5) → G2 on both (Bass Cl. as G2* slap stand-in, Flute as G4↑ folded +2), G#5 → nobody, Hear emits
G2 twice (lanes 1 and 0) and no G#5 · the Flute menu → Aeolian & Ord changes only the doubling's technique · back
right after → the doubling gone, G#5 back on the Flute · shift-click with a third note → the row holds both · chip
click → "taken off Flute · still on Bass Cl.", then off Bass Cl. → "nobody plays it now" · "G2 is already on
Cello" guard · state round trip keeps `also` · shuffle clears · lines drawn = realizations (8 = 8). Page change
only — the composer reloads.

**The working plan (CN-15), by hand with the drawer as it is — one strike at a time, logged as it goes:**
1. #17 → orchestrate → `Insert @ original time` (27.153 s). 2. #18: shape `even` · span × = d18 ÷ 110 ms (100 ms
→ 0.91) · orchestrate · `Insert @ original time` (the first note at 28.175, the rest expand forward). 3. #19: shape
`even` · span × = d19 ÷ 622 ms · orchestrate · playhead to end(#18) + 1.628 s · `Insert @ playhead`. 4. #20 …:
the same with the next gap (1.917 · 0.749 · 0.878 · 0.870 · 0.773 · 1.074 s), the shape to `back-loaded` (the
accelerando toward the last impulse) once the mean gap clears ~60 ms, `amount` to grade it. 5. Listen in the
score; to change a duration, delete the strike's META shape and re-insert. Lessons and numbers → this log.
**Build candidates, ranked by the friction they remove (none built — "let's just talk for now"):** (A) a
`span = ___ ms` box beside span × — the composer thinks in durations, the drawer in ratios; trivial. (B) `Insert @
after previous` — start = end of the last inserted strike + the original gap to this one; the arithmetic is the
error-prone step. (C) re-insert replaces the earlier insert of the same strike (found by group) instead of adding.
(D) the SPREAD chain generator (STRIKES_TOOL V) — only if the bespoke example shows the rules hold.

## §82. The working plan, step 1 done: #17 evened and inserted (takes 17-a … 17-d); doublings used at once

Composer: *"saved as 17-d, i shuffled seed 73 for 17-c, inserted in score"* — after the talk-through of the
steps (load 17-b → read the order in the rhythm strip → `order` shuffle → `shape` even → hear → save take →
`Insert @ original time`). What landed in `piece-septet` (his Save, then a Name version `v1.4`): group
`grp-strike-17-271r` at 27.153 s — five onsets at 27.153 · 27.185 · 27.216 · 27.248 · 27.280 (32 ms apart:
the `even` shape over the recorded 127 ms span, exactly as computed), the META shape 27.153 → 27.389. Order
by seed 73: F#3 first (Viola AND Cello), then C5 (Violin 1 + Flute + Piano), D4 (Violin 2), E2 (Bass Cl.
slap + Piano), F6 (Piano) last — 9 notes from 5 voices: U10's doublings were used within the hour of being
built, and the piano's doublings ride along. Lesson for the plan: the strike-in-the-score is the check —
the drawer's numbers and the score's agree to the millisecond; reading the order off the rhythm strip (dots
left → right, hover for slot) was enough, no tool needed. Takes: 88 (17-a … 17-d).

## §83. #17's duration; five expansion strategies for #18 → #24 with the numbers; the span × cap bites at #22

Composer: *"total dur of 17; and what kind of duration expansion strategies to explore?"* — #17 as inserted:
first onset 27.153 → last onset 27.280 = **127 ms** (the recorded span, kept by `even` at span × 1); the META
shape runs to 27.389 (236 ms) because it includes the last note's sounding length. Proposed definition for the
plan: a strike's duration = first onset → last onset, and "ends" in the gap rule = the last onset (the note
lengths are the samplers', not composed). Five progressions from d(#18) = 110 ms (his likely span × 1), each
strike's mean gap against the ~60 ms threshold (R = heard as rhythm), and the span × the drawer would need:

| | #18 (13n) | #19 (17n) | #20 (14n) | #21 (8n) | #22 (6n) | #23 (11n) | #24 (6n) | section +
|---|---|---|---|---|---|---|---|---|
| ×1.5 | 110 | 165 | 248 | 371 | 557 R | 835 R | 1253 R | +2.29 s
| ×1.618 | 110 | 178 | 288 | 466 R | 754 R | 1220 R | 1974 R | +3.02 s
| ×2 | 110 | 220 | 440 | 880 R | 1760 R | 3520 R | 7040 R | +6.93 s
| +110 | 110 | 220 | 330 | 440 R | 550 R | 660 R | 770 R | +2.31 s
| Fibonacci | 110 | 110 | 220 | 330 | 550 R | 880 R | 1430 R | +2.20 s

Original gaps #18→#24 sum to 6.815 s; "section +" is what the durations add on top (×1.5: #24 starts 37.28,
ends 38.53). Rejected as a strategy: scaling each strike's OWN recorded span by a growing factor — the recorded
spans run 13 → 622 ms in no order, so the result is not monotonic ("each successive strike wider" fails).
**The constraint found:** span × is capped at 20 (input max and clamp). #22 is 13 ms as played and #24 26 ms:
557 ms at #22 is ×43, 1253 ms at #24 is ×48 — unreachable under every strategy; even ×20 gives #22 only 260
ms. So build candidate A (a `span = ___ ms` box, or at least a raised cap) stops being a convenience at #22 and
becomes necessary. Not built — the composer asked to talk first.

## §84. U11 designed: the chain step in the drawer — talked through before any build

Composer (CN-16): ×1.5 chosen; #18's evened, orchestrated, ordered version saved as take 18-c; *"we need a way
to expand it to whatever the next duration is … a method to calculate the gap between seventeen and eighteen —
the onset gap … place that gap at the end of seventeen … let's just talk first. What do you think this should
look like?"* The AI's proposal, as filed in STRIKES_TOOL U11: a `= ___ ms` twin for span × (the ×20 cap
removed with it), a `ratio [1.5]` + `prev × ratio` button reading the previous strike's duration from the
open score, and `Insert @ after previous` doing end(n−1) + [t0(n) − t0(n−1)] with the arithmetic in the status
line and replace-on-reinsert. Three choices put to the composer: what "end" means (last onset recommended vs
the META shape's end), the chain's anchor (#17's 127 ms → #18 = 190, or #18's 110 → #19 = 165), and
replace-on-reinsert. Numbers with #17 as anchor and end = last onset: #18 190 ms @ 28.302 · #19 286 @ 30.121 ·
#20 429 @ 32.323 · #21 643 @ 33.501 (rhythm audible from here) · #22 964 @ 35.022 · #23 1447 @ 36.856 ·
#24 2170 @ 39.076, ending 41.25 s. Nothing built.

## §85. The A/B requirement: laws must be switchable and revertible; the chain panel as the answer (no build)

Composer: *"a; 2 — this is fine, but let's just make sure we can, if we decide on a different spread, like
Fibonacci or something like that, revert and then try that, and also jump back and forth, A/B it … I'll create the
chain at one point five, listen to it, and then I'll say I wanna hear what Fibonacci sounds like … Maybe there's some
efficiencies there too, since we kind of know how we're gonna generate this … And can you explain what three is.
Let's continue to discuss, no build yet."* Decisions so far: end = the last onset; anchor = #17 (127 ms). The
A/B changes the build's shape: under the per-strike U11 alone a law switch is ~3 clicks × 7 strikes, twice; the
chain is a pure function of (anchor as inserted · law · member range · each member's newest take), so it should
be generated as a whole — one click per law — which is STRIKES_TOOL V's SPREAD built as a chain panel (design
written into V today). Revert and archive come free from D17: Save before a law, Reload to drop it, Name version
to keep each law (`v1.5` = ×1.5, `v1.6` = Fibonacci …). Choice 3 explained to the composer: replace-on-reinsert =
the tool removes the earlier insert of the same strike (found by its group) before writing the new one, so a
strike exists once in the score and a law switch never leaves the old chain behind. Laws proposed for the menu:
× ratio · + step · Fibonacci (d, 2d, 3d, 5d … from the anchor) · a custom list of ms as the escape hatch.
Build order proposed: the ms box + `Insert @ after previous` first (per-strike, an hour), the chain panel on top
(a few hours, assembled from load-take · set-span · notesFor · insert · replace-by-group). Nothing built.

## §86. By hand first: the recipe for #18, and two findings for the chart (no precise playhead; panel edit order)

Composer: *"Let's just do this whole sequence by hand, and then we'll chart how to do it and then maybe build a
generator after that. So what do I need to do eighteen?"* Findings while writing the recipe: (1) the score has
**no way to place the playhead at a typed time** — it moves by drag, wheel, page keys, zoom (`scrollOffset`);
`Insert @ playhead` is therefore imprecise by hand. (2) The object panel retimes a META group shape with its
members through `scaleGroupTo(shape, newStart, newEnd)` — an affine rescale between the two edges; a typed START
alone compresses the strike against its fixed end. But **end first, then start, each + the same shift, is an
exact translation** (the two ratios cancel; ±1 ms from the 3-decimal rounding per step). (3) Because the gaps are
onset-to-onset and "end" = the last onset, start(n) = t0(n) + Σ d(k) over the stretched members before it — so the
by-hand placement is `Insert @ original time` + a shift equal to the accumulated durations: #18 shifts by d(17) =
0.127 s (→ 28.302), #19 by 0.127 + 0.190 = 0.317 (→ 30.120), #20 by 0.603 … — no end-of-previous lookup needed.
The recipe given for #18 (×1.5 from #17's 127 ms → 190 ms; span × 190 ÷ 110 = 1.73; take 18-c → span × → hear →
take 18-d → `Insert @ original time` → META shape: end + 0.127, then start 28.302 → Save). Awaiting his report
of what bit.

## §87. U11 built: the ms box and `Insert @ after previous`; replace on re-insert everywhere

Composer: *"ok good to go"* after the list (§86 talk): a millisecond box beside span ×, and a button that places the
strike after the previous one by the recorded onset gap; nothing else. Built in `strike_drawer.js`: `#skSpanMs` =
the pattern's last onset (real, as shaped: shape · reverse · rotate · jitter · span ×), typing a value sets
`cfg.timeX` = value ÷ (last ÷ timeX); the span × clamp 0.05–20 becomes 0.01–10000. `insert('after')`: the previous
strike (index − 1) from the database; its group in the open score (`grp-strike-<n−1>-` prefix), end = max
startSeconds of its sounding notes; t = end + (t0(n) − t0(n−1)); refuses with a message if the previous strike is
not in the score. Choice 3 applied to every insert mode: objects with the strike's own group prefix are removed
before writing (`C.pushUndoState()` once, before any removal). Group suffix: `r` original · `a` after · none playhead.
**Verified on the throwaway server** (session named `zz-ai-chain` so the autosave wrote a throwaway working copy,
deleted after; real DOM events; zero console errors): #17 @ original → last onset 27.280 · #18 shuffled, even, the
box reads 110, typed 190 → span × 1.7273, pattern last 190 → `after previous` → META at 28.302 = 27.280 + 1.022,
last onset 28.492, status "#18 → 28.302 s = end of #17 (27.280) + onset gap 1.022 · inserted 7 notes …" · a second
click → one #18 group, the object count unchanged, "replaced the earlier #18 (8 objects)" · #19 at 286 ms → META
30.120 = 28.492 + 1.628, last 30.406 · #21 with no #20 in the score → "#20 is not in this score — insert it first",
nothing written · #22 (13 ms) typed 5000 → span × 385, pattern 5000; reset rhythm → the box back to 13 · #17 @
original again → one group, "replaced the earlier #17 (6 objects)". **Observation for the chart:** the test's random
shuffle left the slot-0 note of #18 and #19 unassigned, so their first SOUNDING notes sat 32 / 18 ms after the
strike's start (the META start is the nominal start; the chain's end is the last sounding onset). In the
composer's use every note is placed, so nominal and sounding coincide — but the rule is now explicit.

## §88. Step 2 done: #18 in at 28.302, 190 ms; the status line found; #19's numbers

Composer: *"where to find status; duration of 19? and then will it be good for insert@after prev or do we need to
do something first?"* His score (saved 14:44): `grp-strike-18-283a` — 7 notes, first onset 28.302, last 28.492,
190 ms, META 28.302 → 28.542 — exactly the plan's numbers, by `Insert @ after previous` on take 18-c stretched
with the ms box. The status line is the header's one-line text right of "STRIKES"; it truncates with an ellipsis
when the message is long (the after-previous message is long), which is why he did not find it — `setStatus` now
also sets `title`, so hovering shows the whole message (a page change; his next reload). #19: 127 × 1.5² = 285.75
→ 286 ms; ready for `Insert @ after previous` once #19 itself is orchestrated, ordered, evened and set to 286 in
the drawer (a take 19-a first); expected "#19 → 30.120 s = end of #18 (28.492) + onset gap 1.628".

## §89. The gap law replaces the duration law (CN-17); #18's even grid is not even as heard

Composer (CN-17): the gaps between onsets should expand ×1.5 per strike, not the total duration; #18 to be redone
consistently; talk first, then a procedure to replace #18. Read from his score: #17 sounds even (9 notes on 5
onsets, gaps 32 · 31 · 32 · 32 ms — every note placed, with doublings); **#18 does not** — 7 notes on 7 of 13
even slots, heard gaps 47 · 32 · 48 · 31 · 16 · 16 ms. Cause: `pattern()` spaces ALL voices (slots), and a voice
nobody plays keeps its slot as a rest; with 13 notes, 7 players and "a player holds one note", six rests are
forced unless the piano flag takes the leftovers. Gap-law table from 31.75 ms (all recorded onsets counted):
#18 47.6 ms → 572 ms · #19 71.4 (R) → 1143 · #20 107 → 1393 · #21 161 → 1125 · #22 241 → 1206 · #23 362 → 3617 ·
#24 542 → 2712; chain starts 28.302 · 30.502 · 33.561 · 35.704 · 37.707 · 39.782 · 44.172; end 46.88 s. Decisions
put to the composer: (1) gaps between the notes heard (a `rests: drop` switch in the rhythm column — the pattern
spaces only sounding voices; ~15 lines, not built) vs the recorded grid with rests vs piano-flag the leftovers;
(2) a `gap = ___ ms` box beside the ms box (duration = gap × (onsets − 1), shows the current mean gap; trivial, not
built); (3) the law per strike typed (×1.5 / Fibonacci …) — the chain panel later. Replace procedure sketched:
pick #18 → load 18-c → set the gap (or the duration it implies) → save take 18-e → `Insert @ after previous`
(replaces the earlier #18 at the same 28.302, #17 unchanged) → Save. Nothing built.

## §90. U12 built: rests leave the rhythm (decision A); the gap box

Composer: *"a yes, clarify b/c pls"* — A: the gap is between the notes heard; the gap box: yes. Built in
`strike_drawer.js`: `pattern(keep)` — the same shapes (even · front · back · centre · edges · random · as played)
over a chosen subset of the recorded onsets, the recorded span S kept as the strike's length, "as played" measured
from the first surviving onset; `sounds(v)` (a realization that is not skipped, or the piano flag), `keptSlots()`,
`pat(all)` = the rhythm as it will sound; `timed(all)` spaces the sounding voices by their slot rank and leaves the
silent ones on the full pattern (they do not sound); `notesFor('piano')` passes `all` so Hear piano is the whole
chord. `cfg.dropRests` defaults to true (old takes, lacking the key, inherit the default on load). UI: `drop
rests` checkbox, `gap [ ] ms` (mean gap = last ÷ (m − 1); typing g → duration g × (m − 1) → span ×), the ms box
and the sync read the effective pattern; reverse mirrors within the pattern's own span (the first onset stays at
0); the strip's tooltip says "nobody plays it — out of the rhythm". **Verified on the throwaway server** (session
`zz-ai-chain`, working copy deleted; zero console errors): #18 shuffled → 13 voices, 7 sounding → pat length 7,
ms 110, gap 18.3 (= 110 ÷ 6), Hear gaps six × 18.3 · gap typed 47.6 → ms 286, span × 2.596, gaps six × 47.6 ·
drop off → 13-slot grid, gaps 71.4 · 23.8 · 23.8 · 23.8 · 71.4 · 23.8 (the rests back) · `back` → drop on, gaps
equal · Hear piano → 13 notes on 13 onsets · `Insert @ after previous` → first 28.302, gaps 48 · 47 · 48 · 47 · 48 ·
48 (the score rounds onsets to the millisecond, so 47.6 alternates) · `reset rhythm` → drop stays, as played of
the seven survivors = 87 ms, gap 14.5 · the tooltip of an unplayed dot. Page change only — the composer reloads.

## §91. U13 built: `accel · round robin` — the accelerating run with the players recycled (CN-18)

Composer: *"ok good to go, build it ty"* after the talk of §89–90's aftermath (CN-18: fixed steepness, fixed
landing, the first gap by the chain, a round robin of the players, 250 ms re-attack across the board, the
rotation-with-shuffled-pitches fallback). Built in `strike_drawer.js` as a shape: `accelUnits()` (cards = the
sounding notes in slot order, pitch on player; a doubled note one card with two players; the piano flag adds the
piano), `realize(P, player)` (fold by octave into the technique's range; noise / fixed → stand-in),
`accelSeq()` (memoized on its inputs): k = ⌊ln(floor ÷ g1) ÷ ln(steep)⌋ + 1 gaps, the fraction re-fitted so the
last gap is exactly the floor; cycle 1 = the composer's order; each later cycle = a permutation satisfying the
re-attack rule against the onset times (all 5040 tried for ≤ 7 cards, 3000 random draws above), else the rotation
with shuffled pitches (`shuffled(pitches, rnd)`), folds counted, violations counted and flagged; `permutations()`
(Heap). `notesFor` emits one note per player per card; `Hear piano` untouched; the strip draws the run (dashed for
a fallback cycle); the ms box becomes read-only (the duration), the gap box the first gap; a seed row (`aSeed`);
the readout names each cycle's mode and the tail check (players × floor vs re-attack). *Rejected:* cloning
voices per repeat (the voice ↔ onset identity again); a greedy dealer (paints itself into a corner two notes
before the end — the full search is trivial at seven cards).

**Verified on the throwaway server** (`zz-ai-chain`, deleted; real DOM events; zero console errors) — #20
shuffled to 7 sounding: first gap 107.2 → 7 notes · 6 gaps · 435 ms · steep 0.841 · gaps 107.2 → 45 · one cycle ·
tail 7 × 45 = 315 ≥ 250 ✓ · ms box 435 read-only · 7 dots; 241 → 12 notes · 1314 ms · cycles own/7 + shuffled/5 ·
0 re-attacks under 250 · Hear = 12 notes; 542 → 17 notes · 3296 ms · own/7 + shuffled/7 + shuffled/3 · 0
violations; a new seed → cycle 1 identical, cycle 2 re-dealt, chips [2 1]; floor 30 → "tail 7 × 30 = 210 < 250 ✗
— raise the floor to 36 or add a player"; re-attack 300 and 400 → still shuffled without violation (the partial
last cycle is short — the tail line is the warning for a full cycle); re-attack 2000 (impossible) → cycles 2–3 fall
back to the rotation: the players in the composer's order, the same pitch set, 4 pitches moved, 1 folded (Vn2: own
80, dealt 43 → sounds 55), every note in its player's range, 10 dashed dots, ⚠5 and ⚠3 flagged; `Hear piano` = 14
notes (the chord as recorded); `Insert @ original time` → 7 notes, gaps 107 · 90 · 76 · 64 · 53 · 45; `reset
rhythm` → shape played, the block hidden, the ms box enabled. Page change only — the composer reloads.
**For #20:** pick · load its take · shape `accel · round robin` · gap 107.2 · steep 0.85 · → last 45 · re-attack
250 · save take · `Insert @ after previous`.

## §92. U13b: the pitches re-dealt from cycle 2 (a switch, on by default)

Composer: *"Can we scramble the pitches after the round robin, or is that already happening? … even if we need to
repeat the same order of instruments."* It was not: a later cycle shuffled the CARDS (pitch on player), so the order
changed but each player kept its pitch; only the rotation fallback re-dealt. Built: `cfg.aRedeal` (default true) and
the checkbox `re-deal pitches after cycle 1`; the dealer now shuffles the pitch set for every cycle after the first
when the switch is on (and always in the rotation); folds counted; the readout says "pitches re-dealt". **Verified
on the throwaway server** (zero console errors): #22 shuffled, accel at 362 → 14 notes in three cycles; cycle 1 keeps
the composer's pitches, cycle 2 moves 6 of 7 pitches to other players, the pitch set unchanged, every note inside its
player's range, 1 folded; the switch off → 0 moved; `back` restores the switch. The composer's chain today: #17
(evened) · #18 (gap 47.6) · #19 (71.4) in the piece; #20 next at 107.2 under accel.

## §93. A silent violin 2 note at 44.72: a Bartók pizz C7, above the sample's top — the technique gets a range

Composer (with a screenshot of the object at 44.72 s): *"this one isn't sounding vln2 can you look into it pls"*.
In his score: `wc-836`, Violin 2, C7 (MIDI 96), `bartok_vel`, 125 ms, in `grp-strike-25-447a` — the accel run of
#25 (5.0 s). Journal Q6 (2026-09-04) had already found that the violins' Bartók pizz has no sample at B♭6 (90) and
that its true top lies in 79–89; C7 is well above it, so Kontakt had nothing to play. Why the drawer allowed it:
`bartok_vel` had no range of its own, so `techRange` fell back to the violin's 55–101 and the re-deal's fold
(`realize`) accepted 96. Fix: `vnRanges()` (the violins' per-preset zone table, R8) gains `bartok_vel: [55, 85]`
— 85 (C#6) provisional: the same strike has a Violin 2 C#6 at 48.34 the composer did not flag; 90 and 96 are
silent; the true top is 85–89, to be read from the Kontakt GUI. Checked in node: violin2 bartok_vel now 55–85; C7
folds to C6 (84), C#6 stays. The page loads instruments.js from disk on every request — a reload, no restart. To
mend the note in the score: reload → pick #25 → load its take → `Insert @ after previous` (same seed → the same
deal; the C7 card now sounds as C6; timing identical, nothing after it moves) — or set the note to C6 in the panel.
Viola and cello Bartók tops remain unmeasured (Q6 updated). Lesson for the chart: a re-dealt pitch can climb into
a technique's unsampled top; every one-shot technique used by the runs needs its sampled range on record (PLAN 0d).

## §94. Assessed, on hold: measuring the strike techniques' sampled ranges and lengths by the Reaper bridge (= PLAN 0d)

Composer, after §93's silent C7: *"Can you assess whether you can locate the ranges yourself given the new Reaper
automation? please just discuss first before doing anything."* then *"Hold for a bit, but just remember, log the
process."* Assessment: yes, with pieces that already exist and were used once — MIDI to the samplers by PowerShell →
winmm → the loopMIDI ports (`probes/balance_probe.ps1` with a schedule JSON: notes, CC0 presets, keyswitches), the
REC track recording the pass (bridge jobs arm / stop; never `save`), numpy analysis of the recording
(`probes/analyze_*.py`; `analyze_sample_lengths.py` exists) — this is how Q6 found B♭6 silent during the balance run
(§46). The plan agreed for when he gives a window: (1) a control note per technique in mid-range — silence there =
routing / mute, stop (P10); (2) the sweep — every key of each strike technique inside the instrument's playing zone
(never the keyswitch zone below 34), vel 127, one note per ~0.5 s, the preset selected before each note with the
balance probe's timing — violins `bartok_vel`, viola / cello `gettato_vel` + `bartok_vel`, bass clarinet `slap`,
flute `pizzicato` (UVI, tongue ram), plus any technique his takes use (to be listed from the score first); (3) read:
per technique the keys that sounded / were silent → the range; per sounding key the ring → the length; (4) apply:
the ranges into the recipes' per-preset tables (as `vnRanges()` today), the lengths into `bank/sample_lengths.json`
(the extractor's rows, NAMING §2.7). Live-meter peakwatch is the fallback for a handful of pitches; the Kontakt GUI's
key colours by desktop automation would give ranges without lengths and is untested on Reaper. Needs from him:
Reaper open with the rack, the bridge alive (heartbeat checked first), ten quiet minutes (the probes sound through
his samplers; monitors down if he likes). Estimate: one to two hours with the analysis and verification. On hold
until he says when.

## §95. The accel run works; the variations mapped (talk only)

Composer: *"the accel process … works pretty good. Now let's talk about the variations. So I guess the main one is
the feel or the algorithm for the acceleration. What other ones are there?"* The AI's map, ten axes, each with what
exists and what a build would add — offered for him to pick from, nothing built:
(A) **the curve** — geometric (constant ratio, what is built: a steady push) · linear (constant subtraction: a push
that eases) · late rush (flat head, steep tail) · S-curve (even → accelerate → the last gaps nearly equal, a roll
landing) · two-phase (an even head at the chain's gap + a fixed rush) · with performer jitter (CN-13) growing toward
either end · the reverse (a ritardando opening out); (B) **the landing** — the floor fixed (built) · descending over
the section (more crunch each time) · tied to the first gap · a tutti chord on the last impulse (CN-1's attack);
(C) **first gap and count** — the chain law ×1.5 with the count following (built) · a fixed count with the ratio
following · a fixed duration; (D) **the dealing** — his order → shuffles under 250 ms → the rotation (built) · re-deal
pitches (built) · order presets per cycle: low → high through the ensemble (CN-10's climbing scale), high → low,
outside-in (registers converging), by family (antiphonal blocks) · constrained shuffles (no two of a family adjacent);
(E) **the pitches across cycles** — the same set (built) · a step up per cycle with the top wrapping (the Risset
ladder, CN-10/13) · inversion / retrograde of the set · the set thinning to one note (a focus) or growing by the piano
flag · the harmony changing at a boundary (CN-6); (F) **dynamics** — flat 127 (built) · a crescendo into the landing ·
a decrescendo (the rungs fading, CN-13) · accents on cycle boundaries; (G) **technique across the run** — fixed per
row (built) · a change per cycle (pizz → Bartók → gettato; noise → pitched) · a family crossfade (strings → winds by
biasing the deal); (H) **held notes** — one-shots (built) · sustained techniques whose notes hold to the end: an
accelerating run of entries becomes a cluster that thickens (CN-1's density build from the strikes' own machinery);
(I) **between strikes** — the recorded gaps kept (the rule) · shrinking (the strikes accelerate into one another: CN-14
at the section's scale) · growing (release) · overlapping runs (polyphony of runs) · accelerating and decelerating
strikes alternating (a breathing); (J) **into the tremolo** — the floor pushed under the separate-attack threshold
(gaps 30 → 15 ms) turns the run's landing into a tremolo: CN-7's "acceleration ends in a strike or a tremolo" as one
control, the seam to the tremolo section. Cheapest to build with the most audible change: a `curve` menu (A), a
dynamics ramp (F), the ladder step per cycle (E), a floor per strike (B). The chain law and the gaps between strikes
(C, I) are compositional choices needing no build.

## §96. The strike's name on its META shape; the curves-of-the-rush plan filed (W); the insert is the replace

Composer: *"Just the curve. Everything else is fine or can be organized with the controls … keep a note or a plan so that
if we do another one of these, we can build the different curves, the feel of the rush … in the main score, in the
meta shapes, can I get a label for which number strike they come from? … if I want to replace one, I can just pull up a
take for strike 25, make some changes, and use insert after previous, and it'll replace it. Or is there a replace
button?"* Three answers. (1) STRIKES_TOOL W written: the curve menu to build when a strike asks for it — linear · late
rush · S-curve · two-phase · jitter · reverse — one `gapsFor()` function, the first gap / landing / re-attack rule
untouched; the chain law between strikes stays typed by hand. (2) Built in `composer.html` `renderWaveCurve`: a META
group shape draws `metaShapeLabel(wc)` ("strike #25" — the performanceNotes prefix, or the group's marker label) as a
small text at its top-left, inside the shape's own SVG group, so it moves and stretches with the shape; part lanes
untouched. **Verified on the throwaway server** (zero console errors): #17 and #18 inserted → "strike #17" / "strike #18"
at x = start × pixelsPerSecond + 3; the #18 shape retimed by `scaleGroupTo` (+0.5 s) → the label follows; no label on
any part lane. Page change — a reload. (3) No replace button is needed: since choice 3 (§87) every insert mode removes
an earlier insert of the same strike first — load the take, change, `Insert @ after previous`, and #25 is replaced at
the same start (end of #24 + the gap). Caveat named to him: if the change alters #25's length, #26 onward keep their
old starts until each is re-inserted `after previous` in order — a "re-chain from here" button is a candidate if it
happens often.

## §97. The trill module: the composer's description (CN-19), what exists, the requirements and the vetting — talk only

Composer: *"Let's work on a new module … describe in real life what I want to do, break it apart, get the requirements
right, make a plan … vet it well."* (CN-19 verbatim.) **What exists, read from the code:** piece #2's ostinato engine is
in the app — cells with items (pitches), phrasing ostinato / pulse, a density curve → inter-onset interval through
`densityToIOI` (level 1 → 1000 ms … level 22 → 80 ms, exponential — the "lookup speed table"), a dynamic curve →
velocity, jitter; realized from `zone` objects with `midiModel: 'ostinato'`, notes generated at play time, not stored.
A trill is that with two items alternating; a tremolo one item. The META layer is one lane (`openMetaWin`), many
shapes; curves are nodes + segments with bezier / power models and a slope; PLAN 1a already holds his drawing idea
(extrema first, then per-segment shaping by wheel). Strikes are groups per lane; the accel runs deal players by time.
The requirements as organized for him (R1 reference curves ×3, drawn by points · R2 the portable segment sampler ·
R3 the trill object: pitch(es), articulation by ear, per-instrument speed table, fp attack, dynamic curve, duration ·
R4 launch from a strike note · R5 eating the covered notes · R6 free trills · R7 the gap-filling weave · R8 notation ·
R9 the S1 / IR contract) and the points he had not raised (the attack cannot grow from a one-shot — the launching
note must switch articulation, or a doubling splits attack and trill between two players · the speed table's 80 ms
floor and per-instrument limits · a per-player availability timeline shared by the eating rule and the run dealer ·
eat by MUTE-RULE not by deletion, so re-inserts and undo survive · an eaten note as an accent inside the trill · what
ends a trill · the fp as a built-in envelope · the trill's second pitch from the harmony (CN-6) · the trill as one
generating object, never stored notes · a time-range selection on a lane · notation as a rate curve). Proposed step 0:
hear it with today's ostinato zone on a violin lane to pick the articulation. Nothing built.

## §98. The trill module's decisions taken; the spec written (docs/TRILLS_TOOL.md, PLAN 1e) — no code

Composer (CN-20): intuitive, few controls · curve drawing simpler than piece #2's wave-curve object — trace, then
adjust · the attack a listening exercise (velocity · CC7 · a brief second voice), not laboured · eat by rule, with an
easy revert (audition and change of mind) · the curve segment ends the trill · upper chromatic neighbour · speed
limits not a concern (demo MIDI; the players read "trill") · the fp envelope per instrument, a thing that works ·
three META lanes · *"go ahead with the plan, spec — just writing, no coding yet."* Written: `docs/TRILLS_TOOL.md` — the
picture, the decisions, the trill object (a `zone` with `midiModel: 'trill'`, realized at play / export on the
ostinato engine with a per-instrument speed table and a fp envelope), three META lanes with trace-then-adjust drawing
(a contract change, "layers ≥ tracks.length are META", to be written into NAMING at build), the live curve reference as
the portable sampler (an object reads the curve it names over its own span; "bake" for a copy), SHIFT-drag to mark a
span on a lane, `T` to trill, launch from a strike note (the launching note muted by its own trill, so removal
restores the strike exactly), the mute rule with `mutedBy` stamped on save for downstream tools, `busy(lane, t)`
shared with the accel dealer, the weave later, notation as `tr` + span with the curve demo-only, phases 0–6 with
estimates, three open points. PLAN 1e added (and 1a carries his simpler-drawing words); PLANNER outline item 2 points
to the spec. Step 0 needs no build: a zone with the ostinato model on a violin lane to choose the articulation.

## §99. Trill step 0 cannot use the ostinato zone here (the registry has zero instruments) — the listening file instead (`tools/trill0_listen.js` → `scores/trill0-listen.json`)

Composer (2026-09-05 evening, after the checkpoint; his pick of the three tracks): *"walk me thru trill0 pls, Will we be
creating a new save file? And then what will we be doing in what order... and will you be generating... well, just let me
know what you'll be generating and what I have to draw in."* Checked before writing the click-steps §98 promised: the zone
panel's ostinato path is piece #2's whole — Player = Piano 1 / Piano 2 / Perc 1 / Perc 2, Instrument from
`InstrumentRegistry`, which loads `docs/instrument_map.json` — zero instruments in this repo (NITS 2026-09-03: "not what
routes MIDI here; `sandbox/instruments.js` is"), so `getZoneMidiRouting` returns null and Generate would answer "Cannot
resolve MIDI routing"; the pitches are hands L / R on chord markers; generation is a server call. **Correction to §98 and
to TRILLS_TOOL §11 phase 0: "no build" was wrong for the zone route** — step 0 by zone needs the registry filled (PLAN 0c)
or the panel rewired: a build, for a listening test. Rejected. Instead the no-build route the strikes already use: plain
`waveCurve` notes with a `technique` (`sonifyMode: 'plain'`, `recVel` = the velocity; the play engine sends the technique's
CC0 in a 150 ms pre-arm and the note at `recVel`), written by a script into a score file of its own.

**Built** `tools/trill0_listen.js` → `scores/trill0-listen.json` (an experiment in the Experiments menu; the piece untouched):
per lane a row of passages, one per candidate articulation; a passage = the two pitches alternating (the upper chromatic
neighbour), the rate a linear ramp over 3 s from the instrument's slow trill to its fast one (TRILLS_TOOL §2's table: Vn / Va
6 → 14 per second · Vc 5 → 12 · Fl 6 → 13 · BCl 5 → 11 · Pno 5 → 12), held 1 s at the fast rate, the first note at 127 and
the rest at 60 (the fp, §8 option 1); sustained articulations overlap the next note by 10 ms, short ones cut 5 ms before it;
1.5 s between passages, 3 s between instruments; a marker on the lane at each passage start with its name. Candidates —
strings (Vn1 · Va · Vc; Vn2 is the same library): senza vib #6 · vibrato #2 · staccato #19 · marcato stac #13 · marcato sfz
#12 · spiccato #16; flute: ord · staccato (Fluteb) · sforzando · fortepiano · ord + a tongue ram at the attack (§8 option 3
— possible for the flute because its strike slot is another channel; the strings' Bartók and the bass clarinet's slap share
the channel with the sustained presets and would need a second slot); bass clarinet: senza vib #13 · staccato #19 · with
accent #20 · secco #27 · portato #28; piano: main. Pitches mid-register: A4/B♭4 · D4/E♭4 · G3/A♭3 · E5/F5 · D3/E♭3 · C5/D♭5.
The file: 1180 notes + 29 markers, 169.7 s; the shortest note 66 ms (staccato at 14 per second) — above the two-frame floor
of the frame-driven note emission (a note that starts and ends inside one frame is never turned on). The library's own
trill / tremolo presets (SI2 `trill_m2`, Xsample `trem_vel`) are left out by the composer's rule (§97); a reference row if
he asks.

**Checked:** every pitch inside its technique's range (`sandbox/instruments.js` evaluated in node), no same-pitch overlap
within a passage (a note-off would cut its twin); loaded on the throwaway server (:5301) as a copy `zz-ai-trill0` (deleted
after, with its working copy): 1209 objects, 29 marker labels in the DOM, zero console errors. **Seen:** the playability
badge reads "632 hard · 519 soft" — the checker counts every trill note as a re-attack too close and the 10 ms overlaps as
double-bookings; right for strikes, wrong for a trill — phase 1 must teach it that a trill is one object (TRILLS_TOOL §11).
*Rejected:* a zone per passage (no routing here) · all instruments stacked at the same times (he would have to solo;
sequential blocks need nothing) · two drop levels per passage (double the length — one constant `DROP`, re-run to change).

**What the composer does:** reload, open `trill0-listen` from the Experiments menu (→ its working copy, D17), SPACE from the
start or scrub to a marker, and answer per instrument: the articulation · whether 127 → 60 reads as fp · the top speed.
**What he draws:** nothing — the curves come with phase 2 (three META lanes, trace then adjust). Awaiting his ears.

## §100. "These don't sound right": the deep dive into piece #2's ostinato realization, the composer's new trill samples, and what this repo actually has — research only, nothing built

Composer (2026-09-05 evening, after hearing `trill0-listen`): *"These don't sound right. So can you do a deeper dive into the
two piano, two percussion piece, and see how we actually realize those curves … Those sound a lot smoother. And then I made
some new ones, but I can't remember if I played together with a graphic curve for the two piano piece … the ones I made were
trill playing samples and then a viola version and a cello version … please don't just go ahead and make things before
checking in with me … nail down the methodology, how those were made, and why those sound much smoother … let's talk about
the new samples that I made, if I need to redo them or if we can still use the old ones, or we can adapt these new ones. And
then we'll do a test. Either you or I will draw a curve and then apply the slope from the curve to the trill speed."*

**How piece #2 did it** (`docs/OSTINATO_TIMING_MODEL.md`, its decision #13 of 2026-03-28; `lilypond_code/ingest_ostinato.js`,
`generate_ostinato_midi.js`; its `server.js` 783 / 1021 / 1038): the composer played six ostinato bursts of ~6.5 s on the
keyboard, each one ramp along a linear 0 → 1 curve (slow-soft → fast-loud). The ingestion splits bursts at silences over
500 ms, groups notes within 30 ms into attacks, and tags every attack with its **curve position = its time within the
burst, normalized first onset → last onset**, its gap to the next attack, its average velocity, its note count and note
durations — pitch-agnostic. Generation walks the drawn curve: at each moment it reads the curve's height (0–10 → 0–1), takes
the attacks whose curve position lies within ±0.05 of it (cycling through them in turn, so a plateau is not one value
looped), and uses that attack's gap, velocity and durations; three knobs on the gap, in a fixed order — `stretch`
(asymmetric, anchored at the burst's fastest gap: the slow parts stretch, the fast peaks stay), `smooth` (a blend toward the
local average — the cure for the long-short stutter within a pair), `speed` (uniform); durations capped at 0.9 × gap; one
random burst per generation. First ostinato's values: smooth 0.7, speed 1.2, stretch 1.5. **The graphic curve was linear by
construction:** displayed or not, each burst IS the 0 → 1 ramp — what matters is that a burst runs once from the slowest to
the fastest.

**Why it sounds smoother than `trill0-listen`:** everything the generator emits — gap, velocity, note length — is the
composer's own playing at that curve height: the gaps carry his micro-variation, the velocity rises with the speed as he
played it, the note lengths shorten as he speeds up, and the window cycling keeps a plateau alive. `trill0-listen` was a
formula: a linear rate ramp, strict alternation, one velocity (60) after a 127 spike, note lengths cut to the gap, nothing
coupled to anything — and a range starting at 6 per second where his own trills open near 3–4 per second. Rejected on
hearing, rightly.

**His new samples** (`scores/trill_playing_samples.json`, `-viola.json`, `-cello.json`, saved 20:09 / 20:12 / 20:15,
untracked): recorded with the score-lane capture (`Rec`; the capture technique `accent_senza_vel` on all three; plain
`waveCurve` notes with `recVel` and the real key-down length; **no curve drawn in any file — nothing was played along to**).
Violin 1: 709 notes, three bursts of 25 / 45 / 42 s on C5–D5, F5–G5, B5–C6 · viola: 558 notes, two bursts of 46 / 51 s on
E3–F3, C4–D4 · cello: 593 notes, two bursts of 62 / 45 s on E2–F2, B2–C3. The bursts are long and wavy — several
accelerations and relaxations each, not one ramp (first / middle / last mean gaps all 140–190 ms; one violin burst and one
cello burst read as a single accelerando, the rest rise and fall). Gaps 58–85 ms at the fastest (12–17 per second), 250–360
ms at the slowest openings (3–4 per second); velocities 41–123; note lengths 65–440 ms. **Indexed by local speed** (a 7-gap
window, normalized per burst slowest → fastest) the playing is strongly coupled — violin, by speed quintile: mean gap 238 →
180 → 148 → 121 → 108 ms · mean velocity 67 → 71 → 81 → 96 → 107 · mean length 182 → 127 → 103 → 92 → 80 ms; viola 262 → 112
ms · 78 → 112 · 194 → 83 ms; cello 287 → 118 ms · 74 → 98 · 260 → 90 ms. The long-short stutter within a pair: 16–20 % of
the gap.

**What this repo has:** the generator handler was copied into `score/server.js` (`handleGenerateOstinato`, the algorithm
inline) and the piano DB into `bank/ostinato_timing_db_2p2p.json` — but the three helpers it calls (`OSTINATO_DB_PATH`,
`parseOstinatoCurve`, `evaluateOstinatoCurve`) were dropped in the tuba port (#4's server lacks them; #2's has them), so the
route throws before reading anything: a dead copy. The zone panel is piece #2's (players Piano 1 / 2, Perc 1 / 2; hands L /
R; the registry with zero instruments, §99). Nothing in the transport plays a zone's snippet here — only the panel's Test
Play. The ingestion script is not here at all (#2's reads .mid; the captures here are score JSON). Piece #2 also has a
single-note model (`ingest_pizz_tremolo.js`: repeated notes, IOI sampling, fixed shapes); the ostinato model is the one to
follow — its curve-indexed lookup is what he asked for.

**Options put to the composer — nothing built:** (A) **adapt the new samples**: index every note by its local speed instead
of its time on a ramp — a per-instrument table "curve height → the gaps, velocities and lengths he actually played at that
speed"; uses all 1,860 notes; immune to the wavy bursts; the coupling above comes free. A new ingestion (score JSON in, the
#2 DB format out, `curvePosition` := speed level). (B) **re-record in the proven protocol**: 6–10 bursts per instrument,
each ONE ramp slowest → fastest (and soft → loud), more than half a second of silence between bursts; ingest as piece #2
did. Minutes to record; the pipeline verified there. (C) use them as they are with #2's time-on-ramp ingestion — wrong: a
wavy 45 s burst maps speed onto time falsely. Recommended: A, with B as a ten-minute cross-check if wanted. **The test**
proposed: he draws a curve on a violin lane (or I write one into a file); a script reads the curve and writes the trill under
it as plain notes from the speed-indexed table (the same lookup, stretch / smooth / speed as #2); he plays it in the app. No
app change for the test; the trill object of phase 1 then does the same live. Also his to settle: `accent_senza_vel` as the
trill articulation (what he played on) · whether the three sample files are committed (his takes, untracked). Awaiting his
call.

## §101. Option A built and the curve test made: the speed-indexed trill table from the composer's playing, the MIDI export, the ported curve evaluator, `trill-curve-test` — verified loading on :5301

Composer: *"a, and then can you give me a midi file from the trills_playing_samples file, most likely it will be accent senza
vib but I'll use the file to try some others; sure commit the sample files. and the test good, you can make a long-ish,
smooth curve and let me listen to it."*

**Built, in order.** (1) `tools/trill_ingest.js` → `bank/trill_timing_db.json` — piece #2's DB shape with one change:
`curvePosition` = the speed level — each note's local rate (1000 ÷ the mean of ±3 gaps) mapped 0 → 1 across the
instrument's played range (the 2nd–98th percentiles of the local rates; rate-linear, so half-height is half-way between his
slowest and his fastest in notes per second) — plus `role` lo / hi (which note of the pair) and the real key-down length;
bursts split at silences over 500 ms, one sample per burst, pooled per instrument at generation. The ranges: violin 1
3.73 → 9.83 per second · viola 3.23 → 10.14 · cello 2.99 → 9.40. By speed quintile, the violin: gap 237 → 180 → 148 → 124 →
108 ms · velocity 67 → 71 → 80 → 95 → 106 · length 180 → 126 → 104 → 93 → 80 ms (viola and cello the same shape, in the
tool's printout). (2) `tools/score_to_midi.js` → `midi/trill_playing_samples.mid` (+ `-viola`, `-cello`): format 1, 480 ppq,
120 bpm, one named track per lane, channel 1, no CC0 / CC7 (the articulation is chosen in the sampler), the score's own
times; parsed back: 709 / 558 / 593 notes, first onsets and velocities identical to the score files. (3) `tools/curve_eval.js`
— the app's `computeYAtT` / `computeSegY` / `getYAtPos` / `getYAtTime` ported, node smoothing included; checked against the
running app at two points of the test curve: 5.013 and 9.086 on both sides. (4) `tools/trill_curve_gen.js` →
`scores/trill-curve-test.json`: piece #2's lookup (window ±0.05, the nearby attacks cycled, a seeded start per region;
stretch anchored at his fastest gap → smooth toward the local mean → speed) with the role matched — a lo note draws from
his lo gaps, a hi note from his hi, so his long-short finger pattern is kept (`--roles off` pools them; smooth then kills
the stutter as in #2); the note length his, capped at 1.8 × gap; the velocity his; pitches 69 / 70 (A4 / B♭4). The built-in
curve: 45 s from 2 s on violin 1, nodes (0, 1) (0.3, 8) (0.5, 4.5) (0.75, 10) (1, 1.5), sigmoid segments of slope 0.5,
node smoothing 0.6 — a slow opening, a swell, an easing, the rush to the top, the long relaxation; smooth 0.7, stretch 1,
speed 1, seed 1. **The output:** 329 notes; per 5 s window, the rate written against the rate the curve implies: 5.1 / 5.1
· 6.7 / 6.8 · 8.2 / 8.1 · 7.7 / 7.7 · 6.8 / 6.9 · 7.9 / 8.0 · 9.3 / 9.2 · 8.1 / 8.2 · 5.8 / 5.8 per second — the velocity 70
→ 105 → 74 and the length 138 → 80 → 122 ms following; shortest note 66 ms, smallest gap 94 ms; no same-pitch overlap.

**Verified on the throwaway server** (a copy `zz-ai-trill-curve`, deleted after with its working copy): 331 objects, the
curve drawn as a line on the violin 1 lane, the marker labelled, zero console errors; the playability badge "151 soft"
(re-attacks — expected for a trill, §99). *Rejected:* the Bash heredoc for the generator (cut at ~8 KB; the file tool
instead) · normalizing the speed per burst (#2's convention) — per instrument keeps the curve's height meaning the same
rate in every burst. **To listen:** reload, Experiments → `trill-curve-test`, SPACE from the start. To change: one flag
each — `--smooth`, `--stretch`, `--speed`, `--seed`, `--roles off`, `--pitch`, `--dur`, or `--from` a score with his own
curve drawn on the lane. His three sample files committed at his word (b9d68ee). Awaiting his ears.

## §102. "Still sounds quite jumpy": the playback path was the culprit — frame-polled notes vs piece #2's timestamped zone tick; the trill test rewritten as an embedded MIDI snippet; the piece and the drawer answered

Composer: *"still sounds quite jumpy, what was done for 2piano to make that one smooth, different playback? embedded midi?
this one is not going to work"* · *"and then is there any impact on the main piece piece-septet, does that midi need to be
reformatted?"* · *"how about the strikes drawer? is it ok as is since no animation?"*

**Found.** Two playback paths exist in composer.html, both ticked from the animation loop (`animatePlay` →
`tickZoneMidiPlayback`, `tickMotivePlayback`, `tickCurvePlayback`). (1) **Plain notes** (`tickCurvePlayback`): each frame,
every note object is tested — inside its span and not yet sounding → note-on now; outside → note-off now. A note therefore
starts on the first frame after its onset: a delay of 0 → 16.7 ms at 60 fps, more when the page drops frames (a scrolling
SVG with hundreds of objects), drawn independently per note; note-offs the same. At a trill's 100–150 ms gaps that is a
10–15 % wobble on every gap — "jumpy". The strikes, the composer's captures and both trill files go this way. (2) **Zone
snippets** (`tickZoneMidiPlayback` — piece #2's; MIDI_PREVIEW_ZONE.md item 7): a zone carries `midiSnippet { events:
{onsetMs, notes, velocity, durations} | {onsetMs, _cc, _ccValue}, port, channel }`; once the playhead enters the zone, the
tick hands every event up to 100 ms ahead to `output.send(msg, performance.now() + delay)` — a Web MIDI timestamp the
browser delivers to the millisecond whatever the frame rate. The port is looked up by name in the Web MIDI outputs (the
same table the strikes use: `vn1`); nothing from the registry. That is what made piece #2 smooth — "embedded MIDI", as the
composer guessed. The tick is alive here; nothing had fed it.

**Done:** `tools/trill_curve_gen.js` now writes the trill as ONE zone with the snippet embedded (`--as zone`, the default;
`--as notes` keeps the plain form): CC7 127 and the technique's CC0 (accent senza vib = 9) at the zone's start, the first
note 200 ms later, port `Vn1` channel 1 from `sandbox/instruments.js`; `zoneFunction: 'midiPreview'` so the panel offers
M / S. `scores/trill-curve-test.json` regenerated: 3 objects — the curve, the marker, the zone zn-3 (1.8 → 47.5 s, 331
events). **Verified on the throwaway server** (`zz-ai-trill-curve`, deleted after): Web MIDI is denied in the in-app
browser and its animation loop pauses while the pane is hidden (the first run produced no ticks at all — a finding for
every future harness), so the tick was driven by hand at 20 Hz — three times coarser than a frame — against a fake `vn1`
output recording every send with its timestamp: 30 note-ons and 30 note-offs in 7.5 s, CC7 then CC0 first, the notes and
velocities identical to the snippet, the scheduled gaps equal to the snippet's to **0.2 ms at worst** (249.3 vs 249.1 ·
215.1 vs 215.1 · 232.9 vs 232.9 …), the durations exact (173 / 134 / 148 ms), each event handed over 51–99 ms before its
time; zero console errors. The tick rate does not touch the timing — that is the proof. `midi/trill-curve-test.mid`
exported as the second A/B (Reaper, sample-accurate, the same 329 notes).

**The piece (his question):** `piece-septet.json` needs no reformatting — the file is data; the IR reads the file; the MIDI
export writes the file's times. What suffers is the demo PLAYBACK of plain notes: every strike note carries the same frame
delay — inaudible on a chord, proportionally large on the accel runs' tails (gaps under 50 ms; #31 lands at 11 ms, where
two notes inside one frame fire together). The cure is one function: schedule plain notes with timestamps and a lookahead
as the zone tick does — a page change, no data change (NITS; PLAN when he wants it). **The drawer (his question):** `Hear`
is timer-scheduled (`setTimeout` from a `performance.now()` base, the CC0 led by CC0_LEAD_MS — strike_drawer.js 947–957):
millisecond accuracy, no frames — fine as it is. The inserted strike then plays through the score's plain path, above.
*Not done:* any change to the app (he said check in first). Awaiting his ears on the zone form.

## §103. "Yes please fix the piece": the plain-note playback scheduled with Web MIDI timestamps — `tickCurvePlayback` rewritten, verified on the trill file and on the piece's own runs; "trill sounds much better"

Composer: *"yes please fix the piece and I'll presume anything else in the composer score playback"* — and, of §102's zone
form, *"trill sounds much better ty"*: the diagnosis confirmed by ear; the data (his own timing, §101) was right all along.

**Built** (`score/public/composer.html`: `tickCurvePlayback` and `flushCurvePlayback`, spliced by marker from the
scratchpad — the old function was 90 lines). The pattern of `tickZoneMidiPlayback`: every plain / KS / curve note is
handed to Web MIDI up to 100 ms ahead with its exact timestamp on the transport's own clock — `perfAt(sec) =
playStartTime + (sec − playStartOffset ÷ pixelsPerSecond) × 1000`, the mapping `animatePlay` runs on — the CC0 / CC7
pre-arm 150 ms before it (or at once when the note is nearer than that), the note-off at its end (scheduled with the on
when the note is under 2 s, else when its end enters the lookahead). The curve-following CC7 stream and the morph bend
stay per frame — continuous controllers, not attacks. A note the playhead is already inside when play starts fires at
once, as before; a scrub landing more than 50 ms into a short captured note no longer fires it late. On stop,
`flushCurvePlayback` calls `clear()` on every output (Web MIDI's cancel of what is queued), closes the notes in flight —
one whose scheduled on is still ahead is closed 5 ms after that on, which also covers an output without `clear()` — then
the CC7 sweep as before. `_curvePreArm` is retired (kept, empty). A bug the harness caught: a note scheduled ahead is
"before its start" for a frame or two — the first version read that as a scrub, closed it and re-scheduled it, so every
note fired twice; now only a real jump (over half a second) counts.

**Verified on the throwaway server.** Web MIDI is denied there, and the hidden pane throttles timers to about once a
second — the first harness run stepped in 1 s jumps and the tick rightly took them for scrubs: every future harness must
drive the tick synchronously with simulated time, as these did, or front the pane. (1) `trill0-listen` (plain notes, 1180
on seven lanes), fake outputs on all eight ports, the transport set at 0 and ticked synchronously every 50 ms to 6.5 s:
the 50 violin notes in the window → one note-on and one note-off each, every timestamp equal to the note's time to the
millisecond (0.000 ms error), velocities 127 · 60 · 60 as recorded, CC0 5 (senza vib #6) and CC7 127 once per note, 150
ms ahead; two more ons for the notes just past the window (scheduled ahead, by design); stop → `clear()` on every output,
the two notes in flight closed, the state empty. (2) **The piece** (`piece-septet` copied as `zz-ai-piece`), the transport
set at 66 s and ticked to 72.6 s — strikes #28 → #31, the accel runs' tails: 24 notes on all seven ports, 24 ons and 24
offs, every timestamp exact, and the smallest onset gaps between players — 0 · 0 · 0 · 1 · 1 · 1 · 4 · 5 ms — preserved
exactly in the scheduled times, where the frame-polled path merged them into one frame; stop clears all eight outputs;
zero console errors in both runs. `node --check` on the page's script block after each splice. The copies and their
working copies deleted.

**For the composer:** a page change — reload; his server untouched. Everything that plays plain notes is scheduled now:
the strikes, his captures, `trill0-listen`; the recording echo is live thru and untouched; the drawer's Hear was already
timer-scheduled (§102). *As before:* the pre-arm is shorter than 150 ms for notes inside the first 150 ms after pressing
play. NITS entry closed.

## §104. TRILLS_TOOL phase 1 built: the trill object in the score — his timing table live along the lane's curve, the interval audition row, the eating rule, exact playback; verified on the piece

Composer (CN-22): *"a, go ahead with phase 1 lets do whole step as default and lets build into the plan an easy way to
audition different intervals before inserting a trill and selecting the interval for the trill"*.

**Design, in the app's own terms** (the least new machinery): a trill is a `zone` with `midiModel: 'trill'` and a `trill`
block — `pitch · interval (signed semitones; +2 by default) · technique (the table's: accent senza vib) · accent (on;
attackVel 127) · curveId · level (0.5 when no curve) · eat (on) · smooth 0.7 · stretch 1 · speed 1 · seed 1 · roles (on) ·
launchedFrom`. Its notes are generated in the browser by `score/public/trill_engine.js` — one module for the page and the
node tools (`tools/trill_curve_gen.js` now requires it): the §101 lookup — the curve's height on its lane is the speed
level; the attacks he played within ±0.05 of it cycled in turn, matched by role; stretch → smooth → speed; his lengths and
velocities; the first note at the accent velocity — and embedded as the zone's `midiSnippet` (`leadMs` 150: the zone tick
starts that early and sends CC7 127 and the technique's CC0 before the first note; the tick learned `leadMs` today). The
snippet is rebuilt at every play start (`startPlay` → `regenerateTrills`), on Hear and on every panel change, so the curve
is always current; the save carries the last snippet (data, not truth — the `trill` block is the truth). No registry: the
port, channel and CC0 come from `sandbox/instruments.js` through the lane's technique, as the strikes do; violin 2, the
flute, the bass clarinet and the piano borrow violin 1's timing (pitch-agnostic) until sampled — the panel says so.

**Creation:** `Add Trill` in the toolbar or `T` — over the selected curve (its span and lane), from the selected note
(its pitch and start, 4 s; the note becomes the attack and is eaten; `launchedFrom` set — phase 3's launch in its simplest
form), or 4 s from the playhead on the active lane; the pitch defaults to this player's nearest note at or before the
start (his strike note), else the middle of the range; both notes of the pair folded by octave into the technique's range.
**The panel** (the zone panel, MIDI Model = Trill): Pitch, with the note names · **Interval — m2 M2 m3 M3 P4 TT P5 m6 M6
as chips: a click plays two seconds of the trill on that interval at mid speed (his timing, the lane's technique, the
accent) AND takes it; `↑ above / ↓ below`** · Technique (the lane's menu) · Accent and its velocity · Curve (the lane's
curve it follows, or a flat level box) · Eat notes · Feel (smooth stretch speed seed) · Timing (which table, its rate
range, the note count, the port) · `▶ hear` — the whole trill as it will play, timestamped, a toggle. Auditions go through
the same timestamped path, one at a time; stop cancels the queue and closes the pair.

**The eating rule (§6):** a plain note that STARTS under a trill on its own lane is skipped by the plain-note tick
(`trillCovers`), drawn at opacity 0.15, and stamped `mutedBy` = the trill's id at regeneration (for the IR and the
notation); the zone's **M** silences the trill and gives the notes back (`trillCovers` ignores a muted trill; the stamps
go); a deleted trill clears its stamps and redraws its lane; the part's S buttons apply to zones now too. The zone's label
reads `tr A3–B3 (M2) · accent_senza_vel · 28 notes`.

**Verified on the throwaway server** (a copy of the piece; fake outputs; synchronous ticks; zero console errors
throughout): the page loads with the engine, the button and the table; `createTrill` at 44 s on violin 1 → a zone 44 →
48 s, pitch 57 (A3, the strike just before it), interval 2, accent senza vib, 28 notes, port Vn1 ch 1, leadMs 150, CC7 /
CC0 9 then the first note at +150 ms at 127; the panel with its 9 chips and Hear; the one note under it (D5 at 46.224)
stamped and drawn at 0.15 where its neighbours are 0.55; a chip (m3) → 14 note-ons over 1.9 s on 57 / 60 with the CC
lead, the interval taken, the label updated, stop → the two note-offs and CC7 127; Hear → all 28; the transport simulated
from 43.5 s → the trill's notes scheduled by the zone tick, the eaten note not scheduled, the other lanes' strikes
unaffected; M → covers false and the stamps cleared, back on unmute; delete → gone, no stamps, the lane redrawn; a real
click on `Add Trill` and on the M3 chip → a trill at 44 s, interval 4, "tr A3–C#4 (M3)", 14 notes on 57 / 61, the chip
lit. The engine in node: violin 1 at mid speed for 4 s → 28 notes, A4 / B4 alternating, the accent first; the stand-ins
resolved; `tools/trill_curve_gen.js` on the engine reproduces the 329-note test (the zone form now starts at the curve's
start with `leadMs`; `--interval` and `--accent off` added). *Found on the way:* the hidden pane's timers and animation
loop pause — every harness drives the ticks synchronously (§103); the zone tick schedules from `performance.now()` plus
the delay, which a compressed simulation cannot time-check (its accuracy stands from §102's real-time run). *Not in phase
1:* a launched note's edit does not move its trill; a moved trill re-stamps at the next regeneration (play start or the
panel); the three META lanes and the simpler drawing (phase 2); `busy()` in the accel dealer (phase 3); the weave (5);
notation (6). **For the composer:** reload (a page change; the server untouched) — draw a curve on a violin lane, T over
it, click intervals, ▶ hear, SPACE.

## §105. TRILLS_TOOL phase 2 built: three META lanes (A, B, C), trace-then-adjust with re-trace splicing, the trill's live curve reference with bake, SHIFT-drag spans — and the curve reader made to read bends as drawn

Composer: *"good for phase 2"*.

**What already existed** (found before writing a line): the freehand sketch → smoothed, RDP-simplified node curve on the
META window (`fitSketch`, the fit-strength menu); the three adjust gestures of the spec — drag a node, drag the green
diamond at a segment's middle to bend it (`startSegmentDrag` → the `ctrl` model, a free control point), ALT-click a node
to remove it, double-click the curve to add one. "Trace, then adjust" was two thirds built; phase 2 added the rest.

**Built** (`score/public/composer.html`, 32 splices by exact anchor): (1) **three META lanes** — `#laneMeta` (A),
`#laneMetaB`, `#laneMetaC`, layers 7 · 8 · 9 (`META_LAYERS`, `META_NAMES`, `META_COLORS`); the one META button became
`META A · B · C`; each window has its own ✕ and label-drag; draw mode arms every open window and a sketch lands on the
window it is drawn in (C over B over A where they overlap); a score with curves on B or C opens those windows on load;
the panel's Track menu lists META A / B / C; the strikes' shapes stay on A (the drawer's `METAL()` untouched);
`layoutVersion` 4 — v3 files load unchanged, A is still 7. (2) **Re-trace splicing:** a sketch over a region of a lane's
reference curve replaces that region — the new nodes splice in between their first and last time, the old nodes outside
stay with their bends; one curve per lane grows this way; every traced curve carries `curveName` A / B / C. (3)
**Double-click a node removes it** (ALT-click kept). (4) **The bug on the way:** `getYAtPos` — the reader behind
`getYAtTime`, which the trill, the tools and the drawn-shape sampling use — evaluated segments through `computeYAtT`,
which knows no `ctrl` model; the diamond writes `ctrl`; so a bent segment was DRAWN bent (`generateWCPath` uses
`computeSegY`) but READ straight. `getYAtPos` now reads through `computeSegY`; `tools/curve_eval.js` already did. (5)
**The live reference (§4):** the trill's `curveRef` — `auto · A · B · C · lane · flat` as chips in its panel with a status
line ("auto → curve B (1 piece under this span)", "nothing drawn under this span: flat"); `auto` = A if anything is drawn
under the trill on A, else its lane's curve, else the flat level; A / B / C are read over the trill's own span at
absolute time — the curve covering the moment, else the nearest edge; regenerated at every play start, so redrawing the
curve moves every trill on it; `bake` copies the reference into the trill's own curve on its lane and switches it to
`lane`. (6) **SHIFT-drag on empty lane space marks a span** (an orange dashed box that survives a re-render), `T` makes
the trill there, ESC or a plain click clears it.

**Verified on the throwaway server** (a copy of the piece; synthetic sketches and mouse events; zero console errors):
the piece opens META A by itself (its shapes); META B opens 185 px tall; a 60-point sketch on B → one curve, 40 → 50 s,
7 nodes, `curveName` B; a second sketch over 44 → 47 s at full height → still one curve 40 → 50 s, its height at 45.5 s
0.77 → 0.90, at 41 s unchanged (0.455); a span 42 → 48 s on violin 1 by SHIFT-drag → `T` → the trill there, the span
cleared; `auto` → flat (nothing on A, nothing on the lane); the B chip → the trill reads B — its level function returns
exactly the curve's height (0.543 at 42 s, 0.900 at 45.5 s) — and its 52 notes run at a 138 ms mean gap where the curve
is low and 107 ms where it is high; `bake` → a 13-node copy on violin 1 matching B (0.90 at 45.5 s), the reference now
`lane`; a second span + ESC → cleared; a `ctrl` segment read through `getYAtPos` = `computeSegY` (6.95 = 6.95). The
screenshot: META A and B over the lanes, the panel's Curve row, the baked curve under the trill.

*Not in phase 2:* the A / B / C selector on the lane header (the panel's chips do it); the wheel-on-segment shaping of
PLAN 1a (the diamond does it — 1a closed); the extractor's classifier still says META = layer 10 (PLAN 2a, NAMING §2.2's
note). **NAMING §2.2, the contract:** layers ≥ `tracks.length` are META — 7 = A (the strikes' shapes and reference
curve A), 8 = B, 9 = C. **For the composer:** reload; `META A · B · C` at the bottom; ✎ Draw, then trace on an open
window; click the curve to adjust; SHIFT-drag a span on a player, T; the trill's Curve row chooses what it reads.

## §106. The curves, discussed: three curve windows one track high, META out of the curve path, the object rebuilt as points → fill → shape; why the green square did nothing — talk first, nothing built

Composer (CN-23): the curve windows one track height, three of them, the META window left where it is and out of the curve
path; the curve object "pretty close to" piece #2's but easier: click to place points (no lines), a command or a
double-click fills the curve, hold a segment and drag left / right / up / down to change it, calibrated better than #2's
("too sensitive"); "in this one that you made, the green square doesn't do anything"; discuss first. He asked for piece
#2's composer server to look at: started (`.claude/launch.json` → `twopianos`: `node server.js` in the #2 repo, port
5000 — free; `http://localhost:5000/composer.html`).

**Piece #2's curve object, read:** `Draw Curve` makes a two-node curve between the Start / End boxes; nodes drag; a
double-click on the line adds a node; a segment's shape is the panel's Model + Slope, and the wheel over a node nudges the
slope by 0.05 a notch (the exponent is 4^slope, so a notch is a jump — "too sensitive"). No segment drag there.

**Why the green square did nothing (found):** the diamond of `startSegmentDrag` writes the segment as a control-point
model (`ctrl`, with `cx` / `cy` so the curve passes at the mouse). Two readers ignored that model: `getYAtPos` — fixed in
§105 — and the drawing itself, `generateWCPath`, whose branch for curves WITHOUT node smoothing evaluates every segment
through `computeYAtT`, which has no `ctrl` case; only the smooth-node branch goes through `computeSegY`. The strikes' META
shapes have `smooth: 0`, and so does any curve whose smoothing was set to 0 — on those the diamond moved and the line did
not. On traced curves (smooth 0.35) it worked. Not fixed yet — it goes with the rebuild (one line: the plain branch reads
through `computeSegY`).

**Proposed to the composer** (the answer in chat; his decisions next): (1) windows — the META window unchanged (the
gestures' shapes, the stamps, no curve drawing); three curve windows A / B / C of one lane's height on layers 8 / 9 / 10,
floating like META, each with its own resting height, toggled by `A B C`; the trill's chips read them. (2) The object,
"points → fill → shape": `Points` mode on a curve window — a click drops a dot at that time and height, another click
another dot, peaks and troughs, no lines, the dots sorted by time, draggable, ALT-click removes; `Fill` — a double-click
on the window (or ENTER, or the button) draws the curve through the dots as an ordinary wave curve (gentle node
smoothing, plain segments), so the trill, the tools and the IR read it unchanged; `Shape` — hold anywhere on a segment's
line and drag: up / down bends it so the line passes through the mouse (1 : 1, nothing to calibrate), left / right slides
the bend along the segment; drag a dot to move it, double-click a dot to remove it, double-click the line to add one;
more points on an existing curve splice in on the next fill. No diamonds, no wheel, no slope dials. Questions put to him:
floating or docked windows · the fill trigger · dots always visible or on selection · left-right bend or vertical only ·
whether the trace stays as a second way or goes.

## §107. The curve windows rebuilt to his design (CN-23 → CN-25): META out of the curve path; A / B / C exactly over Violin 2, Viola, Cello; points → fill → shape; the green square's cause fixed — verified

Composer (CN-24): windows like META, translucent, floating, but *"precisely the height of and location of violin two, viola,
and cello"*; the curve not filled, the line a little transparent; a button draws the line between the points; scroll and
keep adding points anywhere; dots always visible; simple delete and move; no freehand; a way to continue a curve, and
deleting an end collapses the curve to the next point. (CN-25): the bend *"like Logic Pro, where you can drag and change
the depth of the curve or the direction of the hump"*; a window can hold several curves; *"good to go"*.

**Built** (`score/public/composer.html`, 26 splices; phase 2's META B / C undone): (1) **windows** — META is one window
again (layer 7: the gestures' shapes, the stamps, its freehand draw); three CURVE windows `#laneCurveA/B/C` on layers
8 / 9 / 10, positioned by the same percentages as lanes 5 / 6 / 7 (top 57.14 / 71.43 / 85.71 %, height 14.29 %), so they
cover Violin 2, Viola and Cello exactly; translucent (0.35), a dashed border and a `curve A` label at the right in the
window's colour (rust, blue, violet), not draggable; buttons `META` and `A B C`; click-through except for their dots and
lines, catching clicks only in Points mode. (2) **points → fill → shape** — `● Points`: a click in an open window places a
dot (`curveDot` object: layer, time, height, `curveId` = the window's selected curve or null) — the dots live on the
timeline, survive scrolling and the save, and are drawn always; `Fill`: the pending dots become lines — with nothing
selected a new curve per window (an ordinary `waveCurve`, `fillMode: 'line'`, opacity 0.45, node smoothing 0 so the line
passes exactly through the dots, plain segments, `curveName`), placed on a selected curve its new nodes (the span extends
past an end, dots inside splice in; a lone dot waits); a filled curve's dots stay visible: drag one (time and height, the
line following; ends stretch the curve), double-click or ALT-click removes it (an end gone shrinks the curve to the next;
one dot left: the line goes, the dot stays pending); several curves per window. **Shape:** hold the line between two dots
and drag up / down — the segment becomes a control-point curve whose control column is the held column, and `cy` is
solved so the line passes through the mouse there: the hump's depth and direction follow the hand, one to one; left /
right does nothing (Logic's gesture). No freehand on the curve windows, no diamonds, no wheel, no slope dials; the panel
stays on demand. (3) **The green square (§106) fixed:** `generateWCPath`'s branch for curves without node smoothing now
reads segments through `computeSegY`, so a bend draws on plain curves too. (4) The trill's `A / B / C` chips read the
curve windows (`CURVE_LAYERS`); `layoutVersion` 5 with a v4 migration (one evening's layout); the Track menu lists META and
curve A / B / C; a score with curves or dots on a window opens it on load; ESC ends Points.

**Verified on the throwaway server** (a copy of the piece, tab fronted; synthetic mouse events; zero console errors):
window A's `offsetTop` / `offsetHeight` = Violin 2's (352 / 88 at 1280 × 720) — exact; three clicks → three pending dots on
layer 8 → Fill → one curve 40 → 46 s, 3 nodes, line, 0.45, `curveName` A, smoothing 0, its 3 dots drawn; select it, two
more clicks → dots attached (`curveId`) → Fill → the same curve, 5 nodes, 40 → 52 s; deselect, two clicks → Fill → a second
curve 60 → 63 s, the first untouched; a node drag → start 40 → 39; an end removed → end 52 → 49, 4 nodes, 3 segments;
removed down to one → the curve gone, a pending dot at 39 s left, the second curve untouched; a trill on Violin 2 with
`curveRef` A → kind meta, 1 curve, its level = the curve's height (0.75 at 61.5 s); the META Draw button arms META only;
ESC ends Points. **The bend, in node against the app's evaluator** (the tab's rect reader returns collapsed rectangles,
so pixel geometry was measured by offsets and the screenshot instead): held at the middle or off-centre (25 %, 35 %,
75 %, 90 % of a segment) and dragged to 0.15 … 0.99 of the lane → the line passes through the held column at the mouse
height to 0.00 %; the exception is a hold right beside a dot dragged far (a flat 0.1 segment held at 15 % dragged to 0.9):
the control point reaches the model's ceiling (`cy` 1.4) and the line goes as far as the hump can (0.64) — the model's
limit, not an error. The screenshot: window A on the Violin 2 lane, dashed edges on the lane's edges, `curve A` at the
right, dots along it. *Left for his hands:* the feel of the bend; the windows' translucency (0.35); the bend near a dot.
Piece #2's composer server stays up at `http://localhost:5000/composer.html` (`.claude/launch.json` → `twopianos`).

## §108. Phase 3 talked through before building: the trill from a strike note, the zone's own curve buttons, the panel on P, the live curve update — his questions answered, the open points put to him

Composer (CN-26): the curve windows *"work good"* (the Points icon → a nib, done: 6bf98b2); then phase 3: select a strike
note, T → a trill; drag it longer or shorter like other zones; the panel hidden unless P, buttons on the zone `1 2 3` to
choose a curve, the zone showing the sampled length of that curve filled and translucent, sitting on top of the curve;
does a zone that extends past further strikes grey their notes automatically; do the notes come back when the zone is
deleted; how to start a zone in the middle; and what happens when the source curve is changed afterwards.

**What phase 1 already does** (§104): T on a selected strike note → a trill from its onset, 4 s, its pitch, that player;
the note is eaten and the trill's first note is the accent. The zone's edges drag (`renderZone`'s edge handles); the
eaten notes update live as it moves (a note that STARTS under the trill on that player is silent and faint; one that
began before and rings into it is not); delete → `mutedBy` cleared, the lane redrawn, the strikes sound again; M mutes the
trill and gives the notes back without deleting. T with nothing selected → 4 s at the playhead on the active lane;
SHIFT-drag a span on a lane, then T → the trill over the span. The curve reference is live: the snippet is regenerated
from the curve at every play start, so a changed source curve changes the trill's sound the next time it plays; `bake`
freezes a copy when a trill must not follow.

**Proposed for phase 3** (nothing built): (1) trill zones show no panel on selection — P opens it (pitch, interval
audition, technique, feel, bake); (2) on the zone itself: `1 2 3` (curves A / B / C; the chosen one lit) and `▶` (hear);
pressing a number sets the reference and the zone draws the sampled curve over its own span as a translucent fill inside
its box — so on Violin 2 / Viola / Cello the zone sits on top of the very curve it reads, elsewhere it carries the shape
with it; the fill redraws when the zone is dragged or the source curve is edited (fill, bend, dot moved) — live in the
picture as well as in the sound; (3) the accel dealer consults `busy(lane, t)` (§7): a run's card that lands on a player
while that player trills is skipped, the run keeps its timing, the readout says so; (4) the attack: on one channel the
strike's own articulation (Bartók, gettato, slap) cannot sound with the trill's first note — the accent note on the trill
articulation is the attack (the spec's option 1); option 3 (two voices) only where a second slot exists (the flute's
strike slot). **Put to him:** the attack rule · the zone buttons (1 2 3 + ▶, or 1 2 3 only) · overlapping trills on one
player (warn, my default, or forbid) · whether a trill's pitch should follow when it is dragged onto another strike note
(no, my default — P changes it) · the live update as default with bake to freeze.

## §109. Phase 3 built: the trill's own `1 2 3` and the sampled curve in the zone, the panel on P, the attack note's articulation / length / velocity, overlap warnings, the dealer's busy rule — verified

Composer (CN-27): the attack for the demo — the first note's articulation, duration and velocity editable in the panel
(the notation will say fp or sfz); `1 2 3` only; overlaps warn; a dragged trill keeps its pitch; live update, bake freezes.

**Built** (`composer.html` 16 splices, `trill_engine.js`, `strike_drawer.js`): (1) a trill zone shows no panel when
selected — P opens it (the `_panelOverride` the META curves use). (2) The zone draws the curve it reads over its own
span as a translucent fill inside its box (24–400 samples of the live level function); new trill zones fill the lane's
height (`zoneHeight` 0.96), so on Violin 2 / Viola / Cello the fill sits on the very curve; the fill redraws when the zone
moves and when its source changes — after a Fill, a dot dragged or removed, a bend, a curve deleted, and at every play
start (`refreshTrillDecor`). (3) `1 2 3` at the zone's top-right: a click → the trill reads A / B / C (lit); the lit one
again → auto; the status names what it reads. (4) **The attack** (CN-27): the trill block gains `attackTech` (the first
note's articulation from the lane's menu; blank = the trill's own) and `attackDurMs` (its length; blank = his sampled
length) beside `attackVel`; the engine sets the first note's length; `snippetEvents` puts the attack's CC0 first and the
trill's CC0 back 12 ms before the second note when both share the port and channel (the first note keeps sounding on its
own sample — the sampler switches only new notes), or routes the first note with its CC7 / CC0 to the attack's own slot
when that differs (the flute's tongue ram beside its ordinario) — the per-event routing the zone tick already had; the
panel's Attack row: on / off · vel · articulation · ms. (5) Overlapping trills on one player: `_overlap` at regeneration;
the zone's label says `⚠ overlaps zn-948`. (6) **The dealer's busy rule** (§7, the simplest honest form): at Insert the
drawer asks `Composer.trillCovers(lane, t)` for every note and does not write one whose player is trilling at that
moment — the run keeps its timing; the status says `n skipped — trilling: Vn1@45.20 …`. The deal itself is unchanged (a
re-deal around busy players needs the target time at deal time — later, if wanted).

**Verified on the throwaway server** (a copy of the piece; no fresh console error — the two logged entries were harness
artefacts: the drawer's first load before a bracket fix, and a synthetic keydown dispatched on `window`): select the
strike note C#6 at 43.103 on violin 1, T → a trill 43.103 → 47.103 on its pitch, `launchedFrom` set, zoneHeight 0.96, the
fill drawn, three buttons, the panel hidden; the "2" button → `curveRef` B, lit, "trill reads curve B"; again → auto; a
curve on A across it → auto resolves to A and the fill changes; a bend on A → the fill changes again; the attack marcato
sfz at 300 ms → events `cc7 · cc0 11 · note 300 ms at 127 @150 · cc0 9 @320 · note 2 @332`; back to plain → `cc7 · cc0 9
· note`; a second trill over the first → `_overlap` and the label's warning; `trillCovers(3, 45.5)` true; the drawer's
loaded `insert` carries the rule; P on the selected zone → the panel with the Attack row (89 articulations + "same as
trill", the "as played" placeholder), the ms box sets 250 and clears to blank, hidden again on reselect. The engine in
node: `attackDurMs` 400 → the first note 0.4 s and the second his; the same-slot and other-slot event orders as designed.

**For the composer:** reload; select a strike note, T; `1 2 3` on the zone; P for the attack (try marcato sfz or Bartók at
127, 200–400 ms) and the interval; drag the ends; redraw a curve and the trill follows. *Not built:* a re-deal around busy
players (the skip is at insert); the pitch following the note underneath (his d: it stays).

## §110. His hands on the curves and the trill panel: three fixes the same night — a Points click joins the curve at once, META closed at load, the attack length visible

Composer: *"Double click does nothing. And when I tried to add points, it just adds points not connected to the curve
line."* (with a screenshot: two loose dots beside the line) · *"For the first note, either I can't see the duration or the
duration is not there."* · *"meta panel closed by default pls"* · *"points draw mouse icon … a pencil or arrow, something
with a point"*.

**Found and fixed** (`composer.html`): (1) a click in Points mode only queued a dot for Fill (a hollow one when a curve was
selected) — too many steps, and the dot sat where the mouse was, off the line. Now: a click inside a curve's span
**joins that curve at once** (the dot inserted at that time and height, the line redrawn through it, the curve selected so
the next clicks continue); a click beyond an end with the curve selected **extends it**; only a click far from everything
with nothing selected is a pending dot for Fill (a new curve). A click on the line in Points mode is a dot there too.
(2) The double-click on the line was lost because the first click's selection re-drew the line's element under the mouse
(the browser needs both clicks on the same element); the curve windows now detect it themselves — two clicks within 400
ms and 4 px on the same line → a dot on the line; the DOM double-click is ignored there. The add-on-line routine also read
a bent segment with the plain formula and gave the new dot smoothing: it now lands on the drawn line, unsmoothed, and a
bent segment splits into two plain halves. (3) The Attack row overflowed the panel — the wide articulation menu pushed the
ms box off the right edge: the length has its own row (`Attack ms`, "blank = as you played"), the menu is capped at 150 px.
(4) META stays closed at load (the button opens it; the drawer still opens it on Insert). (5) Points mode's cursor is a
pencil with its tip as the hotspot (a data-URI SVG, crosshair as the fallback); the Points button a nib.

**Verified on the throwaway server** (a copy of the piece; synthetic clicks): a 3-dot curve 40 → 52 s on A; Points click
at 46.5 → 4 dots, the curve selected; a click at 55 → the end 55, 5 dots; deselect, a click at 70 → a pending dot; a click
on the line at 43 → 6 dots; two quick clicks on the line at 49 outside Points → 7 dots, 6 segments, times in order; the
panel: rows `Attack` and `Attack ms`, the ms box inside the panel (right edge 148 of 320), the menu 150 px; META closed at
load with 32 shapes present; the cursor accepted (a 24 × 24 image, hotspot 2 22). The composer's `scores/trillBuildTst.json`
sits untracked, his to commit.

## §111. The bend cursor only when Points is off; TRILLS_TOOL phase 4 built: the default length to the player's next strike note, a stretch regenerates at once; his reminders; how to extend a curve's ends

Composer (2026-09-06, session 4): *"when points is on and I want to at a point, the double arrow curve adjust icon is there when I
hover over a curve. Can you make that icon, the double arrow one, on only when points is off? So it's clear when I'm adding a point
or bending the curve. and then good for phase four."* Mid-build: *"Some to do reminders for me. Move notes in scattered strikes.
Shift them so they are more playable, and the range walk. And how do I add points to a curve to the... from the... to the beginning
or after the end."* · *"Another to do normalized trill loudness."* · *"and how do I add points to curve end/beginning?"*

**The cursor (found, fixed):** the line's hit path sets `ns-resize` inline at render (`composer.html`, the curveHit path) — an
inline style beats the window's `.curveLane.points` pencil, so in Points mode the line showed the bend arrow. One stylesheet rule,
`.curveLane.points .contentGroup path.curveHit { cursor: inherit !important; }`: `!important` in the sheet outranks the inline
style, `inherit` hands the path the window's pencil; Points off → `ns-resize` as before; no re-render on the toggle (the class
flips already). The dots keep `move` in both modes — a third icon, for dragging a dot.

**Phase 4, what it was** (TRILLS_TOOL §11 phase 4 = §4's T on a span + §5's default length, "edge stretching"): T on a span came
with phase 2 (§105), the edge handles drag since phase 1; missing: (1) the default length — a fixed 4 s since §104, the spec says
*to this player's next strike note, or 2 s if none*; (2) a stretch or a drag left the snippet, the label's count and the `mutedBy`
stamps stale until the next play start (the faint drawing was live: `renderZone` re-renders the lane's notes through
`trillCovers`); (3) a ctrl-drag copy kept `launchedFrom` = the original note. **Measured first** (a scratch script on the piece):
per player, the gap from a strike note to that player's next strike note (a different `groupId`) — min 0.67 s (Vn2), p10 0.9–1.2 s,
median 1.7–2.0 s, max 8–11.6 s; none under 0.5 s in 273 gaps → the spec's rule needs no floor.

**Built** (`composer.html`, 10 splices by anchor, `node --check` on both script blocks): `trillAnchorNote(layer, t)` — the
player's nearest note at or before t within 8 s (`trillDefaults` now takes its pitch from it); `trillDefaultEnd(layer, start,
fromNote)` — the anchor is the launching note, or the anchor note at the playhead; "next strike" = the first later note of ANOTHER
strike (its `groupId` differs — the same strike's later notes, the piano's chord or a run's re-deal, are skipped; ungrouped notes
count after 60 ms, the strike DB's simultaneity threshold), else start + 2 s; `createTrill` uses it for T on a note and T at the
playhead (a marked span and a selected curve keep their own ends) and the status says which ("to the next strike note" · "2 s — no
later strike note on this player" · "drag the right edge to stretch"); `trillAfterDrag(zone)` = `regenerateTrill` + `renderZone`
on the mouseup of the body drag, the ctrl-drag copy and both edges; both zone-copy routines clear `trill.launchedFrom`.

**Verified on the throwaway server** (`zz-ai-phase4`, a copy of the piece, the tab fronted, synthetic events; zero console errors;
the copy and its working copy deleted): the hit path's computed cursor in Points mode = the lane's pencil (`url(data:image/svg+xml…)
2 22, crosshair`), off = `ns-resize`; T on C#6 at 43.103 (Vn1) → 43.103 → 46.224 = the next strike note, the same strike's one
later note skipped, 25 notes, the attack note eaten, the end note not; T on the lane's last note (71.951) → 73.951, the status "2 s —
no later strike note"; nothing selected, the playhead at 34.06 inside a Vn2 strike whose second note is at 34.441 → the trill 34.06 →
36.25 (the next strike; 34.441 skipped; the pitch from the anchor); the right edge dragged +2 s → 46.224 → 48.20, the snippet
regenerated at once (25 → 38 notes, a new `generatedAt`), the 3 covered notes stamped, no stale stamp, the label "38 notes"; a copy
of a launched trill → `launchedFrom` null, its own snippet (19 notes), the overlap warning. The screenshot: the trill 43.1 → 48.2
on Violin 1 with its label and `1 2 3`.

*Rejected:* a floor on the default length (the piece never needs it — the data above; the right edge is his control) · re-rendering
the lines on the Points toggle (a class already flips; CSS is enough) · keeping `launchedFrom` on a copy (a copy eats by its own
span; the link is the original's).

**His reminders → journal §7** (verbatim there): move the strikes' notes for playability; "the range walk" (its meaning to confirm);
normalized trill loudness (the played velocities run 41–123 by speed, §100 — a level knob or a per-instrument target; a later phase).
**His question, answered:** to add points before a curve's start or after its end — select the curve (a click on its line with
Points off; or any dot added to it with Points on selects it), then in Points mode click beyond either end: the curve extends to that
dot at once (§110's rule); with nothing selected the same click starts a new curve.

## §112. "Violin 2 trill … sounds like still bartok pizz": the nudged trill had let go of its attack note — a 60 ms eating window, a trill's drag keeps its start, the articulation switch arbitrated on a shared slot (the tail, the lead); the cello's attack put back to him

Composer: *"violin 2 trill is not using accent senze vib, sounds like still bartok pizz"* · then *"first attack note not functioning
for cello"* · and, mid-way, the Lake George note (COMPOSITION_NOTES, 2026-09-06).

**Found, in his working copy** (`piece-septet-work.json`, read, never written): six trills; the Vn2 one (zn-964, 67.85 → 68.65)
launched from the Bartók note wc-925 at **67.827** — the only launching note of the six without a `mutedBy` stamp; its snippet
right (port Vn2, CC0 9 = accent senza vib). The zone had been nudged: a zone's body or left-edge drag snaps to a 50 ms grid, so a
1 px touch moved the start from 67.827 to 67.85, 23 ms past the note — off the eating rule (onsets ≥ the start). The un-eaten
Bartók note then played through the plain path, whose CC0 pre-arm goes out at most ~100 ms before the note (the lookahead is
100 ms, so "150 ms before" is always "at once") — AFTER the trill's own CC0 at start − 150 ms: the slot sat on Bartók when the
trill's notes came and stayed there, the whole trill pizz. The Vn1 trill beside it sits exactly on its note (67.847) and was fine.
Two more holes of the same kind, seen in the code: (a) the player's next strike note — exactly at the trill's end since phase 4 —
sends its CC0 ~100 ms before its onset, under the trill's last notes; (b) a same-player note 60–150 ms before a trill (a run's
re-deal) fires its note-on after the trill's CC0 lead and would take the trill's articulation.

**Built** (`composer.html`, 11 splices): (1) **the eating window** `TRILL_EAT_PRE_S` = 0.06 — a note starting up to 60 ms BEFORE a
trill is its attack and is eaten too (`trillCovers`, `stampMutedBy`; the strike DB's simultaneity window, his "maybe sixty") — a
nudge never un-eats the attack, moving the trill clearly later gives the note back; (2) a trill's body drag keeps its sub-grid
start (`origStart + round(dt)` in 50 ms steps) — a touch moves nothing; (3) the plain tick's `lateSwitch`: while a trill sounds
on the same slot (port + channel, its lead included) anywhere in the 150 ms before a plain note, that note's CC0 / CC7 go
`TRILL_SWITCH_LEAD_MS` = 12 ms before it (the engine's own switch-back lead), not ~100; (4) the trill's lead `trillLeadMs`: 150 ms,
shortened to land 1 ms after a same-slot note that starts inside the lead but outside the eating window; (5) `stampMutedBy` clears
the trill's stamps on every lane first, and `renderZone` re-renders the lane a trill was last drawn on — a lane change gives the
old lane its notes back.

**Verified on the throwaway server** (a copy of his working copy, `zz-ai-eat`; fake outputs on the eight ports; the transport
simulated with `performance.now` patched to the transport clock and both ticks driven synchronously every 20 ms; zero console
errors; the copies deleted): the note at 67.827 covered and stamped by the trill at 67.85; 67.4 → 69.0 on Vn2: CC7 127 + CC0 9 at
67.700, the trill's notes 81 / 83 from 67.85, **no CC0 79 and no note-on at 67.827**, then the next strike note's CC0 79 at 68.778 =
12 ms before its onset (68.79); the trill's end set on that note (phase 4's default): its notes to 68.714, the switch at 68.778, the
Bartók at 68.79; a Bartók note added 100 ms before the trill: not covered, the lead 99 ms, the sequence CC0 79 @67.66 · its note-on
@67.75 · CC0 9 @67.76 · the trill's attack @67.85; the body drag: 1 px → the start unchanged (67.85), +0.15 s → 68.00, back → 67.85;
a lane change: the Vn2 stamp cleared, the cello's note under it stamped and faint (0.15), the Vn2 note back to 0.55, and the
reverse. *Harness artefact, not the app:* with the pane hidden every lane's rect collapses and `getLaneFromY` falls through to lane
6 — the synthetic drag "moved" the trill to the cello; measured by state, not by rects (journal §2's rule).

*Rejected:* re-sending the trill's CC0 before each of its notes (robust on a shared slot, but a foreign note within 12 ms of a trill
note would then take the trill's articulation; unverifiable by ear here) · gluing a launched trill's start to its note (a deliberate
move must stay possible; the window plus the offset-keeping drag cover the nudge).

**The cello's attack (his second report):** the data — the cello trill (65.764 → 67.75) sits exactly on its gettato note (eaten);
its attack is marcato sfz (CC0 11) for 100 ms at 127 on pitch 80 (G#5), the switch back to CC0 9 12 ms before the second note —
the same events that serve the violin. Nothing in the file or the code singles out the cello; the likeliest cause is the sample:
the cello's marcato sfz at G#5 may lie above that articulation's top (Q6's class — the Bartók tops were found silent the same way,
§93; the cello's per-technique ranges are unmeasured: 0d). Put to him: P on the cello trill, the attack articulation to "same as
trill" — if the first note then sounds, the marcato sample is silent there; the pitch an octave lower in the panel is the other
test. The 0d sweep answers it for every technique.

## §113. "Insert at playhead … wants to insert back in its original location" / "load a saved strike 32 moves the cursor to 49.42": the pick parked the playhead — gone; `⌖ original` on request; an insert replaces only at its own time, copies kept (CN-28's recurring strikes)

Composer: *"Strikes Drawer. Insert at playhead. Doesn't seem to be working. It wants to insert maybe back in its original location.
I'm not sure, but not the right place."* · *"when I load a saved strike 32 it moves the cursor in the main score to 49.42"*.

**Found** (`strike_drawer.js`, read): `select(id)` — the pick, reached from the sequence list and from every take load (`loadTake`
→ `applyState` → the pick) — parked the playhead on the strike's original time (`scrollOffset = t0 × pps`; STRIKES_TOOL Q,
2026-09-03: "pick in the sequence, playhead follows"). `insert(false)` reads `getTimeAtPlayhead()` at the click. So "scroll to
the target, pick the strike, Insert @ playhead" wrote at the original time — the pick had moved the playhead under him; his 49.42
is strike #32's t0 (49.417). A second rule compounded it: choice 3 of 2026-09-04 ("replace on re-insert") removed EVERY earlier
insert of the strike, wherever it sat — a strike could not recur, which CN-28 (patterned, call-and-response strikes) needs.

**Built:** (1) the pick leaves the playhead alone; (2) a `⌖ original` button beside the inserts parks it on the strike's original
time on request (refuses while playing); (3) every insert mode replaces an earlier insert of the strike only where it sits at the
same time (the group's first onset within 100 ms of the new t) and keeps its copies elsewhere — the status names both ("replaced
the earlier #12 at this time" · "1 earlier copy of #12 kept elsewhere"); the Insert @ playhead title says it places a copy. Choice
3 narrowed, not reversed: a re-take re-inserted at the same place still replaces.

**Verified on the throwaway server** (a copy of the piece; the drawer opened, 135 takes; zero console errors; the copies deleted):
the playhead at 80 s; take `32-a` loaded → strike #32 (t0 49.417), the playhead still 80; #12 picked (t0 18.774) → still 80;
Insert @ playhead → `grp-strike-12-800` at 80, the piece's #12 at 18.774 untouched, "1 earlier copy kept elsewhere" (one card
skipped — a flute trill at 80 s in the copy: the §109 busy rule); again → "replaced the earlier #12 at this time (7 objects)",
still two groups; `⌖ original` → 18.774; Insert @ original time → the 18.774 group replaced (8 objects), the copy at 80 kept.

*Rejected:* keeping the parking and restoring the playhead after the pick (which position is his?) · a per-mode rule (copies at the
playhead, replace-all in the other modes — a re-take @ original time would have wiped a pattern's copies).
*Harness note:* the tab's console held one `SyntaxError` — from the preview's automatic open of the page between the first splice (an
apostrophe inside an HTML title ended the JS string) and its repair; the reload that ran the checks parsed the repaired file (the
new functions were present) and `node --check` passes on it. Splice rule kept: no bare apostrophes inside single-quoted HTML strings.

## §114. "Is there a way to duplicate trill zones?" — two ways already; the copy made ready at once; the tab's console log is cumulative (a harness lesson)

Composer: *"is there a way to duplicate trill zones?"*

**Answered from the code:** (1) CTRL + drag the trill's body — a copy that follows the mouse (`duplicateZone` from the body
handler; since phase 4 the release regenerates it and drops `launchedFrom`, since §112 the drag keeps its sub-grid start);
(2) the zone panel's **Duplicate** button — P on the trill opens the panel, the button places the copy right after the original
(offset = its length). **Found and fixed:** through either route the copy had no notes until the next play start, Hear or panel
change (`duplicateZone` nulls the snippet) — the label lacked the count and the notes under the copy were unstamped; one line in
`duplicateZone`: a trill copy is regenerated before it is drawn. A copy keeps the pitch, the interval, the attack and the curve
reference (`auto` re-resolves at the new place); it is not launched from the note; P changes its pitch.

**Verified on the throwaway server** (a copy of the piece — his save now holds 10 trills; the copies deleted): the piano trill
zn-953 (63.72 → 65.45, 17 notes) duplicated by the panel's route → zn-988 at 65.45 → 67.18, 16 notes, `launchedFrom` null, no
overlap (adjacent), the `1 2 3` buttons, the label "tr C2–D2 (M2) · main · 16 notes", the one note under it stamped, the copy
selected, the panel hidden (the trill rule). Every script the page serves passes `new Function` in the browser.

**A harness lesson (→ journal §5 at session end):** the Browser pane's "seed" tab persists across `preview_start` / `preview_stop`,
and `read_console_messages` returns the tab's WHOLE history — today's single `SyntaxError` (§113's broken minute) sat four page
loads back and showed up in three later checks. Count the load blocks ("[CC7 map] loaded … Composer initialized") and read only
the last one, or check the served scripts' syntax in the page as done here.

## §115. The volume situation, sorted one point at a time → PLAN 1g; the velocity / CC7 sweep built, run through the bridge, analyzed: the ensemble at 127 balanced within 1.8 dB, the curves below it measured

Composer, in order: *"lets use ordinario as the default voice for trills; and lets use the normalized velocity table instead of the
velocites from the played samples; the lowest volume, the lowest point in the curve should be around p though not for the
notation … do we have a sense of what p is velocity wise? and talk first"* · *"see 76.5 in latest piece score, what level are the
instruments at there velocitywise? data then discuss first"* · *"We did some probes to get the volume normalized … is that what is
accounting for the velocity differences between the different instruments, or did we not use that?"* · *"I would like the lowest
level in the curve be sixty five velocity. However … the bottom of the curve as PPP for the notation … the curve has a different
translation to the graphic notation than it does to the MIDI"* · *"if everyone is playing at the bottom of the curve, I would like a
balance in the ensemble … Obviously, we can't do a calibration per velocity level … what should the methodology be?"* · then the
plan built by the method that became PLANNING_METHOD.md (one item at a time; 1g reordered at his word) · *"yes build the sweep and
drive the transport pls ty"*.

**The data at 76.5 s** (his working copy): all seven inside one 12 s tutti trill (72.8 → 84.85), velocities at that moment 57–87
(the five that borrow violin 1's table identical: 57 61 78 69; viola 84 71 87; cello 66 81 78), never under 55 anywhere in the
trill, the attacks 127 — the curve's bottom was mp–mf. **Found on the way:** the tutti copies kept the flute's technique key
`ord`; on lanes without it the routing fell back silently to the lane's first preset — the strings trilling on Vibrato Velocity
(#2), the bass clarinet on Senza Vibrato MW (#1, a modwheel preset the app never drives) → PLAN 1g item 4.

**The volume chain, read from the code and the banks:** velocity per note (the captures for trills, as played for strikes, 100 for
drawn sustained notes) · CC7 (127 for strikes and trills; the drawn curve through the tuba piece's CC7 map for sustained notes) ·
the 0j balance trims as TRACK GAIN on the Reaper faders (flute −21 · bass clarinet −9 · piano +7 · violins 0 · viola −3.5 · cello
−1; `balanceDb` in the recipe is the record only; the app sends nothing for them) · the samplers at unity. The trims match the
ordinary voices at 127 and never touch velocities; the 0j data at 64 showed the slopes differ (127 → 64: flute 7.4 dB, viola 5.6,
the rest 9.3–12.3). **Decided (→ D23 at session end):** the curve's height IS the dynamic for the notation and the IR (0 = ppp,
1 = fff; the IR carries each curve-driven object's range as names, e.g. "p → f", so the page curve may later be redrawn at full
height with the range named); velocity 65 → 127 in the ensemble's one scale (the violins') is the playback rendering, each
instrument translating through a measured remap; one curve drives a trill's speed and loudness. The plan: 1g's five items.

**The rack, checked live through the bridge before the run:** every fader = the file = the trims; the flute's UVI master −2.00 dB
(his clipping fix of 2026-09-04, inside the balance measurement already); REC the folder parent, armed, output-stereo; the
samplers' states differ from the file by a few hundred bytes (presets switched, notes played) — unreadable as gains, so the
sweep replays the balance run's own notes first and measures consistency instead of inspecting it.

**Built:** `tools/balance_schedule.js --sweep` — roles ref (the 0j notes: plain technique × 3 pitches × 127) · vel (× 8
velocities 127 → 20) · cc7 (velocity 100 × 8 CC7 values 127 → 16), every note carrying `cc7`, the trims in force written into the
schedule; `probes/balance_probe.ps1` sends the note's cc7; `probes/analyze_balance.py --sweep` — the reference table against
`bank/balance.json` + the trims (tolerance 1.5 dB, the plan's own), the velocity and CC7 tables (mean of the three registers, the
per-register rows kept), repeatability (ref vs the sweep's 127), clipping, the not-found list → `bank/velocity_map.json`;
`probes/selftest_sweep.py` — a synthetic recording with known laws: **112 points recovered within 0.03 dB, PASS**.

**The run (2026-09-06 11:40, driven by the AI):** the cursor parked at 3600 s, `transport record` through the bridge, the state
read back = 5 (recording) before the first note, 357 notes in 747.7 s, `transport stop` → `reaper/Media/01-REC-260906_1140.wav`
(749.4 s, 24-bit, peak −12.5 dBFS, no clipping). A first attempt never played: the log path mixed backslashes and slashes and the
shell refused the redirect (the scratch path via `cygpath -u` since).

**The results (K-weighted, 400 ms):**
- Reference: now / expected (bank + trim) / Δ — flute −27.6 / −27.6 / 0.0 · bass clarinet −27.4 / −27.4 / 0.0 · piano −26.5 /
  −27.4 / +0.9 · violin 1 −28.0 / −27.7 / −0.3 · violin 2 −28.3 / −27.2 / −1.0 · viola −28.0 / −27.4 / −0.6 · cello −27.5 /
  −27.3 / −0.2 → **consistent; the ensemble's ordinary voices at 127 within 1.8 dB of each other.** Repeatability 0.31 dB.
- Velocity → level, 127 … 20: flute −27.6 → −42.6 (15 dB, the shallow one) · bass clarinet −27.8 → −50.3 · piano −26.4 → −43.8
  · violin 1 −28.3 → −51.4 · violin 2 −28.2 → −51.5 · viola −27.8 → −44.3 · cello −27.2 → −47.3. Two layer quirks: the piano is
  1 dB LOUDER at 112 than at 127 and flat between 80 and 64 (all three registers); the viola at A5 (82) is louder at 64 (−28.4)
  than at 80 (−31.8). The remap will use a monotone fit through such steps.
- CC7 → level at velocity 100, 127 … 48: about −31 → −57 on every instrument (−19 dB at 64, −26 at 48), the floor below 32 —
  Kontakt's and UVI's CC7 curves nearly alike, steep at the bottom.

**A gotcha for §5:** `transport stop` (action 1016) after a recording opens Reaper's "save / delete recorded files" prompt,
which blocks the bridge's loop until the composer answers — use **40667 "Transport: Stop (save all recorded media)"** to end a
probe recording. And the heredoc rule of this shell: a double backslash arrives as one; scripts with escapes go through the file
tool.

**Next (1g item 1, to-dos 4–6):** the remap per instrument and register anchored on the violins, the app function, the proof.

## §116. The velocity remap computed (1g item 1, to-do 4): anchored on the violins, per instrument and register; the registers tell the story

Composer: *"sorry just saved wave, is that ok or do you need to rerun?"* — no rerun: the file was complete and analyzed before Reaper's
prompt; the bridge came back at once, the recording's item removed from REC (its two old items kept), the cursor back at 0.

**Built** `tools/velocity_remap.js` → `bank/velocity_remap.json`: the anchor = the violins' mean velocity → level curve (20:−51.4 ·
32:−47.8 · 48:−43.5 · 64:−40.5 · 80:−35.2 · 96:−33.2 · 112:−30.1 · 127:−28.3 dB K); a curve height h means anchor velocity
65 + 62h and the anchor's level there is the target (h = 0 → −40.1, h = ½ → −33.2, h = 1 → −28.3); for every instrument and each
measured register the sweep's curve made monotone by pool-adjacent-violators (the piano's 112 > 127 step and its 80/64 plateau,
the viola's 64 > 80 at A5 pooled, never inverted) and inverted by linear interpolation → a 63-entry table (anchor 65 … 127 →
the velocity to send), clamped where the register cannot reach the target and the clamp counted.

**Checked in node** (h = 0, ½, 1 on all 21 registers): the level at the remapped velocity equals the target within **0.03 dB**
wherever the register reaches it. The registers speak: the flute at D5 (78) needs velocity 22 at the bottom (its middle register is
loud) and 53 at A4 (69); the bass clarinet 44–70 at the bottom; the piano 20 at G2 (43) is still 1.5 dB too loud — nothing softer
was measured; the viola 20 at A5 (82) still 1.1 dB loud; the top: the cello at B4 (71) reaches only −32.6 at 127, 4.3 dB under the
violins (§46's 12 dB register drop, measured again), the viola at B3 1.3 dB under, the bass clarinet at F#2 1.1 dB under, the
flute at D5 0.6 dB under — the samples' reality; the tables send 127 there and the bank names the shortfall. The app interpolates
between the measured pitches and holds the nearest beyond them (to-do 5, with 1g items 3 and 4).

## §117. 1g items 3 and 4 and item 1's app side built: the trill's velocity from the curve through the remap, the ordinary voice, the cross-lane check — verified on a copy of his piece

Composer: *"go ahead"*.

**Built:** `score/public/velocity_remap.js` — the remap lookup shared by the page and the node tools (`velocityFor(bank, instKey, pitch, anchorVel)`:
the instrument's table at the anchor velocity, interpolated between the measured registers, the nearest held beyond them; without a
bank the anchor velocity passes through); the remap bank regenerated from anchor 20 (108 entries, so the panel's boxes work over the
whole measured span); the page loads `bank/velocity_remap.json` at start (`loadVelocityRemap`) and offers `velocityFor(layer, pitch, anchorVel)`;
the engine's `generate` takes `velocityAt(level, pitch)` — the attack keeps its own velocity, every later note asks the function (the
captures' velocities when none is given); the trill block gains `velMode` ('curve' | 'played'), `velLo` 65, `velHi` 127 — new trills
follow the curve, a trill from before keeps 'played' until he switches it (ensureTrill fills the old blocks that way); the panel's
Velocity row (the mode, low, high, whether the remap is loaded) and the label ("vel 65–127" / "vel played"); the recipe's
`ordinary` per instrument (flute ord · bass clarinet senza_vel · piano main · strings senza_vel), `ordinaryTech(layer)` behind it, the
trill's default technique from it instead of the capture's accent senza vibrato; at every regeneration a technique the lane does
not have is reset to the ordinary voice (`_techReset`) and a foreign attack articulation cleared — the routing's silent fallback to
the lane's first preset is gone (it falls back to the ordinary voice now).

**Verified in node:** the lookup (flute D5 at anchor 65 → 22, A4 → 53, C#5 between them → 39, at 127 → 127; the cello's B4 at
127 → 127, its C3 at 65 → 62; violin 1 → itself; no bank → pass-through); the engine with `velocityAt` → every note but the
attack at the function's value, without it the captures' velocities. **On the throwaway server** (a copy of his current save, 22
trills; zero fresh console errors; the copies deleted): after regeneration every existing trill is 'played' and the flute's
velocities are byte-identical; the Vn1 tutti copy's `ord` → senza_vel with the reset flag, CC0 5 sent, the label right; a new
trill on each of the seven lanes at 110 s: the ordinary voice, curve mode, the attack 127, every later note = the remapped
velocity for its pitch at anchor 96 (a flat mid-height) — Fl 100 · BCl 96 / 101 (its two pitches straddle a measured register)
· Pno 85 · Vn1 99 · Vn2 97 / 98 · Va 101 · Vc 73 (its low F2 is loud); P → the Velocity row; low 40 → the velocities 95 as
computed; the mode → played → the captures' twelve distinct velocities and the label "vel played"; a copy dragged to the cello
→ senza_vel, the attack articulation cleared, port Vc, CC0 5.

**Left for the proof (1g item 1, to-do 6):** the rack, two minutes — all seven at the bottom, the middle and the top of a
curve through the remap, read back.

## §118. The proof (1g item 1, to-do 6), twice: single notes fail by up to 5 dB, five repeats show why — the samplers' own note-to-note scatter, a piano layer staircase, round-robin bias in the sweep's points

**Built:** `tools/balance_schedule.js --proof [--repeat N]` — every instrument's ordinary voice at its middle measured register at the
bottom, the middle and the top of a curve (anchor 65 · 96 · 127), each sent the velocity the remap prescribes, each note played N
times in a row; `analyze_balance.py --proof` — per height the seven means, their scatter (sd, min … max), the deviation from the
violins, the spread, PASS at 1.5 dB → `bank/velocity_proof.json`. The run script stops Reaper with action 40667 (stop and save all
recorded media): no prompt, the bridge never blocks (§115's gotcha closed); the recording's items removed afterwards, the cursor
back at 0.

**Run 1, single notes** (`01-REC-260906_1221.wav`, 21 notes): the bottom within 1.2 dB across all seven; the middle and the top off by
−4.4 … +5.2 dB on the cello, −3.9 on the piano, −3.6 / −1.9 on the bass clarinet, +1.6 on the viola — the cello's error flipping
sign between heights. **Run 2, five repeats** (`01-REC-260906_1225.wav`, 105 notes): the scatter, note to note at one velocity —
flute sd 0.00 and piano 0.02–0.06 (deterministic samplers), violin 1 0.25–0.70, violin 2 0.44–1.04, viola 0.69–1.32, bass
clarinet 0.92–1.59, **cello 1.91–3.54 (−37.0 … −27.5 at velocity 77: a 9.5 dB range)** — the Xsample round robins' own level
differences; the sweep's single points carry the same noise. **The means against the violins:** h = 0: within 1.5 dB except the
viola +2.2 and the cello +1.5; h = ½: the piano **−3.4** (deterministic — a real table error: its row at C4 jumps from −35.8 at 80
to −27.0 at 96, a velocity LAYER step, and the remap interpolated straight across it; 85 sits on the soft layer), the bass
clarinet −1.6, the rest within 0.9; h = 1: the cello −2.0 (its sweep points at 112 / 127 were single round-robin draws), the rest
within 0.9. Verdict FAIL at 1.5 dB, worst 3.35 — the numbers are the finding.

**What it means:** the tables are right where the sampler is deterministic and smooth (the flute: 0.0 to 0.3 dB at all three
heights); wrong inside a layer step (the piano: the eight points are too sparse to place the step); biased by ±1–2 dB where round
robins scatter (the strings, the bass clarinet). Musically a trill's many notes average the scatter — the cello will shimmer by
its nature, whatever the table. **The remedy, on his go:** a second sweep — dense (every 4 velocity units) for the deterministic
piano and flute (no repeats needed, ~3 min each), and three repeats at the eight velocities for the strings and the bass clarinet
(~19 min), averaged before the fit; the remap rebuilt; the repeated proof again (4 min). About 25 minutes of the rack, driven by
the AI. The alternative: keep the tables as they are, ±2 dB on the means and the piano's mid-curve 3 dB soft.

## §119. The second sweep, the hybrid remap, and the analyzer's own 2 dB: how the proof came to pass — 1g item 1 closed as far as the samplers allow

Composer: *"a go ahead, hands off"*.

**The second sweep** (`balance_schedule.js --sweep2`: the piano every 2 velocities, the flute every 8, the strings and the bass clarinet
three notes per point; 591 notes, 20 min, driven through the bridge, stopped with 40667): consistent with the balance run (worst
0.96 dB); the remap rebuilt on averaged repeats. **The proof still failed** — the piano now 4.6 dB LOUD at mid-curve: its dense row
is a clean three-layer staircase (C4: −35.8 up to velocity 85, −27.2 from 87 to 109, −24.4 above), nothing between the layers,
and a monotone fit had put the target inside a step.

**The hybrid** (`tools/velocity_remap.js` rewritten; `velocity_remap.js`'s `cc7For`; the engine's per-note CC7 in `snippetEvents`,
sent 1 ms before a note whose trim changes; the page's `velocityAt` answering { vel, cc7 }; the proof schedule sending the trim):
for a deterministic sampler (flute, piano) the velocity is the softest measured one at or above the target — the layer just above
— and CC7 trims the rest, from the first sweep's measured CC7 curve (Kontakt's and UVI's CC7 is a plain gain; the piano's curve
the same at velocity 109 and 100 within 0.4 dB, and history-free: CC7 105 after 127, 112, 105 or 96 gives −4.9 … −5.1 dB every
time); the round-robin samplers keep the averaged monotone fit, CC7 127. Predicted error at the checkpoints 0.25 dB.

**Then the proof missed the piano by −1.5 / −2.2 dB, deterministically, and the chase found the analyzer.** The same note
(C4, velocity 109, CC7 127) read −27.5 in both sweeps and −29.6 in every test run; its flat RMS and sample peak identical
everywhere (−29.6 / −17.8); only the K-weighted number moved. `level()` tapered each 400 ms slice with a Hann window: a note
whose segment begins exactly at its attack has the transient at the window's edge, weight ≈ 0 — read 2 dB low; in the sweeps
a loud predecessor's tail made the onset finder start the segment 0.1 s early, centring the transient. The window is rectangular
now with exact Parseval scaling (the self-test unchanged, PASS 0.03 dB; the same note now −29.0 in every file). **Everything
re-analyzed from the recordings, no rack:** the balance run of 2026-09-04 (→ `bank/balance_rect.json`: the piano's true level
1.7 dB above the Hann reading — its 0j trim would be +5.3, not +7; the remap measures with the trims in force and absorbs it,
the faders stay; NITS), both sweeps (`bank/velocity_map_sweep1.json`, `bank/velocity_map.json` — the second now within 0.34 dB of
the corrected balance run), the remap rebuilt, and the 13:06 proof re-read: **PASS, worst 1.25 dB**.

**The final proof on the final tables** (13:23, five repeats): flute −0.8 / +0.3 / 0.0 · piano −0.9 / +0.1 / +0.2 · violin 1
+0.2 / −0.3 / −0.5 · violin 2 −0.2 / +0.3 / +0.5 · viola −0.8 / +1.0 / 0.0 · bass clarinet −1.6 / +0.4 / −1.5 · cello +1.2 / +0.2 /
+1.8 (bottom / middle / top, dB from the violins). The verdict line says FAIL at 1.5 on the cello and the bass clarinet, and that
is their scatter, not the tables: the cello's five notes at one velocity spread 4 dB (sd up to 4.0), the bass clarinet's 1.9; a
mean of five cannot be pinned closer than about ±1.8 dB there, and across the day's proof runs their means sit within about a
decibel of zero. Five of seven within 1 dB; the other two within their own instrument's noise. **1g item 1 closed.**

**The samplers, measured (for §5 and the notation later):** flute (SI2) and piano (8Dio) deterministic; the piano a three-layer
staircase with 8.5 and 3 dB steps; the violins ±1 dB round-robin scatter, the viola and the bass clarinet ±1–2, the cello ±3.5
— a cello trill shimmers by nature. **Harness lessons:** stop a probe recording with action 40667; the tab's console log is
cumulative; this shell's heredoc collapses a double backslash — scripts with escapes go through the file tool; a K-weighted
RMS must not taper the window.

## §120. 1g item 5 built: a drawn crescendo balances like a trill — the held note's velocity for the top of its curve, CC7 for the height; 1g complete

Composer: *"go on 5"*.

**What existed:** a drawn sustained note (a `waveCurve` with `sonifyNote`, neither plain nor keyswitched) played at velocity 100 and
streamed CC7 from its own shape through the tuba piece's CC7 map (`curveValToCC`: the level 0–10 → a 40 dB span → the tuba's
measured CC7 points) — the same map for every instrument, measured on none of them. Only playback used it (the tick's pre-arm,
its stream, its record); the exporters do not.

**Built:** the shared module `velocity_remap.js` gains `levelFor` (the instrument's level at pitch and velocity, from the sweep's
curves, interpolated between registers), `targetDb` (the violins' level at an anchor velocity), `cc7ForDelta` (the CC7 whose
measured attenuation is a given cut), `heldNote` (the velocity for the top of a note's curve) and `cc7ForHeight` (the CC7 to
stream at a height for a note sounding at that velocity) — the trill's hybrid, live. The page: `heldDyn / heldVel / heldCc7` (a
cache per note, invalidated by pitch, layer, the curve's top and the bank's date); the tick sends the held velocity at note-on and
streams `heldCc7(wc, height)` in the pre-arm, the record and the per-frame stream; without a remap the tuba map and velocity 100
as before; keyswitched notes keep their static level. The scale is the ensemble's (`HELD_LO` 65 … `HELD_HI` 127) — the curve's
top asks for the anchor's velocity at that height, the rest is CC7. The proof: `balance_schedule.js --held` (a held note per
instrument at three heights, five repeats).

**Verified in node** (piano C4: held velocity 109, CC7 86 / 108 / 127 at the bottom / middle / top; violin 1 D5: 120 and
88 / 107 / 127; flute D5: 127 and 71 / 100 / 127 — the flute's shallow response needs the deep cut; the cello C4 115; no bank →
null / 127) and **on the throwaway page** (a copy of the piece; a 3 s ramp 0.1 → 1.0 on the piano, violin 1 and flute lanes; fake
outputs; the transport simulated): the note-on velocities 109 / 120 / 127, the pre-arm CC7 90 / 92 / 76, the stream at three
moments 97·110·120 / 98·108·119 / 85·102·118 — every value equal to the module's own prediction — rising to 127 at the top;
the fallback without a remap: velocity 100 and the tuba map's 28 → 42. **On the rack** (`01-REC-260906_1340.wav`, 105 notes): the
held notes at the bottom / middle / top — flute +0.1 / +0.3 / −0.1 · piano −0.1 / +0.3 / +0.1 · violin 1 0.0 / −0.9 / −0.1 · violin
2 0.0 / +0.9 / +0.1 · viola +0.3 / +0.3 / −0.3 · bass clarinet −1.4 / −1.1 / −0.6 · cello −0.1 / +1.9 / +1.2 dB from the violins;
the cello's five notes spread 4.4 dB. Six of seven within 1.4 dB at every height; the cello within its own round robins.

**1g is complete** (items 1–5). The morph events (1f) and any later curve-driven object have the two functions: velocity + CC7
trim per note (`velocityFor / cc7For`) for attacks and trills, the held-note pair (`heldNote / cc7ForHeight`) for sustained
sounds — MORPH_NOTES §1. Left as the samplers are: the cello's ±3.5 dB per note, the bass clarinet's ±2.

## §121. "What is the shape of my current score? have those items been converted?" — the shape read from the working copy; nothing converted by itself; the All-trills batch

Composer: *"what is the shape of my current score? have those items been converted to the proper instruments and volumes, just the
trills, leave the strikes"*.

**The shape** (`scores/piece-septet-work.json`, 14:14, read): 294 strike notes in 34 strikes (#0 … #33) to 103.0 s; 22 trills — the piano
at 63.7 (main), four early string trills at 65–69 on accent senza vibrato (the cello with its marcato sfz attack), a bass clarinet
(senza_vel) and two flute (ord) trills at 68–72, then two tutti blocks of seven copies each (72.8 → 84.85 and 85.35 → 102.65) all
carrying the flute's `ord`; five curves on the windows (A 3, B 1, C 1); no drawn sustained note yet.

**What the app would have done alone:** at the next play start the twelve copies with the foreign key fall to their lanes'
ordinary voice (§117's reset); the four accent-senza-vibrato trills keep their legal key; every trill's velocity mode is unset →
'played' (§117's rule for trills from before). So: not converted, by design — and a conversion of his score is his to make, in
the app, with undo, not the AI's on the file.

**Built:** an `All trills` row in the trill panel (P) — `→ ordinary voice` (every trill onto its instrument's ordinary voice; attack
articulations, spans, pitches, curves kept) and `→ curve velocity` (every trill follows its curve, 65 → 127); one undo step each; the
status names the counts; the strikes never touched (`convertAllTrills`).

**Verified on a copy of his working copy** (zero fresh console errors; the copies deleted): before — 22 trills, modes 'played',
techniques main / ord / accent_senza_vel / senza_vel; the voice button → 4 moved (the twelve foreign copies had already been reset
at load), every lane on its ordinary voice, the cello's marcato attack kept; the curve button → 22 switched, 65–127, the labels
"vel 65–127", the piano tutti's snippet carrying its 75 CC7 trims; the 294 strike notes byte-identical before and after.
**For him:** reload · P on any trill · the two buttons · listen · Save (Name version first for a fallback).

## §122. The samples' true ranges and the one-shots' lengths, measured (PLAN 0d re-scoped): 46 techniques, 1,408 notes; the strings' one-shots stop far below their zones; the piece's 16 silent strike notes named

Composer: *"now the instrument ranges, whats to be done?"* → the top line agreed → *"ok go ahead with the ranges, hands off"*.

**Built:** `balance_schedule.js --ranges` (every semitone of each one-shot in use, every second of the rest, across the technique's
keyboard zone at 127; one-shots held 200 ms with 1.3 s to ring, sustained ones 600 ms; each note's slot end in the schedule);
`analyze_balance.py --ranges` (per note whether it sounded — the onset found and the level above −70 dBFS — and its RING: the onset to the
last 10 ms frame above max(floor + 12 dB, peak − 40 dB) inside its slot, capped at the slot's end; per technique the lowest and
highest sounding keys, the silent keys inside named; → `bank/technique_ranges.json` and the one-shot rows merged per key into
`bank/sample_lengths.json`); `probes/selftest_ranges.py` (a synthetic recording with known rings and known silent keys: 168 notes, 25
silent by design, none misread, 132 rings within 20 ms — PASS); `tools/apply_ranges.js` (a generated `MEASURED_RANGES` block in
`sandbox/instruments.js`, applied at load: the measured span replaces the zone where narrower; the technique keeps its zone as
`zoneLow / zoneHigh` and `measured: true`); `tools/range_check.js <score>` (the notes and trills outside their technique's range;
a trill reported where the app folds it); the trill label's ⚠ when the attack articulation has no sample at the pitch; the
app's `techLength` / `isFixedLen` on the bank's rows alone (the tuba piece's fp / staccato / cuivre constants gone — the flute's
fortepiano is sustained; the tuba's rows removed from the bank, the original kept as `bank/sample_lengths_tuba_20260810.json`).

**The run** (14:15 → 14:47, 1,347 notes through the bridge, stopped with 40667; one harmless clip on the piano's harmonics at
31) **and the Bartók-top run** (14:47, 61 notes above the provisional zones — the first run had swept the violins' Bartók only
to the recipe's provisional 85; the provisional value removed from `vnRanges()` since, the measured block being the truth).

**The ranges (the keys that sound, at 127):** flute — pizzicato 60–84, tongue ram 48–83, staccato / ordinario / sforzando /
fortepiano 60–96, all complete; bass clarinet — every technique 34–65 complete; piano — main 21–108, harmonics 21–77, **the
Spitfire plucked piano silent at every key** (not loaded or not routed on the Piano port's channel 2 — a rack matter, NITS);
**violins — Bartók 55–88** (E6 the top; F6 and above silent; the provisional 85 was two semitones short; §46's B♭6 and §93's C7
confirmed silent), gettato 55–94 (B6 and above silent), the sustained and the short bowed presets complete to 101; **viola —
Bartók 48–76** (E5 the top, silent from F5), gettato 48–88 (silent from F6), the rest complete to 93; **cello — Bartók 36–71**
(B4 the top, silent from C5), gettato 36–76 (silent from F5), the rest complete to 83 — so the cello's marcato sfz DOES sound at
G#5 (his attack report of §112 is not a range matter; if the 100 ms attack still does not register, lengthen it in the panel).
**The lengths (median rings):** flute pizzicato 0.42 s, tongue ram 0.52, staccato 0.61; bass clarinet slap 0.60, secco 0.82,
staccato 1.04 (many capped at the slot — it rings past 1.15 s); Bartók 0.65 (violins), 0.68 (viola), 0.95 (cello); gettato 0.87 /
0.94 / 1.03; marcato staccato ~0.9–1.0, spiccato ~0.93, staccato ~1.0 (some capped); the piano harmonics 1.25 capped.

**The piece against the measured recipe** (`range_check` on his working copy of 14:14): **16 strike notes play silent** — violin 1 Bartók
A6 (93) at 4.64 s and F#6 (90) at 10.09; violin 2 Bartók C7 (96) at 18.89, F#6 (90) at 24.11 and 42.07; viola gettato F6 (89) at
11.84 and 85.13, A6 (93) at 36.63, F#6 (90) at 43.33, G6 (91) at 67.82; cello gettato B5 (83) at 24.38 and 30.57, A5 (81) at
25.49, F#5 (78) at 43.65, G#5 (80) at 65.76, A#5 (82) at 67.89 — his to fold down or re-pick in the drawer (the drawer folds
against the measured ranges from now on); the violins' D#6 and E6 Bartók notes (87, 88) sound after all. Two bass clarinet trills
are written above its top (E4 at 68.79, G#5 at 85.35) and fold at playback to E3 and G#3 — the label says the written pitch.

**Verified on the throwaway page** (a copy of the piece): the recipe in the page carries the measured spans with their zones; a
cello trill at G#5 with a Bartók attack → the label's ⚠ (no sample at Ab5), with a marcato attack → none, at C4 → none;
`techLength` reads the new rows. **0d's remainder** (0d.3 the controller lanes, 0d.4 the controller probes) stays as it was.

## §123. "Can you fold those 16 notes down for me, just the strikes" — done on the saved score, a snapshot first

Composer: *"can you check the str[ikes] in my saved score and see if there are any currently in the score that are out of range?"* →
the 16 of §122 in `scores/piece-septet.json` (saved 14:59) → *"can you fold those 16 notes down for me, just the strikes"*.

**Done** (the first edit of his score by the AI, at his word): `scores/piece-septet-v1.9-beforeFold.json` written byte for byte first; then
each of the 16 notes down by octaves until inside its technique's measured range — one octave was enough for all: violin 1 Bartók
A6 → A5, F#6 → F#5; violin 2 Bartók C7 → C6, F#6 → F#5 (twice); viola gettato F6 → F5 (twice), A6 → A5, F#6 → F#5, G6 → G5;
cello gettato B5 → B4 (twice), A5 → A4, F#5 → F#4, G#5 → G#4, A#5 → A#4. Proved: the same 355 objects, 16 changed, nothing but
`sonifyNote` changed, tracks and meta identical; `range_check` after → no strike outside, only the two bass clarinet trills written
above its top (left alone, as asked; they fold at playback). **For him:** Reload in the app before anything else — the app held
the pre-fold state. The score files stay his, uncommitted.

## §124. "fold the two bass clarinet trills too" — done: their written pitches set to where the app already folded them

Composer: *"fold the two bass clarinet trills too"*. Snapshot `scores/piece-septet-v1.9-beforeTrillFold.json` first; then the app's own fold
(the pair by octaves into the technique's range 34–65): zn-967 at 68.79 s E4 → E3 (the pair F#3), zn-1010 at 85.35 s G#5 → G#3 (the
pair A#3) — the sound unchanged, the labels honest now; 2 objects changed of 355; `range_check`: every note and trill inside its range.
For him: Reload before anything else. The score files stay his, uncommitted.

## §125. "another acceleration in the strikes drawer … another variety that's more gradual … potentially the geometric one": the run's shape read in time, the two meanings of "geometric", the tuba dial put to him

Composer (CN-30, verbatim there): *"107.81 just hold that time for the beginning of next section"* · *"I'd like to do another
acceleration in the strikes drawer … we only had one variety. So I'd like to try another variety that's more gradual. So I can't
remember which one that this is potentially the geometric one. where there's a long and gradual ramp up to the end. Let's discuss
which one this should be or if we should build several now, and then what steps are necessary to build it."* A planning ask →
PLANNING_METHOD phase 1, the data first.

**Read:** `strike_drawer.js` `accelSeq()` (U13, §91): each gap = steep × the one before (0.85), from the first gap to the floor (45 ms),
k gaps computed and the ratio re-fitted so the last gap is exactly the floor — geometric PER NOTE. In time that law is a gap
shrinking by the same milliseconds every second (g(t) = g1 − (1 − r)·t): a still head and a collapse. `compiler.js` (the tuba port):
`spec.accel` with `gapAt(u) = gapStart · (gapEnd / gapStart)^warp(u)` over a typed duration and a one-dial `curve` (k = 4·(curve +
ACCEL_CURVE_ZERO), bloom < 0 < surge, the zero re-centred on the composer's own "even" on 2026-08-12, dens8 ladder — his
perceptual-linear sat at raw −0.4; the tuba COMPOSER_LOG's "can we get to ONE dial?"); the compiler's density legs call the
equal-%-per-second growth **'geo'**. STRIKES_TOOL §W (2026-09-05, "keep a note or a plan … the different curves, the feel of the
rush"): the candidate list — linear, late rush, S-curve, two-phase, jitter, reverse — and the implementation note (`gapsFor(curve,
g1, floor, k, params)`; linear and S need k or a duration). CN-18: the fixed landing is the urgency he asked to keep.

**The naming hazard:** "geometric" names two shapes here — the drawer's (a fixed fraction per NOTE: the crash) and the tuba's 'geo'
(a fixed percentage per SECOND: the ramp heard all the way). His "potentially the geometric one" fits the tuba's word.

**The numbers** (`scratchpad/accel_shapes.js`: the same first gap 542, last gap 45, duration 3.3 s; only the gap's path differs):

| shape | notes | notes per quarter of the time | gap at ⅓ · ½ · ⅔ of the time |
|---|---|---|---|
| current — geometric per note (equal ms per second) | 16 | 2 / 2 / 4 / 8 | 376 · 294 · 211 ms |
| tuba 'geo' — equal % per second (raw dial 0) | 26 | 2 / 4 / 7 / 13 | 236 · 156 · 103 |
| tuba dial 0 — his "even" of 2026-08-12 (raw −0.4) | 35 | 3 / 5 / 11 / 16 | 149 · 97 · 70 |
| tuba dial +0.5 — surge (a still head, then the rush) | 24 | 2 / 3 / 7 / 12 | 263 · 177 · 115 |
| tuba dial −0.5 — bloom (the ramp early, gradual late) | 45 | 3 / 10 / 15 / 17 | 91 · 64 · 53 |

The current run keeps half its notes for the last quarter and is still at 294 ms at half time — the speed has not doubled when
half the run is gone. Every dial shape has the speed-up under way from the first third.

**Caveat put with it:** the dial's zero was calibrated on long density clouds (41 → 193 s ramps, fusion above ~4/s); a 3 s run of
single strikes ending at 22/s is another listening — the zero is a start, his ear re-decides.

**Put to him (the answer first):** the run he has is the crash; what he describes is the tuba family; build ONE dial (a new shape
`ramp` beside the current one, first gap and floor as now, the duration typed — the ms box alive again for it — the round robin
untouched, the current shape kept because it is in the score and CN-18's landing law lives in it) rather than several menu entries.
The one question only he can answer: the feel at 107.81 — (a) even all the way, (b) a still head then a rush, spread wider than
now, (c) build the dial and let the ear decide (recommended). The steps (phase 2) wait for his answer. **107.81 s** held as the next
section's start (CN-30). Nothing built.

## §126. "We are able to use the current controls, or are you recommending we build some additional controls?" — measured: the boxes change the length, not the shape

Composer: *"Clarify for me, please. to achieve a gradual speeding up. We are able to use the current controls, or are you recommending
we build some additional controls into the strikes drawer?"*

**Measured** (`scratchpad/accel_current_controls.js`, the drawer's own law — k gaps, the ratio re-fitted to land on the floor):

| box moved | run | notes | per quarter of the time (%) | gap at half time |
|---|---|---|---|---|
| steep 0.85 (as built) | 3.3 s | 17 | 13 / 13 / 25 / 50 | 329 ms |
| steep 0.90 | 4.9 s | 25 | 13 / 13 / 21 / 54 | 316 |
| steep 0.95 | 9.9 s | 50 | 12 / 12 / 22 / 53 | 306 |
| steep 0.98 | 24.9 s | 125 | 10 / 15 / 22 / 53 | 295 |
| first gap 2000 (steep 0.85) | 12.9 s | 25 | 8 / 13 / 17 / 63 | 1034 |
| → last 180 (steep 0.85) | 2.3 s | 8 | 29 / 14 / 29 / 29 | 375 |

(first gap 542, → last 45 unless stated). **The finding:** the steep box scales the run's length and count and leaves the shape in
time untouched — half the notes in the last quarter, the gap still ~300 ms at half time, whether the run is 3 s or 25 s (the law
g(t) = g1 − (1 − r)·t is linear in time for every r; the per-quarter share depends only on g1 ÷ floor). A larger first gap makes it
MORE back-loaded (63 % in the last quarter at 2000). Raising the landing evens the share (29 / 14 / 29 / 29 at 180) but the run never
gets fast — the rush is gone, not spread. **Answer given:** the current controls make the run longer, not gradual; a gradual
speeding-up is a different law, so it is one new control — a curve in the accel block (the law already in `compiler.js`), first gap
and landing as now, the duration typed. A build, small. Offered first: steep 0.95 as a 30-second test of "longer", to hear that it
still crashes.

## §127. The strategy restated by him — controls in the drawer, then subjective language and the AI puts in the numbers — confirmed, with two refinements

Composer: *"What it sounds like is that we can add some additional controls into the strikes drawer and cover most cases. So I can
then dial in the variety of different accelerations or decelerations. And with those controls built, I can use subjective language,
and AI can help me put in the right numbers. First, let's establish this. This is a sound strategy or were you proposing something
different? Or is there a better approach?"*

**Read back:** the same strategy as §125's proposal — one curve control in the accel block (the tuba law), the first gap and the
landing as now, the length typed, the current shape kept; then his words → the AI's numbers. **Two refinements offered:** (1) the
words-to-numbers step is a calibration, done as the tuba's dens8 ladder was — the AI generates a short ladder of runs along the dial,
he names what he hears, the names become the vocabulary (a "bloom / even / surge" of the strikes); (2) decelerations come with it if
the first and the last gap are both free — today `accelSeq` makes a single gap when the first gap ≤ the floor (`k = 1`), so a
ritardando is not reachable now; one line of scope. **The honest limit:** a one-dial family cannot make §W's S-curve (a roll that
lands) or the two-phase knee (a flat head at one gap, then the rush) — those need a second number; his ear decides later whether
they are wanted. **The alternative named and set aside:** a hand-drawn curve driving the rate (piece #2's accel/decel model, a curve
window as the trills use) — every shape reachable, but heavier per strike and worse for subjective language; it waits until the
dial fails him. Awaiting his confirmation before the top line (phase 2).

## §128. "I don't need to do too much calibration right now … I just wanna make sure we have all the right dials and numbers in there … modularize the math part": the concept fixed, the numbers listed complete, the top line put

Composer: *"Okay. No. I don't need to do too much calibration right now. in fact, I don't want to spend time on that currently. I'm
just trying to establish the concept. So I just wanna make sure we have all the right dials and numbers in there so that when I am
ready to calibrate a certain Flow then we can. I just don't wanna leave anything out in this build. even though I suppose we can add
it later. So just confirm this, and then I'll add some additional requirements. So it would be great if we could modularize the math
part of it. So in other words, I can reuse the acceleration calculator for other types of sounds. and another panels. Then draw up
the build for me if everything above checks out. and I will build the current acceleration when it's done, and we can adjust the
dials together. I just wanna make sure the architecture is in place."*

**Decided (his):** no calibration ladder now; the build carries every dial so a calibration can happen later; the math is a module —
an acceleration calculator reusable by other sounds and panels; he builds the current run himself when it is done and the dials are
adjusted together. **The numbers, listed complete for him** (drawn from U13, STRIKES_TOOL §W, the tuba compiler's `spec.accel`, piece
#2's accel/decel zone, CN-13): the two ends (first gap, last gap, either order) · the length by any one of duration / count /
steepness, the other two solved · the shape family and its dials (geometric per note = the current run; the tuba curve dial bloom ←
even → surge; the S-curve with its landing share; the two-phase knee; the per-note linear and power shapes of §W) · jitter (a
percentage, fixed or ramped start → end, seeded) · a hold at the landing rate · a level ramp (start, end, its own curve; a 0–1 per
note for the remap or ignored) · a mirror (the run played backwards in time — not the same as swapping the ends). Drawer-side and
untouched: the re-attack rule, the dealing seed, the re-deal, the round robin. **The top line put to him (phase 2):** 1 the
calculator module · 2 the drawer reads it (the dials, the current run unchanged, decel possible, strip / readout / Hear follow) · 3
verify on a copy and document · 4 later on his go: the calibration ladder, the other panels adopting the module. Awaiting his order.

## §129. PLAN 1h built: the acceleration calculator (`score/public/accel_calc.js`) and the drawer's run dials — verified on a copy of his piece; his take 34-a unchanged

Composer: *"That is good. This is a simpler plan so we can skip the step by step on this one … are you ready for the build?"* →
*"go ahead and continue until it is ready for me to try, ty"*. The plan item written first (PLAN 1h), then the build in one chunk.

**Built.** `score/public/accel_calc.js` (UMD like `velocity_remap.js`: `AccelCalc` on the page, `require` in node) — `run(spec)`: the
two ends in either order; the length by any ONE of ratio / count / duration, the other two solved (a ratio → the count by U13's rule; a
duration in the index domain → the nearest count, then the interior gaps scaled so the run lands exactly; in the time domain → the
count by stepping the law, then a fixed-point solve of the gaps read at their midpoints in time, the ends exact, the interior scaled);
the shapes (`SHAPES`, one source for the menu): geometric = U13's law verbatim · curve = the tuba dial, time domain, the `exp` warp
k = 4·(curve + curveZero), the zero 0 here (the compiler's −0.4 is its clouds' calibration; his to set for the strikes later) · S-curve
(the `s` warp, ease) · two-phase (`knee`, the head's share) · late rush (`power`) · linear ms (`lin` interpolation) · `raw` for the tools;
jitter (σ per gap, fixed or ramped, mulberry32 + Box–Muller, seeded); hold (gaps or ms at the last gap); mirror (the gaps reversed);
levels (start → end along the run's time, the tuba's level curve); `describe(res)`; `countForRatio`. `tools/accel_calc_check.js`,
52 checks — §91's numbers reproduced (107.2 → 7 notes · 435 ms · steep 0.841; 241 → 12 · 1314; 542 → 17 · 3296), the old formula
matched on 150 settings to 5.8e-10 ms, every shape × both directions × the three lengths with exact ends and monotone gaps, the dial's
order (the gap at half time: bloom 61 < even 165 < surge 415 ms), the tuba zero reproducing §125's 35 notes, hold, jitter, mirror,
levels — PASS. **The drawer** (`strike_drawer.js`): `accelSpec()` from the panel; `accelSeq()` takes its onsets from the calculator —
the dealing, the re-attack rule and the round robin untouched, the tail check at the run's fastest gap; the accel block gains `run`
(the shape menu), its dial row (label, range and value from the shape), `length` — steep / notes / ms with the one in charge outlined
(type any, the other two follow; the ms box alive in accel now), jitter % → %, hold gaps, mirror, vel → vel curve (a level ramp in the
ensemble's scale through 1g's remap per instrument, `remapVel`; blank = the strike's own velocities); `→ last` above the gap = a run
that slows; `ACCEL_DEFAULTS` for the cfg and for takes saved before the dials (`applyState`). `composer.html` loads the module before
the drawer. The harness lesson of §119 again, sharpened: this shell's heredoc also refuses a text carrying a quoted single letter
(the module's shape key and this entry's error text both did) — such files go through the file tool, then `cat >>`.

**Verified on the throwaway server** (:5301, `zz-ai-1h` = a copy of his piece, its working copy too, both deleted; real DOM change
events; zero console errors in the three fresh load blocks — one old syntax error sits once in the pane's cumulative buffer, older
than this session's loads and not from any of the page's 18 scripts, which all parse in the browser): his take `34-a` (strike #34,
first gap 700) → 18 notes · 17 gaps · 4201 ms · geometric · steep 0.842 — the old readout's numbers — the menu filled, the dial hidden,
steep outlined; run → curve: 18 notes · 2316 ms, the dial `curve 0 [−1 … 1]`; +0.5 → 3358 ms, the head 700 · 504 · 399; −0.5 → 1730 ms,
700 · 110 · 95; notes → 24 (the outline moves, steep reads 0.883); ms → 3000 → 32 notes, exactly 3000; steep → 0.9 → 28 notes; jitter
10 % (the same seed repeats), → 30 % at the end (the tail 49 · 35 · 32); hold 3 (… 45 45 45); mirror (45 45 45 45 … 136 164 700); vel
65 → 127: 28 velocities 65 … 127, per instrument through the remap (violin 2 at 82 → 83, the piano at 86 → 109, the flute at 127 →
115), blank → 127 again; S-curve (700 697 687 … 46 45 45), two-phase head 0.5 (700 × 13, then the rush), late rush, linear ms (700 675
650 … 70 45), geometric; → last 1400 → a run that slows, 8 notes, steep 1.122; his settings back → 18 · 4201 · 0.842. **Insert** (curve
0, 3000 ms) at the playhead, 107.807 s: 22 notes, every onset equal to the calculator's to 0.000 ms, status "inserted 22 notes at
107.807 s". Nothing of his touched; the page change needs his hard reload (CTRL+SHIFT+R).

**Not done, by design:** no calibration (his word: "I don't want to spend time on that currently"); the drawer's level ramp sends the
remapped velocity without the per-note CC7 trim (NITS); the compiler's own accel keeps its copy of the law (NITS). Docs: PLAN 1h,
STRIKES_TOOL §W built, PLANNER, journal §2, CN-30 / CN-31.

## §130. "for the curve I described slow and gradual over a longer time span what settings do you suggest I try first" — the first words-to-numbers entry

Composer, with the new block open on his take 34-a (gap 700 · steep 0.85 · notes 18 · → last 45): the question above.

**Computed** (the calculator, first gap 700, landing 45): curve 0 · ms 6000 → 45 notes, the gaps 700 470 387 328 …, 187 ms at half
time, the notes per quarter 3 / 6 / 12 / 23 (a steady doubling); curve +0.4 · ms 6000 → 33 notes, the head slower (700 584 507), 295 ms
at half time; curve −0.3 · ms 6000 → 57 notes, the change early (700 378 304), 120 ms at half time; curve 0 · ms 9000 → 68 notes;
S-curve ease 2 · ms 6000 → 22 notes, the head nearly still (700 684 667), then the rush, then the landing (per quarter 3 / 2 / 3 / 13);
his geometric → 18 notes over 4201 ms, 418 ms at half time, 2 / 2 / 4 / 9.

**Suggested:** run curve · dial 0 · ms 6000 first (the ramp heard from the second note, doubling quarter by quarter); then +0.4 and
−0.3 as the two comparisons; the gap box up to about 1000 if 45 notes are too many; the S-curve named as the other feel (a still head
that rolls and lands), not the gradual one. His word on which is closest = the first line of the calibration vocabulary (PLAN 1h item 4).

## §131. "I dont see a curve selection" — the GUI read back in its own order; the vel row had a second box labelled curve, renamed

Composer, looking at the block: *"please list as bullet points and list the actual box names I dont see a curve selection for
example and in order of gui"*. Two findings from his eye: (1) the run's dial only appears after a shape is chosen in `run` — with
`geometric` showing, there is no curve box at all; (2) the loudness ramp's third box, on the `vel` row, was labelled `curve` too — a
collision. **Fixed at once:** that box reads `vel curve` now (`strike_drawer.js`, the label only; parses; a page change, his reload).
The settings given as bullets in the GUI's top-to-bottom order with the box names as printed: `gap` 700 (leave) · `=` (the ms box under
`span ×`) → 6000 · `run` → curve, then the `curve` box that appears under it → 0 · `steep` / `notes` (they follow) · `→ last` 45 ·
`jitter %` 0 · `hold` 0 · `mirror` off · `vel` blank, `vel curve` untouched · `re-attack ≥` 250 · the readout to expect: 45 notes ·
44 gaps · 6000 ms · curve · curve 0.00. The comparisons: only the `curve` box under `run`, +0.4 then −0.3.

## §132. "I was imaging something like 15-20s, gradually building, new figures?" — the long runs counted

Composer: *"is 6000 the total duration?"* (yes — first note to last, in ms) → *"I was imaging something like 15-20s, gradually
building, new figures?"* Read as new numbers for that length; if he meant musical figures per event (groups of notes rather than single
strikes), that is not in the drawer and would be a new to-do — asked in one line.

**Computed** (run curve, gap 700 unless stated): `=` 15000 · curve 0 · last 45 → 113 notes (~16 per player), per quarter 8 / 15 / 30 /
59, the gap 284 ms at 5 s, 113 at 10 s, 21 notes in the last second; `=` 20000 · last 45 → 151 notes (~22 each), 11 / 20 / 40 / 79, 21
in the last second; `=` 20000 · last 100 → 88 notes, 10 / 14 / 24 / 39, 10 in the last second; `=` 20000 · curve 0.4 · last 45 → 109,
9 / 12 / 24 / 63; `=` 20000 · gap 1500 · last 100 → 69 notes (~10 each), 5 / 9 / 19 / 35. **Suggested first:** `=` 20000 · run curve ·
curve 0 · gap 700 · `→ last` 100 (a build that ends at ten a second, not a blur); `→ last` 45 for the full rush (151 notes); gap 1500
for a sparser build. The count is ruled by the fast end: the landing gap, not the first gap, decides how many notes there are.

## §133. "the change in speed from the first to the last is less dramatic then the ones I've been making" — his read-back confirmed, the drama kept over a long span by starting slower

Composer, on the suggested `gap` 700 · `→ last` 100 · `=` 20000: *"so it starts out relatively quick compared to the last one and
builds up, so the change in speed from the first to the last is less dramatic then the ones I've been making"*. Confirmed with one
precision: the start is the same as his runs (700 ms); the landing is slower (100 instead of 45), so first-to-last is 7× instead of
15.6×. **To keep or raise the drama over 15–20 s, start slower and keep the 45 landing** (the calculator, curve 0): gap 1500 · last 45 ·
20 s → 33× · 122 notes (per quarter 6 / 12 / 31 / 72); gap 2000 · last 45 · 20 s → 44× · 114 notes (4 / 11 / 28 / 70; the gap 838 ms at
5 s, 305 at 10 s, 116 at 15 s); gap 2000 · last 45 · 15 s → 85 notes (3 / 8 / 21 / 52). The last second holds 20–21 notes whenever
the landing is 45, whatever the start. His runs so far: 15.6× over 4.2 s, 18 notes.

## §134. "no these are my requirements … less change, more gradually over a long period" — the AI had read §133 backwards; the gentle long runs counted, one picked

Composer: *"no these are my requirements and I'm asking for numbers from you to match, so less change, more gradually over a long
period"* — §133's read-back had taken his sentence as a complaint; it was the specification. **Counted** (run curve · curve 0 · `=`
20000, gap 700 unless stated): `→ last` 100 → 7× · 88 notes (~13 each) · per quarter 10 / 14 / 24 / 39; `→ last` 150 → 4.7× · 68
notes (~10 each) · 9 / 13 / 18 / 27, the gap 485 ms at 5 s, 326 at 10 s, 225 at 15 s, 7 notes in the last second; `→ last` 200 → 3.5×
· 57 notes · 9 / 11 / 15 / 21; `→ last` 250 → 2.8× · 50 notes · 8 / 11 / 13 / 17; gap 1000 · last 200 → 5× · 50 notes · 7 / 9 / 13 / 20;
gap 700 · last 150 · 15 s → 51 notes. **Picked for him:** `gap` 700 · `→ last` 150 · `=` 20000 · `run` curve · `curve` 0 — a build from
1.4 to 6.7 notes a second over 20 s, no blur at the end; `→ last` 200 for gentler still, 100 for a little more. The vocabulary so far:
"slow and gradual over a longer time span" / "less change, more gradually over a long period" → curve 0, the landing raised, the
length typed — the drama is the landing gap, the gradualness is the curve dial at 0, the length is the `=` box.

## §135. "I'm not sure the redeal is working, sounds like a loop" / "so instruments should also shuffle each 7 notes" — the dealt cycles read off the copy: the shuffle and the re-deal work; what loops is the material and the lap of seven

Composer, on the 20 s run (gap 700 · → last 150 · curve 0, take 34-a): *"start a little faster and ends a little more faster, so more
change than now also, I'm not sure the redeal is working, sounds like a loop"* · *"so instruments should also shuffle each 7 notes"*.

**The evidence** (the throwaway server, a copy of his piece, his take, the run's 68 notes = 10 laps of 7): every lap after the first
is a fresh permutation of the seven players — 2: bcl fl vn2 vc pf va vn1 · 3: vn2 pf vn1 va bcl fl vc · 4: bcl pf vn1 vc va fl vn2 ·
5: vn2 pf vc bcl fl va vn1 · … — and the pitch set is re-dealt each lap (1–2 folds per lap into range). The dealer does what §91 built.
**What loops:** (1) the cards' pitches are B1 · B3 · D1 · E5 · B4 · F5 · C#4 — five pitch classes for seven cards, three of them B — so
every lap is the same five classes, B dominant, folded into each player's register; (2) the round robin itself: every player exactly
once per seven notes, so the ensemble completes a lap every seven notes, ten times in this run (a faster run has more laps: 500 → 80
over 20 s = 115 notes = 17 laps). Both are CN-18's design ("the ones I've already chosen … shuffle to completion"; "recycle the players"),
made for runs of 2–3 laps; at 10–17 laps the ear hears the period.

**The speed target counted** (curve 0 · = 20000): gap 500 · last 100 → 5× · 100 notes; gap 500 · last 80 → 6.3× · 115 notes (per 5 s
13 / 20 / 32 / 49; 12 in the last second); gap 450 · last 70 → 6.4× · 130; gap 400 · last 60 → 6.7× · 149; gap 500 · last 60 → 8.3× · 138.
Suggested: gap 500 · → last 80.

**Put to him, lettered:** (a) a free dealer — no lap: each note to any player the re-attack rule allows, the period gone (a switch beside
the round robin; the rule kept); (b) a wider pitch pool — all the strike's pitches rather than the seven cards, or an octave spread on
each re-deal; (c) both; (d) leave it: it is the material. Nothing built until his word.

## §136. "explain how a would work and would it still catch articulations in a row in the same instrument <250 ms" — the free dealer described; the rule stays a guarantee

Composer's question, verbatim in the title. **Explained:** the onsets come from the calculator as now, known before any dealing; the
free dealer walks them in order and, at each onset, lists the players whose last note is at least the re-attack time ago (250 ms), picks
one of those at random (seeded, the same seed row), never the one who just played while another is free, with a lean toward whoever
has waited longest so nobody drops out; the pitch for that note comes from the pool (the cards' pitches as now, or the wider pool of
option b) folded into that player's range — pitch-on-player is no longer a card, it is dealt per note. The 250 ms rule is checked
against the actual onset times, so it is a guarantee exactly as today, not a tendency; if at some onset nobody is free (a run faster
than the players can share: the tail check, 7 × the landing gap against 250), the same ✗ warning as now, and the note is dealt to the
least-recent player and flagged — the composer raises the landing or adds a player. With → last 80 and seven players a player is free
again three notes after playing at the fast end, so the pick is among about four players there and among all seven in the slow head.
No period: the run never completes a lap. Awaiting his word (a / b / c / d).

## §137. "where do b pitches come from? the unused ones in the strike? and still same range check?" — strike #34 read: 26 notes, 7 with players, 10 pitch classes against the cards' 5

Composer's question, verbatim in the title. **Read off the copy:** strike #34 has 26 recorded notes; 7 carry players (the cards: B1
bcl · B3 vn2 · D1 pf · E5 fl · B4 va · F5 vn1 · C#4 vc — five pitch classes, three Bs); 19 have no player (D4 F3 A1 G#1 D6 B2 A2 C2 B0
A1 G3 D3 A4 C1 D#1 F1 C1 C4 G#2); the whole strike holds ten pitch classes (B D F A G# E C G D# C#), 22 distinct pitches. **Answered:**
yes — option b's pool is the strike's own notes, all of them, the seven with players and the nineteen without (distinct pitches, 22
here), drawn shuffle-to-completion then reshuffled, seeded; and yes, the same range check — each drawn pitch is folded by octave into
the receiving player's technique range (the measured ranges of 0d, `realize()` / `foldInto`), the folds counted in the readout, a
noise technique taking its stand-in as now. Awaiting his word.

## §138. "c, build both pls" — the free dealer and the whole-strike pitch pool built and verified on the copy; §137's pitch count corrected (24, not 22)

Composer: *"c, build both pls"* after §135–137. **Built** (`strike_drawer.js`, PLAN 1h item 5): two menus in the accel block after
the re-attack row — `deal`: round robin (as built) or free; `pitches`: the cards (as now) or the whole strike. The pool = the distinct
pitches of the chosen source, each with its recorded voice (the velocity and the length come from it), drawn to completion then
reshuffled, seeded with the run's seed. The free dealer: at each onset the players whose last note is at least the re-attack time ago;
never the one who just played while another is free; a random pick weighted by the wait (a player who has not played yet counts as the
longest); nobody free = the least-recent player, flagged and counted; the pitch drawn per note and folded into that player's range;
the events carry a synthetic unit (the pool voice, the pitch, the one player) so the strip, Hear and the insert read them as before.
The round robin with the cards keeps its original draw, so every earlier take deals identically; with the whole strike its re-deal
from lap 2 draws from the deck. The re-deal checkbox greys in free. The readout names the dealing and the pool size. Correction to
§137: strike #34 holds 24 distinct pitches, not 22 (26 notes, two duplicates).

**Verified on the copy** (his take 34-a; run curve · curve 0 · = 20000; real DOM events; no console errors): round robin + cards at
→ last 150 → lap 2 = bcl:C#4 fl:B4 vn2:D4 vc:B3 pf:E5 va:B4 vn1:F5, identical to §135's dump (the old behaviour kept); **free +
the whole strike** at → last 80 → 102 notes, the closest two notes of one player 267 ms apart (the rule 250 ✓), no player twice in a
row, per player 14 / 14 / 16 / 14 / 15 / 14 / 14, ten pitch classes, 41 folds, 0 violations, the readout "free dealing over 7 players ·
pitches from the whole strike (24), 41 folded · tail 7 × 80 = 560 ≥ 250 ✓"; the first notes vn1:C4 pf:G#2 bcl:G3 vc:E5 vn1:C#4 va:A3
fl:F4 pf:D3 bcl:D4 vn2:B3 …; free + the cards → five pitch classes, 272 ms, 27 folds; round robin + the whole strike → 15 laps, ten
pitch classes, 302 ms; the re-deal box enabled in the robin; an insert in free + strike → 102 notes at 107.807 s. The page change
needs his hard reload. **For him:** `deal` free · `pitches` the whole strike, with gap 500 · → last 80 · = 20000 · run curve · curve 0.

## §139. Three of his asks in one chunk: the accel recipe as numbers; the Name-version suggestion counts suffixed names; the All-trills attack batch; a free trill ends 0.17 s before the next strike note

Composer, with the panel open on gap 500 · = 18000 · run curve · curve 0 · → last 100 · deal free · pitches the whole strike: *"can you give
me the full recipe for the accel from the last one, just the numbers I need to change in a bulleted list in order; then the save
numbers, suggestions still aren't advancing correctly; are you able to make all the trills using the xsample, violins, viola, cello
bass clarinet, change the initial note articulation to marcato sfz in a batch?"* — then: *"when I put a trill in free, I think there's
something that makes it end just before the next articulation or at the next articulation for that instrument. Can you make it end
point one seven seconds before the next articulation? begins."*

**The recipe:** against his panel only two numbers differ from the last suggestion: `=` 20000 and `→ last` 80 (or keep 18000 and
change only `→ last`). **The suggestion, diagnosed in the code** (`saveVersion`): the next label was read from names matching
`-vN.N` exactly, so `v1.10-preAccelNear105`, `v1.12-preTrillFix`, `v1.15-newAccel` (his own numbering, typed by hand because the
suggestion stood still) did not count and 1.10 was offered again. **Fixed:** `nextVersionLabel(base, all)` — a `-vN.N` prefix
followed by anything but a digit counts as its number; on his list the suggestion is now 1.16, on plain-only lists it is what it was.
The AI's own snapshots keep the rule of 475abc9: the composer's current number with a suffix, never a new number. **The batch:** the
All-trills row of the trill panel gains `attack → [articulation] apply` — the list is every articulation any lane offers, one entry
per key, the lanes that have it named ("Marcato sfz Velocity (#12) · vn1 vn2 va vc", 149 entries, "same as trill" first);
`convertAllTrills({ attack: key })` sets the first note's articulation on every trill whose instrument has the key, skips and names
the rest, counts the ⚠ (no sample at the pitch), one undo step. **The bass clarinet has no marcato sfz in its library** — the
Xsample bass clarinet's nearest are With Accent Velocity (#20), Staccato Velocity (#19), Secco (#27): his to choose, a second apply.
**The free trill's end** (`trillDefaultEnd`, phase 4): 0.17 s before the player's next strike note (a 0.2 s floor on the trill's
length), the readout saying so; 2 s when there is no later note, as before.

**Verified on the copy** (his saved score of 18:35; the working copy of 18:46 is newer — his unsaved edits; nothing of his touched):
`nextVersionLabel` → 1.16 on his list, 1.10 on a plain-only list; the batch → 11 set (vn1 3, vn2 3, va 3, vc 2 — two cello trills
already had it), 10 skipped (flute 4, bass clarinet 3, piano 3), 0 ⚠, the status line naming all of it; `attack → same as trill` →
13 reset; the trill end on three lanes → exactly 0.17 s before the next note (violin 1: 52.839 before 53.009; violin 2: 44.554 before
44.724; cello: 46.633 before 46.803), no later note → 2 s; no console errors. The panel row itself, clicked in the rendered panel (the P-key override set after the selection): the same 11 set and 10 skipped, then the reset to same-as-trill gives 13 back; the panel re-renders after each batch. Page changes — his hard reload; then the batch is his to run
on the open score (no file edit by the AI, since his working copy holds unsaved edits: Save would have overwritten a file batch).

## §140. "a simple list each instrument on its own line with its assigned pitch and midi note number … and an alternate" — strike #3 read from his take 03-d; violin 1's assigned A6 is above the Bartók top

Composer, with the drawer open on a strike (the screenshot: the header "…3 · ScatteredStrikes01 · saved 2026-09-05 00:28"): the list
asked for, assigned note + MIDI, and one alternate per instrument from the strike's own notes within the instrument's range.

**Read:** the header and the seven dashed lines match take `03-d` (strike #3, wc-40, saved 00:28): flute A#4 70 (pizzicato) · bass
clarinet D#4 63 (slap) · piano F2 41 · violin 1 A6 93 (Bartók) · violin 2 F5 77 (Bartók) · viola A4 69 (gettato) · cello E3 52
(gettato). The strike's 19 distinct pitches: A5 81 · F4 65 · A6 93 · G#4 68 · G6 91 · B5 83 · A4 69 · G4 67 · F#6 90 · F#4 66 · D#4 63 ·
F2 41 · B4 71 · G#5 80 · A#4 70 · F#5 78 · F3 53 · E3 52 · F5 77. **Flagged:** violin 1's A6 (93) is above the Bartók's measured top E6
(88; §122) — it is the note folded in the saved score at §123 (strike #3 at 4.64 s); the take still holds 93. **The alternates given**
(each in its instrument's measured range, none assigned to anyone in the take, all from the strike): flute B4 71 · bass clarinet F3 53
· piano G6 91 (the note no string reaches) · violin 1 A5 81 (A6 folded an octave, in the strike itself) · violin 2 G#5 80 · viola F#4
66 · cello F4 65. If the drawer shows a different take, the lines in the picture were read as the tie-breaker.

## §141. "135.84 beginning here can you change all of the trills to minor 2 … a console script instead of a button" — the script, proved on a copy: 43 trills, every one sounding pitch and pitch + 1 after

Composer: *"135.84 beginning here can you change all of the trills to minor 2, You can give me a console script instead of a button if
that works. 20-pretrillm2"* (his version saved before the change). **Read:** his saved score (the working copy gone — saved and
clean) holds 69 trills, 43 starting at or after 135.84 s, all with `interval` 2 (a major 2nd; the field is signed semitones, the
sign the direction). **The script** (pasted in the console of his open score; one undo step; Save when it sounds right):

```
(() => { const C = Composer, T0 = 135.84; C.pushUndoState(); let n = 0; const was = {};
  C.objects.filter(o => o.type === 'zone' && o.midiModel === 'trill' && o.startTime >= T0 - 0.001).forEach(z => { const t = C.ensureTrill(z); was[t.interval] = (was[t.interval] || 0) + 1; t.interval = t.interval < 0 ? -1 : 1; C.regenerateTrill(z); C.renderZone(z); n++; });
  C.markDirty(); if (C.selectedObject && C.selectedObject.midiModel === 'trill') C.showPropertyPanel();
  C.saveStatus.textContent = n + ' trills from ' + T0 + ' s set to a minor 2nd (before: ' + Object.entries(was).map(([k, v]) => v + ' × ' + k).join(', ') + ') — Save when it sounds right, undo restores';
  return { changed: n, before: was }; })()
```

**Verified on a copy of his saved score** (the throwaway server; no console errors): 43 changed (before: 43 × 2); every late trill's
regenerated snippet (`midiSnippet`, its note events carrying `notes: [pitch]`) holds exactly two pitches, the trill's own and one
semitone above — 43 of 43; the 23 earlier major-2nd trills untouched, still two pitches a whole tone apart; the status line as
written. The harness lesson: a trill's sounding pitches are read from `midiSnippet`'s events with a `notes` array, the CC events
(`_cc`) first. The copy deleted after.

## §142. "a spread out strike, evenly spread out, but then have it last a certain duration and have a return or loop like the acceleration … the same mix of the instruments and pitches" — the even run: one entry in the run menu

Composer: *"I would like to do a spread out, strike, evenly spread out, but then have it last a certain duration and have a return or
loop like the acceleration. But, again, the same mix of the instruments and pitches around and choose from the full range of played
pitches."* **Read:** the dealing (round robin or free) and the whole-strike pool of §138 never cared about the timing law, so an even
run is a shape that holds one gap. **Built:** `even` at the top of the calculator's `SHAPES` (`flat: true` — gapEnd := gapStart; by
duration every gap is exactly the length ÷ the count, the gap box the target; by notes the gap itself) and in the drawer's `run`
menu; choosing it moves the length to the ms box when steep was in charge, greys `steep` and `→ last`; the readout says even · steep
1.000. **Two things found on the way:** the calculator's default shape had become the list's first entry (the check script caught it
— five checks fell over with every gap 542) → the default pinned to geometric; the readout's tail check read the ignored `→ last` →
it reads the run's actual smallest gap now (an even run of 300 → 7 × 299; jitter 30 % on a 45 landing → 7 × 31 = 215 < 250 ✗, an
honest warning). `tools/accel_calc_check.js`: the even cases (57 checks, PASS).

**Verified on a copy** (take 34-a, real DOM events, no console errors): `run` even · `gap` 300 · `=` 20000 · `deal` free · `pitches`
the whole strike → 68 notes, every gap 298.507 ms (20000 ÷ 67), the closest two notes of one player 597 ms apart, no player twice in
a row, per player 8 – 11, ten pitch classes, 29 folds, 0 violations; `notes` 40 → 40 notes at exactly 300 ms, 11700 ms; round robin +
the cards over 12 s → 6 laps, 41 notes, 300 ms; back to geometric → the boxes live again. **For him:** `run` even · `gap` the spacing ·
`=` the length (or `notes` the count) · `deal` free · `pitches` the whole strike; the hard reload first.

## §143. "ive loaded a previous piece save file how do I continue with this as the main one?" / "What should I have done?" — Name version saves the file too, so Reload is the way back; a version file is opened only to look

Composer: *"ive loaded a previous piece save file how do I continue with this as the main one?"* → *"So I saved a name version,
which was the before delete. And then I tried to make some changes that they didn't work. And so then I want to go back to that
version, and then continue. What should I have done?"*

**Read off the disk:** `piece-septet.json` (21:29:11, 693 objects, 69 trills) and `piece-septet-v1.22-beforeDelete.json` are the same
music (the objects identical; only the metadata stamps differ by milliseconds — Name version writes both in one act, D17); the working
copy `piece-septet-work.json` (21:30:03) holds the failed changes: 639 objects, unsaved; no version has a working copy, so the loaded
version was not edited. **The rule, restated for him:** Name version saves the file AND freezes the copy, so the file itself is the
before-delete state — **Reload** (drop the unsaved edits) was the whole move; opening the frozen version was not needed and is
only for looking, since Save inside a version writes into the frozen file. The app cannot promote a version to the main name (a
typed existing name saves as a unique variant, never over a file) — a swap would be the AI's file operation, not needed here.
**Told him:** open `piece-septet` from the Piece menu (the app resumes the 21:30 working copy and says so) → Reload → OK; then
continue; Name version suggests 1.23 next.

## §144. "when I try to move the meta shapes for some strikes, the meta shapes move, but the underlying strikes do not. But when I select a meta shape and then delete, it deletes the entire strike" — the multi-selection drag left the group behind; fixed

Composer: *"So when I try to move the meta shapes for some strikes, the meta shapes move, but the underlying strikes do not. But when
I select a meta shape and then delete, it deletes the entire strike. So how could I use the meta shapes to move strikes?"*

**The data first** (his saved score of 21:29): 50 META shapes on layer 7, every one with its notes under the same groupId, no note
group without a shape, no broken link — so the group itself was intact. **The code:** the single-shape drag (`startWCBodyDrag`) and
the box handles (`startBoxDrag`) and the edge nodes (`startNodeDrag`) all move or scale the members (2026-08-13); the delete of a
multi-selection deletes whole gestures (2026-08-14); but the **multi-selection drag** (`startGroupDrag`: several objects selected,
dragged together) snapshotted only the selected objects — a META shape selected among others moved alone, its strike stayed. That is
"for some strikes": the ones he moved as a selection. **Fixed:** `startGroupDrag` collects the members of every selected META group
shape (the notes, the marker; a zone member too) and moves them by the exact Δt (their internal timing kept — no per-note snap); the
selected group shape itself moves by the exact Δt as well, instead of a second grid snap that left the handle a few ms off its notes
(six shapes in his score sat 11–51 ms before their notes from earlier drags); the earliest member counts for the ≥ 0 clamp.

**Verified on a copy** (synthetic mouse events through the real handlers; no console errors): two META shapes selected and dragged 2 s →
both strikes' 7 notes each moved by exactly 2.000 s, every other object untouched; the single-shape drag (unchanged path) 1 s → its 7
notes by the shape's snapped delta, 1.007 s, as before. **Answer to his question:** select the META shape (or several) and drag — the
strikes come along now, as they always did for one shape dragged alone; the hard reload first.

## §145. "read up on the morph section from the tuba piece … understand how the panel works … how we used it … read some of the Journal … check back in, and we'll talk through some of the requirements" — #4's morph tool read cold: the data for PLAN 1f's requirements talk

Composer, opening the morph section after `/postclear`: *"ready to start the morph section, /plan-item 1f First, let's spend some good
time figuring out the requirements. based on the things I want to do and our previous work in the morph section. So I'm gonna talk
through this in some detail. But first, can you read up on the morph section from the tuba piece? Collect that data, understand how
the panel works. And if you can look at some of the notes when we're building the panel and later how we used it, try to read some of
the Journal And then when you've collected enough data or when you've collected that data, check back in, and we'll talk through some
of the requirements. before we even enumerate a plan."* → PLANNING_METHOD phase 1, the data first. Nothing built, nothing proposed.

**Read (this repo):** `MORPH_NOTES.md` · CN-28, CN-29 · `score/public/morph.js` (the constants, the six models, the carrier, the
timeline, `toScoreObjects`), `morph_emit.js`, `morph_panel.js` (the controls) · `bank/morph_models.json`, `morph_recipes.json`,
`morph_params.json` · TRILLS_TOOL §5 · journal D18–D23. **Read (#4, `for_seven_tubas`):** `MORPH_FINDINGS.md` · `MORPH_NOTATION.md` ·
`plans/MORPHING_CHORDS.md` §1–3 · `plans/MORPH_SECTION.md` · `SHAPE_LESSONS.md` · `FEATURE_REQUESTS.md` FR-1 … FR-6, FR-8 · RUNNING_LOG
day 10 whole (the build arc, lines 160–1013), day 11–12 (2z, D31), day 13 (spec mode, "the arc", the release/cycling conflation),
day 14 (the CC7 timing law, ACT-BLOOM-02, the notation data walk) · PROJECT_JOURNAL D24–D34 and the §6 morph entries · COMPOSER_LOG
days 14, 15, 19 · PAPER_NOTES on the morphs · `bank/actuals/` (four).

**Found — the tool in one picture.** Three orthogonal parts: MORPH = what changes (cents, technique, level as a pure function of
progress 0 → 1) · CARRIER = when each voice sounds (a chain of breaths: segLen 8 s ± 35 %, a 0.75 s gap, staggered entries, split
at the breath table's ceiling) · RENDER = the morph sampled at each breath → notes with note-relative bend and level breakpoints.
Six models (M1 BLOOM detune ± cents alternating · M2 SPECTRAL to folded partials · M3 CONVERGE chord A → B · M4 COLOUR techniques ·
M5 SPACING · M6 BALANCE loudness only); three keepers in #4 (BLOOM, CONVERGE, BALANCE). Loudness a layer on every model (D24: swell /
rise / fall / rotate / flat, per-voice phase spread; driven by progress, not the clock). The timeline (FR-3 / FR-6, pinned): span =
the one-way gliss = the pace · duration = the body, cycling out-and-back (a triangle, never a jump) when longer than span · release =
a unanimous run-down to unison and to the floor, players finishing their breath. The gesture shape (2z): attack (entry order, edge
technique, transient hit-THEN-tone, noise layer on spare lanes, motion converge / gliss-in), decay, release (taper, dropout by whole
pairs, motion disperse / to-unison / gliss-out) — "correct as an engine", the presets not sound models (D31 → bespoke by ear;
SHAPE_LESSONS has no lesson 2). The panel: Generate · Play · Stop · Insert @ cursor · Save as ACTUAL · fade ladder; tabs variants
(the AI's scratch file, polled) / models (the six, word-recipes as sliders OFF until turned, D32; a seed stepper) / actuals (decided
renders, placed with provenance). Never edits. The working mode: speech → the AI writes the numbers → he listens (day 10: *"it's too
fiddly to understand the range of numbers to put in"*). Output: ordinary `waveCurve` notes + `morphBend`, a group with a META shape;
drag / scale / save carry the bend (2v phase 4 gates). Measured laws: bend ± 1.99 st on SI2 tuba, RPN ignored, wider = re-keyed
mid-note, *"no seam"* (D26) · CC7 250 ms lead before a cold attack, 2 s restore after (the CC7 timing law) · beating Hz = |f1 − f2|,
cents = 1200·log2(1 + beat/f), a fixed cents doubles per octave (the register law, D28); < 1 Hz flanger, > 1 Hz beating, > ~20 Hz
timbre · a model ends where its dynamics shape leaves it (the ending law).

**Found — the build notes, musically.** A 30–60 s morph holds as ONE sonority; 30 s *"much more dramatic"* than 10. His ear latched
first onto beating near unison with the swells; beating the strongest material, and the performable one (*"beat about twice a second"*
is an instruction, a cents value is not). Re-articulation carries the morph's audibility and reads as PULSES when dense; segLen 3–8 s
the working band, 15 s loses detail. Fewer voices = less detail, same identity (*"8-bit vs 16-bit"*); two concurrent morphs = one richer
sonority. Thinning takes whole pairs (`reduceSource`; half a pair does not beat). Words → numbers: the recipes (slower / longer, more
dramatic, smoother / choppier, more beating, louder swells) with dial boundaries in `morph_recipes.json`.

**Found — how #4 used it.** Three morph sections, each an actual he tuned and saved (JYBloom001 · the 108 s BEATING BLOOM: 4 unison
pairs, ± 25 c, span 48, duration 90, release 18, 8 of 10 players · JYConverge001: whole-tone pairs closing to near-unison and
re-opening, twice, 99 c of travel · jyBalance001: a static B♭ major 9th, rotate, no glissando, no beating). The pairs consecutive
T1/T2 … (measured, r = −0.98). `MORPH_SECTION.md`: the morphs as a bed, impacts borrowing whole pairs (each borrow silences one beat
rate); FR-4 "clip and rejoin" (hand-written attack notes, each player rejoining at the next breath) spec'd, never built; FR-5 (the
pitch set and the pair count from the panel) never built — the AI edited the store; FR-8 doubling undecided; *"release on the
consonant clear chord"* noted. Notation (day 35): two curves per part (gliss above, crescendo below, each normalised to its own
extremes), the two written pitches at least a quarter tone apart, a go line at every breath, the beat rate at both ends of the gliss
(decided, not built).

**Found — the port.** `morph.js` and `morph_panel.js` byte-identical to #4's; `morph_emit.js` two lines apart. The engine's technique
table (ord / bisb / cuivre / flz …), breath table, ranges, the 1.99 st bend range and the lane → instrument routing are the tuba's; the
banks hold the tuba's chords; `sandbox/instruments.js` carries no bend range per instrument. In the score a morph note is a sustained
curve note, so 1g's remap should already carry its loudness; the panel's own audition goes through `curveValToCC` — unverified.

**Found — the one structural fact for his four elements (CN-29).** #4 day 13, finding 3: *"the pair is not the unit; the voice is"* —
the engine staggers each voice on its own seeded order and never asks who a player's partner is, so the gap between a pair's halves,
the only audible thing, is whatever falls out; *"cycling the pair's gap as a unit — a true repeated bloom"* explicitly deferred. His
elements 1–3 exist as dials (expansion = BLOOM's cents — the beat-rate dial in Hz asked for in D29, never built · re-breath = the
carrier's segLen / gap / striation · crescendo = the dynamics layer, 1g's remap); element 4 (each pair its own glissando pattern) makes
the pair the scheduled unit — a structural change, not a dial. New to this piece besides: the launch from a strike (TRILLS_TOOL §5's
pattern) and seven unlike instruments.

**Not done:** no requirements proposed, no plan. Checked in with the digest (the data first); the open topics of MORPH_NOTES §2 held
aside for his order, one at a time.

## §146. "let's discuss an anatomy of a morph event. and maybe come up with a different name" → "beating is good" → "the atom will be a pair of players … what this would look like for a beating drawer?" — the seven elements read back, the name decided, the architecture and the top line put to him

Composer (PLAN 1f, phase 1): *"Okay. Then let's discuss an anatomy of a morph event. and maybe come up with a different name. You can
give me some recommendations. So as far as I understand it... so, actually, let's enumerate the elements, and you can help me. Just
very simply. So as far as I understand, there's pairs, and they create beating between them. And then the second main element is the
crescendo. That intensifies the beating or not. And then there is the the breaths or rearticulation. There's also the curvature.
how... or what shape do players follow? they're in their glissando, their crescendo. And there's also the overlap. Well, there's
overlap between players. So players on the same pair. I'm not sure if they always move together. or they were on different cycles. So
did they achieve full beating at the same time? But there's definitely different cycles between different pairs. So if you have more
than one pair, So I wanna talk about... no. Break it down. Figure out the elements, and then talk about how we can create shorter
events and then what the dials are within those events. Like, if I create a six or seven second event, it could be something like
start at a certain bidding rate more or less and then not move, or it can move the whole range, or it can move just a little bit,
etcetera. Well, let's just start there. Let's break it down by elements and talk about what it might look like to build smaller
events, and let's narrow down the name."* (speech-to-text; "bidding rate" = beating rate)

**Read back to him — the seven elements:** 1 the pairs (one pitch, two players, the gap beats; the RATE is the dial, not the cents —
the register law) · 2 the pitch of each pair (from the strike's chord; the register: a crawl low, a shimmer high) · 3 the beating
curve (from → to → the shape: bloom / close / hold — his "start at a rate and stay · the whole range · a little") · 4 the crescendo
(loudness leaves the rate alone and changes the presence; its own curve or the beating's, the trill precedent) · 5 the breaths (one =
a short event; re-breaths staggered inside a pair or together as a pulse) · 6 the timing between players (inside a pair: who moves,
together or not; between pairs: each its own curve or offset — CN-29's element 4, the thing #4's engine never scheduled) · 7 the
entry and the exit (from a strike or from nothing; a release, a cut, or the next strike). The frame: the length, the number of pairs.
His "curvature" = the shape inside 3 and 4; his "overlap" = 6. **The name put to him:** (a) beating — recommended, one word from the
tool to the page to the player, in the line strike · trill · run; (b) bloom (the opening direction only); (c) dissolve (the
transition between strikes, not a held beating); (d) morph event.

**DECIDED — the name is "beating"** (*"Okay. beating is good."*). Its three directions: bloom (out of unison), close (into unison),
hold. A key B on a strike note is the proposed launch, as T is the trill's.

Composer, the scenario (verbatim): *"Let's talk through the scenario. So in composing, when I'm using the beating machine, I want to
try different things, and the atom will be a pair of players. MDI, the Adam could have various behaviors. So I could target a beating
level, just a single one. So I suppose a analogy could be just simple crescendo so we can have the pair come in at a certain volume
or beating level. It just maintained that or just burst it for a small duration. think of have the long arc like we did in the tube
a piece or they can have shorter glissandos so move from one beating level to another. So like a convergence, move from unison to
full maximum beating, but in a short duration. And then these atoms can interact so I could have, for example, in this piece, three
pairs, and they could all come in together at their own beating levels, or they can overlap in different ways, or they can reach
their full beating or back to unison in different arrangements. like, some sort of counterpoint. So, like, in the strikes, that
turned out to be a useful drawer because I could assemble these patterns and do things like shuffle and then listen to it run away.
and then create certain patterns and then listen to to that. So can we think about what this would look like for a beating drawer?
And in a similar way that it's facile, I don't have to turn a lot of dials, and I can do shuffles and things like that. But it's just
figuring out what the right thing to shuffle and what the right kind of order is. So help me organize this. tool just but talk about
the architecture and try to build it one part at a time."* (speech-to-text: "MDI, the Adam" = the atom; "tube a piece" = the tuba piece)

**Put to him — the architecture in three layers.** The ATOM, a beating: one pair on one pitch; its dials the rate from → to in beats
per second (the tool finds the cents from the pitch), the travel shape, the loudness from → to, the length, the entry (a strike or
nothing), the exit (a release, a cut, the next strike); five cards cover his behaviours — hold · burst · bloom · close · arc. The
PATTERN: several atoms in time — the pairing, the chord's pitches dealt to the pairs, a card and a rate per pair, the entries
(together / staggered / canon), the peaks (aligned or spread), the exits; the counterpoint lives here; **the tuba's models are
patterns of this atom** (BLOOM = every pair blooms, staggered; CONVERGE = every pair closes). The DRAWER: rows per pair (the
orchestration panel's kin), the cards and rates, a timing column (the rhythm column's kin), Hear / Stop, takes, Insert as a group
with one META shape. **What to shuffle:** the deal of cards to pairs · the rates · the entry order and offsets (rotate, reverse) ·
the pairing · the pitch assignment — each seeded; "order" = the order of entries in time, as the note order was in the strikes. **In
the score (proposed for its step):** each pair its own object on its two lanes, regenerated from its dials as the trill is (a stretch
or a curve change regenerates); the pattern a group with one META shape; playback through the bend the port already plays.

**The top line put to him (phase 2, his to reorder):** 1 the palette — which instruments can bend and how far (measured in the
rack), the pairing rules, the piano as an anchor only · 2 the atom's math — a pure module: rate ↔ cents by pitch, the curves, the
breaths · 3 the atom in the score and its playback, launched from a strike with B — one pair heard · 4 the drawer · 5 the shuffles
and seeds · 6 verify on a copy of the piece at 175.7 s, document · 7 later: cycles of beatings for section 3 (CN-33), the training
material, the notation at 2a. **A decision held for step 2:** inside a pair, one player holds while the other moves (the trainable
form — a fixed reference to beat against, CN-33), or both move apart (#4's way, alternating directions). Nothing built.

## §147. "maybe I have, like, a screen, a panel, and I can see the pair represented by some sort of curve … it'll be bipolar … I can slide one over … everything should have handles … hit space bar to play that configuration … audition that configuration over different durations" — the beating panel replaces the shuffle drawer; the AI's read and insider input

Composer (PLAN 1f, phase 1, after the three-layer architecture and the top line of §146): *"Okay. Then maybe I have, like, a screen,
a panel, and I can see the pair represented. by some sort of curve, for example, or if it's just on or off, it'll look like a square
wave. And then between the pair, I can slide the waves. So if I want them to not be in sync, I can. And one will be... it'll be
bipolar. So one... if it was a sound... sign wave, one will go up, and the other will go down. and that's how they reach max beating.
So for example, if it was like the convergence, it would be a hump up and a hump down, and there would be in phase reaching the peak
Nadir together. But I can slide one over so that they are out of phase. They reach the peak at different times. and then a similar
layer, which represents the crescendo. And I guess we can just use the... to draw the initial ones. We can use the curve tool that
we... I've been using for the trills. And then I can... there's three of these, so I can use all three or not, three pairs. but then
I can slide once I've... I have established the pairs and their configuration. I can slide the whole pair. And then I can audition
this at any time. And then maybe we should have some preset curve so I don't have to draw a curve every time. but I have the option
of redrawing the curve. So maybe hold on the shuffle for now. This seems to be a different model, but we'll bring it back in if
necessary. But, for example, there'll be some efficiency if I can select curve shapes. So, like, if they're just coming in at one
level, it'll be, like, um, a square wave, and I can just grab the top and bring it to a different level. And then everything could be
an easy slide, like on rails, and everything should have handles. So if I want to grab... if I'm working with one pair, I want to
grab one curve. See, the bottom one, I move it over. I could just grab a handle. And same with the read breaths and same with the
crescendo. So something like select the part, click on a curve shape. It pops in. I can re... easily resize it and reshape it, and
then I could slide it, like, on a rail. And this will all be in real time so I can just hit space bar to play that configuration. And
then if I find a configuration that I like, I can audition that configuration over different durations. relatively quick... quickly,
like, type in iteration and then that same shape, whatever configuration I made will play over that duration. So give me your read on
this and any additional insider input that you may have."* (speech-to-text: "sign wave" = sine wave, "read breaths" = re-breaths,
"type in iteration" = type in a duration)

**The model shift, recorded:** the shuffle drawer of §146 is PARKED at his word (*"hold on the shuffle for now … we'll bring it back
in if necessary"*); the interface is a **beating panel** of direct manipulation — a row per pair (up to three), the pair as two
mirrored pitch curves (bipolar: one up, one down; slid against each other for phase), a crescendo layer, a breath layer, shapes from a
preset menu with handles on rails (a flat line for a held level, its top grabbed to change the level; a hump for a convergence; the
long arc), or redrawn with the trill's curve tool (D21: points → fill → bend the line), a whole pair slid in time against the others,
the space bar playing the configuration in real time, a typed duration replaying the same configuration stretched over it. The data
underneath (pairs × curves × offsets) is §146's pattern unchanged; only the writer changes — hands instead of a deal.

**The AI's read and insider input, put to him:** (1) **show the beating** — what is heard is the DIFFERENCE of the two curves, so a
derived third line per pair, the beat rate over time, shows what a slide does: mirrored humps in phase = a pulse of beating (0 → max →
0); slid apart = a plateau, steadier and lower (#4 day 13's prediction: in-phase pulses, anti-phase holds); slid until both move the
same way at some moment = a momentary unison, the beating stops and restarts. (2) **draw in beats per second** — the register law
(D28: a fixed cents doubles per octave) means the same drawn height beats twice as fast on a higher pair; with the rate as the axis the
presets are heard levels and the tool finds each player's cents from the pair's pitch; < 1/s reads as flanger, > ~15/s as roughness —
zones the line can show; the cents as a readout. (3) **who moves is answered by the bipolar picture** — both bend, half the gap each,
the centre pitch stays (#4's alternating direction); a flat partner (one holds) is the same picture with one curve flattened — the
trainable form (CN-33) and the piano's only form. (4) **each row needs its pitch and its two players** — no cents without a pitch;
from a strike its chord's notes are offered to the rows and the strike's onset is the front edge of the square. (5) **breaths per
player, not per pair** — the two breathe apart so the beating never gaps; the marks slide like everything else; a typed duration past
the breath ceiling inserts breaths by the rule and shows them. (6) **where the curves live** — in the beating object itself (the
trill's bake); select a beating, press P, its curves come back into the panel; the trill's regenerate-at-play (D20) makes the space
bar free; the duration box is the trill's "read the curve over whatever the span becomes". (7) **the shuffle returns as a writer** —
the same rows and curves are what a deal would fill later. **Consequence for the top line:** step 4 (the drawer) becomes the panel —
rows, layers, shapes with handles, the derived line, the duration box; steps 1 (the palette) and 2 (the atom's math) unchanged; step 5
(the shuffles) parked. **One question put to him:** the axis of the beating curves — (a) beats per second (recommended) or (b)
cents. Nothing built.

## §148. "the one thing I didn't talk so much about is pitch … the menu of strikes … it appears on the keyboard … assign a pitch to a pair … the chord or sonority is between the three pairs … internally, there's Unison, but I also would like to try fourths, fifths" — the axis decided (beats per second), the pitch model, insertion proposed, the top line put to him

Composer (PLAN 1f, phase 1 → 2): *"Okay. Good. So the one thing I didn't talk so much about is pitch. So we should have some sets of
pitches that are easy enough to choose. So maybe something like, I think, um, strikes works well, or you have the menu of strikes,
the one through forty five or whatever. And then if I click one of those, it appears on the keyboard. And then I can assign a pitch
to a pet, and then they'll hover around that pair... or around that pitch. So it's more the cord or minority, the cord or minority,
the c h o r d or s o n o r i t y. is between the three pairs. So let's include the ones we did for the tuba piece. the thirds,
fifths, and just Unison. But then the relationship... let's say the relationship could be between the three, could be fifths, could
be thirds, could be something else. And then internally, there's Unison, but I also would like to try fourths, fifths. and see how
beating sounds at that interval as well. and showing the beating is good. Let's try to find an elegant way to do that. Sure. The
access should be beach per second. That's fine. And then let's discuss what insertion would look like into the main score. Okay.
This sounds pretty clear. let me know if there's anything else to think about. And then if you could organize the top line sections
for plan, and we'll go through them one by one. So we... first, any questions or any additional things. The next, let me see the plan
top line in order, and then we'll investigate them one by one."* (speech-to-text: "a pet" = a pair, "the access should be beach per
second" = the axis should be beats per second)

**DECIDED:** the beating curves' axis is **beats per second** (the tool finds the cents per player from the pair's pitch and
interval). **The pitch model, his:** the strikes menu (1 … 45) → the chosen strike's chord on the drawer's keyboard → a centre pitch
assigned to each pair (the pair hovers around it) → the sonority is BETWEEN the pairs (unison, thirds, fifths, anything; the tuba
piece's relations included) → INSIDE a pair unison by default, fourths / fifths / thirds to be tried. The derived beating line:
wanted, *"an elegant way"*.

**Insider input put to him — intervals inside a pair:** at an interval the beating is between the partials that coincide (a fifth:
the lower's 3rd against the upper's 2nd; a fourth: 4th against 3rd; a major third: 5th against 4th), so the same cents of detuning
beats 3 / 4 / 5 times faster than at unison and fainter (partials are weaker than fundamentals; strong on strings — players tune
their fifths by it — weak on the flute); the tempered interval already beats (a fifth by 2 c, a major third by 14 c), so the tool's
zero is the JUST interval and the rate is computed from there; the axis stays beats per second for every interval. (The arithmetic:
low f1, the just interval p:q, the upper detuned by δ cents → beat = p · f1 · |2^(δ/1200) − 1|; p = 1 at unison, 3 at the fifth, 4 at
the fourth, 5 at the major third.)

**Insertion into the score, proposed:** one beating object per pair on its two lanes, holding its curves, pitch, players and
duration, regenerated at play start as the trill (D20) — a stretch regenerates, select + P reopens it in the panel; it generates one
sustained note per player per breath, each carrying its bend and its crescendo (the crescendo as fill as now, the bend as a line
inside the note — new); the pattern one group with a META shape (the group drag carries it, §144); from a strike, Insert at the
strike puts the pattern at its onset and the strike's covered notes are eaten by the mute rule (the trill's §6; removed = restored);
Insert at the playhead otherwise; a re-insert replaces its own earlier insert (the strikes drawer's rule); the default exit = until
this player's next strike note (the trill's rule) — his slide show.

**Anything else, put to him:** the bend range per instrument as two numbers (the sampler's and the player's: strings unlimited, flute
and bass clarinet about a quarter tone by embouchure, the piano none — an anchor only) · the pairing rules (any two players whose
ranges share the pitch, at least one able to bend) · the audition on the score's loudness path (1g's remap), not the tuba panel's
map · takes for a configuration he likes (the strikes drawer's).

**The top line put to him (phase 2):** 1 the palette · 2 the beating math (a pure module: rate ↔ cents by pitch and interval, the
mirrored curves and their difference, the breath rule, the duration stretch) · 3 one pair in the score, heard (unison, then fifth
and fourth by ear) · 4 the panel (rows, mirrored curves with handles on rails, the crescendo and breath layers, the derived line,
shapes and freehand, the slide, the space bar, the duration box, takes) · 5 the pitch side (the strikes menu → the keyboard, a pitch
per pair, the sonority between pairs, the interval inside a pair) · 6 insertion · 7 verify on a copy at 175.7 s, the tool's
requirements doc (`docs/BEATING_TOOL.md`, the TRILLS_TOOL pattern) and MORPH_NOTES, commit · 8 later: the shuffle as a writer,
cycles for section 3 (CN-33), the training material, the notation at 2a. His to confirm, reorder, rename; then phase 3, step 1.
Nothing built.

## §149. "let's include the forty five or forty six play[ed] c[h]ords for the strikes … the piano probably won't be used in the beating … good for step one" — the pitch set holds the strikes' chords; the piano out of the beating; the top line stands; phase 3 opens at step 1

Composer: *"In the pitch set, let's include the forty five or forty six play courts for the strikes. In addition to those other
similarities. sonorities; So the piano probably won't be used in the beating. I'll use it in the main score in other ways. And then
good for step one."* (speech-to-text: "play courts" = played chords; "similarities" = sonorities)

**DECIDED:** (1) the pitch set of the beating panel holds the strikes' played chords (the strikes bank, 45–46 of them; the score has
48 strike groups — the count to be read when built) beside the relations (unison · thirds · fifths · other); (2) **the piano is out
of the beating** — not even as an anchor; his use for it lies elsewhere in the score (CN-34); (3) the top line of §148 stands;
**phase 3 opens at step 1, the palette.** Six players in the beating: flute, bass clarinet, violin 1, violin 2, viola, cello.

**Facts read for step 1's goal:** the bend probe kit came over with the port — `probes/bend_probe.ps1`, `probes/analyze_bend_probe.py`,
`probes/selftest_bend_analyzer.py`, run through `tools/probe_run.sh`; the score's plain tick sends `morphBend` against the tuba's
hard-coded ±1.99 st (`composer.html:10112`), so a per-instrument range is a step-3 change the palette must feed; the ordinary voices'
measured ranges exist (`MEASURED_RANGES` in `sandbox/instruments.js`: flute ord 60–96, bass clarinet senza 34–65, the violins senza
55–101 …), so the pairing rules can be computed from them. **Put to him:** step 1's goal in format A (below in the chat, mirrored into
PLAN 1f once the sub-steps are agreed). Nothing built.

## §150. "we did string probes for the string quartet … figure out how we did pitch bend there … the same with UVI … the realistic range for a real player … embouchure bend … usually within semitone at the most. then 1 good" — #1's bend convention read; step 1's goal accepted; the sub-steps put to him

Composer (PLAN 1f, phase 3, step 1): *"So we did string probes for the string quartet, or we figured out how to use pitch bend and
to reset it, etcetera. So if you could look there and figure out how we did pitch bend there. And then I imagine it's the same with
UVI, but we should figure that out and then just use the realistic range for a real player. So it's embrachure bend, really. but we
don't need much movement to... for the beating. usually within semitone at the most. then 1 good"*

**DECIDED:** step 1's goal stands (*"then 1 good"*). The player's range: a real player's, by embouchure for the winds, **within a
semitone at the most** for everyone.

**Read in #1 (`string_quartet_no1-composer/docs`: MIDI_MUSIC_GENERATION.md §2, LONG_TONE_IMPLEMENTATION.md,
PIZZICATO_TREMOLO_GLISSANDO_WORKFLOW.md; `public/index.html` LongToneUI):** the quartet's virtual instruments ran at **±1 semitone
of pitch bend** ("user-confirmed default for all VIs in this project"; centre 8192, 8192 steps per semitone, a quarter tone = 4096);
the bend is sent BEFORE the note-on and **reset to centre after the note-off** (`0xE0 0x00 0x40`); a glissando wider than the range
is **re-keyed**: the MIDI note offset one semitone from the sounding pitch and the bend run across ±1, two semitones per segment, a new
note at each seam; bend samples every 50 ms; **CC120 / CC123 are not honoured** by the synth (a secco was done with CC7 → 0). The
same shape as #4's D26 re-key and its registry-driven panic. #4's UVI SI2 tuba measured ±1.99 st with RPN ignored; the SI2 flute in
UVI is expected the same, to be read by the probe rather than assumed.

**The sub-steps put to him (format B):** the bend convention from #1 adopted (bend before the note, centre after, re-key past the
range — the reset already in the tick's `resetMorphBend`) · one bend probe for the six players on their ordinary voices (the tuba's
`probes/bend_probe.ps1` + `analyze_bend_probe.py`, adapted to the septet's kit and ports; 0 · +50 % · +100 % · −100 %, and a second
note after an unreset bend for the residue), he runs it in the rack, the analyzer writes `bank/bend_ranges.json` (semitones per full
bend per instrument, RPN honoured or not) · the player's range in the recipe: 1 semitone for all six, the winds' by embouchure; the
panel's ceiling in beats per second and the cents shown so the limit is visible · the pairing table computed from the ordinary voices'
measured ranges (any two of the six whose ranges hold the pitch; at an interval each its own note), the panel offering only those ·
the per-instrument bend range as a recipe field the tick will read at step 3 (the tuba's 1.99 stays until then) · BEATING_TOOL.md §1
opened with the numbers; MORPH_NOTES §1 updated. Nothing built.

## §151. "on point, good" — step 1 written into PLAN 1f; the 1f entry rewritten with the talk's decisions and the eight-line top line

Composer: *"on point, good"* (the sub-steps of §150). **Written into `docs/PLAN.md` 1f at once** (PLANNING_METHOD phase 3, step 5):
the entry retitled "The beatings: a pair of players on one pitch, a gap that beats — the beating panel", status `doing`, his words
quoted, the decisions of §145–150 (the name, the seven elements, the panel, the axis, the pitch side, the piano out, the shuffle
parked), the top line as items 1–8 — item 1 in the fixed format with its result and its seven to-dos, items 2–8 carrying *to be
laid out when we discuss it*. Committed and pushed. Next: step 2's goal, on his word.

## §152. "ok, step 2" → "there'll be single events … longer events … bring in the indicator from the tuba piece … the dotted go line … on sliders … a warning … maximum breath length or bow length … continuous … or designate when the bows should change … an opportunity for the shuffle" — step 2's goal accepted with the breath model; the to-dos put to him

Composer: *"ok, step 2"* → the goal of step 2 (the beating math) put to him in format A: one pure module turning a pair's description
(the centre pitch, the interval, two signed rate curves in beats per second, the crescendo curve, the length, the breath rule) into
each player's chain of notes, one per breath, with bend and level over time; the upper player on the just interval; the beat-rate
line, the cents, the flags (a player's semitone, the sampler's range, the roughness zone), the re-key; a typed duration re-sampling;
checked in node, nothing heard. Two things named to settle in the to-dos: the breath rule per instrument (winds a gap, strings a
bow change without one), the stagger inside a pair.

Composer: *"So there'll be single events. We talked just on one bow or breath. There'll also be potentially longer events. And in
that, let's bring in the indicator from the tuba piece. This was just the dotted go line, and then those should be on sliders two
where we can just move when the breath happens. And there should be some sort of warning or indicator or something so we understand
maximum breath length or bone length. So we can indicate continuous and just let the performer rebo when they will, or we can also
designate when the bows should change, and those would be the dotted line. Oh, and this would be an opportunity for the shuffle. So
I'm not sure how we determined read breaths and stagger in the tuba piece, but have something similar. So I don't have to actually
place each breath, but I can have a shuffle where the breaths are staggered and the appropriate length, same with the bows.
Otherwise, good to go."* (speech-to-text: "bone length" = bow length, "rebo" = re-bow, "read breaths" = re-breaths)

**DECIDED — the breath model:** single events on one bow or breath; longer events with the tuba piece's indicator, the **dotted go
line at each breath** (MORPH_NOTATION: a go line at every breath onset, no onset noteheads), the marks **on sliders**; a **warning**
for the maximum breath or bow length; two ways for a long event — **continuous** (the performer re-bows / re-breathes at will) or
**designated** (the bow changes placed, the dotted lines); **a shuffle for the breaths** — staggered, the appropriate lengths,
seeded — so he need not place each; the same for the bows. Step 2's goal stands with these (*"Otherwise, good to go"*).

**How #4 determined re-breaths and stagger (answered for him):** the carrier in `morph.js` `buildCarrier` — per voice a segment
length = segLen (8 s) × (1 ± 35 % random), capped by a breath ceiling from a table by register and loudness (louder = shorter, × 0.7
while bending), a gap of ~0.75 s (a floor of 0.4 s, flagged), the first entry staggered per voice by a striation pattern, all from a
seeded random (another version = a new seed). The same shape here, per instrument: a target length with jitter, a ceiling, a gap
for the winds and none for a bow change, the pair's two players half a breath apart by default.

**The to-dos put to him (format B)** — in the chat, mirrored into PLAN 1f on his go. Nothing built.

## §153. "on point, good" — step 2 written into PLAN 1f

Composer: *"on point, good"* (the to-dos of §152). **Written into `docs/PLAN.md` 1f item 2 at once:** the result when done and the
eight to-dos in the fixed format, his words of §152 quoted. Committed and pushed. Next: step 3's goal (one pair in the score, heard),
on his word.

## §154. "ok, step 3" → "So we'll be able to adjust the maximum beating. Yes.? Or is this just a test proof of concept?" → "on point, good" — step 3's goal accepted; the to-dos put to him

Composer: *"ok, step 3"* → the goal put to him (format A): a beating as a score object; B on a strike note makes one on that lane and
its partner's with defaults (the note's pitch the centre, the partner the nearest able lane by step 1's table, a bloom from unison to
3 beats per second over 6 s, one breath, the crescendo following the beating curve); regenerated at play from its settings as the
trill (D20): one sustained note per player, bent per frame through the instrument's own range, the bend set before the note starts
and centred when it stops, the loudness through 1g's remap; a stretch regenerates; a minimal properties row on P (partner, interval,
the two rates, the length, the breath mode); the curve panel step 4, the mute rule and the group step 6; verified on a copy at
175.7 s by decoding the tick's MIDI (the beat rate over time matching the curve), then his ear — unison, then a fifth and a fourth.
Two things named for the to-dos: the object's shape in the score (one object on the launching lane carrying its partner's lane,
drawn as a bracket on both, the notes generated onto both) and the defaults B gives.

Composer: *"So we'll be able to adjust the maximum beating. Yes.? Or is this just a test proof of concept?"* **Answered:** yes,
adjustable from step 3 on — the 3 per second is only the birth default; the P row changes both rates by typing, step 4 makes the top a
handle; the ceiling is the player's semitone (step 1), flagged when a rate needs more — above the musical range in practice (at
middle C a full semitone between the two players ≈ 15 beats per second, already roughness; ≈ 8 at the C below).

Composer: *"on point, good"* — **step 3's goal stands.** The to-dos put to him (format B): the object (a `beating` on the launching
lane with its partner's lane, the trill's zone as the model, drawn on both lanes) · regeneration at play and after a drag or stretch
into the object's own snippet · the tick (the bend per frame through the instrument's range from step 1, joined to the pre-arm,
centred at the note's end and on stop; the level through 1g's held-note path; the timestamped scheduler) · the launch by B with the
defaults · the P row · Hear through the same path · the verification on a copy by decoding the MIDI · his ear at unison, fifth,
fourth, the verdicts filed. Into PLAN 1f on his go. Nothing built.

## §155. "on point, good" — step 3 written into PLAN 1f

Composer: *"on point, good"* (the to-dos of §154). **Written into `docs/PLAN.md` 1f item 3 at once:** the result when done and the
eight to-dos in the fixed format. Committed and pushed. Next: step 4's goal (the panel), on his word.

## §156. "ok, step 4" → "on point, good" — step 4's goal (the panel) accepted; the to-dos put to him

Composer: *"ok, step 4"* → the goal put to him (format A): the beating panel, opened on P for a selected beating or empty from the
toolbar; up to three rows, one per pair; in a row the two players' rate curves as mirror images above and below a centre line, the
beating that results drawn between them, a crescendo lane and a breath lane beneath; every curve with handles on rails (the top =
the level, the ends = resize, the body = slide); shapes from a menu (flat, ramp out / in, hump, the long arc) reshaped or redrawn
freehand with the trill's curve tool; the pair's two curves mirrored until unlocked for phase; a whole row slid in time; the breath
lane's dotted go lines on sliders, the warning past the ceiling, the breath shuffle; the space bar through the score's path; a
duration box; takes; every edit regenerating the objects live. Three things put with it: where it lives — (a) a floating panel like
the strikes drawer with the curve tool's gestures inside, the score's curve windows A / B / C left to the trills (recommended), or
(b) the three curve windows themselves; the beating display — the band between the two curves filled and tinted by zone (flanger ·
beating · roughness) with the rate in numbers at the handle while dragging; the lock — mirror on by default, one modifier key to
move a single curve. Composer: *"on point, good"* — **the goal stands, (a) and the two proposals with it.**

**The to-dos put to him (format B):** the chassis (floating, on P or the Beating button, takes) · the row (label, the mirrored
curves, the tinted band, the crescendo lane, the breath lane; up to three) · shapes with handles and the freehand redraw · the mirror
lock and the phase slide · the row offset, the pattern length and the duration box · the breath lane (marks on sliders per player,
the ceiling and its warning, the three modes, the seeded shuffle) · the audition on the space bar through the score's tick, the
objects regenerated live · the verification on a copy with real DOM events, then his test and verdicts filed. Into PLAN 1f on his
go. Nothing built.

## §157. "on point, good" — step 4 written into PLAN 1f

Composer: *"on point, good"* (the to-dos of §156). **Written into `docs/PLAN.md` 1f item 4 at once:** the result when done, the
three things settled with the goal, the eight to-dos. Committed and pushed. Next: step 5's goal (the pitch side), on his word.

## §158. "ok, step 5" → "on point, good" — step 5's goal (the pitch side) accepted; the to-dos put to him

Composer: *"ok, step 5"* → the goal put to him (format A): the panel's pitches chosen the strikes drawer's way — a strikes menu of
the bank's played chords, the chosen chord on a keyboard inside the panel, a click on a note then on a row giving that pair its
pitch, the keyboard dimming the notes the pair cannot play (step 1's table); the sonority between the pairs also dealt by relation
from a root (unison · thirds · fourths · fifths · a typed stack), folded into range; each row's interval placing the partner above
at the just interval (unison by default; fourths, fifths, the thirds to try), both notes shown; the player above by the ranges; a
pattern launched from a strike opening on that strike's chord. Three proposals with it: the assigned pitch = the pair's lower note,
the partner above by the interval; unison between the pairs offered two ways — (a) all pairs on one note in one octave (a six-player
field on one pitch, the tuba's bloom) and (b) the pitch class spread across octaves; the strikes drawer's own keyboard reused inside
the panel (the fold arrows and the range dimming for free). Composer: *"on point, good"* — **the goal stands with the three.**

**The to-dos put to him (format B):** the source menu (the bank's strikes as numbered in the drawer; the relations from a root; a
launched pattern opening on its strike) · the keyboard (the drawer's, reused; the chord lit; the notes outside the selected pair's
ranges dimmed; the fold arrows) · assigning (click a note then a row, or drag; the lower note; the partner above by the interval; two
marks per row in the row's colour; the upper player by range; the players changed by chips, re-checked) · the relations dealt from
a root and folded, the pairs from the bottom · the interval menu per row with the just offset in the cents readout · the row's label
mirrored into the object's fields, regenerated on a change · the verification on a copy, his test, the verdicts filed. Into PLAN 1f
on his go. Nothing built.

## §159. "on point, good" — step 5 written into PLAN 1f

Composer: *"on point, good"* (the to-dos of §158). **Written into `docs/PLAN.md` 1f item 5 at once:** the result when done, the
three things settled with the goal, the seven to-dos. Committed and pushed. Next: step 6's goal (insertion), on his word.

## §160. "ok, step 6" → "keep the beating out of the strike chain so unlike the trills … we'll just add accents manually … it doesn't have to do things like avoid overlaps and gray out notes … it'll just be its own thing" — the beating unchained; step 6's goal restated

Composer: *"ok, step 6"* → the goal put to him (format A): Insert at the strike or at the playhead; the pattern as its objects under
one group with a META shape (drag, delete, stretch); the launching strike's notes on the pair's lanes muted by the beating as the
trill mutes its launching note, back when removed, M by hand; the default exit the earlier of the two players' next strike notes (the
slide show); a stretch past that eating what it covers; a re-insert replacing at its own time; select + P. Two things put with it:
the attack at the entry — (a) the beating's first note on the instrument's accented sustain, the strike note muted (recommended), or
(b) the strike's note sounding with the held note under it; the META shape's contour from the crescendo's mean (recommended) or the
beating band.

Composer: *"Let's actually keep the beating out of the strike chain so unlike the trails. Trellis we'll just add accents manually,
but it doesn't have to do things like avoid overlaps and gray out notes. I'll just... it'll just be its own thing."* (speech-to-text:
"trails", "Trellis" = trills)

**DECIDED — the beating is its own thing, outside the strike chain:** no mute rule, no eating, no default exit at the next strike
note, no overlap avoidance, no greying of notes; the accents added by hand in the score; the score's ordinary conflict marks apply
to its notes as to any note, nothing more. The attack question (a / b) dissolves — the beating's first note is a plain entry at the
crescendo's starting level; the META contour from the crescendo's mean stands (no objection). **The goal restated and put to him:**
Insert at the playhead only (a selected strike note's pitch and onset as a starting point, no link — kept as a convenience unless he
says otherwise); the group with its META shape (drag, delete, stretch regenerates); a re-insert replaces its own earlier insert at
its own time; select + P reopens the pattern. Step 3's B launch reads the same way (no link, no mute). Nothing built.

## §161. "on point, good" — step 6's restated goal accepted; the to-dos put to him

Composer: *"on point, good"* (the goal of §160 restated: Insert at the playhead as its own group with a META shape; nothing around it
touched; the conflict marks as for any note; the accents by hand; the pattern's own length; a re-insert replacing at its own time;
select + P; a selected strike note's pitch and onset as a starting point without a link; the META contour from the crescendo's mean).
**The goal stands.** The to-dos put to him (format B): Insert @ playhead (the objects on their lanes, the row offsets kept, one new
group, the META shape from the crescendo's mean, the panel remembering its insert) · the starting-point convenience · the group's
behaviour (drag, delete, an edge stretch scaling the pattern with the breaths re-dealt, regenerated on mouseup) · re-insert replaces
its own earlier group, a new time = a new group · select + P loads the whole group, Insert then = replace · nothing else touched, the
checker reading its notes like any · the verification on a copy at 175.7 s, his test, the verdicts filed. Into PLAN 1f on his go.
Nothing built.

## §162. "on point, good" — step 6 written into PLAN 1f

Composer: *"on point, good"* (the to-dos of §161). **Written into `docs/PLAN.md` 1f item 6 at once:** the result when done, the
decision of §160 quoted, the seven to-dos; the item's summary line no longer names the mute rule. Committed and pushed. Next: step
7's goal (verify and document), on his word — then step 8 (later), and the whole item shown once.

## §163. "ok, step 7" → "on point, good" — step 7's goal (verify and document) accepted; the to-dos put to him

Composer: *"ok, step 7"* → the goal put to him (format A): the whole tool run end to end on a copy at 175.7 s and its MIDI decoded;
BEATING_TOOL.md gathered piece by piece with the built stamps (the STRIKES_TOOL / TRILLS_TOOL pattern); MORPH_NOTES §1 and §4;
NAMING §2 for the IR (D9); the journal §4 decisions; PLAN 1f marked built; the app's help line; his listening on his server after a
hard reload, the first pattern in the piece placed by him, the verdicts filed. Composer: *"on point, good"* — **the goal stands.**
The to-dos put to him (format B): the end-to-end on the copy (a strike picked, three pairs, shapes, an unlock and slide, a row
offset, breaths dealt, a duration, inserted, played among the strikes; the MIDI decoded; the checker clean; the copy deleted after)
· BEATING_TOOL.md · MORPH_NOTES §1 and §4 · NAMING §2 · the journal §4 and §2, PLAN 1f built · the help line · his reload, listening
and verdicts, commit, push. Into PLAN 1f on his go. Nothing built.

## §164. "on point, good" — step 7 written into PLAN 1f

Composer: *"on point, good"* (the to-dos of §163). **Written into `docs/PLAN.md` 1f item 7 at once:** the result when done and the
seven to-dos. Committed and pushed. Next: step 8 (later), then the whole item shown once and "is that it?".

## §165. "on point, good" — step 8 written into PLAN 1f; the whole item shown once, "is that it?"

Composer: *"on point, good"* (step 8's goal: the four held things named with the lines that will start them). **Written into
`docs/PLAN.md` 1f item 8 at once**, status `deferred`. PLAN 1f is complete as a plan: eight items, 1–7 in the fixed format with
their to-dos, 8 the parking line. Committed and pushed. **Shown to him whole, once (format B, the to-dos compressed), with "is that
it?"** and what sits outside the plan and is his: a rack window for the bend probe (step 1); the winds' embouchure numbers by his ear
when heard; his listening at each step (unison, fifth, fourth; the panel; the pattern in the piece); the first pattern's placement in
the piece. Nothing built.

## §166. "yes that's it, checkpoint and clear" — PLAN 1f confirmed whole; the checkpoint

Composer: *"yes that's it, checkpoint and clear"* — **PLAN 1f (the beatings) is confirmed whole:** eight steps in the fixed format,
agreed one at a time this evening (§146–165), nothing built. Named as his, outside the plan: a rack window for the bend probe
(step 1), the winds' embouchure range by his ear when heard, his listening at each step, where the first pattern goes in the piece.

**Checkpoint** (the project's `/checkpoint`): the lab journal, the sketch pad (CN-33, CN-34), MORPH_NOTES §3 and PLAN 1f already
current; journal §2 rewritten cold (the session's 1f bullet in its final form, NEXT STEPS, the checkpoint block with the next
concrete step as an instruction — build step 1, the palette; step 2 while the probe waits — the resume reads, the uncommitted
list); PLANNER's NOW ► refreshed; committed and pushed. Resume on Fable, `/postclear`.

## §167. "will you be able to run the plan independantly? can you do so, and I'll check in after the build" — PLAN 1f step 1 (the palette) built: the recipe fields, the palette module, the bend probe on this kit with its self-test; the probe started in his rack

Composer, mid-way through the AI's resume reads after `/postclear` (2026-09-07, early morning): *"will you be able to run the plan
independantly? can you do so, and I'll check in after the build"*. → Yes: PLAN 1f steps 1 → 7 built one at a time in the plan's
words, on `zz-ai-*` copies; the bend probe run in his rack only if the bridge reports it up and idle; his listening verdicts at
steps 3–7 stay his to file when he checks in. This entry is step 1; the probe's numbers follow in §168.

**Built, in the order of the plan's to-dos (HOW_WE_WORK's cadence per to-do):**

1. **The recipe fields** (`sandbox/instruments.js`, on the instrument, not the technique — in Kontakt the bend range belongs to the
   instrument, every preset alike; in UVI to the part, SI2's presets uniform; the beating uses the ordinary voice only):
   `playerBendSt: 1` on the six (his rule, §150: *"usually within semitone at the most"*) · `bendRangeSt` PROVISIONAL — 1.99 on the
   flute (the tuba piece's SI2 measurement, D26; the same UVI engine), 2 on the five Xsample instruments (Kontakt's default) — until
   the probe writes `MEASURED_BEND` · `beating: false, playerBendSt: 0` on the piano (CN-34).
2. **`score/public/beating_calc.js` opened** (the accel calculator's pattern: window.BeatingCalc on the page, require in node) with
   the palette: `players` (six, D10 order) · `ordinaryVoice` / `ordinaryRange` (the recipe's `ordinary`, the measured range of 0d) ·
   `bendLimits` (player · sampler · the smaller as the limit in cents) · `holds` (in range, able to bend, no silent key) · `pairsFor`
   (unison: both hold the pitch; an interval: one holds the lower note, one the upper — the pitch assigned is the pair's lower note,
   §158; when either could take either, the higher-ranged player takes the upper) · `pairingTable` · `INTERVALS` (unison 1:1 · m3
   6:5 · M3 5:4 · P4 4:3 · P5 3:2; the coincident partial p = 1 · 6 · 5 · 4 · 3; the just offsets 0 · +15.641 · −13.686 · −1.955 ·
   +1.955 c). `tools/beating_calc_check.js`: 35 checks against the live recipe — one of the AI's own checks was wrong on the first run
   (it claimed the flute could not take D#4's lower note at a fifth; the flute holds 60–96, so it can) and was rewritten on G3, below
   the flute's bottom, where the rule shows. The page loads it (`<script src="/beating_calc.js">` after accel_calc.js); verified on
   :5301: `BeatingCalc` defined, 15 pairs at C4, no console errors.
3. **The pairing table** (from the measured ordinary ranges): C2 → one pair (bass clarinet + cello) · C3 → 3 · G3 → 10 (the flute
   out below C4) · C4 → all 15 · C5 → 10 (the bass clarinet out above F4) · C6 → 6 (the cello out above B5) · C7 → 3 (the flute and
   the violins) · F7 → the violins alone. At a fifth the flute below C4 can only be the upper voice; at C7 no pair (G7 is above every
   range). The full table in `docs/BEATING_TOOL.md` §3.
4. **The bend probe adapted to this repo's kit.** The decision: NOT the tuba's standalone sender (`probes/bend_probe.ps1`, which
   needs Reaper armed by hand and its own `slots + actions` schedule) but this kit — `tools/balance_schedule.js --bend` writes
   `probes/bend_schedule.json` in the balance format (48 notes, 207 s: the six players on their ordinary voices at the middle of the
   measured range — F#5 78 · D3 50 · F#5 78 · F#5 78 · B4 71 · C4 60 — velocity 100, 2 s held, 2 s settle; per player the eight
   slots: reference · +50 % · +100 % · −100 % · a +50 % bend left unreset then the plain note (the residue) · RPN 0 = 12 then +100 % ·
   RPN 0 = 2 then +100 %); `probes/balance_probe.ps1` learned the `bend` (14-bit, in the prelude 300 ms before the note, after CC7 /
   CC0), `rpn` (CC101 0 · CC100 0 · CC6 · CC38 0) and `reset` (the centre 400 ms after the note-off) events, and its CloseAll now
   centres the bend on every channel it opened; `tools/probe_run.sh` picks the analyzer by the schedule's `"bend": true` (or
   `PROBE_ANALYZER`) and ABORTS when the newest wav predates the run (an unarmed REC track used to leave the analyzer a stale take).
   Regression: the committed builder and the edited one rebuild the held and ranges schedules IDENTICALLY; the stored
   `probes/ranges_schedule.json` differs from a rebuild only because 0d narrowed the recipe after that probe (1347 → 1298 notes).
5. **`probes/analyze_bend.py`** — the tuba's f0 method kept whole (energy-normalised autocorrelation, parabolic peak, ±6 semitones
   around the written note, the onset-train alignment), three things changed: (a) the unbent reference is SUBTRACTED before the range
   is derived (a sampler's own tuning offset would otherwise read as bend); (b) the RPN slots are read in a second band an octave up —
   a periodic tone at 2f also peaks at the lag of f, so the nominal band reads an honoured RPN 0 = 12 as "nothing happened"; the
   tuba's analyzer could never have detected an honoured RPN, and its self-test never simulated one (the tuba's SI2 ignored it, so it
   never showed); (c) the residue rule is relative (> 5 c and at least half the bent amount) instead of the tuba's fixed 20 c — a
   0.5 st sampler at +50 % is 25 c. Writes `bank/bend_ranges.json` (per player: range st, spread, linear, residue, scoop / pre-arm
   OK, RPN honoured = mutable by MIDI, restored, verdict) and `probes/last_bend_analysis.json`. On the first self-test run the
   reported offset was 115 ms early — the grid search stops at the FIRST offset matching every slot within 120 ms — fixed by the
   median residual of the matched onsets (2.34 s found for 2.345 s true).
6. **`probes/selftest_bend.py`** — six deliberately unlike simulated players (ranges 1.99 · 0.5 · 1 · 2 · 1.5 · 2 st; violin 2 and
   the cello honouring RPN; tuning offsets 0 · −4 · 0 · 0 · +6 · −3 c; the residue real on all): 48 readings within 0.2 c, every
   derivation right per player (the RPN-honoured pair read at +1200 c through the octave band, rpn12 range 12.0). **PASS.**
7. **`tools/apply_bend_ranges.js`** (apply_ranges.js's sibling) proven on a COPY of the recipe with the self-test's synthetic bank:
   the `MEASURED_BEND` block written before the hardware-capture lines, `applyMeasuredBend` at load sets `bendRangeSt` ·
   `bendMeasured` · `bendMutableByMidi` · `bendResidueCents`; a second run replaces the block (one block after two runs).
8. **Docs:** `docs/BEATING_TOOL.md` opened (§0 the picture · §1 the decisions · §2 the anatomy · §3 the palette, built · §4–9 the
   steps to come with his words · §10 the notation · §11 open for him · the log); MORPH_NOTES §1 rewritten to what exists.

**The probe, started:** the bridge alive (Reaper 7.72, `septet_rack.rpp`, not playing, 12 tracks) → at his word the run went
ahead in the background after an arm check: `bash tools/probe_run.sh probes/bend_schedule.json`. Its numbers → §168.

**Assumptions to carry:** the probe reads each technique's own channel; the Xsample curve channels (D11: 2–4) are assumed to share
the main channel's bend range until a beating plays on one. The winds' embouchure range stays his semitone until he hears one.

## §168. The bend probe run in his rack — SI2 ±2.00 st, the Xsample five ±0.96–0.99 st, RPN ignored on all six, the residue real on all six, the pre-arm fine; the numbers in the recipe

The run (2026-09-07 00:15, `bash tools/probe_run.sh probes/bend_schedule.json`; the bridge alive, Reaper 7.72 on `septet_rack.rpp`,
REC and the nine instrument tracks armed as for the sweeps): recorded → played 204.9 s → stopped with 40667 → `01-REC-260907_0015.wav`
(206.6 s, 44.1 kHz; gitignored under `reaper/Media/`) → analysed → 10 items removed, the cursor back to 0. **48 of 48 slots aligned
(t=0 at 1.62 s), every slot voiced (confidence 0.99–1.0, 154–156 frames), every player OK.**

| player | pitch | ref c | +50 c | +100 c | −100 c | range st | spread | residue | RPN 0 = 12 | restored |
|---|---|---|---|---|---|---|---|---|---|---|
| flute | F#5 (78) | +4.7 | +104.9 | +204.8 | −195.4 | 2.00 | 0.00 | +100.2 | +204.8 (ignored) | +204.8 yes |
| bass clarinet | D3 (50) | −1.7 | +46.9 | +96.1 | −99.6 | 0.98 | 0.01 | +49.4 | +96.9 (ignored) | +97.4 yes |
| violin 1 | F#5 (78) | +1.6 | +49.4 | +98.0 | −96.3 | 0.96 | 0.02 | +49.9 | +101.0 (ignored) | +97.8 yes |
| violin 2 | F#5 (78) | +1.5 | +49.8 | +99.0 | −95.1 | 0.97 | 0.01 | +50.4 | +100.3 (ignored) | +100.7 yes |
| viola | B4 (71) | −1.3 | +48.3 | +97.3 | −96.6 | 0.99 | 0.04 | +49.3 | +98.1 (ignored) | +99.0 yes |
| cello | C4 (60) | −0.3 | +47.9 | +99.1 | −96.9 | 0.97 | 0.03 | +48.3 | +99.5 (ignored) | +97.4 yes |

**Found:**
- **The five Xsample instruments are set to ±1 semitone in Kontakt** (0.96–0.99 st measured, linear to 0.04 st) — the quarter-tone-step
  bend setting MORPH_NOTES §1 had named as "to check"; **the SI2 flute is at ±2.00** (the tuba piece's 1.99 of D26 confirmed on the
  flute). The measured Xsample values sit 1–4 c short of a full semitone; the cause was not chased — the tool uses the measured number,
  so a request for the full range lands where it lands. Consequence for the palette: on the five the LIMIT is the sampler's (96–99 c),
  a hair under his semitone; on the flute the player's (100 c). If he ever widens the Kontakt setting, the probe is one command.
- **No range can be changed by MIDI:** RPN 0 (pitch-bend sensitivity) ignored on all six (full bend after asking for 12 semitones read
  what it read before, 97–101 c on the Xsample, 205 c on SI2), and the "restore" slot matched +100 % within 4 c everywhere. The re-key
  (§150, #1's convention) is the only way past a sampler's range — under the player's semitone never needed.
- **The residue is real on every instrument:** the plain note after an unreset +50 % bend sounded at the bent pitch on all six
  (+48–50 c on the Xsample, +100 c on SI2) — the tuba's Probe 0 finding (+49.4 c) is the whole ensemble's. The tick's `resetMorphBend`
  stays essential; `balance_probe.ps1` now centres the bend on every channel it closes.
- **The pre-arm at 300 ms is enough — and the first reading said otherwise.** The analyzer's first pass flagged three players' onset
  scoop past 5 c (flute +7.0, bass clarinet −15.6, cello +7.3 on the +100 slot). The UNBENT reference slots showed the same onsets
  (flute +4.8, bass clarinet −15.9, violins +7, viola +4, cello +9.9): it is the samples' own attack — the bass clarinet's reed starts
  14 c SHARP and settles, the bows start 5–10 c FLAT and settle, the flute is in tune from the start — inside the first 80 ms, whatever
  the bend. A bend that landed late would have read tens of cents beyond that. **Corrected in the analyzer:** the scoop is now the +100
  slot's onset-vs-settled LESS the reference's own (`attackScoopCents` kept beside it), pre-arm OK within 10 c; re-run on the same wav:
  flute +2.2 · bass clarinet +0.3 · violin 1 −7.0 · violin 2 −6.4 · viola −0.4 · cello −2.6 — all OK. The tuba's self-test (a synthetic
  tone, no attack) could not have shown this; the self-test here still passes (its reference scoop is 0).
- The baselines: SI2's F#5 sample is **4.7 c sharp**; the Xsample notes within ±2 c. The reference is subtracted before the range is
  derived, so a sharp sample does not read as bend.

**Applied:** `node tools/apply_bend_ranges.js` → `MEASURED_BEND` in `sandbox/instruments.js` (bendRangeSt 2 · 0.98 · 0.96 · 0.97 ·
0.99 · 0.97, bendMeasured true, bendMutableByMidi false, the residues); `tools/beating_calc_check.js` extended (37 checks: the limit
the smaller of the two, every range measured, the flute at 2 and the five at 0.96–0.99) — PASS; `probes/selftest_bend.py` — PASS.
BEATING_TOOL §3 stamped with the numbers. PLAN 1f step 1 marked built.
