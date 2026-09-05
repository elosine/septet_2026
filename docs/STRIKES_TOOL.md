# STRIKES TOOL — requirements, gathered piece by piece (PLAN 1c.2)

> Opened 2026-09-03. The composer builds this tool WITH the AI, one requirement at a time:
> *"gather these requirements and organize them for now, and I'll give some more, piece by
> piece."* This file is the organized list — the composer's words verbatim in quotes, the
> AI's reading and implementation notes marked as such — and it grows as the tool does.
> Status per item: `wanted` → `built` → `seen by the composer` → `accepted`.
> The database behind it: `bank/scattered_strikes.json` (tools/strike_db.js, RUNNING_LOG §36).
> **The build: `score/public/strike_drawer.js`** (2026-09-03 night, RUNNING_LOG §39) — the full-width
> drawer in the composer score; the v1 panel (§37) is gone. Open the score, press `Strikes`.

## A · The keyboard view — `built 2026-09-03 — the drawer, for the composer's test`

> *"Let's start with the keyboard like image one. This will show the notes as I played them
> on the piano, in each of the scattered strikes … I should see one at a time."*

- A vertical piano keyboard (the tuba Blast Sandbox's `chordview.html` keyboard is the
  picture: vertical keys, `C3` / `C4` octave labels, every sounding note a coloured dot on
  its key with its name beside it; pitch-class colours, octave doublings in the same colour).
- Shows ONE strike at a time — the notes as played, from the database.
- *AI notes:* reuse `chordview.html`'s keyboard drawing and pitch-class palette; range = the
  ensemble's (cello C1 36 to flute C7 96, with the piano's 21–108 available); a strike picker
  sits above it (the v1 picker). Open, deferred by the composer ("we'll come back to these
  things"): whether the keyboard can also show all strikes; how the keyboard and the v1 note
  table relate (the table may become the per-note assignment view under the keyboard).

## B · Voicing presets — `built 2026-09-03 (six presets + reshuffle; cluster = smallest chromatic span, ± octave)`

> *"Then I want some preset buttons. I'll give you a few choices now, but I want the ability
> to just add while I'm working with the tool — I can just tell you I want more of these."*

The starting set:
1. **original** — *"one the original"*: the notes exactly as played.
2. **spread out** — *"one spread out. Try to achieve an even spread."*: the same pitch
   classes displaced by octaves to fill the register as evenly as possible.
3. **cluster together** — *"one cluster together, and then I'll be able to move that cluster
   to different octaves"*: the notes packed as tightly as possible, with an octave position
   the composer chooses.
4. **cluster low** and 5. **cluster high** — *"one that's clustered low and clustered high"*:
   the tight cluster placed at the bottom / the top of the register.
6. … *more added on request while working.*

**Clarified by the composer (2026-09-03):** **cluster together** = everything collapsed into the
smallest chromatic span, the same octave if possible, and that tight cluster can be MOVED
around the octaves (a high tight cluster, a low one …) · **high and low clusters** = two tight
clusters, one high, one low · **spread out** = as much even pitch space between the notes as
possible — *"you don't have to optimize it, but try to have the notes spread out"* · the menu
is extensible: *"when I'm listening I'll say, oh, I want to hear it like this."*

- *AI notes:* a preset = a VOICING transform on the strike's pitch-class content (D11 of the
  tuba piece: a voicing is the pitch set only; articulation and dynamics are a separate
  layer) — the harmony stays, the octaves move. "Spread" has a precedent in
  `tools/vert_bank.js` v2 (octave displacements, max–min spread greedy). "Cluster together"
  needs one decision (asked below): chromatic packing (semitone-adjacent within an octave)
  or the played intervals compressed. Presets are data (a small table of named transforms),
  so adding one is a line, not a build.

## C · Reshuffle — `built 2026-09-03`

> *"I want the ability to reshuffle any of these. So if it's a cluster high, then I can just
> hit reshuffle, and I'll just reshuffle the notes into a different high cluster."*

- One button: re-randomize the current preset's realization under its own constraint (a
  different high cluster, a different even spread …); the harmony never changes.
- *AI notes:* each preset exposes a random seed / a "variant" counter; reshuffle advances it;
  the keyboard redraws. The seed is kept with the strike so a liked shuffle can be inserted
  and recalled.

## D · Carried over from the first ask (RUNNING_LOG §33) — `re-fitted into the drawer 2026-09-03 (v1 panel removed)`

- Per-note instrument / octave / technique assignment; Hear through the rack; Insert at the
  playhead as a gesture (groupId + META shape); time × / warp / rhythm-only; the redaction
  groups. All in the v1 panel; their place in the new layout is decided as A–C land.

