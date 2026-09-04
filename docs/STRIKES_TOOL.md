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
## Open questions for the composer (only what blocks the next piece)

1. **"Cluster together":** chromatic — the pitch classes packed semitone-adjacent inside one
   octave — or the played chord squeezed by moving only the outliers in by octaves?
2. **Keyboard range shown:** the whole piano (88) or the ensemble's span (C1–C7)?

## Log

- 2026-09-03 — A, B, C stated by the composer; D exists as v1. Nothing built against A–C yet.
- 2026-09-03, later — E (orchestration panel) stated; F (ranges) proposed and adopted; G (audition modes) stated; H (the piano's role) raised, a four-way switch proposed, then replaced by the composer's push ("a different organization or logic?") with the SELECTION logic — flags per note, click-to-toggle, quick buttons — adopted; a shuffle starts the piano on one note.
