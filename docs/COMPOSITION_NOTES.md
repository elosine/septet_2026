# COMPOSITION NOTES — the sketch pad

> The composer's musical ideas, **verbatim** (cleaned from speech-to-text, content
> untouched), dated, numbered CN-N, the moment they are said. The AI may add a reading
> under each, marked as its own. **Append-only.** The structured outline that grows from
> these lives in `PLANNER.md`; the process record lives in `RUNNING_LOG.md`.

---

## CN-1 · 2026-09-03 — the opening

> *"Initial ensemble attack, directly into a series of curve-based tremolos. Tremolos have
> fortepiano entry — so attacked entry, and then continue in tremolo. Create a type of
> tremolo fugue, and have this resolve into a density-build sound mass like the tuba piece."*

**AI reading (not the composer's words):**

- Four events in a chain: **attack → curve-tremolos (fp entries) → tremolo fugue → density
  mass.** The chain is the tuba piece's grammar (attack species, swell clouds, density
  builds) on a heterogeneous ensemble.
- **Every instrument here has a native tremolo/flutter** in the libraries on hand: strings
  `tremolo`, `ordinario-to-tremolo`, `sul-ponticello-tremolo`, `artificial-harmonic-tremolo`
  (SI2); flute `flatterzunge`, `ordinario-to-flatterzunge` (SI2); bass clarinet flutter
  presets #5/#16/#34 (Xsample); piano tremolo = repeated-note generation (the pulse/texture
  engines from #4). So the tremolo fugue is playable in the sandbox on day one of phase 1.
- **"Curve-based"** is open: the curve could drive tremolo speed, amplitude envelope, pitch
  spread (a bloom, as in #4's morphs), or the fp decay. The tuba piece's `compiler.js`
  already schedules peak-anchored grain envelopes (surge, expodec, sine…) — a fortepiano
  entry that continues is an *expodec with a floor*. Candidate first sandbox experiment.
- **The fugue** implies a subject and staggered entries across seven voices — with a
  pitch subject, the sandbox needs pitch transforms (transposition, inversion) early; with a
  textural subject (a tremolo shape), it needs the curve tools first. The composer's call.
- **The density build** has a measured recipe in #4 (`CURVE_DATABASE.md` MAXDENSE-1 /
  BUILD-1, laws L1–L4); the question for this ensemble is how seven unlike instruments
  saturate versus ten tubas — a listening question, not a porting one.

---

## CN-2 · 2026-09-03 — the flute doubling, undecided

> *"The flutes — I'm not sure yet if I'm using piccolo or bass flute, but you're right, it's
> on the same track in the score, so we'll just make those adjustments if the time comes."*

**AI note:** the track is modelled so either can be added as a switch later (journal D6);
nothing in the port depends on the choice. SI2 has neither instrument, so the choice also
names a library to confirm.

---

## CN-3 · 2026-09-03 — tempos that converge

> *"Try ensemble playing different tempos, then accelerate or decelerate and hit the same
> tempo in unison at some point in the future. Use the bouncing ball for the tempos on either
> side and then a curve for acceleration and deceleration. Performers will have to practice
> the degree of accel or decel to get from one tempo to the next in that much time. The curve
> will assist."*