## E · The orchestration panel — `built 2026-09-03 (shuffle · may fold · top/bottom locks · articulation per row · dotted lines)`

> *"To the right of the keyboard will be the orchestration panel. Let's just have the seven
> instruments in their order from top to bottom. And then I'll be able to shuffle with a
> button, and there'll be dotted lines drawn from the keyboard keys to the instruments — which
> notes are playing them. I don't necessarily want the flute to always be on top. I want to
> hear a shuffle."*

- Right of the keyboard: the seven instruments, score order top to bottom (D10).
- **Shuffle**: a random assignment of the strike's notes to instruments. Dotted lines from
  each key to its instrument show the assignment.
- *AI notes:* the lines are SVG over both panels; each instrument row also lists its note(s)
  and technique (the v1 selects move here).

## F · Ranges — `built 2026-09-03 (adopted; the shuffle never misfits, hand choices fold ↑↓ or ✕)` · `hand assign 2026-09-04 (U7): a plain click on a row REPLACES — the row's note swaps back to the armed note's old player (or nobody); shift-click adds; each note takes its new row's current technique`

> *"What happens when the ranges don't fit? … I don't want things to be too fiddly."* — the
> AI's proposal, adopted by the composer ("Those are good suggestions. Let's adopt those."):

1. **The shuffle never produces a misfit**: it draws only assignments with every note inside
   its instrument's range.
2. **A hand assignment that doesn't fit gets one click:** **fold** (default — the note moves
   by octaves into the range; its line shows ↑ / ↓) or **skip** (nobody plays it; greyed).
3. **One switch, "shuffle may fold":** off = played registers only (a low strike stays with
   cello, bass clarinet, piano); on = the shuffle may fold pitch classes by octave, so any
   instrument can take any pitch class.
4. **Top / bottom locks:** "top → instrument", "bottom → instrument"; the shuffle respects
   them and moves everything else.

## G · Audition modes — `built 2026-09-03 (Hear piano · Hear orchestrated · Stop)`

> *"I want to be able to hear the chord, audition it, and then if I want to reorchestrate.
> And same with the piano part too — let's have that just be piano, and I can listen to the
> harmony as a piano, or I can listen to orchestrated."*

- Two Hear modes: **piano** (every note of the strike on the piano lane, the harmony alone)
  and **orchestrated** (the current assignment through the rack). Both from the same button
  row; the timing transforms apply to both.

## H · The piano's part — `built 2026-09-03 (flags per note, ring, click-to-toggle, quick buttons; a shuffle starts the piano on one note)`

> *"Sometimes I'll want it to double — play more than the one note — or just play one note."*
> and, on the four-way switch first proposed: *"I may want it to play all the above … It might
> just be one note. It might be some of the notes, like the top and the bottom note, or three
> notes, whatever. It might be all, and I like the rest too. But is there a different
> organization or logic we should try here?"*

