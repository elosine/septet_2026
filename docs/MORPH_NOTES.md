# MORPH_NOTES — the central notes for the morph tool (this piece → the eventual revision)

> **Why this file (composer, 2026-09-06, CN-29):** *"I'm going to be using the morph textures a lot in the future for this piece
> and the next piece. I'd like to eventually make it an easier to use all purpose tool. But for now and maybe for the next piece,
> will adjust it for the current use, but I want to institute a process where we're taking notes in a central document that will
> inform the eventual revision."*

**The process (standing, from 2026-09-06; also in CLAUDE.md):** every remark about the morph tool — an awkwardness, a wish, a
piece-specific adjustment made, what an all-purpose tool would need — goes into §3 the moment it is said, dated, his words
verbatim, the AI's reading marked. The tool is adjusted for the current use in the app; this file is the memory for its revision
into an easy all-purpose tool, after this piece or the next. §3 is append-only, like the lab journal; §4 is the digest, rewritten
freely.

## 1 · What exists (2026-09-07 — the beating tool built, PLAN 1f steps 1–7; `docs/BEATING_TOOL.md` is its document)

- **The beating tool is this piece's morph tool** (the requirements talk 2026-09-06, RUNNING_LOG §145–166; built overnight
  2026-09-07 at his word, §167–174). The object is a *beating* — one pair of players on one pitch, both bending around it by
  mirrored curves, the gap beating — and a *pattern* is up to three of them under one META shape. What exists:
  - **the math** — `score/public/beating_calc.js` (page and tools): the palette (the six bending players, the ordinary voices'
    measured ranges, the bend limits, the pairing rule at unison and at the intervals), the conversion (a rate in beats per second
    ↔ cents against the centre on the interval's coincident partial; the register law inside), the heard beating from the two
    players' cents, the shapes, the mirror and the slide, the three breath modes and the seeded deal with a ceiling table, the
    re-key past the sampler's range, `renderPair` → each player's chain of notes with bend and level breakpoints, `renderPattern`
    (offsets, the META contour), `stretch`; `tools/beating_calc_check.js` (77 checks);
  - **the palette's numbers** — the recipe's `playerBendSt` (his semitone) · `bendRangeSt` measured by the bend probe run in the
    rack (SI2 flute ±2.00 st, the Xsample five ±0.96–0.99 — set to a semitone in Kontakt; RPN 0 ignored on all six; the residue
    real on all six) · `beating: false` on the piano; the probe kit `balance_schedule.js --bend` → `balance_probe.ps1` →
    `probe_run.sh` → `analyze_bend.py` (self-tested) → `bank/bend_ranges.json` → `apply_bend_ranges.js`;
  - **the object** — a zone `midiModel: 'beating'` with its `beating` block, on the launching lane, its partner's lane carried (a
    dashed bracket there); its notes generated at every play start into the zone's snippet — per-event routing for the partner,
    `_bend` events for the pitch bend through the measured range, CC7 through 1g's remap; the tick's bend branch, the centre after
    the end and on stop; B on a strike note makes one; the label; NAMING §2.10;
  - **the panel** — `score/public/beating_panel.js`: rows, the mirrored rate curves with handles on rails, the band tinted by zone,
    shapes and draw, the mirror lock and ALT-drag, the body slide, the crescendo lane, the breath lane with sliders / the ceiling /
    shuffle, the offset rail, the length box, SPACE (the pattern through the tick's event path), takes (`beatings` in
    `bank/panel_snapshots.json`); **the pitch side** — the strike menu from the bank, the keyboard with the chord lit and the
    unplayable keys dimmed, a note armed and clicked or dragged onto a pair, the relations from a root dealt and folded;
    **insertion** — insert @ playhead as one group with a META shape (the crescendo's mean), the shape's drag / stretch / delete
    carrying the beatings, re-insert replacing at the same time, select + P loading the group; nothing around it touched (§160).
- **The tuba piece's morph engine, still carried by the port and untouched:** `score/public/morph.js` · `morph_emit.js` ·
  `morph_panel.js`; a morph note's `morphBend` on the plain-note tick (its 1.99 st constant at `composer.html` ~10112 is the tuba's —
  the beating does not use that path); `resetMorphBend` (kept, now shared: the beating registers its slots there). Its documentation
  in #4 (`for_seven_tubas/docs`): `MORPH_FINDINGS.md`, `MORPH_NOTATION.md` (the notation form the beating will take at 2a),
  `CURVE_DATABASE.md`. The word-recipe panel is the tuba's; nothing of it was reused but the ideas (the carrier's breath rule, the
  bend hygiene, the timeline's pinning).