**AI reading (not the composer's words):**

- **Three devices, two of which exist.** The bouncing ball is the GC (`notation/lib/gc.js`,
  ported whole from piece #1: arc, impact marker, ball, magenta) — one per part, bouncing at
  that part's tempo. The curve is the notation's continuous channel (NOTATION_ARCHITECTURE
  amendment 1: *"the performer expressing the curve"*). The new thing is the **tempo ramp**:
  a per-part tempo function from A_i to the shared tempo B at a meeting time, with the ball's
  bounce period following it.
- **The audition rig is halfway there.** `multitempo.js` (PLAN 2ac from #4) already plays N
  pulse streams at integer-ratio tempi (3:4:5 …) and the composer listens to the composite;
  it has no accel / decel and no convergence — its ratios are constant and realign every
  common cycle. A "ramp" segment (period from a curve, ending on a common downbeat) is a
  small addition to a pure, tested engine: the first sandbox experiment for this idea.
- **The arithmetic the curve carries.** The beats a part plays during its ramp are the
  integral of its tempo curve, so "arrive at the same tempo" and "arrive on the same beat"
  are two different constraints; a linear ramp fixes the beat count, and making every part
  land ON a beat at the meeting point constrains each curve's shape. That is exactly what the
  performer practises and what the drawn curve assists — and the tool can compute it, and
  print the beat count under each ramp as a derived mark.
- **For the notation stack (2a):** the IR's tempo map is constant per chunk today
  (`anchorSeconds` / `unitSeconds` / `beatSeconds`); a ramp needs a tempo FUNCTION per chunk
  (from · to · shape). The tuba piece left "tempo scope: per chunk, per part or
  ensemble-shared" open (its §8 row 8); this idea answers it for this piece: **per-part
  rulers that converge into one shared ruler**, and back.
- **Where it could sit:** after CN-1's density mass, as the way out of it — or as the
  tremolo fugue's stretto. The composer's call; the sketch pad keeps both.

---

## CN-4 · 2026-09-03 — heterophony, bass clarinet and piccolo

> *"Heterophony between bass clarinet and piccolo. Close micro counterpoint. Like, interactive
> looping line."*

**AI reading (not the composer's words):**

- **A duet texture, the thin opposite of CN-1's mass and CN-3's whole-ensemble convergence:**
  one line shared by two players three octaves apart (bass clarinet, standard zone MIDI 34–65;
  piccolo above the flute's 59–96), each varying it — heterophony as register-displaced
  variants of the same loop rather than independent voices.
- **"Micro" reads two ways, and the libraries allow both:** micro-INTERVAL — the Xsample bass
  clarinet has a quarter-tone/gliss preset (`gliss_undef`) and bends about 1–2 semitones, SI2's
  flute has `Ordinario quarter-tone`, and every S1 object can carry a bend (the morph bend
  path) — or micro-TIMING — the two lines a few tens of milliseconds apart, drifting. The tuba
  piece's `phase_shift.js` (PLAN 2ad: drift as a phase machine) is built for the second
  reading; the first needs per-note bend in the recipes (0c).
- **"Interactive looping line":** a loop both players own, each answering the other's variant
  inside it — in the sandbox that is a captured motive (the motive library) played on two
  lanes with per-lane transforms (offset, ornament, inflection); the pulse sequencer gives the
  loop its pulse. Playable early in phase 1 with the tools as ported.
- **A shared timbral vocabulary makes the heterophony more than pitch:** both instruments have
  flutter (`flz` / `flutter_mw`), key noise (`key_click` / `key_noises`), air (`aeolian` /
  `air_noises`) — the variants can differ in colour while the line stays one.
- **A signal for CN-2, not a decision:** this idea names the piccolo. If it stands, the flute
  doubling is piccolo and the piccolo library is the one to confirm (SI2 has none).

---

## CN-5 · 2026-09-03 — scattered strikes

> *"Scattered strikes. Not quite unison strikes. Each player slightly offset."*

**AI reading (not the composer's words):**

- **An ensemble attack that is not one attack:** seven players hitting the same moment with
  small, deliberate offsets — a smear of onsets tens of milliseconds wide rather than a chord.
  The tuba piece's density machinery already thinks in onset scatter (the cloud and blast
  placement, `assignBlast` with its occupancy tiers); here the scatter IS the gesture.
- **It is CN-1's opening attack, re-read:** "initial ensemble attack" could be exactly this
  — the unison that isn't. And it pairs with CN-3: the same players who will later converge
  in tempo start by not quite coinciding.
- **Notation:** the animated score can show the offsets literally (seven go-lines a hair
  apart); the print score needs a device for "not together" — an arrow-spread, a bracketed
  smear, or seven independent grace-note distances. A 2a question when the first such
  strike exists.
- **Playable now:** a blast with per-lane start offsets is a one-parameter extension of the
  blast panel (a scatter width, random or shaped).

---

## CN-6 · 2026-09-03 — strikes, then chosen harmony, then tremolos on curves

> *"Play a number of scattered strikes in time. And then after, find a way to choose harmonies
> and orchestration and then play series of tremolo curves or tremolos on curves between. The
> strings get taken over by tremolos."*

**AI reading (not the composer's words):**

- **A three-stage form, and it braids CN-1, CN-3, CN-5 into one arc:** (1) scattered strikes
  (CN-5) — the not-quite-unison attacks; (2) a harmony/orchestration is CHOSEN out of what the
  strikes leave ringing; (3) tremolo curves grow between the struck points and take over — the
  strings first, per the last line. This is CN-1's "attack → curve-tremolos → tremolo fugue"
  said again with a middle step made explicit: the harmony is selected, not pre-composed.
- **"Choose harmonies and orchestration" wants a TOOL, and #2 built one:** the chord/harmony
  selection machinery of `composition_for_two_pianos_and_two_percussion` (chord shapes, sets,
  cells; the pitch/harmonic set databases already in this app's save schema — `databases:
  {chordShapes, sets, cells}`). The step is: from the strike pitches, pick a sonority and an
  orchestration (which players hold which notes), then hand those notes to the tremolo curves.
- **"Tremolo curves / tremolos on curves":** the curve drives the tremolo — its speed, its
  swell, or the pitch it tremolos around — exactly CN-3's curve-as-instruction and CN-1's
  curve-based tremolos. Every string preset here has a Tremolo family (Xsample #22–26, plus
  Sul Ponticello Tremolo, Artificial Harmonics Tremolo); "taken over by tremolos" is a
  cross-fade from struck/arco material into the tremolo presets on the curve channels.
- **Playable path:** strikes = a scattered blast (CN-5); harmony choice = the chord tools;
  the tremolo takeover = curve objects with a tremolo technique whose density follows the
  curve. The one new instruction is "tremolo speed from the curve," a small engine addition
  kin to the multitempo ramp (CN-3).

---

## CN-7 · 2026-09-03 — a circular cycle of strikes

> *"Circular cycle of strikes. Tremolos interrupted by strikes, and interrupted by
> accelerations, which end in strikes or tremolos."*

**AI reading (not the composer's words):**

- **A cycle, not a line:** three states — STRIKE, TREMOLO, ACCELERATION — that hand off to
  each other: a tremolo is cut by a strike; a tremolo is cut by an acceleration; an
  acceleration lands on a strike or dissolves into a tremolo. It closes on itself, so the
  form can turn any number of times and exit from any state.
- **Every element is already named on the sketch pad:** the strikes (CN-5, scattered; the
  1c database), the tremolos on curves (CN-6), the accelerations (CN-3's ramps, per player or
  ensemble-wide). CN-7 is the grammar that binds them.
- **"Interrupted":** the cut is the event — a tremolo does not resolve, it is stopped. That
  argues for hard edges (a strike as a secco cut, D11's curve channels making the cut clean
  regardless of what was ringing) and for accelerations that can end on either exit, decided
  late.
- **For the tools:** the three states map onto three generators — the strike panel (1c), the
  tremolo curve, the tempo ramp — and a "cycle" is a sequence of them with transition rules;
  a small state-machine sketch could audition whole cycles before any is composed by hand.

## For the NEXT piece (not this one) — noted here so it is not lost

- **2026-09-04, composer, verbatim:** *"note for next piece: lake George piece, pairs, eng
  horn/bassoon, horn/trumpet, cello/bass + percussion. start with morph section"*
  — *AI reading:* piece #6, the "Lake George" piece: three PAIRS (english horn + bassoon ·
  horn + trumpet · cello + double bass) plus percussion; its opening section built from the
  MORPH device (piece #4's morph panel, carried in this stack). Filed in the journal §7 too.
- **2026-09-04, composer, verbatim:** *"comp note lake george: make this a delicate, quite piece with
  very interesting textures and timbres, but continuous, not sparce"* — *AI reading:* the character of
  piece #6: delicate and quiet, its interest in texture and timbre rather than event density — and
  CONTINUOUS: a sustained fabric, never sparse, never pointillist.
- **2026-09-04, composer, verbatim (session 3, at the start):** *"This is for the Lake George piece to
  explore different types of conductions, animated conductions for delicate, quiet things. I'm
  imagining a gesture where I... a conducting... a human conducting gesture where I with both hands
  close my thumb and my index finger and then lift up my hands slightly and open my thumb, my finger
  away from my thumb. My fingers away from my thumbs. Find a way with AI to either do a frame by frame
  from video or some way to trace this gesture and then try to reanimate it."*
  — *AI reading:* an ANIMATED CONDUCTION vocabulary for piece #6's delicate, quiet material — the
  conductor's gesture itself as the cue, animated in the score. The first gesture: both hands, thumb
  and index finger pinched closed → a slight lift of the hands → the fingers open away from the thumbs
  (a release, a bloom — the natural cue for a soft entry that opens). The method: film the composer's
  own hands, trace the gesture per frame (hand-landmark tracking — the per-frame hand pose a library
  such as MediaPipe Hands extracts — or manual frame-by-frame tracing), then re-animate it as a
  simplified figure in the animated score, timed to the music. Belongs to piece #6's kit; nothing to
  build in the septet.

## CN-8 · 2026-09-04 — the piece begins: the first three strikes, orchestrated

- **Composer, verbatim (session 3, evening):** *"the save file called scattered strikes zero one a
  dash three. Could you remove all the piano struck cords from that one? So just keep the first
  three strikes. and then save it as a piece. I forgot how we were naming the pieces, but this will
  be the first iteration."*
  — *AI reading:* the piece's first file is born from the scattered-strike experiment: strikes #0,
  #1 and #2 as the composer orchestrated them in the drawer (seven players each, with their META
  shapes), and nothing else — the 554 raw piano chords that followed are dropped. `piece-septet`
  is the running file; `piece-septet-v1.1` the frozen first iteration (D17 naming). CN-5 / CN-6
  (strikes, then chosen harmony, then tremolos on curves) is the road from here.
- **2026-09-04, composer, verbatim (later):** *"could you restore scattered strike zero one to the original
  Recording. That'll be the piano reference."* — *AI reading:* `ScatteredStrikes01` is the untouched
  recording of the 46 strikes (577 notes, 73 s), the source the drawer reads and the reference the piece
  is orchestrated against; the orchestrations live in `piece-septet`, never in the reference.

---

## CN-9 · 2026-09-04 — the piccolo–bass clarinet looping line: grace-note figures, after Ferneyhough

> *"Composition note for the piccolo / bass clarinet interactive looping line: use — and figure
> out notation for — grace-note figures. See Ferneyhough, Transcendental Etudes, number one.
> Oboe part."*
> *(dictated 2026-09-04 night, session 3, after the checkpoint; cleaned from speech-to-text,
> content untouched)*

**AI reading (not the composer's words):**

- **This is CN-4's line given its surface.** The heterophony between bass clarinet and piccolo
  (one loop, two players three octaves apart, each varying it) is now ornamented: the loop's
  notes carry grace-note figures — flurries of small notes crowded into the host notes. In the
  strict sense that IS heterophony: one line, decorated differently by each player at once. The
  figures are where the two variants of the shared line diverge.
- **The model named:** Brian Ferneyhough, *Etudes Transcendantales / Intermedio II* (1982–85,
  mezzo-soprano · flute · oboe · cello · harpsichord; nine études, part of the *Carceri
  d'Invenzione* cycle) — the first étude, the oboe part. What to take from it is the notation,
  not the style. Read from the score itself, not from memory: how a group of small notes
  attaches to its host note · the slashed beam and its direction · whether the group takes its
  time from the note before it or the note after (the front-matter performance note settles
  this) · how the figures sit against nested tuplets and slurs · how accidentals and
  articulation ride on the small notes.
- **Two halves, two places:**
  - *Composing it (phase 1, now):* the S1 save can already carry a grace-note figure — a few
    very short objects a few tens of ms before a host note, sharing its `groupId`; the drawer's
    rhythm column (STRIKES_TOOL J: shape · amount · jitter, the span compressed to nothing) is
    most of the generator. The loop itself is CN-4's reading unchanged: a captured motive on
    two lanes with per-lane transforms, the pulse sequencer for the pulse. A figure needs a
    technique that speaks at speed (staccato, ord) — the one-shot noises (slap, key click,
    pizz) will not run.
  - *Notating it (phase 2a, later):* the tuba vocabulary has no grace notes (ord · staccato ·
    cuivre · fortepiano · morph). Needed: an IR **grace group** attached to a host event
    (ordered pitches, no duration of its own, position before the host) — flagged explicitly
    in the save rather than guessed from a duration threshold (one robust build, not a
    heuristic) · a **render** — small notes under one slashed beam, left of the host, an
    accidental per note · and the **scrolling-score reading**: in a proportional animated
    score the group has no width of its own; "as fast as possible, into the beat" puts the
    figure immediately left of the host, and the player plays it into the cursor's arrival.
    For a scrolling score the natural time-source rule is therefore "from the preceding note"
    — the host's onset stays the beat, which is what the S1 data already says when the small
    notes sit before it. Filed on PLAN 0g's 2a adaptation list.
- **A second signal for CN-2, still not a decision:** this idea names the piccolo again
  (CN-4, now CN-9). If it stands, the flute doubling is piccolo and the piccolo library is the
  one to confirm (SI2 has none).

---

## CN-10 · 2026-09-04 — the opening expanded: strikes as ensemble processes

> *"Composition note. So expand the opening scattered strikes — treating the ensemble, or
> sub-ensembles. So, for example, climbing scales through the ensemble; or acceleration or
> deceleration as one unit but spread out across the ensemble; blocks of strikes that answer
> each other from sub-ensembles? And that rejoins my earlier prompt about circular chord strikes
> in cycles, and a kind of Risset ladder throughout the ensemble."*
> *(dictated 2026-09-04 night, session 3, while composing — 17 strikes in the piece; speech-to-text
> cleaned: "court" read as chord, "rizay" as Risset; content untouched)*

**AI reading (not the composer's words):**

- **The unit grows.** So far a strike is one orchestrated chord (CN-5; CN-8: the piece begins with
  them). This note makes the strike a member of a larger gesture that runs THROUGH the ensemble —
  a line handed player to player — instead of being struck by the ensemble at once. Four devices:
  1. **Climbing scales through the ensemble** — successive notes on successive players by register
     (cello → viola → violin 2 → violin 1 → piccolo; bass clarinet and piano where the line passes
     their zone): a hocketed ascent. Inside one strike the drawer has it already — order `low → high`
     (K), an even or shaped rhythm (J), a spread voicing (B); across strikes it is each strike one
     step above the last.
  2. **Acceleration / deceleration as one unit, spread across the ensemble** — one rallentando or
     accelerando whose attacks are distributed among the players, heard as a single gesture. The
     rhythm column's `front-loaded` (dense, then sparse = slowing) and `back-loaded` (sparse, then
     dense = quickening) ARE this for one strike's notes; across strikes it is CN-3's ramp laid over a
     chain of strikes — CN-3's bouncing ball and curve would notate it.
  3. **Blocks of strikes that answer each other from sub-ensembles** — antiphony: strings against
     winds + piano, high against low, any partition. The drawer's locks (top → / bottom →) and the
     two-click assign build a block by hand; a shuffle confined to a chosen sub-ensemble is the
     missing tool (STRIKES_TOOL V, not built).
  4. **Circular chord strikes in cycles + a Risset ladder through the ensemble** — CN-7's cycle given
     its pitch engine. "Risset ladder" is the composer's phrase for the Shepard–Risset staircase: every
     step climbs, yet the whole never leaves its range, because a voice that reaches the top fades and
     re-enters at the bottom. In strikes: each strike of the cycle re-voices the same pitch classes one
     step higher; the voice that crosses the top wraps to the bottom of the ensemble (piccolo → cello)
     at the softest dynamic and climbs again; the middle register carries the weight. The instruments'
     registers are the rungs — "throughout the ensemble" is literal. The drawer's voicing moves pitch
     classes by octave (B) and folds into range (F): the ladder's mechanism one strike at a time. A
     chain ("next = the previous voicing one step up, the top voice wrapping") is the tool to want.
- **What this asks of the tools, in order of need:** nothing new to compose the first of each by
  hand (order · shape · voicing · locks · assign exist per strike); then a sub-ensemble shuffle; then
  chains across strikes (scale · accel/decel · ladder) — a strike-sequence generator, which is also
  CN-7's state machine given its first states. Filed as STRIKES_TOOL V, not built.
- **On the form:** this fills in PLANNER outline item 1. The opening is no longer "one attack": it is
  the scattered strikes expanded into ensemble processes, out of which CN-6's chosen harmony and CN-1's
  tremolos on curves emerge. CN-3's converging tempos and CN-7's cycle both live inside the opening.

---

## CN-11 · 2026-09-04 — the tremolo fork: tremolos → fugue → stretto → stacked accel/decel → vibrato rate

> *"And then the tremolo figures that will take over the initial section will become their own fork
> as well, and that'll expand in a like way. So these tremolo figures turning into fugues, and then
> stretto, and then accelerations and decelerations — or acceleration and deceleration stacked on
> top of each other — and also speeding up and slowing down vibrato."*
> *(dictated 2026-09-04 night, session 3; speech-to-text cleaned: "strato" read as stretto, "vibrada"
> as vibrato; content untouched)*

**AI reading (not the composer's words):**

- **A second branch, built like the first.** CN-10 expanded the strikes into ensemble processes; the
  tremolos that take over from them (CN-1, CN-6) get the same treatment — a "fork" of the form that
  grows by its own processes rather than by contrast. The chain named: tremolo figures → fugue (CN-1's
  tremolo fugue) → **stretto** (the entries overlapping ever closer — the fugue tightening) →
  **accelerations and decelerations**, singly or **stacked** (one player's accelerando against another's
  rallentando, or a slow ramp under a fast one — CN-3's converging tempos, now layered) → **vibrato
  rate** as a parameter that speeds up and slows down.
- **Tremolo and vibrato are one family here:** both are oscillations with a rate; the tremolo's rate
  is already curve-driven (CN-1, CN-6), and the vibrato's rate becomes one too. In the libraries the
  strings' vibrato is a modwheel dimension (Xsample: Vibrato Velocity + MW) and the flute has the
  ordinario-to-flatterzunge morphs — a rate ramp is a CC curve, which the score app's curve channels
  (D11) already send. For the players, a vibrato that speeds up or slows down is an ordinary written
  instruction (a wavy line widening or narrowing, or text).
- **Stretto and stacked ramps are notation questions, not sound questions:** overlapping fugal entries
  in a proportional animated score are overlapping curves; two ramps stacked are two players' cursors
  at different speeds — CN-3's bouncing balls, which the animated format was built for.

---

## CN-12 · 2026-09-04 — the scattered spreads' expansion: each strike wider than the last, from the first impact

> *"And then the scattered spreads' expansion. So start with a tight spread, and then each successive
> strike will have a wider spread. And spread out from the start — or try different strategies, but
> probably spread out from the start. In other words, in the original scattered spread, treat the
> first impact as number one and then the rest of them through time, and then expand those other
> ones forward in time for the next one, and for the next one."*

**AI reading (not the composer's words):**

- **The "spread" is the strike's span in time** — how far its notes scatter after the first impact
  (the 46 recorded strikes span roughly 170–700 ms each). The process: a chain of strikes whose spans
  grow — tight, then wider, then wider — anchored at the first attack: impact #1 stays where it is,
  the rest are pushed later, more with each strike. "Spread out from the start" = anchor the first
  onset and stretch forward; the alternatives he leaves open (anchor the centre, anchor the last,
  scale both ways) are the "different strategies".
- **The drawer already does one step of it:** the rhythm column's `span ×` (J) multiplies every onset
  measured from the first — exactly "from the start" — so a chain is span × 1.0, 1.5, 2.0 … applied to
  successive strikes. That makes it the first chain type to build in STRIKES_TOOL V (SPREAD), and the
  one with the least design in it: one number per strike, or a growth curve over the chain.
- **Heard result:** the opening's chords loosen into arpeggios and then into lines — the scattered
  strike becomes CN-10's climbing scale by degrees. The two notes are one process seen twice.

---

## CN-13 · 2026-09-04 — the Risset as tone rows over curves; performer jitter from periodic to non-periodic

> *"And for the Risset: give each player a tone row, and they can play legato, upwards or downwards —
> let's say, for example, upwards — and then I'll give them a curve, and they're expected to complete
> the tone row by the end of the curve. And then I can control how quickly rows are completed, and I
> would give instructions as to even spacing as much as possible. And then I can have these overlap
> in different ways. There could also be a possibility of performer jitter, so they can play it from
> completely even — like pulsed — to relatively random, like non-periodic. So the spectrum is periodic
> to non-periodic?"*

**AI reading (not the composer's words):**

- **The ladder's rungs are rows, not strikes.** Each player gets a tone row (an ascending line, legato)
  and a curve; the row must be complete when the curve ends, its notes as evenly spaced as the player
  can manage — so the curve's length IS the row's speed, and the composer paces the ascent by drawing.
  Rows in staggered, overlapping curves are the Shepard–Risset staircase of CN-10: while one player's
  row finishes at the top, another's is starting at the bottom, and the whole never stops climbing.
- **This is the tuba piece's grammar again:** a META curve governing a texture's pacing (the tuba's
  density and level curves), here governing how fast a written row is consumed. The animated score is
  the natural instrument for it — the player watches the curve run and distributes the row across it.
  In the app: a curve object on the player's lane carrying the row's pitches; the sandbox's pulse
  sequencer could audition it by placing the notes evenly along the curve.
- **"Performer jitter" is a notated parameter with two ends:** periodic (pulsed, metronomic spacing) ↔
  non-periodic (irregular, random-like spacing) — the drawer's jitter (J, ± n ms) as a performance
  instruction rather than a computed value. It is exactly the spectrum his question names, and it can
  itself be curve-driven (jitter growing across the row) or fixed per row.
- **Notation, for 2a:** a new device — *the row over a curve*: the pitches written once (small notes or
  a row box), a curve or duration line for the span, the spacing instruction (even → irregular, as text
  or a gradient), the direction. Filed on PLAN 0g's 2a adaptation list beside the grace-note figures
  (CN-9); CN-11's vibrato-rate ramp goes there too.
- **What the piece gains:** three parameters the composer controls by drawing — the row's speed (curve
  length), the overlap (curve placement), the regularity (jitter) — per player, legible in the animated
  score; and the notation carries the same three, so the performance score says what the animation shows.

---

## CN-14 · 2026-09-04 — next section @ 27.76 s: one strike re-struck, evened, each re-strike longer, then accelerating within itself

> *"Next section @ 27.76. Take one of the strikes, even out the spacing, and then expand the total
> duration of the strike with every re-strike. So the first one, let's say, lasts one hundred
> milliseconds. The next one would be longer. We'll decide on an algorithm for that, or a spread. So
> let's say one fifty, and then the next one is two twenty-five, etcetera. For the first one, we'll do
> even spacing, and then successive ones, I want to accelerate. So the first one is even spacing. Or
> I should say, when we get to a certain total duration, we can do an acceleration. I think the first
> few will be — the duration will be too short to hear any kind of acceleration. But, eventually,
> they'll accelerate: a strike within a strike. So the spaces won't be even anymore, but they'll be
> progressively shorter to the last impulse of the strike. Just take this as a note for now, and then
> we'll build it."*
> *(dictated 2026-09-04 night, session 3; speech-to-text cleaned: "restreiche" read as re-strike, "no"
> as note; content untouched)*

**AI reading (not the composer's words):**

- **A section made of one strike.** From 27.76 s (the first 17 strikes end at 25.61 s), a single strike
  is chosen, its onsets evened out, and struck again and again; each re-strike lasts longer than the
  last. His example is a geometric growth, ×1.5: 100 → 150 → 225 → 338 → 506 → 759 → 1139 → 1709 →
  2563 ms — nine re-strikes to reach two and a half seconds. The law is left open ("an algorithm, or a
  spread"): geometric, additive, or a drawn curve over the chain.
- **Even, then accelerating.** The early re-strikes are evenly spaced; once a re-strike is long enough
  for its inner rhythm to be heard, the spacing turns into an accelerando toward the LAST impulse —
  "a strike within a strike": the re-strike's own ending becomes an attack. In the drawer's terms the
  spacing goes from shape `even` to `back-loaded` (sparse, then dense — J), and `amount` could grade
  the change in rather than switch it.
- **Where the threshold falls, roughly:** separate attacks read as separate once gaps clear ~60 ms —
  the drawer's own grouping rule. For a 9-note strike that is a span of ~0.5 s (the 5th re-strike
  under ×1.5 from 100 ms); for a 21-note strike like #5, ~1.2 s (the 7th). Until then the re-strike is
  heard as a chord that thickens, which is its own effect — the composer's "too short to hear" is right.
- **Open, for the build:** the growth law · the gap BETWEEN re-strikes (even, shrinking, or a curve —
  not said) · whether the orchestration is fixed across the chain or re-shuffled per re-strike · the
  dynamic (does the chain grow or stay). The chosen strike itself is his.
- **For the tools:** this is STRIKES_TOOL V's SPREAD chain, now with its numbers — the first chain to
  build, at his word ("we'll build it"). For the page (2a): an accelerating strike is a feathered beam
  in conventional notation; the animated score shows the onsets as they are.

---

## CN-15 · 2026-09-04 — the working plan for #17 onward: #18 begins the expanded chain, gaps kept end-to-start

> *"I'll be working on strike number seventeen. So that will go in — actually, that will go in its normal
> spot, but then we'll start with eighteen on the expanded rhythm. So I think we'll make eighteen even. The
> first strike will come at its normal time, twenty-eight point one eight, the first note, and then it'll
> expand from there. We can try an acceleration, but the first few might be — the total duration might be
> too small. So I guess I need to figure out what the duration progression should be, but I have to hear
> it first. So let's try some duration progressions, and then maybe I'll make adjustments. And then after
> that, nineteen. Let's keep the gaps between them the same. Let's try that. So the difference between
> eighteen and nineteen — nineteen will begin that much after eighteen ends, because it'll have a duration
> now. And, etcetera: nineteen will end, and the difference between nineteen and twenty — so that's
> twenty-nine point eight and thirty-one point seven two — will be the gap between the end of nineteen and
> the beginning of twenty. And then each of those progressively will be the even-spaced but accelerating.
> And I'll use the drawer to decide on the orchestration before we put those in. So let's just talk for
> now. We'll make that fix, and then let's talk and see how to proceed. Make a workflow — a working plan —
> but also make a plan plan and see if we need to build anything. But the whole thing: let's take notes,
> learn lessons, and build a structure later if necessary, if deemed necessary."*

**AI reading (not the composer's words):**

- **CN-14 refined:** not one strike re-struck but the successive recorded strikes #18, #19, #20 … each
  stretched — even spacing first, accelerating toward the last impulse once long enough to hear — with
  durations growing by a progression to be found by ear; and the original onset-to-onset gaps kept
  **end-to-start**, so the section drifts later by the accumulated durations. #17 stays as recorded.
- **The numbers, from the database:** #17 27.153 s (5 notes, 127 ms) · #18 28.175 (13, 110 ms) · #19 29.803
  (17, 622 ms) · #20 31.720 (14, 213 ms) · #21 32.469 (8, 49 ms) · #22 33.347 (6, 13 ms) · #23 34.217
  (11, 147 ms) · #24 34.990 (6, 26 ms). Original gaps from #18: 1.628 · 1.917 · 0.749 · 0.878 · 0.870 ·
  0.773 · 1.074 s. Rule: start(n) = end(n−1) + gap(n−1 → n); end(n) = start(n) + d(n).
- **A first progression to hear, his ×1.5 from 100 ms:** d = 100 · 150 · 225 · 338 · 506 · 759 · 1139 ms →
  starts 28.175 · 29.903 · 31.970 · 32.944 · 34.160 · 35.536 · 37.068 s. Where it becomes rhythm: the mean
  gap clears ~60 ms only at #22 (6 notes over 506 ms). To hear an acceleration early, try #21–#22 first,
  or a steeper law (×2: 100 · 200 · 400 · 800 · 1600 — audible by #21).
- **Where the friction will be, by hand:** span × is a ratio (d ÷ the as-played span: #19 at 150 ms is
  span × 0.24), the start of each strike is arithmetic, and a re-insert adds rather than replaces. The
  working plan and the build candidates ranked by that friction: RUNNING_LOG §81. Nothing built yet —
  the example first, the lessons logged as they come.
