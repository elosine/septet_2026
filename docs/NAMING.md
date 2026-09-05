# NAMING — score files, and the S1 data conventions the IR depends on

> Opened 2026-09-03 at PLAN 0i, the proof of the IR contract (journal D9). Two things live
> here because both are "what a save file is allowed to look like": the file-naming system
> inherited from piece #4 (`for_seven_tubas/docs/NAMING.md`) and **the S1 conventions that
> the extractor reads** — D9 §5's list, each one stated as a rule the composer app already
> follows. Rewritten freely; the reasoning is in RUNNING_LOG §13.

## 1. Score files (`scores/`)

| Pattern | What it is |
|---|---|
| `septet` | the day-one canonical stub — the default session so a cold start opens without a 404 (RUNNING_LOG §10). Not the piece. |
| `piece-<anything>` | **the piece** — any name starting `piece-` lives in the Piece menu (D17: no numbering chain any more; a milestone is a named version, e.g. `piece-septet-v1.5`) |
| `<name>-v<label>` | **a named version** — a frozen copy written by "Name version" beside its base file (`ScatteredStrikes01-v1.5`); never overwritten; committed; listed with its base in the menus |
| `<name>-work` | **the working copy** — every open goes through one; autosave writes here, never the file; gitignored; discarded on Save and on Reload, so one that differs from its file = unsaved edits |
| `cont-<family>-<nnn>` | a single shape / container, if the container way of working returns; families grow as needed |
| `0i-test`, `0i-test-b` | the PLAN 0i proof saves (RUNNING_LOG §13) — test material, kept as evidence; never part of the piece |
| `trill_playing_samples`, `-viola`, `-cello` | the composer's trill captures (2026-09-05, score-lane `Rec` on accent senza vib) — the source of `bank/trill_timing_db.json`; committed, never overwritten |
| `trill-*` | trill tests written by `tools/trill_curve_gen.js` (a curve + his timing under it); `trill0-listen` = the rejected formula file (RUNNING_LOG §99) |
| everything else | research archive — frozen experiment renders; never overwritten |

- **The save system (D17, composer 2026-09-04; RUNNING_LOG §67–68) — one rule for every score,
  piece or experiment:** open a score → you are in its working copy (autosave lives there; the file
  changes only on Save) · **Save / CTRL+S** when it's good · **Name version** when a chunk is done
  (saves the file AND freezes `<name>-v<label>`; the next label is suggested: 1.1, 1.2 …) · **Reload**
  if it went wrong (drops the unsaved edits; asks once). The `?` button shows this line in the app.
  Piece #4's "Save as next" / "Variant" / "Restore" are gone; the Save snapshots in `scores/versions/`
  (cap 20, gitignored) remain as a silent net the AI can dig into on request.
- Everything in `scores/` **is committed** except `*-work.json` and `versions/` — autosave
  has eaten a score in every previous piece and git is the only net under it. At session end
  `node tools/unsaved_check.js` lists working copies that hold edits their file does not; the AI
  asks before the commit.
- **`midi/`** — Standard MIDI exports of captures (`tools/score_to_midi.js`: one named track per lane, channel 1, no CC0 /
  CC7), for auditioning articulations in Reaper. **`bank/trill_timing_db.json`** — the trill timing table
  (`tools/trill_ingest.js`), rebuilt from the capture files; committed (RUNNING_LOG §101).

## 2. The S1 conventions the IR reads (D9 §5, proved at 0i)

The extractor (`tools/notate_section.js` → `notation/lib/extract_core.js`, classifier
`notation/lib/classify.js`) reads a save file directly. These are the properties it relies
on; the composer app writes every one of them today. **Change the app and these together,
or not at all.**

1. **Tracks are instrument-keyed.** `tracks[i] = { id, label, short, instKey }`,
   `layoutVersion: 3`. `instKey` names the recipe in `sandbox/instruments.js`. Part
   numbers in the IR are the track indices 0–6 (flute 0 · bass clarinet 1 · piano 2 ·
   violin 1 3 · violin 2 4 · viola 5 · cello 6).
2. **One layer convention, fixed:** sounding objects sit on layers `0 … tracks.length-1`;
   **META shapes sit on layer `tracks.length` (= 7, `META_LAYER`) and never carry
   `sonifyNote`.** The app's own discriminator ("a lane curve without `sonifyNote` is not
   sound") is the rule. *Pipeline note (PLAN 2a):* `classify.js` still says META = layer
   10, the tuba layout; until it derives the META layer from `tracks.length`, run
   `notate_section.js --parts 0-6` — the default `0-9` sweeps layer 7 into the parts and
   the classifier throws on the META shape (RUNNING_LOG §13, run C).
3. **Every sounding object carries `sonifyNote` (MIDI) and `technique`.** The technique
   key is the recipe key from `sandbox/instruments.js` — the same string is the IR event's
   `technique`. A lane object without both is not a sound (a hand-drawn shape) and must
   not sit on a sounding layer.
4. **Ids are stable and never reused:** `wc-N` / `mk-N` from the app's `nextId`, which only
   grows. The IR's derived ids are functions of these (`ev-wc-N`, `ch-<part>-wc-N`), so a
   regenerated page re-attaches the composer's authored overlays by id.
5. **Gestures carry `groupId`** on every member note, and the gesture's META shape carries
   the same `groupId` on the META layer — the app's insert-time shape.
6. **Markers live in `objects` as `{ type: 'marker', layer, time, label, … }`.** The
   extractor skips them (`--complete` does not count them); `export_print` reads them for
   section marks — **a section mark is a marker whose label starts with `ACT-`** (piece #4's
   rule, inherited by the exporter).
7. **The real sounding length of a one-shot** comes from `bank/sample_lengths.json`
   `[technique][midi]` (seconds) — the app's `techLength` and the extractor read the same
   table. The copied table is the tuba's (`staccato` / `cuivre` / `fortepiano`, a few
   pitches); **the septet's one-shot techniques (pizz, Bartók, slap, key click, staccato …)
   need their own measured rows — PLAN 0c/0d.** Until then the extractor warns and uses the
   drawn length.
8. **The flute's instrument in hand (D6)** is not a separate field: piccolo / bass flute
   enter as techniques of the flute track's recipe (their own port/channel/range now; clef
   + transposition metadata at 0c.5), so the technique key on the note says which
   instrument is in hand. Pending CN-2 (which of the two).

## 3. Not S1's business (where the piece-specific work goes)

- **Technique → notation class** is registry data + classifier rules
  (`notation/registry/classes.json`, `classify.js`) — the tuba vocabulary today (`ord`,
  `staccato`, `cuivre`, `fortepiano`, morph). Every septet key (pizz, arco, bartok, flz,
  slap, …) throws "no rule claims object" by design (CL-5, never a silent unknown). That is
  PLAN 2a's first job: a per-instrument technique → class map, data not code.
- **Part labels** in the notation app are still T1–T10; 2a takes them from
  `tracks[].short`.
