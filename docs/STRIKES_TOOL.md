# STRIKES TOOL — requirements, gathered piece by piece (PLAN 1c.2)

> Opened 2026-09-03. The composer builds this tool WITH the AI, one requirement at a time:
> *"gather these requirements and organize them for now, and I'll give some more, piece by
> piece."* This file is the organized list — the composer's words verbatim in quotes, the
> AI's reading and implementation notes marked as such — and it grows as the tool does.
> Status per item: `wanted` → `built` → `seen by the composer` → `accepted`.
> The database behind it: `bank/scattered_strikes.json` (tools/strike_db.js, RUNNING_LOG §36).
> The v1 panel (`score/public/strike_panel.js`, §37) is the starting point and is rebuilt
> around these as they land.

## A · The keyboard view — `wanted`

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

## B · Voicing presets — `wanted`

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

- *AI notes:* a preset = a VOICING transform on the strike's pitch-class content (D11 of the
  tuba piece: a voicing is the pitch set only; articulation and dynamics are a separate
  layer) — the harmony stays, the octaves move. "Spread" has a precedent in
  `tools/vert_bank.js` v2 (octave displacements, max–min spread greedy). "Cluster together"
  needs one decision (asked below): chromatic packing (semitone-adjacent within an octave)
  or the played intervals compressed. Presets are data (a small table of named transforms),
  so adding one is a line, not a build.

## C · Reshuffle — `wanted`

> *"I want the ability to reshuffle any of these. So if it's a cluster high, then I can just
> hit reshuffle, and I'll just reshuffle the notes into a different high cluster."*

- One button: re-randomize the current preset's realization under its own constraint (a
  different high cluster, a different even spread …); the harmony never changes.
- *AI notes:* each preset exposes a random seed / a "variant" counter; reshuffle advances it;
  the keyboard redraws. The seed is kept with the strike so a liked shuffle can be inserted
  and recalled.

## D · Carried over from the first ask (RUNNING_LOG §33) — `built (v1)`, to be re-fitted

- Per-note instrument / octave / technique assignment; Hear through the rack; Insert at the
  playhead as a gesture (groupId + META shape); time × / warp / rhythm-only; the redaction
  groups. All in the v1 panel; their place in the new layout is decided as A–C land.

## E · The orchestration panel — `wanted`

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

## F · Ranges — `adopted 2026-09-03`

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

## G · Audition modes — `wanted`

> *"I want to be able to hear the chord, audition it, and then if I want to reorchestrate.
> And same with the piano part too — let's have that just be piano, and I can listen to the
> harmony as a piano, or I can listen to orchestrated."*

- Two Hear modes: **piano** (every note of the strike on the piano lane, the harmony alone)
  and **orchestrated** (the current assignment through the rack). Both from the same button
  row; the timing transforms apply to both.

## H · The piano's part — `adopted 2026-09-03`

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
## I · Double stops — `wanted 2026-09-03`

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

## J · The rhythm column — `wanted 2026-09-03` (transforms proposed, awaiting the composer)

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

## K · The order of the notes — `wanted 2026-09-03`

> *"I should be able to scatter the order. I think I'm mostly playing, in the original, down
> to up, but I can scatter which notes come first, in different orders. Again, a shuffle and
> then some sort of manual override where I can move things about."*

- The decomposition: **J is the onset PATTERN** (where the ticks fall), **K is the ORDER**
  (which note takes which tick). Each shuffles on its own.
- Presets: as played · low → high · high → low · outside-in · inside-out · random.
  **Shuffle** draws a new order; the ticks stay. **Manual:** drag a dot to another tick
  (snaps to slots) or click two dots to swap; a **lock** pins a dot's slot through shuffles
  (as the top / bottom locks do in the orchestration).

## L · The model in one sentence — `confirmed 2026-09-03`

