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

## §169. PLAN 1f step 2 (the beating math) built: one pure call turns a pair's description into each player's chain of notes — the conversion, the heard beating, the shapes, the mirror and the slide, the breaths dealt inside the ceilings, the re-key, the stretch, the flags; 77 checks, nothing heard

Built straight after step 1's commit (2026-09-07, about 01:00–01:40), in the plan's words (PLAN 1f item 2's to-dos), the same file
as the palette: `score/public/beating_calc.js`'s second half; `tools/beating_calc_check.js` extended from 37 to 77 checks.

**The model, as decided in the code (the choices worth remembering):**
- **A player's rate curve is its SHARE of the beating, signed.** The plan's words: two signed rate curves, "the difference → the beat-rate
  line" (§147: what is heard is the DIFFERENCE of the two curves). So each player's cents come from its own rate against a partner at the
  centre — cents = 1200·log2(1 + rate ÷ (p·f)), p the interval's coincident partial — and the heard beating is computed from the two
  players' actual cents: beat = p·f·|2^(cU/1200) − 2^(cL/1200)|. Consequence: **the panel draws ONE heard-rate curve per pair** and
  `mirrored()` splits it half and half (bipolar) — so the drawn height IS the beating heard (a 3-hump: ±9.9 c each at C4, 2.99 beats per
  second at the peak); `flatPartner()` gives the whole curve to one player (the trainable form, CN-33). Two explicit curves are still
  accepted (the unlocked panel of step 4).
- **The tuba's 13.19 c is 13.18.** 1 beat per second at C3 (130.81 Hz) = 1200·log2(1 + 1/130.81) = 13.184 c; D28's "13.19" was a
  rounding. At C4 6.60 c, at C2 26.27 c (not 26.37: the log compresses a little going down). The register law holds as written.
- **The just interval is the zero** (§148): the upper player's centre is the just interval above the pitch; its bend carries the just
  offset (+1.955 c at the fifth, −1.955 at the fourth, −13.686 at the major third, +15.641 at the minor third) even when its rate is 0.
- **Curves over normalised time**, breakpoints linear between, held flat beyond the ends — so `stretch()` is a change of `length` and
  nothing else (the slides and the hand-placed breath marks scale; dealt breaths re-deal). **The slide** reads a player's curve later
  by so many seconds. Proven as §147 predicted: mirrored humps in phase = a pulse 0 → max → 0; the upper slid by half the length = a
  plateau at half the peak, flat from the middle on; two curves on the same side of the centre, one slid = the beat dies to a
  momentary unison (both at the same cents) and returns.
- **The breaths** (§152): three modes per player — `one` · `continuous` (marked for the notation: re-bow at will; no ceiling flag) ·
  `designated` (marks as note boundaries; hand-placed marks kept, the nearest dealt mark giving way; the rest dealt). **The deal** =
  the tuba carrier's rule per instrument: a target with 35 % jitter, capped by the ceiling, seeded (mulberry32, the accel
  calculator's), the upper player half a breath behind by default; no span ever longer than its ceiling, the last at least 40 % of
  the target. **The ceiling table — DEFAULTS for his ear:** flute 8 s breath · bass clarinet 10 s · violins and viola 12 s bow · cello
  10 s; louder = shorter (× 0.85 above level 0.5, × 0.7 above 0.75, the tuba's rule); the winds re-enter after a 0.5 s gap, a bow
  changes without one. A 40 s event at 2 beats per second: the flute in 7 breaths of ≤ 6.8 s with 0.5 s gaps, the violin in 5 bows of
  ≤ 10.2 s, the pair staggered (first marks 6.8 s and 3.07 s); louder (level 0.9), 8 breaths. Continuity across a breath is free —
  the next note reads the same curves where the last stopped (within 0.5 c and 0.02 of level on the check).
- **The re-key** (#1's convention, §150): a note splits where its cents pass the sampler's range; the key moves a semitone, the bend
  is re-based against it, the seam flagged `sampler-range`. Proven at 40 beats per second on C4 (±127 c each: the viola re-keyed a
  semitone up, the cello down, the bends inside ±100 c). Under his semitone and the measured 0.96–2.00 st it never happens.
- **The output:** per player the chain of notes `{ key, keyOffset, startS, endS, breath, bend: [[dt, cents]…] (the tuba's morphBend
  shape, 50 ms steps), level: [[dt, 0…1]…], flags }` — the level in the score's units, the tick applies 1g's remap (step 3); per pair
  the panel's lines (`samples`), the zones, `maxBeat`, `maxCents`, the marks and spans, the flags; per pattern (`renderPattern`) the
  notes in absolute time at the rows' offsets, the length, the flags, and the **META contour** — the crescendo's mean across the
  pattern, 33 points (§160's decision). **The flags:** `player-limit` · `sampler-range` · `roughness` · `ceiling` · `out-of-range`
  (a player who cannot hold the note — the palette's business, but the module says so).

**The checks (the plan's list, every one):** rate → cents → rate exact on 250 points (worst 1.2e-12) · the fifth at 3× per cent, the
fourth 4×, the thirds 5× and 6× · the just offsets on the upper note · the pulse, the plateau, the momentary unison · the breaths
inside the ceilings and staggered, seeded, a hand mark kept · the stretch (6 → 12 s: the same cents at the same normalised time,
the slide and the hand mark scaled; dealt breaths re-dealt at 30 s) · the flags · a three-pair pattern at offsets 0 · 1 · 2 s (six
notes, 8 s, the contour). First run: 4 of 77 failed — every one a wrong expected number in the AI's check (13.19 for 13.18; 26.32
for 26.27; two tolerances tighter than the samples' three-decimal rounding); the module unchanged. **PASS.**

**Not done, by the plan:** nothing heard — step 3 puts one pair in the score and plays it through the tick.

## §170. PLAN 1f step 3 (one pair in the score) built: the beating zone, B on a strike note, the snippet with per-event routing and bend events, the tick's bend through the measured range, the P row, ▶ hear — verified on a copy by the decoded MIDI; his ear pending

Built 2026-09-07, about 01:40–02:50, after step 2's commit, in the plan's words (PLAN 1f item 3's to-dos); the trill (TRILLS_TOOL §2,
§5; `createTrill`, `regenerateTrill`, the zone tick) read first as the model. `score/public/composer.html` only — the math stays in
`beating_calc.js`.

**The object.** A zone with `midiModel: 'beating'` on the launching player's lane and a `beating` block { partnerLayer, pitch (the
lower note), interval, rateFrom / rateTo / shape (the heard beating; a drawn `beat` curve overrides from step 4), share, levelLo /
levelHi (the crescendo follows the beating), breath { mode, seed, target, marks }, slide, launchedFrom }. One object, two lanes: the
partner's lane gets a dashed bracket (`renderBeatingDecor`, kept in a Map on the Composer, never on the object — the save strips only
`_els`, and a DOM element or a 300-sample render result on the object would have gone into the file). The zone's own rect, label,
drag, edges, Ctrl-copy and the group drag are the generic zone's; `trillAfterDrag` regenerates a beating as it does a trill.

**The realization — the decisions:**
- **Timestamped snippet events, not a per-frame bend poll.** The plain-note tick polls `morphBend` per frame (the tuba's path at
  `composer.html` 10112, the 1.99 constant); D19's lesson (§103: "trill sounds much better" once timestamped) says schedule instead.
  So `regenerateBeating` turns `BeatingCalc.renderPair`'s notes into zone-snippet events — `_cc` (CC7, CC0), a new `_bend` event kind
  (14-bit), the notes — and `tickZoneMidiPlayback` learned `_bend` (sent like a note, with its timestamp; the slot registered in
  `_morphBentChannels` so `resetMorphBend` centres it on stop). The partner's events carry their own port and channel (the tick's
  per-event routing, the flocking pattern). The tuba's 1.99 constant is untouched on the plain-note path; the beating's bend goes
  through `bendValueFor(instKey, cents)` = the recipe's measured `bendRangeSt` (full up +8191, full down −8192, the schedule builder's
  arithmetic).
- **The lead 300 ms** (the probe: enough on all six; the trill's CC lead is 150), the first bend value with the articulation and CC7
  at the lead so the note starts at pitch; **the centre 400 ms after the zone's end** (the tuba's reset gap; sent by the tick's
  exit branch with a future timestamp — a snippet event past the zone's end would never be scheduled) and on every stop.
- **The articulation re-sent before every note of the beating's own** (20 ms before a later breath): a strike on the same slot
  (Bartók, cc0 79, on channel 1 of the same Kontakt instrument) switches the preset for that channel; the held voice keeps its
  samples, the next breath would not. Its own thing (§160): no arbitration, the strike sends what it sends — its CC7 and its
  articulation land on the shared channel while the beating holds. For his ear; the strings' curve channels (D11: 2–4) are the way
  out if it bites.
- **The velocity for the note's top level through 1g's remap** (`heldNote`), **CC7 following the level** (`cc7ForHeight`), only the
  changes sent — the viola gets 127 and the cello 87 for the same level 0.9 (the measured curves; to be heard).
- **A play start inside the zone** lands the latest articulation, CC7 and bend of each slot first (`beatingCatchUp`) — the trill
  has no such catch-up; a bloom from unison needs none, a held rate would scoop without it.
- **B:** the selected strike note's pitch and onset; the partner = the nearest lane that can pair on that note at unison (step 1's
  table; ties to the higher lane); a 6 s bloom 0 → 3 beats per second, one breath; the strike note untouched (no `mutedBy`, no
  eating). At the playhead with nothing selected: the lane's nearest earlier note (the trill's anchor rule) or the middle of the
  range. Refused with a message: the piano lane (CN-34) and a note no other player holds.
- **At unison who bends up and who down follows score order** (the table lists players in D10 order; the lower slot bends down):
  Vc + Va on F3 → the viola down, the cello up. It cannot matter at unison; at an interval the roles come from the table (the
  cello below, the viola above at the fifth on F3 — both could, the higher range takes the upper).
- **"The space bar with the object selected"** (the plan's to-do) is NOT bound: SPACE stays the transport's; the panel of step 4
  gets its own focus and space. ▶ hear in the P row plays the pair alone (`playBeatingEvents`: the same events, timestamped from
  now, the bends included, centred after; ■ stop centres and silences at once).
- **The P row:** partner (only the lanes that can play the note and interval — a partner that no longer can is shown as "cannot play
  this"), pitch, interval chips, rate from / to and the shape (ramp · hump · arc · flat), length (the right edge too), breath mode and
  seed, level low / high, the readout (max beats per second, each player's cents against its limit, the just offset, the notes,
  the flags, the events and slots), ▶ hear. A pitch or interval change keeps the partner where it still can play, else takes the
  first that can.

**Verified on a copy** (`scores/zz-ai-beating.json`, deleted after with its `-work`; the server on :5301 stopped first):
1. B on the last strike note (the cello's F3, 53, at 175.636 s, `wc-1357`, group grp-strike-23-1868) → `zn-1359` Vc + Va on F3,
   175.636 → 181.636 s, 293 events, two slots (Va ch 1, Vc ch 1), the bracket in the viola lane ("beating with Vc — F3"), the note
   untouched, the label "beating Vc + Va on F3 (unison) · 0 → 3/s ramp · max 2.987/s · 2 notes · one".
2. The tick driven synchronously with `performance.now` patched and fake outputs on every port, decoded: only Va and Vc sent to;
   the bend 300 ms before both note-ons; CC0 5 and CC7 105 / 98 at the lead, then 22 / 25 CC7 steps; 122 bend steps each, mirrored
   (−14.8 / +14.8 c at the peak); note-on at the zone start (viola 127, cello 87), note-off at 6 s; **the beat rate from the decoded
   bends within 0.0018 beats per second of the module's line** at every sample (1 s: 0.5, 2 s: 1.0, 3 s: 1.5, 4 s: 2.0, 5 s: 2.5);
   the centre (0 c) at 6.4 s on both; `_morphBentChannels` = Va|0, Vc|0.
3. The intervals, each regenerated: the upper note's first bend +1.958 c (fifth, Va on C4), −1.958 (fourth, A#3), −13.68 (major
   third, A3), +15.64 (minor third, G#3) — the just offsets through the 0.99 st quantization; the roles cello below / viola above.
4. Autosave → `openScore` → the block identical, 293 events again, the bracket back.
5. A body drag through the real handler (+2 s, shift-locked horizontal): 177.636, the lane kept, regenerated, the bracket's x = the
   zone's; a right-edge stretch through the real handler to 8.964 s: regenerated, both notes 8964 ms, the curve stretched (the same
   peak 2.987, the ramp's middle 1.503 at half); the strike note still unmuted.
6. `tools/range_check.js` on the saved copy: 516 notes, 69 trills, every one inside its range (the checker does not read a
   beating's snippet — a nit; its notes are inside the limits by construction).
7. Delete: the zone and its bracket gone, the strike still there, 639 objects again.

**Not done, by the plan:** his ear — unison first, then the fifth and the fourth — when he checks in; the verdicts to MORPH_NOTES
§3 and BEATING_TOOL.md. **Carried to step 4:** the panel's space bar; a drawn `beat` curve (the row's shapes until then).

## §171. PLAN 1f step 4 (the panel) built: `beating_panel.js` — rows, the mirrored curves with handles on rails, the band by zone, shapes and draw, the mirror lock and the slide, the crescendo and breath lanes, the offset rail, the length box, SPACE, takes — verified with real DOM events on a copy; his test pending

Built 2026-09-07, about 02:50–03:40, after step 3's commit, in the plan's words (PLAN 1f item 4's to-dos; the settled points of
§156). The models read first: the morph panel's chassis (`morph_panel.js`: a fixed, draggable, capped flex column; the clamp into
view; the z-order on grab), the strikes drawer's takes (`/api/snapshots`, the `strikes` bucket → ours `beatings`) and its SPACE rule
(a capture-phase listener while the drawer is open, text entry excepted), the curve windows' points → line gesture (D21).

**The decisions:**
- **One truth.** A bound row's block IS the zone's `beating` (a live reference): the panel writes it, `regenerateBeating` + `renderZone`
  follow, debounced 120 ms during a drag and at once on mouseup. No copy, no apply button. An unbound pattern's rows hold their own
  blocks until Insert (step 6); `state()` deep-copies them for a take.
- **The drawn curve wins.** The row's *from / to / shape* of step 3 make the heard curve until a handle moves: then `beat` (the
  heard-rate curve, breakpoints) is written and `shape = 'drawn'`; the shape menu writes `beat` outright (a `flat` at the *to* rate,
  a `ramp out` 0 → to, a `ramp in` to → 0, a hump / arc from → to → from, a burst). `beatingSpec` was extended: two explicit curves
  (`rate.lower / upper`) when the mirror is unlocked, a drawn crescendo (`levelCurve`), else the level follows the heard curve —
  the gap between the two curves when unlocked.
- **The mirror lock** (§156: on by default, one modifier to move a single curve): a locked drag edits the heard curve's point (the
  value = twice the handle's |rate|, both curves mirror by `share`); ALT-drag unlocks — the two curves are copied out as explicit
  points and only the dragged one changes; the lock button relocks with the upper's shape as the heard curve. A locked body drag
  slides both curves (`slide.lower = slide.upper`), unlocked one.
- **The band as slivers.** A rect per 50 ms sample between the two players' rates, tinted by that sample's zone (grey < 1, purple,
  red > 15) — the zone can change along the curve, a single polygon could not show it; 120 slivers per row, cheap.
- **The breath lane's rule** (the plan: "hand-moved marks kept, the rest re-dealt"): a dragged or clicked mark joins the block's hand
  list (`breath.marks[who]`), the deal keeps it (`dealBreaths`' `keep` — the nearest dealt mark gives way); the rest stay the deal's;
  shuffle = a new seed with the hand marks kept; ALT-click drops a hand mark, or — on a dealt one — makes every current mark a hand
  mark but that one (the deal stops, `deal: false`; the next shuffle starts it again). The first draft froze every mark on a drag;
  corrected before the test.
- **SPACE is the panel's while it is open** (the drawer's rule): the pattern through `Composer.playBeatingEvents` — every row's
  snippet regenerated, the events merged with the rows' offsets, every event given its port and channel, one timestamped
  schedule; SPACE again stops. The transport gets SPACE back at ESC / close. This is step 3's "space bar with the object selected".
- **The step-3 property row retired:** P on a beating opens the panel bound to it; B opens it on the new beating; the property
  panel's zone section says "P opens the beating panel". `renderBeatingPanel` / `bindBeatingPanel` removed from composer.html (51
  lines) — the panel is the editor, nothing dead left.
- The rate axis is per row (± the row's scale, default 6, typed); a bound panel is one row (a whole pattern is step 6's group).

**Verified on the copy (`zz-ai-beating`, :5301; the server stopped and the copy and its `-work` removed after), with real
`MouseEvent`s on the panel's SVG:**
1. B on the last strike (the cello's F3 at 175.636 s) → the panel open and bound to `zn-…`, one row, 4 handles (a ramp: two points
   per curve), 120 band slivers, 4 paths (the two curves as played thin, the two drawn bold), the level lane, the breath lane, the
   readout "max 2.987/s · viola ±14.808 c/99 · cello ±14.808 c/97 · 1+1 notes".
2. `hump` popped → `beat` [[0,0],[0.5,3],[1,0]], the zone regenerated, its peak bend event at 3300 ms (the note's middle + the lead).
3. The upper curve's peak handle dragged up 30 px → the heard peak 9.176, the curves ±4.588 mirrored, max 9.059/s, the readout
   ±44.9 c against the limits 99 / 97; regenerated.
4. The upper curve's body dragged 52 px right → `slide` 0.655 s on both (locked); the beat 0 at the start, 7.1 at half, 2.0 at the
   end (the hump pushed past the end); regenerated.
5. ALT-drag on the lower curve's body 52 px left → unlocked ("🔓 free"), `rate.lower / upper` explicit, the lower's slide back to 0,
   the upper's 0.655 kept; regenerated.
6. Length 12 → the zone 12 s, both notes 12000 ms, the slide scaled 0.655 → 1.31 s; regenerated.
7. Shuffle → designated, seed 2, the marks upper 3.628 / lower 8.8 (the cello's ceiling 8.5 s, the viola's 10.2 at the mean level),
   4 notes; the upper's mark dragged 40 px → a hand mark at 4.613 (the dealt one gave way); shuffle again → seed 3, the hand mark
   kept, the deal added 8.8 for the upper.
8. A take `zz-ai-take` saved ("1 in bank/panel_snapshots.json"), listed, loaded after the block was changed (rateTo 3 and the
   unlocked curves restored, length 12), deleted ("0 left"); his 151 strikes takes untouched; the file keeps an empty `beatings`
   bucket (the server creates a panel's bucket on its first save) — one line in his uncommitted takes file.
9. Beating with nothing selected → a new pattern: bass clarinet + viola on D3 (the active lane's middle, the nearest partner);
   + pair → flute + violin 1 on F#5; the second row's offset slider to 1.5 s; play with fake outputs: 1177 events on basscl / va /
   flute / vn1, the second pair's note-ons at 1.81 s = 0.31 + 1.5; the button "■ playing (space)"; stop → silent.

**Not done, by the plan:** his test — the feel of the handles, the colours, the axis — when he checks in; the verdicts to
MORPH_NOTES §3 and BEATING_TOOL.md. **Carried:** Insert (step 6); the keyboard and the strikes menu inside the panel (step 5).

## §172. PLAN 1f step 5 (the pitch side) built: the strike menu from the bank, the keyboard beside the rows with the chord lit and the unplayable keys dimmed, a note armed and dropped (or dragged) onto a pair, the relations dealt from a root and folded, a launched beating opening on its strike — verified with real DOM events on a copy; his test pending

Built 2026-09-07, about 03:40–04:20, after step 4's commit, in the plan's words (PLAN 1f item 5's to-dos; the settled points of §158).
Read first: the strikes drawer's keyboard (`renderKeyboard`: vertical keys, the C labels, the pitch-class palette, the ▲▼ arrows), its
database (`loadDb` → `bank/scattered_strikes.json`: sequences → strikeIds → strikes with `index`, `t0`, `notes[{ objectId, midi,
instKey }]`), its fold rule (`foldInto`), STRIKES_TOOL A and F. All of it inside `score/public/beating_panel.js`.

**The decisions:**
- **The keyboard is a copy of the drawer's drawing, not a call into the drawer.** The drawer's `renderKeyboard` is bound to its own
  DOM (`#skKb`), its `voices` and its row height; the plan's "reused" is honoured by drawing the same picture with the same
  conventions (SPAN C2–C7 / FULL 21–108, the palette, the dots with names, ▲▼), 8 px a key, in the panel's own SVG beside the rows.
- **The dimming is the pairing table, at the row's interval:** a key is dimmed when `beatingPartnerCandidates(row.layer, m, interval)`
  does not contain the row's partner — at unison both must hold the note; at an interval one the lower, the other the upper. Cello +
  viola at unison: 25 of the 61 keys out (below C3 and above B5).
- **A note lands as the pair's LOWER note** (§158: the assigned pitch is the pair's lower note, the partner above by the interval);
  who takes the upper follows the table (step 3's roles). The two ways: click a dot or a key (armed, the panel says so, ESC disarms)
  then click the row; or drag a dot onto the row — the panel's own mouse drag (an SVG circle cannot use the browser's drag), the
  row under the pointer found by its own mouseover as well as by hit-testing. The first test of the drag missed its drop: the
  synthetic pointer of the pane cannot hit-test (`elementFromPoint` found no row); the mouseover path was added and the drag then
  landed. A note the pair cannot play is refused with the reason; a click on a row with nothing armed makes it the active pair.
- **The relations** (§148: "the thirds, fifths, and just Unison … could be something else"; §158: unison two ways): `unison · 1 oct`
  = every pair on the root (a field on one pitch — the tuba's bloom), `unison · octaves` = the pitch class a pair per octave,
  `thirds` = root · +4 · +7, `fourths` = +5 · +10, `fifths` = +7 · +14, `stack` = typed semitones, one per pair. The root typed
  (`C4` or `60`, ENTER) or — with a relation just chosen — clicked on the keyboard (root mode). **The fold:** the nearest playable
  octave of the target (the drawer's rule by octave, the pairs from the bottom up), ↑↓ said in the status; a pair with no playable
  octave is named and left where it was.
- **A beating born on a strike note opens on that strike:** the note's id in the bank first (the bank's `objectId`s are the SOURCE
  save's — the piece's re-inserted strikes carry new ids), else the strike group's index from the note's `groupId`
  (`grp-strike-23-1868` → strike #23 — this is what matched on the copy), else the onset within 100 ms.
- The pairs' notes as rings in the row colours at the keyboard's right (the lower filled, the upper hollow); the row headers in
  the row colours; the active row tinted.

**Verified on the copy (`zz-ai-beating`, :5301; the server stopped and the copy and its `-work` removed after), with real
`MouseEvent`s:**
1. B on the last strike (the cello's F3, `wc-1357`, group `grp-strike-23-1868`) → the panel bound; the bank read (46 strikes); the
   strike menu on **#23 · 34.22 s · 11 n · D#2–A4**; the chord's 11 dots on the keyboard, F3 among them; 25 keys dimmed (36–47 and
   84–96) for Vc + Va at unison; one ring (the pair's note).
2. The dot E3 (52) clicked → armed ("E3 armed — click a pair (or drag it there)"); the row clicked → the zone's pitch 52, regenerated
   (the keys Va:52, Vc:52), the label "beating Vc + Va on E3 (unison) …", the ring "pair 1: E3 (lower)".
3. The fifth chip → Vc:52 + Va:59 (E3 + B3), the roles cello below / viola above, the readout "just +1.955 c", the upper note's first
   bend +1.958 c, the rings "E3 (lower)" and "B3 (upper)".
4. The key C7 (96): dimmed (fill-opacity 0.22); clicked → armed with "the active pair cannot play it"; the row clicked → refused
   ("pair 1 cannot play C7 with its P5 — the dimmed keys are out of its reach"), the pitch unchanged.
5. A new two-pair pattern (BCl + Va on D3, Fl + Vn1 on F#5): **fifths from C3** (typed, ENTER) → pair 1 C3, pair 2 **G4 ↑** (G3 is
   below the flute's C4; folded up an octave); **unison · octaves** with a clicked C4 (root mode) → C4 · C5.
6. Strike #5 picked (21 notes, D2–B6); **B6 dragged from the chord onto the second pair** (mousedown on the dot, mousemove, the row's
   mouseover, mouseup) → its pitch 95 (the flute and violin 1 both hold it), the row outlined during the drag, the ghost removed; a
   plain mousedown-mouseup on a dot still arms it ("D2 armed … the active pair cannot play it").
No console errors.

**Not done, by the plan:** his test — when he checks in; the verdicts to MORPH_NOTES §3 and BEATING_TOOL.md. **Carried to step 6:**
Insert (the pattern into the score as one group with a META shape), the selected strike note as a starting point.

## §173. PLAN 1f step 6 (insertion) built: insert @ playhead from the panel — the pattern's beatings under one group with a META shape whose contour is the crescendo's mean; the shape's drag, stretch and delete carry the beatings; re-insert replaces at the same time, elsewhere a second group; select + P loads the group; nothing around it touched — verified on a copy; his test pending

Built 2026-09-07, about 04:20–05:00, after step 5's commit, in the plan's words (PLAN 1f item 6's to-dos; the decision of §160). Read
first: the strikes drawer's `insert()` (the group id with the insert time, the META shape as a waveCurve on META_LAYER with the
`groupId`, `C.lastInsertGroup`, `openMetaWin`, the replace-at-the-same-time rule of §113), and the three paths that move a group's
members in `composer.html` — `startWCBodyDrag` (the shape dragged), `startBoxDrag` (the green box's edges) and the node-handle
stretch — all of which mapped members by `startSeconds / endSeconds` (notes) and `time` (markers) only: **a zone in a group was
neither moved nor stretched by its shape.** The multi-selection group drag of §144 already carried zones (`_dragDt`).

**The decisions:**
- **The zones ride the existing group machinery.** The three paths learned a zone's own fields (`startTime / endTime`): the body
  drag moves it, both stretch paths map it by the same affine remap as the notes and call `trillAfterDrag` on mouseup (a beating
  regenerates — the curves over the new length, the breaths re-dealt; a trill in a group would regenerate the same way); the
  snippets are marked stale on a move (relative times — the play start regenerates anyway). Nothing new on the zones themselves.
- **The META shape's contour is the crescendo's mean** (§160, no objection): `BeatingCalc.renderPattern`'s 33-point contour, the
  level 0 → 1 as the window's 0 → 10, over the pattern's whole span (the last row's offset + its length); its `performanceNotes`
  say "beating pattern · 3 pairs (drag = move, box = stretch)"; the colour the beating's purple among the strikes' gold.
- **The group id carries the insert time** as the drawer's does (`grp-beating-<t×10>-<n>`); the panel remembers it (`patternGroupId`)
  and, after the insert, **binds to the pattern** (`openFor` of any of its beatings loads the whole group: a row per beating with
  their offsets from the first, edits live) — the next edit is live, and `insert` from a bound group **replaces it in place** (its
  own time, wherever the playhead is), so a row added or removed takes effect.
- **Re-insert replaces only at the same time** (within 100 ms — the drawer's §113 rule): the same panel inserting again where its
  earlier insert sits removes it and places the new; at another time a second group is made and the earlier kept — a pattern may
  recur (CN-28: the slide show).
- **The starting point** (kept as a convenience, §160): with a strike note selected when the panel opens new, its pitch goes to the
  first row (if that pair can play it, else the first pair that can) and **its onset is the insert time** (the button says `insert @
  175.64 s`); `launchedFrom` is cleared on the inserted beatings — nothing links them to the note.
- **One undo step for the whole insert:** `createZone` pushes an undo state per zone; each is popped, one pushed before.
- **Nothing else touched** (§160): no `mutedBy`, no eating, no greying; verified, not assumed — no note anywhere carries a beating's id.

**Verified on the copy (`zz-ai-beating`, :5301; the server stopped and the copy and its `-work` removed after):**
1. The last strike note (the cello's F3, 175.636 s) selected → Beating (new) → the first row Vc + Va on F3, `insert @ 175.64 s`;
   + pair twice → Fl + Vn1 on F#5 (offset 1 s), BCl + Va on D3 (offset 2 s); the first row's breaths designated → **insert** →
   4 objects added (639 → 643): three beatings on Vc / Fl / BCl at 175.636 / 176.636 / 177.636 s (6 s each; 338 / 359 / 338 events),
   their partner brackets on Va / Vn1 / Va, the shape on META (175.636 → 183.636 s, 33 nodes: 3.0 at the ends, 7.7 in the middle),
   the shape selected, the panel "— pattern grp-beating-1756-1359 · 3 pairs", the strike note unmuted, no `mutedBy` anywhere.
2. The shape dragged 2 s through `startWCBodyDrag` (shift-locked) → the shape and every beating moved 1.964 s (the 50 ms grid),
   the lengths and the offsets (1 / 2 s) kept, the brackets on the beatings' x, the snippets stale.
3. The box's right edge dragged through `startBoxDrag` to × 1.5 → the span 1.5 ×, every beating's length 1.5 × (9 s), all
   regenerated; the first beating's notes now 9000 (the viola's one bow, under its 10.2 s ceiling) + 2000 + 7000 (the cello's 9 s
   past its 8.5 s ceiling, dealt into two).
4. **Re-insert** from the bound panel → "replaced the earlier insert at this time (4 objects)": the old ids gone, a new group at
   177.6 s (the pattern's own time after the drag), the object count holding (643).
5. The rows unbound and **inserted at 100 s** → a second group, the first kept, 647 objects.
6. The first group's shape selected and deleted → 4 objects removed, its brackets gone, everything else intact, the second group kept.
7. Autosave → `openScore` → the group at 100 s whole (3 beatings with their blocks and partners, the shape on META), regenerated
   (466 / 479 / 458 events); `tools/range_check.js` on the saved copy clean (516 notes, 69 trills); no console errors.

**Not done, by the plan:** his test (the three-pair pattern in context, the shape's contour and colour) — when he checks in.
**Next:** step 7 — the end-to-end on a copy, BEATING_TOOL complete, MORPH_NOTES §1 and §4, NAMING §2, the journal's decisions, the
help line, PLAN 1f marked built.

## §174. PLAN 1f step 7 (verify and document): the whole tool end to end on a copy — a defect found and fixed on the way (a player in two pairs); the decoded MIDI within 0.006 beats per second of the panel on every pair; the help line; the documents complete; PLAN 1f built — his listening pending

Built 2026-09-07, about 05:00–05:40, after step 6's commit; the last of the seven steps.

**The end-to-end, on the copy (`zz-ai-beating`, :5301), with real DOM events, then the tick driven with fake outputs:** the Beating
button with nothing selected → a new pattern; strike #5 picked from the menu (21 notes, D2–B6); + pair twice → three pairs; each
pair's pitch armed from the chord's dots and dropped on its row (D3 · E4 · E4); a hump popped on row 1, a long arc on row 2 and its
peak handle dragged up (the shape becoming `drawn`, max 7.83 per second), a ramp out on row 3; row 3 at a fifth, its lower curve
ALT-dragged (unlocked, slid 0.672 s); row 2's offset 1 s; row 1's breaths shuffled (designated); the length 8 s; **insert @ 175.7 s**
→ 4 objects (three beatings, the shape 175.7 → 184.7 s, 33 nodes); the zone tick driven from 174.7 to 185.7 s on fake outputs and
decoded per pair against each row's own `out.beat` (the two slots' bend streams → cents → the coincident partials' gap):

| pair | interval | start | length | notes | worst beat diff (per s) | the upper's first bend | centre after the end |
|---|---|---|---|---|---|---|---|
| bass clarinet + viola | unison | 0 | 8 s | 2 | 0.0014 | 0 | 0.4 s, both |
| cello + violin 2 | fifth | 0 | 8 s | 2 | 0.0055 | +1.954 c (just +1.955) | 0.4 s, both |
| flute + violin 1 | unison | 1 s | 8 s | 2 | 0.0037 | 0 | 0.4 s, both |

Six ports used (basscl · va · vc · vn2 · flute · vn1), nothing stray; the bent slots registered for the stop reset; the help line
on `?`; the autosave; `tools/range_check.js` on the saved copy clean (516 notes, 69 trills). The copy and its `-work` removed, the
server stopped first.

**The defect, found on the first pass and fixed:** the first run's third pair decoded 4.2 beats per second off the panel. Not the
math — **violin 1 was in two pairs** (Fl + Vn1 and Vn2 + Vn1): `addRow`'s default partner was the nearest lane that could pair,
blind to the other rows, so one channel carried two bend streams (a sum, wrong). Fixed: `defaultRow(layer, used)` never picks a
player already in the pattern (and walks the lane's range for a note some free partner holds); `addRow` tries the free lanes in
order; the rows **warn** when a player is in two pairs by hand ("⚠ Vn1 also in another pair — one channel would carry two bends")
— not stopped: it is his to do on purpose. The second pass: distinct players (BCl + Va · Fl + Vn1 · Vn2 + Vc), every pair within
0.006 per second.

**The help line:** the app had no `?` key (the plan assumed one); one added — the keys and how a beating is made, into the status
line. Its first test threw on a window-dispatched event (`e.target.matches` — the existing handlers assume an element target, as
a real keyboard gives); the new handler guards it; a keydown on the body shows the line.

**The documents:** `docs/BEATING_TOOL.md` complete (the status line rewritten, §11 his check-in in the plan's order with the
numbers his ear decides and the known limits told, the log stamped); MORPH_NOTES §1 rewritten to what exists, §4 the digest for
the all-purpose revision (what the tool has, what it still lacks — more than three pairs, a player in two pairs, a flat partner as a
row mode, the cycling of the gap, the shuffle as a writer, a dynamics layer with phase, the exit as a rule, the notation, a live
readout, the ceilings measured); NAMING §2.10 the beating object for the IR; the journal's D24 (his decisions of the talk, with
the whys and the rejected) and D25 (the build's, each verified), §6 Done; PLAN 1f `doing` → `built`, item 7 stamped, item 8's four
held things standing.

**Not done, by the plan — his:** the hard reload, his listening at steps 3–7 (BEATING_TOOL §11), the first pattern in the piece
placed by him. The piece file was never touched: every run on a copy.

## §175. His check-in begins: "where is the panel?" → "lets make the panel full page like strikes and increase all fonts  if 12 then 14 if 14=18 10=12" — the panel a full-page drawer, the fonts one step up

Composer, 2026-09-07 morning, after the overnight build: *"where is the panel?"* — the floating box at the top right (the morph panel's
chassis) was not found; his server was serving the new page (checked: the Beating button and `beating_panel.js` on :5300, HTTP 200),
the page needed a hard reload and the panel opens only on the Beating button, B or P. Told so. Then: *"lets make the panel full page
like strikes and increase all fonts  if 12 then 14 if 14=18 10=12"*. → MORPH_NOTES §3 (his words), and built at once.

**Done:**
- **The chassis is the strikes drawer's:** `position:fixed; left:0; right:0; bottom:0; height:100vh`, the purple border on top, a
  header bar (BEATING · the title · ⇕ half / full · ✕), the height remembered in the browser (`septet.beatingPanel.v1`, the drawer's
  way; half = 62vh), a **BEATING ▴ tab at the bottom right beside STRIKES ▴** when closed; the drag, the clamp and the resize grip
  of the floating box removed. The Beating button, B and P open it as before.
- **The row drawings fill the page:** the drawing width is read from the rows' column at every render (520 px the floor, the
  window's resize re-renders); the rate area 150 px tall (was 132), the level lane 50, the breath lane 56, the keyboard's keys 10 px.
- **The fonts, his mapping** (10 → 12, 12 → 14, 14 → 18; the panel had 8–11 px, applied as 8 → 10, 9 → 11, 10 → 12, 11 → 13): the base
  13 px, every button 12, the status 13, the SVG axis and readout texts 11–12, the keyboard's names 10, the tab 14, the close mark 18.
  Checked in the pane: base 13, button 12, status 13, axis 11, keyboard 10, tab 14; the screenshot shows the drawer across the page
  with two rows and the keyboard at the left.

**A note for the tool's memory** (MORPH_NOTES §4): the working panels of this stack are drawers from the bottom, not floating boxes —
the composer looks for a tool where the strikes are.

## §176. "midi note trapped won't stop playing" — the rack silenced by a panic script; the cause (a stop cancels a long note's scheduled note-off, and Xsample ignores CC123); the fix (every long note remembered and released on stop) and a ■ Panic button

Composer, 2026-09-07 morning, testing the beating on his server: *"midi note trapped won't stop playing"*.

**First the note:** `probes/panic.ps1` written and run at once — on every loopMIDI port of the septet (Flute · Fluteb · BassCl · Piano ·
Vn1 · Vn2 · Va · Vc), on all 16 channels, an explicit note-off on every key, then CC120, CC123, the sustain pedal up, the bend centred,
CC7 back to 127 — 2128 messages per port. (The tuba's probe and MorphEmit's `panic()` had learned the same: CC123 alone is not
trustworthy — Kontakt's Xsample instruments do not honour it, piece #1's finding.)

**The cause, in the code:** a beating's notes are the first LONG notes through the zone tick (6–30 s; the trill's are a few hundred
ms). The tick schedules a note-on and its note-off together, with Web MIDI timestamps (D19). A stop (`stopPlay` → `flushCurvePlayback`)
calls `out.clear()` on every output — which cancels the still-pending note-off — and then `resetCC7All`'s CC123, which Xsample ignores.
The plain-note tick releases its own notes explicitly on a stop (its `_activeCurvePlayback`); the zone tick never had to. So a
beating stopped mid-note stayed on. The same held for the panel's audition (its own stop released its notes; a TRANSPORT stop
during an audition did not).

**The fix (verified in the pane with fake outputs):** every long note the zone tick schedules (duration > 150 ms) and every note of a
beating audition is remembered (`noteSounding`: port | channel | key → until); `flushCurvePlayback` releases them all explicitly right
after its `clear()` (`releaseSounding`); the audition's own stop unregisters what it releases. Checked: two beating notes scheduled
by the tick → stop → 8 clears, then two note-offs (Va 53, Vc 53) at the stop, the registry empty; an audition's two notes → a
transport stop → two note-offs; no console errors. This fixes the class, not the instance: any long zone note is covered.

**■ Panic in the toolbar** (`panicAll`): the queue cleared, an explicit note-off on every key of every channel of every open port,
CC120 / CC123, the pedal up, the bend centred, CC7 127, every playback registry emptied, the auditions stopped — 17,024 messages to
the eight ports in the check; the status line says so. The script `probes/panic.ps1` stays for a rack without the app.

**For the tool's memory:** a sustained note in a scheduled-ahead world needs its own release path; "all notes off" is not one on
this rack. MORPH_NOTES §3 (his words), BEATING_TOOL §5.

## §177. Two of his: a harmony module for later (CN-35 → PLAN 1d re-set); the beating drawer's harmonies in banners on the left, heard on the piano, a note assigned to a pair by hand, saved with the take (CN-36) — built; the first scrape of the earlier pieces

Composer, 2026-09-07 morning, with four screenshots of the strikes drawer (the list, the keyboard with the lines to the players,
the voicing buttons, the seeded shuffle):

> *"Please make a note to do for later. I want to develop a harmony module that more or less captures and uses all the functionality
> here in the strikes module … the menu to the left with all the harmonies there, click one, and it appears on the keyboard … the
> voicings … reshuffle voicings … the seeded shuffle at top … the arrows or lines to the instruments, and then being able to choose
> individually the articulation for the instrument. And this will include all the strikes, the cord shapes from the 2piano2perc,
> keyboard module, the blasts from the tuba, and other ones, all the harmonies I've collected so far, including the messiaen,
> including clusters, tone rows, octaves, stacked 5ths these are in the tuba. We'll have to do a scrape of my pieces. save this for
> later, we'll build a plan for a harmony module."* → **CN-35; PLAN 1d re-set** as a MODULE (the strikes drawer's facility over every
> collection), to be planned with the planning method on his word. Not built.

> *"For the beating drawer. I would like the harmonies in this format on the left. and I want forty six strikes in its own banner in
> the same scroll menu but its own banner that I can collapse. And then I'd like the blasts from the tube a piece in its own banner,
> and I'd like the chord shapes from the two piano, two percussion piece. in its own banner. And same functionality. I click it. I see
> the layout on the keyboard. be able to hear just the chord.  use the piano voice for play back of just the harmony there won't be
> any assignment with the dotted lines to instruments. Instead, I'll be able to assign any note in that harmony to a beating pair.
> and I'll do that manually using the same facility we have now in strikes. So I'll double click a note on the keyboard and then click
> a node connected to a pair. And then this selection, just like with the strikes, the harmony selection and the assignment will save
> with the take."* → **CN-36; MORPH_NOTES §3; built at once.**

**The scrape (the first pass of PLAN 1d's, for the drawer):** `tools/harmony_scrape.js` → `bank/harmonies.json`, read-only on the two
repos. **The tuba's blasts:** `for_seven_tubas/bank/blast_taxonomy.json` — 138 sonorities are **39 distinct pitch sets** (a sonority =
chord × voicing × articulation; the same set recurs with cuivre mods), each named by its first S-number and its chord · voicing, the
others as aliases; the harmony families' own voicings add 6 more sets → **45**; the 12 octave-unisons (S049–S060) among them; 13
families (VERT01-01 · 06 · 08 · 14 …) carry no pitches in the taxonomy — their sets came through the sonorities; the "more chords"
list kept as a tag. **The two-piano chord shapes:** `composer_data/*.json` → `databases.chordShapes` in 91 saves (the keyboard
module's shapes: interval sets with the MIDI they were captured from) — **54 distinct interval sets** by union (the ids `cs_NNN`
differ per save; re-numbered `cs-001…` by first creation), each with the saves it appears in. **The strikes** stay live from
`bank/scattered_strikes.json` (46). Still to scrape for the module: the Messiaen modes, clusters, tone rows, octaves, stacked fifths
(the tuba piece), the quartet's and the trio's harmonies.

**The drawer (`beating_panel.js`):** the strike `<select>` gone; **a scroll list on the left** (the strikes drawer's column, 260 px) in
**three collapsible banners** — STRIKES 46 · BLASTS · the tuba piece 45 · CHORD SHAPES · 2 pianos 2 percussion 54 — each row the id,
the name, the notes, the range (a blast's aliases in its tooltip); the chosen one highlighted and kept in view; the body's three
columns scroll on their own. **A click puts the chord on the keyboard** (the name beside ▶ chord); **▶ chord hears it alone on the
piano voice** (the piano's port, channel 1, CC7 127, velocity 88, 1.5 s; the notes remembered for the stop — §176). **A double-click
on a note arms it** (a click still does); **every pair's row has a NODE** at its left (the drawer's "the lines land here" dot), lit
in the row's colour while a note is armed — click it (or anywhere on the row) and the note is the pair's lower note; the drag from
step 5 stays. **The take saves the harmony** (`state.harmony = { bank, id }`, the comment names it) and restores it with the pairs'
notes. A beating born on a strike note still opens on its strike (now highlighted in the list).

**Verified on a copy (`zz-ai-beating`, :5301), with real DOM events and fake outputs:** the three banners with 46 · 45 · 54 (145
entries); the strikes banner collapsed → 99 entries, none of them strikes, expanded again; the blast S001 clicked → highlighted, its
9 pitches (F#1 below the span's C2 counted by the ▼ arrow, 8 dots), "S001 · VERT01-28 V4"; ▶ chord → the piano port only, channel
1, CC7 before the first note-on, 9 note-ons at 88, 9 note-offs 1500 ms later, 9 notes registered for the stop; the chord shape
cs-001 (M7: D2 C#3) on the keyboard; cs-002 (m2 P5: C4 C#4 G4) → **a dot double-clicked → armed, the second pair's node lit, the node
clicked → the pair on that note**; a take saved with the harmony ("chordShapes cs-001 · BCl+Va D3 unison · Fl+Vn1 F#5 unison ·
6 s"), the harmony switched to a blast, the take loaded → the shape back on the keyboard with the pairs' notes, the take deleted. No
console errors.

**Not done, by his words:** the voicing presets, the seeded shuffle, the lines and the articulation per player — the harmony
MODULE's (CN-35, PLAN 1d), not the beating drawer's. His listening still to come.

## §178. "i still have a trapped viola note playing" — the rack silenced again; the second way a long note could be trapped (any audition's stop clears the shared queue) closed: a long note's off is never queued ahead now — the tick sends it when due, an audition from a timer

Composer, 2026-09-07 late morning: *"i still have a trapped viola note playing"*. The panic script run again (every port silenced);
his server was serving the fixed page (the ■ Panic button and `releaseSounding` present), Reaper idle.

**What §176 had left open, found by reading every `clear()` in the page:** `stopTrillAudition` and `stopBeatingAudition` call
`out.clear()` on the outputs they use — the SHARED Web MIDI outputs. A trill's ▶ hear or an interval chip, or the panel's own stop,
while a beating was sounding through the transport (or another audition), cancelled every queued message on that output — the
long note's note-off among them, queued up to 30 s ahead. The transport's stop would have released it (§176's registry), but with
the transport idle nothing did; and an audition that ended by its own timer released nothing either (`_beatingAud` already null).
The viola: the partner of the last strike's cello — the pair the B launch makes — its bow trapped by exactly that.

**The fix — a long note's release is never in the queue:** (1) the zone tick no longer schedules a long note's off with its on; the
note is registered (`noteSounding`) and **`tickSoundingOffs` sends the off when its end enters the 100 ms lookahead** — the
plain-note tick's own rule (`OFF_HORIZON_S`) — timestamped at the end; (2) an audition (`playBeatingEvents`, the panel's ▶ chord),
which no tick serves, registers each note **with a timer that sends the off at its end** (a JS timer: ±5–80 ms on a long note's
release, inaudible; measured 686 ms for a 600 ms note); `stopBeatingAudition` releases through the registry (the timers cleared);
(3) a stop or a panic still releases everything registered. Short notes (≤ 150 ms — the trills') keep the queued off: a clear
within 150 ms of a note-on costs nothing audible.

**Verified in the pane (a copy, fake outputs):** the tick — two beating notes on, **no offs queued** (2 registered, no timers);
driven on, the offs go out 0.1 s before the end, timestamped exactly at the end, the registry empty; the audition — a 0.6 s
beating, 2 notes registered by timer, **eight foreign clears issued, the two offs still arrive** 686 ms after the on, the registry
empty; ▶ chord — 3 notes on the piano, 3 offs 1.5 s later from timers. No console errors.

**For the tool's memory (MORPH_NOTES §3, the trapped-note entry):** never queue a long note's release ahead of time on a shared
output — a stop, a panic, another audition's stop may clear the queue; send the release when it is due, from the tick or a timer,
and keep a registry a stop can drain.

## §179. His six asks for the beating drawer's pitch side, one to discuss first — the pair's range check; the data, the AI's suggestion and the questions put to him (planning method, phase 1; nothing built)

Composer, 2026-09-07, late morning, with three screenshots of the strikes drawer (the voicing buttons, the keyboard with the fold
mark E4↑ on Violin 1 and the dotted lines, the shuffle head) — his words verbatim in MORPH_NOTES §3. Six asks: the voicing buttons ·
the octave box and an octave range for the reshuffle · the assignment lines from key to node · the players' ranges as columns on the
keyboard · the player menus not self-limiting, the ↑ / ↓ fold mark instead · **to discuss first: the pair's range — both notes in one
octave (unison, a fifth, an octave at most), the fold and the conflict when only one player can reach the note.** *"let me hear your
suggestions about that and discuss before making changes"* → the planning method: the data, the restatement, the suggestion, the
questions only he can answer. Nothing built.

**The data (what exists):**
- The strikes drawer (STRIKES_TOOL F, U7 → U10): a hand assignment that does not fit **folds by octave into the range** — `foldInto`
  moves the note up while it is below the range, down while above — marked ↑ / ↓ on the chip; or is **skipped** (✕, nobody plays it);
  the shuffle never misfits; the voicing presets move octaves only, the harmony never changes (B, L).
- The beating panel today: a pair holds ONE MIDI number, its LOWER note (§158); the partner sits above by the interval (unison ·
  m3 · M3 · P4 · P5 — no octave); `BeatingCalc.pairsFor` says which pairs can play a note (at unison both hold it; at an interval one
  the lower, the other the upper); the partner menu lists only the lanes that can (the self-limiting menus he dislikes); the
  keyboard dims the keys the active pair cannot play; a note out of reach is refused, never folded.
- The ranges that matter (the ordinary voices, measured): flute C4–C7 · bass clarinet A#1–F4 · violins G3–F7 · viola C3–A6 · cello
  C2–B5. Two players share at least one octave-related pitch for every pitch class EXCEPT the bass clarinet with the flute: their
  overlap is C4–F4, so at unison they share only C · C# · D · D# · E · F — a G has no common octave (the bass clarinet's G3, the
  flute's G4) — and at an octave apart they do (G3 + G4).

**The AI's suggestion, put to him:**
1. **The pair folds as a unit.** A note from the sonority is folded by octave to the nearest octave where BOTH players hold their
   notes (the lower on the note, the partner above by the interval) — as-is first, then the nearest k, ties downward. Both players'
   boxes show the actual pitch with ↑ / ↓ (the drawer's mark); at unison both carry the same mark.
2. **The interval gains the octave** (P8: ratio 2:1, the partial p = 2, no just offset), since he names it; unison · fifth · octave as
   the usual three, the thirds and the fourth kept as tries.
3. **When no octave serves both at the chosen interval, a ladder the panel offers, never applies by itself:** (a) the interval that
   would serve — the octave apart, then the fifth — one click; (b) another player for the seat — the menus list all six, each marked
   with what it would sound (the pitch and the arrow, or ✕ out of reach); (c) skip the pair on this note (✕, the drawer's third
   option). The row says which of the three it is waiting for.
4. **A pair remembers WHICH note of the sonority it holds** (its index), not a MIDI number: the octave box and the voicings move the
   sonority, the pair's pitch follows and refolds — the drawer's rule (the harmony never changes; the octaves move). The pitch typed
   by hand stays a MIDI number.

**The questions only he can answer:** (Q1) is "at most an octave apart" a hard rule — the intervals offered become unison · m3 · M3 ·
P4 · P5 · P8, nothing wider? (Q2) when unison cannot be reached at any octave, may the panel switch the interval by itself, or only
offer it? (Q3) the pair follows the sonority's note through voicings and octave moves — wanted? (Q4) the tie when two octaves are
equally near: down (the lower, more sustainable register) or up?

**§179 — correction, same hour (computed, not read off the ranges):** three pairs cannot reach a unison on some pitch class, not
one — flute + bass clarinet on F# G G# A A# B (overlap C4–F4); bass clarinet + violin 1 and bass clarinet + violin 2 on F# only
(overlap G3–F4). Every other pair reaches every pitch class at unison somewhere. The viola and the cello pair with anyone on anything.

## §180. His answers to §179 — the pair's range model decided; the six asks go ahead without the full plan regime

Composer, 2026-09-07: *"Q1 yes, Q2 b, Q3 yes, Q4 a; and no need for the entire plan regime if this is clear what needs to be done.
You can go ahead."* So: **(Q1) at most an octave apart is a hard rule** — the chips become unison · m3 · M3 · P4 · P5 · P8, nothing
wider; **(Q2) when unison is unreachable at any octave the panel only OFFERS the switch**, never applies it (the strikes rule: the
tool never changes his harmony); **(Q3) a pair remembers which note of the sonority it holds** and follows it through voicings and
octave moves; **(Q4) a tie between two equally near octaves folds DOWN.** The six asks (MORPH_NOTES §3, 2026-09-07) built next as one
chunk sequence, each verified on a copy; the results in the entries that follow.

## §181. The pitch side's second pass BUILT (his six asks of §179, his answers of §180): the voicing bar with the octave box and range, the pair's fold as a unit with the arrows, the ladder, every player in the menus, the lines from key to node, the range columns, the octave interval — verified with real DOM events on a copy; his test pending

Built 2026-09-07, early afternoon, on `scores/zz-ai-pitch2.json` (a copy of the piece on :5301, deleted after; the piece file untouched).

**The math (`score/public/beating_calc.js`; `tools/beating_calc_check.js` 77 → 102 checks):** `INTERVALS.P8` (the octave: 2:1, the
2nd partial, no just offset — Q1: six intervals, nothing wider) · `foldPair(recipe, note, interval, a, b)` — the pair moves by octaves
AS ONE UNIT to the nearest octave where both hold their notes, k tried in the order 0 · −1 · +1 · −2 · +2 … (as written first, the
nearest next, a tie DOWN — Q4), the roles from `pairsFor` at the folded pitch so the page and the panel agree by construction; null
when no octave serves · `pairLadder` — the offers: the intervals that would serve in `LADDER_ORDER` (unison · fifth · octave · the
thirds · the fourth), another player for either seat, each with its fold · `seatOptions` — every other player with what it would
sound opposite a given one (the menus' labels) · `voiceChord(pitches0, { preset, seed, oct, below, above }, span)` — the strikes
drawer's presets over the pitch classes (original · spread out · cluster · cluster low · cluster high · high + low, `pack` and
`nearestOct` ported), then the OCTAVE BOX moves the whole sonority, then the OCTAVE RANGE scatters every note by a seeded random
octave inside −below … +above, the piano's ends clamping; pure — the same five numbers give the same voicing, so a take carries them.
The checks: the flute + bass clarinet on G4 at unison null, at an octave apart G3 + G4 (folded down), at a fifth G3 + D4; C7 for the
cello + flute folded two down; the tie down on an artificial recipe; the ladder's order P5 · P8 · P4 for that case (the thirds would
put the flute below C4 — so they are not offered); the presets keep the pitch classes, the cluster inside one octave, the range ±1
with seed 3 moves some notes and never more than an octave.

**The block (`zone.beating`):** `srcPitch` (the note as given — the sonority's or typed) · `pitch` (what sounds, after the fold) ·
`fold` (the octaves moved) · `noteIndex` (which note of the panel's sonority — Q3) · `skip` (nobody plays it). `regenerateBeating`
makes no notes for a skipped pair (`skipped: true`, count 0); `beatingLabel` shows the fold ("on E4↑ from E3") and "✕ skipped";
B on a note folds as a unit — the nearest lane that holds the note as written, else the fewest octaves.

**The panel (`score/public/beating_panel.js`):** the VOICING BAR (six presets, oct −3 … +3, range −0…3 … +0…3, ↻ reshuffle = a new
seed, the seed input and the last eight seeds as chips — the drawer's U8); a sonority keeps its original pitches (`midi0`) and is
voiced from them; a pair holding a note of the sonority follows it through the voicings and the octave box and refolds (Q3); a new
sonority keeps a pair's index only where the voiced note at that index is the pair's note as given (a reopened beating, a loaded
take), else clears it. THE PAIR'S ROW: the partner menu lists EVERY player with the pitch it would sound and the fold mark, ✕ when no
octave serves (§180 — no self-limiting); a chip beside each seat with the pitch actually sounded and ↑ / ↓; the pitch box holds the
note as given with "→ E4↑" after it when folded and "note 19" when it is the sonority's; the interval chips gain the octave; THE
LADDER under the header when no octave serves both (Q2 — offered, never applied): the intervals that would, with both players'
notes; another player instead of the partner (and instead of the launching player when the pattern is not bound); ✕ skip — a click
applies that one change and refolds; a skipped pair says so and offers "play it". THE KEYBOARD (236 px): the six players' ordinary
ranges as coloured columns at the left with a legend above, ▲ / ▼ past the view; the keys lit where the active pair holds the note
as written, half where it would fold (the title says to what), dim where no octave serves; the sonority's dots carry their index;
the pairs' rings show what SOUNDS (dim when skipped). THE LINES: an SVG over the body, a dotted line in the row's colour from the
assigned note's dot (or its key when the note is not in the sonority) to the pair's node, redrawn on render and on either column's
scroll, not drawn when its end is scrolled out of sight. Assign never refuses; the status says the fold ("pair 1 on G4 → G3↓ (1
octave down, both players) · Fl G4 · BCl G3 (octave)") or the conflict. The deal uses the fold. The take carries `voicing`.

**Verified on the copy with real DOM events (clicks, dblclick, change), the numbers:** 145 entries in the list; strike #3 (20 notes)
picked; 6 range columns, the legend "ranges Fl BCl Vn1 Vn2 Va Vc"; the six presets each equal to `voiceChord` on the same numbers;
oct +1 = every note +12; range −1 … +1, ↻ → seed 2, 12 of 20 notes moved, none more than an octave, the chips "2, 1", chip 1 → the
seed-1 voicing back; the range off → the original. E3 double-clicked, the node clicked → index 18, as written, the chips "E3 E3";
oct −1 → the pair follows to E2 and refolds to E3↑ (the viola's bottom). The flute launching: the menu reads "Bass Cl. — E4↑ | Violin
1 — E4↑ | …". Flute + bass clarinet on G4: the chips ✕ ✕, the flag out-of-range, the ladder "fifth: BCl G3 · Fl D4 · octave: BCl G3 ·
Fl G4 · fourth: BCl G3 · Fl C4 · instead of BCl: Vn1 G4 … · instead of Fl: Vn1 G3↓ …"; the octave offer taken → P8, G3, fold −1, the
chips G4↓ G3↓, the bass clarinet lower and the flute upper, no flags, the rings G3 (lower) G4 (upper); unison again, skip → 0 events,
"✕ skipped", the ring dimmed; play it → 283 events; the Vn1 offer → G4 as written, no ladder. Fifths dealt from C4 → C4 as written.
A take saved (spread, oct +1, index 18, E7 → E6↓), the panel disturbed, the take loaded → the same block and voicing byte for byte,
the chord and the harmony back; deleted. Insert → the zone E3 → E4↑ (index 18 kept on the rebound panel), 361 events; the label
"beating Fl + Vn1 on E4↑ from E3 (unison)". B on the flute's C6 → Vn1 as written; B on the bass clarinet's D#2 → the cello as
written. The lines: with a 1400 × 900 viewport one dashed line per assigned pair from the key's right edge (x 427, y 609) to the
node (x 534, y 18) in the row's colour; two pairs → two lines. No console errors, no page errors.

**Two test artifacts, not defects:** the Browser pane was hidden — its timers throttled (the first script timed out; split into
scripts without waits) and `requestAnimationFrame` never fired (`renderLines` called directly); with the pane hidden the layout had
no height, so the lines' out-of-sight rule drew nothing until the viewport was emulated. No screenshot could be taken (the page did
not draw); his own reload shows it.

## §182. His first hour with the drawer — nine asks built in one pass (the sequence strip, per-pair length and play, SPACE by focus, the number boxes freed, the slopes, the level box keeping a drawn shape, pair takes, the crosshair), the stutter examined (the streams are smooth), the level scale answered; his call for a different way of working held for the discussion

Composer, 2026-09-07 afternoon (verbatim in MORPH_NOTES §3): *"go ahead and make these changes, but then afterwards, can we have a
discussion about how to proceed? … make the changes above first. and put it in to the drawer so I can start using it"*.

**Found first, then built:**
- **"when I change the duration the pair. It snaps back to the original shape"** — not the duration: the LEVEL box (`to … /s`). Its
  handler popped the row's preset in again at the new level, and for a drawn or dragged shape (`shape: 'drawn'`) the pop fell through
  to a BURST. Now `setLevel`: a preset shape pops in again at the new level; a drawn or dragged shape (and any unlocked pair) is SCALED
  so its heard maximum is the new level — the shape kept. A duration change never touched the curves (they are over normalised time).
- **The stutter "in bigger intervals … sounds like bcl"** — examined, not heard here. The emitted streams for his pair (Fl + BCl on D4,
  a hump to 7/s over 6 s, the crescendo following the beating 0 → 1) computed in node: the bend sent every 50 ms, 120 events per
  player, the largest step 0.34 c (29 units of 16384 on the bass clarinet's 0.98-st range); CC7 108 / 78 events, steps of 1–2, rising
  monotone then falling. The string quartet's crescendo and glissando generators used the same 50 ms grid for bend and CC7
  (AI_CRESCENDO_PROMPT_GUIDE, AI_GLISSANDO_PROMPT_GUIDE) and were smooth there. So the data leaving the app is as smooth as #1's; the
  cause is not the emitted stream. Three candidates left, only his ear can separate them: (a) the beating itself — at 7/s the beating is
  a fast tremolo, and at his ±6 axis a "bigger interval" between the curves is a faster beating, which reads as a stutter; (b) the
  sampler's response to the bend + CC7 pair on the bass clarinet (Kontakt / Xsample), which #1 never asked of a wind; (c) in the
  TRANSPORT only, the tick's 100 ms lookahead under a slow frame — an event older than 50 ms is dropped (`tickZoneMidiPlayback`), which
  cannot happen in the panel's own play (all events are queued at once with timestamps). The A/B for him: the same pair at 2/s (a → gone),
  with the crescendo flat (b's CC7 half → gone), from the panel vs from the transport (c). No change made to the streams.
- **"what is the 0-1 volume scale? … db, velocity?"** — neither: the score's curve height (D23, NAMING §2.9): 0 = the softest held
  dynamic, 1 = fff, mapped per instrument by 1g's loudness remap (a velocity for the note and a CC7 trim, measured in the rack) so the
  same height is the same loudness on every instrument; for a held note the height runs over the ensemble scale 65–127 (`HELD_LO/HI`).
  Now in the boxes' titles.
- **The sequence (his items 1 and 9):** a row has its own `length` and `offset`; the sequence is as long as the last pair's end; the head's
  box stretches the whole sequence in proportion; a `len` box and **▶ pair** in every row; **the sequence strip** under the voicing bar:
  a track per pair, the pair a zone drawn with its heard-beating curve and its label, the body dragged moves it in time, the right edge
  is its length (the shapes kept — `stretch`), the left edge starts it later keeping its end, 0.05 s steps; a bound zone moves in the
  score as it is dragged (the group's first start is the origin). The offset rail is gone. The strip and the rows follow each other live.
- **SPACE follows the focus:** `space → sequence / pair N / chord` in the head; a click in a row makes its pair the focus, a click in the
  harmony list or on the keyboard the chord, the ▶ sequence button or the strip's background the sequence; SPACE while playing stops.
  **A number box never traps SPACE**: it is blurred and SPACE plays (text boxes keep their SPACE).
- **The slopes:** the calc module's curves carry an optional third number per point, the slope of the segment after it (−1 … +1), the
  score's own power model (`y = a + (b − a) · t^(4^slope)`); it survives sorting, scaling, mirroring and the lock; a diamond at every
  segment's middle on both rate curves and on the crescendo — drag up / down bends it, the wheel steps it by 0.05, ALT-click straightens;
  the bold curve is drawn sampled through its slopes. 107 checks in node.
- **Pair takes:** `save pair` / `load pair…` in every row — the curves, the level, the breaths, the interval, the length, the lock and the
  axis under a name in the `beatingPairs` bucket of bank/panel_snapshots.json; a load keeps the row's players and note.
- **The crosshair** on the keys and the dots instead of the hand.

**Verified on `zz-ai-seq` (a copy, deleted) with real DOM events:** the strip with two tracks (80 × 1372 px), the len boxes, ▶ pair ×2,
save pair ×2, four slope diamonds on a hump, 61 keys and 19 dots with the crosshair, no offset rail; the level box on a dragged shape:
the three points kept, the peak 4 → 5.03 so the heard maximum is 4.99 (the sampling grid); the pair's length 6 → 9 with the shape byte
for byte the same; a slope 0.8 on the first segment: both mirrored curves carry it, the rate at 15 % of the segment 0.31 where a
straight line gives 1.25, two diamonds lit; the second pair dragged 120 px → @ 0.95 s, its right edge +100 px → 6.8 s, the sequence 9 s;
the sequence box 9 → 18: every offset and length doubled; SPACE with a number box focused: blurred, the active pair alone (Fl + Vn1, two
notes from 0); the sequence: BCl + Va at 312 ms and Fl + Vn1 at 2212 ms (= 300 ms lead + 1.9 s); the chord: 19 notes on the piano; a
pair take saved, the pair flattened and shortened, the take loaded: the shape, the length and the interval back, the players and the
note kept; a pattern take carries lengths and offsets; insert → two zones at 179.924→197.924 and 181.824→195.424 with the META shape;
the bound zone dragged in the strip → 180.874 (= the origin + 0.95), "the zone moved in the score". No page errors from the panel (two
from synthetic keydowns dispatched on `window`, which real keys never do). The screenshot taken this time.

## §183. Strategy A chosen, B a standing rule, C held; his workflow walk-through written back as a script of 23 lines, each marked works · awkward · missing — the one sweep to build, and the parts I think he left out, put to him

Composer, 2026-09-07 late afternoon: *"ok lets do A, b into how we work, lets hold on c, it might emerge organically as I build the
first beating sequence"* — then the narration (verbatim in MORPH_NOTES §3). **B written into HOW_WE_WORK** (a panel borrows the score's
idiom: curves, zones, takes, SPACE — no panel-only invention). **C held** (the listening ladder may come by itself as he builds the first
sequence).

**The script, his narration read back (the marks against the drawer as committed at 8192361, i.e. after a hard reload):**

*Stage 1 — the harmony for the whole sequence*
1. Click a chord shape in the list, press SPACE, hear it on the piano, see it on the keyboard. — **works now** (SPACE follows the focus
   since §182; his drawer at the time lacked it).
2. See where the ranges fall (the columns). — **works.**
3. Reshuffle or change the octave so it fits the instruments he wants; try shuffles and hear them. — **works** (the voicing bar).
4. The pitches for the sequence are settled.

*Stage 2 — a pair*
5. Make a pair; ASSIGN A PITCH FIRST (double-click the note, click the node); then choose the two instruments by ear, maybe change them,
   maybe reassign the pitch; hear it. — **works, awkward:** a new pair is born with a default pitch and default players that mean nothing
   to him. Sweep: a new pair is born EMPTY of pitch (the row says "assign a note") with the nearest free players; the first assignment
   fills it.
6. The default curve should already sound like a beating: "eight or nine second ramp or hump that holds at max for a few seconds and then
   comes back down". — **missing:** the birth default is a 6 s hump 0 → 3/s with no plateau. Sweep: the default is 9 s, attack 2 s ·
   hold 4 s · release 3 s at 3 Hz — the ADSR shape — and "hold" joins the menu.
7. Establish the maximum beating: one number box, relabelled "Hz" ("/s" is confusable with the seconds boxes), spun up or down or typed,
   and "listen to a passage of max beating". — **missing:** the box exists as "to … /s" without an audition. Sweep: "max ▢ Hz" with
   ▲ / ▼ and the wheel, and a **▶ max** button that plays 4 s flat at that rate on this pair; every "/s" in the drawer becomes "Hz".
8. The shapes: presets are good but unpredictable; "the first few are custom, but then I can store those as preset shapes". — **missing:**
   pair takes save a whole pair, not a shape. Sweep: **save shape** stores the heard curve normalised (max = 1) under a name in a
   `beatingShapes` bucket; his shapes appear as buttons after the built-ins, in both the rate and the crescendo menus.
9. The burst: adjust how quick it reaches max (instrument-dependent, by ear), how long it holds, the decay to the end — "pretty classic
   ADSR". — **missing as a shape:** sweep: the ADSR shape with three handles (attack end, hold end, the end) — the hump and burst stay.
10. "I couldn't drag the final node. That would have been intuitive to change the duration visually." — **missing:** the end handle is
    pinned at p = 1. Sweep: dragging the last handle sideways changes the PAIR'S LENGTH (the strip follows); vertically its value as before.
11. Adding points: the draw button on / off is awkward — "if you have a quick, easy alternative". — **awkward:** sweep: **double-click on
    the curve area adds a point** (ALT-click removes, as now); draw mode stays for freehand.
12. "change the ramps of the individual curves … the attack a different curve shape". — **works now** (the slope diamonds, §182).
13. Store the burst shape once it is right. — line 8.

*Stage 3 — the volume and the crescendo*
14. Easy controls for the level curve, the maximum adjusted quickly. — **works** (the low / high boxes, the handles).
15. "draw in peaks and values for individual players … maybe they reach max at different times or there's several humps". — **missing:**
    one crescendo serves both players. Sweep: a level curve PER PLAYER (`levelCurve: { lower, upper }` in the block; `renderPair` takes
    both), drawn in the two players' colours in the lane, a "together" lock on by default (edit one, both move) like the rate lane's mirror.
16. A plateau, then "move that plateau around". — **missing:** sweep: dragging a SEGMENT's body sideways moves both its points (a plateau
    slides); the "hold" (ADSR) shape in the crescendo menu.
17. "the volume wasn't that intuitive, zero to one … Ultimately a scale from PPP to FFF" — and "the quiet wasn't quite enough … should go
    from quite quiet to max also based on the volume tests". — **awkward + a defect:** the level 0 maps to 65 on the ensemble scale (the
    trill's held-note floor, `HELD_LO`), so a beating's softest is about mp. Sweep: the crescendo lane reads ppp … fff (nine steps, the
    boxes take them), and a beating's level runs the whole measured scale — ppp at the remap's floor, fff at 127 — its own constants,
    not the trill's.
18. The breaths: "all the warnings and whatnot are throwing me off" — wanted: faint markers at the ideal maximum breath length (every
    11 s, say) in the crescendo part; click to place a breath (a dotted line, distinct from the ideal marker), drag it; a randomizer for
    the whole pair with two choices, random and unison. — **awkward:** sweep: the lane redrawn — the ideal ticks (the ceiling at this
    level, per player, from the start), the hand marks as dotted lines, no ceiling bars, one ⚠ only where a span is longer than the
    ceiling; the modes become **random · unison · by hand** (unison = both players at the same marks, phase 0); the shuffle stays.
19. Save the pair construction. — **works** (pair takes, §182).

*Stage 4 — the sequence*
20. A pair is in the timeline as a zone from the moment it is made, live-linked both ways; the timeline has its own duration. —
    **works now** (the strip, §182) except the duration: sweep: the sequence box sets the TIMELINE'S SPAN (room to drag into), not a
    stretch; the content length is a readout.
21. More pairs the same way; three zones; drag them, drag an end for the duration, the pair builder follows and vice versa; play a zone. —
    **works now** (a click on a zone makes its pair the focus; SPACE plays it).
22. At any point change any stage — e.g. another harmony: pick it, reshuffle; "maybe there's an initial assignment automatic", the
    assignments changeable, "an easy way to revert back to the original choice". — **missing:** a new harmony clears the pairs' notes.
    Sweep: on a harmony change a pair takes the note at its SAME INDEX in the new sonority (else the nearest pitch), so the sequence
    re-voices at once; **auto-assign** deals the sonority to the pairs that have no note (low to high); **revert** brings the previous
    harmony, voicing and assignments back (one level).
23. Save the sequence take; insert at the cursor. — **works.**

**The parts I think he left out (put to him):** hearing a pair IN CONTEXT — mute / solo per track in the strip, so one pair is heard
against the others (his "I wanna hear it in context"); the two players' PHASE (the body slide) and the INTERVAL chips, which the
narration never reaches — kept, no question; an UNDO inside the drawer (one level, for a wrong drag); LOOP while adjusting (the pair
plays round while a handle is dragged); the pair's EXIT — the default returns to unison at the end; a pair that ENDS on its maximum (a
cut) is a shape question the ADSR handles. The build waits for his word on these.

## §184. The sweep BUILT — the walk-through's misses in one pass, his refinements taken (born empty; hold the line to bend; ppp … fff over the whole measured scale; fourths and fifths one family; mute / solo, undo, loop) — the script walked on a copy with real events; two defects found on the walk and fixed

Composer, 2026-09-07, his refinements to the script (verbatim in MORPH_NOTES §3): a new pair born with its node disconnected, the
note assigned by double-click + node, the drag behaviour gone, both players as pull-downs, everything dynamic on a harmony change;
the curves "like logic pro or daw: hover over curve line, vert dbl arrow mouse, drag up/down, left/right"; the level "ppp to fff …
make sure we're getting the already calibrated volumes per instrument"; a–d good; "if I change it to a fifth and that pushes one of
the players out of range, that it gets dropped an octave or popped up an octave. fourths and fifths can be considered the same";
*"Otherwise, go ahead."*

**Built (`beating_calc.js` · `beating_panel.js` · `composer.html`; 114 checks in node):**
- **Born empty** (line 5): a new pair has no note; the row says "assign a note — double-click a note on the keyboard, then this node";
  player 1 and player 2 are pull-downs on every row (a bound zone moves to the lane chosen); the dot drag is gone; the crosshair stays.
  `beatingDefaults` allows a null pitch; the page makes no notes for a pair without one and labels it.
- **The birth shape** (line 6): the ADSR — `SHAPES.adsr`, rise to 0.22, hold to 0.67, fall — at 3 Hz over 9 s ("hold" first in the menu;
  B on a note makes a 9 s beating too).
- **The maximum** (line 7): "max ▢ Hz" with the arrows and the wheel; **▶ max** plays 4 s flat at it; every "/s" is "Hz".
- **His shapes** (line 8): "save shape" stores the heard curve normalised in the `beatingShapes` bucket; a ★ button among the shapes
  for the beating and for the crescendo; ALT-click deletes; the level box re-pops a stored shape at the new maximum.
- **The curves as the score's curve windows** (his correction of my diamonds): HOLD THE LINE — a vertical drag bends the segment under
  the mouse toward the mouse (the power model, ±1), a sideways drag moves its points (the attack's end, a plateau), SHIFT-drag slides
  the whole curve in time, the wheel bends a step, ALT-click straightens, a double-click adds a point; the END HANDLE dragged sideways
  is the pair's length (line 10); draw mode stays for freehand.
- **A crescendo per player** (line 15): `levelCurve: { lower, upper }` in the block, `renderPair` takes both (the samples carry
  `levelL / levelU` and their mean for the META contour); the lane draws both in the players' colours with the same line gestures;
  "together" (one curve, edit one, both move) or "each"; the shapes and his stored shapes pop into it between low and high.
- **The dynamics** (line 17): the boxes take ppp … fff (or a number); the lane's axis reads ppp · mf · fff; **the beating's loudness
  runs the whole measured scale** — the bank's floor (anchor 20, −50 dB) to 127, not the trill's 65 — through the remap per
  instrument (`LV_LO` from `bank.scale.lo`). At ppp the flute's first note takes velocity 30 and CC7 trims to 54.
- **The breaths** (line 18): the lane shows the ideal breath length as faint ticks per player (also in the crescendo lane), the marks
  as dotted lines (yours bold), a click places one, a drag moves it, ALT-click removes; no bars, one ⚠ past the ideal; the modes
  **one · random · unison · by hand**; UNISON = one deal on the stricter ceiling, the same marks for both (`phase: 0`).
- **The timeline's own span** (line 20): the head's box is room, not a stretch; the strip never shorter than the content.
- **A harmony change re-assigns** (line 22): a pair keeps its index in the new sonority, else the nearest pitch; **auto-assign** deals
  the sonority to the empty pairs (SHIFT: all); **revert** brings the previous harmony, voicing and assignments back (remembered by
  the pickers before they change anything).
- **Fourths and fifths one family:** `foldPair` takes `noteIs: 'upper'` (the note given is the pair's upper note); when no octave
  serves a fifth (or a fourth), `refold` tries the other with the note as its other end and marks the row "inverted"; `INVERSION`.
- **a–d:** mute / solo per track in the strip (the sequence's play honours them; a pair alone ignores them); **↶ undo** one level and
  CTRL+Z inside the drawer (a snapshot before every edit; the score's undo untouched); **⟲ loop** — the play goes round until stop,
  every round takes the edits; the phase slide and the interval chips kept.

**The walk on `zz-ai-sweep` (a copy, deleted), the script's lines with real events:** stage 1 — the chord picked, SPACE plays it on the
piano (19 notes), the focus "chord". Stage 2 — the pair born empty (no note, the ADSR of four points, 9 s, the strip "pair 1 · bass_ +
flute · no note · 9 s", player 1 six lanes, player 2 five names); a dot double-clicked → armed (the drag gone: `startDotDrag`
undefined); the node clicked → F3 → F4↑ for BCl + Fl, the chips "F4↑ F4↑", the menu "Flute — F4↑ | Violin 1 — F4↑ …"; "max Hz" and
▶ max (two notes, four bends); the shapes "hold, hump, burst, long arc, ramp out, ramp in, flat"; a shape saved (normalised
[[0,0],[0.22,1],[0.67,1],[1,0]]), its ★ button, popped at max 5 → [[0,0],[0.22,5],[0.67,5],[1,0]], re-levelled to 7 by the box,
deleted. The line held: a vertical drag on the attack → slope −0.4 (above the line, as dragged), a sideways drag on the plateau →
0.22/0.67 → 0.296/0.746 (the hold kept); the end handle +100 px → 10.15 s, the shape kept, the strip following; a double-click →
a fifth point, draw off. Stage 3 — "hold" popped into the crescendo → { lower, upper }, the axis ppp · mf · fff, two ideal ticks;
mp / ff typed → 0.429 / 0.857; "each" then the upper's peak pulled down → the curves differ, the two CC7 streams differ in the
snippet; unison breaths on a 30 s pair → [6.8, 11.23, 18.03, 24.83] for both; random → 3 + 5, different; ppp … fff following the
beating → the flute's first note at velocity 30, CC7 down to 54, the peak at 113 / 107. Stage 4 — a second pair born empty, auto-assign
→ A#4; mute → only pair 1's ports play, solo → only pair 2's; the timeline box 30 → the span 30, the lengths untouched; loop on →
the args kept; CTRL+Z in the drawer → the max 12 back to 7, the score's undo stack untouched; another harmony → pair 1 follows
(the nearest pitch), revert → the first harmony, voicing and assignments back; insert with an empty third pair → two zones (10.15
and 9 s) and the shape, the empty one skipped; player 1's pull-down on the bound zone → the zone on the violin 1 lane, in its group,
the label "Vn1 + Fl on F4↑ from F3". No page errors.

**Two defects found on the walk, fixed before the commit:** (1) `beatingSpec` passed only an ARRAY level curve to the math — the
per-player object fell back to "follows the beating", so a crescendo per player (and any edited crescendo in the object form) never
reached the sound; now both forms pass. (2) `revert` remembered the NEW harmony: the pickers set `this.harmony` before the memory
was taken; now `rememberHarmony()` runs at the top of both pickers. One test artifact: `openNew` keeps unbound rows when nothing is
selected, so a second script saw the first script's lock state — not a defect.

## §185. His first test of the sweep: the bend rebuilt as the score's grab-and-pull control point (two degrees of freedom), the hold shape's attack and release in SECONDS, the end handle at 50 px per second, SHIFT clamps a node — and his settings so far, on record

Composer, 2026-09-07 evening, with two screenshots: *"shift + move node to clamp; the curve bend isnt working that great, different way
to move the segment and I believe you need 2 degrees of freedom to achieve the proper bend, whatever way it works for trill curves in
the individual curve tracks in the main score; drag end point not working cant change duration; I want it to have short attack and
short release, and medium sustain, the shape isn't changing if I adjust the len number"* — and *"image for my reference so I can remember
my settings so far"*.

**His settings so far (the second screenshot, for his own reference):** the harmony **cs-015 · M3 P4 [0,4,5]** (the two-piano chord
shapes), the voicing original · oct 0 · range 0 … 0 · seed 1; **pair 1 = Bass Cl. + Flute on D4 at unison** (note 3 of the sonority, both
as written), **len 2.1 s, max 8 Hz, the hold shape** (the attack to about 0.5 s, the plateau to 1.5 s, the release to the end), mirrored,
±6; the crescendo **follows the beating, p → ff** (0.3 → 0.9), together; the breaths **one**; the timeline 3 s; the relation unison · 1 oct,
the stack 0 7 12; the pattern new, not yet inserted.

**What was wrong and what was done:**
- **The bend** — mine was a one-number power slope on the segment (the diamonds, then the line drag): a shape with no say in WHERE the
  bulge sits. The score's curve windows (`startBendDrag`) do it with a quadratic Bézier whose control point the mouse sets: the column
  where the line is grabbed is the control's x, and as the mouse moves the control's y is solved so the held point of the line follows
  the mouse. Now the same: a curve point may carry `[cx, cy]` (`ctrlOf`, `bezierT`, `evalCurve` — the score's arithmetic), scaled and
  mirrored with the curve (the heard curve holds it in its own units, the drawn curves by the share), kept through `save shape`; the
  older number slope is still read. Hold the line and pull; a sideways pull still moves the segment's points; CTRL-drag slides the
  whole curve in time (SHIFT is the node clamp now); ALT-click straightens. The crescodo bends the same way.
- **The hold shape in seconds** — the curves were over normalised time by design (a stretch keeps the shape), so "len" scaled the attack
  and the release with everything else. Now `SHAPES.adsr` takes the attack and the release in SECONDS with the length, the hold absorbs
  the difference, and when the two do not fit they shrink in proportion with a 0.2 s hold kept; the block carries `adsr: { attackS,
  releaseS }` (2 · 3 by birth); every length change — the len box, the end handle, the strip's edges — refits the hold shape keeping
  its seconds and its bends; a node of the hold shape dragged rewrites the seconds (the shape stays "hold"); a drawn shape still
  stretches.
- **The end handle** — it worked, at the current scale: 2.1 s across 1300 px made 100 px of drag 0.16 s, invisible. Now 50 px per second,
  whatever the length; the tip says the length.
- **SHIFT + a node** clamps it to one axis (the first movement decides): time only, or value only.

**Verified on `zz-ai-bend` (a copy, deleted) with real events:** born as the hold shape 2 · 4 · 3 over 9 s; len 2.1 → attack 0.76,
hold 0.2, release 1.14 (proportional); len 9 → 2 · 4.01 · 3 again; the attack segment grabbed at its middle and pulled 30 px up → the
curve's value at the grabbed column 3.41 for a mouse value of 3.36, the control on the heard curve (0.497, 12.1) mirrored as ±6.06 on
the two players, the shape still "hold"; len 12 → the control kept, the attack still 2 s; the end handle +100 px → 12 → 14 s, the attack
still 2 s; SHIFT + the attack's node dragged diagonally → the value kept, the time moved, the attack now 2.7 s; the crescendo's hump
grabbed and pulled → a control on both players' curves (together), the samples bent. 121 checks in node. No page errors.

## §186. "I still can't move it. It doesn't shift horizontally" — the lanes get a real time axis: the pair ends at its length, the end dot follows the mouse in seconds

Composer, 2026-09-07 late evening, with two screenshots (a pair at 0.5 s, the bands in ten slivers): *"I'm meant to be able to move the
final dot at the right horizontally. Correct? Alright. Am I missing something? I still can't move it. It doesn't shift horizontally."*

**What was wrong:** the drag worked (his pair had gone to 0.5 s, the minimum), but the lanes drew the pair stretched over the full
width — the curves are over normalised time — so the end dot was pinned at the right edge whatever the length; only the number moved.
His picture is the DAW's: the axis is time, the end sits at the length, dragging it moves it.

**Done:** the three lanes (the rates, the crescendo, the breaths) share a real time axis — the window is 1.15 × the length (never under
1 s), the pair spans 0 → its length, the space beyond is dimmed with a dashed line at the end and second ticks along the bottom; every
mouse → time mapping goes through the window (`viewSpan`), and the window is held still while the end is dragged so the dot stays
under the mouse; the end dot's position IS the length (0.05 s steps, 0.5 s the least). The hold shape keeps its seconds through it
(`fitShapeToLength`). The sampling step follows the length (`beatingSpec`: length / 200, floored at 0.01 s), so a short pair no longer
draws in slivers.

**Verified on `zz-ai-axis` (a copy, deleted):** a 9 s pair — the end dot at 725 px of 828 (the window 10.35 s), the beyond dimmed; dragged
300 px left → 5.05 s (the mapping's 5.06), the dot 0.7 px from the mouse during the drag, the window re-fitted after; the attack and
release 1.94 / 2.91 s (2 and 3 shrunk by the pair's room, the rule of §185); 200 px right → 6.5 s; the attack's node dragged to 30 % lands
at 0.299; the three lanes' end lines at the same x; 0.5 s → 51 samples instead of 10. No page errors.

## §187. "I can't get the visual to look like the sound" — the beats themselves drawn on the centre line, the hold shape typed in seconds, a node typed by double-click, one time scale for every row with a zoom, CTRL+Z reaching the drawer from anywhere

Composer, 2026-09-07 late evening: *"I think the problem is I can't get the visual to look like the sound. Something to do with the
length, number box, and the visual of the pair curve. So I wanted a short ramp up about a double the length sustained and then an equal
short ramp down … no matter how I tried to manipulate the image, it doesn't correspond with the sound. I seem to be guessing. where the
image should feel intuitive. So I don't know if we need a absolute scale … horizontal scale and then just a Zoom. Maybe maybe that. Or if
you have another suggestion. then: way to type in node amplitude, dbl-click or shift click or something? need undo"*

**The physics in it (the reply's point):** the rate curve is a picture of a number the ear cannot follow near zero — a beating needs
about two beat periods to be heard as a rate, so at 2 Hz it is heard only after a second, and a ramp from 0 is silence-then-beating
whatever its drawn shape; a 2 s pair at 8 Hz has about one second of audible beating in the middle. The samplers add their own attack
and release tails (a few hundred milliseconds each) at both ends. So the picture of the RATE and the sound of the BEATS differ by
nature; what the ear gets is the beats' count and spacing.

**Done:**
- **The beats drawn** — a mark on the centre line at every beat the pair makes (the integral of the heard rate over the samples, a mark
  at each whole number; grey under 1 Hz), and the count ("11 beats in 2 s"). His hold shape 0.5 · 1 · 0.5 at 8 Hz: nothing for the first
  fraction of a second, a dense run on the hold, a thinning tail — the picture of the sound.
- **The hold shape typed:** `attack ▢ s · release ▢ s` beside the shape buttons while the shape is hold, the hold's seconds shown; a
  length change keeps them.
- **A node typed:** double-click a node → a small box at it with its time in seconds and its value (Hz heard on a rate curve; a dynamic
  or 0 … 1 on the crescendo); ENTER sets, ESC closes; the start and the end keep their time.
- **One time scale for every row** — the longest pair fills the width and the others sit on the same seconds (a 2 s pair beside a 9 s
  pair is a fifth as wide); **zoom − / + / fit** in the head (px per second, shared; a pair always fits its lane).
- **Undo:** it existed (↶ and CTRL+Z) but CTRL+Z reached the drawer only while the focus sat inside it — after a click on the score the
  SCORE's undo answered. Now a capture listener on the window: CTRL+Z while the drawer is open is the drawer's undo, wherever the focus is
  (text boxes keep theirs).

**Verified on `zz-ai-pulse` (a copy, deleted):** a 2 s pair at 8 Hz with attack 0.5 and release 0.5 typed → 0.5 · 1 · 0.5 s, "hold 1 s";
11 beat marks, "11 beats in 2 s" (the integral 12); the node editor opened on the attack's end with 0.5 s and 8 Hz heard, set to 0.4 s
and 6 Hz → the point at 0.4 s, 6 Hz, the attack seconds rewritten; a second pair of 9 s → both rows on a 10.35 s window, the 2 s pair
ending at 192 px where the 9 s pair ends at 725; zoom out → 51 px/s, 15.5 s; fit; CTRL+Z with the focus on the body → the drawer's
maximum back from 12 to 8, the score's undo stack untouched. No page errors.

## §188. "This working process is not working" — the region model in one pass: the lanes on the sequence timeline, every node at its own time, the region's edges as cuts, the bend as the score's, a cursor while it plays, a gesture card; and the process changed

Composer, 2026-09-07 night: *"First of all, this working process is not working. I've already spent several hours trying to get this one
thing right … Secondly, give me a concrete proposal for the pair visual and pair audio … like … a DAW. So a region … I wanna be able to
drag the right end, make the duration four seconds … And then I want to be able to drag the points inside … And then I need a Zoom just
like in the main score. Alt. horizontal scroll and then the double click on the nodes isn't working … please be more thorough and sort
this out. So we don't have to iterate many times … I just wanna click on a note or shift click on a note and then type in a value."*
Then the correction: *"I misspoke about change of size. All the points should be independent on the timeline. So if … it's six seconds
and I move the endpoint to four seconds, the curve notes stay where they are in their timeline. Same with the front point … If I move
the front point forward, nothing else changes. Everything stays anchored to their time in the timeline."*

**The model (his, the DAW's):** the lanes show the SEQUENCE timeline (the same second is the same x in every row, as in the strip); a
pair is a REGION at its offset with its length; every node has its own time on the timeline; the region's two edges are CUTS — dragging
the end from 6 s to 4 s leaves every node where it is (a node beyond the cut waits in the dimmed area and comes back when the edge is
pulled out); dragging the start later leaves the nodes and the end; the nodes inside are dragged in real time; the window zooms with
ALT (or CTRL) + wheel at the mouse and scrolls with a horizontal wheel — the score's own gestures — with − / + / fit in the head.

**Built (`beating_panel.js`, `beating_calc.js`):**
- `resizeKeepTimes(row, newL, keepEnd)`: every curve (the beating, the two unlocked rates, the crescendo per player) re-expressed so
  its nodes keep their timeline seconds; the breath marks likewise (a mark outside the region goes); `curveOf` accepts nodes outside
  0 … 1 (the curve holds its value before the first and after the last). The typed `len`, the lane's edge handles and the strip's
  edges all go through it; a body drag in the strip moves everything.
- The three lanes on one window: `windowOf` (the sequence's content × 1.15 by default), `laneWheel` (the score's ALT / CTRL + wheel
  zoom at the mouse, horizontal scroll), the region dimmed outside, the timeline's seconds along the bottom, the region's start and end
  as dashed handles.
- **The double-click that never fired:** a click on a node started a drag and the mouseup re-rendered the lane, so the second click of a
  double-click hit a new element — a real-mouse failure a synthetic test could not see. A click without movement now changes nothing
  and re-draws nothing; a double-click and a SHIFT-click on a node both open the value box (time on the timeline, Hz heard or a dynamic).
- The bend is the score's (§185), the beats drawn (§187), the hold boxes type seconds at the current length and pin the shape's ends;
  **a cursor** runs across every lane and the strip while a pair or the sequence plays (the first note-on is the curve's zero);
  **? gestures** in the head — every gesture on one card ("I don't have in my memory what things are taken"); fit resets the scroll.

**Verified on `zz-ai-region` (a copy, deleted), the gestures as real mouse sequences:** a 6 s pair typed 2 · 2 · 2; the end dragged to
4 s → the nodes at 0 · 2 · 4 · 6 s still (the 6 s node beyond the region, drawn dim, four dim handles), the end back to 6 s → the same
shape byte for byte; the start dragged to 1 s → the region 1 → 6 s, the nodes unmoved; a node dragged to 3 s → only it; a click
without movement keeps the element and a double-click on it opens the editor; SHIFT-click opens it, 2.5 s typed moves the node;
the bend follows the mouse within a pixel (0.08 Hz at this scale — the earlier 0.09 was the synthetic event's integer rounding); ALT
+ wheel → 114 → 135 px/s with the second under the mouse kept, a horizontal wheel → the window at 0.97 s, fit → 0; a second pair at
3 s begins at the same x as 3 s in the first row's lane; the cursor at 2 s of a 6 s pair sits at the expected x and hides after the
end; the card shows eleven rows; a region trimmed to 3 s sounds 3 s notes, no NaN in the bend stream. No page errors.

**The process, changed (his first point, put to him in the reply):** one round per sitting, not per message — he collects what he sees
(a screenshot and a line each), the fix comes back as one commit with a walk of each item; gestures are tested as real mouse
sequences including the click-then-render trap; the gesture card is the memory of what is taken; and for anything conceptual — a
model, not a control — one line of behaviour agreed before it is built.

## §189. The column that jumped to pair 1 — fixed at once; the zoom's sensitivity and its centre saved as feature requests at his word

Composer, 2026-09-07 night (MORPH_NOTES §3): *"if I enter a number in pair 2 and hit enter, actually any change, even scroll auto
scrolls up to pair 1 … fix the auto scroll now, impossible to work with it"*; the zoom's sensitivity and its centre *"save these all as
feature requests"*.

**The cause:** every render of the drawer rebuilds the rows column (`host.innerHTML = ''` then the rows again), and an emptied column
scrolls to the top — so any edit in pair 2 or 3 (a number, a wheel that zooms, a drag's release) brought pair 1 back into view.
**The fix:** `render` keeps the rows column's and the keyboard column's scroll and puts them back after the rebuild. **Verified on
`zz-ai-scroll` (a copy, deleted):** three pairs, the column scrolled to the bottom; a number typed in pair 3 → the scroll unchanged;
an ALT + wheel zoom over pair 3 → unchanged; the keyboard column scrolled to 200 and a length typed → unchanged. No page errors.

**Saved (NITS):** the zoom steps by the score's factor per wheel EVENT, which a fine wheel or a trackpad fires many times per notch — too
sensitive; and the window's start is clamped at 0, so near the start the zoom cannot centre on the mouse and he has to scroll after.

## §190. "zoom func for sequence, save all unless I say otherwise pls" — a standing rule: his remarks are saved as feature requests by default

Composer, 2026-09-07 night. The request (a zoom for the sequence strip) is in NITS with the two zoom points of §189. **The rule from
here (HOW_WE_WORK):** every remark about the drawer is SAVED — NITS for the request, MORPH_NOTES §3 for his words — and built only
when he says so; the exceptions are what he marks "fix now".

## §191. "space in sequence unreliable sometimes just plays a pair" — saved (NITS), the likely cause named

Composer, 2026-09-07 night. Saved under the standing rule (§190). The likely cause is the focus rule of §182 — SPACE plays what was
last clicked, and any control in a row makes its pair the focus — so after an edit in pair 2 SPACE plays pair 2 until ▶ sequence or
the strip's background is clicked; the head's `space → …` says which. Three ways out put in NITS for his decision.

## §192. "dbl clk in numbers highlights number" — saved (NITS)

Composer, 2026-09-07 night. Saved under the standing rule; the browser normally selects a number box's content on a double-click,
so if it does not here it is a defect to catch on the next round (select-all on focus is the cheap alternative).

## §193. His expected behaviours for the curves, saved: the endpoints are the duration, the attack and release ride on them

Composer, 2026-09-07 night (verbatim in MORPH_NOTES §3): the vertical edge lines go; the curve's endpoints control the duration; the
first point carries the attack's end node, the last point carries the release's start node (the attack and the release keep their
lengths, the sustain takes the rest); the nodes inside move on their own; the strip's zone acts as the endpoints. Saved (NITS) under
the standing rule — to be worked out with him later, one line of behaviour agreed before it is built.

## §194. "typing in a new hz max changes the whole curve" — the level box scales the curve as it is (fixed: it re-popped the hold shape from its defaults)

Composer, 2026-09-07 night. §182 had settled that the level box keeps a drawn shape and scales it, but a MENU shape was popped in
again at the new level — and the hold shape's pop rebuilt its nodes from the birth seconds, throwing his moved nodes away. Now the box
only scales: every node keeps its time, the shape its name (the hold's attack and release boxes stay); a curve at zero takes a flat at
the level. Fixed at once as the agreed behaviour of §182, not a new feature.

## §195. "we should revisit the way the beating units are displayed in the main score" — saved; the checkpoint before a clear

Composer, 2026-09-07 night: the beating zones' look in the score (the launching lane's zone, the partner's dashed bracket, the long
label) is *"fine for now"* — saved in NITS. Then: *"prep for a clear… make sure the next AI will understand what we're doing right now,
and we'll be able to keep the running list of issues and feature requests"* → the journal §2 checkpoint rewritten cold; the running
list lives in NITS (every entry dated, his words in MORPH_NOTES §3), the rules in HOW_WE_WORK.

## §196. "Just keep collecting the feature requests. We'll have a a rebuild session later" — the endpoint model deferred at his word; the strikes drawer's partial insert (solo) and its dynamic read from the code and explained; a per-player dynamic found missing, saved

Composer, 2026-09-07 late (after the clear; verbatim in MORPH_NOTES §3): *"Just keep collecting the feature requests. We'll have a a
rebuild session later. And in the strikes drawer, is there a way to just insert part of the strike? So if I just want to insert the
portions of the strike for, say, two instruments and then explain to me how the dynamic works. If I wanted it quieter, do I have to do
it per instrument or Do I just use the d y n times? How do... how should I do it? and how... what corresponds to the scale, PPP to
FFF."* — with two screenshots of the strikes drawer (seed 324; Flute F5 · Bass Cl. C#3* · Piano C4 · Violin 1 F5 · Violin 2 B3 ·
Viola A4 · Cello F#4; the bottom bar with dur × 1, dyn × 1 and **flat 127 checked**).

**The endpoint model (§193):** put to him in one line at the resume, with one open detail (an end dragged past an inner node: the
node waits dim beyond the cut as in §188, or the end pushes it) — his answer is the rule above: collect, build at the rebuild
session. NITS updated; nothing built.

**The strikes drawer, read** (`strike_drawer.js` `notesFor` / `insert`; `composer.html` the plain-note pre-arm and tick;
`velocity_remap.js`; `notation/registry/container.json` `dynamicBands`):
- **Part of a strike:** yes, by SOLO — **S** on a player's row solos its voices (SHIFT-click a dot solos one voice); while anything is
  soloed, Hear orchestrated and every Insert write ONLY the soloed voices (`anySolo && !v.solo` → dropped); **solo off** clears; the
  solo state is in the take. The other way is destructive: a chip on a row clicked takes the note off that player. **The catch:** an
  insert replaces an earlier insert of the same strike within 100 ms of its time (§113), so a partial insert at the same playhead
  replaces the full one there, and two partial inserts at one time cannot be stacked.
- **The dynamic:** every voice carries the velocity it was PLAYED with (`v.vel`, the capture's `recVel`); the drawer's one loudness
  control is **dyn ×** — a multiplier on every voice at once (0.1 … 2); **flat 127** sets every voice to 127 before the multiplier
  (his screenshot has it on: every note at 127 = fff). No per-player dynamic exists in the drawer (the run's `vel` ramp belongs to
  the accel shape only). An inserted note keeps its final velocity as `recVel` and is drawn at the height velocity / 127; the score
  plays a plain note at `recVel` with CC7 127 ("replay exactly as monitored") — **no loudness remap for strikes** (D23: the strikes'
  velocities are as played), so the same velocity is not the same loudness on every instrument, unlike the trills and the beatings;
  the drawn height of a strike note is a picture of its velocity, not a control. A strike note's velocity has no editor in the score.
- **ppp … fff — two scales in the app.** Curves (trills, beatings, held notes): the HEIGHT is the dynamic, 0 = ppp … 1 = fff in eight
  equal steps, played 65 → 127 through the remap (D23, NAMING §2.9). Strikes: the VELOCITY through the registry's five bands —
  ≤ 45 ppp · 46–75 p · 76–100 mf · 101–118 f · 119–127 fff (the tuba's provisional thresholds, "equal-ish widths", to be re-set for
  the septet at 2a). With flat 127 on, dyn × lands exactly: 0.35 → 44 ppp · 0.55 → 70 p · 0.75 → 95 mf · 0.9 → 114 f · 1 → 127 fff.

**Saved (NITS):** a per-player dynamic in the strikes drawer (or a velocity box on a strike note in the score) and the stacking of
partial inserts — for the rebuild session. Nothing built; the piece file untouched.

## §197. "lets go back to the morph panel, can you adapt it for the current instrumentation, -piano … three pairs … reorchestrate … the octaves … insert just a single pair or any combination … investigate first and collect the data, and then check-in" — the port's morph tool read against his six asks; the proposal put to him, nothing built

Composer, 2026-09-07 late (verbatim in MORPH_NOTES §3 and CN-37): *"lets go back to the morph panel, can you adapt it for the current
instrumentation, -piano, And then I'll create the morphs. with three pairs. the two violins, cello and viola, and flute and base
clarinet by default. But they'd be able to reorchestrate the pairs. So in other words, I'll listen and create a morph with those
defaults and then be able to save it and then be able to rearrange the orchestration of those three pairs. And then I'll need that
facility from the beating drawer that will change the octaves of notes that are out of range for any of those instruments. And then I
want a facility to insert just a single pair or any combination of those three pairs as well. no need to go through the whole plan
protocol, but investigate first and collect the data, and then check-in and tell me what you think you need to do. And what the
results will be? before doing it."*

**Read:** `morph.js` (the constants, the six models, `reduceSource`, `render`'s source → voices, `feasibleTechnique`, the result's meta,
`toScoreObjects`) · `morph_emit.js` (`routeFor`, the bend and level sends) · `morph_panel.js` (the box, `current` / `generate` /
`insert`, the ACTUALs) · `bank/morph_models.json` (the six stock models and their pitch sets) · `composer.html` (the morphBend tick
branch, the beating's per-instrument bend, `trackInstrument`) · `score/server.js` (the APIs) · `beating_calc.js` (`players`,
`foldPair`, `pairLadder`, `seatOptions`, `bendLimits`, `ceilingFor`) · `beating_panel.js` (the rows, the harmony list, `insert`, the
takes) · §145 and MORPH_NOTES §1–2.

**Found — the port as it stands would not run on the septet:**
- The engine's voices map 1:1 to lanes 0 … n−1 (or a `lanes` list typed into the params by the AI — FR-5, the players and the pitch
  set from the panel, was never built); the stock models have eight pitches → lanes 0–7: lane 2 is the piano (no bend) and lane 7 is
  META.
- Every constant is the tuba's: the technique table (ord / bisb / cuivre / flz … with the tuba's 30–65 range) — a note out of range
  swaps TECHNIQUE (`feasibleTechnique`), never the octave; the breath table by register (p / mf / f); the bend reach 1.99 st (SI2) in
  the engine's re-key rule, in the emitter's `bendValue` and in the score's morphBend tick (`100 * 1.99`) — on the Xsample five
  (0.96–0.99 st measured, §168) every morph bend would sound about double.
- The emitter routes a voice by `routeFor(lane, technique)`; the key falls back to `ord`, which only the flute has — the others would
  land on channel 1 with no CC0 (the wrong voice, or none). Its loudness is velocity 96 + CC7 through the tuba's `curveValToCC` map;
  in the SCORE a morph note is a held curve note and already takes 1g's remap — the audition and the score would differ.
- The panel is the floating box at the top right (340 px) — what he could not find with the beating panel (§175); no player choice,
  no pitch choice (the AI edited the store); `Save as ACTUAL` freezes a render, placed verbatim, never re-orchestrated; Insert writes
  every voice.
- The pitch sets are the tuba's chords (MIDI 41–64). In BLOOM a pair is a DOUBLED pitch (voices 2k / 2k+1, detuned + / −); in CONVERGE
  a pair is two pitches closing to one doubled target. Thinning keeps whole clusters (`reduceSource`).
- No `tools/test_morph.js` here (the tuba's harness was not copied); `model_bank.js` and `notate_morph.js` are.
- The beating drawer already has what he names: the six bending players (`BeatingCalc.players`), the pair's fold as one unit with the
  ladder of offers, the harmony banners + the keyboard + the assignment, the takes in `bank/panel_snapshots.json`, insert as one group
  with a META shape, the drawer chrome, SPACE by focus, undo.

**Proposed (put to him in the reply):** (1) the pair as the ORCHESTRATION unit — three rows, two seats each, a note from the harmony,
the fold by `foldPair`, the ladder; the engine's `source` / `target` DERIVED from the rows (BLOOM: each note doubled; CONVERGE: the
note ± the opening interval → the note doubled; BALANCE: the note doubled) and `lanes` from the seats in pitch order — the voice-based
scheduler untouched; (2) the palette per voice into `Morph.render` as options — technique = the lane's ordinary voice, range, bend
reach = the player's semitone or the sampler's measured range, the breath / bow ceiling and gap — the tuba's constants staying the
defaults when absent, the engine pure; (3) the emitter and the tick per instrument — the ordinary voice's route, the bend through
`bendRangeSt`, the level through the remap as the score plays it; (4) the panel as a DRAWER on the beating drawer's chassis, the pitch
side shared as a mixin (recommended; or copied), the morph's own middle — model · recipes · seed · span / duration / release ·
segments · dynamics · Generate · Play · Stop; (5) a tick per pair — Play and Insert take the ticked pairs (the render is of all six, so a
pair heard alone is heard in its place; the insert filters the notes); (6) takes in a `morphs` bucket (params + harmony + voicing +
the pairs) — load, swap a seat, refold, re-render; ACTUALs left as they are; (7) node checks and a copy in the pane with decoded MIDI,
then his listening: the three default pairs on one harmony, BLOOM ± 25 c over 30 s (the tuba's keeper). **One question:** the models
to carry — the three keepers (BLOOM, CONVERGE, BALANCE) or all six (COLOUR needs technique paths the septet lacks; SPECTRAL /
SPACING carry as they are). Nothing built.

## §198. "No. I think I want to keep it simple for now … use the morph panel in a very similar way to the way I used it for the tube a piece … two changes" — the proposal of §197 declined; the beating drawer left as it is; the morph panel the tuba way with the septet's players and a pair-wise insert; the picture put to him

Composer, 2026-09-07 late (verbatim in MORPH_NOTES §3): *"No. I think I want to keep it simple for now. The beating drawer has a lot of
features, and I wanna leave it as is. I wasn't quite getting what I wanted, but I might revisit it later. For this piece, I basically
just want to use the morph panel in a very similar way to the way I used it for the tube a piece, to be able to generate a whole
sequence using those value based sliders. But then I want to have two changes one is I want to not use tubas, but these instruments
for my septet. And then I want to maybe break the the texture, the ensemble texture up into their individual pairs in case I wanted
to just insert one pair part of the ensemble or a second pair part of the ensemble. But, basically, I want to try the same way I did
with the tube a piece to use the morph panel and generate an entire ensemble sequence with everything in place such as crescendos,
crescendos, red breaths, just like I did with the tuber piece. talk to me about how this might look."*

**Decided (his):** the §197 proposal (a drawer on the beating drawer's chassis, seats, the fold, takes) is off. The beating drawer is
left as it is — *"I wasn't quite getting what I wanted, but I might revisit it later"* — its running list stays in NITS for the rebuild
session (§196). The morph panel keeps the tuba's working mode: the MODELS tab with the word-recipe sliders and the seed, the scratch
variants written by the AI at his word, Generate · Play · Stop · Insert @ cursor · Save as ACTUAL. **Two changes only:** the septet's
six players instead of the tubas (the piano out, §197), and the ensemble texture broken into its pairs so one pair or another can be
inserted on its own.

**The picture put to him (nothing built):** the same panel in the same place; each stock model re-voiced once by the AI for three
pairs — the cello + viola pair low, the violins in the middle, the flute + bass clarinet on top, each pitch inside the register both
players share (the tuba's eight pitches were four pairs, MIDI 41–64) — and new pitch sets by his word into the scratch file, as in the
tuba piece; under the fields three lines, one per pair (players · pitch), each with a tick — Play sounds the ticked pairs of the one
render of all six, Insert writes them as their own group with the META shape, so a second pair can go in later at the same time or
another; the palette under the hood — each player's ordinary voice with its switch, the bend through its measured range (the Xsample
five about a semitone, the flute two), the winds' breath and the strings' bow ceilings in place of the tuba's breath table, the
loudness through 1g's remap in the audition as in the score; a glissando wider than the sampler's semitone re-keys, on these
instruments an audible re-articulation (BLOOM's ± 25–50 c stays inside; CONVERGE's whole-tone opening would carry one per voice
unless its slider narrows it). Not done: nothing. His confirmation of the picture awaited, then the build in one pass on a copy.

## §199. "Ordinary voice and or Sensa vibrato … the ability to swap out instruments among the pairs … talk about the active displacement … a whole tone falls well within the range … react to this, and let's discuss some more" — the discussion goes on: the swap as seat pull-downs, the fold put to him as two models, the whole tone accepted with the sampler's seam named

Composer, 2026-09-07 late (verbatim in MORPH_NOTES §3): *"Okay. Ordinary voice and or Sensa vibrato. for the voices. And then I want to
add the ability to swap out instruments among the pairs. So you have the default pairing above. But if I wanted to change, for
example, Trello and base clarinet. and then talk about the active displacement as well. For the glissando, I believe, uh, whole tone
falls well within the range for a... any player of any of those instruments to reach with their ambrosure. So I think it's fine. I'm
not sure if I'm answering the question, though. Anyways, react to this, and let's discuss some more."* ("Sensa vibrato" = senza
vibrato; "Trello" = cello; "active displacement" = octave displacement; "ambrosure" = embouchure.)

**Read back to him:** (1) the strings' ordinary voice is senza vibrato — the recipes already say so (`ordinary: senza_vel` on the four
strings, `ord` on the flute, `senza_vel` on the bass clarinet), nothing to change; (2) players swap among the pairs — the three pair
lines get a pull-down per seat listing the six players; picking a player seated elsewhere trades the two seats, every player sits
once; the pitches stay with the pairs; the render is the same morph recast (the same seed, times and curves; only the lanes change)
— the cast saved with an ACTUAL as part of its params (`lanes`); (3) the whole tone: the players' reach is not in doubt; the
SAMPLERS bend about a semitone (the Xsample five, §168), so in the mock-up a whole-tone glissando re-keys once per voice — on these
instruments an audible re-articulation, a seam the score never shows (the notation reads the curve, D23 / NAMING §2.9); the wide
models stay, the morph's player limit becomes a whole tone (the beating's stays a semitone, §180), the mock-up carries the seam.

**The octave displacement, put to him as two models (HOW_WE_WORK: a model agreed in one line before it is built):** the question arises
only after a swap — the default cast is voiced to fit its registers — e.g. the cello in the flute's seat above the cello's top, the
flute in the cello's seat below C4. (a) **the pair folds as one unit** to the nearest octave both players hold — the unison kept, the
beating as designed, the pair an octave from where the model voiced it; no octave serving both → the line names the player who
cannot, the pair silent until he swaps again (the beating drawer's rule, §180) — recommended; (b) **only the player who cannot reach
folds**, the pair an octave apart — the register kept, but an octave pair beats between the upper note and the lower's second
partial: twice the rate for the same cents, and a thinner sound than a unison splitting. The fold shown on the line as in the drawers
("F3 → F4 ↑"); the folded pitch is what the extractor reads. **His answer pending; nothing built.**

## §200. "what is this? … how did the original morph choose the pitches? a for the octive displacement; for the sampler gliss, I think we worked it out for the string quartet piece … 61 but bent a semi tone down … a whole tone glist up from c to d" — the scratch file explained, the tuba's pitch choice traced, the fold decided (a), the quartet's glissando method confirmed against the engine and the measured ranges

Composer, 2026-09-07 late (verbatim in MORPH_NOTES §3): *"and what is this?: New pitch sets the tuba way: you say the words, I write the
scratch variant, the panel picks it up, you listen. and how did the original morph choose the pitches? a for the octive displacement;
for the sampler gliss, I think we worked it out for the string quartet piece, and I thought the AI who built the beating drawer also
picked up on this. I think what we did was we pitch bent a note all the way in one direction, the opposite direction of where it
needed to go. So, for example, let's say it's c four, midi sixty, then you would play sixty one but bent a semi tone down. And then
glists all the way to the max pitch bend, which will be a whole tone glist up from c to d. let me know if you understand what I'm saying
and if you have knowledge of the system. I may be getting some of the particulars wrong. I can't remember, for example, what the full
pitch bend for the x sample instruments are, but I know it's recorded somewhere. One more pass in discussion."*

**Decided (his): the octave displacement = (a), the pair folds as one unit** (§199) — the beating drawer's rule of §180 extended to
the morph pairs; D26.

**The scratch file (his "what is this?"):** the tuba's panel had no pitch controls; the pitches lived in two files the AI wrote at his
word — `bank/morph_params.json`, the "scratch" variants A–F (each a whole set of params: the model, the pitch list as MIDI numbers, the
dials, the carrier, the dynamics; a `rev` the panel polls once a second, so an edit appeared in the panel without a reload), and
`bank/morph_models.json`, the six stock models with their own pitch sets. **How the tuba's pitches were chosen:** typed into those
files by the AI in conversation — the stock sets from the day-10 audit (BLOOM: four unison pairs F2 · B♭2 · E♭3 · A♭3 = 41,41,46,46,
51,51,56,56; CONVERGE: whole-tone pairs 45,47 · 50,52 · 57,59 · 62,64 closing to the unisons 46 · 51 · 58 · 63; BALANCE: a B♭ major
9th 34,38,41,45,48,53,58,62; SPECTRAL: F2 (41) as the fundamental, partials 2 … 13 folded into the tuba's range, each voice to its
nearest free partial); the engine's hook for a chord by id from the score's bank (`source.kind: 'vert'`) exists but the panel never
passed a resolver, so it was never used from the panel. For the septet the same way: the six models re-voiced once for three pairs;
other pitches by his word into a variant or a model.

**The quartet's method (his "61 bent a semitone down … a whole tone up from C to D"): understood and confirmed** —
`string_quartet_no1-composer/docs/AI_GLISSANDO_PROMPT_GUIDE.md` and `LONG_TONE_GLISSANDO_WORKFLOW.md`: gliss up = the note at
startPitch + 1 with the bend starting at MIN, gliss down = startPitch − 1 with the bend at MAX; one segment covers 2 semitones of
travel (the Xsample range ±1 st there too, §150); a wider glissando is cut into segments, each new note starting 5 ms before the
previous ends (the seam hidden by the overlap); CC0 on the first two segments only. **The morph engine does the same idea** — the
played key is CENTRED on the note's excursion so both halves of the bend serve, a note beyond the range is split into consecutive
notes with no gap ("segmented re-key") — **but its split rule is conservative:** it splits whenever the travel exceeds 2 × (reach −
50 c), the worst case of rounding the centre to a key; at the tuba's 199 c that is 298 c per key, at the Xsample five's 96–99 c it
would cut a whole tone into three notes where his method takes one. **The measured ranges (MEASURED_BEND, 2026-09-07 00:22,
BEATING_TOOL §3):** flute 2.00 st · bass clarinet 0.98 · violin 1 0.96 · violin 2 0.97 · viola 0.99 · cello 0.97; RPN 0 ignored on all
six, so only Kontakt's own dial changes them. So one key at ±0.96–0.99 st reaches 192–198 c: a whole tone arrives 2–8 c short at
each end.

**Put to him:** (i) the engine's split by the ACTUAL excursion (his method), a shortfall of a few cents clamped, the quartet's 5 ms
overlap at a re-key — a whole tone in one key on every instrument, 2–8 c shy at the ends on the five; or (ii) Kontakt's bend range
set to ±2 st on the five and the bend probe re-run (his rack, about ten minutes; the recipe's numbers update, the beating drawer
follows them through `bendRangeSt`, its steps 0.34 → 0.68 c) — a whole tone with room, up to a major third per key, no seam and no
shortfall; recommended (ii) because a CONVERGE closing to a unison must actually arrive: two voices each 4 c shy would beat at
about 1.4 Hz on D4 where a unison was written. His choice pending; nothing built.

## §201. "ii good. We'll continue to do pitch the old way … you're able to run the probe independently. Correct? … run the probe, then make the adjustments to the morph panel. Just briefly check-in with me one more time and let me know how much you'll be able to do from now" — decided: Kontakt to ±2 st on the five, the probe re-run, then the morph panel adapted; the split between his hands and the AI's stated

Composer, 2026-09-07 late (verbatim in MORPH_NOTES §3): *"ii good. We'll continue to do pitch the old way. I'll just ask you, and then
we can try the new pitches. and then you're able to run the probe independently. Correct? So if you could run the probe, then make the
adjustments to the morph panel. Just briefly check-in with me one more time and let me know how much you'll be able to do from now."*

**Decided (his):** (ii) — the five Xsample instruments' bend range to ±2 st in Kontakt and the bend probe re-run; the pitches stay in
the conversation (he asks, the AI types the set, he listens) — the tuba way, for this piece.

**The split, checked against the kit (BEATING_TOOL §3, §168):** the probe is one command — `bash tools/probe_run.sh
probes/bend_schedule.json`, then `node tools/apply_bend_ranges.js` — with Reaper and the rack up, the REC track armed, the bridge
alive and nothing else sending MIDI; it ran that way overnight (§168). **What only he can do:** the Kontakt setting itself — RPN 0 is
ignored on all six (measured), so no MIDI from here changes it; the AI does not drive Kontakt's window. So: he sets ±2 st on the
five and leaves the rack armed; the AI runs the probe, applies the numbers (the recipe's `MEASURED_BEND`, `bank/bend_ranges.json`,
BEATING_TOOL §3 — the beating drawer follows through `bendRangeSt`), logs the run, then builds the morph panel's adaptation on a
copy in one pass, verifies it (node checks; the decoded MIDI per instrument in the pane; the pull-downs and ticks as real mouse
sequences), documents it (MORPH_NOTES §1, NAMING if a field changes) and commits. **Then his:** the listening — BLOOM on the three
default pairs first, then the others; the pitch sets by his word; the swap and the fold by ear.

**Put to him as the check-in:** the one step on his side (the Kontakt dial on five instruments, the rack left armed), the rest
autonomous; if the rack is not armed the probe aborts (the stale-take guard, §168) and the build goes on with the old numbers until
it is. Nothing built yet.

## §202. "Can you give me instructions on the pitch bend range? And do I do that now?" · "if you are stepping the fonts up pls make the panel bigger; and previous ai looked into the developer features, even with this you cannot access the pitch bend range? look at other images pls and see where the pb range might be" — the Kontakt Lua API checked against its manual (no modulators), the Xsample manuals on disk (nothing on bend), the two candidates named from his screenshots

Composer, 2026-09-07 late, four screenshots: Kontakt 8 Options → Developer (developer features off) · the Xsample Bass Clarinet panel
("1 Senza Vibrato MW"; Edit Preset · Preset Menu · Store KS · KS Setup · Save Preset; Legato; Ensemble Setup with V 2 3 4 5, Panwide
30, Alive 63, Detune 11 c, Delay 285 ms; **Toggle Mode · Standard · Slot rr off · ind. PB : 0 · Ending (Timer) · Timer (s) 0.31**;
Key Switch Mode) · Instrument Options → Controller (**"Accept All Notes Off (#123) and All Sounds Off (#120)" UNCHECKED**, "Accept
standard controllers for Volume (#7) and Pan (#10)" unchecked, CC7 range −∞ … −6 dB) · Instrument Options → Instrument (default
keyswitch C0, transpose 0, velocity 1–127, the Xsample wallpaper and resource container). His words verbatim in MORPH_NOTES §3.

**Answered "do I do that now?" first (the reply before this one):** yes, now, before the probe; then save the Reaper project, since
the setting lives in the Kontakt instance inside the `.rpp`; the beating drawer's numbers are off by half between the dial and the
probe.

**The developer features (his question):** the Kontakt 8 Lua API reference (NI, 64 pages, text-extracted again: `scratchpad/
kontakt_api.txt`) has the multi (load, channels, outputs, volumes, scripts), the instrument (options, scripts — `get_ /
set_instrument_script_source`), the group (name, pan, playback mode, start options, tune, volume), the zone (keys, velocities,
sample, tune, volume), presets, options, files, MIR — **no modulators, no pitch-bend intensity**. So the developer features cannot
set the range. What they could do is read the Xsample instrument's own KSP script (if its script governs the bend) — a detour, not
taken. **Not in Instrument Options either:** the Instrument and Controller tabs he sent hold the keyswitch default, transpose, the
velocity range, CC64 / CC123 / CC7 handling — Kontakt has no bend-range field there; the range is the Modulation Intensity of the
Pitch Bend source on the Source module's tune, per group (NI's Kontakt manual, Modulation). **The Xsample manuals on disk**
(`Xsample_AIL_Contemporary_Solo_Strings.pdf`, 6 pages; `Xsample_Woodwinds_Bass_Clarinet.pdf`, 3 pages — keyswitch tables) say
nothing about pitch bend or the panel's controls; the preset designer's manual is a separate download.

**The two candidates given him:** (1) the Xsample panel's own **`ind. PB : 0`** (in the preset row beside Toggle Mode, Standard, Slot rr,
Ending, Timer) — if it is an individual pitch-bend range per preset in semitones, 0 = the instrument's default; the test is the
wheel: set 2, play a note, push the wheel up, a whole tone = found (else back to 0); (2) the standard Kontakt route — wrench → edit
mode → Group Editor → Edit All Groups → Source module → the Modulation router → the Pitch Bend row → intensity 2.00 st; a scripted
library may re-set it at init, which the probe would show. Either way: save the Reaper project after; the probe verifies.

**Found in his screenshot, told him:** "Accept All Notes Off (#123) and All Sounds Off (#120)" is unchecked on the bass clarinet —
the sampler-side reason the all-notes-off never stopped a trapped note (§176, §178); ticking it on the five gives ■ Panic a second
path. Saved in NITS as a rack note, his call. **His ask saved for the build:** the morph panel's box grows with its fonts.

## §203. "I can't figure it out. It's totally opaque to me … this is probably not worth my time. unless it's a blocker … Can we do it with what we have now? … Can you do the probe and run those steps independently? Let's try to move as quickly as possible" — (ii) dropped, (i) taken: the engine splits by the real excursion at the measured ranges; the rack items to NITS; the build begins

Composer, 2026-09-07 late (verbatim in MORPH_NOTES §3): *"I can't figure it out. It's totally opaque to me. The number keeps changing,
and it's difficult to know which instrument the keyboard controls. what was the other option and the pros and cons of it? this is
probably not worth my time. unless it's a blocker. And then the... you mentioned the accept all notes off. Is that something you can
do script? because there's too many instances. Otherwise, just either way, put it on the to do list, and we can maybe do that later.
But even better if you can do yourself."* — then, interrupting a lookup: *"No. Just put it on the to do list. No need to do any lookup.
I need to move this along, please. So quick, very quick answer on the the pitch bend Can we do it with what we have now? And then
are we ready to move forward with the plan? Can you do the probe and run those steps independently? Let's try to move as quickly as
possible to implementing this plan. so I can get back to the composing work."*

**Decided:** the Kontakt dial is dropped; **option (i) of §200** — the engine picks the key by the real excursion (the quartet's rule:
the key one semitone into the travel, the bend from the far end), splits only when the travel truly exceeds the sampler's measured
range, with the quartet's 5 ms overlap at a re-key, and clamps a shortfall of a few cents at the START of a note, never at its end
(a CONVERGE arriving on a unison arrives exactly). **A correction of §200's arithmetic:** CONVERGE's voices each travel half the
opening interval — 100 c for a whole tone apart — so with the key at the destination they fit inside ±96 c with the clamp at the
start; the "1.4 Hz where a unison was written" of §200 assumed a 200 c travel per voice and was wrong. Only a single voice
travelling a full whole tone or more re-keys, the tuba way. **No probe:** the measured ranges of §168 stand.

**To the to-do list (NITS):** the Kontakt bend range to ±2 st on the five (if ever; the probe is one command after it) — the Kontakt
Lua API cannot set it (no modulators) and its `set_instrument_options` table has no "accept all notes off" entry either (checked in
the extracted manual: key switch, key and velocity ranges, transpose, wallpaper, voice stealing, DFD), so both stay hand settings in
the rack; the all-notes-off note of §202 already there.

**The build begins** (the plan of §201 minus the probe): the engine's palette per voice · the split rule · the fold as one unit (D26)
· the emitter and the tick per instrument · the six models re-voiced for three pairs · the pair lines with seat pull-downs and insert
ticks · the box grown with its fonts · node checks · the decoded MIDI on a copy · MORPH_NOTES §1. His listening after.

## §204. THE MORPH PANEL FOR THE SEPTET, BUILT — the palette per voice into the pure engine (the tuba's renders byte-identical), the quartet's key rule, the fold as one unit (D26), the emitter and the tick per instrument, the six models re-voiced for three pairs, the pair lines with seat pull-downs and insert ticks, the box grown with its fonts; 38 checks in node; verified on a copy with real events

Built 2026-09-07 late, at his word (§201, §203), on `zz-ai-morph` (a copy of the piece, deleted after) on :5301 — the plan of §201 minus the
probe (§203):
- **`score/public/morph.js`** (the engine, still pure; every change gated on `opts.palette` — absent, the six stock models with the
  tuba's sets render BYTE-IDENTICAL to before; the sha1 of each frozen in `tools/morph_tuba_baseline.json` and re-checked):
  `chooseKey` — the string quartet's rule, his *"play 61 bent a semitone down, then gliss all the way"*: a run keeps one key while some
  key reaches its arrival exactly and the rest within the sampler's measured range plus 8 c, the overshoot clamped at the start
  (never the arrival); where that fails the run is cut and re-keyed · the split by that rule instead of the tuba's worst-case
  2 × (reach − 50) · the re-key with the quartet's 5 ms overlap (the previous key ends after the next starts) · the technique per
  voice = the palette's (the player's ordinary voice; never a technique swap; out of range is flagged, the fold is the panel's) · the
  breath / bow ceiling and the gap per voice (a bow costs no air; a bow change 50 ms) · M2's partials folded into the palette's union
  range · `meta.palette` · `reduceSource` exported. One new soft flag, `CLAMP`.
- **`score/public/morph_septet.js`** (new, pure, page + node): the cast — `DEFAULT_PAIRS` Vc+Va · Vn1+Vn2 · Fl+BCl; `cast(params,
  pairs, env)`: the model's sorted pitches two per pair (the tuba's eight reduced to six by whole clusters, said), `foldPair` as one
  unit (D26: as written, then down, then up, by octaves; both seats must hold every note, CONVERGE's targets included; none → the
  pair silent and named), the voices in pitch order → `lanes`, the palette per voice (`ordinaryVoice`, `ordinaryRange`, the reach =
  min(a whole tone, the sampler's measured range), `ceilingFor`); `filterResult` (the ticked pairs of the one render); `swapSeat`
  (the player chosen takes the seat, whoever sat there takes the old one); `describePair`.
- **`score/public/morph_emit.js`** (the audition): the route falls back to the recipe's `ordinary` (the tuba's `ord` only the flute
  has) and carries the switch, the instrument's `bendRangeSt` and key; the bend through that range; CC0 (or a keyswitch) sent with
  the CC7 lead; the loudness as the score plays a held curve note — the velocity for the curve's top through the remap, CC7 by
  height (`cc7ForHeight`); the tuba's path when there is no remap.
- **`score/public/composer.html`**: the morphBend tick through `inst.bendRangeSt` (the tuba's 1.99 sat there); `morph_septet.js`
  loaded before the panel.
- **`score/public/morph_panel.js`**: the box 500 px at 13 px (his *"make the panel bigger"*); `generate` casts (`castOf`), renders six
  voices with the palette and keeps the cast params as `_lastParams` (an ACTUAL saves the cast); Play and Insert take `heard()`; the
  PAIRS lines under the fields — a tick, `pair k`, two seat pull-downs over the six bending lanes, the pitches as given and as folded
  (`→ … ↑`, red when silent), the palette line; the pairs persist in the browser (`septet.morphPairs.v1`); the marker names the pairs
  when not all are in; the META shape on `META_LAYER` — 7; the tuba's 10 is this piece's curve window C, a bug the port carried.
- **`bank/morph_models.json`** rev 9: the six sets re-voiced for three pairs — BLOOM 51·51 56·56 61·61 (E♭3 A♭3 D♭4, unison pairs in
  fourths; the winds share C4–F4 only) · CONVERGE 50,52 · 55,57 · 60,62 closing to the same unisons · BALANCE / COLOUR / SPACING /
  SPECTRAL a B♭ major ninth in six (46 53 57 60 62 65); the tuba's sets kept on each model as `tuba`; COLOUR a shell.
- **`tools/morph_septet_check.js`, 38 checks, ALL PASS:** the six tuba renders unchanged · the default cast on the lanes 6 5 3 4 0 1 ·
  the reaches Vc 97 · Va 99 · Vn1 96 · Vn2 97 · Fl 200 · BCl 98 c · the winds breathe, the strings bow (flute 8 s, violin 12 s) · the
  fold up (D3 → D4 for the violins), down (E7 → E5 for Vc + Va), none (Fl + BCl on B♭4 or F♯7 → silent, said) · CONVERGE's targets fold
  with the pair · the swap · the key rule (C4 → D4 in one key at 0.96 st, 4 c short at the ends; a CONVERGE voice exact at its
  arrival, 4 c clamped at its start; a minor third re-keys; the flute clamps nothing) · BLOOM under the palette: every note at its
  player's voice, no re-key / clamp / range flag, no note past its ceiling · CONVERGE arrives on its unison within a cent · SPACING
  by four steps re-keys with the 5 ms overlap · the ticked filter.
- **On the copy, with real events:** the page loads the five modules and the remap; BLOOM casts and renders (33 notes, six voices);
  the panel 500 px at 13 px, three pair lines; Play → per port the switch CC0 5 on the strings and 12 on the bass clarinet, none on
  the flute (channel 12), CC7 from the remap (Vc 104 · Va 120 · Vn 127 · Fl 122), the bend centred, the note-on velocity the remap's
  (the cello's 72 = `heldNote` at its curve top); the bend probed at +25 c per instrument = the expected 14-bit value on every one
  (Vc 10303 · Va 10261 · Vn1 10325 · BCl 10282 · Fl 9216); a seat changed by a real `change` event (BCl into the cello's seat →
  BCl+Va · Vn1+Vn2 · Fl+Vc on the lanes 1 5 3 4 0 6, stored) and back; pairs 1 and 3 unticked by real clicks → the violins alone
  heard (10 of 33 notes); Insert @ playhead → 10 notes on lanes 3 and 4 at senza vibrato, every one with its `morphBend`, one
  group, the META shape on layer 7, the marker "MORPH M1 — BEATING BLOOM · Vn1+Vn2". The score's transport was not run (the
  hidden pane's rAF); the tick's bend line is the beating's formula, read.
- **Not done, for his ear:** the seams and the clamps in the rack, the CONVERGE arrival, the loudness; COLOUR a shell; the tuba's
  shape presets (edge techniques) untouched; the notation at 2a. **His listening next:** a hard reload, [Morph], MODELS, BLOOM,
  Generate, Play; the sliders; a pair alone; CONVERGE; a seat swapped; then pitch sets by his word.

## §205. "can we have a discussion about pitch? … Is there a facility where we try some pitches and then I can select them again? another time, put them into some kind of menu" — no such facility yet (the tuba way was the scratch file); a pitch-set menu proposed; his five candidates read from the harmony bank

Composer, 2026-09-07 late (verbatim in MORPH_NOTES §3; the candidates in CN-38), with five screenshots of the beating drawer's
harmony list. **The five, in `bank/harmonies.json`:** cs-015 M3 P4 = 57 61 62 (A3 C♯4 D4) · cs-019 m9 M9 = 55 68 69 (G3 G♯4 A4) ·
cs-021 M7 m9 = 55 66 68 (G3 F♯4 G♯4) · cs-050 m2 M2 M3 = 59 60 61 63 (B3 C4 C♯4 D♯4) · S055 UNISON-C oct = 36 48 60 (C2 C3 C4). The
bank holds 54 chord shapes and 45 blasts; the strikes are live from `bank/scattered_strikes.json` (46).

**Answered:** no — the tuba panel had no menu; a pitch set lived in a scratch variant or a model until the next was typed.
**Proposed (put to him):** a `pitches` pull-down at the head of the panel's fields — the model's own set · the KEPT sets by name ·
the harmony list in its three groups (the strikes, the tuba's blasts, the two-piano chord shapes); picking one makes it the model's
pitches: three notes → one per pair, doubled (BLOOM opens each, CONVERGE closes onto each from a whole tone apart, BALANCE holds
them); six → two per pair; any other count → reduced to three by whole clusters, said in the status (he can keep an edited set
instead, typed at his word); the pairs' fold and the PAIRS lines as built. **[keep]** stores the current pitches under a name with
their provenance ("cs-015 · M3 P4") in the takes file's `morphPitches` bucket (the existing `/api/snapshots`, no server change; the
bucket is born on first contact — snapshots.js rule 2); **[✕]** removes one; the kept sets head the pull-down next time; an ACTUAL
keeps its pitches as always. The five of CN-38 pre-kept under their ids at the build. Not in it: a keyboard picture or note-by-note
editing (the beating drawer's pitch side, parked). His go pending; nothing built.

## §206. "no keyboard display correct? then what will display the note names in the menu?" · "can i just have a box to type in root? … all the messiaen modes, all the pitch sets we currently have in the model, and the various transpositions … stack of 5ths … 3rds" · a to-do for the piano's solo scattered strikes — the pitch menu's design grown; one question put to him

Composer, 2026-09-07 late (verbatim in MORPH_NOTES §3; the piano note in CN-39). **Answered first:** no keyboard; the note names are
text in three places — each menu entry spells its notes (`cs-015 · M3 P4 · A3 C♯4 D4`), a line under the menu gives the chosen set
as given (and what a reduction dropped), the PAIRS lines give what each pair plays after the fold.

**The design, grown (put to him):**
- **A `root` box** (a note name or a MIDI number) beside the pitch menu. For SPECTRAL it is the fundamental (`target.fundamental`,
  41 = F2 in the stock model); for every generated family below it is the transposition — one box, both jobs.
- **The menu's groups:** the model's own set · **kept** (his, by name) · **the models' sets** (the six as re-voiced, and the tuba's
  six as they were) · **the harmony list** (strikes · blasts · chord shapes, notes spelled) · **stacks from the root** — fifths
  (0 7 14), fourths (0 5 10), major thirds (0 4 8), minor thirds (0 3 6), whole tones (0 2 4), semitones (0 1 2): three notes, one
  per pair, doubled · **Messiaen's modes from the root** — the seven modes of limited transposition (1 whole-tone · 2 octatonic · 3
  · 4 · 5 · 6 · 7): the root box is the transposition, so every transposition is one number away (listed twelvefold only if he
  wants them side by side).
- **The one question — how a MODE becomes six voices:** (a) the mode's first six degrees up from the root, voiced across the pairs'
  registers (two per pair: the pairs beat between two different notes, the sonority the mode's) · (b) three of its degrees doubled —
  the root, the third and the fifth degree — one per pair (the beating inside each pair as in BLOOM) · (c) both, as two entries per
  mode. Recommended (c). The stacks stay three doubled.
- **The reduction** of a set with more or fewer than three or six notes as said in §205 (whole clusters; said); **[keep]** and **[✕]**
  as in §205; the five of CN-38 pre-kept.

**Not built; his answer on the mode rule and his go pending.**

## §207. "You mentioned before a strategy for grabbing from any of the sonorities. let's talk about a strategy. So most of the options have many more notes than three. What are the selection strategies?" — the strategies set out, a worked example, the recommendation; one question put to him

Composer, 2026-09-07 late (verbatim in MORPH_NOTES §3). **The frame:** a sonority of N notes must give three notes (one per pair,
doubled — the beating inside each pair) or six (two per pair — a pair beats between two different notes); the fold per pair (D26)
follows whatever is chosen; the result is always shown and can be kept by name, so the strategy matters at the moment of picking only.

**The strategies put to him (a pull-down, "take"):**
- **lowest 3 / highest 3** — the bottom or the top of the sonority.
- **outer + middle** — the frame: the lowest, the highest, the one nearest the middle.
- **spread** — evenly across the sorted set (the reduceSource idea: whole clusters kept, spread over the register).
- **by register** — one note per pair, the one nearest each pair's home (Vc + Va around C3–G3, the violins G3–D4, Fl + BCl C4–F4): the
  fewest folds, the sonority heard where the players sit. Recommended as the default.
- **consecutive from k** — a window with a number box: notes k, k+1, k+2 of the sorted set — every trichord of the sonority in turn.
- **every other** — notes 1, 3, 5.
- **random (seed)** — three at random, another seed another three; the beating drawer's reshuffle idiom.
- **two per pair** as a switch for six notes: adjacent pairs (1-2 · 3-4 · 5-6, the pairs beat between neighbours) or spread pairs
  (1-4 · 2-5 · 3-6, each pair a wider interval); the strategies above pick the six.
Octave doublings are kept (S055's C2 C3 C4 is three pairs on C in three octaves — the doubling is the point).

**Worked on cs-050 (B3 C4 C♯4 D♯4):** lowest B3 C4 C♯4 · highest C4 C♯4 D♯4 · outer + middle B3 C♯4 D♯4 · spread B3 C♯4 D♯4 · by
register B3 · C♯4 · D♯4 (the low pair folds B3 down or plays it as written — both hold B3) · from 2: C4 C♯4 D♯4. On a nine-note blast
(S001, F♯1 … D4): lowest F♯1 D2 F2 (folded up by the pairs) · spread F♯1 C3 D4 · by register C3 · C♯4? — the nearest to each home.

**The modes' question of §206 dissolves into this:** a mode from the root is a sonority; "consecutive from 1, two per pair" is (a),
"spread, doubled" is (b) — the strategy pull-down serves the modes, the stacks, the harmony list and the models' sets alike.
**Put to him:** which of these to carry (all are cheap) and the default; nothing built.

## §208. THE PITCH SOURCE BUILT — the PITCHES row in the morph panel: the sonority pull-down (kept · starters · the models' sets · stacks and Messiaen's modes from a root · the harmony list), the root box, the take rule, k, the seed, one or two per pair, keep / remove; 56 checks; verified on a copy with real events

Built 2026-09-07 late at his "good to go" (§205–207), on `zz-ai-morph` (a copy, deleted after) on :5301:
- **`score/public/morph_septet.js`** (the pure part): `parseNote` (F2 · C#4 · Db4 · a number) · the families — six STACKS (5ths · 4ths ·
  major 3rds · minor 3rds · whole tones · semitones; six notes up from the root) and Messiaen's seven MODES (their degrees from the
  root over two octaves, so every pair's register holds some) · the TAKE rules on a sorted sonority — by register (the set in bands,
  from each band the note the band's pair holds as written, else the band's middle) · lowest · highest · spread · consecutive from k
  · every other · random (seed) · `takeForPairs` (three doubled, or two per pair, adjacent) · `deriveParams` (the notes into the model:
  CONVERGE opens each note a whole tone and closes onto it — a pair within a whole tone of its neighbour opens on ONE side only, or
  holds a unison, said, because the engine pairs voices by sorted pitch; SPECTRAL's fundamental = the root) · `pairRange`.
- **`score/public/morph_panel.js`**: the PITCHES row above the model's fields — the pull-down in eight groups (the model's own set ·
  kept (his) · starters · the models' sets, the septet's six and the tuba's six · stacks from the root · Messiaen's modes from the
  root · strikes · blasts · chord shapes — every entry spelling its notes), the `root` box, `take`, `k`, `seed`, `per pair`,
  **keep** (a name → the takes file's `morphPitches` bucket through `/api/snapshots`, with the sonority, its provenance and the
  settings) and **✕**; a line under it: the source, the sonority, the take and its result, what was dropped; the pitch state kept in
  the browser (`septet.morphPitch.v1`); the sources loaded once (the strikes DB, `bank/harmonies.json`, `bank/morph_pitches.json`,
  the kept bucket) and the render redone when they arrive; `applyPitch` before the cast in `generate`; the derivation's warnings in
  the flags.
- **`bank/morph_pitches.json`** — the five STARTERS of CN-38 with their provenance and the default take (by register).
- **`tools/morph_septet_check.js`, 56 checks, ALL PASS** (+18): the note names · the stack of fifths from C3 · modes 1 and 2 from C3 over
  two octaves, every mode closing the octave · the rules on cs-050 (lowest B3 C4 C♯4 · highest C4 C♯4 D♯4 · spread B3 C♯4 D♯4 · from 2
  C4 C♯4 D♯4 · every other · random · by register) and on the nine-note S001 (lowest F♯1 D2 F2 · spread F♯1 C3 D4) · three doubled
  and two per pair · CONVERGE derived on separated pairs (C3 G3 D4 → 47,49 · 54,56 · 61,63) and on close pairs (E3 F♯3 G3 → one-sided,
  three warnings, no interleave in the cast) · SPECTRAL's fundamental · the five starters.
- **On the copy, real events:** the pull-down's groups — the model (1) · starters (5) · the models' sets (12) · stacks (6) · modes (7) ·
  strikes (46) · blasts (45) · chord shapes (54); cs-050 by register → B3 C4 C♯4 (D♯4 dropped, said), the pairs Vc+Va B3 · Vn C4 · Fl+BCl
  C♯4, 33 notes; the take switched to lowest by a real change; the root typed C3 and Messiaen mode 2 chosen → C3 C♯3 D♯3 with the
  violins and the winds folded up an octave (shown with ↑); from k = 4 → E3 F♯3 G3 (the winds silent on G — said); CONVERGE on those
  close pairs → 51·52 and 65·66, the one-sided openings in the flags; SPECTRAL → the fundamental 48; cs-019 → the winds silent on A
  (said); **keep** as "zz-ai-test" → the bucket entry with the sonority, the take and k, the option "zz-ai-test · C3 C♯3 D♯3 …" in the
  kept group, the source switched to it; **✕** → removed, the option gone, the source back to the model's; the bucket left empty
  in his takes file (an empty `morphPitches` key; his file, unstaged).
- **The default:** by register. **Not in it:** spread pairs (1-4 · 2-5 · 3-6) — the engine pairs by sorted pitch, so only adjacent pairs
  exist for now (the module keeps the code; a note for the revision).

## §209. "and the actuals, they are saved into something that is comitted?" → "yes pls" — the ACTUALs' home found (bank/actuals, untracked), his first one committed with his takes file; the rule from here: both committed at every wrap

Composer, 2026-09-07 late: *"and the actuals, they are saved into something that is comitted?"* — then, to the offer to commit them
now and at every wrap: *"yes pls"*.

**Found:** \`Save as ACTUAL\` writes one JSON per actual into \`bank/actuals/\` (\`tools/model_bank.js\`, \`ACTUALS_DIR\

## §210. A composition note: the piano's harmonics at the morph's re-breaths — recorded (CN-40), the two-piano piece's method found, PLAN 1i opened

Composer, 2026-09-07 late: the note verbatim in CN-40 and MORPH_NOTES §3 — the piano plays HARMONICS in the morph section, one at
every re-breath of the ensemble, on that player's pitch or the nearest strong harmonic (the octave, the fifth, then down the chain), a
little detuned welcome; two ways to develop: the MIDI generated from the onsets, and the sampler's harmonics faked as in the two-piano
piece. **Found (not built):** `composition_for_two_pianos_and_two_percussion/docs/HARMONICS_PIANO_PLAN.md` — the IRCAM Prepared
Piano 2 "Harmonics" preparation: fundamental + partial → `playMidi` + CC21 (19.048 c per step, centre 64, 85 ms lead; CC21 is per
channel, so a second channel for a second voice), the curated partial table per string range (low 2–28 · mid 2–16 · transitions with
short lists · none above B4), the ceiling 101 — phases 1–2 built there 2026-04-08. The septet's own data for it exists: the morph render's
segments (each re-breath's start and cents per voice) and the beating's breath spans. **Opened PLAN 1i (todo):** the piano's harmonics
for the morph section — (1) the generator from a morph's render, (2) the sound: the IRCAM table ported and refined, a pass over the
onsets (natural · by another key and the shift · unreachable), other libraries looked at. Nothing built; his word when the morph
section is composed.

## §211. "for the spectral model how do I change the root, if I type a new root in the root box it continues to use F" — two gaps found and fixed: the root reached SPECTRAL only through a chosen sonority, and a bare pitch class was not read

Composer, 2026-09-07 late, mid-build, with a screenshot (SPECTRAL, "the model's own set", the root box `D#`, 78 notes playing, three
ACTUALs): *"and then for the spectral model how do I change the root, if I type a new root in the root box it continues to use F"*.

**The causes (both mine, §208):** (1) `applyPitch` returned the params untouched when the source was "the model's own set", so the
root — meant to be SPECTRAL's fundamental "whatever the source" (§206) — never reached it; (2) `parseNote` demanded an octave
(`D#2`), so `D#` read as nothing. **Fixed:** `parseNote(s, ref)` — a bare pitch class takes the octave nearest a reference (the
fundamental the model already sits in: F2 → `D#` = D♯2; the families' reference C3); `applyPitch` sets SPECTRAL's fundamental from the
root box with any source, and says so under the row ("SPECTRAL's fundamental D#2 (39) from the root box"; the model's own when the
box is empty). Checks 58 (three new: D♯ near F2 = 39, near C3 = 51, the SPECTRAL derivation). **On a copy with real events:** SPECTRAL
with the model's own set, `D#` typed → the fundamental 39, the render re-done (31 notes); `A3` → 57; the box emptied → back to F2;
BLOOM untouched by the root. Committed; his hard reload brings it.

## §212. "how about the ending of these morphs? Is that what the release box is for? … And then the naming can it increment per model? because I lose track of which one" — the release answered from the timing rule; the actual's default label now carries its number, its length and its pitch source

Composer, 2026-09-07 late, with two screenshots (the panel's dials — pace 40 s, duration and release blank, segment 8 s, bias 0.2,
seed 13 — and the Save-as-ACTUAL prompt prefilled "SPACING MIGRATION, 40 s"): *"And then how about the ending of these morphs? Is
that what the release box is for? So if I wanted to fade out, essentially, I just use the release seconds. And then the naming can it
increment per model? because I lose track of which one. or we could just use an universal increment regardless of the model."*

**The ending (answered from `carrierTiming` and `stateAt`):** yes — `release (s)` is the run-down: after the body the pitches close
back to where they began and the LEVEL fades from its body-end value to the floor (0.4 — the sampler's own decay, not silence), the
players finishing their breath rather than being cut ("let them finish"); the total = duration + release. `duration (s)` is how long
the body lasts: blank = the one-way gliss of `pace` and nothing more; longer than the pace = the body cycles out and back until it.
So a fade-out = a release in seconds; a hold-then-fade = a duration, then the release. The shape presets' release block (taper,
dropout by pairs, a motion to unison) is the tuba's finer tool, untouched here.

**The naming:** the file's id already increments per model (`ACT-<MODEL>-NN`, the server's next free number — ACT-SPECTRAL-01, -02 …);
what repeated was the LABEL's default, the model's name and the length. Now the prompt prefills `<MODEL>-NN · <length> s · <the pitch
source>` — e.g. "SPECTRAL-03 · 40 s · cs-015 · M3 P4" — the number guessed from the list (the same as the file's unless a gap was left
by a deletion), so the ACTUALs list reads back; his words still replace it. Not walked in the pane (a prompt's default string; the
list's fields as the server sends them).

## §213. "is there a way to recall an actual to modify it?" — no, so built: recall → MODELS; and on the way a defect found and fixed: the server rendered every ACTUAL WITHOUT the septet palette (the tuba's techniques and constants) — the save path fixed, his seven actuals rebuilt from their provenance, the validator taught the cast's lanes

Composer, 2026-09-07 late: *"is there a way to recall an actual to modify it?"* (verbatim in MORPH_NOTES §3).

**The answer as it stood:** no — an ACTUAL is a frozen render (the tuba's rule: placed verbatim, never re-rendered); it keeps its
provenance (the model, the recipe settings, the seed, the resolved params, the shape preset), so a recall is derivable.

**Found on the way (a defect of §204, mine):** `Save as ACTUAL` renders on the SERVER (`tools/model_bank.js buildActual`, "the render is
reproducible from what we store") — with the tuba's `RENDER_OPTS` and no palette. So every actual he saved tonight carried the tuba's
techniques (`ord`, even `mute_ord` where a pitch fell outside the tuba's range), the tuba's breath table and bend reach; placed in the
score, the strings and the bass clarinet would have played on channel 1 with no switch. None was placed yet (placements 0 on all
seven). **Fixed:** `renderOptsFor(params)` in model_bank — a cast (`params.lanes`) → the palette per voice from `morph_septet.js`
(the recipe by vm, TRACKS from composer.html, beating_calc), the same the panel hands the engine; used by the save, its integrity
re-render and the validator; the provenance now keeps `palette` (each voice's player, voice and reach), `pairs` (the cast) and
`pitch` (the pitch source's state) — the server route passes them, the panel sends them. **`--rebuild`:** every stored actual
re-rendered from its `resolvedParams` with its cast's palette — entity, label, provenance and placements kept; objects, notes, span,
parts, register and the palette summary rewritten; deterministic — run on his seven: ACT-BLOOM-01 · SPACING-01/02/03 · SPECTRAL-01/02/03,
each `ord` (SPACING-01 `ord,mute_ord`) → `senza_vel,ord` (the strings and the bass clarinet at senza vibrato, the flute at ord).
**The validator** derived "objects from notes" on lanes 0 … n−1 and so failed a cast; now on the cast's lanes; and three
references in the model store to actuals whose files are gone (ACT-BALANCE-01, ACT-BLOOM-02, ACT-CONVERGE-01 — deleted by hand, or
saved and removed) dropped → `--validate` VALID (with warnings). The model store rev 17.

**Built — the recall:** a third button on every ACTUALs card, **recall → MODELS**: the actual's model, its recipe settings, its seed,
its shape preset, its CAST (the stored pairs; for the seven of tonight, saved before the cast was stored, the pairs read from its
lanes in pitch order) and its PITCHES — the actual's own set becomes the pitch source ("recalled from an ACTUAL" in the pull-down:
the distinct notes of its source, or a CONVERGE's unisons; doubled = one per pair, six distinct = two per pair; SPECTRAL's root =
its stored fundamental), exact by construction, so the poll and a nudged dial keep them; the dials as nudged that day render once
from the stored params (`_recallParams`), then the fields are live; the status says what came back; Save as ACTUAL then files a new
number. The placed actual's META shape now on the septet's META layer (7; the tuba's 10 was there too).

**Verified:** 64 checks (+6: buildActual renders with the palette, the stored notes and objects at each player's voice, the provenance
keeps the cast, the pitch and the palette, renderOptsFor with and without a cast). On a copy with real events: the seven cards with
the recall button; recall ACT-SPECTRAL-01 by a real click → MODELS · SPECTRAL · seed 17 · span 40, duration 100 as nudged · the cast
Vc+BCl · Vn1+Va · Fl+Vn2 read from its lanes · the pitch source "ACT-SPECTRAL-01 as stored — A♯2 F3 A3 C4 D4 F4" · the fundamental
F2 · 78 notes = the stored 78, unchanged after two polls and an explicit Generate; hear → the notes at senza_vel / ord, CC0 5 on the
cello and 12 on the bass clarinet; place → 78 notes on the cast's lanes with the septet techniques, the META shape on layer 7, the
marker. A first version of the recall was caught by the test: it left the pitch source on "the model's own set", and the next poll's
Generate crept the stock set back in (80 notes) — hence the actual's own set as the source.

## §214. "I'm starting section two now at one eighty three … if I don't like it, I like to revert back. So how do I do this?" — the D17 rule read back as a recipe: Name version first, Save only at a keeper, Reload = back to the last Save; the versions' commit put to him

Composer, 2026-09-07 late (verbatim in CN-41). **Told him (from NAMING §1 and §143):** (1) Name version now — `1.25-sec2start` — the
file written and a frozen copy beside it; (2) work at 183 s; autosave keeps the working copy; Save only when a step is good, since
Reload returns to the file as last saved; (3) Reload = drop the unsaved edits, back to the 1.25 state; (4) at each keeper Save, then
Name version again. **Cautions:** past a Save only a named version leads back, swapped into the piece file by the AI (a version
opened is for looking — Save inside it writes into the frozen copy, §143); his 18 named versions since v1.7 are untracked, though
NAMING §1 says the score files are committed — their commit at every wrap, with the piece file, put to him as a question (his
files; the rule of §209 for the takes and the actuals extended if he says yes).

## §215. "What if I want to try several things? … be able to go back to the first try or the second try or the third try or back to nothing" — branching tries: what D17's rule gives (a frozen version per try) and what it lacks (a way back that is not the last Save); Restore proposed

Composer, 2026-09-07 late (verbatim in CN-42 with the Lake George note). **Told him:** each try is a named version (`1.26-tryA`,
`1.27-tryB` …), frozen, never overwritten — that half the app has. What it lacks is the way BACK to a chosen point: Reload returns
only to the file as last saved, and Name version saves the file, so after "save that as a version" the file IS the try; going back to
the section's start (`1.25-sec2start`) or to try A means making that frozen version the piece file again — today the AI's file
operation on request (§143: a version opened is for looking; Save inside it writes into the frozen copy; the app never promotes a
version to the main name). **Proposed:** a **Restore** in the Piece menu — pick a named version → the current file is frozen first as
a safety version (`v<next>-before-restore`), the version's contents become the piece file, the working copy is dropped, the app
reopens on it; the tuba piece had a Restore, D17 dropped it with the numbering chain; branching brings the need back, without the
chain. To build at his word (a server route copying one file over another after the safety copy, and one menu entry; verified on a
copy). Until then: name every try, and say which one to bring back.

## §216. "build restore good and are the versions very big, my string quartet got bloated from save files but I suspect it was because of audio embeded" — RESTORE built and verified; the sizes measured (no audio inside); his 26 named versions and the piece file committed

Composer, 2026-09-07 late: *"build restore good  and are the versions very big, my string quartet got bloated from save files but I
suspect it was because of audio embeded"*.

**The sizes:** the 26 named versions (v1.7 … v1.28) 7.1 MB together, the piece file 470 KB, the actuals 3.3 MB, the repo's `.git`
80 MB; a save holds `version · layoutVersion · tracks · assets (2 bytes) · metadata · objects · markers · databases · nextId ·
viewport` — no audio, no base64 (the beatings' and trills' notes are generated at play, the snippets are MIDI events). So the score
files are committed by NAMING §1's rule (D17): the versions and the piece file at 0a2f391; from here the score files join the takes
and the actuals at every wrap (HOW_WE_WORK). His ACT-CONVERGE-01 committed on the way.

**RESTORE (D27) — built:** `POST /api/composer/restore { base, version, safety }` in `score/server.js`: the base file as it is now
copied to `<base>-v<next>-before-restore` first (refused if that name exists — a frozen version is never overwritten), the version's
contents written to the base file with fresh stamps (`metadata.restoredFrom / restoredAt`), the working copy removed; in
`composer.html` a **Restore…** button beside Reload → a small box under the toolbar listing the base's named versions newest first,
the safety name shown, a confirmation, then the working copy dropped, the restore, the base reopened, the status line saying what
came back and what was frozen; the `?` hints carry it. Reload stays "back to the last Save"; Restore is "back to that one".

**Verified on copies (`zz-ai-rst`, `-v1.1` = the piece, `-v1.2-other` = v1.9's 327 objects; deleted after) with real events:** the button
and the hint present; an unsaved marker added; Restore… → the box lists v1.2-other, v1.1 (newest first), the safety name
`zz-ai-rst-v1.3-before-restore`; the version chosen, the confirmation's text right; after: the session on a fresh working copy with
327 objects, the unsaved marker gone, the status "restored zz-ai-rst from zz-ai-rst-v1.2-other · the previous file frozen as
zz-ai-rst-v1.3-before-restore"; on disk the base 167 K (= the version), the safety copy 470 K (= the previous file); the next
suggested label 1.4. The inline scripts syntax-checked (a first application of the patch had been garbled by a `$'` in a regex
that the string-replace read as a pattern — the patch helper now inserts verbatim; the file was reverted from git and re-patched).

## §217. "good go please" — PLAN 1i begun on the BEATING BLOOM at 183 s: the model confirmed, the first pass un-shifted; one ambiguity found after his go, built as a switch

Composer, 2026-09-08 (after the clear; the postclear playback and the planning method's phase 1 in one message): *"good go please"* — to the
model read back in one line (*at every re-breath of that morph the piano sounds one harmonic of the re-entering player's pitch — the
octave first, then the twelfth, then down the chain — the nearest key when none is exact, a little detuned welcome; one piano note per
re-breath*) and to option (a): plain notes on the piano lane at the `harmonics` technique, un-shifted, heard today; the CC21 partial
shift and a chosen detune the second pass. **The morph:** his `scores/piano-harmonics-test.json` — the marker "MORPH M1 — BEATING
BLOOM" at 182.996 s, group `grp-morph-01`, 89 morph notes on the six players' lanes (Fl 16 · BCl 14 · Vn1 15 · Vn2 15 · Va 14 · Vc 15),
every note one re-breath (`startSeconds`, `sonifyNote`, `morphBend`), the piano lane holding only the strikes, the META shape on
layer 7. (The group has 89 notes where the BLOOM actuals hold 79–81: it is a Generate → Insert, not a placed actual; the score is
the ground either way, D9.)

**Confirmed in the two-piano piece's instrument map** (`docs/instruments/ircam-prepared-piano-2.md`, one grep): the sampled harmonic is
the 2nd partial — key K sounds K + 12 un-shifted; CC21 transposes it up to +12 st (127); the top sounding pitch F7 (101); this repo's
`harmonics` technique: channel 3, keys 21–77.

**An ambiguity noticed after his go, resolved as a switch (the tool offers, never applies):** his note (CN-40) says *"a little detuned
from what's being played in the ensemble … the closest one that has the strongest harmonic"* — read closely, the piano's harmonic
sounds AT the player's pitch (the octave harmonic of the string an octave below it), and "down the chain" names which lower string
carries it (the 3rd partial of the string a twelfth below, …); the read-back said "the octave first", which reads either way (the
octave harmonic, or the sound an octave above). The two are one parameter of the same generator, so the panel offers **sounds: at the
pitch · an octave above**, the default **at the pitch** — three reasons: his words' proximity ("detuned from what's being played"); the
beating, this section's subject, strongest at the near-unison; the coverage — un-shifted, "at the pitch" reaches every note up to
F6 (89) with a key in 21–77, while "an octave above" has no string for anything above F5 (77) and would fold down onto the same
keys. Above the reach a note folds an octave down (the pitch class kept) and says so on the note. The un-shifted pass rounds the
player's pitch at the re-breath (the key plus the bend's first point) to the nearest key — a detune up to ±50 c, recorded per note;
the shift pass will narrow it to ±9.5 c (CC21's 19.048 c steps).

**The tree since the checkpoint:** his saves — ACT-BLOOM-03 and -04, the model store, the test score — are committed at this wrap by
the rules of §209 / §216. The build goes on a copy (`zz-ai-pnoharm`); the module in `score/public/piano_harmonics.js` (pure, loads on
the page and in node like `morph_septet.js`), the checks and a CLI in `tools/`; the button on the morph panel, acting on the morph
group at the playhead.

## §218. PLAN 1i's first pass BUILT: ♪ piano harmonics on the morph panel — one note per re-breath of the morph under the playhead, at the pitch or an octave above, a level box; 38 checks; verified on a copy with real events and the decoded MIDI

2026-09-08, at his *"good go please"* (§217). **What exists:**
- `score/public/piano_harmonics.js` (pure; the page and node): `reBreaths` — every sounding note of the morph's group on a player's
  lane (never the piano's lane, the META shape or the piano harmonics themselves), its start the re-breath, its pitch the key plus
  `morphBend[0]`; `harmonicFor` — the target sound (the pitch, or an octave above), the key = round(target) − 12 (the sampled octave
  harmonic), folded by octaves into the technique's keys 21–77 with the pitch class kept, the detune = the sound minus the target;
  `generate` — a note per re-breath, the coincident same-key ones merged within 30 ms (the longer end, the higher level), the level 7
  or each source's own peak, the length the source's (a cap on request); `toScoreObjects` — plain notes on the piano lane at
  `harmonics`, a flat curve, the morph's `groupId`, the provenance under `properties.pianoHarmonics` (NAMING §2.12); `ownedBy` /
  `stripped` (a re-run replaces); `morphGroups` / `findMorphAt` (the morph under the playhead).
- `morph_panel.js`: the row under Insert / Save as ACTUAL — **♪ piano harmonics** · a select *at the pitch / an octave above* · the level
  box (empty = each source's peak); `pianoHarmonics()` takes the selected morph shape's group, else the morph under the playhead, else
  the score's only one; `pushUndoState` first (the one place this panel touches the undo stack — the notes land on a lane he edits by
  hand); the status line says the counts, the keys, the detune, what was replaced. `composer.html`: the script tag.
- `tools/piano_harmonics.js` (the CLI: the table per note, `--write` / `--strip` / `--octave` / `--level` / `--max-dur`, the piece file
  refused without `--force`, the compact JSON kept); `tools/piano_harmonics_check.js` — 38 checks.

**The numbers on his BLOOM at 183 s:** 89 re-breaths → 85 notes, 4 merged at the opening chord (the pairs' doubled pitches re-breathe
together); the keys G#1–C#3, sounding G#2 · G3 · C#4 — the three pairs' pitches (BCl + Vc on G#2, Vn1 + Va on G3, Fl + Vn2 on
C#4); the detune ≤ 25 c, mean 10 c (the players are mid-glide at most re-breaths); nothing folded (the BLOOM sits at 43.8–61.2).

**Verified on a copy (`zz-ai-pnoharm`, deleted after) with real events:** the button's click with the playhead at 280.9 s (inside the
morph) → 85 notes on lane 2 at `harmonics` in `grp-morph-01`, rendered (85 elements), the status line right; CTRL+Z as a real
keydown → the 85 gone, the objects back to 730 and `nextId` to 1534 (each undo steps one run back through the history); the
select's real `change` → an octave above → 85 replaced, every key +12, the provenance's `octave` 1; the level box emptied → the
sources' peaks (0.8 … 9.2); `abc` → refused with the message, nothing changed; the defaults back. **The decoded MIDI** (fake outputs
on the eight ports, the playback driven by hand from 182.5 to 186 s — rAF never fires in the hidden pane): the piano's three opening
harmonics on the Piano port, channel 3 — keys 49 · 32 · 43 (C#3 · G#1 · G2) at velocity 109 (level 7 through the remap), CC7 109
then 107 — while the six players sounded on their own ports (senza vibrato cc0 5, the bass clarinet cc0 12, the flute on its ord
channel) with their bends. **The group drag as a real mouse sequence** on the META shape (mousedown · two moves · mouseup; 56 px =
2.004 s, then 2.0 s back): the shape, the marker, the 89 morph notes and the 85 piano notes all moved by the exact dt — the notes
travel with the morph. The CLI's `--write` / replace / `--strip` round trip on a scratch copy; the piece-file guard.

**Found on the way, not built (NITS):** (a) the piano's `harmonics` loudness law is the Steinway's — 1g measured `main` only — so at
the ensemble's placed level the remap gives velocity 20–40 (inaudible); hence the level box with 7 as the default (velocity 109); a
sweep of the harmonics preparation would give it its own law. (b) The placed morph notes' curve heights are the engine's 0–1 levels
on the score's 0–10 scale (y ≤ 0.8 on the BLOOM): the score plays them at velocity 64–80 and CC7 108–123 through the remap — whether
that is the loudness he hears in the panel's audition is his ear's question. (c) The `?` help line lists keys, not panel buttons; the
button carries its own title. Also noted: the single-shape drag moves a group's members by the exact dt, the multi-selection drag
snaps them to 0.05 s (§144) — two rules for one gesture.

**Next:** his listening — a hard reload (CTRL+SHIFT+R), his test score, [Morph], the playhead inside the BLOOM at 183 s, ♪ piano
harmonics, Play; the switch and the level by ear; then the second pass (the CC21 partial shift: the chain, an exact detune; the
two-piano piece's rules and lead) at his word, by the planning method.

## §219. CN-43 opened — "just articulation points … lines in the piano part, initially with nothing attached … click a line, keyboard pops up": the design discussion asked for; the app read for what it can borrow; the model of the line put to him

Composer, 2026-09-08 (after the apex dots were explained): the idea verbatim in CN-43 and MORPH_NOTES §3 — the piano's part in the
morph section composed BY HAND on a grid the morph gives: not generated notes (PLAN 1i's first pass, §218) but generated MOMENTS —
per morph note its onset (the re-breath), its apex (the dot, §4484's rule) and its end — as empty lines on the piano lane; a click on
a line → a pitch on a vertical keyboard, an articulation (normal · muted · harmonic · plucked), a dynamic (ppp … fff), a duration
(typed or dialled). *"Let's discuss how this should look first before building it"* → the planning method, phase 1.

**The app read for what the picture can borrow (one grep each):**
- A shape without a pitch is a first-class state of the score: a `waveCurve` with `sonifyNote` null is drawn, silent (the tick skips
  it), ignored by every note filter and the extractor — the "sonify" idiom of the tuba lineage (draw the shape, then give it a note).
- A note's pitch by hand today = the property panel's "Sound note (MIDI, blank=off)" number box; its technique a select of the lane's
  techniques; its dynamic the curve height (NAMING §2.9; ppp … fff = eight equal steps, `dynName` / `parseLevel` in beating_panel.js);
  its length the end dragged in the score or typed. The O key converts selected notes to ORD (a keyboard idiom for the voice).
- The vertical keyboard he means is the drawers' (the strikes drawer's `renderKeyboard`, the beating drawer's `drawKeyboard`: an SVG
  with the keys stacked by pitch, a C label per octave, the players' ranges as coloured columns, a key click arms a note). The
  two-piano piece's horizontal `#pianoKeyboard` (750 × 280, chord shapes, a function select) is dead here — its CSS ported, no element.
- The piano's voices in the recipe: `main` (the Steinway) · `plucked` (channel 2) · `harmonics` (channel 3, keys 21–77) · `muted`
  (channel 5) — the four he named.
- The numbers: the BLOOM at 183 s has 89 notes → 267 moments over 110 s (2.4 a second, in clusters where the six players' breaths
  fall close); the lines want ticks per kind and per player, a faint birth, and a way to clear the ones never used.

**Put to him (topic 1 of the discussion, the model in one line):** *a line is an empty note* — a note on the piano lane at that
moment with no pitch yet, drawn as a thin vertical line with a small head while empty (its kind and its source visible), filled in
by the click (the pitch, the voice, the dynamic as its height, the duration as its length) and from then an ordinary piano note that
drags, stretches, deletes and undoes like any other; nothing new in the file. The alternative: a separate line object that stays
beside the note — more objects, a new type for the extractor. (a) recommended. Held aside for after: the picker's look, which lines
are generated (kinds, players, density, clearing), the notation at 2a.

## §220. CN-43, topic 1 decided — "yes, a is good": a line is an empty note; two more asks (the kind checkboxes; the ensemble's notes on the keyboard); topic 2, the picker's look, put to him

Composer, 2026-09-08 (verbatim in MORPH_NOTES §3): (a) decided — a line is an empty note. Two asks with it: checkboxes *"somewhere
maybe in the piano zone or the meta shape"* to SHOW the lines by kind (the peaks, the onsets, the offsets — one box each, any
combination) — a view filter over lines that all exist, held for topic 3; and, on the keyboard when a line is clicked, *"what notes
are being played at that moment in the ensemble"* — into topic 2.

**Topic 2 put to him — the picker's look (the score's idiom borrowed, HOW_WE_WORK rule B):** a click on a line selects it and opens
a small card beside it (the node editor's manner: ENTER applies, ESC closes), not a full-page drawer. On the card, left to right: the
source ("Vc G#2 · apex · 208.94 s"); **the vertical keyboard** (the drawers' keyboard: keys stacked by pitch, C per octave) over the
piano's range with the chosen voice's reach lit and the rest dimmed, and ON IT the ensemble at that instant — each player's sounding
pitch (the key plus its bend at that moment, a mid-glide one with its cents) as a mark in the player's colour with its short name,
the line's own source ringed, the piano's own notes already made at that moment in the piano's colour; **the voice** as four buttons
(normal · muted · harmonic · plucked — the recipe's techniques); **the dynamic** as eight buttons ppp … fff (the score's scale, the
note's height); **the duration** as presets (¼ · ½ · 1 · 2 · 4 s · to the next line) and a box to type or drag, and afterwards the
note's end handle in the score; **a ▶ in context** that plays the score from a second before the line to two after; a key click sets
the pitch and sounds it on the piano alone at the chosen voice and dynamic (put to him as the one question — sound on every click,
or set only and hear by ▶). Apply → the line becomes an ordinary piano note carrying its provenance (`properties.cue`: the kind,
the source note, its lane and pitch at that moment); a click on a made note reopens the same card.

## §221. CN-43, topic 2 decided — "a": a key click sets the pitch and sounds it; the morph's boundaries measured before topic 3 (every boundary a breath; the peaks by the apex rule); topic 3 put to him

Composer, 2026-09-08: *"a"* — the picker as §220 describes it, a key click sounding the note on the piano alone at the chosen voice and
dynamic; nothing in the picture changed.

**The data first (the BLOOM at 183 s, `scores/piano-harmonics-test.json`, one node script):** every note boundary is a breath — the
winds' gaps 0.43–0.57 s, the strings' bow changes 0.049–0.057 s; no overlaps, no seamless re-keys (the engine never split a run
here — the pitches move within ±25 c), so an onset IS a re-breath in this morph (and PLAN 1i's first pass read it rightly; a morph
with re-keys would need the re-key told from the breath — the 5 ms overlap is the tell; noted for the generator). The peaks by the
score's apex rule (§4484: the loudest interior node, at least as loud as both ends): 54 of the 89 notes carry a dot — the rest are
still rising at their end, or start at the top. Eight onsets fall within 0.1 s of another (the pairs breathing together). The lines
the BLOOM would give: onsets 89 · peaks 54 · ends 89 = 232 over 110 s. The level curves are 13–14 nodes, a rise to a plateau.

**Topic 3 put to him — which lines, and the lane kept readable:** one button on the morph panel's row (*lines → piano*) generates
all three kinds for every player of the morph under the playhead; a re-run replaces the unused lines and leaves the notes made. A
line: thin, faint, the lane's height, the source player's colour, a small head by kind (● onset · ◆ peak · ○ end), the source on
hover. **His checkboxes** onsets · peaks · ends as a view filter (a hidden kind is neither drawn nor clickable; made notes always
shown; the setting the browser's, not the file's) — WHERE is the one question: (a) a small bar at the left end of the piano lane
(recommended: always in view while the lane has lines) · (b) the META shape's property panel (the shape must be selected first) ·
(c) the morph panel (not always open). Offered with it: a row of player ticks on the same bar, and *clear lines* (the unused lines
of the morph removed, the notes kept, CTRL+Z undoes). Coincident lines a hair apart: the click takes the nearest, the card names
the player. After topic 3: phase 2, the top line.

## §222. CN-43, topic 3 decided — "a": the kind checkboxes on a bar at the left end of the piano lane; phase 1 complete; phase 2, the top line, put to him

Composer, 2026-09-08: *"a"* — the bar on the piano lane (his "piano zone"): the checkboxes onsets · peaks · ends, the player ticks,
*clear lines*; nothing struck from the picture of §221. **Phase 1 complete** — the three topics decided: (1) a line is an empty note
(§220); (2) the picker card at the line, the vertical keyboard with the ensemble at that instant, the four voices, ppp … fff, the
duration presets and box, ▶ in context, a key click sets and sounds (§221); (3) *lines → piano* on the morph panel for all kinds and
players of the morph under the playhead, the lines faint in the player's colour with a head by kind, the view filter on the lane's
bar (§222). The notation held for 2a.

**Phase 2 put to him — the top line (the ID 1j proposed, after 1i):** 1 the line (an empty piano note drawn as a thin line, its kind
and colour; the score treats it as any note) · 2 lines → piano (the generator on the morph panel; a re-run keeps the notes made) ·
3 the picker card (the keyboard with the ensemble at that instant, the voice, the dynamic, the duration, a key click sets and
sounds, ▶ in context, apply) · 4 the bar on the piano lane (the kind checkboxes, the player ticks, clear lines) · 5 verify and
document (the checks, the walk on a copy with real events, the decoded MIDI, the docs), then his first lines in the piece. The
picker before the bar: his ear early (HOW_WE_WORK).

## §223. CN-43, phase 2 confirmed — "ok good": the top line stands; PLAN 1j opened with it; phase 3 begins — step 1's goal put to him

Composer, 2026-09-08: *"ok good"* to the five lines of §222, in that order. **PLAN 1j opened** (after 1i; the why, his words, the
decisions of §220–222, the five steps each "to be laid out when we discuss it") and committed — a cleared chat loses nothing.
**Phase 3, step 1 — the goal put to him (format A):** *1. The line.* Result when done: an object on the piano lane that is a note
with no pitch yet — born at a moment with its kind (onset · peak · end) and its source (the player, its note, its pitch at that
instant) in its provenance; drawn as a thin faint line the lane's height in the source player's colour with a small head by kind;
silent, ignored by the extractor and every note filter; selected by a click, dragged, deleted, saved and undone like any note; when
it is given a pitch it becomes an ordinary piano note that keeps its provenance. Discussed, then its sub-steps, then into the plan.

## §224. CN-43, phase 3 — step 1 agreed ("good") and written into PLAN 1j with its sub-steps; his format from here: each step's goal and sub-steps together

Composer, 2026-09-08: *"good, and you can give me each step and substeps at the same time"* — the goal of step 1 (the line, §223)
stands; from step 2 on, a step's goal (format A) and its sub-steps (format B) come in one turn, still one step per turn. **Step 1
written into PLAN 1j** (the to-dos: the object and its provenance under `properties.cue` → NAMING §2.13; the drawing rule — a thin
faint line the lane's height in the player's colour with a head by kind; kept inert — the tick, the extractor and the filters
checked, not assumed, the trill and strike logic and the apex rule kept off it; alive in the score — select, drag, delete, undo,
save, reload, the morph's group; the turn into a note when a pitch is set, the provenance kept; the check — a handful of lines
placed by a script into a copy, drawn and silent, node checks). Committed. **Next: step 2, lines → piano — its goal and sub-steps
together.**

## §225. CN-43, phase 3 — step 2 (lines → piano) agreed ("good") and written into PLAN 1j; step 3, the picker card, put to him with its sub-steps

Composer, 2026-09-08: *"good"* — step 2 as put (§224's message): the pure generator `piano_cues.js` (the moments onset · peak · end per
note with the player, the pitch at that instant and the level; a re-key told by the 5 ms overlap gives no line), the empty notes with
`properties.cue` and a nominal 0.05 s span, the button beside ♪ piano harmonics with the status by kind and player, the re-run rule
(unused lines regenerated, made notes kept), the CLI, the checks (89 · 54 · 89 on the BLOOM; the page walk). Written, committed.
**Step 3 put to him, goal and sub-steps together:** the card at the line (the node editor's manner), the source at its top; the
drawers' vertical keyboard for the piano with the chosen voice's reach lit and the piano's own sounding notes; the ensemble at that
instant — each player's sounding note and its pitch there, a mark in the player's colour with its name, the cents beside a mid-glide
one, the source ringed; the four voice buttons (the recipe's main · muted · harmonics · plucked); the eight dynamic buttons (the
score's scale → the height); the duration presets ¼ · ½ · 1 · 2 · 4 s · to the next line and a box (default 1 s); a key click sets
and sounds through the piano's port on the voice's channel at the dynamic through the remap; ▶ in context = the transport from t − 1
to t + 2 s; apply turns the line into a note (pitch · technique · height · length, the provenance kept), ESC leaves it, a made note
reopens with its values; the checks with real events and the decoded MIDI, node checks for the pure parts.

## §226. CN-43, phase 3 — step 3 (the picker card) agreed ("good") and written into PLAN 1j; step 4, the bar on the piano lane, put to him with its sub-steps

Composer, 2026-09-08: *"good"* — step 3 as put (§225): the card at the line, the drawers' vertical keyboard for the piano with the
voice's reach lit, the ensemble at that instant in the players' colours (the cents beside a mid-glide one, the source ringed), the
piano's own notes, the four voices, the eight dynamics, the duration presets and box (default 1 s), a key click that sets and sounds,
▶ in context (t − 1 … t + 2 s), apply / ESC, a made note reopening with its values, the checks. Written, committed. **Step 4 put to
him:** a small strip at the left end of the piano lane, shown while the lane holds lines — the kind ticks onsets · peaks · ends, the
player ticks in score order and colour, *clear lines*; an unticked kind or player hides its lines (not drawn, no hit target), made
notes always shown, the setting the browser's (localStorage) never the file's; clear lines removes the lane's lines still without a
pitch and keeps the made notes, undo restores; the checks with real events (each tick, the counts, clear, a reload keeping the ticks).

## §227. CN-43, phase 3 — step 4 agreed with his one addition made explicit ("can we add instrument checkboxes? so if I check only peaks and fl I'll only see flute peaks"): the rule kind AND player; written into PLAN 1j; step 5 put to him

Composer, 2026-09-08 (verbatim in MORPH_NOTES §3). The player ticks were in step 4's picture; his example fixes the rule — a line is
shown when its kind is ticked AND its player is ticked — now in the step's result and to-dos. Written, committed. **Step 5 put to
him, goal and sub-steps together:** the whole of 1j walked end to end on a copy with real events and the decoded MIDI; one node
check script; the documents (NAMING §2.13 the line's fields, MORPH_NOTES §1, the buttons' titles, PLAN 1j's statuses, the journal,
PLANNER); then his first lines in the piece (a hard reload, his test score, [Morph], lines → piano at 183 s, the ticks, a line
clicked, a pitch · a voice · a dynamic · a duration, apply, heard), his verdicts to MORPH_NOTES §3 and NITS; the notation of a
cue-born note at 2a. After step 5: the whole item shown once, "is that it?", and what sits outside the plan.

## §228. CN-43, phase 3 complete — step 5 agreed ("good") and written; PLAN 1j planned whole; the item shown to him once ("is that it?")

Composer, 2026-09-08: *"good"* — step 5 as put (§227). **PLAN 1j is planned whole** — five steps in the fixed formats, each agreed in
one turn (goal and sub-steps together from step 2, his format of §224) and written at once; the status `PLANNED`, the build at his
word, step 1 first. Shown to him once as the method asks, with what sits outside the plan: the build's go (each step a chunk —
proposal → go → build on a copy → verify → docs → commit → push), his listening of the piano harmonics (§218) still pending, the two
NITS of §218. Twelve turns from CN-43 to the plan.

## §229. PLAN 1j — "yes, can you pls implement the full plan, I'll try when build is done": the build begins, the AI alone, each step a chunk on a copy

Composer, 2026-09-08: the item confirmed whole and the build ordered — the AI builds steps 1–5 in order without him, each on a
`zz-ai-` copy of his test score, verified with real events and the decoded MIDI, documented and committed at its wrap; his test is
after the build (the way of PLAN 1f, §167). The piece file and his test score are never written. Entries §230 on record each step.

## §230. PLAN 1j steps 1 and 2 BUILT — the line (an empty note drawn as a line) and *lines → piano* (the generator, the button, the CLI, 32 checks)

2026-09-08, the AI alone at his word (§229). **Step 1, the line:** `Composer.isCueLine` / `isCueNote` (a waveCurve on the piano lane
with a `cue` provenance and no sound note / with one); `renderWaveCurve` and `updateWCRendering` hand a line to `renderCueLine` — a
thin line the lane's height in the source player's colour (the drawers' palette, `INST_COL`), a head by kind (● onset filled,
◆ peak a diamond, ○ end hollow with the line dashed), a hit rect 8 px wide with the source in its title, the score's selection
highlight, a mousedown that selects and starts the note's own time drag (`startWCBodyDrag`, the lane locked for a line), a click
without a drag that opens the picker; `renderNodeHandles` draws nothing on it; the tick, the extractor and every note filter ignore
it as they ignore any shape without a sound note (checked, not assumed: `sonifyNote != null` everywhere); the apex rule never sees
it (the early return precedes it); delete, undo, save and reload are the score's; it joins the morph's group. The fields in NAMING
§2.13. **Step 2, lines → piano:** `score/public/piano_cues.js` (pure) — `moments` (per note of every player of the morph: the onset,
the peak where the score's apex rule finds one — the same rule, re-implemented and checked against it — and the end; each with the
player, the pitch at that instant (the key plus the bend there) and the level there; a seamless re-key told by a gap ≤ 12 ms gives
neither an end nor an onset; a moment whose note is already made gets no fresh line), `toScoreObjects` (empty notes with
`properties.cue`, a nominal 0.05 s span, the stored height mf, the player's colour), `ownedLines` / `ownedNotes` / `strippedLines`,
`describe`, `defaultFilter` / `shown` (kind AND player), `ensembleAt`, `nextAfter`, `cueToNote`, the dynamics ↔ height
(`dynHeight` / `dynName`, NAMING §2.9); the button **lines → piano** beside ♪ piano harmonics (`morph_panel.js pianoCues()`: the same
choice of morph — the selected shape's, the playhead's, the only one; `pushUndoState` first; the status by kind and player);
`tools/piano_cues.js` (the CLI: the table per moment, `--write` / `--strip`, the piece file refused without `--force`, compact JSON
kept); `tools/piano_cues_check.js` — 32 checks (the pure parts, the BLOOM's 89 · 54 · 89 with their pitches and levels, the re-key
rule on a synthetic pair, the objects, the strip and the re-run, the filter, the ensemble at an instant, the next line, the turn
into a note). Verified on the page (§233).

## §231. PLAN 1j step 3 BUILT — the picker card: the vertical keyboard with the ensemble at that instant, the four voices, ppp … fff, the duration, a key click that sets and sounds, ▶ in context, ENTER / ESC

`score/public/cue_picker.js` (`CuePicker.open(wc, e)` / `close` / `apply`; `Composer.openCuePicker`): a small floating card at the
click (draggable by its header; ENTER applies and ESC closes through a capturing document listener, so the focus does not matter),
the source at the top ("line ◆ Vc G#2 · peak · 186.29 s"; "piano note …" for a made one). The keyboard: an SVG in a scrolling box,
88 keys stacked by pitch A0 … C8 (7 px a key, the drawers' geometry), a C per octave, the keys beyond the chosen voice's reach at a
quarter opacity (the harmonics only to F5: 31 keys dimmed), the chosen key ringed gold; ON IT the ensemble at that instant
(`PianoCues.ensembleAt` just after an onset, just before an end): a circle per sounding player in its colour at its pitch there — a
mid-glide one sits between the keys and shows its cents — with its short name, the line's own source ringed white, the piano's
notes already made at that moment in the piano's colour; the box scrolls to the source. The voice: four buttons normal · muted ·
harmonic · plucked (the recipe's main · muted · harmonics · plucked). The dynamic: eight buttons ppp … fff (the height, NAMING §2.9).
The duration: the presets ¼ · ½ · 1 · 2 · 4 s, *next* (to the next line or note on the piano lane, at least 50 ms away — a first
version gave 0.00 s when another player's line lay 2 ms after, fixed by the gap), and a number box (typed, or the wheel over it,
0.05 s a notch); the default 1 s. **A key click sets the pitch and sounds it** (his "a", §221) on the piano alone: the voice's port and
channel from the recipe, the dynamic through the score's held-note law (`VelocityRemap.heldNote` / `cc7ForHeight` on the piano's
remap — mf → velocity 109, p → 107; the Steinway's law, NITS §218), the note off after the duration (2.5 s at most); the voice and the
dynamic buttons sound the chosen key again. **▶ in context:** the transport from a second before the line to two after, then back to
the line. **Apply** (ENTER or the button): `Composer.cueToNote` — the same object becomes a piano note (the pitch, the technique, the
flat curve at the height, the end at the start plus the duration, the provenance kept), selected, the status line saying what was
made; undo restores the line. A click without a drag on a made note reopens the card with its values (the lit buttons).

## §232. PLAN 1j step 4 BUILT — the bar at the left end of the piano lane: the kind ticks, the player ticks (kind AND player), clear lines; the setting the browser's

`Composer.renderCueBar` (called by `renderAll` and after every change of the lines): a small strip inside the piano lane's div at its
left end, under the lane's label, shown while the lane holds a line and hidden otherwise; **lines** ● onsets · ◆ peaks · ○ ends,
a divider, then Fl · BCl · Vn1 · Vn2 · Va · Vc each with a dot in the player's colour, each tick's title its count ("peaks: 54",
"Cello: 39 lines"); **clear lines**. The rule (his example, §227): a line is shown when its kind is ticked AND its player is ticked —
`PianoCues.shown`; a hidden line is neither drawn nor given a hit target (`renderCueLine` returns before drawing; no click, no
marquee), and it still moves with the morph's shape (it is still an object). A change re-renders the lines only (`renderCueLines`),
not the score. The setting lives in `localStorage` (`cueFilter`), read at first use and kept across reloads; the file never carries
it. Clear lines removes every line on the lane still without a pitch (never a note), `pushUndoState` first, the picker closed if it
held one, the status says how many went. The bar swallows its own mouse events so the lane's scroll-drag does not start under it.

## §233. PLAN 1j step 5 — the whole of 1j walked on a copy with real events and the decoded MIDI; two defects found on the walk and fixed; the documents; committed and pushed; his test next

**The walk (`zz-ai-cues`, a copy of his test score, the Browser pane on :5301, deleted after with its working copy):** [Morph] · the
playhead at 200 s · a real click on *lines → piano* → 232 lines on the piano lane in `grp-morph-01` (89 · 54 · 89), all drawn, the 54
diamond heads, `nextId` 1534 → 1766, one undo state, the bar shown with its nine ticks and *clear lines*, the status by kind and
player · the ticks by real `change` events: onsets and ends off and every player but Fl off → 9 drawn (the flute's peaks only),
the 223 hidden with no elements, the setting saved; all back → 232 · a real click on a cello peak line (mousedown · mouseup ·
click) → the line selected and the card open: "line ◆ Vc G#2 · peak · 186.29 s", 88 keys, 7 circles (the six players and the
source's ring), the legend "Fl C#4+1 · BCl G#2 · Vn1 G3 · Vn2 C#4 · Va G3 · Vc G#2", 4 voices, 8 dynamics, 6 duration buttons and
the box · **fake outputs on the eight ports**, a real mousedown on the key G#2 → "heard G#2 · normal · mf (velocity 109)", the Piano
port channel 1: CC7 102, note-on 44 @ 109 · the *harmonic* button → channel 3, 31 keys dimmed · *p* → velocity 107; *2 s* · ENTER →
the line became a note: G#2, harmonics, the curve at 2.9 (p), 2.00 s, the group and the provenance kept, drawn as a curve, selected,
231 lines left, one undo state · a real click on the made note → the card reopened "piano note ◆ …" with harmonics · p · 2 s lit;
ESC → closed, nothing changed · *clear lines* → 0 lines, the note kept, the bar hidden; CTRL+Z → 231 back, the bar shown · the
morph's shape dragged as a real mouse sequence (2.004 s, then back): all 321 members — 231 lines, the note, the 89 morph notes —
moved by the exact dt, the lines redrawn at their new x, still on the piano lane · *next* → the duration to the next line; ▶ in
context → playing from 185.3 s, the card's close stopped it · the made note through the score's own tick (the playback driven by
hand): channel 3, 44 @ 107 · **a reload of the page** → the working copy restored the 231 lines and the note, the unticked kind
remembered (142 drawn, the box unchecked), the note drawn as a curve · the re-run → 231 fresh lines, the note kept, no line for its
moment, "replaced 231 — 1 made notes kept" · a line → key D3 → ENTER → a note; CTRL+Z → a line again, drawn as a line. No script
errors in the console. The CLI's table on the copy; its write / strip round trip covered by the checks. **Two defects found on the
walk, fixed:** the *next* preset took a line 2 ms away as "the next" (0.00 s) → a 50 ms gap and a 0.1 s floor; a re-run gave a fresh
line for a moment whose note was already made (a duplicate under the note) → the skip-made rule in `moments` (32 checks).

**The documents:** NAMING §2.13 (the line's and the made note's fields), MORPH_NOTES §1 (the bullet, with what the all-purpose tool
takes from it), PLAN 1j (built, each step), PLANNER NOW, the journal §2, the titles on the button, the bar and the card. **Committed
and pushed** — the code (steps 1–4) and the documents (step 5) as two commits.

**His test next (the plan's step 5, last to-do):** a hard reload (CTRL+SHIFT+R), his test score, [Morph], the playhead inside the
BLOOM at 183 s, *lines → piano*, the bar's ticks, a line clicked, a key (it sounds), a voice, a dynamic, a duration, ENTER, Play; his
verdicts → MORPH_NOTES §3 and NITS; the fixes he marks "fix now". Then his listening of the piano harmonics (§218), still pending.

## §234. CN-44 opened — the strikes drawer augmented: a rhythm whose onsets carry CHORDS, players per onset, the re-attack rule at 200 ms; the drawer read for what already serves; topic 1 put to him

Composer, 2026-09-08 (verbatim in CN-44): *"use the rhythms that are generated usually for one strike individual notes … but I'd like
to make those onsets carry a cord or part of a cord … assign players to that particular onset for those particular pitches … draw
from the large cord set … re-adapt the same gooey elements … the round robin or the randomize each cycle … I want four players on this
one or two players on that one … no player has another impulse. let's lower it to 200 milliseconds … let's think through the
requirements"* → the planning method, phase 1.

**The data first (one read each, nothing built):**
- **The drawer's model today** (STRIKES_TOOL L): three lists — PITCHES · ONSETS · PLAYERS — paired freely; ONE note per onset, ONE
  player per note. 46 strikes in `bank/scattered_strikes.json`, 2–35 notes each (mean 12.5), the notes recorded from his piano playing.
- **The run and its dealer** (U13, PLAN 1h item 5; §135–138): the accelerating run makes the onsets, then deals them — **round robin**
  (a lap = every player once; cycle 1 his order, later laps shuffled) or **free** (any player the rule allows, seeded random, never the
  one who just played, a lean toward the longest wait); **re-deal pitches after cycle 1** (his "randomize each cycle"); the pitch pool
  = the cards or the whole strike; every drawn pitch folded into the receiving player's measured range.
- **The 200 ms rule already exists as a box**: `re-attack ≥ ___ ms` — "no player attacks twice within this time", checked against the
  real onset times, a guarantee not a tendency; when nobody is free the run falls back to the rotation and flags it. His 200 ms is a
  number he can already type; what is new is that a chord takes SEVERAL players at one onset, so the rule now binds a group.
- **The large chord set**: `bank/harmonies.json` — blasts 45 (3–10 notes, mean 6.2) · chordShapes 54 (2–13, mean 3.8) · the strikes
  bank live from the database; 99 stored chords, already on the left of the beating drawer in three banners (CN-36).
- **The arithmetic worth naming:** seven players, a 200 ms rest each → at most 35 attacks a second for the whole ensemble; an onset of
  four players needs the next four-player onset ≥ 200 ms away unless other players are free. Chords of four at 8 onsets a second do
  not fit; the tool must say so where the run's ✗ warning says it today.

**Topic 1 put to him — what one onset carries** (three readings): (a) one chord for the whole strike, each onset a PART of it, the
parts dealt over successive onsets so the chord is covered · (b) a chord per onset, chosen from the bank each time · (c) both — a
chord for the strike as the default, any onset overridable with its own chord or typed pitches (recommended: (a) is (c) with nothing
overridden). Held aside for after: where the player count per onset is set; the dealer's rule with groups; the GUI (a mode in the
drawer, not a second drawer); insertion and the notation.

## §235. CN-44 topic 1 answered by widening it (CN-45) — menus the machine solves: a RANGE of players per onset, a MENU of chords with an order and a dwell; a third ask, inserting part of the sequence; topic 2 put to him

Composer, 2026-09-08 (verbatim in CN-45): nothing assigned by hand — *"me to put in the menu … two to four players each strike, and
then the machine can solve how many players to put on each onset and how to scramble that"*; the chords the same way — a menu of
chords, *"alternate them and randomly shuffle them"*, *"exhaust one cord then move to the next"*, *"cycle through each cord two to four
times before moving on"*; and *"the ability to insert part of the final sequence into the main score"*.

**The model as the AI reads it back:** two rule menus and a solver, in the drawer's own habit (a range, a seed, a reshuffle). (1) PLAYERS
PER ONSET: a range min–max, the machine choosing each onset's count and scrambling who plays, under the re-attack rule. (2) THE CHORDS:
a list assembled from the stored set (blasts · chord shapes · the strikes bank · typed pitches), with an ORDER (in turn · shuffled,
seeded) and a DWELL (exhaust one chord before the next · stay on each chord n times, n itself a range like two to four). (3) A PARTIAL
INSERT: a span of the finished sequence placed in the score, not the whole.

**Noticed and held for a later topic (the AI's, not his):** the two menus can contradict the 200 ms rule — a wide chord and close
onsets can leave nobody free. Three answers are possible (the machine lowers that onset's count within the range · it keeps the count
and flags the onset as the run's ✗ does · it moves the onset). To be decided when the dealer is the topic, not now.

**Topic 2 put to him — how a chord is consumed by the onsets**, since "exhaust" and the player range meet there: (a) in order — the
chord's notes dealt in their stored order, each onset taking as many as its count, the chord exhausted when the last note has
sounded, then the next chord (a 6-note chord at 2–4 players = two or three onsets) · (b) at random without replacement — each onset
draws its notes from what the chord has left, exhausted when all have sounded (the same span, a different colour each time; a seed and
a reshuffle) · (c) at random with replacement — each onset draws freely, the chord never exhausted, the dwell counted in onsets
instead. Recommended (b), with (a) available as an "in order" switch: it is the drawer's own way with pitches (shuffle to completion,
then reshuffle, seeded) and it makes "exhaust" a fact, not a tendency.

## §236. CN-44 topic 2 answered — "all three": the two axes named (the SELECTION = the voicing menu, the ADVANCE = exhaust · n times · next chord each onset), a manual onset with the collision still checked; topic 3, the dealer and the 200 ms rule, put to him

Composer, 2026-09-08 (verbatim in CN-46): all three consumption modes; the selection *"not too different than we have for the single
cord shuffle … as played and then a shuffle and then those other options like high cluster low cluster"*; and *"your third option
which is for each onset. it chooses a random selection of that cord and then moves on to the next cord for the next onset"*; plus
*"a manual option so I can assign the number of players and the cord or cord parts to any one onset. and then have the collision
checked"*.

**Settled, and the vocabulary with it — two axes, two menus (the AI's reading, put back to him):**
- **The SELECTION** — which notes of the chord an onset takes: the drawer's existing voicing menu, borrowed whole (as played · shuffle
  · high cluster · low cluster · spread …), the count being the onset's player count; nothing new invented (HOW_WE_WORK's rule B).
- **The ADVANCE** — when the tool moves to the next chord: exhaust it (every note sounded once, §235's (b)) · stay on it n times, n a
  range like two to four · a fresh chord every onset (his last sentence, a dwell of one).
- **MANUAL** — any single onset given its player count and its chord or its exact notes by hand; the machine solves the rest around it
  and the collision check still runs over it, flagged, never silently changed (the drawer's rule for hand choices, STRIKES_TOOL F).

**Topic 3 put to him — the dealer, and what the 200 ms rule does when it cannot be met.** The default the AI proposes for the mapping
(no question, the drawer's own habit): the onset's chosen notes go to the free players BY REGISTER — the lowest note to the lowest
free player and up — each folded by octave into that player's measured range as `realize()` does today, the folds counted; who is
free comes from the re-attack rule; the drawer's two dealers stay as the tie-breakers (round robin: a lap over the players before
anyone repeats · free: the longest-waiting first, seeded). **The one question, only his:** when an onset's wanted count cannot be met
because too few players are free — (a) the machine lowers that onset's count within his range and only flags when even the minimum
cannot be met (recommended: his range is a permission, the rule a guarantee) · (b) it keeps the count and flags the onset as the run's
✗ does, leaving him to widen the gap · (c) it moves the onset later until enough players are free (the rhythm changes — against the
drawer's habit that the rhythm is his). A manual onset is never lowered: it is flagged.

## §237. CN-44 topic 3 decided — "a": too few players free → the machine lowers that onset's count inside his range, flagging only when the minimum cannot be met; topic 4, the look inside the drawer, put to him

Composer, 2026-09-08: *"a"* — his range is a permission, the 200 ms rule a guarantee; the machine lowers an onset's count within
min–max when too few players are free and flags only when even the minimum cannot be met; a manual onset is never lowered, only
flagged. With it the dealer's default stands as put (§236): the onset's chosen notes to the free players BY REGISTER, each folded by
octave into that player's measured range, the folds counted; the drawer's round robin / free as the tie-breakers; the seed his.

**Topic 4 put to him — the look, inside the strikes drawer (his "a mirror of how it already is … re-adapt the same gooey elements"):**
a MODE switch at the top — *notes* (the drawer as it is, untouched) · *chords* (the new). In chords mode the columns keep their
places and change their contents: the KEYBOARD shows the chord in play, its notes lit, the current onset's part ringed, the players'
ranges as columns (the beating drawer's); the ORCHESTRATION column becomes THE PLAYERS — a tick per player, the count range (2–4),
the re-attack box (200 ms), the dealer, the seed; a new block THE CHORDS — the list he assembles (from the harmony banners and by
typing), the ORDER (in turn · shuffled, seeded), the ADVANCE (exhaust · n times, a range · a fresh chord every onset) and the
SELECTION (the voicing menu: as played · shuffle · high cluster · low cluster · spread); the RHYTHM strip keeps its dials, its shapes,
its jitter and the run, and now draws several dots per onset, one per player in the player's colour, a lowered onset marked, a
flagged one ✗; the bottom keeps hear · takes · insert. **The one question, only his — the manual onset:** (a) a click on the onset in
the rhythm strip opens a small card there (the count, the chord or the typed notes, a ✕ back to automatic), the way the cue picker
opens on a line (recommended: the score's idiom, and the onset is where he is looking) · (b) a table under the strip, a row per
onset, edited in place · (c) both.

## §238. CN-44 topic 4 decided — "a": a manual onset is a card at the onset in the rhythm strip; topic 5, the partial insert, put to him

Composer, 2026-09-08: *"a"* — a click on an onset in the rhythm strip opens a small card there (its count, its chord or its typed
notes, a way back to automatic), the cue picker's idiom; the rest of §237's picture unchanged (the mode switch *notes* / *chords*, the
keyboard showing the chord in play, the orchestration column become the players with the count range and the re-attack box, the new
CHORDS block with the order · the advance · the selection, the rhythm strip drawing a dot per player and marking a lowered or flagged
onset).

**Topic 5 put to him — inserting PART of the finished sequence (his third ask, CN-45).** What the drawer has today (STRIKES_TOOL Q):
*Insert @ playhead* · *Insert @ original time* · *Replace in place*, each taking the WHOLE strike. The picture: a span chosen on the
rhythm strip marks the onsets inside it (the strip already shows every onset; the score has its own span-selection idiom); the two
insert buttons then act on the marked span only — at the playhead (the first marked onset landing there, the rest keeping their
distances) or at the original time; what goes in is one group with its marker and META shape, as every gesture; the rest of the
sequence stays in the drawer for another insert later, and the takes keep the whole; unmarked onsets are never written; nothing marked
= the whole sequence, so the buttons read as they do today. **It serves the drawer's existing notes mode too** — the same span, the same
buttons — which the AI proposes rather than restricting it to chords. **The one question, only his — how the part is marked:** (a) a
drag across the rhythm strip (the score's span idiom, one gesture) · (b) a click on the first onset and a shift-click on the last ·
(c) both. Recommended (a), with (c) cheap if he wants it.

## §239. CN-44 topic 5 decided — "c" (a span marked by a drag AND by click / shift-click); topic 6 opened by him: SAVING — the whole as a unit, a part on its own, each carrying every choice that made it; the model put to him

Composer, 2026-09-08 (verbatim in CN-47): *"c"* for the marking, then *"let's talk about how things are saved … save the overall
shuffle and rhythm as a unit. but also if I select parts of it I can save those and the save would include my choices such as which
cords and if I chose random shuffle etc. all the data that was used to create that sequence"*.

**The data first:** the drawer's takes today (STRIKES_TOOL O) are the SETTINGS alone — `bank/panel_snapshots.json`, bucket `strikes`,
153 named takes of `{ saved, comment, state: { strikeId, cfg, voices } }`, re-derived on load; nothing of the result is stored. The
morph panel already has the other half: an ACTUAL is a frozen render with its provenance, and `recall → MODELS` puts its settings back
on the dials (§213) — the pattern to bring here.

**The model put to him:** a save carries BOTH halves — the RESULT (every onset with its time, its players, its pitches, the count
lowered or flagged, what was heard) and the RECIPE (the chord list, the order, the advance, the selection, the player range, the
dealer, the seed, the rhythm dials and every manual onset). Two grains: the WHOLE (the shuffle and the rhythm as one unit) and a PART
(the marked span saved on its own, the same recipe, plus the whole it came from and which span). They live in the drawer's existing
takes bucket, named by his rule, committed at every wrap with the takes and the actuals (HOW_WE_WORK); today's 153 takes still load —
the new save is a superset. **The one question, only his — what LOADING a save does:** (a) both offered, as the morph panel does — *as
it was* (the exact sequence back, nothing re-dealt) or *the settings* (the dials filled, re-generated) — recommended · (b) exactly as
it was, only · (c) the settings only, as the drawer does today. After it: PHASE 2, the top line.

## §240. CN-44 topic 6 decided ("a": a load offers *as it was* or *the settings*) — PHASE 1 COMPLETE, the top line confirmed ("good"), PLAN 1k opened with it; phase 3 begins

Composer, 2026-09-08: *"a"* — a save loads either way, the morph panel's manner. **Phase 1 complete** — six topics decided (§234–239):
the menus the machine solves; the two axes and the manual onset; the dealer and the lowering rule; the mode inside the drawer and the
card at the onset; the span and the partial insert; the save carrying the result and the recipe. **Phase 2 confirmed:** *"good"* to the
six lines — 1 the chord engine · 2 chords mode in the drawer · 3 the manual onset · 4 the span and the partial insert · 5 saving ·
6 verify and document. **PLAN 1k opened** with the why, his words, the decisions and the six steps, committed — a cleared chat loses
nothing. **Phase 3 begins**, his format of §224: each step's goal and sub-steps in one turn.

## §241. PLAN 1k phase 3 — step 1 (the chord engine) agreed and written with its sub-steps; step 2, chords mode in the drawer, put to him

Composer, 2026-09-08: *"good"* to step 1 as put — the pure module from the settings to a dealt sequence (the chord list resolved from
the banks or typed; the order in turn or shuffled to completion, seeded; the advance exhaust · n times · a fresh chord every onset;
the selection the drawer's voicing vocabulary over what the chord has left; the count drawn from the range, lowered when too few are
free, flagged at the minimum; the dealer by register under the re-attack rule with the octave folds counted; the result per onset with
its flags and the settings echoed for the save; node checks including a run too fast to satisfy). Written into PLAN 1k, committed.

**Step 2 put to him, goal and sub-steps together:** the mode switch *notes* / *chords* at the top of the drawer (notes untouched); the
orchestration column become THE PLAYERS (a tick each, the count range, the re-attack box at 200, the dealer menu, the seed with the
drawer's chips); the CHORDS block (the list built from the harmony banners or typed, each row named with its notes, removable and
reorderable; the order, the advance with its range, the selection); the keyboard showing the chord in play with the current onset's
part ringed and the players' ranges as columns; the rhythm strip keeping every dial, shape, jitter and the run, now drawing a dot per
player at each onset in the player's colour, a lowered onset marked and a flagged one ✗, the hover naming the chord and the players;
Generate and Hear through the drawer's own audition path (MorphEmit's routing, 1g's remap, panic the one stop); the readout in the
drawer's line (the counts, the flags, the folds).

## §242. PLAN 1k step 2 — his question: "what does this new sequence or chord per onset look like?" — answered: the same screen, one onset at a time, the rhythm strip the selector

Composer, 2026-09-08, describing what he has today: *"I have the core drawer. I select it. It comes up on the keyboard, and then dotted
lines point to the players. And I can do things like double click the keyboard key and move that key to a different player, etcetera.
And then each player has a pull down for the articulation. what does this new sequence or chord per onset look like?"*

**Answered (with a sketch of the two drawers side by side):** the difficulty named first — one screen cannot show a whole sequence the
way today's screen shows one chord, because a chords-mode strike is many onsets, each with its own chord and its own players. So the
picture keeps his layout and adds a CURSOR:
- **The keyboard with its dotted lines is unchanged in kind, but it shows ONE ONSET** — the selected one: the chord in play lit, the
  notes this onset takes ringed, a dotted line from each to the player that takes it. Click another onset in the rhythm strip and the
  same picture repaints for it. Today's screen = this screen with a sequence of one.
- **The rhythm strip becomes the selector** (as the strikes list on the left selects a strike today): a COLUMN of dots per onset, one
  dot per player in the player's colour, so the whole sequence is read at a glance — where it is thick, where it is thin, where a count
  was lowered or flagged; the selected column is lit and is what the keyboard shows.
- **The player rows keep their articulation pull-downs**, unchanged: a player's voice for the whole sequence, not per onset.
- **His double-click gesture keeps its meaning and becomes the manual onset of step 3:** moving a key to another player, or changing
  how many players this onset has, marks THAT onset by hand; the machine solves the rest around it, the collision check still runs and
  flags it, and a ✕ hands it back to the machine.
- **What is genuinely new on the screen:** the chords list with its order, advance and selection where the strikes list sits; the
  count range and the 200 ms rest under the players; the stacked dots in the strip.

## §243. PLAN 1k — step 2 (chords mode in the drawer) agreed and written with its sub-steps and the screen of §242; step 3, the manual onset, put to him

Composer, 2026-09-08: *"good"* to step 2 as put and to the screen described in §242 (the keyboard showing one onset, the rhythm strip
the selector, the articulation pull-downs unchanged, his double-click becoming the manual onset). Written into PLAN 1k with the
screen paragraph, committed.

**Step 3 put to him, goal and sub-steps together:** the card at the onset (a click on the onset's column in the strip opens it, the
cue picker's idiom — draggable, ENTER applies, ESC closes, the onset named by its time and its chord); what it holds — the count, the
chord (from the list or typed pitches), the notes taken (chosen, or left to the machine within that chord), and the player per note;
his double-click on a keyboard key moving a note to another player marks THAT onset by hand, the gesture keeping its meaning; a hand
onset is PINNED — a re-generate and a new seed keep it, the machine deals the rest around it and its players are unavailable to the
neighbours within 200 ms; the collision check still runs over it and FLAGS it (✗ in the strip, named in the readout), never lowering or
moving it (§237); a ✕ hands the onset back to the machine and it is re-dealt with the rest; the hand onsets travel in the recipe (the
save of step 5); checks — a hand onset survives a re-generate and a re-seed, its neighbours respect its players, a colliding one is
flagged and unchanged, the ✕ restores.

## §244. PLAN 1k — step 3 (the manual onset) agreed and written; step 4, the span and the partial insert, put to him

Composer, 2026-09-08: *"good"* to step 3 as put — the card at the onset (the cue picker's idiom), its count and chord and notes and
players, his double-click keeping its meaning, the hand onset pinned through a re-generate and a re-seed with the machine dealing
around it, the collision flagged and never lowered, the ✕ back to automatic, the hand onsets travelling in the recipe, the checks.
Written into PLAN 1k, committed.

**Step 4 put to him, goal and sub-steps together:** marking a span in the rhythm strip by a drag AND by a click on the first onset with
a shift-click on the last (§239, his "c"), the marked columns lit with a count in the readout ("6 of 23 onsets · 2.4 s"), a click on
empty space clearing it; the drawer's existing insert buttons then writing only the marked onsets — *Insert @ playhead* (the first
marked onset landing there, the rest keeping their distances) and *Insert @ original time*, each as one group with its marker and META
shape, the notes on the players' lanes with their techniques and their loudness through 1g's remap; nothing marked = the whole
sequence, so the buttons read exactly as today; the same in NOTES mode (the drawer's single-note strikes gain the partial insert too);
the rest of the sequence staying in the drawer for another insert, the marked span remembered until changed; checks on a copy with real
events — both ways of marking, only the marked onsets written, the group's shape carrying them, the whole-sequence case unchanged,
notes mode too.

## §245. PLAN 1k — step 4 (the span and the partial insert) agreed and written; step 5, saving, put to him

Composer, 2026-09-08: *"good"* to step 4 as put — the span marked by a drag or by click / shift-click, the readout's count, the two
insert buttons acting on the marked onsets only, one group with its marker and shape, nothing marked = the whole, the same in notes
mode, the rest kept for another insert, the checks. Written into PLAN 1k, committed.

**Step 5 put to him, goal and sub-steps together:** a save carrying the RESULT (per onset its time, its chord, its notes, its players,
whether it was lowered or flagged) and the RECIPE (the chord list, the order, the advance, the selection, the player ticks, the count
range, the re-attack, the dealer, the seed, the rhythm dials, the manual onsets, the mode); the WHOLE saved as a unit and, with a span
marked, the PART saved on its own with the same recipe plus the whole it came from and which span; loading offering *as it was* (the
stored sequence back on the strip, nothing re-dealt) or *the settings* (the dials filled, Generate run) — the morph panel's manner
(§213); all of it in the drawer's existing takes list through the snapshots API (`bank/panel_snapshots.json`, bucket `strikes`, 153
takes today), no server change, the name rule and the × and ENTER-to-save unchanged, the old takes still loading because the new save
is a superset; the takes committed at every wrap (HOW_WE_WORK); checks — a save and a load *as it was* round-tripping exactly, a
part-save loading as its own short sequence, an old take still loading, the manual onsets travelling with the save.

## §246. PLAN 1k — step 5 (saving) agreed and written; step 6, verify and document, put to him — the last

Composer, 2026-09-08: *"good"* to step 5 as put — the save carrying the result and the recipe, the part save, the two ways of loading,
the drawer's own takes list and its rules, the old takes still loading, the commit at every wrap, the checks. Written into PLAN 1k,
committed.

**Step 6 put to him, goal and sub-steps together (the last):** the whole of 1k walked end to end on a `zz-ai-` copy with real mouse and
key events and the decoded MIDI — a chord list built, generate, the onsets clicked through, Hear, a manual onset, a span marked both
ways, both inserts, a save and both loads, the drawer's notes mode unchanged beside it; one node script for the pure parts (the engine's
determinism, the rule, the advance modes, the lowering, the folds); the documents — STRIKES_TOOL a new section for chords mode (the
tool's own document), NAMING for what a chord-mode strike looks like in the score, PLAN 1k's statuses, PLANNER NOW, the journal §2, the
titles on every new control, the lab journal as the work happens; then HIS FIRST CHORD STRIKE in the piece (a hard reload, the drawer,
chords mode, a chord list from the banners, the dials, generate, hear, a span, insert) and his verdicts to STRIKES_TOOL and NITS, the
fixes he marks "fix now" built at once; the notation of a chord strike left to 2a.

## §247. PLAN 1k planned whole — step 6 agreed and written; the item shown to him once ("is that it?")

Composer, 2026-09-08: *"good"* to step 6 as put (the walk on a copy with real events and the decoded MIDI, the one node check script,
the documents — STRIKES_TOOL's own section, NAMING, the plan, the planner, the journal, the titles — his first chord strike and his
verdicts, the notation left to 2a). **PLAN 1k is planned whole** — six steps in the fixed formats, each agreed in one turn (his format
of §224: the goal and the sub-steps together) and written at once; the status `PLANNED`, the build at his word, step 1 first. Shown to
him once as the method asks, with what sits outside the plan: the build's go (each step a chunk — proposal → go → build on a copy →
verify → docs → commit → push), his test of PLAN 1j (the lines, the bar, the picker; §233) and his listening of 1i's piano harmonics
(§218), both still pending, and the two NITS of §218. Fourteen turns from CN-44 to the plan.

## §248. PLAN 1k — the build begins at his word: "good to go for the build get through as much as you can check in when done or you need me"

Composer, 2026-09-08. The AI builds steps 1–6 in order alone, each on a `zz-ai-` copy, verified with real events and the decoded MIDI,
documented and committed at its wrap; his test after the build (the way of PLAN 1f §167 and 1j §229). The piece file is never written.
Entries §249 on record each step.

## §249. PLAN 1k step 1 BUILT — the chord engine (`score/public/strike_chords.js`, pure) and its 35 checks; the chord's TAIL named on the way

2026-09-08. `deal(onsets, chords, players, opts, realize, manual)` → an event per onset: the chord in play, the notes taken, the players
who take them (each folded into its range by the caller's `realize`), and the flags. Inside it: `chordSource` (the list in turn or
shuffled to completion, seeded; the advance — exhaust the chord · stay n times, n drawn from his range · a fresh chord every onset);
`select` (the drawer's voicing vocabulary over what the chord has left — played · shuffle · high · low · spread); the count drawn from
his range per onset, LOWERED when too few players are free and FLAGGED only when even the minimum cannot be met (his (a), §237);
`pickPlayers` (the free players by the re-attack rule; the dealer decides which when more are free than needed — robin = the longest
idle, free = a seeded draw weighted by the wait, as the run's dealer of §138); `assign` (the notes to the chosen players BY REGISTER,
lowest to lowest); `tightest` (the smallest gap between two attacks of one player — the rule as a fact); `describe`. The seed is the
drawer's own `mulberry32`, so a seed means the same thing in both. A manual onset is pinned: its chord, its count and its players kept,
the rule checked over it and FLAGGED, never lowered, and a re-seed leaves it alone.

**Found and named on the way (not a defect — the faithful reading of his rule):** with *exhaust*, the LAST onset of each chord takes
whatever is left, which is usually fewer notes than the count drawn. It is not a failure of the range; it is the chord's TAIL. The
engine marks it `short`, the readout says "n short (the chord ran out)", and the range is honoured everywhere else. The alternative —
topping the onset up from the next chord — was rejected: it would blur the chord boundary he asked to hear ("exhaust one cord then
move to the next cord", CN-45). Small chords make many tails: the 54 chord shapes average 3.8 notes, so a 2–4 range on them is mostly
tails; the 45 blasts (3–10 notes, mean 6.2) fill the range properly. Worth his ear at step 6.

**35 checks** (`node tools/strike_chords_check.js`): the selection modes; the seeded shuffle identical to the drawer's; determinism from
the seed and a different seed differing; every onset dealt; **the 200 ms rule never broken** (the tightest gap measured, 320 ms on the
even run); the counts inside the range but for the tails; no player twice in one onset; the notes and the players rising together (by
register); every note inside its player's range, folded by whole octaves, the folds counted; the three advance modes (exhaust covering
every note once, a fresh chord each onset, exactly three onsets per chord at n = 3); both orders (in turn wrapping; shuffled to
completion); a fast run lowering counts while the rest holds; a run too fast for the minimum flagging with the warning naming the cure;
the manual onset kept through a re-seed, flagged when it breaks the rest, and gone when the hand setting is removed; empty inputs
answered, not thrown.

## §250. PLAN 1k steps 2–5 BUILT — chords mode in the drawer, the card at the onset, the span and the partial insert, the take that carries the result and the recipe

2026-09-08, the AI alone at his word (§248). **`score/public/strike_chords_ui.js` — a MIXIN on the drawer, not a second drawer**
(`Object.assign(StrikeDrawer, …)`), so notes mode is the code it always was; five dispatch lines in `strike_drawer.js` reach it
(`render` → `renderChords`, `notesFor` → `chordNotes`, the build hook, an `isChords()` stub for when the mixin is absent, and the
insert's status line), and `composer.html` loads `strike_chords.js` + `strike_chords_ui.js`.

**Step 2 — chords mode.** A `mode` switch in the drawer's header (*notes* / *chords*, remembered in `cfg`); the state lives in `cfg.ch`
so the drawer's own `save()`, `state()` and takes carry it. **The screen is his own screen with a cursor (§242):** the CHORDS list where
the strikes list sits (the list built from the harmony banks — blasts · shapes · the strikes db — or typed as MIDI numbers, each row
removable and movable; then the order, the advance with its range, the selection); the PLAYERS where the orchestration rows are (a tick
and an articulation pull-down per player, the count range, the rest in ms, the dealer, the seed, and the readout); the KEYBOARD showing
the chord in play lit, the selected onset's notes ringed and its sounding notes as dots in the players' colours; the RHYTHM STRIP
keeping every dial, shape, jitter and the run, drawing a COLUMN of dots per onset (one per player, at its sounding pitch), the selected
column lit, a lowered onset marked ↓, a short one ·, a flagged one ✗, the hover naming the chord and the players; the dotted lines from
key to player row for the selected onset; **Generate** (a new seed) and the drawer's own Hear / insert / takes underneath. The onsets
are the drawer's own rhythm (`pattern()`, or the run's onsets from the calculator).

**Step 3 — the manual onset.** A click on an onset opens a card at it (the cue picker's idiom of PLAN 1j): its player count, its chord
(the machine's, or one from the list), its notes (typed, or left to the machine), a tick per player, ♪ to hear it, *set by hand*,
*✕ automatic*, ENTER / ESC. A hand onset is pinned in `cfg.ch.manual` — kept through a re-generate and a new seed, the rest dealt around
it, flagged when it breaks the rest and never lowered.

**Step 4 — the span and the partial insert.** A drag across the strip marks a span (the onset nearest the pointer's x, so a gap between
the hit rects cannot stop the drag), and a click plus SHIFT-click marks one too (his "c"); the marked columns are washed and the foot
says "8 of 26 onsets marked"; *whole* clears it. `notesFor` returns the marked onsets only, so **Hear and both insert buttons act on the
part** with no change to their own code; nothing marked = the whole sequence.

**Step 5 — saving.** `state()` and `applyState()` are wrapped: a chords take carries `chResult` (the dealt events, the summary, and for
a part which span of which whole) beside the recipe in `cfg.ch`. The **as it was** tick in the foot decides the load: ticked, the stored
sequence becomes the drawer's (`cfg.ch.frozen`) and nothing is re-dealt; unticked, the dials are filled and the deal is fresh. Any dial
touched lets a frozen take go (`chordDirty`). His 153 takes still load — the new save is a superset.

## §251. PLAN 1k step 6 — the walk on a copy with real events and the decoded MIDI; three defects found on the walk and fixed; his first chord strike next

**The walk (`zz-ai-chords`, a copy of his test score, the Browser pane on :5301, deleted after; the strike #34 of his database, its
rhythm stretched with the drawer's own span × 6):** the mode switch both ways — **notes mode unchanged** beside it (3 sequence rows, 88
keys, the orchestration selects, 26 dots, 26 notes from `notesFor`), chords mode alive (the CHORDS list, 7 player ticks, 88 keys, 26
hit columns, 50 notes); two chords added from the blasts bank by real clicks (9 and 6 notes); the deal — 26 onsets · 50 notes · 2 chords
· 2–4 players · rest 200 ms · 4 lowered · 2 short · ✗ 7 · 15 folded, **the tightest gap 204 ms** (the rule holds; the flags are the tight
head of his rhythm, where even two players cannot be free — the warning names the cure); the keyboard repainting per onset (4 dots, 4
dotted lines); a real click on onset 9 opening the card, four players ticked and a chord chosen → **BCl F2 · Vn1 C4 · Vn2 C#4 · Fl D4,
by register, flagged and kept as set**, and a re-seed leaving it untouched; a real drag from onset 5 to 12 marking 8 of 26, and
SHIFT-click marking 17–21; **the decoded MIDI** through the drawer's own Hear (fake outputs on `MorphEmit.routeFor`): the 5 notes of the
marked span, on the players' own channels with the strike techniques (the flute's tongue ram on channel 13), the velocities through 1g's
remap, 5 note-offs; **the insert** of the marked span at the playhead → 14 notes on the six lanes in one group with its META shape at
320 s, one undo state, the drawer's own "1 earlier copy kept elsewhere" rule intact; **the takes** — a whole take (26 events) and a part
take (8 events, "the part 5–12 of 26"), the settings wrecked, then *as it was* restoring the stored sequence exactly (frozen, nothing
re-dealt) and *the settings* filling the dials for a fresh deal; the test takes removed from his file afterwards (his 153 stand).

**Three defects found on the walk, fixed:**
1. **The mixin loaded after the drawer built itself**, so the mode switch was never injected — the drawer's `build()` runs at parse
   time, before a deferred mixin. Fixed both ways: a hook in `build()` for when the mixin is first, and a self-injection at the end of
   the mixin for when the drawer is.
2. **An empty "notes" box parsed as pitch 0** (`''.split(…)` → `['']` → `[0]`), so a hand onset asking for four players got one note
   at C-1. Fixed in the card and in the typed-chord box (`.filter(x => x !== '')`).
3. **The span drag never marked anything** — it read the onset under the pointer with `document.elementFromPoint`, which the hidden
   pane defeats and which a gap between the hit rects defeats anyway. Rewritten to take the onset NEAREST the pointer's x from the
   strip's own geometry, so the drag is continuous.
   *(Also on the way: a patch had split a comment in `strike_drawer.js` and broken its parse — caught by `node --check`, repaired; and
   a stray NUL byte from an earlier write made the mixin unreadable as text — found by `file`, stripped.)*

**The documents:** `docs/STRIKES_TOOL.md` section X (chords mode, the tool's own document), PLAN 1k's statuses, PLANNER NOW, the journal
§2, a title on every new control. **Nothing new in the score's file format:** a chord-mode insert writes ordinary strike notes in an
ordinary `grp-strike-…` group with its META shape, so NAMING is unchanged and the extractor and the notation see what they always saw.

**His first chord strike next (the plan's step 6, last to-do):** a hard reload (CTRL+SHIFT+R), the drawer, the mode switch to *chords*,
a chord list from the banks, the count range and the rest, Generate, Hear, a span, insert; his verdicts → STRIKES_TOOL and NITS, the
fixes he marks "fix now" built at once.

## §252. CN-48 opened — the crescendos in three places; his question first: how to organize the planning. Four items proposed, a shared foundation and three builds

Composer, 2026-09-08 (verbatim in CN-48), asking before anything else: *"help me organize the planning, 3 separate plans if necessary,
any overlaps bundled into a combined plan pass, then whatever unique pick ups for each individual plan or another process?"*

**The data first (one read each):**
- **The trill's chassis is the model for build 1 and it already exists:** T on a selected note makes a trill zone on one of three curves,
  running to **0.17 s** (not 0.15 — `composer.html` `LEAD = 0.17`, §139) before that player's next strike note, or 2 s when there is no
  later note. 69 zones in the piece, every one a trill. His C key is that chassis with a crescendo in it.
- **The survey he asks for is a READ, not new research:** the tuba piece already carries `docs/CRESCENDO_TAXONOMY.md`,
  `docs/CRESCENDO_EXPERIMENTS.md`, `docs/CURVE_DATABASE.md` and `docs/DYNAMICS_FRAMEWORK.md`; the septet has 1g's measured loudness law
  (`bank/velocity_remap.json`) so a curve height already means the same loudness on every instrument, and the beating drawer's
  crescendo lane already draws ppp … fff over the whole measured scale.
- **The pitch menus of build 1.5 exist twice over:** the morph panel's pitch source (the sonority pull-down in eight groups with the
  take rules — by register · lowest · highest · spread · from k · every other · random, seeded) and the strikes drawer's own reshuffle
  and order options; PLAN 1k added the chord list with its order and advance. Nothing there needs inventing, only fitting.
- **The spacing rule differs from 1k's:** there the rest is measured from ATTACK to attack (200 ms); a crescendo occupies time, so his
  new rule is 150 ms after its END. That is one line in the engine and a real change to what "free" means.

**Proposed — four items, one shared foundation and three builds (the AI's recommendation, put to him):**
1. **1l · The crescendo itself** (shared): the survey of his crescendo curves across the pieces read into one page, a listening test at
   several durations, one or two standards named; what a crescendo IS in the score (its object, its dynamic range ppp … fff, its end
   rule, a manual duration); the spacing rule (150 ms after the end). It ends in his ear, so his ear comes first (HOW_WE_WORK).
2. **1m · The C key** (his build 1): select a note, press C, a mini panel (range · duration · articulation), insert — the trill's chassis.
3. **1n · The sequence filler** (his build 1.5): the gaps of a strike sequence filled with crescendos AND trills, two modes, the free
   instrument chosen by a refined rule, the pitches by menu or a harmony distributed with the strikes' options.
4. **1o · Crescendo strikes** (his build 2): 1k's chords and strikes sounding as crescendos — the articulation, the ordinary voice, the
   velocity law, the spacing from the end.
**The order of the planning:** 1l planned and built first (it is small and it settles the curve every other item uses), then 1m, 1n, 1o
each planned when its turn comes, so what the first build teaches shapes the next. The alternative — all four planned now, then built —
was set beside it for him.

## §253. CN-48, the organizing decided ("a") and the crescendo SURVEY done from his own pieces; the listening test's width decided ("a"); topic 2, what a crescendo IS in the score, put to him

Composer, 2026-09-08: **"a"** twice — (1) the planning organized as four items, a shared foundation (1l · the crescendo itself) planned
and built FIRST, then 1m (the C key), 1n (the sequence filler), 1o (crescendo strikes), each planned when its turn comes; (2) the
listening test the grid of nine — three shapes (surge 5× · linear · bloom 5×) at three durations (1.5 s gesture · 5 s breath · 12 s
long) on one instrument, then the winner repeated on two more.

**THE SURVEY (a read of his own docs, no new research):**
- **The vocabulary is his and it is fixed** (`for_seven_tubas/docs/CRESCENDO_TAXONOMY.md`, 2026-08-10): **BLOOM** front-loaded ·
  **SURGE** back-loaded · linear between; a full spec reads *"8 seconds, surge 5×"*; the **THRESHOLD** is the half-loudness moment
  ("surge 5×, threshold at two-thirds"). The families' boundary is about 10:1.
- **The standard he used there:** SURGE **5×** — `CURVE_DATABASE.md`'s ladder gives slope **0.40**, threshold 0.68; BLOOM 5× is slope
  **−0.29**, threshold 0.33; linear is slope 0. His standing mix in the tuba piece was *surge .7 / sine .3*, "longs always surge"
  (COMPOSER_LOG 2026-08-12).
- **The time scales:** gesture < 2 s · breath 2–12 s · phrase 12–60 s · formal > 1 min. **The peak behaviours:** cliff · tail · hold ·
  handoff · overshoot.
- **Two findings that make 1l cheap.** (i) The ratio ↔ slope table maps STRAIGHT onto this score's own curve segments (`segments[].slope`
  on a `waveCurve`), so a standard crescendo is a two-node curve with a slope — no new machinery, and the score's slope diamonds edit
  it. (ii) The SOUND is already right: 1g item 5 (§120) gives a held note its velocity from the curve's top and streams CC7 from its
  height through the measured per-instrument law, so a curve's height already means the same loudness on every instrument. Only the
  SHAPE was open, and the test settles it.

**Topic 2 put to him — what a crescendo IS in the score:** (a) an ordinary held note whose curve rises, plus a `cresc` provenance in its
properties (the family, the ratio, the dynamic range, how its end was set) so the tools and the notation can find it — no new object
type, and the score's drag, stretch, delete, undo and save all work on it already (recommended: a crescendo is ONE note with a shape,
where a trill is a zone because it GENERATES many notes) · (b) its own zone with a `midiModel: 'cresc'`, generated at play time like a
trill. After it: the end rule (his 0.15 against the trill's measured 0.17) and the manual duration; then the spacing rule (150 ms after
the END).

## §254. CN-48, topic 2 decided ("a") with his correction: the newest curve mechanism is the three curve-lane overlays — no slope diamond, the LINE is dragged; and a crescendo in the main score is drawn filled and transparent in the morph orange

Composer, 2026-09-08: *"a good, but just to note the curve drawing/display/editing mechanism, the most updated one, lives in the 3
dedicated curve lane overlays (same type as the meta) and there is no slope diamond, just drag on the curve line for slope, the only
difference for the main score, is the shape will be filled transpaency and color from tuba morph section, I believe orange."*

**Checked, and he is right** (the AI had named the older mechanism): a curve on a PART lane carries bezier control **diamonds**
(`composer.html` ~4830) and takes a node on a double-click; a curve in one of the three CURVE WINDOWS (layers 8 · 9 · 10, the same kind
of floating overlay as META, over Violin 2 · Viola · Cello) has **no diamonds** — its dots are drawn always and the LINE ITSELF is held
and dragged to bend the segment (`startBendDrag`, cursor `ns-resize`), which is the newest editing mechanism (TRILLS_TOOL §3b, CN-24).
**The colour he means is already in the app:** curve window A is `#C2410C`, the orange the tuba piece's morph section is drawn in
(`MORPH_NOTATION.md`: "the orange curve"); in the main score a crescendo is to be **filled, transparent, in that orange** — the curve
windows draw lines only, the score's crescendo draws as a filled shape.

**So topic 2 is decided as (a) with his rider:** a crescendo is an ordinary held note whose curve rises, carrying a `cresc` provenance
(the family, the ratio, the dynamic range, how its end was set); no new object type; it is EDITED the curve-window way — the line
dragged to bend, the dots always drawn — and DRAWN in the score filled and transparent in the morph orange.

## §255. CN-48 topic 3 decided — the peak is a CLIFF; 0.17 s before the next note for both the trill and the crescendo; no next note = 3 s for a trill (was 2), 5 s for a crescendo; topic 4, the spacing rule, put to him

Composer, 2026-09-08: *"a, and 0.17 for both, no next note recommend good 3 for trill 5 for cres"*.
- **The peak: (a) CLIFF** — the crescendo runs to its top and stops. (His own taxonomy's D3 calls the peak what the listener remembers;
  the tail and the hold were the alternatives and are still one edit away by hand on any single crescendo.)
- **The gap: 0.17 s for both.** The measured trill number (§139) stands and the crescendo adopts it; nothing of his existing trills
  moves. The AI had proposed 0.15 to match his first message; he chose the number already in the app.
- **No next note on that player:** the fallback becomes **3 s for a trill** (it was 2 s) and **5 s for a crescendo** (his breath scale,
  CRESCENDO_TAXONOMY D2). The trill's change applies to new trills; the ones in the piece keep the ends they were given.

**Topic 4 put to him — the spacing rule.** What exists: PLAN 1k measures its rest **attack to attack** (his 200 ms there, a guarantee
checked against the real onsets); the trill eats a note that starts within 60 ms before it; nothing else in the app measures from an
END. His new rule is *"next articulation for any one instrument will be 150ms after end of crescendo"* — measured from the END, which is
the honest rule once an event OCCUPIES time. **Put to him:** (a) ONE rule everywhere — a player is free **150 ms after its previous
event ENDS** (for a strike, whose sound is short, that is about 200 ms after its attack, so 1k's behaviour barely moves; for a
crescendo, a trill or a beating it is the only rule that makes sense), the box in the chords drawer becoming "rest ≥ 150 ms after the
end" with the number still his to type — recommended · (b) two rules kept apart — 200 ms attack-to-attack for point attacks, 150 ms
after the end for anything that occupies time · (c) the end rule for crescendos only, everything else untouched. Named for him: 1k's
box is the only place the change is visible, and he has not tested 1k yet.

## §256. CN-48 topic 4 decided ("a good") — one spacing rule everywhere: a player is free 150 ms after its last sound ENDS; and his change to step 1: the listening test is a SCORE FILE, not a rack probe

Composer, 2026-09-08: *"a good"* to the single rule — **a player is free 150 ms after its last sound ends**, everywhere in the app (the
chords drawer's box re-read as "rest ≥ 150 ms after the end", the number still his; a strike's short sound makes that about 200 ms
after its attack, so 1k barely moves; a crescendo, a trill or a beating stops looking free just because it started a while ago).

Then, on the top line's step 1: *"can you put the probe in the main score as and experimental save file? this way you can add all the
tests for all the players and I can solo"*.

**Taken, and it is better than the rack probe the AI proposed.** The earlier probes (balance, bend, velocity) were timetables played
through the bridge because they measured MACHINES; this test asks his EAR, so it belongs in the instrument he listens with. A generated
score file (`scores/…` by NAMING §1) carries the whole grid — every shape at every duration on every player — and he plays it, solos a
part, loops a stretch, changes a curve by hand where he wants to hear a variant, and keeps the file as the record of what was heard.
Nothing new is needed to make it: a crescendo is a held note with a rising curve (topic 2), the loudness law is measured (1g), and the
score already solos parts.

## §257. CN-48 — the test's layout decided ("a"): the same grid at the same times on all seven lanes; PHASE 1 COMPLETE, the top line confirmed, PLAN 1l opened; phase 3 begins

Composer, 2026-09-08: *"a"* — the grid laid at the SAME times on all seven lanes (nine crescendos a player, about a minute and a half),
so soloing swaps the instrument without moving the playhead and an unsoloed play gives all seven at once. The pitch question he left to
the AI: **one comfortable pitch per player**, the middle of its ordinary range (a second register is one edit away in the file and is not
worth doubling the grid for before he has heard the first).

**Phase 1 complete** — five topics decided (§252–256): the planning organized as four items with 1l first; the survey read and the test's
width; what a crescendo is in the score, with his correction about the curve-lane editing and the orange; the end (a cliff, 0.17 s, the
3 s / 5 s fallbacks); one spacing rule (free 150 ms after the last sound ends). **The top line confirmed** — 1 the listening test · 2 the
crescendo object · 3 the spacing rule · 4 verify and document. **PLAN 1l opened** with the why, his words, the decisions and the four
steps, committed. **Phase 3 begins**, his format of §224: each step's goal and sub-steps in one turn.

## §258. PLAN 1l phase 3 — step 1 (the listening test as a score file) agreed and written; step 2, the crescendo object, put to him

Composer, 2026-09-08: *"good"* to step 1 as put — the generator script, the grid of nine per player on the same times across all seven
lanes, the ordinary voice at ppp … fff with a cliff, the orange fill, a marker per column, the middle pitch of each range, the checks
before his ear, then his verdict. Written into PLAN 1l, committed.

**Step 2 put to him, goal and sub-steps together:** what a crescendo IS once and for all — a held note whose curve rises, its
`properties.cresc` carrying the family, the ratio, the dynamic range and how its end was set; a helper that MAKES one (a pitch, a
player, a start, an end, a shape → the note with its curve, its technique, its colour); the end rule in one place (0.17 s before that
player's next note, else 5 s), the dynamic range ppp … fff by default and settable per crescendo, the cliff; the drawing in the score
(filled, transparent, the morph orange) and the editing the curve-lane way (the line dragged to bend, no diamond, the dots always
drawn) — the score's own drag, stretch, delete, undo and save working on it because it is a note; the fields into NAMING; node checks
for the shapes, the end rule and the provenance, and a walk on a copy.

## §259. PLAN 1l — step 2 (the crescendo object) agreed and written; step 3, the spacing rule, put to him

Composer, 2026-09-08: *"good"* to step 2 as put — the pure maker, the shapes by name from the app's own presets, the end rule in one
place, ppp … fff with a cliff, the orange fill, the curve-lane editing, the fields into NAMING, the checks and the walk. Written into
PLAN 1l, committed.

**Step 3 put to him, goal and sub-steps together:** ONE rule in the app — a player is free 150 ms after its last sound ENDS — written
once as a shared helper (given a player, a moment and everything that player already sounds, is it free?), and used by the strikes
drawer's chord engine (its box re-read from "no player attacks twice within N ms" to "rest ≥ N ms after the end", the number still his,
150 the default and 200 still typable), by the sequence filler and the crescendo strikes when they come (1n, 1o), and by anything later
that has to ask; the events it counts are every sounding thing on that lane — a strike, a trill's span, a beating's span, a crescendo,
an ordinary note — so a player stops looking free merely because its long sound started a while ago; the trill's no-next-note fallback
moved from 2 s to 3 s at the same time (new trills only; the ones in the piece keep the ends they were given); node checks that the rule
is a guarantee on a fast run, that a long sound blocks its whole length, and that PLAN 1k's dealt sequences move as little as the
arithmetic says; a walk on a copy showing the chords drawer reading the new box.

## §260. PLAN 1l step 3 — his question answered with the piece measured, and the measurement CAUGHT A DEFECT in the rule as stated: a morph's re-breath is not a new articulation. The gesture clause decided ("a")

Composer, 2026-09-08: *"how will the trills change moving forward? and how about the strikes with just short onsets? i think you said
minimal impact, iow if I redid the strikes/trills currently in my score using these rules how would they change?"*

**Measured on `scores/piece-septet.json` rather than asserted** (549 sounding notes on the seven lanes, 542 consecutive pairs):
- **The strikes do not move.** 515 of the 549 notes are ≤ 200 ms (94%); the median note is **63 ms**. A 63 ms strike plus 150 ms of rest
  is 213 ms — LOOSER than the 250 ms attack-to-attack the run uses today. Nothing short anywhere in the piece is newly blocked, and
  nothing that failed the old rule passes the new one (5 pairs fail both; they are hand-placed).
- **The trills do not move either.** All **69** trills have a later note on their own player, so the no-next-note fallback never fires;
  moving it 2 s → 3 s changes nothing already written. (Their own end rule, 0.17 s before the next note, is untouched.)
- **THE DEFECT the numbers caught:** 18 pairs WOULD be newly blocked, and every one of them is a **morph re-breath** — a violin holding
  6 to 10 seconds and re-bowing 50 ms later, in the BLOOM at 183 s. The rule as the AI stated it would forbid the morph's own
  breathing. A re-breath is not a new articulation; it is the same sound continuing.

**Decided (his "a") — THE GESTURE CLAUSE:** the rest applies BETWEEN GESTURES, never inside one. Notes that share a group (a morph's
`grp-morph-NN`, a beating's zone, a strike's group) are one continuous sound and never block each other; everything else obeys the
150 ms after the end. The alternatives — naming the morph and the beating as exceptions (every future gesture would have to remember to
add itself), or keeping two rules — were put beside it and set aside.

*(The method's own lesson, for the record: the answer to "how would my score change?" had to be MEASURED. Asserting "minimal impact"
would have shipped a rule that outlawed the section he is composing this week.)*

## §261. PLAN 1l planned whole — step 4 agreed after he asked for it plainer; the item shown to him once

Composer, 2026-09-08: *"I'm not sure what this is, simpler please"* on step 4, then *"good"* to the plain form — **check it works, write
it down, hand him the test file**. (The AI's first telling had listed the checks, the walk, the document, the naming fields, the plan,
the planner, the journal and the titles as seven bullets of equal weight; the plain form says the three things that happen and leaves
the rest as the doing. The method's own rule: when he says a turn is too much, shorten without re-explaining.)

**PLAN 1l is planned whole** — four steps in the fixed formats, each agreed in one turn (his format of §224) and written at once:
1 the listening test as a score file · 2 the crescendo object · 3 the spacing rule with its gesture clause · 4 verify and document.
The status `PLANNED`, the build at his word, step 1 first. Shown to him once as the method asks, with what sits outside the plan: the
build's go; his three tests still waiting (1k chords mode, 1j the piano's lines, 1i the piano's harmonics); and the three items that
follow this one (1m the C key, 1n the sequence filler, 1o crescendo strikes), each planned when its turn comes.

## §262. PLAN 1l BUILT (steps 1–4 but his ear) — the crescendo object, the listening-test score file, the one spacing rule; three findings on the way

2026-09-08, the AI alone at his *"go 1l as much as possible independantly until you need me pls"*.

**Step 2 first, because step 1 needs it** (the test file is made OF the object): `score/public/cresc.js` (pure) — the three families with
his own ratio ladder (`segmentFor`: surge exponential 0.40 at 5×, bloom logarithmic −0.29, line power 0), `endFor` (0.17 s before that
player's next note · the 5 s fallback · a typed duration · **no room** when the next note is closer than 0.3 s), `make` (the held note
with its curve, the ordinary voice, ppp … fff, the cliff, the morph orange `#C2410C`, the `properties.cresc` provenance), `heightAt` and
`thresholdOf` (the shape measured off the drawn curve, so the checks test the sound and not the intention), `describe`. `STANDARD` is
surge 5×, **marked provisional** until he names one.

**Step 1:** `tools/cresc_test.js` → **`scores/cresc-test.json`** — 9 columns (3 shapes × 3 durations 1.5 · 5 · 12 s) × 7 players = **63
crescendos over 73.5 s**, the same times on all seven lanes so soloing swaps the instrument (his "a"), a marker naming each column, each
player at the middle of its ordinary range on its ordinary voice. `--durations --shapes --ratio --gap` regenerate a different grid.

**Step 3:** `score/public/spacing.js` (pure) — `free(t, events, { restMs, group, dur })` with **the gesture clause**; the strikes
drawer's chord engine re-read (it now records each player's END, `soundMs` being how long one dealt sound lasts, and its box says
**"rest after the end ≥ ___ ms"**, default 150); the trill's no-next-note fallback 2 s → **3 s**.

**Verified — 43 node checks** (`tools/cresc_check.js`) and a walk in the app: the file opens (63 crescendos on 7 lanes, 9 markers, all
drawn in the orange, nothing bleeding); **the three shapes reach the ear differently** — through the score's own law on Vn1 F#5 over 5 s,
CC7 goes 88 · 93 · 100 · 109 · 127 (surge), 88 · 98 · 107 · 114 · 127 (line), 88 · 103 · 111 · 121 · 127 (bloom), the note-on velocity
120 from the curve's top; the drawer's box reads the new sentence; `trillDefaultEnd` says "3 s — no later strike note on this player".
Every other suite still passes (the chords 35, the cues 32, the harmonics 38, the morph 64).

**Three findings on the way:**
1. **The rule needed the gesture clause, and the piece proved it** (§260) — 33 pairs would newly block, 18 of them the morph's own
   re-breaths. Named before the code was written, so the clause was in the first version.
2. **The other 15** newly-blocked pairs are existing **trill → strike** transitions already 110–148 ms apart, tighter than the new rest.
   They are left exactly as he wrote them: the rule governs new generation and never rewrites the score. Recorded in CRESCENDO.md §4.
3. **"No room" is an answer.** The first `endFor` clamped a crowded crescendo to a 0.3 s minimum — which drew it straight over the note
   that crowded it. Now the maker returns nothing and the caller says there is no room. Caught by a check whose arithmetic I had got
   wrong, which is the only reason I looked.

**The piano's column is a caveat, not a bug:** a piano cannot swell; its crescendo is a CC7 fade on a decaying note. It is in the file
because he asked for all seven players, and CRESCENDO.md says so beside it.

**Pending him:** the listening test itself — open `cresc-test`, solo, name the standard; his answer replaces `STANDARD.provisional` in
`cresc.js` and the line in CRESCENDO.md §2, and then 1m (the C key) is planned.

## §263. The standard NAMED — surge is the default, line and bloom stay as options, bloom revisited at first use; and CN-49: SECCO, put to him as a design

Composer, 2026-09-08 (verbatim in CN-49): *"the surge is the default, we can keep the others as options, the bloom needs to be revisited
but defer til first use"*.

**Written in at once:** `score/public/cresc.js`'s `STANDARD` is no longer provisional — surge 5×, `named: '2026-09-08'`, the why his;
`docs/CRESCENDO.md` §2 carries his words. PLAN 1l step 1's last to-do is done. **Bloom's revisit is deferred, not dropped** (its 5×
reads front-loaded; whether that is the bloom he wants is a question for the music, and it will be asked when a piece first needs one).

**Then his new ask, SECCO** (CN-49): a checkbox, ON by default; in the notation a text instruction — the strings damp the string with a
finger or bow pressure at the end for an abrupt cut, the winds get the same word so they hear the shape the strings will make; in the
sound a CC7 cut so nothing rings past the end. He remembers rightly that All Notes Off is no use (§202: the Xsample instruments do not
accept it).

**Checked in the string quartet (#1), as he asked:** `secco` there is a NOTATION flag only — a text mark beside "Non-Vib" on a long
tone, a checkbox in its crescendo tool, stripped from the LilyPond when unchecked (`server.js` ~1050, 1130, 1462–1520;
`AI_CRESCENDO_PROMPT_GUIDE.md` "two dynamics, Non-Vib text, secco text"). **The MIDI cut is not written down there**, so this piece
specifies it rather than porting it.

**Put to him — the design (one chunk, his go, then built):** `properties.cresc.secco` true by default on every crescendo the maker
makes; a checkbox wherever a crescendo is made (1m's mini panel, and the test file regenerated with it); **the sound** — at the
crescendo's end the tick sends **CC7 0 on that player's port and channel about 10 ms before the note-off**, so the sample stops rather
than decays, and the next note's own pre-arm restores CC7 as it always does (nothing else to undo); **the guard** — the cut is skipped
when another sound of that player is still running on the same port and channel (a trill's tail, an overlapping note), so a secco
crescendo never silences its neighbour; **the notation** (2a) — the word *secco* under the note for every instrument, the strings'
damping being the action it names. **The one question for him:** does secco belong to a crescendo only, or to any held note he marks
(the same checkbox on an ordinary long note)? The AI's recommendation: the crescendo now, any held note when 2a asks — the sound path
is identical and nothing is lost by waiting.

## §264. His correction on the CC7 cut — the quartet round-robins THREE instances because a CC7 raised too soon brings the residue back; this rack has ONE instance per instrument, so the cut is measured before it is designed

Composer, 2026-09-08, after "(a)" to the secco scope: *"but have you seen how the cc7 is handled in reaper, i believe any volume/cc7
changes happen on their own port, i don't have the details but normal notes like stacatto are on a1 for example or the one instance of
kontakt and cc7 are on their own instance so either there is a crescendo and then a stacatto for example so they are each in their own
instance so no effect, and there is a crescendo/cc7change followed by another in this case there is a round robin of 3 instances so no
volume change follows another, i think there is a 2 sec tollerance because if you raise cc7 immediately any residule sound comes back
in"*.

**He is naming the failure my design would have walked into.** The plan of §263 was: CC7 0 at the end, and the NEXT note's own pre-arm
restores CC7. If the tolerance is real, that restore REVIVES the cut crescendo's tail — the cut would work and then undo itself at the
next note.

**The rack read (this piece's, `reaper/septet_rack.rpp`):** ONE track and one instance per instrument, each on its own port —
Flute SI2 · Fluteb SI2 · Bass Clarinet XS · Piano Kontakt + Piano PP2 · Vn1 XS · Vn2 XS · Va XS · Vc XS (plus the strikes tracks and
REC). Articulations are chosen by CC0 and channel INSIDE one instance. **So the septet has no round robin**: a crescendo and the next
note on the same player share an instance, which is exactly the case the quartet solved with three instances.

**Decided: measure before designing.** The tolerance is a property of these samples (Xsample senza vibrato, SI2 flute, the piano's
libraries), not of the quartet's. A probe as a SCORE FILE — the same way he asked for the listening test (§256) — settles it: a
crescendo, a CC7 cut at its end, then CC7 raised again after 0.25 · 0.5 · 1 · 2 · 3 s, one row per gap, on each string and the flute;
he solos and hears at which gap the tail comes back. Then either the spacing rule pays for secco (a secco crescendo makes its player
unavailable for the measured tolerance instead of 150 ms) or the rack grows instances (his hands, the quartet's way) — the choice is
his and it is not made until the number is known.

## §265. Read back to him: what THIS piece documents about CC7 (its role, and that the app pins it to 127 before every event) and what it does not (the residue tolerance in seconds) — so secco is measured here before it is built

Composer, 2026-09-08: *"this is well documented for this piece, we ran probes etc before setting up the reaper rack"*. Read, and he is
half right in a way that matters.

**What this repo documents** (`docs/REAPER_CONTROL.md` §3, RUNNING_LOG §48, D11):
- **CC7 is the Kontakt slot's / the UVI part's volume**, and **the composer app PINS CC7 = 127 before every event** — the tuba stack's
  per-event ownership, kept in this piece. A fader set by hand is reset at the first note.
- That is why the trims live on the **Reaper track faders** here, not on CC7: CC7 is not a place anything can be left standing.
- **The rack** (`reaper/septet_rack.rpp`): ONE instance per instrument, each on its own port — Flute SI2 · Fluteb SI2 · Bass Clarinet XS
  · Piano Kontakt + Piano PP2 · Vn1 XS · Vn2 XS · Va XS · Vc XS. The Xsample articulations are chosen by **CC0 inside one slot**, so a
  crescendo and the staccato that follows it on the same string **share the CC7 path** — unlike the quartet, where (his words) the
  volume changes had their own instance and a round robin of three.
- **The probes that were run** are the dB transfer of CC7 (`probes/cc7_map.json`, 33 steps, the tuba kit), the balance and held-note
  runs, the bend probe, the sample lengths and ranges. None of them measured a **residue tolerance**.

**So the position is:** his instinct about the failure is exactly right and it is STRUCTURAL here — the app re-pins CC7 = 127 at every
pre-arm, so a secco cut is undone by the very next note on that slot; and the septet has no round robin to hide behind. What is NOT on
record is the number: how long after CC7 = 0 this kit can be re-pinned without the cut note's tail returning. His memory says about 2 s
from the quartet's samplers; these are Xsample, SI2, 8Dio and IRCAM.

**Proposed (his go): measure it as a score file, the way he asked for the listening test** — `scores/cresc-secco-test.json`: on each
string and the flute, a crescendo, CC7 0 at its end, then a short note that re-pins CC7 after 0.25 · 0.5 · 1 · 2 · 3 s, one row per gap,
the rows far enough apart not to contaminate each other; he solos and hears at which gap the tail comes back. Then the choice, and it is
his: **(a)** the spacing rule pays for secco (a secco crescendo makes its player unavailable for the measured tolerance instead of
150 ms) · **(b)** the rack grows instances for the crescendo voice and the app routes to them, the quartet's way (his hands, more CPU,
new ports) · **(c)** secco is notation-only here and the sampler simply rings (what the tuba piece's notation does today). Nothing is
built until the number is known.

## §266. CN-50 — the secco cut answered by a ROUND ROBIN in the back end; the napkin done on the rack as it is; PLAN 1l gains step 5

Composer, 2026-09-08 (verbatim in CN-50), then *"good"* to the shape below.

**The rack as it is** (`reaper/septet_rack.rpp` + the recipe): each STRING is one Kontakt instance using **channel 1 only** — its 88
articulations are chosen by CC0 inside that one slot — so channels 2–16 are free on its port; the BASS CLARINET uses 1 and 5; the PIANO
1, 2, 3, 5; the **FLUTE uses all sixteen** across its two UVI ports (30 techniques), so it alone has no free channel. **A round robin
therefore needs no new ports for the strings and the bass clarinet** — only extra SLOTS in the instance they already have, each loaded
with the same instrument on a free channel. CC7 is per channel, so a cut on one slot cannot reach another.

**The napkin.** After a cut, that slot must not be re-pinned for the tolerance T. With a pool of N slots a slot returns every N
crescendos, and consecutive crescendos are 0.17 s apart (the end rule), so the rotation holds when
`N × 0.17 + (the N−1 crescendo lengths between) ≥ T`.

| pool | shortest average crescendo that still holds, T = 2 s | T = 3 s |
|---|---|---|
| 3 slots | 0.75 s | 1.25 s |
| 4 slots | 0.44 s | 0.78 s |

His own scales (CRESCENDO_TAXONOMY D2) put a gesture under 2 s and a breath at 2–12 s; the listening test's shortest is 1.5 s. **Three
is enough** unless he writes runs of crescendos averaging under about a second on one player; a fourth buys only the sub-second case.
**Decided: build for a pool of N, set to 3, and let the tool WARN when the rotation cannot satisfy T** — the warning is the signal to add
the fourth, rather than a guess made now.

**PLAN 1l gains step 5 — SECCO AND THE ROUND ROBIN** (the plan's own steps 1–4 are built, §262): the tolerance measured as a score file
(the way he asked for the listening test); the slot pool per player in the recipe; the back-end rotation (a crescendo asks for a slot,
the pool answers, the front end never sees it); the CC7 cut at the end with its guard; secco as a property, on by default, and its
notation text at 2a; the flute's exception (its port is full — the second UVI instance's channels or one new loopMIDI port, the
precedent being the ports already made); the extra Kontakt slots tried through the Kontakt Lua API first (REAPER_CONTROL §8c lists it
as the only candidate and marks loading unexplored; §8 says slots are NOT in ReaScript), and if that fails, five minutes of his GUI
time. **His standing principle from CN-50 is recorded beside it:** the back end absorbs the sampler's limits so the composing surface
never thinks about them; the demo must not be shoddy; no long chase after intractable playback problems.

## §267. PLAN 1l step 5 BUILT to the edge of the rack — the secco cut, the tolerance probe as a score file, the slot pool and its rotation; what is left needs Kontakt

2026-09-08, at his *"good"*. Built and verified, in this order because each needs the one before it:

**1 · The cut** (`composer.html seccoCut`, called from both places the tick schedules a note-off): a secco crescendo sends **CC7 0 on
its own slot 10 ms before the note-off**, so the sample stops instead of ringing. **The guard:** the cut is skipped while another sound
of that player is still running on the same port and channel, so a secco crescendo can never silence its neighbour. `secco` is a
property of every crescendo, **true by default** (his CN-49), and can be turned off one at a time.

**Verified in the app** on the probe file, with fake outputs, by the decoded MIDI of Vn1 — exactly the experiment his ear needs:
`cc0=5 · cc7=88 · ON 78@120 · **cc7=0** · OFF 78 · cc0=5 · **cc7=127** · ON 78@86 · OFF 78`. The crescendo is cut; the next note re-pins
CC7, which is the moment a tail would return.

**2 · The tolerance probe** (`tools/cresc_secco_test.js` → `scores/cresc-secco-test.json`): five rows — a 4 s secco crescendo, cut at
its end, then a quiet 1.2 s note on the SAME player and slot after **0.25 · 0.5 · 1 · 2 · 3 s** — every player, the same times, the rows
10 s apart so none contaminates the next. He solos a part and listens down the rows: the first gap with no returning tail is this kit's
tolerance. 74.8 s.

**3 · The pool and its rotation** (`Cresc.assignSlots` / `applySlots`, pure; the tick sends on `properties.cresc.slot`): a player's
crescendos are walked in time order and given the least-recently-cut slot that has rested the tolerance; when none has, the nearest is
taken and a **warning** names the moment and says to add a slot or lengthen the crescendos — the signal for a fourth, rather than a guess
now (§266). **The pool is empty by default**, which means no rotation and the ordinary voice's own channel, exactly as today, so nothing
changes until the slots exist. Checked: three slots rotate 2·3·4·2·3·4 through 1 s crescendos every 1.2 s with no warning; half-second
crescendos every 0.6 s warn; an empty pool falls back cleanly. **50 checks** in `tools/cresc_check.js`.

**What is left, and it needs the rack, not the app:** the extra Kontakt slots themselves (two more copies of each string's Xsample
instrument on free channels — the strings use channel 1 alone, so 2 · 3 · 4 are free inside the instance each already has; the bass
clarinet likewise; **the flute's port is full**, so its pool is the second UVI instance's channels or one new loopMIDI port). The
attempt through the Kontakt Lua API is next and is an investigation: REAPER_CONTROL §8 says slots are not in ReaScript and §8c marks the
Lua API's reach over loading UNEXPLORED — it needs Kontakt running with Developer options on, which is his machine's state. If it
cannot load an instrument into a slot, this is five minutes of his GUI time, and the pool becomes three lines in the recipe.

## §268. CN-51 recorded — Lake George: a pattern tool fed by multitempo and phase, thinned by algorithm, harmonized on a clock, with transitions codified; a counterpoint of timbres after Sciarrino

Composer, 2026-09-08, mid-build: the note verbatim in CN-51. Eight parts as he names them — the multitempo / phase panel as the FEEDER
rather than a recorded strike; the orchestration open afterwards with the articulation per note; **weighting** ("50% of the time is the
horn"), which is new — a share rather than a turn; **thinning as the heart** ("various algos to remove notes, create different degrees of
sparceness, need to develop a good model for this"); whole or part, as 1k's chord strikes now do; the harmony changed every n seconds or
by TIME CONTAINERS; **harmony transitions as a codified family** on the video metaphor (crossfade, wipe, …), *"find models that have
distinction sonicly and then codify, can use in other things"*; and the composition itself a **counterpoint of TIMBRES after
Sciarrino**.

Nothing to build in the septet unless the septet asks. The one part that might earn its place here first is the transitions family, since
the morph panel and the harmony menu already sit beside each other. Piece #6's material now: CN-31 · CN-42 · the 2026-09-04 notes · this.

## §269. The Reaper bridge answered — and a lesson: a job written straight into the polled inbox is read half-finished

While closing PLAN 1l step 5 the bridge was used for the first time this session. **Two jobs returned `ok: true` with NO `result`** —
the bridge polls the inbox ~30 times a second and had read the file before the write finished, so `load()` compiled a fragment that
returned nothing. **Writing to a temp name in the bridge folder and RENAMING it into the inbox works** (rename is atomic), and the third
job came back whole. *(For every future job: write, then rename. Worth a line in `reaper/bridge/README.md`.)*

**What it answered** (Reaper 7.72, `septet_rack.rpp` open, 13 tracks): one plugin instance per instrument, exactly as the file said —
Flute SI2 and Fluteb SI2 on UVI Workstation, the bass clarinet on two Kontakt tracks, Piano Kontakt + Piano PP2, and **one Kontakt each
for Vn1 · Vn2 · Va · Vc**. So the crescendo pool needs extra SLOTS inside those instances; there is nothing already loaded to rotate
through.

**And the limit stands:** ReaScript cannot load an instrument into a Kontakt slot (REAPER_CONTROL §8 — plugins expose parameters only),
and Kontakt's own Lua API runs inside Kontakt, not through this bridge. **So the slots are his five minutes at the GUI**, and the app is
ready for the moment they exist: the pool is a list of channels, empty today, and everything downstream already reads it.

## §270. Understandings coordinated at his word — the round robin is D11, decided 2026-09-03 for exactly this case; his rack has held the four slots since; the app has never used them, and THAT is what the crescendo build is missing

Composer, 2026-09-08, with two Kontakt screenshots: *"lets coordinate our understandings here; the kontakt instruments bcl strings
already have multis with 4 instances expressly created for cc7 use, on ports 1-4; and i'm not sure what we did for uvi but we would have
addressed this, maybe look in the journal/notes somewhere so lets make sure we are on the same page then reevaluate what needs to be
done, what is missing for the new crescendo build"*.

**He is right and the record is his.** The AI had read the Reaper TRACK list (one Kontakt per string) and concluded one slot each; the
screenshots show **four Contemporary Violin instances on MIDI channels 1 · 2 · 3 · 4 inside that one Kontakt**. Read back from this
repo's own journal:

- **D11 (2026-09-03, his choice "b")** — *channel banks by EVENT CLASS, from the start, on every Kontakt / Xsample port*: **ch 1 MAIN**
  (plain notes, dynamics by velocity, articulation by the prelude's CC0; **no continuous controller is ever written here**) and
  **ch 2 / 3 / 4 CURVE A / B / C**, used **round-robin** by any event carrying a continuous controller (CC7 level, CC1 timbre dynamic,
  CC4 + pressure width, bend). **His words in D11 are today's problem, verbatim:** *"there's going to be events that happen right after a
  crescendo much sooner than two seconds … a crescendo in the violin that goes to secco … the next event might come in in a hundred and
  fifty milliseconds … So probably better to continue using multiple channels."* Three curve channels were chosen as *"cheap insurance"*.
- **The recipe already carries it** for the four strings: `channels: { main: 1, curve: [2, 3, 4] }`. **The bass clarinet's entry does
  not**, though his rack has the slots. The flute is `null` — RUNNING_LOG §16 left it to 0c ("curve copies of the few curve-bearing
  techniques in the four free Fluteb slots; recommendation: a curve copy of `ord` at least"), and 0c is still `todo`. The piano is main
  only, and a piano cannot swell.
- **Nothing in the app has ever read `channels`** (grepped: no reference anywhere). So today every event — a plain note, a trill's CC7
  stream, a morph's bend, a beating, and the crescendo built this evening — goes to `tech.channel`, which for a string is channel 1.
  **The router is PLAN 0f**, still `todo`.

**What that does to the crescendo build — it gets SIMPLER, and one worry disappears.** Under D11 a plain note never writes a continuous
controller and never touches a curve channel, so **an ordinary note after a secco crescendo cannot revive it**: the cut lives on a curve
channel the plain note never visits. The only revival case left is another CURVE event landing on the same curve channel inside the
tolerance, and the round robin over three is exactly the insurance D11 bought. The tolerance probe is still worth running — it tells us
whether three is enough at his tightest writing — but the 2 s worry does not apply to the ordinary case at all.

**Changed at once:** `Cresc.assignSlots` now reads **the recipe's `channels.curve`** (D11's own field) instead of a pool invented this
evening; its `pool` option remains only for tests. Verified: the four strings rotate 2 · 3 · 4 · 2 · 3 · 4 from the recipe alone; the
bass clarinet falls back to its own channel, because its recipe entry has no `channels` yet.

**So what is missing for the crescendo, in order:**
1. **`channels` for the bass clarinet** in `sandbox/instruments.js` — one line; his rack already has the slots (his screenshots).
2. **The router (PLAN 0f / D11's §4 note):** curve-bearing events to a curve channel, round-robin per instrument; plain notes to main
   with **no CC7 pinned** (today the tick pins CC7 = 127 before every event, which is what D11 forbids on main). This is bigger than the
   crescendo and it pays for the morph's bends, the beatings and the trills' CC7 as well — every one of them is on channel 1 today.
3. **The flute's decision (0c):** curve copies of `ord` (at least) in the free Fluteb slots, or the flute goes without curve channels.
4. **The tolerance**, from the probe file, to confirm three is enough.
Nothing here was wasted: the cut, the probe, the rotation and the warning all stand; only their pool moved to where it always belonged.

## §271. D11's CURVE CHANNELS WIRED (PLAN 0f / 0c.7) — five days after the rack was built for them; the secco cut is now safe by architecture, and the UVI question answered from the record

2026-09-08, at his *"then proceed with 1, 2, 3, 4"*.

**What the UVI question turned out to be** (his *"what did we decide to do for uvi instruments and cc7 9/3? did we defer it?"*): D11's
own text covers *"every Kontakt / Xsample port (bass clarinet, vn 1, vn 2, va, vc)"* — **the flute was deferred in the same
conversation** (§16): *"Flute (SI2 in UVI): channel = technique, 16 + 12 parts — no spare channel per technique, so banks cost slots.
Either the tuba law as it stands, or curve copies of the few curve-bearing techniques (`ord`, `aeolian`, `flz` …) in the four free
Fluteb slots. Decide at 0c once the composer's UVI order is transcribed; recommendation: a curve copy of `ord` at least."* The order was
transcribed (§60: 16 parts on `Flute`, 3 on `Fluteb`, **13 slots free** "for 0c.7's curve copies"), but **0c.7 never ran** — so the
decision is still open, and it is his.

**Why the flute is different in kind:** on UVI a channel IS a technique (26 techniques over 16 channels on `Flute`, 4 more on
`Fluteb`), so a curve channel cannot be "the same instrument again" as it is in a Kontakt slot — a curve copy must be made per
technique. The crescendo only needs `ord`, so one free Fluteb slot would do it.

**Built (items 1 and 2 of the list he approved):**
1. **The bass clarinet's `channels`** — `{ main: 1, curve: [2, 3, 4] }`, matching the four slots his rack has held. *(A patch of mine
   corrupted that line on the way in — it rewrote `balanceDb: -9` as `-1.5` and dropped `playerBendSt` and `bendRangeSt`. Caught by
   reading the entry back before committing; repaired; the diff is now the one added line. The lesson is the old one: a replacement
   string must carry the ORIGINAL text verbatim, and a patch that rewrites a line it did not need to touch is a patch with a bug.)*
2. **The router** (`composer.html`): `curveChannelsOf(lane)` reads the recipe; `isCurveEvent(wc)` says whether a note streams a
   controller (a captured or keyswitched note does not — it stays on MAIN); `curveChannelMap()` walks each player's curve events in time
   order and rotates the pool, leaving a **secco-cut channel to rest** for the tolerance and an ordinary swell only its own span;
   `channelFor(wc, tech)` is what the tick now asks. `resetCC7All` sweeps the curve channels too, or a cut one would stay silent.

**Verified by the decoded MIDI on the probe file** — both halves of the story in one playthrough:
- **Violin 1** (D11 bank): the crescendo on **channel 2** (`cc0=5 · cc7=88 · ON · cc7=0 · OFF`), the note after it on **channel 3**
  (`cc0=5 · cc7=127 · ON`). **Different channels: the cut cannot be revived at all.** The stop sweep then visits ch 1 · 2 · 3 · 4.
- **The flute** (no bank): both on **channel 12** — `cc7=0` then `cc7=127` on the same channel. That is the revival case, and it is
  exactly what his ear must judge in the probe.
- The rotation across the five rows: `2 · 4 · 2 · 4 · 3` on every string and the bass clarinet; `own` on the flute and the piano.

**So the secco problem is now solved by architecture for six of the seven players**, five days after the rack was built for it. What is
left: **the flute's decision (0c.7)** — a curve copy of `ord` in a free Fluteb slot, or the flute goes without and its crescendos keep
the old hazard; and **the trills and beatings still route themselves** (their zones carry precomputed snippets with explicit channels),
so they are still on MAIN — the next piece of 0f.

## §272. CN-52 taken as a to-do — the piano in the chord strikes: the ensemble's remainder

Composer, 2026-09-08: *"can you take a note to todo revisit the chord strikes and incorporate alowing piano to play a whole chord or
multiple partials in a chord …"* — verbatim in CN-52. Recorded as **PLAN 1k step 7** (`todo`, to be planned when its turn comes) and as
a line in `STRIKES_TOOL.md` §X's "Not yet". Its shape as the AI reads it: the REMAINDER (the notes an onset could not deal, offered to
the piano so the chord is complete even when the strings cannot be), FREE OF THE COUNT (several notes of the sonority whether or not the
ensemble was short — a hand is not a bow), and the interface, which is the real work: a per-strike rule (none · one note · a chord · the
remainder) in the drawer's own manner. Nothing built; nothing else moved.

## §273. 0c.7's status written into the plan — the map and the note router built, three things left (the flute's decision, the trills and beatings, the prelude's other controllers)

Composer, 2026-09-08: *"yes write 0c.7 into the plan"*. It was already there (written 2026-09-03 with D11), and what it lacked was its
state. Marked `doing 2026-09-08`: the channel map and the NOTE router are built and proved (§270–271); what remains is (a) the flute's
decision, which is his — a curve copy of `ord` in one of the thirteen free `Fluteb` slots, or the tuba law and the ring; (b) the trills
and beatings, still on MAIN because their zones carry precomputed snippets with explicit channels; (c) the prelude's other controllers
(CC1, CC4 + channel pressure) and `tech.ks` for the flute's KS presets.

## §274. The flute's curve bank decided and wired — three Ordinario copies on `Fluteb` 4 · 5 · 6; all seven players now protected

Composer, 2026-09-08: *"for [the flute] lets use the kontakt standard and use the appropriate number of addl instances, again the
principle for playback/demo is best result for least/most efficient use of work"*.

**Taken as: the Kontakt standard of three curve channels, applied to the one flute technique that swells.** On UVI a channel IS a
technique, so a curve channel must be a curve COPY; `ord` is the only technique a crescendo, a morph note or a drawn swell uses, and
`Fluteb` has thirteen free slots. **Three copies of Flute Ordinario on `Fluteb` channels 4 · 5 · 6** give the flute what the strings
have, for the least work that gets the result — his principle, and CN-50's.

**Wired:** the recipe's `channels` may now name a PORT per curve entry and the techniques a bank serves —
`flute: { channels: { curve: [{ port: 'Fluteb', ch: 4 }, { ch: 5 }, { ch: 6 }], curveTechniques: ['ord'] } }` — and the router grew
`curveRoute` and `routeForNote` so a curve channel can live on another port. The rotation is now decided per note (its technique decides
which bank it may use), so a flute `flz` swell keeps its own channel while `ord` rotates.

**Proved by the decoded MIDI** on the probe file: the flute's crescendos route to `Fluteb` 4 · 6 · 4 · 6 · 5; the first crescendo is cut
on **Fluteb ch 4** (`cc7=71 · ON · cc7=0 · OFF`) and the note after it re-pins on **Fluteb ch 5**. The cut cannot be revived. With this,
**all seven players are protected**: six by the Kontakt slots his rack has held since 2026-09-03, the flute by three UVI copies.

**His five minutes at the rack, now the whole of it:** load **Flute Ordinario three times into the `Fluteb` UVI instance, as parts on
MIDI channels 4, 5 and 6**, same output as the existing parts. Until they exist the flute's crescendos will address silent channels —
so this one is a prerequisite, not a nicety, and it is the only rack work left for the crescendo suite.

## §275. His three flute copies checked and corrected through the UVI text path — the first live rack edit this piece has made

Composer, 2026-09-08: *"just as a proof of concept, are you able to see the new instances in the flute and see if I did it right and are
you able to bypass the fx, leave the ir/reverb pls if not let me know, i vaguely recall something about xml uvi addressable"*.

**He recalls rightly** — RUNNING_LOG §49 / REAPER_CONTROL §3b: a UVI instance's state is a zlib stream of XML inside the VST chunk, and
`tools/uvi_state.js` (PLAN 0k.3) reads and writes it through the bridge. So this was a read, a diff and a write, with no GUI.

**What he did, read from the live instance:** `Fluteb SI2` now holds six parts — Staccato · Trills KS · Whistle Tones on channels 1–3
as before, and **three Flute Ordinario copies on channels 4 · 5 · 6**, unmuted, main output. **The channels are exactly right.**

**Two differences from his own convention, both fixed in one write:**
1. **The gain.** His three older parts (and every part of the `Flute SI2` instance) sit at **+6 dB**; the three copies came in at **0 dB**.
   A flute crescendo would have been 6 dB under every other flute sound and under the balance 1g measured. Raised to +6 dB (`Gain=1.9952623`).
2. **The insert effects.** Each program carries `Convolver InsertFX0` (the *Grain Hall* IR — his reverb), `DigitalEq InsertFX1` and
   `Maximizer InsertFX2`. On his older parts the EQ and the Maximizer are bypassed and the convolver is left on; on the three copies all
   three were active. **The EQ and the Maximizer are now bypassed on the copies, the convolver untouched** — his ask exactly, and now
   uniform across all six parts.

**Verified:** the edited XML re-encoded and pushed (`encode … --push`), the instance read back byte-identical to what was sent, and a
fresh `info` from the live plugin shows all six parts at +6 dB. The original XML is kept beside the edited one in the scratchpad.

**What this proves for the piece:** the UVI half of the rack is addressable from here — parts, channels, gains, preset paths, outputs and
every effect's bypass — so a setup slip is a diff and a write rather than nineteen clicks. Kontakt's half remains GUI (its chunk is the
NKI binary), which is why the strings' four slots were his hands and the flute's three copies could be corrected by mine.

## §276. PLAN 1m opened (the C key) — phase 1, topic 1 decided: "a", C makes the crescendo at once and the card edits the live object

Composer, 2026-09-08: *"topic 1 = a"*. So the gesture is the trill's, not a form to fill in: **C creates the crescendo immediately**
with 1l's defaults (surge 5×, ppp … fff, to 0.17 s before that player's next note, secco on) and a small card opens ON it; every change
is made to the real object, so it can be heard at once; ENTER keeps it, ESC removes it, CTRL+Z undoes it. His own phrase in CN-48 was
*"then go to insert"*, which read as the other option; put beside T's manner and 1j's picker card, he chose the live one.

**What 1l already settled, so 1m does not re-decide it:** the shape, the object, the end rule and the fallbacks, ppp … fff, the cliff,
secco, and the channel it sounds on. **What the panel holds, his words (CN-48):** *"default dynamic range and duration (til next note or
if no note a standard duration), and articulation, but I can change any of them there in the mini panel"* — three controls, each
defaulted, each editable; and the secco tick of CN-49 belongs beside them.

**Topic 2 put to him — what happens to the note he selected.** T keeps its note: the trill covers it and eats what starts under it. A
crescendo is one note, so the question is real. (a) **The selected note BECOMES the crescendo** — same pitch, same start, the new shape
and the new end; nothing is doubled, and the strike he clicked is spent (recommended: it is the plainest reading of *"a crescendo appears
on that pitch"*, and one player makes one sound at a time). (b) The note STAYS and the crescendo starts at its end — the attack, then the
swell out of it; two objects, and on a string an impossible bow change unless the attack is arco. (c) The note stays and the crescendo
starts with it, overlapping — now physically possible in the machine (they are on different channels since §271) but not for a player.

## §277. PLAN 1m topic 2 decided — "a", and with the trills' own courtesy: the source note is greyed, not destroyed, and comes back when the crescendo is deleted

Composer, 2026-09-08: *"yes a and the same grey original which can come back with delete of cres as trills"*.

So the selected note **becomes** the crescendo in the sense that only the crescendo sounds — but the note itself is **kept, stamped and
drawn faint**, exactly as a trill treats the notes under it (`mutedBy`: muted at play time, never deleted, drawn faint, stamped for the
downstream tools; the trill's M button gives them back as an A/B). Deleting the crescendo restores the note. Nothing is destroyed by a
keystroke, which is the app's rule everywhere else.

**Topic 3 put to him — the other ways in.** T's own entry rule is: a marked span wins · else the selected note · else the playhead on the
active lane. For C, three cases and only the first is decided. (i) ONE note selected — decided (§276–277). (ii) SEVERAL notes selected —
**one crescendo on each**, every one taking its own pitch and its own end from the rule, each greying its source; the drawer's batch
spirit, and the fastest way to fill a passage. (iii) NOTHING selected — the AI proposes that C says "select a note" and does nothing,
because a crescendo needs a pitch and guessing one from the playhead would be a surprise (T can fall back because it hunts an anchor note
within 8 s for its pitch; C would be inventing). A marked span, when there is one, sets the DURATION and the selected note still gives the
pitch. **The question:** several notes at once — yes, or one at a time?

## §278. PLAN 1m topic 3 decided — several notes give a crescendo each; with nothing selected the pitch comes from a chosen harmony, dealt from a STANDING BAR (CN-53); phase 1 complete

Composer, 2026-09-08: *"a good"* to the standing bar. So topic 3 closes with three answers: **several notes selected → one crescendo on
each**, every one with its own pitch, its own end and its own greyed source; **nothing selected → the pitch comes from a chosen sonority**
(CN-53), the lane being the active lane and the start the playhead, as T falls back today; **the source lives in a small standing bar**
like the piano lane's lines bar — the sonority, the order, how many pitches are left in the deck, and the two buttons *change harmony*
and *restart this harmony*; continuing is simply pressing C again.

**Reused, not invented** (named in the analysis): the morph panel's PITCH SOURCE (the harmony banks, his kept sets, stacks and Messiaen
modes from a root, the notes spelled) and 1k's CHORD SOURCE (in turn · shuffled to completion then reshuffled, seeded). The unit here is
one pitch rather than a chord part, and a pitch outside the player's range folds by octave into it as 1k already folds.

**Also answered on the way, from the code:** where a trill's pitch comes from when he presses T with nothing selected — `trillAnchorNote`
takes **the nearest earlier note on that same player, within 8 s**, and the trill's second note is a whole step above it
(`trillDefaults`, `interval: 2`); with no note at all it falls to the middle of the instrument's range. That is why the pitches he liked
sounded right: the trill picked the line up where that player had left it. C does NOT copy this — a harmony deck is his choice instead.

**PHASE 1 COMPLETE for 1m.** Three topics decided (§276–278). The small remainders are proposals inside the steps, not topics: the card
holds his four controls (the dynamic range, the duration, the articulation, the secco tick), remembers its last settings, and ENTER /
ESC / CTRL+Z behave as they do in 1j's picker.

## §279. PLAN 1m's top line confirmed and the item opened — phase 3 begins

Composer, 2026-09-08: *"ok good"* to the four lines — 1 the C key and the crescendo it makes · 2 the card · 3 the harmony bar · 4 verify
and document. **PLAN 1m opened** with the why, his words, the decisions of §276–278 and the four steps, replacing the stub; committed, so
a cleared chat loses nothing. Two small things folded into the steps rather than made topics: the card remembers its last settings, and
its keys behave as 1j's picker does. **Phase 3 begins**, his format of §224: each step's goal and sub-steps in one turn.

## §280. PLAN 1m — step 1 (the C key and the crescendo it makes) agreed and written; step 2, the card, put to him

Composer, 2026-09-08: *"good"* to step 1 as put — the key ignored while typing as T is; the lane, pitch and start from the selected note
and the end from 1l's rule; the source note greyed by `mutedBy` and restored on deletion; several notes giving one crescendo each under a
single undo; a marked span setting the duration; nothing selected deferring to the harmony bar; "no room" answered rather than drawn
over; and the checks with real key events including the decoded MIDI on a curve channel. Written into PLAN 1m, committed.

**Step 2 put to him, goal and sub-steps together:** the card that opens on the new crescendo — his four controls (the DYNAMIC RANGE as
two dynamics ppp … fff, the DURATION with its default and a typed override, the ARTICULATION from that player's techniques, the SECCO
tick on by default), each editing the LIVE object so every change is heard at once; a ♪ to hear it alone and ▶ to hear it in context;
ENTER keeps, ESC removes, CTRL+Z undoes; it remembers its last settings so the next C starts where the last one ended; it reopens on a
click of an existing crescendo, so the card is also how one is edited later; and the checks with real events and the decoded MIDI.

## §281. PLAN 1m — step 2 (the card) agreed with the ordinary voice confirmed instrument by instrument; step 3, the harmony bar, put to him

Composer, 2026-09-08: *"confirm that articulation ordinary voice includes ordinario uvi and senza vibrato velocity, kontakt otherwise 2
good"*. **Confirmed from the recipe, and he had it right:** the flute's ordinary voice is **Ordinario** (its own UVI part, ch 12); the
bass clarinet's is **Senza Vibrato Velocity #13** (CC0 12); each string's is **Senza Vibrato Velocity #6** (CC0 5); the piano's is the
Steinway. It is the same `ordinary` field PLAN 1g item 4 set on 2026-09-06, so a crescendo, a new trill and the balance sweep all take
one voice per player. Step 2 written into PLAN 1m with that named in it.

**Step 3 put to him, goal and sub-steps together:** the standing harmony bar (CN-53) — a small strip, the piano lane's lines bar its
model, holding the SONORITY (the morph panel's own pull-down: the harmony banks, his kept sets, the models' sets, stacks and Messiaen
modes from a typed root, the notes spelled), the ORDER (in turn · shuffled to completion then reshuffled · random, seeded — 1k's deck),
what is LEFT in the deck, and the two buttons *change harmony* and *restart this harmony*; a C with nothing selected takes the next pitch
from it, folds it by octave into the active player's range (1k's rule), and places the crescendo at the playhead on the active lane; the
bar is the browser's, not the file's, and it says so; the checks — the deck exhausts and reshuffles, the seed repeats, a folded pitch is
marked, and the bar disappears when no sonority is chosen.

## §282. PLAN 1m — step 3 (the harmony bar) agreed and written; step 4, the last, put to him

Composer, 2026-09-08: *"good"* to step 3 as put — the strip where the lines bar sits, the sonority from the morph panel's own pull-down,
the order seeded (in turn · shuffled to completion · random), the count of what is left, the two buttons, the fold into the player's
range, and the bar being the browser's rather than the file's. Written into PLAN 1m, committed.

**Step 4 put to him (the last):** check it works, write it down, then his first crescendos in the piece — the walk on a `zz-ai-` copy with
real key events and the decoded MIDI (C on a note, on several, on nothing; the greying and its restoration; the card's four controls and
its memory; the bar's deck; the curve channel; undo through all of it), the node checks for the pure parts, `docs/CRESCENDO.md` gaining
the C key's section and NAMING the greyed note's stamp, PLAN 1m's statuses, PLANNER NOW and the journal — and then **his first crescendos
in the piece**, whose verdicts go to CRESCENDO.md and NITS, after which 1n (the sequence filler) is planned.

## §283. PLAN 1m planned whole — four steps, each agreed in one turn; the item shown to him once

Composer, 2026-09-08: *"good"* to step 4. **PLAN 1m is planned whole** — 1 the C key and the crescendo it makes · 2 the card · 3 the
harmony bar · 4 verify and document — each in the fixed formats, each agreed in a single turn (his format of §224) and written at once;
the status `PLANNED`, the build at his word, step 1 first. Eight turns from the item's opening to the plan, the shortest of the four
because 1l had already settled the sound: 1m decides only the gesture, the little panel and the harmony deck.

## §284. PLAN 1m BUILT — the C key, the card and the harmony bar; and the rule that a crescendo may not be laid on a busy player

Composer, 2026-09-08: *"yes, build 1m as much as you can independently"*. Steps 1–3 built and step 4's checks and documents done; the
one to-do left is his, his first crescendos in the piece.

**What was built.**

- **Step 1 — the C key** (`score/public/composer.html`). `createCrescendo` beside `createTrill`, the **C** key beside **T** with the same
  guard. From a selected note: its lane, its pitch, its start; the end by 1l's rule. `mutedByLive(o)` is the new reading of the trill's
  own stamp — *is the object that muted this one still in the score?* — so **the grey original comes back by itself** when either author
  is deleted, and the tick and the renderer both consult it. Several notes: one crescendo each, sorted, under ONE `pushUndoState`. A
  marked span sets the duration. A note the rule cannot fit is counted, not crowded.
- **Step 2 — the card** (`score/public/cresc_card.js`, new; modelled on `cue_picker.js`). The four controls write onto the LIVE
  crescendo — dynamic range as two dynamics, duration typed with *by the rule* to restore it, articulation opening on the player's
  ordinary voice, the secco tick. ♪ plays it alone through the real route; ▶ scrolls to a second before and stops itself a second after.
  ENTER keeps, ESC removes a crescendo just born and merely closes one reopened by a click, CTRL+Z undoes. The range and the tick are
  remembered in `Composer._crescCard`; the duration is not, because the rule is per note.
- **Step 3 — the harmony bar** (in `composer.html`, with `Cresc.deckNext`/`lapOrder`/`deckLeft`/`foldInto` added to `cresc.js`). The
  sonority is **his own pitch menu, reused rather than rebuilt**: `MorphPanel.pitchSonority` was split into `sonorityOf(src, root)` and
  the menu's groups extracted as `pitchOptionGroups()`, so the bar and the morph panel read one list (163 sonorities on this piece).
  The order is 1k's deck, seeded. The bar rides the ACTIVE lane and lives in `localStorage` (`septet.crescBar.v1`) — the browser's, not
  the file's, as the lines bar is.

**The defect the walk found, and the rule it forced.** `endFor` only looks FORWARD. Pressing C at a playhead that sits *inside* a note
already sounding therefore made a crescendo on top of it, and — worse — a second C at the same instant ran a crescendo straight through
the first, because `laneNotesFor` had been written to ignore other crescendos. Both are the same mistake: **the end rule is not the
whole of the spacing question.** Rewritten:

- `crescSoundsOn(layer, exceptId)` — everything this player STILL SOUNDS: plain notes not already greyed and not eaten by a trill,
  other crescendos, trill zones, beating zones. What is silent does not crowd.
- `crescRoomAt(layer, at, exceptId, group)` — 1l step 3's own rule through `spacing.js`: free 150 ms after the last sound ENDS, with the
  **gesture clause**, so a morph's or a strike's own re-breaths never block a crescendo made inside one.

**Measured on his piece before trusting it** (`piano-harmonics-test.json`, every note inside a gesture):

| | notes |
|---|---|
| sounding notes | 593 |
| C would make a crescendo | 526 |
| refused — the next sound is too close | 52 |
| refused — the player is still sounding | 15 |

89 % pass, and the 15 are genuine overlaps outside their own gesture. The two numbers are coherent by design: a crescendo ends 0.17 s
before the next sound, which clears the 150 ms rest by 20 ms, so a run of consecutive crescendos never blocks itself.

**Three smaller things the walk fixed.** A refused press was **burning a pitch from the deck** — the deck now advances only when a
crescendo is actually placed. The bar's own reason for refusing was being **overwritten** by the caller's generic line — kept in
`_crescWhy` and preferred. And the card **jumped to a corner** when the crescendo was scrolled off screen — it now falls back to a
default position unless the crescendo is actually in view.

**Verified in the running app**, on a `zz-ai-` copy of his piece, with real key and mouse events and the MIDI decoded through a fake
`_zoneMidiOutputs`:

- C on a bass-clarinet note at 5.05 s → a crescendo D#4, surge 5×, ppp → fff, ending 6.345 s = exactly 0.17 s before the next note at
  6.515 s; the source greyed; the card open with the right values.
- The **♪** of that crescendo: **port `basscl`, channel 2 — CURVE A**, note-on velocity 107, CC7 rising 86 → 127 under the measured
  loudness law, then **CC7 = 0 at 1285 ms, ten milliseconds before the note-off** — the secco cut, on a rotating slot (D11).
- Four notes selected on the cello, one of them 0.425 s from its neighbour: *"3 crescendos · 1 had no room"*, three greyed, one not; one
  CTRL+Z took the whole press back and un-greyed all four.
- The bar on the viola with Messiaen mode 2 from F2 (17 notes): five presses walked F2 F#2 G#2 A2 B2, each folded into the viola and
  marked *folded +1 8ve*; the count ran 17 → 12; forced to the last note it dealt it, then began **lap 2** from the top.
- ESC on a fresh crescendo removed it and restored the note; ESC on one reopened by a click only closed the card; deleting a crescendo
  the ordinary way cleared the stamp and repainted the note at full opacity.
- The paint: the crescendo filled `#C2410C` at 0.45, the greyed source `#C9A05A` at 0.15 — the same faint the trills use.

**The pure parts checked in node** — `score/tools/check_cresc_deck.js`, 27 checks, all passing: the three deck orders and their seeds,
the lap boundary (a lap holds every note once; lap 2 differs from lap 1; the same seed repeats both), random never exhausting, the fold
by octave and its `null` when no octave reaches, the end rule's three answers, and the object the C key makes.

**One thing for his ear, recorded rather than changed.** A crescendo's note-on velocity comes from the curve's **top** — the app's law
for every held note, trills included — so a ppp start attacks at its loudest velocity and CC7 shapes it down. *(The flute's three
Ordinario copies on `Fluteb` 4 · 5 · 6 are DONE: he loaded them and §275 corrected their gain to +6 dB and bypassed the EQ and the
Maximizer, so the rack needs nothing for the crescendos.)*

**Written:** `docs/CRESCENDO.md` §6 (the key, the card, the bar, the measurements) and §7; `docs/NAMING.md` 16 (`mutedBy`'s two authors,
read live) and 17 (`fromHarmony`, and the bar living in the browser); PLAN 1m steps 1–3 `done`, step 4 waiting on his ear; PLANNER NOW.

## §285. PLAN 1n opened — his own trill texture at 135.78 s MEASURED before anything is put to him

Composer, 2026-09-08: *"whats left 1n and what else then good to start 1n plan"*. What is left after 1n: **1o** (crescendo strikes),
and three tails — 1k step 7 (the piano's remainder in a chord strike, CN-52), 1i item 2 (the harmonics' CC21 shift), 0c.7 (a) (trills
and beatings still on MAIN) — plus five things standing built and untried, waiting on his ear. Written back to him; 0c.7's stale line
calling the flute copies a prerequisite corrected in the same pass (they are done, §275).

**Phase 1 begins with the data, because 1n is about a texture he already made by hand.** The section he named — *"see section beginning
at 135.72 with trills"* — is `grp-strike-40-1357` in `scores/piano-harmonics-test.json`: **46 onsets over 13.0 s** on all seven lanes,
accelerating from an 800 ms gap to 130 ms (median 229 ms), with **44 trills** laid over it. Measured, every trill against the run:

| what was measured | the result |
|---|---|
| trills starting exactly at an onset of **another** instrument | **44 / 44** (within 14 ms; median 3 ms) |
| trills starting at an onset of their **own** instrument | **0 / 44** |
| trills ending before their own instrument's next onset | **44 / 44** — never an overrun |
| that end gap | min **110 ms** · median **171 ms** · max 699 ms |
| the same instrument twice in a row | **0 / 43** |
| trill length | 1.33 s at the head of the run → **0.15 s** at its tail |

**The end gap is 1l's own number.** The median 171 ms is `endGapS` = 0.17 s, which PLAN 1l settled from the trills independently
(§255). His hand and the rule agree; nothing has to be reconciled.

**His stated selection rule does NOT describe what he did.** CN-48 says *"I was choosing the empty instrument with the shortest
available space before its next onset, but above a min say something like 2 seconds"*. Ranking, at each onset, every instrument not
striking it by the space it has before its own next onset:

| his choice ranked | count |
|---|---|
| the **shortest** space | **0 / 40** |
| the second shortest | 4 / 40 |
| third | 9 · fourth | 10 · fifth | 12 · sixth | 5 |

He consistently took the **third to fifth** roomiest, never the tightest — and he flagged this himself: *"but we should refine this
choice"*.

**What the notes show instead is a HAND-OVER.** Asking which onset the trilling instrument itself strikes:

| the trill's instrument strikes onset | count |
|---|---|
| **k − 1 (the onset just before)** | **26 / 44** |
| k − 2 · k − 3 | 4 · 1 |
| k + 2 · k + 3 · k + 4 | 4 · 8 · 5 |

So the usual gesture is: **a player strikes, and on the very next onset it begins a trill**, running until 0.17 s before its own next
strike. It cannot be k or k + 1 by construction (it would be busy). The room it gets, counted in onsets, is min 2, **median 5**, max
10 — which is why the trills shorten as the run accelerates: five onsets of room is less and less time. **The length is derived, never
chosen.**

**Put to him as topic 1:** is the hand-over what the machine should do — the player who just struck takes the next onset's long
sound — or was k − 1 an accident of working left to right by hand, with the real intention the "roomiest free instrument" his ranking
actually shows? Only he can say which of the two he was hearing.

## §286. PLAN 1n — HE RENAMES THE UNIT: an accent plus a prolonged thing, one gesture; and the three candidate selection rules simulated on his own run

Composer, 2026-09-08, answering topic 1 — and the answer reframes the item:

> *"the unit is the accent and the prolongued thing eg trill, crescendo, longtone; so the accent kicks off the long as if they were one
> unit, and with cres, I'll also have the accent be the cutoff so crescendo cutoff by accent as one unit; I tried and I think it sounds
> better when the crescendo ends at the end of the accented note, though these are short; the one that plays the long was just a
> pragmatic choice done by eye, more of an issue when there are fewer gaps, and there should be an abort strategy if there never is
> enough room otherwise no strong preference, maybe rotate to the player who played a long the longest before or to avoid a lot of short
> longs in a row or a mixture of longer and shorter longs, recommendation?"*

**Three things settled by him.**

1. **The unit is not "an onset, and a long somewhere else".** It is **an ACCENT + a PROLONGED THING as one gesture** — the accent kicks
   the long off. The prolonged thing is a **trill · a crescendo · a long tone** (a long tone is new here; CN-48 named only trills and
   crescendos).
2. **A crescendo is cut off by an accent, and that accent is part of the same unit** — *"crescendo cutoff by accent as one unit"*. He
   tried it: **the crescendo ends at the END of the accented note**, not before its start. So inside 1n a cut crescendo does NOT use
   1l's 0.17 s gap; the gap rule stays for a free-standing crescendo (1m). CN-48's mode 2 (*"precisely the end of the cres is at the end
   of the strike duration"*) is confirmed and made exact.
3. **Which player takes the long carries no intention** — *"a pragmatic choice done by eye"*. So the d = −1 hand-over found in §285 is
   an artefact of working left to right, not a rule to copy. What he does want: **an abort strategy when there is never enough room**,
   and a rule that avoids **a lot of short longs in a row** while giving **a mixture of longer and shorter**.

**The three candidate rules simulated on his own run** (`grp-strike-40-1357`: 46 onsets, 13.0 s, exactly ONE player per onset, the
whole ensemble passing a single line around), each at four length floors, the length always derived from the chosen player's room:

| rule | floor | longs | aborts | median length | under 0.4 s | per player |
|---|---|---|---|---|---|---|
| least-recently-long (roomiest breaks ties) | 0.0 | 46 | 0 | 1.25 s | 5 | 7/6/8/7/6/6/6 |
| least-recently-long | **0.3** | **43** | **3** | **1.32 s** | 2 | 6/6/7/6/6/6/6 |
| least-recently-long | 0.5 | 38 | 8 | 1.52 s | 0 | 6/5/5/6/4/6/6 |
| least-recently-long | 0.8 | 31 | 15 | 1.96 s | 0 | 5/3/4/5/4/5/5 |
| always the roomiest | 0.3 | 43 | 3 | 1.32 s | 2 | 6/6/7/6/6/6/6 |
| **his stated rule** (tightest that clears) | 0.0 | 46 | 0 | **0.13 s** | **40** | 7/8/8/7/5/5/6 |
| his stated rule | 0.3 | 46 | 0 | 0.52 s | 8 | 7/7/7/6/6/6/7 |

**Three findings.**

- **His stated rule is the one to drop.** *"The empty instrument with the shortest available space"* gives a median long of **0.13 s**
  and **40 of 46 under 0.4 s** — precisely the *"lot of short longs in a row"* he says he wants to avoid. His hand never did it either
  (§285: he took the third-to-fifth roomiest, never the tightest).
- **Least-recently-long and always-the-roomiest are indistinguishable here** — identical numbers at every floor. In a run that passes a
  single line evenly round seven players, the least-recently-long player IS the roomiest. So the rotation costs nothing on this texture
  and protects him on an uneven one, where the two part company. Take the rotation.
- **The floor is the only real dial, and 0.3 s reproduces his own density**: 43 longs and 3 aborts against the 44 longs he made by
  hand. A floor in SECONDS survives the acceleration; his CN-48 guess of *"a min say something like 2 seconds"* cannot — his own longs
  run down to 0.15 s at the tail of this run.

**Recommended, and put to him:** least-recently-long with the roomiest breaking ties; **one length floor per kind** (crescendo 0.3 s =
1l's `minS`; trill 0.5 s, because a trill needs a few oscillations to read as one; long tone 0.3 s); **abort the onset** when nothing
clears the floor, and report how many were aborted. The mixture of longer and shorter comes free (0.38 s to 5.68 s at floor 0.3) —
a seeded jitter that sometimes takes the second or third least-recently-long is offered as one dial if he wants it deliberate.

**The one question left on this topic:** the accent and the long — **the same player, or two?** Every one of his 44 trills starts on a
player that is NOT striking that onset (§285), which reads as an attack in one instrument prolonged by another — one gesture in the ear,
two players. His words *"as if they were one unit"* fit that. To be confirmed before the top line is drawn.

## §287. PLAN 1n — topic 1 CLOSED: two players, simultaneous, overlaid on a strikes pattern; and what cutting the long at an accent would cost

Composer, 2026-09-08:

> *"two players, the accent prolonged by another instrument; and the typical application would be to generate a strikes pattern like an
> accel but not necessarily and then overlay crescendos on that pattern, so for each attack in an instrument the long will start
> simultaneously in another instrument."*

**Topic 1 is closed, and it is stronger than the measurement suggested.** Not *"some onsets get a long"* but **for EVERY attack in the
pattern a long starts simultaneously in another instrument**. His 44 trills over 46 onsets (§285) were that rule minus the ones he could
not fit. The workflow is a **two-pass** one: the strikes drawer makes the pattern (an accel, or anything), then 1n **overlays** the longs
on it. So 1n is not a generator of rhythm — it is a PASS over a pattern that already exists, which settles where it lives.

**The accent notes measured:** 50–105 ms, **median 84 ms** — his *"though these are short"* is exact.

**What cutting the long at an accent would cost** (his mode 2), simulated on the same run at floor 0.3 s with least-recently-long, taking
the LAST accent whose note ends at or before the long's natural end:

| | |
|---|---|
| longs that find a cutting accent | **36 / 43** |
| the long gets shorter by | min 9 ms · **median 109 ms** · max 4504 ms |
| longs with no accent available to cut them | 7 — all at the tail of the run, where the long would otherwise run past everything on the 5 s fallback |

**So the cut is nearly free.** The accents are dense enough that snapping a long back to the nearest one costs about a tenth of a second;
the 4.5 s outlier is a fallback long being brought back inside the pattern, which is the point. Put to him as topic 2 with three
lettered options and this recommendation: **snap back to the last accent that fits** as the default, **cut at the Nth accent** as a dial,
**cut by hand** from the long's own card (1m's card, already built).

## §288. PLAN 1n — topic 2: the two modes are ONE rule run forwards or backwards; "modes" replaced by two anchors

Composer, 2026-09-08:

> *"this will generally be either or, maybe on occasion both. Let's keep that on the table as an option, but it'll generally be the
> scenario I described, or it'll be that I generate a pattern of strikes saying I want crescendos filled in that end of the strikes. And
> in some cases, I might wanna mix but then maybe I can just have a toggle where I can select certain ones and then have them revert to
> the other version. I'll take recommendations on this, but, generally, it's one or the other for a single crescendo, but not usually
> both. So I'll keep that as an option. But like I said, it'll be mostly one or the other and then in a batch, in a pattern, there might
> be a mix."*

**The reframe this forces.** CN-48's "two modes" are not *ends by room* versus *ends by an accent*. They are **WHICH END OF THE LONG IS
ANCHORED TO AN ACCENT**:

- **LAUNCHED** — the accent starts it; the far end is wherever the player's room runs out (his 135.78 texture).
- **CUT** — the accent ends it, *at the end of the accent note*; the near end is as early as the player is free (the same room rule run
  backwards).

The unanchored end is always the room. So there is **one rule, run forwards or backwards** — not two mechanisms.

**Measured, on the same run** (46 attacks, floor 0.3 s, least-recently-long, one long per attack). The two are mirror images:

| pass | longs | aborts | length min / median / max | per player |
|---|---|---|---|---|
| LAUNCH | 43 | 3 | 0.38 / **1.32** / 5.68 s | 6/6/7/6/6/6/6 |
| CUT | 43 | 3 | 0.39 / **1.36** / 5.10 s | 6/5/7/6/6/7/6 |

Same density, same spread, same even distribution. **One implementation serves both**, and the cut pass costs nothing extra.

**Recommended, and put to him: do not build "modes" — build TWO ANCHORS on each long.** Every long carries `launchedBy` and `cutBy`;
either may hold an accent's id, or both, or neither:

| `launchedBy` | `cutBy` | what it is |
|---|---|---|
| set | — | his scenario 1: the accent kicks it off, the room ends it |
| — | set | his scenario 2: the crescendo swells into the strike and stops at the end of that note |
| set | set | **"both"**, his occasional case — the long spans accent to accent; it can fail the floor, and then it aborts |
| — | — | a free-standing long (what 1m's C key already makes) |

Because the anchors are data rather than a mode, three things he asked for follow at no cost:

1. **The batch** is generated by saying which anchor to set.
2. **The per-long flip** — select one, press the toggle, and its anchor moves to the other end; nothing is regenerated, and the rest of
   the batch is untouched. It goes on **1m's crescendo card**, which is already the editor of a live crescendo.
3. **The mix inside one batch** — one **seeded proportion** ("30 % cut"), so a pattern can be mostly one with a scatter of the other
   without hand-picking; the per-long flip is then for touching up, not for building the mix.

**One detail settled by his own words:** in CUT the long ends at the **END** of the accent note, so it overlaps that accent by the
accent's own length — measured at **median 84 ms** on his run (§287). That overlap IS the cut-off effect, and it is free because the two
are different players.

**Still owed by him:** a yes or no on §286's selection recommendation (least-recently-long, roomiest breaks ties, floor 0.3 s per kind,
abort when nothing clears).

## §289. PLAN 1n — topic 2 CLOSED (anchors, all three kinds, the selection seeded); topic 3 opened: the pitches, and the 5-note chord always in the air

Composer, 2026-09-08: *"1 yes with seed option, 2 yes and trills and eventually long tone has same"*.

**Both settled.**

1. **The selection rule is adopted** — least-recently-long, roomiest breaks ties, a length floor per kind, abort the attack when nothing
   clears it — **with a SEED**, so a pass repeats exactly and a re-deal is a new number, as the strikes drawer and the harmony bar
   already work.
2. **Anchors, not modes** — and **the same for all three kinds**: a trill is launched or cut by an accent exactly as a crescendo is,
   and the long tone will be when it arrives. *"eventually long tone"* — the long tone is a later addition, so 1n's build is trills and
   crescendos with the third kind's seat left in the data.

**Topic 3 opened: the pitches.** His CN-48 asked for *"this/last pitch of the corresponding strike or next pitch of strike; also any of
the harmonies from the harmony drawer, distributed across the sequence of trills/cres and same options of the strikes, reshuffle, repeat
in order, etc these will include all the ones we identified in the updated morph panel as well"*.

**Half of it is already built.** The second family — a harmony from the drawer, every sonority the morph panel knows, dealt in turn or
shuffled or random from a seed — is **PLAN 1m's harmony bar**, finished and verified on 2026-09-08 (§284): `MorphPanel.pitchOptionGroups`
/ `sonorityOf` over 163 sonorities, `Cresc.deckNext` for the order, `Cresc.foldInto` for the octave fold. 1n reuses it whole rather than
building a second pitch menu. The first family — the pitch of the corresponding strike, or the one before or after it — is new but small:
read a named accent's `sonifyNote` and fold it into the long's player's range with the same call.

**The measurement that makes the real question concrete.** Simulating the launched pass on his run and sampling every 20 ms, the longs
overlap heavily:

| longs sounding at once | share of the time |
|---|---|
| 1 | 6 % |
| 2 | 5 % |
| 3 | 5 % |
| 4 | 10 % |
| **5** | **49 %** |
| **6** | **24 %** |

**Five or six of the seven players are sustaining for 73 % of the passage.** So the longs are not a line of separate events — they are a
**standing five-note chord that changes one note at a time**, under the accents.

**Which raises the one question only he can answer**, put to him as topic 3: when the pitches come from a harmony, is the sonority dealt
**SEQUENTIALLY** — pitch *n* to long *n*, lapping round, which is what 1m's deck does today and what a 17-note set over 43 longs would do
2½ times — or **VERTICALLY**, so that the five or six longs sounding together at any instant spell the sonority, the deck choosing the
note the chord is currently missing? The first is a melody of entries; the second is a harmony that breathes. They sound quite different,
and the deck is small either way.

## §290. PLAN 1n — topic 3: the pitch is a STRATEGY set at three scopes, and 1n's whole control shape is now one pattern

Composer, 2026-09-08:

> *"best different strategies and efficient access. So it could be [pitches] from the same strike harmony in order or shuffled or each a
> minor second offset from the previous [or] a fifth offset, etcetera, etcetera. or from a totally different pitch set. I just want to be
> able to choose from a variety of options and a variety of shuffles. And then either they [im]pose it on all the crescendos or sections
> of them. and then also be able to change individually, but in the same way. So select one and then say, this one should pull its pitch
> from this pitch set."*

**He answered neither (a) nor (b) but the question behind them: the pitch is a STRATEGY, and what matters is the range of strategies and
how fast he can reach one.** Sequential and vertical are two entries in a menu, not a fork in the design.

**The control shape he described is the one topic 2 already produced**, and that is worth naming, because it now governs the whole item:
**every property of a long is set at THREE SCOPES from ONE menu** — the whole pass · a selection of longs · a single long. The anchor
toggle (§288) is that; the pitch strategy is that; the kind will be that. One mechanism, learned once.

**The vocabulary proposed to him — four families, each taking the same order menu:**

| family | the pitch of each long |
|---|---|
| **from the pattern** | the corresponding accent's own pitch · the accent before it · the accent after it · the pattern's whole collection, dealt |
| **from a sonority** | any of the 163 sets 1m's harmony bar already reaches (his kept sets, starters, the models' sets, stacks and Messiaen modes from a root, strikes, blasts, chord shapes) |
| **a chain** | each pitch a fixed interval from the previous long's — his *"a minor second offset from the previous or a fifth offset"* — the interval, the direction (up · down · alternating), and a starting pitch (the first accent's by default) |
| **vertical** | the note the currently sounding longs are missing from a chosen sonority, so the standing five-note chord (§289: 5 or 6 longs sound for 73 % of the passage) always spells it |

**The order**, for any family that deals from a collection: **in turn · shuffled to completion then reshuffled · random**, seeded — 1k's
deck, already built and already in 1n through the selection rule.

**One consequence of the chain flagged to him:** a minor-second chain over 43 longs walks 43 semitones — three and a half octaves — so
the octave fold (`Cresc.foldInto`, 1k's rule) is doing heavy work and the chain will read as a slow spiral rather than a rise. That may
be exactly what he wants; it is worth knowing before he hears it.

**Reuse, not new building.** The sonority family is 1m's harmony bar whole. The order is 1k's deck. The fold is 1k's rule. Genuinely new
in this topic: reading a named accent's pitch, the chain, and the vertical filter — three small pure functions.

## §291. PLAN 1n — topic 3 closed; topic 4 (which kind goes where) opened on a measurement: the rule offers longer longs than he ever wrote

Composer, 2026-09-08: *"good"* to the pitch vocabulary as proposed — four families (from the pattern · from a sonority · a chain · vertical),
the same seeded order menu, set at the three scopes. **Topic 3 closed.**

**Topic 4, the kind, opened with the length distribution**, because the length is derived and the three kinds do not want the same lengths.
The 43 longs the adopted rule produces on his run, bucketed, against the 44 trills he actually wrote there:

| length | the rule's longs | |
|---|---|---|
| 0.0 – 0.5 s | 5 | |
| 0.5 – 1.0 s | 10 | |
| 1.0 – 1.5 s | 9 | |
| 1.5 – 2.0 s | 4 | |
| 2.0 – 3.0 s | 5 | |
| **over 3 s** | **10** | |

**His own trills: min 0.15 s · median 0.95 s · max 2.60 s — not one over 3 s.** The rule offers ten, because least-recently-long takes the
roomiest while his hand took the third-to-fifth roomiest (§285). That is not a defect in the rule; it is the **kind** asking to be chosen
by the length. A three-second trill is a great deal of trill; a three-second crescendo is ideal, and a long tone wants longer still.

**Put to him, three ways to set the kind, all at the usual three scopes:**

- **(a) one kind for the whole pass** — what he did at 135.78 (all trills). Simplest, and the mix comes only from hand-picking afterwards.
- **(b) a seeded proportion** — 60 / 40 and so on, scattered through the pass; the same shape as the anchor mix agreed in §288.
- **(c) BY ROOM — recommended** — the derived length chooses: under a threshold a trill, over it a crescendo, and later the long tone above
  a second threshold. It reproduces his own instinct without his having to state it: his trills stop at 2.6 s, so a first threshold near
  there hands the ten long ones to crescendos and leaves the 28 shorter ones as trills.

(b) and (c) are not exclusive — (c) can set the kind and (b) jitter a proportion of them, which is one extra number if he wants it.

**Also read back to him rather than asked, for correction:** 1n's home is the **strikes drawer**, because he described the workflow as two
passes — *"generate a strikes pattern like an accel but not necessarily and then overlay crescendos on that pattern"* — and the drawer is
what makes the patterns (PLAN 1k). So 1n is a second pass ON a strike group, not a new generator with its own rhythm.

## §292. PLAN 1n — phase 1 CLOSED in four topics; the top line put to him

Composer, 2026-09-08: *"Yes. Correct on one n. strikes drawer. and lungs will generally be homogeneous. The section I'm planning will be
all crescendos. So I should have the option of mix and some of the strategies you recommend. but I'll usually want to insert one kind or
another."*

**Topic 4 settled, and the default is the plain one:** a pass inserts **ONE KIND**. The proportion mix and the by-room rule stay as
options he can reach, but they are not what he will usually do — and the section he is composing next is **all crescendos**. **1n lives in
the STRIKES DRAWER**, confirmed: a second pass over a strike group, never a generator of rhythm.

**Phase 1 complete. What the four topics settled:**

1. **The unit** (§287) — an accent and a prolonged thing, **two players**, the long starting simultaneously with the attack in another
   instrument; **for every attack in the pattern**; a two-pass workflow, the drawer's pattern first, the overlay second.
2. **The anchors** (§288) — not modes but two fields, `launchedBy` and `cutBy`: launched (the room ends it) · cut (the room decides how
   early it began; it ends at the END of the accent note, overlapping it by ~84 ms) · both · neither. Measured as mirror images: 43 longs
   and 3 aborts either way. **The selection rule adopted with a seed:** least-recently-long, roomiest breaks ties, a length floor per kind,
   abort the attack when nothing clears it. All three kinds share the anchors.
3. **The pitches** (§290, CN-55) — a **strategy**, not a rule: from the pattern (this accent · the one before · the one after · the whole
   collection dealt) · from a sonority (1m's harmony bar whole) · a chain (a fixed interval from the previous long) · vertical (the note
   the sounding chord is missing). Each with the seeded order menu.
4. **The kind** (§291, this entry) — **one kind per pass by default**; the seeded proportion and the by-room threshold available.

**And the shape that governs the whole item:** every property of a long — anchor, pitch strategy, kind — is set at **THREE SCOPES from one
menu: the whole pass · a selection · a single long.**

**THE TOP LINE, put to him (phase 2):**

1. **The overlay engine** — a strike pattern in, a set of longs out: the selection rule with its seed, the anchors, the length derived
   forwards or backwards, the floor per kind, the abort, and the kind rule. Pure.
2. **The pitch strategies** — the four families and their seeded orders, reusing 1m's harmony bar and 1k's deck and octave fold. Pure.
3. **The pass in the strikes drawer** — choosing the strike group, the settings, generate · hear · insert, the longs written as one group.
4. **The three scopes** — the whole pass, a selection, a single long: the anchor toggle, the pitch source and the kind on 1m's crescendo
   card.
5. **Verify and document** — the node checks, the walk on a copy, the documents; then his first filled section, which is all crescendos.

## §293. PLAN 1n step 1 — his two edge questions turn the anchor from a POSITION into a REFERENCE

Composer, 2026-09-08, on step 1 as put:

> *"how are we accounting for the swab in edge cases? So the first onset in a group is okay for attack by… but what if I want cut by?
> Does it then add a crescendo before the first attack? and then I don't think I thought this through enough. the cut can be cut by any
> attack in any instrument. so are we doing the next strike to cut or how about if I wanted to extend it to a different strike to cut?"*

**He is right on the second, and it is a real hole in step 1 as I put it.** I had quietly assumed the cutting accent is *the attack this
long belongs to* — an index, not a choice. His question makes the anchor what it should have been from the start: **an accent's ID, a
reference to a particular attack, not a position in the sequence.** The engine's default picks which accent; he can re-point either
anchor at any other attack, at the three scopes like everything else in 1n. *"Extend it to a different strike to cut"* is then one edit,
not a mode.

**Consequences written into step 1:**

- **the anchor is an accent id.** `launchedBy` and `cutBy` each hold the id of an attack in the strike group. The default in cut mode is
  the attack itself — one long per attack, symmetric with launch mode — but nothing in the engine depends on that.
- **re-pointing re-checks.** Moving an anchor re-derives the length, re-tests the floor and the player's room, and **says so** if it does
  not fit, rather than silently shrinking.
- **the cutting accent may be on ANY instrument except the long's own.** A player cannot strike while sustaining, and his rule has the
  long ending at the END of the accent note (they overlap by the accent's ~84 ms), which requires two players.
- **noted for later, not built:** cut by the long's OWN player's next attack — swell, then hit, one instrument. It needs the 0.17 s gap
  instead of the overlap, so it is a different shape; recorded here so it is not lost.

**His first question answered with the measurement.** In cut mode a long must begin before its cutting accent, so yes, the pass reaches
back before the pattern — that is the shape of the mode, not an edge case to avoid. Simulated on his run (the pattern starts at 135.78 s,
the room rule run backwards over the WHOLE score, not just the group):

| | |
|---|---|
| longs made / aborted | 43 / 3 |
| longs that begin **before** the pattern | **4** |
| by how much | 0.53 – 0.60 s (Pno, Fl, Vn1, Va) |
| earliest start of the pass | 135.18 s |

They stop where they do because the **previous strike group** ended around 135.03 s and the 150 ms rest follows it — the room rule
already handles the overhang, with no special case. Two things it does need:

- **a cap backwards** for a player with nothing at all before it, else the long runs back to zero: 1l's 5 s fallback, run backwards.
- **a switch, *keep inside the pattern***, for when he wants the fill to sit exactly within the strike group's own span: a long that
  would reach back is clipped to the pattern's first attack, and aborts if that puts it under the floor.

## §294. PLAN 1n — step 1 written into the plan; step 2 (the pitch strategies) agreed; step 3 put to him

Composer, 2026-09-08: *"good"* to step 1 with the anchor turned into an accent reference (§293), and *"good"* to step 2 as put. Both are
written into PLAN 1n.

**Step 2 is almost entirely reuse, which is the point of having built 1m first.** The sonority family IS 1m's harmony bar
(`MorphPanel.pitchOptionGroups` / `sonorityOf`, 163 sets); the order IS 1k's deck (`Cresc.deckNext`); the octave fold IS 1k's rule
(`Cresc.foldInto`). Genuinely new in the whole step: reading a named accent's pitch, the interval chain, and the vertical filter — three
small pure functions. **A pitch that no octave reaches aborts the long** and is counted with step 1's aborts, so nothing is ever dropped
in silence.

**One thing recorded rather than decided:** a strategy gives a trill's LOWER note only; its interval stays the trill tool's own setting.
Measured for him — his 44 trills at 135.78 s were every one a semitone, not CN-22's default whole step.

**Step 3 put to him:** the pass in the strikes drawer — where it sits (a mode beside notes and chords, 1k's mixin idiom), choosing the
strike group FROM THE OPEN SCORE rather than the database so a dragged or stretched group fills correctly, the settings at pass scope,
**Generate** (runs steps 1 and 2 and shows the result without writing), **Hear** (through the real routes, the D11 curve channels),
**Insert** (as its own `grp-fill-…` group with a META shape, the drawer's replace-at-the-same-time rule), and the take that reloads
*as it was* or *as settings* exactly as 1k's chord takes do.

## §295. PLAN 1n — step 3 (the pass in the strikes drawer) agreed and written; step 4 put to him

Composer, 2026-09-08: *"good"* to step 3 as put. Written into PLAN 1n.

**The step is deliberately parasitic on 1k.** It is a MODE of the strikes drawer built the way chords mode was — a mixin on the drawer —
so the screen, the cursor, the span, the takes, the replace-at-the-same-time rule and the insert idiom are all inherited rather than
rebuilt. The one thing chosen rather than inherited: **the pattern is read from the OPEN SCORE, not from `bank/scattered_strikes.json`**,
because a strike group he has already dragged or stretched must fill where it actually sits, not where the database remembers it.

**Step 4 put to him: the three scopes**, the shape phase 1 named (§288, §290, CN-55) — every property of a long set from one menu at the
whole pass, a selection, or a single long. Its own to-dos: the 1n row on **1m's crescendo card** for a single long (the anchor and which
accent, the pitch strategy, the kind); the same menu applied to a **selection** under one undo; the pass's own settings, with a re-apply
that changes one property without re-dealing everything; **re-pointing an anchor by clicking the attack** he wants, the room and floor
re-checked and refused with a reason; **changing one long's kind** (a crescendo becomes a trill and back — the object changes between a
`waveCurve` and a trill zone while the anchors and the pitch survive); and the **flip** he asked for in CN-54, launched ↔ cut on a
selection with nothing else regenerated.

**One question inside step 4, answered by reuse rather than invention:** what happens to a long he has edited by hand when the pass is
generated again? **1k already answers it** — a manual onset there is *pinned and flagged, never lowered*. So a hand-touched long is
PINNED the same way: Generate leaves it alone and says how many it kept. The idiom exists; 1n does not need a second one.

## §296. PLAN 1n — step 4 (the three scopes) agreed and written; step 5, the last, put to him

Composer, 2026-09-08: *"good"* to step 4 as put. Written into PLAN 1n.

**The step is where phase 1's shape becomes a control.** Every property of a long is reached at the whole pass, a selection, or a single
long, from one menu — and the single-long end of it is **1m's crescendo card**, already built and already the editor of a live crescendo.
Nothing new is invented for the per-long edit; a row is added to a card that exists.

**Two things settled inside it by reuse rather than by decision.** A hand-edited long is **PINNED** exactly as 1k pins a manual onset
(*pinned and flagged, never lowered*), so a re-Generate leaves it and reports how many it kept — the repo already had the idiom. And
re-pointing an anchor **refuses with a reason** rather than shrinking, which is 1l's *"no room is an answer"* applied to an edit rather
than to a creation.

**Step 5 put to him, the last:** verify and document — the node checks for the pure parts (the mirror test on his own run, the seed
repeatability, and the invariants: never the striking player, no two longs overlapping on one player, every long clearing its floor,
every abort counted); the walk on a `zz-ai-` copy with real events and the decoded MIDI (choose the group, generate, hear, insert; the
crescendos on the D11 curve channels; the three scopes; the flip; a refused re-point; a re-generate keeping the pinned longs; undo
through all of it); the documents — **`docs/STRIKES_TOOL.md` gains 1n as its own section**, since 1n is a mode of that drawer exactly as
1k's chords mode is, with `docs/CRESCENDO.md` cross-referencing it, plus NAMING for the `grp-fill-…` group and the long's provenance
fields, PLAN 1n's statuses, PLANNER NOW, the journal §2 and a title on every new control; and then **his first filled section, which is
all crescendos**, his verdicts to the documents and NITS, and then **1o planned**.

## §300. PLAN 1n steps 1–4 BUILT and walked; the four defects the walk found

Composer, 2026-09-08: *"good, build 1n as much as you can independently"*. Steps 1–4 built, step 5's checks and documents done; what is
left is his ear.

**What was built.**

- **Step 1 — `score/public/fill.js`** (pure). `attacksOf` reads one strike group FROM THE SCORE; `roomForward` / `roomBackward` are one
  rule in two directions; `windowFree` serves 'both' and a re-point; `deal` gives one long per attack — least-recently-long with the
  roomiest breaking ties, seeded, never the striking player, never one already sounding, a floor per kind, and an **abort with a reason**
  when nothing clears it; `repoint` moves an anchor and refuses rather than shrink; `summarize` is the readout.
- **Step 2 — `score/public/fill_pitch.js`** (pure). Seven families over 1k's seeded deck, folded by 1k's rule, each long carrying
  `{ family, source, raw, fold, order, seed, lap }`. The sonority family IS 1m's harmony bar; nothing was rebuilt.
- **Step 3 — `score/public/fill_ui.js`**, a mixin on the drawer exactly as chords mode is: a third mode button, two settings rows, a
  per-player preview of the pattern with its longs, and **Generate · Hear · Insert**. Insert writes `grp-fill-…` with its own META shape.
- **Step 4 — the three scopes.** `flipSelectedFills` and the **F** key (a selection, one undo), `finishRepoint` and `crescRoomEvents`
  (composer.html), and a **fill row on 1m's crescendo card** — who launched it, who cuts it, *flip*, *re-point…*.

**THE FOUR DEFECTS THE WALK FOUND**, all fixed, and the second is the one worth remembering:

1. **A chain ran off the keyboard.** Adding an interval over and over walks without bound — a fifth chain over 39 longs covers 273
   semitones — and `Cresc.foldInto` gives up beyond eight octaves, so 20 of 39 longs were aborted as out of range. The chain's running
   pitch is now **wrapped by octaves into a band CENTRED on its start**: the interval survives in pitch class, the register comes from
   the fold, and the result is the spiral the idea always was. Centred, not above, so a downward or alternating chain has room below it.
2. **The room functions assumed their options were already merged.** `deal` merges `DEFAULTS`, but the card's flip and the re-point call
   `roomForward` / `roomBackward` / `windowFree` directly with a bare `{}` — so `O.restMs`, `O.fallbackS` and `O.endGapS` were
   `undefined`, every arithmetic result was `NaN`, and **every room came back null**: the card's flip refused everything with "that
   player is busy on the other side", which was a lie. Each function merges the defaults itself now. *The lesson: a pure function that is
   reachable from more than one caller must not depend on its caller having merged its options.*
3. **A re-Generate saw its own last pass.** The deal read every event in the score including the fill it was about to replace, so the
   second Generate found almost no free player (5 longs became 1). It now ignores the fill group it is about to replace — **except its
   PINNED longs**, which must still occupy their player, or a hand-flipped long and a fresh one overlap on the same instrument (measured:
   they did, by 50 ms, until the exception was added).
4. **The performance note said "(typed)"** on every filled crescendo, because the length is handed to `Cresc.make`. It now says what
   actually ended it: *to the next sound* · *cut by an accent* · *no next sound* · *clipped to the pattern*.

**Verified in the running app**, on a `zz-ai-` copy of his piece, with real key and mouse events:

- fill mode appears beside notes and chords; the notes-mode foot is put away while it is on (32 of 35 foot groups);
- on `grp-strike-45-1664` (12 attacks): **8 longs, 4 aborted** (2 no free player, 2 under the floor), inserted as
  `grp-fill-45-1664-1664` with one META shape, in the morph orange, secco on, each carrying its provenance and its fold;
- **cut** on the same pattern: 12 longs, none aborted, **every one ending exactly at the end of its accent note**, and beginning ~3 s
  earlier — reaching back before the pattern, as the mode's shape requires;
- **by room**: 2 trills + 3 crescendos, the short ones trills and the long ones crescendos, split at 2.5 s;
- a **trill** inserted as a real trill zone with its pitch, its interval and a 5-note snippet, in the fill group with its provenance;
- **F** flipped two selected longs from launched to cut (166.50→167.09 became 163.62→166.55), both pinned, and one CTRL+Z put them back;
- the card's **flip** and **re-point** refused two moves and named why, both honest: the flip had 0.11 s of room after that player's own
  note at 166.55 and the 150 ms rest, and the re-point would have run 100 ms past the 0.17 s gap before that player's next attack;
- a re-Generate kept the pinned long, reported *"1 hand-edited kept"*, and left **no two longs overlapping on any player**.

**And the honest limit of the walk:** the embedded pane coalesces `setTimeout` into 1-second buckets, so Hear's firing could not be timed
there. The SCHEDULE was verified instead — the attacks at 260, 387, 515 … 1660 ms and the longs at their own starts, with the CC7 ramp
steps between — and it is the same `setTimeout` mechanism the drawer's own Hear has used since 1k.

**Also measured and recorded, not decided:** his own hand let a player begin a trill **49 ms** after its last note ended, and 16 of his
44 did so under 150 ms. The re-entry gap is therefore its own setting, defaulting to the rule's 150 ms (which fills 39 of his 46
attacks) with 0 ms filling 43. He lowers it when the texture is that dense.

**Written:** `docs/STRIKES_TOOL.md` §Y (the whole tool, the measurements, the defects), `docs/NAMING.md` 18 (the fill group, the anchors
as attack ids, `pinned`), `docs/CRESCENDO.md` §7's 1n line, PLAN 1n's statuses, PLANNER NOW, the journal §2. 81 checks in
`score/tools/check_fill.js`, all passing.

## §301. PLAN 1o opened (crescendo strikes) — three of his four asks were already built; the fourth measured, and it governs everything

Composer, 2026-09-08: *"1o plan pls"*. Phase 1 begins by reading his own CN-48 list against what the crescendo suite has since built:

> *"like the recent strike chords/and-or strikes but instead of single attack, they will be crescendos, help me walk thru what needs to
> be changed for the new articulation, change default instrument, ordinaro or senza vibrato velocity, the spacing/overlap rules need to
> adjust next articulation for any one instrument will be 150ms after end of crescendo; others?"*

**Three of the four are done, and were done for other reasons:**

| his ask | where it already lives |
|---|---|
| *"change default instrument, ordinaro or senza vibrato velocity"* | the recipe's `ordinary` field (PLAN 1g item 4, confirmed with him at 1m): flute `ord` · bass clarinet `senza_vel` · the four strings `senza_vel` · piano `main` |
| *"next articulation … 150ms after end of crescendo"* | PLAN 1l step 3, and **1k's chord engine already measures its rest from the END** — `soundMs` + `markEnd(lane, t) = t + soundMs` |
| the crescendo itself | PLAN 1l's object, and 1n now writes crescendos into the score wholesale |

**So the mechanical change to 1k is one line of intent:** `soundMs` stops being 140 ms and becomes the crescendo's length. The engine's
own comment has anticipated it since 1k was written (*"a crescendo of 1o will pass its own length"*).

**His *"others?"* is the whole of it, and it is the LENGTH.** Measured by driving `StrikeChords.deal` itself — six players (the piano out
of the dealing, CN-34), 2–4 per onset, 20 onsets, the 150 ms rest from the end:

| the sound's length | the onset gap it needs to hold | at a 250 ms gap it serves |
|---|---|---|
| **0.14 s** (an attack, as 1k deals today) | 400 ms | 20 / 20 onsets, 54 notes |
| **0.70 s** | 900 ms | 14 / 20, 30 notes, 6 flagged |
| **1.50 s** | 2000 ms | **8 / 20**, 18 notes, 13 flagged |
| **3.00 s** | more than 2000 ms | 5 / 20, 12 notes, 16 flagged |

The rule of thumb that falls out: **the onset gap must be about the sound's length × 1.3.** Below it the count thins first (the machine
lowers 2–4 to whatever is free, §237's rule) and then breaks (flagged: even the minimum cannot be met).

**What that means for the piece, stated rather than fixed:** a sequence of crescendo strikes is **five to ten times sparser** than the
same sequence of attacks, or its chords are much thinner. That is what the material is, not a defect — and it is why the length cannot
simply be typed and left.

**Also named in phase 1, because it is the difference between 1o and 1n:** in 1n an accent in one player is prolonged by a long in
ANOTHER; the attacks stay attacks. In 1o there is no accent — **the dealt chord notes themselves are the crescendos**, so a "count" of
2–4 is how many swells begin together.

**Topic 1 put to him:** where does a crescendo strike's length come from — (a) typed, one for the pass; (b) **derived from the room**, 1n's
own rule (to 0.17 s before that player's next sound), recommended, because it is what makes the density self-solving and it points 1o at
`fill.js` rather than a second engine; (c) to the next onset of the sequence, so the swells shingle.

## §302. PLAN 1o — his question corrects the topic: the length is an INPUT to the deal, not an output, and that is the only reason it needs deciding

Composer, 2026-09-08, on topic 1 as I put it:

> *"but what is the context? So we've established, for example, that there'll be an accent and a crescendo with that accent. And then it
> ends at a certain gap before that same player holding the crescendo needs to play the next note. So what's the context for these swells?
> Why do we need to determine a length? or is there certain contexts that we have to decide a length for?"*

**He is right, and the question is better than the one I asked.** I put three ways to choose a length without saying why a length has to
be chosen at all — when 1n, built the same day, chooses none.

**Why 1n needs no length decision.** Its pattern ALREADY EXISTS in the score. *"When is the viola next needed?"* is a fact to look up, so
the room is knowable and the length falls out of it. Nothing to decide.

**Why 1o is different, and it is a genuine circularity.** In 1o the pattern does not exist yet — **the deal is what creates it**. And
`StrikeChords.deal` has to know how long a sound occupies a player in order to work out who is free (`soundMs` feeds `markEnd(lane, t) =
t + soundMs`, which is what `wait()` then tests against the 150 ms rest):

```
to know who is free   → you must know how long a swell lasts
to know how long      → you must know when that player is next needed
to know that          → you must have dealt
```

So the length is an **INPUT** to the deal, not something readable afterwards. That is the whole of why 1o needs the decision and 1n did
not, and it is what topic 1 should have said.

**Which splits the topic in two, and both halves are real:**

1. **What does the deal ASSUME a swell occupies?** This is the number that sets how dense the result can be — the §301 table
   (0.14 s needs 400 ms gaps · 0.70 s needs 900 ms · 1.50 s needs 2000 ms; roughly gap = length × 1.3). Some number must go in; there is
   no way round it.
2. **Once dealt, is each swell then STRETCHED to its player's real next turn?** After the deal, who-plays-when IS a fact, so 1n's room
   rule becomes available. **No** → every swell is the assumed length, even and predictable. **Yes** → they breathe as 1n's do, a player
   not needed for a while holding longer.

**The recommendation, restated:** **one number for the spacing, then stretch to the room.** The number is his control over density; the
lengths come out uneven and alive. A swell whose player is never dealt again takes 1l's 5 s fallback, exactly as in 1n.

*(The AI's own note: my first framing of topic 1 conflated the two — it offered "typed" and "derived from the room" as alternatives when
they are in fact the two halves of one answer, done in order. His question is what separated them.)*

## §303. PLAN 1o — the scope widens (CN-56) and the duration is measured: length ÷ gap IS the density

Composer, 2026-09-08 (CN-56, verbatim in COMPOSITION_NOTES): 1o is what he originally set out to do, the swells REPLACE the strikes, and
**every rhythm the drawer can make is in scope** — the acceleration and its curves, even, random, and the recorded strike *as played* or
*spaced out*, which turns a strike's own irregular attack pattern into a **scattered onset of crescendos**. Plus one thing the drawer
does not have: **TIME CONTAINERS** — a set of numbers he types, weighted, rolled to fill an overall duration; *"worth abstracting into its
own module"* eventually, because *"this is a type of technique I do a lot of"*, but not now. The dealing is 1k's unchanged: a count range
per entry, the round robin, collisions avoided, a manual override available.

**THE MEASUREMENT that answers his duration question.** Driving `StrikeChords.deal` over 40 onsets, six players, 2–4 voices per entry, and
sampling how many voices actually sound at any instant:

| gap | length | voices sounding (measured) | formula `count × length ÷ gap` | flagged |
|---|---|---|---|---|
| 500 ms | 0.5 s | 2.50 | 3 | 0 |
| 500 ms | 1.0 s | 3.95 | 6 | 2 |
| 500 ms | 2.0 s | 4.75 | 6 | 17 |
| 1000 ms | 1.0 s | 2.50 | 3 | 0 |
| 1000 ms | 2.0 s | 3.95 | 6 | 2 |
| 1000 ms | 3.0 s | 4.45 | 6 | 12 |
| 2000 ms | 2.0 s | 2.50 | 3 | 0 |
| 2000 ms | 3.0 s | 3.73 | 4.5 | 0 |

**The finding, and it is the whole answer: the RATIO length ÷ gap is the density dial, and nothing else is.**

| length ÷ gap | voices sounding | what it is |
|---|---|---|
| 0.5 | ~1.4 | sparse — real silence between entries |
| **1** | **~2.5** | comfortable — always sounding, still breathing |
| 2 | ~4 | thick — a few entries begin to thin |
| 3 | ~4.5–5 | saturated, and 12–23 of 40 entries cannot be met |

With six players at 2–4 per entry the ceiling is about **ratio 2**. The formula over-predicts once the ensemble saturates, which is
exactly where the flags appear — so the flag count is the honest signal, not the formula.

**Six ways the duration could be set, put to him with (C) recommended:** a typed length · a rolled range · **a multiple of the local gap**
· to the player's next turn (a continuous wall, no silence) · a share of that room · derived from a target thickness. (C) is recommended
because his main case is an ACCELERATION: a fixed length jams as the gaps close, while a multiple of the gap shortens with the run —
which is what his own hand did with the trills at 135.78 s (1.33 s → 0.15 s as the run accelerated, §285). And the ratio is the density,
so the one number he turns is the thing he actually hears.

## §304. PLAN 1o — the duration settled (C, a multiple of the local gap); topic 2 put: 1o is a SOUND SWITCH, not a fourth drawer mode

Composer, 2026-09-08: *"c good"*.

**Settled: a crescendo strike's length is a MULTIPLE OF THE LOCAL GAP**, computed at each entry from the gap right there — so it follows an
accelerando by itself, shortening as the run speeds up, which is exactly what his own hand did with the trills at 135.78 s (1.33 s →
0.15 s, §285). The multiplier IS the density dial (§303: length ÷ gap ≈ 1 gives about 2.5 voices sounding, ≈ 2 gives about 4, ≈ 3
saturates and starts failing entries). A typed length stays available; the predicted thickness and the flag count are a READOUT beside the
multiplier, not a mode of their own.

**The drawer's rhythm vocabulary read, and it already holds everything he asked for** (`strike_drawer.js` line 901): *as played · even ·
front-loaded · back-loaded · centre · edges · random · accel · round robin*, with `timeX` (the time stretch that gives his *"as played or
slightly more spaced out"*), `amount`, `jitterMs`, `reverse`, `rotate` and a seed. **The one thing genuinely new in CN-56 is TIME
CONTAINERS.**

**Topic 2 put to him: where 1o lives.** The drawer now has `mode: notes | chords | fill`. Two ways to add crescendo strikes:

- **(a) a fourth mode**, *swells*, beside them. A clean box, but it duplicates the whole notes/chords screen for the sake of one changed
  fact about the sound.
- **(b) RECOMMENDED — a SOUND SWITCH, orthogonal to the mode**: `sound: attack | crescendo`. Then *notes + crescendo* is a single line of
  swells, *chords + crescendo* is 1o proper — chords of swells — and every rhythm shape, voicing, order, span, take and insert already in
  the drawer works for both without being written twice. It is also truer to his own words (*"instead of a strike or short note, it'd be
  the onset of the crescendos"*): the machinery is the same, the sound is what changes.

Under (b) the switch changes exactly four things: the dealt sound's length (140 ms → the multiplier rule), what `soundMs` feeds the deal,
what is written into the score (a short `waveCurve` → a 1l crescendo), and the readout (the density and the flags). **And TIME CONTAINERS
becomes one more entry in the existing `shape` menu**, so it serves attacks and swells, notes and chords alike, rather than belonging to
1o.

## §305. PLAN 1o — the sound switch adopted; topic 3 put: the TIME CONTAINER generator, rolled on his own example

Composer, 2026-09-08: *"b good"* — **1o is a SOUND SWITCH (`attack | crescendo`), orthogonal to the drawer's mode**, not a fourth mode.
So *chords + crescendo* IS 1o, every rhythm shape and voicing and take already in the drawer serves both, nothing is written twice, and
**TIME CONTAINERS joins the existing `shape` menu** where it serves short notes as well as swells.

**Topic 3: the container generator, stated back and rolled on his own example.** His sketch (CN-56): *"a random choose from a set. Maybe I
give numbers like two five seven fifteen … you can have random waiting. So twenty percent fifteen and spread the eighty percent out among
the rest … something like a duration maybe then overall, and then we roll for a set of time containers to fill that duration."*

**Read back as:** a SET of numbers he types · an optional WEIGHT beside any of them, the ones without a weight sharing what is left
equally · rolled one after another until an overall DURATION is filled · seeded, so a roll repeats.

**Rolled, with his own set — 2 5 7 15 seconds, 15 weighted at 20 %, the other three sharing 26.7 % each (mean container 6.73 s), filling
60 s:**

| seed | the roll | total |
|---|---|---|
| 1 | 15 · 7 · 7 · 7 · 5 · 7 · 2 · 2 | 52 s in 8 containers |
| 2 | 15 · 5 · 15 · 7 · 2 · 7 | 51 s in 6 containers |
| 3 | 7 · 2 · 7 · 7 · 5 · 2 · 2 · 5 · 2 · 7 · 5 · 5 · 2 | 58 s in 13 containers |

The character changes completely with the seed — 6 containers against 13 over the same span — which is the weighting doing its work, and
is why the seed matters as much here as in the deck.

**And the consequence worth naming, because it links topic 3 back to topic 1:** a container is the gap to the next entry, and the duration
rule settled in §304 is a MULTIPLE OF THE LOCAL GAP. So a 7 s container gives a ~10 s swell and a 2 s container a ~3 s one — **the
containers shape the swell lengths directly**. A set with a wide spread makes a texture of long held swells punctuated by quick ones,
without any second control.

**The two questions only he can answer, put with recommendations:**

1. **The units.** (a) the numbers ARE seconds; (b) they are proportions scaled to fill the duration; (c) **recommended** — a UNIT he sets,
   defaulting to 1 second, so *2 5 7 15* is seconds out of the box and one number rescales the whole shape faster or slower (at 0.4 s a
   unit the same set becomes 0.8 · 2.0 · 2.8 · 6.0 s, rolled to 20 s in 5–7 containers).
2. **The end**, since a roll rarely lands exactly. (a) **recommended** — stop short and report the shortfall, because the container values
   are the point; (b) let the last one overshoot; (c) stretch everything to land exactly on the duration, which keeps the proportions but
   loses the typed numbers.

## §306. PLAN 1o — the container units and end settled; the PRESET SETS designed, and SPREAD is what makes them audible

Composer, 2026-09-08: *"c and a"* — the numbers are **units, defaulting to 1 second**, so one number rescales a whole shape; and a roll
**stops short and says by how much**, because the typed numbers are the point.

And a new ask, in his words:

> *"I'd like some ways of making the … selection process relatively smooth and efficient. So one possibility is there's some descriptive
> recommendations are presets. So, like, asymmetric or jagged or… I'm not really sure, actually. another might just be something from math
> or science or something or nature, othagus or pathagus. or Fibonacci or things like this. So I can always take the time to craft a number
> set. but also have some access to some quick number sets that might provide certain… typically provide certain results that you could
> characterize. and or using number sets or things like that that have some echo in architecture, nature, or proportions, that sort of
> thing."*

**The AI's finding, and it is what makes the presets honest rather than decorative: the audible difference between one number set and
another is almost entirely its SPREAD** — the ratio of its largest number to its smallest. Ten candidate sets rolled to fill 60 s
(unweighted, three seeds each), with the swell lengths that follow at 1.5× the gap:

| set | numbers | mean | spread | containers (3 seeds) | swells |
|---|---|---|---|---|---|
| even | 4 | 4.0 | **1.0×** | 15 / 15 / 15 | 6.0 s |
| gently uneven | 3 4 5 | 4.0 | 1.7× | 14 / 14 / 16 | 4.5–7.5 s |
| **Pythagorean 6:8:9:12** (the string ratios — 4:3, 3:2, 2:1) | 6 8 9 12 | 8.8 | 2.0× | 6 / 6 / 7 | 9–18 s |
| long and short | 2 7 | 4.5 | 3.5× | 10 / 10 / 16 | 3–10.5 s |
| harmonic series (halving) | 3 4 6 12 | 6.3 | 4.0× | 9 / 8 / 12 | 4.5–18 s |
| primes | 2 3 5 7 11 13 | 6.8 | 6.5× | 5 / 7 / 10 | 3–19.5 s |
| **Fibonacci** | 1 2 3 5 8 13 | 5.3 | 13.0× | 8 / 9 / 16 | 1.5–19.5 s |
| jagged | 1 2 8 13 | 6.0 | 13.0× | 8 / 8 / 15 | 1.5–19.5 s |
| triangular | 1 3 6 10 15 | 7.0 | 15.0× | 6 / 6 / 12 | 1.5–22.5 s |
| powers of two | 1 2 4 8 16 | 6.2 | 16.0× | 8 / 6 / 16 | 1.5–24 s |

**Two things the table shows.** The spread governs how much the SEED changes the result — an even set gives 15 containers whatever the
seed, while powers of two gives anywhere from 6 to 16. And because §304's duration rule is a multiple of the local gap, **the spread is
also the range of swell lengths**: a 2× set gives swells all of a kind, a 16× set gives 1.5 s flickers beside 24 s holds.

One roll of each, to show the character rather than describe it:

```
Pythagorean    12  8 12  9  6  9
Fibonacci      13  3  8  5  2  5 13  2  8
powers of two  16  4 16  8  2  8
jagged         13  2 13  8  1  8 13  2
```

**Put to him:** the preset menu is sorted BY SPREAD, not alphabetically or by source, so the list itself reads as a scale from *even* to
*extreme*; each entry carries its source name, its numbers, and its spread; and **picking one simply fills the boxes**, so it is a
starting point he edits rather than a mode he enters. His own weighted example (*2 5 7 15 with 15 at 20 %*) stays available as a preset of
its own kind — a mostly-quick set with one rare long hold.

## §307. PLAN 1o — his "interrupted" corrects the container generator: the POOL is one axis, the ORDER is a second and independent one

Composer, 2026-09-08:

> *"I think also fairly typical for me is interrupted for lack of a better term. So maybe a few similar containers, like maybe a four and
> then a five and then a three but then it might be interrupted. So there might be, like, a four and then a one and then a five and then a
> two and then a three and then a nine or something like that. or it might be something, like, not so predictable. It might be a three, a
> five, a one, a four, a one, a two, a three, a one, a seven like that. So I guess this is, like, periodic versus aperiodic or contrasting
> versus not so contrasting. And then within the contrast, it's not just, like, long short, long short, but it might be long short short,
> long, really long, long short, long short short short, long long long, or something like that. And then some larger scale form ones. So
> ones that are still slightly uneven, but statistically get kind of bigger over time or shrink over time, but in asymmetric ways. And,
> yes, I'm also interested in other things. I don't know if golden or any of the other ones are exponential or anything lends something
> interesting. But, again, are there models in architecture or things that deal with ratios and proportion that are known and that give
> known effects."*

**The correction, and it is a real one.** §306's presets vary only the POOL — which numbers are available. Everything he has just described
is about the **ORDER they come out in**, which the roll had no control over at all: it was memoryless, so it could produce exactly one of
his characters (*"not so predictable"*) and none of the others. **Pool and order are two independent axes**, and the generator needs both.

**Probed, and two behaviours cover everything he named.** Pool 1 2 3 4 5 7 9, filling 60 s:

| behaviour | a roll | his words |
|---|---|---|
| memoryless | `7 7 7 5 3 7 2 1 9 4 7 1` | *"not so predictable"* |
| sticky (1.2) | `7 7 7 7 7 7 5 3 5 5` | periodic, then interrupted |
| sticky (1.2), another seed | `7 5 5 5 4 2 1 2 1 2 2 2 2 2 2 1 4 4 1 1 2 1` | *"a few similar containers … but then it might be interrupted"* |
| drift + | `2 1 1 2 5 4 1 4 2 2 1 3 1 1 3 1 1 5 5 7 5` | *"statistically get kind of bigger over time"* |
| drift −, curve 0.4 | `7 5 3 4 5 4 1 4 2 2 1 2 1 1 2 1 1 4 3 3 1` | shrinking, and asymmetrically — the change front-loaded |

**A finding that shapes the design: stickiness alone LOCKS UP.** At 2.5 it stops leaving the value it found — `7 7 7 7 7 7 7 7`, then
`9 9 9 9 9 9`. So one number cannot serve; the interruption has to be **its own control**. Which is also his own vocabulary: **how much it
stays near the last value** (the periodicity) and **how often it deliberately jumps** (the interruption) are two different musical
decisions, and the second is what he named the behaviour after.

**So the generator is: a POOL (numbers, weights, presets sorted by spread — §306) × an ORDER (stickiness · interrupt chance · drift with an
asymmetry curve).** Three numbers on the order side, all seeded. His *"long short short, long, really long, long short, long short short
short, long long long"* is stickiness at a middle setting over a wide pool — it falls out rather than needing its own rule.

**His architecture question, answered honestly.** The systems are real and they slot into the same spread scale:

| system | as a pool | spread |
|---|---|---|
| √2 · *ad quadratum* (DIN paper, Gothic design) | 10 14 20 28 | 2.8× |
| Pythagorean 6:8:9:12 (Palladio's room ratios) | 6 8 9 12 | 2.0× |
| golden section φ | 10 16 26 42 | 4.2× |
| √3 · *ad triangulum* | 10 17 30 52 | 5.2× |
| silver ratio (Japanese temple proportion) | 10 24 58 | 5.8× |
| Modulor-ish φ series | 3 4 6 10 16 27 | 9.0× |

**But the honest part:** in architecture these ratios are seen ALL AT ONCE and can be compared by the eye. In time they are heard one after
another and compared only by memory. There is no established body of results saying a √2 time-set sounds a particular way — the claim
would be decoration. **What they reliably give is their spread and their lack of a common factor**, which is exactly what the table above
measures, so they earn their place as pools with good pedigree rather than as effects with known outcomes. They are also RATIO sets, so
they want the unit turned down (§306's setting (c)): φ at 0.2 s a unit is 2 · 3.2 · 5.2 · 8.4 s, which is usable, where the raw numbers
give two containers in two minutes.

## §308. PLAN 1o — the ACCORDION: his image is two-way, and §307's drift was only one-way

Composer, 2026-09-08:

> *"Have you addressed the accretion or decreasing. I'm gonna call them accordion patterns because it could increase or spread
> asymmetrically. So contraction versus expansion like accordion bellows."*

**Partly, and the shortfall is real.** §307's `drift` is MONOTONIC — small → large, or large → small, with a curve for where the change
sits. His accordion image is **two-way**: out and back, or in and out, with the turning point anywhere, so the two halves are unequal.
Drift as built cannot do that at all.

**Rebuilt as a CONTOUR** — the size the roll is pulled toward, as a shape across the span. Four of them, and three dials for the shape:

| the contour | what it does |
|---|---|
| grow | small → large |
| shrink | large → small |
| **open–close** | small → large → small (the bellows out and back) |
| **close–open** | large → small → large (squeezed, then opened) |

| the dial | what it changes |
|---|---|
| **turn** (0–1) | where the reversal sits — this is the asymmetry: 0.25 turns early, 0.75 turns late |
| **bow** | broad or sharp at the turn — a long plateau, or a point |
| **depth** | how hard the contour pulls against the stickiness and the interruptions |

**Rolled, pool 1 2 3 4 5 7 9 filling 60 s, stickiness 0.9, interrupt 8 %:**

```
grow                       1 2 2 7 4 4 1 1 4 5 7 7 5 4 5
shrink                     5 5 5 9 7 7 1 1 4 4 5 5 2

open-close, turn at 0.25   1 2 3 9 9 9 2 1 5 5 7 7
open-close, turn at 0.75   1 2 2 7 4 4 1 1 5 5 7 9 7 4
close-open, turn at 0.35   5 5 5 7 3 3 1 1 4 4 7 7 5

open-close, sharp turn     1 2 2 7 4 4 1 1 5 7 9 9 3 1 2 1
open-close, depth 2        1 1 2 5 3 4 2 1 7 7 9 9 3 2 2 1
```

**The finding worth keeping: the contour and the interruptions FIGHT each other**, and that is a control rather than a fault. At depth 0.4
the bellows is a tendency you half-hear under the interruptions; at depth 2 (`1 1 2 5 3 4 2 1 7 7 9 9 3 2 2 1`) the shape is plainly
audible and the interruptions become detail on top of it. **`depth` is therefore the dial that decides whether the large-scale form is the
subject or the background** — which is exactly the distinction he was reaching for with *"some larger scale form ones"*.

**One consequence of measuring the contour against TIME rather than against the container count:** a closing half made of small numbers
takes many containers to cover its share of the span, so an *open–close* with an early turn spends most of its events in the closing half.
That is realistic — the bellows closes slowly because small containers pass slowly — and it is left as is.

**So the container generator now stands at: a POOL** (numbers · weights · presets by spread) **× an ORDER** (stickiness · interrupt) **× a
CONTOUR** (grow · shrink · open–close · close–open, with turn · bow · depth). Everything seeded.

## §309. PLAN 1o — phase 1 closed in four topics; the top line put

Composer, 2026-09-08: *"good"* to the container generator as it now stands. **Phase 1 is complete.** What the four topics settled:

1. **What 1o is** (§301, §303, CN-56) — the swells REPLACE the strikes; no accent; the dealt chord notes themselves are the crescendos, so
   a count of 2-4 is how many swells begin together. Every rhythm the drawer already makes is in scope.
2. **The duration** (§304) — a MULTIPLE OF THE LOCAL GAP, computed at each entry, so it follows an accelerando by itself. The multiplier is
   the density dial (length / gap of 1 gives about 2.5 voices sounding, 2 gives about 4, 3 saturates); a typed length stays available; the
   predicted thickness and the flag count are a readout.
3. **Where it lives** (§304) — a SOUND SWITCH, attack or crescendo, orthogonal to the drawer mode. So *chords + crescendo* IS 1o, and
   nothing is written twice.
4. **The time containers** (§305-308) — a POOL (numbers, weights, presets sorted by SPREAD) x an ORDER (stickiness, interrupt) x a CONTOUR
   (grow, shrink, open-close, close-open, with turn, bow, depth). Units default to 1 second; a roll stops short and says by how much.

**THE TOP LINE, put to him (phase 2):**

1. **The sound switch** - attack or crescendo, the length rule and its density readout, and the crescendos written into the score.
2. **The time container generator** - pool x order x contour, pure, and its own module from the start because he asked for exactly that.
3. **The containers in the drawer** - the new entry in the shape menu, its controls, the presets, the readout.
4. **Verify and document** - the node checks, the walk on a copy, the documents; then his first crescendo strikes.