- **Not yet:** the notation (phase 2a, BEATING_TOOL §10); item 8's four held things (the shuffle as a writer, cycles for section 3,
  the training material, the notation); his listening at steps 3–7.

- **The dynamics are solved for any curve-driven object (2026-09-06, PLAN 1g, RUNNING_LOG §115–120):** `score/public/velocity_remap.js` gives
  a morph event its loudness in the ensemble's one scale — `velocityFor / cc7For` per note (attacks, trills), `heldNote / cc7ForHeight`
  for a sustained sound (the velocity for the top of its curve, CC7 following the height), measured per instrument and register
  (`bank/velocity_remap.json`). The morph's pitch bend rides on top; its loudness need not be designed again.

## 2 · For this piece — "morph events" (CN-28 · CN-29)

His picture: **single morph events** — e.g. unison → maximum beating, "like in convergence", over a set time — then **longer
ones**; **strikes with morph chords**, "freeze frames or old time slide show" (CN-28): each strike a slide, the morph the dissolve.

**The four elements, his:** (1) **the expansion of pitch to expand beating** — the glissando apart; (2) **the re-breath / re-bow**
("rebreath, so to speak, or rebo[w]") — the re-articulation; (3) **the crescendo**; (4) **the multiple pairs** — each pair with its
own glissando / beating pattern, not all following one curve. *"So those four things, how to arrange them in short events and over
longer events."* Short events: one breath, no re-breath, the pairs' glissando patterns differing. Long events: the same elements
with re-breaths.

**Open, for the requirements talk (PLAN 1f), when reached:** how a morph event is launched from a strike (the strike's chord → the
pairs?) · which pairs (fixed by instrument, or by the chord's voicing) · the per-pair curve (drawn? the curve windows A / B / C, as
the trills read them?) · the crescendo — CC7, velocity, or the samples' own dynamics · the re-breath rule (where, how often, staggered
between pairs?) · the beating measure (Hz from the cents apart, per register) · notation.

## 3 · Log (append-only; his words verbatim, the AI's reading marked)

### 2026-09-06 — CN-29, the note that made this file

> *"A to do note for later when we get to the morph section. I'd like to... I'm going to be using the morph textures a lot in the
> future for this piece and the next piece. I'd like to eventually make it an easier to use all purpose tool. But for now and maybe
> for the next piece, will adjust it for the current use, but I want to institute a process where we're taking notes in a central
> document that will inform the eventual revision. For this one, this piece. I want to create single morph events. Like, for
> example, going from Unison to max beating, beating, like in convergence. over a certain amount of time. And then longer ones. So
> I see the elements as the expansion of pitch to expand beating, the rebreath, so to speak, or rebo. and the Crescendo So a way to
> think about these three things in the short events or also the multiple pairs. So each pair might not be following the same
> glissando or beating glissando. So those four things, how to arrange them in short events and over longer events. I'm imagining
> shorter events. It's no rebreath, just one breath, but ways to work in different patterns of glissando for different pairs. Like I
> said, this is just a note. We'll tackle this in earnest when we get to the section."*
> *(2026-09-06, session 4, mid-session; speech-to-text, content untouched — "rebo" read as "rebow")*