- *AI proposal, the second (awaiting the composer's yes):* **the piano's part is a SELECTION
  of notes, not a mode.** Every note of the strike carries a piano flag — the piano plays it
  or not, independent of who else plays it; on the keyboard a ring around the dot means
  "piano too". **Click a key to toggle** its ring (top + bottom, any three, any subset — no
  menu). The former modes become **quick buttons** that set the flags: none · one · top+bottom
  · rest · all; "rest" recomputes after every shuffle. The shuffle assigns the six other
  players; the piano's flags persist unless a quick button is pressed. The same flag idea
  extends to double stops later (a second-note flag on a string player).
- **Adopted, with the composer's starting rule:** *"for the shuffles, let's initially start the
  piano with just one note, and then I could add more notes to the piano part as you suggest."*
  So a shuffle treats the piano as one player among seven (one note), and the flags / quick
  buttons add notes afterwards.
## I · Double stops — `wanted 2026-09-03 — not built yet, after the listening pass`

> *"And, yes, on the double stops."* (to the AI's note that the piano's per-note flag extends
> to a second-note flag on a string player)

- The four strings may take a second note: the same flag mechanism as the piano's — a
  string player's row accepts two notes; on the keyboard the second note's line goes to the
  same player. A shuffle starts every string on one note; the second is added by hand (click
  the key, then the player) or by a quick button later if wanted.
- *AI notes:* playability of the pair (an interval reachable on adjacent strings, both notes
  inside the range) is checked with the same fold / skip rule as F; the check itself is the
  string-writing knowledge from piece #1 (Xsample strings), to be written down when the
  first double stop is placed. Winds cannot take two; the bass clarinet's multiphonics are a
  technique, not a second note.

## J · The rhythm column — `built 2026-09-03 (span × · shape + amount · jitter · reverse · rotate · reshuffle; the bands re-derived live)` · `reset rhythm 2026-09-04 (U5): one button back to as played; span / amount / jitter undoable; a strike re-pick clears reverse and rotate`

> *"A third column will be the rhythms. A relatively zoomed-in view where I should be able to
> control zoom to a certain extent. Something close to the piano keyboard, or they could just
> be distributed equally vertically, whichever works better. And then I can do some rhythmic
> transforms — make the rhythmic cluster looser or tighter; maybe you can suggest some
> transforms where the actual gaps spread out in different ways, not just equally. And I
> should be able to see this in the visual."*

- *AI recommendation:* aligned with the keyboard — each onset a dot at its key's height, time
  left→right, so pitch, onset and instrument line share a row; auto-fit the strike's span,
  a wheel / slider to zoom closer; the 60 ms redaction groups as faint bands behind the dots.
- *AI's proposed transforms* (note count kept; the span multiplier separate): **tighter /
  looser** (span ×) · **shape** — where the gaps go: even · front-loaded · back-loaded · centred
  · edges · as played · **amount** (0–1 blend between as-played and the shape) · **jitter** (± n
  ms per onset) · **reverse** / **rotate** (the gap sequence mirrored / cycled) · **reshuffle** (a
  new random scatter, same count and span). One menu, three sliders, two buttons; live redraw.
- Composer on the transforms: *"the transforms sound good. I think I have to hear them first. And
  just like with the pitch clustering or spread out, I might want to add more later once I hear
  things."* — so: build the set, listen, extend on request (as B). The bands were drawn for him
  (a diagram in chat, 2026-09-03): each band = the 60 ms after a kept tick; every dot inside
  merged into that tick — gone from the rhythm, kept in the harmony.
- **Rule (composer's question, 2026-09-03: *"what happens if I spread out the rhythm? Do the inner
  sixty-millisecond ones get their own attack?"*): the 60 ms grouping is DERIVED from the current
  timing after every transform, never frozen — spreading splits groups into their own ticks,
  tightening merges more; the audio always plays every note at its own onset; "rhythm only" snaps
  each note to its CURRENT tick. The database keeps the as-played grouping as a reference only.

## K · The order of the notes — `built 2026-09-03 (presets · shuffle · click two dots to swap; lock not yet)` · `2026-09-04: the two-dot swap FIXED — it had never held (every render re-derived the slots from as played); the menu now shows "by hand"; seeds + history per U8`

> *"I should be able to scatter the order. I think I'm mostly playing, in the original, down
> to up, but I can scatter which notes come first, in different orders. Again, a shuffle and
> then some sort of manual override where I can move things about."*

- The decomposition: **J is the onset PATTERN** (where the ticks fall), **K is the ORDER**
  (which note takes which tick). Each shuffles on its own.
- Presets: as played · low → high · high → low · outside-in · inside-out · random.
  **Shuffle** draws a new order; the ticks stay. **Manual:** drag a dot to another tick
  (snaps to slots) or click two dots to swap; a **lock** pins a dot's slot through shuffles
  (as the top / bottom locks do in the orchestration).

## L · The model in one sentence — `confirmed 2026-09-03 — coded as the three lists`

> Composer: *"Can we flatten both? So the pitches get distributed — there's eleven, and any
> pitch can go to any of the players — and then the scatter rhythm is the x axis: any of the
> rhythmic positions can go to any of the pitches, to any of the players, not necessarily the
> way they're shown here or the way I played them. Is that correct?"* — Yes.

- **Three independent lists:** the PITCHES (the strike's harmony), the ONSETS (its rhythmic
  positions, with the live 60 ms bands), the PLAYERS (seven). The tool pairs them; every
  pairing is free — pitch ↔ onset (K), pitch ↔ player (E), ranges permitting (F). "As played"
  is one pairing kept as a preset. The bands belong to the onset list alone; whatever pitch
  lands inside one lands on that attack.

## M · The harmony collection as a source — `wanted 2026-09-03 — not built yet (= PLAN 1d)`

> *"Then we'll collect all the harmonies … a drop-down and scrollable panel like the one in the
> blast sandbox, so I can drop that down, click on any of the harmonies, and play them. And
> when we collect the harmonies from the various pieces, let's give a better indexing system —
> numbers are okay, but consistent and simple and easy to understand. … the chord shapes from
> the two-piano piece, all of these blasts, and I believe some other ones scattered about the
> tuba piece — Messiaen, clusters, octaves, stacked fifths. This would be a view onto that
> harmony collection."*

- The strip from the tuba Blast Sandbox (mini vertical keyboards in a scrollable row, a
  drop-down, play, auto-hear) as the harmony picker; click = load the harmony into the tool.
- Sources inventoried 2026-09-03: tuba `blast_taxonomy.json` (20 harmonies, 138 sonorities,
  3 custom lists), `cluster_bank.json` (44 clusters), `pulse_palette.json` (29 sonorities,
  S008–S047), Messiaen mode 3 on F (26 pitches, PLAN #4); the two-pianos chord shapes (inside
  its saves' `databases.chordShapes`); the septet's own strikes (46 so far).
- **Index proposal:** one running number for the whole collection, `H001`, `H002` …, assigned
  once, never reused (append-only), plus a source tag and the original name in the label
  (`H042 · tuba vert 28 V4 · C4 C#4 D4`). Numbers are what gets said aloud; the tag says where
  it came from.

## N · Choosing a harmony: orchestrating it into the strike — `adopted 2026-09-03 — not built yet (needs M)`

> *"If I choose a harmony, it's got to be orchestrated into this scattered shape — what the
> piano keyboard represents. Similarly even the played version has to be reorchestrated so the
> ensemble can play it."*

- *AI proposal:* the orchestration and the order are stored **by voice rank**, not by pitch:
  voice 1 = the lowest note … voice n = the highest. A new harmony with n notes maps 1:1 onto
  the same ranks — the same players, the same onsets, the same piano flags — so the built
  arrangement survives the swap. Ranges then adapt by F's rule (fold, marked ↑ / ↓, or skip).
  A harmony with MORE notes: the extra voices go where the piano flags say (rest) or stay
  silent; with FEWER: the surplus players fall silent. Every harmony, the played one included,
  goes through the same path — there is no special case.

## O · Not losing work: takes — `built 2026-09-03 (v1: takes in the browser's localStorage + one-level back)` · `v2 2026-09-04: takes in bank/panel_snapshots.json (bucket strikes) through /api/snapshots, committed with the repo; the v1 browser takes migrated once on the next reload; × deletes the named take (asks first)` · `U9 2026-09-04: ENTER in the take box saves; the take controls wrap as one group`

> *"I don't want to lose work. Say I take the original, orchestrate, find a rhythm, listen —
> then I decide I want to listen to it in a different harmony. It may not fit the orchestration,
> but I don't want to lose what I built, and I want to easily hear my choices, and go back."*

- *AI proposal:* the tool's whole state — harmony, onset pattern, order, orchestration, piano
  and double-stop flags, transforms, seeds — is a **take**. `Save take` names it (the panels'
  snapshot loop, `bank/panel_snapshots.json`); the take list is a drop-down; `Load` restores
  one; switching the harmony is non-destructive (N) and an automatic `previous` step keeps the
  last state so `back` is one click. A take can be inserted into the score at any time.

## P · The Messiaen modes — `wanted 2026-09-03 — not built yet`

> *"Messiaen — and there's more than mode three. I think we end up using all the modes … it
> might have been in the multitempo parts where it was distributed across time, not in one
> chord. So those aren't really chords, but maybe we can add them: pull in all the Messiaen
> modes, and we can just use your attrition strategy, or the shuffle can randomly choose what
> to drop."*

- All seven modes of limited transposition in every transposition (2 + 3 + 4 + 6 + 6 + 6 + 6 =
  27 pitch sets) enter the collection as harmonies, tagged `messiaen m3/F` etc. More notes
  than players → N's attrition: the shuffle drops at random, or the piano's flags take the rest.

## Q · Linked to the score — `built 2026-09-03 (pick in the sequence, playhead follows, Insert @ playhead; delete not yet)` · `v2 2026-09-04: Insert @ original time — the strike carries its own time into WHATEVER score is open; originals replaced only where they truly exist (id + lane + pitch + onset), so the source save never has to be opened`

> *"In the tuba composer score there's the Insertion pull-down. Instead of this, integrate
> that into the sandbox somehow, and have the thing I'm working on in the sandbox linked to
> the rhythmic position in the score. I played a bunch of those chords directly into the
> score, and they have a go time. So in the sandbox I can identify which one I'm working with,
> and that gets linked back to the score at the time it comes from. So the first step of the
> tool would be to choose which step in the sequence of scattered strikes I'm working with,
> and that loads into the keyboard, harmony, etcetera."*

- **Step one of the tool: pick the strike by its place in the sequence** (index · go time);
  the database already carries its source save, object ids and `t0`, so the link is data.
- Operations from the Insertion strip, in the tool: **replace in place** (the take written
  back over the original strike at its time — the original notes replaced, ids kept where
  possible), **insert @ playhead**, delete. Selecting a strike may move the score's playhead
  to its `t0`; later the reverse (select in the score → select in the tool).
- The Insertion strip's mini-keyboard row is reused as the harmony picker (M).

## R · Decisions before the build — `decided 2026-09-03 — all six applied in the build`

1. **Where it lives — a FULL-WIDTH DRAWER inside the composer score.** Composer: *"if you can
   make it a full-size drawer, that's fine. The blast sandbox actually takes the whole screen
   width. So it's fine to be part of the composer score, that's probably what I prefer. But the
   other panels are small — if this could take the full page width, that would be best."*
   A drawer that pulls up from the bottom to the page's full width and a generous height, like
   the Insertion strip but tall; it edits the score's live objects (replace in place, insert,
   undo).
2. **Durations — a `duration ×` multiplier** beside the timing transforms. Composer: *"Sure, add
   the multiplier, but chances are in the notation these will reduce to just short notes. If I
   wanted something more heterogeneous in terms of duration, I could consider that with a
   multiplier."* Default = as played.
3. **Strike techniques per instrument** — became S (the articulation column + the stand-in rule).
4. **Dynamics** — decided: **as played** (default) or **flatten**; a `dyn ×` slider beside them.
5. **"Cluster together"** — decided: the smallest chromatic span (see B, clarified).
6. **Keyboard range** — decided: the ENSEMBLE SPAN on screen; the piano keeps the full 88
   available — composer: *"maybe we do the ensemble span, and for the additional notes for the
   piano we have the option of adding something from the eighty-eight keys."* AI's expedient:
   a small `88` toggle expands the keyboard to the full range when the piano needs it; notes
   beyond the visible span (piano only) show as arrows at the top / bottom edge.

## S · The articulation column and the stand-in rule — `built 2026-09-03 (menu per row · picker by kind · stand-ins; the `kind` field in instruments.js still pending — a name rule classifies until then)`

> *"After the instrumentation, before the rhythm panel, is column three; rhythm becomes column
> four. I'll click on the instrument, and then I'd have a choice of articulations — the strings
> could use the Bartók pizz or bow pressure. And just like with the cuivre in the tuba, I can
> have semi-pitched or non-pitched — multiphonics or things like that — just stand in for that
> pitch. There's a pluck behind the bridge, but only the open strings' pitches are available:
> that could stand in — you wouldn't reorchestrate that pitch, it would just be the noise part."*

- *Layout (AI proposal):* an articulation menu on every instrument row in column 2; click an
  instrument → column 3 opens its full list, grouped pitched · fixed-pitch · noise ·
  multiphonic; rhythm = column 4; `all strings → …` chord-level quick buttons (the blast
  sandbox's `all:` row).
- **The stand-in rule:** every voice keeps its harmony pitch (D11 of the tuba piece: an
  articulation never edits pitch content); the articulation's KIND decides what sounds —
  **pitched**: the pitch · **fixed-pitch** (behind the bridge, harmonics sul X): the nearest
  available pitch, behind-the-bridge = the closest open string · **noise** (body strokes, key
  clicks, slap, undefined sounds): stands in, the key only picks a variant · **multiphonic**
  (bass clarinet #10 / #22, flute Multiphonics Menu): stands in; default = the multiphonic whose
  content contains the voice's pitch class (from the 0c.8 walk). On the keyboard a stand-in
  voice is a hollow dot with a label of what sounds ("bb pizz · open D"). The harmony record
  never changes.
- *Needs underneath:* a `kind` field on every technique in `sandbox/instruments.js` (pitched /
  fixed / noise / multiphonic) and the open strings per string instrument (vn G D A E = 55 62
  69 76 · va C G D A = 48 55 62 69 · vc C G D A = 36 43 50 57). The 2a notation classifier
  needs the same field — written once, at 0c.
- Composer, confirming: grouped by kind, but **every articulation visible** in the full list;
  the menu on the instrument row, click exposes the full list. Adopted.

## T · Auditioning variants: the side panel — `built 2026-09-03 (variant list with ▶ hear / click select, for fixed · noise · multiphonic)`

> *"I don't necessarily want to overclutter things, but it would be good to have a quick way
> to audition the variation. For the multiphonics, they don't really have much to do with the
> keys — they're just triggers for a variety of multiphonics. So if I decide to put in a
> multiphonic, it'd be good to have a side panel where I can listen to the choices and select
> one of the multiphonics in the sample."*

- When a voice gets a noise / multiphonic / fixed-pitch articulation, a side panel lists that
  technique's variants (the multiphonic keys with their pitch content once 0c.8 has walked
  them; the noise technique's keys; the open strings) — click to hear, click to select; the
  choice is stored on the voice (the stand-in key). Out of the way until needed.

## U · Feature queue from the first test — `U1–U4 built 2026-09-04, awaiting the composer's test` (RUNNING_LOG §64) · `U5 built 2026-09-04` (RUNNING_LOG §73) · `U6 asked, not built` · `U7 built 2026-09-04` (RUNNING_LOG §74) · `U8 built 2026-09-04` (RUNNING_LOG §76) · `U9 built 2026-09-04` (RUNNING_LOG §77)

> Composer: *"collect these and I'll have you do a feature update all at once."* Each request
> verbatim, the AI's reading beneath; built together when the composer says so.

- **U1 — room between the keyboard and the players.** *"can there be a larger gap between piano
  keyboard and instruments, cant see where the lines are drawn to"* — *AI reading:* widen the
  keyboard column (or add a gutter column, ~120 px) so the dotted lines have length and a clear
  landing on each player's row; land them on a small marker at the row's left edge, and
  brighten the line of the row under the mouse.
- **U2 — staccato as the default articulation, except the piano.** *"can we make the default
  sound for all stacatto, no stac atto for piano so leave as is"* — *AI reading:* the drawer's
  plain-technique preference becomes staccato-first: flute `staccato` (the Fluteb port), bass
  clarinet `stac_vel` (Staccato Velocity #19), strings `stac_vel` (#19); the piano keeps `main`
  (8Dio). Applies to shuffle, hand assignment and the row menus' initial value; the strike's
  as-played state stays the piano's.
  **Revised the same morning:** *"new default: flute pizzicato (can you explain this technique,
  tongue ram?), violins-bartok pizz, vla/vc, gettato, bass clarinet slap tongue, all fff=127"* —
  *AI reading:* the defaults become flute `pizzicato` · bass clarinet `slap` · violins
  `bartok_vel` · viola/cello `gettato_vel` · piano `main`, at velocity 127 (the drawer's dyn ×
  and flatten still apply on top). These five are also measured against each other in the
  balance run (PLAN 0j, RUNNING_LOG §43).
- **U3 — solo a voice or a set of voices.** *"can we solo individual voices or a collection"* —
  *AI reading:* a solo flag per voice (a click with a modifier on a dot, or an `S` on the
  player's row), any number at once; Hear plays only the soloed voices while any are soloed;
  a `solo off` button clears them. Distinct from the piano flag and the future double-stop flag.

- **U4 — a narrower rhythm strip.** *"you can save horizontal space by reducing the rhythm
  zoom/width of bands"* — *AI reading:* the strip's default width fits the strike's span into
  ~40 % of the drawer instead of the whole remainder (a zoom slider keeps the wide view), the
  bands drawn at true 60 ms width (thin at that zoom); the space saved goes to U1's gap.

- **U5 — reset the rhythm in one click — `built 2026-09-04, verified on the throwaway server (RUNNING_LOG §73)`.** *Composer (2026-09-04 night): "strikes how to reset the
  rhythm"* — *AI finding, from the code:* no one-click reset exists. As played = shape `as played` ·
  span × 1 · jitter 0 · reverse off · rotate back at 0 (amount is moot under `as played`: the blend
  is between identical patterns). Two traps: (1) re-picking a strike in the sequence resets shape /
  order / span / amount / jitter but NOT reverse and rotate — a rotated strike #3 makes strike #5 come
  up rotated while its menu says "as played"; (2) span ×, amount and jitter changes take no snapshot,
  so `back` cannot undo them. *Proposed:* a `reset rhythm` button (the five values above), and
  `select()` clearing reverse / rotate with the rest. A page change only — a reload to take effect.
  *Built as proposed:* `reset rhythm` under reverse · rotate · reshuffle; `resetRhythm()` shared by the
  button and `select()`; `reverse: false, rotate: 0` in the defaults so the first click is undoable;
  span × / jitter snapshot on change, amount once per drag. Order and orchestration untouched.
- **U6 — a different pitch for an instrument already assigned.** *Composer (2026-09-04 night, while
  composing): "is there a way to reassign a different pitch to an already assigned instrument"* —
  *AI answer, from the code:* the drawer never changes a pitch CLASS — the harmony is the strike's own;
  pitches move by octave only (the voicing presets, all voices at once; the fold into a player's range,
  ↑↓). To give a player another note OF THE CHORD: double-click that note's dot on the keyboard ("voice X
  armed"), then click the player's row — the voice moves there and is ADDED to what the row already
  has; the note it had stays until it is armed and moved elsewhere. Gaps found: no hand "nobody plays
  this note" (skip is set only by a misfit); no per-voice octave nudge by hand; no free pitch edit (a new
  pitch class = a new harmony = M/N). *Not built — the composer's call which of the three, if any.*
  *→ U7 (below) makes the two-click assign replace instead of add.*
- **U7 — hand assign replaces, not adds — `built 2026-09-04, verified on the throwaway server (RUNNING_LOG §74)`.**
  *Composer (2026-09-04 night, having tried U6's two-click assign): "I tried this, but it added two lines
  to the instrument. The previous one didn't go away."* — *Built:* a plain click on a player row now
  REPLACES: the note(s) the row had go to the armed note's old player — or to nobody if it had none — so
  the chord stays whole and nothing is silently dropped; shift-click ADDS (the double-stop case, I). Each
  note takes the technique its new row already plays (before, a hand-assigned note always got the
  instrument's default, whatever the row's menu said). The status line says what moved where; `back`
  undoes it. The arm message states the rule.
- **U8 — the seed, visible and re-clickable — `built 2026-09-04, verified on the throwaway server (RUNNING_LOG §76)`.**
  *Composer (2026-09-04 night): "For the rhythm order. and the random shuffle order. Can I have the seed? And can I
  have a way to go back to previous seeds? So, for example, every time I hit shuffle order, maybe there's a row or a
  table of previous shuffles. It just collects, say, five or ten, and then I can click them instead of having to
  type it in. I can just click on previous seeds."* — *Built, the same way for all four random buttons* (shuffle
  order · reshuffle rhythm · shuffle orchestration · reshuffle voicing): `seed [n]` — the current seed in a small
  number box (a typed seed applies) — followed by the last eight seeds as chips, newest first, the current one
  lit; a chip click has that shuffle back exactly (same seed, same strike, same locks = same result); a new
  shuffle takes max(seen) + 1, so it never repeats a seed still in the row; `back` undoes a chip click. The
  histories live in the drawer's saved config and travel with takes. Cap 8 (the composer said five or ten).
- **U9 — ENTER saves a take; the take controls stay together — `built 2026-09-04, verified on the throwaway
  server (RUNNING_LOG §77)`.** *Composer (2026-09-04 night): "in the save take text box, can we make return save,
  the save take button drifted to the other end of the screen"* — *Cause:* U8's voicing seed row widened the
  footer and its wrap split the take box from its button. *Built:* the box, `save take`, `load take…` and `×` are
  one no-wrap group, so they move together; ENTER in the box saves (the same `saveTake()` as the button); the
  placeholder says so.

## V · Processes across strikes — `wanted 2026-09-04 (CN-10) — not built; nothing blocks composing the first of each by hand`

> Composer (CN-10): *"climbing scales through the ensemble; or acceleration or deceleration as one
> unit but spread out across the ensemble; blocks of strikes that answer each other from
> sub-ensembles? … circular chord strikes in cycles, and a kind of Risset ladder throughout the
> ensemble."*

- *AI reading of the tool needs, in order:* (1) **a shuffle confined to a sub-ensemble** — pick the
  players (strings · winds + piano · high · low · any set); the shuffle assigns only within them, the
  rest stay empty or keep what they have. (2) **Chains across strikes** — from a chosen strike, generate
  the next N as a process: SCALE (each strike one step higher, order low → high through the registers) ·
  ACCEL / DECEL (the strikes' onsets on a CN-3 ramp, each strike's own rhythm shaped to match) · LADDER
  (the same pitch classes re-voiced one step up per strike, the top voice wrapping to the bottom at the
  softest dynamic — the Shepard–Risset staircase in strikes). (3) **Answering blocks** — a chain of
  strikes alternating two sub-ensembles. Within one strike, order (K) · shape (J) · voicing (B) · locks
  and assign (E, F) already do each of these by hand; a chain is a take per strike today.

## Open questions for the composer (only what blocks the next piece)

*(Both answered 2026-09-03: cluster = the smallest chromatic span, movable by octave (R5); the
keyboard shows the ensemble's span with an `88` toggle (R6).)* **None open before the listening pass.**

## The build, as shipped for the morning test (2026-09-03 night)

Start: `cd C:\Users\jwloy\GitHub\septet_2026` → `node score\server.js` (restart it once — the
`rescan` route is new) → http://localhost:5300/composer.html → press **Strikes**.

- **In:** A–H, J, K (no lock), L, O (v1), Q (no delete), R, S (name-rule kinds), T. Verification
  numbers in RUNNING_LOG §39.
- **Not yet:** I double stops · K lock · M harmony collection + index · N harmony swap · P Messiaen
  · the `kind` field in `sandbox/instruments.js` (0c).
- **Rules worth knowing while testing:** `Insert @ 15.18 s (original)` writes the strike at its own
  time into whatever score is open and replaces its original notes only where they truly exist (the
  source save or a copy of it); `Insert @ playhead` goes to the playhead of whatever is open.
  SPACE while the drawer is open = hear / stop, wherever the focus is (the score's transport never gets
  it; a text box keeps its spaces). Takes live in `bank/panel_snapshots.json` (O v2) and are committed at
  each wrap; a take name is 1–64 letters, digits, dot, underscore, space or hyphen.

## Log

- 2026-09-03 — A, B, C stated by the composer; D exists as v1. Nothing built against A–C yet.
- 2026-09-03, later — E (orchestration panel) stated; F (ranges) proposed and adopted; G (audition modes) stated; H (the piano's role) raised, a four-way switch proposed, then replaced by the composer's push ("a different organization or logic?") with the SELECTION logic — flags per note, click-to-toggle, quick buttons — adopted; a shuffle starts the piano on one note. I (double stops on the strings) wanted, same flag mechanism.
- 2026-09-03, later — J (the rhythm column) stated; layout and a transform set proposed. Process change (composer): commits and pushes are batched every few exchanges, not per reply.
- 2026-09-03, later — K (order of the notes) stated; presets, shuffle, drag / swap, lock.
- 2026-09-03, later — J rule: the redaction grouping is live, re-derived after every transform.
- 2026-09-03, later — L: the three-list model confirmed by the composer.
- 2026-09-03, later — M (the harmony collection as a source; index proposal), N (harmony swap by voice rank), O (takes) recorded; N and O proposed.
- 2026-09-03, later — N, O adopted; P (all Messiaen modes) and Q (linked to the score; step one = pick the strike in the sequence) recorded.
- 2026-09-03, later — R: decisions 1 (full-width drawer in the score) and 2 (duration ×) taken; 3 (strike techniques) in discussion; 4–6 open.
- 2026-09-03, later — S: the articulation column and the stand-in rule recorded; layout proposed; `kind` metadata named as the 0c prerequisite.
- 2026-09-03, later — S adopted; T (variant side panel) recorded; B clarified (cluster = smallest chromatic span, movable; high+low clusters; spread out); R4 dynamics, R5, R6 (ensemble span + an 88 toggle for the piano) decided. All pre-build decisions taken.
- 2026-09-03, night — **built:** the drawer (`strike_drawer.js`) with A–H, J, K, L, O, Q, R, S, T as marked above; verified in the running app; the Replace-by-id hazard found and closed (source-save guard). RUNNING_LOG §39. Next: the composer's listening pass, then I, K lock, M/N/P.
- 2026-09-04, morning — the composer's first look: a `STRIKES ▴` tab at the page's bottom edge (the toolbar wraps on smaller screens), the drawer full page height by default with `↕ half`, keyboard rows fitted to the drawer. RUNNING_LOG §40.
- 2026-09-04, evening — **U1–U4 built** in one update (composer: "then build all 4 pls"): a gap column between keyboard and players with the lines landing on a marker per row and the hovered row's lines brightened (U1); the strike defaults flute pizzicato · bcl slap · violins Bartók · viola/cello gettato · piano main, and `flat 127` on by default (U2); solo — shift-click a dot (keyboard or rhythm), `S` per player row, `solo off` in the footer; while anything is soloed only the soloed voices sound (U3); the rhythm strip at 480 px by default with a width slider 320–1400, the saved space to the gap (U4). Verified in the running app, no console errors. RUNNING_LOG §64.
- 2026-09-04, session 3 — **O v2 + the SPACE bug** (composer: "yes lets keep those save files as well, also I've saved 2 already lets try to preserve them" · "I hit space to play, that was working But then at some point, it started playing the main score"): takes moved from the browser to `bank/panel_snapshots.json` through the panels' snapshot route (bucket `strikes`), with a one-time migration of the v1 localStorage takes, the server's name rule checked in the drawer, and a `×` delete; SPACE re-routed — a window capture-phase listener owns SPACE while the drawer is open, because the score's blur-every-select-on-change rule dropped the focus to the page body and the score's own SPACE handler took over. Reproduced, fixed and verified in the running app (RUNNING_LOG §65). Also answered: an instrument left out by the shuffle is hooked back in by hand — double-click the dot, click the player's row; the note folds by octave into range (↓ / ↑); nothing else moves (F, the two-click assign).
- 2026-09-04, session 3 — **Q v2** (composer: "have the time code carry with the strike … whatever save file's open, it can insert at that time code … rename the button, like, insert in original time"): `Replace in place` → `Insert @ 0.61 s (original)` — the label carries the strike's t0; it writes at t0 into whatever score is open, removing originals only where they truly exist (id + layer + pitch + onset within 25 ms), so the source guard is gone. Verified: into an empty score → 7 notes + META at 0.608 s, "no originals in this score"; into a copy of the committed ScatteredStrikes01 → "replaced 9 original notes". RUNNING_LOG §68. Built alongside D17 (the save system).