> Composer: *"Can we flatten both? So the pitches get distributed — there's eleven, and any
> pitch can go to any of the players — and then the scatter rhythm is the x axis: any of the
> rhythmic positions can go to any of the pitches, to any of the players, not necessarily the
> way they're shown here or the way I played them. Is that correct?"* — Yes.

- **Three independent lists:** the PITCHES (the strike's harmony), the ONSETS (its rhythmic
  positions, with the live 60 ms bands), the PLAYERS (seven). The tool pairs them; every
  pairing is free — pitch ↔ onset (K), pitch ↔ player (E), ranges permitting (F). "As played"
  is one pairing kept as a preset. The bands belong to the onset list alone; whatever pitch
  lands inside one lands on that attack.

## M · The harmony collection as a source — `wanted 2026-09-03` (= PLAN 1d, seen from the tool)

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

## N · Choosing a harmony: orchestrating it into the strike — `adopted 2026-09-03`

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

## O · Not losing work: takes — `adopted 2026-09-03`

> *"I don't want to lose work. Say I take the original, orchestrate, find a rhythm, listen —
> then I decide I want to listen to it in a different harmony. It may not fit the orchestration,
> but I don't want to lose what I built, and I want to easily hear my choices, and go back."*

- *AI proposal:* the tool's whole state — harmony, onset pattern, order, orchestration, piano
  and double-stop flags, transforms, seeds — is a **take**. `Save take` names it (the panels'
  snapshot loop, `bank/panel_snapshots.json`); the take list is a drop-down; `Load` restores
  one; switching the harmony is non-destructive (N) and an automatic `previous` step keeps the
  last state so `back` is one click. A take can be inserted into the score at any time.

## P · The Messiaen modes — `wanted 2026-09-03`

> *"Messiaen — and there's more than mode three. I think we end up using all the modes … it
> might have been in the multitempo parts where it was distributed across time, not in one
> chord. So those aren't really chords, but maybe we can add them: pull in all the Messiaen
> modes, and we can just use your attrition strategy, or the shuffle can randomly choose what
> to drop."*

- All seven modes of limited transposition in every transposition (2 + 3 + 4 + 6 + 6 + 6 + 6 =
  27 pitch sets) enter the collection as harmonies, tagged `messiaen m3/F` etc. More notes
  than players → N's attrition: the shuffle drops at random, or the piano's flags take the rest.

## Q · Linked to the score — `wanted 2026-09-03`

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

## Open questions for the composer (only what blocks the next piece)

1. **"Cluster together":** chromatic — the pitch classes packed semitone-adjacent inside one
   octave — or the played chord squeezed by moving only the outliers in by octaves?
2. **Keyboard range shown:** the whole piano (88) or the ensemble's span (C1–C7)?

## Log

- 2026-09-03 — A, B, C stated by the composer; D exists as v1. Nothing built against A–C yet.
- 2026-09-03, later — E (orchestration panel) stated; F (ranges) proposed and adopted; G (audition modes) stated; H (the piano's role) raised, a four-way switch proposed, then replaced by the composer's push ("a different organization or logic?") with the SELECTION logic — flags per note, click-to-toggle, quick buttons — adopted; a shuffle starts the piano on one note. I (double stops on the strings) wanted, same flag mechanism.
- 2026-09-03, later — J (the rhythm column) stated; layout and a transform set proposed. Process change (composer): commits and pushes are batched every few exchanges, not per reply.
- 2026-09-03, later — K (order of the notes) stated; presets, shuffle, drag / swap, lock.
- 2026-09-03, later — J rule: the redaction grouping is live, re-derived after every transform.
- 2026-09-03, later — L: the three-list model confirmed by the composer.
- 2026-09-03, later — M (the harmony collection as a source; index proposal), N (harmony swap by voice rank), O (takes) recorded; N and O proposed.
- 2026-09-03, later — N, O adopted; P (all Messiaen modes) and Q (linked to the score; step one = pick the strike in the sequence) recorded.