**AI reading (not the composer's words):** two things at once — a process (this file) and the first requirements of the morph
event: four elements (pitch expansion → beating · re-breath / re-bow · crescendo · the pairs' own curves), arranged in short events
(one breath) and long ones (with re-breaths). Nothing built; the talk comes with the section (PLAN 1f).

### 2026-09-06 — the morph section opens: "spend some good time figuring out the requirements"

> *"ready to start the morph section, /plan-item 1f First, let's spend some good time figuring out the requirements. based on the
> things I want to do and our previous work in the morph section. So I'm gonna talk through this in some detail. But first, can you
> read up on the morph section from the tuba piece? Collect that data, understand how the panel works. And if you can look at some of
> the notes when we're building the panel and later how we used it, try to read some of the Journal And then when you've collected
> enough data or when you've collected that data, check back in, and we'll talk through some of the requirements. before we even
> enumerate a plan."*
> *(2026-09-06, session 4, evening; typed)*

**AI reading (not the composer's words):** the requirements talk comes first and in his detail; the AI's reading of #4's morph
material is its data (RUNNING_LOG §145). One fact from the read bears on the revision: #4's engine has no pair — voices are
scheduled one by one and a pair's gap, the audible thing, falls out (#4 day 13, finding 3; "cycling the pair's gap as a unit"
deferred there). His fourth element makes the pair the unit.

### 2026-09-06 — CN-33: the beating pairs in section 3's strike cycles; training the performers on the full beating curve

> *"composition note for third section cycles of strikes combined with crescendos using the beating pairs and then find a way to
> train performers the full curve of the beating So they'll know that the top of the curve or what the top of the curve sounds like."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — filed as CN-33)*

**AI reading (not the composer's words):** for the tool's revision, two consequences. The beating pairs are not only the morph
section's material — section 3's strike cycles carry them under crescendos, so a morph event must be placeable inside a strike
cycle, short, repeatable. And the tool's output is the source of a performer-training material: the full curve of the beating heard
as sound (bottom, middle, top), so that the written curve has a heard target. Neither is a build now; both are requirements to carry.

### 2026-09-06 — the anatomy, the name "beating", the scenario: the atom is a pair; a beating drawer

> *"Okay. Then let's discuss an anatomy of a morph event. and maybe come up with a different name. You can give me some
> recommendations. So as far as I understand it... so, actually, let's enumerate the elements, and you can help me. Just very simply.
> So as far as I understand, there's pairs, and they create beating between them. And then the second main element is the crescendo.
> That intensifies the beating or not. And then there is the the breaths or rearticulation. There's also the curvature. how... or
> what shape do players follow? they're in their glissando, their crescendo. And there's also the overlap. Well, there's overlap
> between players. So players on the same pair. I'm not sure if they always move together. or they were on different cycles. So did
> they achieve full beating at the same time? But there's definitely different cycles between different pairs. So if you have more
> than one pair, So I wanna talk about... no. Break it down. Figure out the elements, and then talk about how we can create shorter
> events and then what the dials are within those events. Like, if I create a six or seven second event, it could be something like
> start at a certain bidding rate more or less and then not move, or it can move the whole range, or it can move just a little bit,
> etcetera. Well, let's just start there. Let's break it down by elements and talk about what it might look like to build smaller
> events, and let's narrow down the name."*
>
> *"Okay. beating is good. Let's talk through the scenario. So in composing, when I'm using the beating machine, I want to try
> different things, and the atom will be a pair of players. MDI, the Adam could have various behaviors. So I could target a beating
> level, just a single one. So I suppose a analogy could be just simple crescendo so we can have the pair come in at a certain
> volume or beating level. It just maintained that or just burst it for a small duration. think of have the long arc like we did in
> the tube a piece or they can have shorter glissandos so move from one beating level to another. So like a convergence, move from
> unison to full maximum beating, but in a short duration. And then these atoms can interact so I could have, for example, in this
> piece, three pairs, and they could all come in together at their own beating levels, or they can overlap in different ways, or
> they can reach their full beating or back to unison in different arrangements. like, some sort of counterpoint. So, like, in the
> strikes, that turned out to be a useful drawer because I could assemble these patterns and do things like shuffle and then listen
> to it run away. and then create certain patterns and then listen to to that. So can we think about what this would look like for
> a beating drawer? And in a similar way that it's facile, I don't have to turn a lot of dials, and I can do shuffles and things
> like that. But it's just figuring out what the right thing to shuffle and what the right kind of order is. So help me organize
> this. tool just but talk about the architecture and try to build it one part at a time."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "bidding rate" = beating rate, "MDI, the Adam" = the atom,
> "tube a piece" = the tuba piece)*

**AI reading (not the composer's words):** the revision's shape, said by him: the object is a **beating** (the name decided), its
atom a **pair** with a behaviour (hold · burst · bloom · close · the long arc), the atoms arranged into patterns (entries together
or overlapping, the peaks and the returns to unison in arrangements — counterpoint), assembled in a **drawer** with few dials and
shuffles, as the strikes drawer. The seven elements and the architecture put to him are in RUNNING_LOG §146. For the all-purpose
tool: the tuba's six models become patterns of this atom (BLOOM = every pair blooms, staggered), which is the inversion #4's day 13
found missing — the pair as the unit.

### 2026-09-06 — the beating panel: pairs as mirrored curves with handles on rails; the shuffle parked

> *"Okay. Then maybe I have, like, a screen, a panel, and I can see the pair represented. by some sort of curve, for example, or if
> it's just on or off, it'll look like a square wave. And then between the pair, I can slide the waves. So if I want them to not be in
> sync, I can. And one will be... it'll be bipolar. So one... if it was a sound... sign wave, one will go up, and the other will go
> down. and that's how they reach max beating. So for example, if it was like the convergence, it would be a hump up and a hump down,
> and there would be in phase reaching the peak Nadir together. But I can slide one over so that they are out of phase. They reach the
> peak at different times. and then a similar layer, which represents the crescendo. And I guess we can just use the... to draw the
> initial ones. We can use the curve tool that we... I've been using for the trills. And then I can... there's three of these, so I
> can use all three or not, three pairs. but then I can slide once I've... I have established the pairs and their configuration. I can
> slide the whole pair. And then I can audition this at any time. And then maybe we should have some preset curve so I don't have to
> draw a curve every time. but I have the option of redrawing the curve. So maybe hold on the shuffle for now. This seems to be a
> different model, but we'll bring it back in if necessary. But, for example, there'll be some efficiency if I can select curve
> shapes. So, like, if they're just coming in at one level, it'll be, like, um, a square wave, and I can just grab the top and bring
> it to a different level. And then everything could be an easy slide, like on rails, and everything should have handles. So if I want
> to grab... if I'm working with one pair, I want to grab one curve. See, the bottom one, I move it over. I could just grab a handle.
> And same with the read breaths and same with the crescendo. So something like select the part, click on a curve shape. It pops in.
> I can re... easily resize it and reshape it, and then I could slide it, like, on a rail. And this will all be in real time so I can
> just hit space bar to play that configuration. And then if I find a configuration that I like, I can audition that configuration
> over different durations. relatively quick... quickly, like, type in iteration and then that same shape, whatever configuration I
> made will play over that duration. So give me your read on this and any additional insider input that you may have."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "sign wave" = sine wave, "read breaths" = re-breaths, "type
> in iteration" = type in a duration)*

**AI reading (not the composer's words):** the interface for the all-purpose tool, in one picture: a row per pair, the pair as two
mirrored curves slid against each other (the phase inside a pair a handle, not a number), a crescendo layer and a breath layer, shapes
from a menu with handles on rails, freehand redraw with the curve tool, a whole pair slid in time, the space bar, a typed duration.
The shuffle of §146 parked, to return as a writer into the same rows. The AI's insider input (RUNNING_LOG §147): show the derived beat
rate per pair (the difference is what is heard); draw in beats per second so the register law is the tool's; both players bend by the
picture, one flat = the anchor form; the pitch and the two players per row; breaths per player; the curves live in the object, edited
on P; the duration box = the trill's live curve.

### 2026-09-06 — pitch: the strikes menu → the keyboard → a pitch per pair; the sonority between pairs; intervals inside a pair; the axis in beats per second

> *"Okay. Good. So the one thing I didn't talk so much about is pitch. So we should have some sets of pitches that are easy enough to
> choose. So maybe something like, I think, um, strikes works well, or you have the menu of strikes, the one through forty five or
> whatever. And then if I click one of those, it appears on the keyboard. And then I can assign a pitch to a pet, and then they'll
> hover around that pair... or around that pitch. So it's more the cord or minority, the cord or minority, the c h o r d or s o n o r
> i t y. is between the three pairs. So let's include the ones we did for the tuba piece. the thirds, fifths, and just Unison. But
> then the relationship... let's say the relationship could be between the three, could be fifths, could be thirds, could be
> something else. And then internally, there's Unison, but I also would like to try fourths, fifths. and see how beating sounds at
> that interval as well. and showing the beating is good. Let's try to find an elegant way to do that. Sure. The access should be
> beach per second. That's fine. And then let's discuss what insertion would look like into the main score. Okay. This sounds pretty
> clear. let me know if there's anything else to think about. And then if you could organize the top line sections for plan, and
> we'll go through them one by one. So we... first, any questions or any additional things. The next, let me see the plan top line in
> order, and then we'll investigate them one by one."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "a pet" = a pair; "the access should be beach per second" =
> the axis should be beats per second)*

**AI reading (not the composer's words):** two decisions and a model. The axis is beats per second (the tool converts). The pitch
model: the strikes menu feeds the keyboard, a centre pitch per pair, the sonority between the pairs (unison, thirds, fifths, other),
the interval inside a pair (unison, fourths, fifths, thirds to try). For the all-purpose tool: a pair's interval is a parameter, and
the beating at an interval is between coincident partials (3× / 4× / 5× the unison's rate per cent at the fifth / fourth / major
third, fainter, timbre-dependent) — the arithmetic and the insertion picture are in RUNNING_LOG §148.

### 2026-09-06 — the pitch set holds the strikes' chords; the piano out of the beating; step 1 opens

> *"In the pitch set, let's include the forty five or forty six play courts for the strikes. In addition to those other
> similarities. sonorities; So the piano probably won't be used in the beating. I'll use it in the main score in other ways. And then
> good for step one."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "play courts" = played chords, "similarities" = sonorities)*

**AI reading (not the composer's words):** the pitch set = the strikes' played chords (the bank) + the relations; the piano is out
of the beating altogether (no anchor role), which leaves six players → up to three pairs; the top line of RUNNING_LOG §148 stands
and phase 3 begins at step 1, the palette.

### 2026-09-06 — the bend: as the string quartet did it; a real player's range, within a semitone

> *"So we did string probes for the string quartet, or we figured out how to use pitch bend and to reset it, etcetera. So if you
> could look there and figure out how we did pitch bend there. And then I imagine it's the same with UVI, but we should figure that
> out and then just use the realistic range for a real player. So it's embrachure bend, really. but we don't need much movement to...
> for the beating. usually within semitone at the most. then 1 good"*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched)*

**AI reading (not the composer's words):** for the all-purpose tool, the bend range is two numbers per instrument — the sampler's
(measured by a probe; #1's Xsample ran at ±1 semitone, #4's UVI at ±2) and the player's (his rule: within a semitone, the winds by
embouchure) — and the tool's ceiling is in beats per second with the cents shown. #1's convention (bend before the note-on, centre
after the note-off, re-key past the range) is the one to keep. RUNNING_LOG §150.

### 2026-09-06 — the breaths: single events on one bow; long events with the dotted go lines on sliders, a maximum-length warning, continuous or designated, a shuffle for the breaths

> *"So there'll be single events. We talked just on one bow or breath. There'll also be potentially longer events. And in that,
> let's bring in the indicator from the tuba piece. This was just the dotted go line, and then those should be on sliders two where
> we can just move when the breath happens. And there should be some sort of warning or indicator or something so we understand
> maximum breath length or bone length. So we can indicate continuous and just let the performer rebo when they will, or we can also
> designate when the bows should change, and those would be the dotted line. Oh, and this would be an opportunity for the shuffle.
> So I'm not sure how we determined read breaths and stagger in the tuba piece, but have something similar. So I don't have to
> actually place each breath, but I can have a shuffle where the breaths are staggered and the appropriate length, same with the
> bows. Otherwise, good to go."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "bone length" = bow length, "rebo" = re-bow, "read
> breaths" = re-breaths)*

**AI reading (not the composer's words):** the breath layer of the all-purpose tool: three modes per player (one breath ·
continuous, re-bow at will · designated, the marks as dotted go lines on sliders), a ceiling per instrument with a warning, and a
seeded shuffle that deals staggered breaths of the right length — the tuba carrier's rule (RUNNING_LOG §152) made visible and
movable. The shuffle returns here first, for the breaths, before any deal of pairs.

### 2026-09-06 — the beating out of the strike chain: its own thing

> *"Let's actually keep the beating out of the strike chain so unlike the trails. Trellis we'll just add accents manually, but it
> doesn't have to do things like avoid overlaps and gray out notes. I'll just... it'll just be its own thing."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched — "trails", "Trellis" = trills)*

**AI reading (not the composer's words):** a boundary for the all-purpose tool: the beating does not chain to the strikes as the
trill does (no mute rule, no eating, no exit at the next strike, no overlap avoidance); it is placed at the playhead and lives as
its own group; the accents are the composer's, by hand. The tool stays simple and general; the piece-specific links are left out
rather than adjusted. RUNNING_LOG §160.


### 2026-09-07 — the panel full page, the fonts up (his first remarks after the build)

> *"where is the panel?"* — then — *"lets make the panel full page like strikes and increase all fonts  if 12 then 14 if 14=18 10=12"*
> *(2026-09-07, morning, his check-in after the overnight build; typed)*

**AI reading (not the composer's words):** two things for the all-purpose tool. (1) A floating box at the top right was not found —
the working panels of this stack are full-width drawers from the bottom (the strikes drawer), and the composer expects the beating
panel where the strikes are; the panel becomes a full-page drawer with the same half / full toggle and a bottom tab. (2) The
fonts: his mapping 10 → 12, 12 → 14, 14 → 18 (the panel used 8–11 px; applied as 8 → 10, 9 → 11, 10 → 12, 11 → 13) — a readability
floor for every panel of the tool, with the row drawings widened to the page. RUNNING_LOG §175.

### 2026-09-07 — a trapped note

> *"midi note trapped won't stop playing"* *(2026-09-07, morning, testing the beating on his server; typed)*

**AI reading (not the composer's words):** the first long notes through the scheduled-ahead path: a stop cancelled their pending
note-offs (`clear()`), and the all-notes-off after it is ignored by the Xsample instruments. Fixed for every long note (remembered
and released on stop) and a ■ Panic button added; `probes/panic.ps1` for the rack alone. For the all-purpose tool: a sustained note
must always have its own release path — never rely on CC123. RUNNING_LOG §176.

## 4 · For the eventual revision (the digest — rewritten freely)

- *(seed)* A morph event as ONE object: pairs · a glissando / beating curve per pair · a re-articulation pattern · a dynamic curve ·
  a duration — instead of the tuba piece's per-note bends assembled by hand.
- *(seed, from #4 day 13 finding 3, read 2026-09-06)* The PAIR as the scheduled unit — its gap (the beating) designed, not fallen out
  of two independent staggers; cycling the pair's gap as a unit = the true repeated bloom #4 deferred.
- *(seed)* The all-purpose form: instrument-agnostic pairs, the bend range from the recipe, the curves from the score's curve
  windows, the notation as a rate / beating curve (as the trill's `tr` + span).
- *(from the build, 2026-09-07 — what the all-purpose tool has now and what it still lacks)* **Has:** the pair as the unit, its gap
  designed (the mirrored curves, the phase slide); the axis in beats per second with the register law inside; the interval inside a
  pair on the coincident partial, the just interval as the zero; the palette from the recipe (the ranges and the bend limits
  measured, the pairing table computed, nothing instrument-specific in the tool); direct manipulation (handles on rails, shapes,
  draw, the mirror lock); the breaths as a model (one · continuous · designated; a seeded deal with hand marks kept; the ceilings
  as a table to tune by ear); the pattern as one gesture (the group with a META shape, the drawer's re-insert rule); takes.
  **Lacks, for "an easier to use all purpose tool":** more than three pairs (the six players is this piece's cap); a player in two
  pairs; a flat partner as a first-class row mode (it is `share` 0 / 1 — the panel has no button); the cycling of the pair's gap as a
  unit over a long event (the tuba's out-and-back at the timeline level — here a hump or a drawn curve does it once); the shuffle as
  a writer (item 8); the crescendo's own dynamics layer per pair with phase (the tuba's D24 — here the crescendo follows the beating
  or is drawn); the exit as a rule (a release to unison and the floor — here the curve's own end); the notation; a way to hear a
  pair's beating rate as a number while the score plays (the readout is the panel's, before playing); the ceilings by register and
  by loudness measured, not defaulted.
- *(2026-09-07, his first remarks)* **The panel is a drawer from the bottom, full page, like the strikes — not a floating box**; the
  composer looks for a tool where the strikes are. And a readability floor: no font under 10 px in a panel, the base 13, the
  buttons 12 (his mapping 10 → 12, 12 → 14, 14 → 18).
