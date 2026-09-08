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

---

## CN-16 · 2026-09-04 — ×1.5 chosen; the onset gap placed at the end of the previous strike, from #17 on

> *"Let's start with times one point five. So then back to eighteen. I have the even version saved as
> eighteen dash c — this is with the orchestration I want and the order I want it. So I guess maybe in the
> drawer we need a way to expand it to whatever the next duration is. So spread it out. And then a method
> to calculate the gap between seventeen and eighteen — let's just call it the onset gap. So the difference
> between twenty-seven point one five and twenty-eight point one eight, and then place that gap at the end
> of seventeen, and then that will be the new onset time for eighteen, the spread-out version. And then
> I'll be able to insert it at that time. So let's just talk first. What do you think this should look like?"*

**AI reading (not the composer's words):**

- **The chain's law is fixed: ×1.5.** And the gap rule now starts one strike earlier than CN-15 said: #17
  (evened, 127 ms, at 27.153) is the chain's anchor; #18 no longer sits at its recorded 28.175 but at
  end(#17) + the onset gap (28.175 − 27.153 = 1.022 s). With "end" = the last onset (27.280): #18 starts at
  **28.302**. In general start(n) = end(n−1) + [t0(n) − t0(n−1)]: the recorded gaps survive, measured from
  where the stretched strike stops.
- **Two anchors are possible for the durations** and only the composer can pick: from #17's 127 ms → #18 =
  190 · #19 = 286 · #20 = 429 · #21 = 643 · #22 = 964 · #23 = 1447 · #24 = 2170 ms (rhythm audible from
  #21); or #18 = 110 as member one → 165 · 248 · 371 · 557 … (audible from #22, RUNNING_LOG §83).
- **The orchestration is settled per strike before the stretch** (take 18-c) — so the tool must touch only
  two numbers: the duration and the insert time. Proposed shape: STRIKES_TOOL U11.

---

## CN-17 · 2026-09-04 — the gaps between onsets expand, not the total duration

> *"So I think the duration was the wrong approach. We'll keep the first two for now unless I decide to change
> the whole scheme. But I think it's actually the gaps between the onsets that need to expand. Well, actually,
> we might as well be consistent and expand eighteen then too. So then we'll have the initial gaps between the
> onsets in seventeen, and then I guess we'll expand those by one point five — or if we tried different
> versions, Fibonacci, etcetera — for eighteen and then for nineteen, because some have more onsets than
> others. So let's talk first how to do this and then develop a procedure to replace eighteen with the
> updated version."*

**AI reading (not the composer's words):**

- **The law moves from the whole to the pulse.** Strikes have 5 to 17 onsets; a total-duration law makes a
  17-note strike three times denser than a 5-note one at the same length. A gap law keeps one expanding pulse
  through the section: gap(#17) = 127 ÷ 4 = 31.75 ms, then ×1.5 per strike → 47.6 · 71.4 · 107 · 161 · 241 ·
  362 · 542 ms; each strike's duration follows from its own onset count. The rhythm is heard as rhythm from
  #19 (71 ms), one strike earlier than under the duration law.
- **A finding in #18 as inserted:** 13 recorded onsets, 7 of them played (his own rule: a player holds one
  note; 7 players) — so the `even` grid has six silent slots and the heard gaps are 47 · 32 · 48 · 31 · 16 ·
  16 ms, multiples of the 16 ms grid, not even. #17 was even only because all five notes were placed (with
  doublings). Under a gap law this decision comes first: is the gap between the notes HEARD (silent slots
  dropped from the rhythm — a tool switch, not built), or the recorded grid with rests kept (as now), or
  every leftover note given to the piano by its flag so all 13 sound?
- **The chain placement is unchanged:** start(n) = end(n−1) + the recorded onset gap; with the gap law the
  section stretches further (all-onsets version: #24 ends near 46.9 s; sounding-only: much less, since a
  strike then has at most 7 onsets unless the piano takes the rest).

---

## CN-18 · 2026-09-05 — the accelerating run: fixed steepness, fixed landing, the first gap by the chain; the players in a round robin

> *"I actually don't want the acceleration to slow down at the end … I want each subsequent one to sound like
> it's taking longer, so maybe it's slower in the beginning, but I want the rush at the end to sound just as
> urgent each time."* · *"Let's build a round robin cycle so we can recycle the players into a longer sequence
> … as the ensemble returns, we then randomize the pitches, but the ones I've already chosen … shuffle to
> completion."* · *"Pitch on player is fine. However, we need a fail-safe … no player is playing another note in
> too short an amount of time."* · *"Let's just do two hundred and fifty milliseconds across the board, because
> the mechanism I'll use to notate this will be the gravitational conductors, and those bouncing balls are
> less effective when you're doing two successive ones rather quickly."* · *"If we have to settle into the same
> loop, then we just let the player play the shuffled note, in an octave displacement if necessary."*
> *(2026-09-04 night → 05, session 3, several messages; speech-to-text cleaned, content untouched)*

**AI reading (not the composer's words):**

- **The model in one line:** a ball dropped from higher each time — same bounce, more bounces. Three numbers
  fixed: the steepness (each gap 0.85 of the one before), the landing (the last gap 45 ms), the re-attack
  rule (a player never twice within 250 ms). One number moving: the first gap, the chain's ×1.5 (107 · 161 ·
  241 · 362 · 542). The count of notes follows — 7 · 9 · 12 · 14 · 17 — and so does the duration, 0.44 → 3.3 s;
  the last gaps are the same milliseconds at the same rate every time, which is the urgency he asked to keep.
- **The round robin supplies the notes:** the strike's orchestration is a deck of cards, pitch on player, in
  his order; cycle 1 plays the deck; every later cycle reshuffles it and plays it through, no reshuffle
  mid-deck; the last cycle stops at the count. The 250 ms rule is checked against the onset times, which are
  known before dealing, so it is a guarantee; a rotation of seven players at a 45 ms floor gives 315 ms and
  never conflicts, so the fallback always exists: the players in his order, the pitches shuffled and folded
  by octave into each player's range. In the slow head the order is free; in the rush it tends to the rotation.
- **Why 250 across the board:** the notation — the gravitational conductors' falling balls need that much
  between two cues on one lane, whatever the player could do.
- **Built as STRIKES_TOOL U13** (the drawer's `accel · round robin` shape); RUNNING_LOG §91.

---

## CN-19 · 2026-09-05 — trills grown from the strikes: curve-driven, note by note, eating the notes they cover

> *"These will be trills … like the ostinatos in the two-piano, two-percussion piece … lookup speed tables. We
> won't be using the sample-library versions of trill and tremolo; we'll draw those in note by note using the
> lookup tables — I'll have to listen and see which preset would be best for actualizing the trill."* · *"Create
> three meta curves — maybe three meta windows … I just draw a bunch of points in, hit a button, and the curves
> get drawn in, and then I can select any region and change its curvature."* · *"For any given part of any of the
> curves, make a selection, probably in the actual tracks, and that curve segment from the reference curve will
> appear in that track … this submodule is probably portable."* · *"One of the onsets in one of these strikes
> launches a trill or tremolo — say strike six, when the violin hits its note, instead of the scattered-strike note
> they use that pitch and start playing a trill, attacked, sforzando, directly into a trill, and I determine how long
> it goes … the trill is growing from the strike."* · *"If I continue that violin trill past the next strike, detect
> its length and delete the violin note from whatever strikes the trill is playing over … some start between strikes
> and play across strikes … the system would know to eat the bass clarinet notes for strike eleven and twelve."* ·
> *"Find the gaps between, say, second fifty and sixty and have some trills amongst the players that are available …
> switching over to another instrument when that player has to do something."*
> *(2026-09-05, session 3; speech-to-text cleaned, content untouched)*

**AI reading (not the composer's words):** this is CN-1 / CN-6's "tremolos on curves" as a tool — the second material
of the piece, born out of the first. The requirements and the vetting: RUNNING_LOG §97; the spec, once agreed, gets
its own document (`docs/TRILLS_TOOL.md`, as STRIKES_TOOL for the strikes).

---

## CN-20 · 2026-09-05 — the trill module's rules, decided

> *"As a general rule, I would like things to be intuitive and easy to use, maybe not have too many controls."* ·
> *"There was the wave-curve object from the two-percussion piece — essentially, just too many controls … a simpler
> version, where I can trace a long curve and then make some adjustments along the way."* · *"I wouldn't mind trying
> to see if there isn't a blend between one patch for the attack and another patch for the continuing trill … or we
> use CC7 or velocity to simulate the attack … sneakily have a single instrument have two voices for a brief
> moment … we don't have to over-labor this … ultimately we'll notate this."* · *"Eat by rule, not by deletion — I
> agree … I'll want to audition and change my mind, so we'll need a facile way to readjust."* · *"The curve segment
> will end the trill. Second pitch: upper chromatic neighbour, but eventually other options."* · *"The speed limit
> isn't too much of a concern — these are demos … the live performers aren't following any animation here, it'll just
> say trill."* · *"Let's figure out how to build the fp envelope per instrument — a thing that works."* · *"Three
> lanes is better."*

**AI reading:** written straight into `docs/TRILLS_TOOL.md` §1 as the decisions; the spec follows them. The one
musical point to carry: the rate curve is a demo device — the score says *tr* over a span; the players' own speed is
the real one.

---

## CN-21 · 2026-09-05 — "these don't sound right": the trill's timing must come from playing, not a formula

> *"These don't sound right. So can you do a deeper dive into the two piano, two percussion piece, and see how we actually
> realize those curves for that. Those sound a lot smoother. And then I made some new ones, but I can't remember if I played
> together with a graphic curve for the two piano piece. So if that's the case, then we can draw some curves, and I can play
> along with those if that's easier. But the ones I made were trill playing samples and then a viola version and a cello
> version … Either you or I will draw a curve and then apply the slope from the curve to the trill speed. We need to figure
> out how that was done, how those samples are being applied."*
> *(2026-09-05, session 3, evening; speech-to-text cleaned, content untouched)*

**AI reading (not the composer's words):** the trill's realization changes model — from a rate table (TRILLS_TOOL §2) to
piece #2's human-sampled timing: his own trill playing, indexed by speed, looked up along the curve. The findings and the
options are RUNNING_LOG §100; his decision pending.

---

## CN-22 · 2026-09-05 — phase 1 go; the whole step; audition the interval first

> *"a, go ahead with phase 1 lets do whole step as default and lets build into the plan an easy way to audition different
> intervals before inserting a trill and selecting the interval for the trill"*
> *(2026-09-05, session 3, night; typed)*

**AI reading (not the composer's words):** two changes to TRILLS_TOOL §1 — the second pitch defaults to the **upper whole
step** (was the chromatic neighbour); and the trill's panel gets an interval row that plays a short trill on each interval
at the click (his own timing, the lane's technique) and sets the trill's interval — audition, then choose, then the trill
sounds with it. Phase 1 (the trill object) built on that: RUNNING_LOG §104.

---

## CN-23 · 2026-09-05 — the curves, as he wants them: points first, then fill, then shape the line by hand

> *"Let's discuss the curves. First, the curve windows. Let's make them one track height, and let me have three curve
> windows and leave the meta window where it is. Leave it out of the curve path. Look at the wave curve object in the two
> percussion two piano piece. I want something pretty close to that. I just want something easier to use. What I'd like to
> be able to do is just click to add a point. So if I click, a point appears, and then I'll click somewhere down the
> timeline, a little higher, I'll create peaks and troughs. Just with points. No lines. You'll just see points. Then either
> I click a command or I double click or something like that, and it fills the curve. Then between any of the points, I can
> click a line or hold a line and then just drag left or drag right or up or down, and it'll change the curve. And this
> needs to be calibrated better. The one in two pianos, two percussion, it's hard to adjust the curve. It's not… it's too
> sensitive. In this one that you made, the green square doesn't do anything. Nothing changes when I move the green square.
> But I don't wanna fiddle around with this. This object's not right. So let's discuss it first, please, and make sure it's
> clear what needs to be done."*
> *(2026-09-05, session 3, night; speech-to-text cleaned, content untouched)*

**AI reading (not the composer's words):** three decisions and a design brief. The META window is the gestures' shapes
only and stays where it is; the three curve windows are their own, one track high. The curve object is rebuilt as
**points → fill → shape**: click to place points (no lines), a command or double-click fills the curve through them, then
hold the line and drag to bend it — the line following the hand 1 : 1, so nothing is left to calibrate. The diamond of
phase 2 goes. The discussion and the diagnosis of the dead green square: RUNNING_LOG §106.

---

## CN-24 · 2026-09-05 — the curve windows and the curve object, decided

> *"Windows: I want the windows like META, so it's a bit transparent, and it floats over. But I want them to be precisely the
> height of and location of violin two, viola, and cello. So just floating windows directly above those and transparent. And
> even the curve — actually, let's make the curve not fill. And even the line a little bit transparent, like META, but maybe a
> little bit more. So the fill trigger will just draw the line between the points, and I would like a button for that. And
> then make sure I can scroll and continue to add points throughout the score, even if the previous points aren't visible
> anymore. Keep the dots visible always, and then let's have those simple controls for deleting a dot, and I can move them.
> And then no need for a freehand draw. And then a way to continue the curve if I want to. So if I want to add to the end of a
> curve, I can do something and then click more dots, and then redraw the line. Same with deleting ends. If I delete the
> beginning or the end, the curve collapses to the next point."*
> *(2026-09-05, session 3, night; speech-to-text cleaned, content untouched)*

**AI reading (not the composer's words):** the design of CN-23 settled — the spec is TRILLS_TOOL §3b and RUNNING_LOG §107.
One curve per window, a line through dots that live on the timeline; the dots are the whole interface.

---

## CN-25 · 2026-09-05 — the bend like a DAW; several curves per window; go

> *"1 I'm not exactly sure, but a lot like a DAW, like Logic Pro, where you can drag and change the depth of the curve or the
> direction of the hump. No. Two windows could have multiple curves. So that's the point where if I wanted to continue a
> curve, I could, but I could have separate curves there as well. And then good to go."*
> *(2026-09-05, session 3, night; speech-to-text cleaned, content untouched)*

**AI reading (not the composer's words):** the bend is vertical, the hump's depth and direction following the hand where the
line is held (Logic's automation curve); a window holds several curves — dots placed with a curve selected continue it,
dots placed with nothing selected become a new one. Built: RUNNING_LOG §107.

---

## CN-26 · 2026-09-05 — the curve windows accepted; the trill from a strike, as he pictures it (phase 3 talk)

> *"Points icon a pencil or pointer, something with a tip please; otherwise good, it works good. Then for phase three, let's
> talk and make sure the understanding is correct. So I find a note in one of the strikes, I select it, and then I hit T,
> and it turns into one of those trill lines. Is that correct? So then what I'd like is, just like all the other zones, I can
> drag it longer or shorter. And then could you add some buttons on the zone and have the panel hidden unless I press P?
> And then buttons on the zone for, like, one, two, or three, so I can choose a curve. And then if I hit one, it'll sample
> that zone's length of curve one, and I should see it filled — you can make it somewhat transparent if you want — and the
> zone could sit on top of the curve. And then I wanted to ask: if the zone extends past additional strikes, is there just
> automatic detection, and it grays out those notes? And then what if I want to delete the zone — do the strike notes come
> back? And then how do I start a zone in the middle, just putting my cursor and hit Add Trill? Let's discuss the
> requirements and anything else I'm not thinking of. Oh, and one more thing: what happens if I update the curve? Can we
> have a way to update the zone curve as well? So I create a trill, and then I select a curve, but I wanted to have a
> different curvature, so I go back to whatever source curve, like one, change it — then how do we update the trill curve?"*
> *(2026-09-05, session 3, night; speech-to-text cleaned, content untouched)*

**AI reading (not the composer's words):** the curve windows are accepted by his hands. Phase 3 as he pictures it is
mostly what phase 1 already does (T on a strike note, drag the ends, the eaten notes grey, delete restores); the new asks
are the zone's own `1 2 3` buttons with the sampled curve shown filled in the zone, the panel on P only, and the live
update of a trill when its source curve changes. The discussion: RUNNING_LOG §108.

---

## CN-27 · 2026-09-05 — the attack of the trill, for the demo; the phase 3 decisions

> *"a) So this is just for my audition, and as realistic as I can get it would be good. In the notation, I'll just mark it
> as fp, forte-piano, or sforzando, and the performer will attack the trill before playing it, or the beginning of the
> trill will be attacked. So we can simulate this maybe. I was wondering if the very first note could be modified. So maybe
> in the trill panel there's a section where I could change the articulation of the first note in the series of notes that
> make up the trill, and I could also change its duration. So I can change its articulation and change its duration, and
> its velocity. That way I can simulate for the demo and for myself to hear the attacked trill. b) only 1 2 3. c) warn.
> d) pitch stays. e) yes."*
> *(2026-09-05, session 3, night; speech-to-text cleaned, content untouched)*

**AI reading (not the composer's words):** the attack is a demo device: the trill's first note gets its own articulation,
length and velocity in the panel (the notation will say fp or sfz); the zone's buttons are `1 2 3` only; overlapping trills
warn; a dragged trill keeps its pitch; the curve reference is live, bake freezes. Built: RUNNING_LOG §109.

### 2026-09-06 — Lake George (the next piece), the texture

> *"Composition note for Lake George. Use the multitempo and phase shifting rhythms and lots of rests to create sparse
> pointillistic counterpoint quiet."* — composer, 2026-09-06, session 4 (mid-session, while testing the trills)

*AI reading (kept apart):* the tuba piece's multitempo and phase-shifting engines (present in this port: the texture / pulse /
multitempo panels, PLAN §1's list) are the tools; the material is quiet and pointillistic — few notes, many rests, the lines
drifting in and out of phase; the counterpoint is made of the rests as much as the notes. Goes with the pairs and the morph
opening already noted for Lake George (2026-09-04) and the animated conductions for its quiet material.

---

## CN-28 · 2026-09-06 — the form's middle: strikes with morph chords (section 2), patterned or call-and-response strikes with crescendos (section 3); "morph events"

> *"Composition note. Patterned strikes. or call and response strikes. With Crescendos - section 3; section 2: strikes with morph
> chords, like freeze frames or old time slide show, work with ai to use morph engine from tuba piece to create 'morph events'"*
> *(2026-09-06, session 4, typed mid-session while testing the trills)*

**AI reading (not the composer's words):** two sections named by number, his form. **Section 2 — strikes with morph chords:**
a strike lands and its chord is held and *morphs* — the tuba piece's morph engine (pitches bending from one chord into the next;
the port carries the Morph panel and the `morphBend` notes) — "freeze frames", "an old-time slide show": each strike a new slide,
the morph the dissolve between slides. **"Morph events"** = a morph launched from a strike, the way a trill is launched from a
strike note (TRILLS_TOOL §5): the object to design with him — PLAN 1f. **Section 3 — patterned or call-and-response strikes with
crescendos:** the strikes as patterns, or as calls and answers between sub-ensembles (STRIKES_TOOL V's answering blocks), each
chain carrying a crescendo. Where this leaves outline v1's tremolos → fugue → mass (after? interleaved?) is his to say; the
planner's outline carries the note until then.

---

## CN-29 · 2026-09-06 — the morph section: a central notes document for the tool's revision; the morph event's four elements

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

**AI reading (not the composer's words):** a process and a first requirement at once. The process: `docs/MORPH_NOTES.md`, created
today — every remark about the morph tool goes there (a standing practice, in CLAUDE.md), the tool adjusted for the current use
now and revised into an all-purpose tool after this piece or the next. The requirement: a morph event's four elements — the
expansion of pitch to expand beating · the re-breath / re-bow · the crescendo · the pairs, each with its own glissando — in short
events (one breath) and long ones (with re-breaths). Nothing built; the talk comes with the section (PLAN 1f).

---

## CN-30 · 2026-09-06 — 107.81 s holds the next section's start; a second, more gradual acceleration for the strikes drawer

> *"107.81 just hold that time for the beginning of next section; Feb, I'd like to do another acceleration in the strikes drawer.
> And when we created it, the acceleration option, spreading out a strike in the form of an acceleration, we only had one
> variety. So I'd like to try another variety that's more gradual. So I can't remember which one that this is potentially the
> geometric one. where there's a long and gradual ramp up to the end. Let's discuss which one this should be or if we should
> build several now, and then what steps are necessary to build it."*
> *(2026-09-06, session 4, after the mid-session checkpoint; speech-to-text, content untouched — "Feb" is the transcription's,
> read as "then")*

**AI reading (not the composer's words):** two things. (1) A form marker: **107.81 s is where the next section begins** — held
here as a number, nothing placed. (2) A request for the strikes drawer: a **second acceleration shape, more gradual than U13's**
— a long ramp felt all the way to the end, rather than a still head and a collapse. "The geometric one" is slippery because the
word names two different shapes in this repo: the drawer's geometric (each gap a fixed fraction of the one before — the current
run) and the tuba compiler's "geo" (the speed growing by a fixed percentage per second — the even-sounding ramp). The talk
follows the planning method; STRIKES_TOOL §W already lists candidate curves; which shape, and one dial or several entries, is his
to say. The discussion: RUNNING_LOG §125.

---

## CN-31 · 2026-09-06 — Lake George (the next piece): the pointillistic section on multitempos, the machinery abstracted, figures per beat, the bouncing balls as each player's tempo

> *"This is a composition note for the Lake George piece. and continues the idea of pointillistic section using multitempos or
> phase shifted tempos and lots of rests. So, also, I want to abstract that machinery so I can use it in various contexts. and then
> find a way to easily find patterns that I like. I think it's most of the way there already. And then have a way to add different
> figures per beat. So right now it's just quarter notes, but it could be two eighth notes or a triplet or a dotted eighth and a
> sixteenth, etcetera. And then for the Lake George piece, I'll still give them the tempo meter, uh, the bouncing balls, which will
> give them the tempo. And each player will still be in their own tempo, but a pulsed single tempo and then can play Or I should say
> even if there's lots of rest, they can still see the temple they're playing in."*
> *(2026-09-06, session 4, sent while PLAN 1h was being built; speech-to-text, content untouched — "temple" read as "tempo")*

**AI reading (not the composer's words):** four things for Lake George, continuing the 2026-09-06 texture note above. (1) The
pointillistic section runs on the multitempo / phase-shifted machinery with many rests. (2) That machinery is to be abstracted, as
the acceleration calculator was today (1h): the math apart from its panel, usable in other contexts. (3) A way to find the patterns
he likes quickly — "most of the way there already" (the tuba's multitempo and pulse panels are in this port). (4) Figures per beat,
not only quarter notes: two eighths, a triplet, a dotted eighth and a sixteenth, and so on. For the notation: each player keeps their
own tempo, a single pulsed tempo shown by the bouncing balls (the gravitational conductors), so the tempo stays visible through the
rests. Nothing planned or built — a note for the next piece's sketch pad, carried in the memory too.

---

## CN-32 · 2026-09-06 — from 135.84 s the trills are minor 2nds; section 1 drafted (v1.23-sec1DraftDone)

> *"135.84 beginning here can you change all of the trills to minor 2, You can give me a console script instead of a button if that
> works. 20-pretrillm2"* · *"I would like to do a spread out, strike, evenly spread out, but then have it last a certain duration and
> have a return or loop like the acceleration. But, again, the same mix of the instruments and pitches around and choose from the
> full range of played pitches."*
> *(2026-09-06, session 4, evening; speech-to-text, content untouched)*

**AI reading (not the composer's words):** two compositional facts for the record. (1) From 135.84 s the trills are minor 2nds — 43 of
them, set by the console script of RUNNING_LOG §141 on his saved score (before: major 2nds); the earlier trills keep their major
2nds. (2) An evenly spread strike over a chosen length, with the players and the strike's whole pitch set dealt round as in the
accelerating runs — built as the `even` run (§142). His own version names tell the day's shape: v1.20-preTrillm2 → v1.21-postm2Trill →
v1.22-beforeDelete → **v1.23-sec1DraftDone**: the first section drafted. The next section is the morph events (CN-28, PLAN 1f).

---

## CN-33 · 2026-09-06 — section 3: cycles of strikes with crescendos on the beating pairs; training the performers on the full beating curve

> *"composition note for third section cycles of strikes combined with crescendos using the beating pairs and then find a way to
> train performers the full curve of the beating So they'll know that the top of the curve or what the top of the curve sounds like."*
> *(2026-09-06, session 4, evening, during the PLAN 1f requirements talk; speech-to-text, content untouched)*

**AI reading (not the composer's words):** two things. (1) **Section 3 refined** (CN-28 had it as patterned or call-and-response
strikes with crescendos): cycles of strikes, each combined with a crescendo, and the crescendo carried by the beating pairs — the
morph event's material (CN-29) returning inside the strike cycles, so the pairs are section 2's and section 3's alike. (2) **A
performance-material need, not a tool feature:** the players are to be trained on the whole beating curve — what the bottom, the
middle and above all the top of the curve sound like — so that a written curve has a heard target (the tuba piece wrote the beat rate
at both ends of a glissando, MORPH_NOTATION; his rule there: no precise cents, a beating speed they estimate). How that training
material is made — a rendered reference per event, a demonstration track, the rehearsal notes — is a phase 2 / performance-score
question; noted for MORPH_NOTES §3 as well, since the morph tool's output would be its source. Held aside during the 1f talk (one
topic at a time).

---

## CN-34 · 2026-09-06 — the piano stays out of the beating; the beating's pitch set is the strikes' chords

> *"In the pitch set, let's include the forty five or forty six play courts for the strikes. In addition to those other
> similarities. sonorities; So the piano probably won't be used in the beating. I'll use it in the main score in other ways."*
> *(2026-09-06, session 4, evening, during the PLAN 1f talk; speech-to-text, content untouched — "play courts" = played chords)*

**AI reading (not the composer's words):** an orchestration decision for section 2: the beatings are for the six bending players
(flute, bass clarinet, the two violins, viola, cello — up to three pairs); the piano keeps its own material in the score. The
beatings' pitches come from the strikes' played chords, so section 2's sonorities are section 1's chords held and bent.

## CN-35 · 2026-09-07 — a harmony module, for later: the strikes drawer's whole facility over every harmony collected

> *"Please make a note to do for later. I want to develop a harmony module that more or less captures and uses all the functionality
> here in the strikes module. I think that works well. So the menu to the left with all the harmonies there, click one, and it appears
> on the keyboard. I can spread out the voicings, the original spread out cluster, cluster low, cluster high, all the buttons at the
> bottom, the voicings. etcetera. I can reshuffle voicings. I have the seeded shuffle at top, all of this, including the arrows or lines
> to the instruments, and then being able to choose individually the articulation for the instrument. And this will include all the
> strikes, the cord shapes from the 2piano2perc, keyboard module, the blasts from the tuba, and other ones, all the harmonies I've
> collected so far, including the messiaen, including clusters, tone rows, octaves, stacked 5ths these are in the tuba. We'll have to
> do a scrape of my pieces. save this for later, we'll build a plan for a harmony module."*
> *(2026-09-07, morning, his check-in after the beating build; typed, with screenshots of the strikes drawer)*

**AI reading (not the composer's words):** PLAN 1d (the harmony database) becomes a MODULE with the strikes drawer's whole facility —
the list on the left, the keyboard, the voicing presets (original · spread out · cluster · cluster low · cluster high · high + low ·
reshuffle, the octave box), the seeded shuffle, the lines to the players, the articulation per player — over every harmony he has
collected: the septet's strikes, the two-piano piece's chord shapes (the keyboard module), the tuba's blasts, the Messiaen modes,
clusters, tone rows, octaves, stacked fifths (the tuba piece's), "and other ones". The sources need a scrape of the earlier pieces.
To be planned with the planning method when he says so — not now. The first pass of the scrape (the blasts and the chord shapes)
is done today for the beating drawer (CN-36); the note stands in PLAN 1d.

## CN-36 · 2026-09-07 — the beating drawer: the harmonies on the left in banners, heard on the piano, any note assigned to a pair by hand

> *"For the beating drawer. I would like the harmonies in this format on the left. and I want forty six strikes in its own banner in
> the same scroll menu but its own banner that I can collapse. And then I'd like the blasts from the tube a piece in its own banner,
> and I'd like the chord shapes from the two piano, two percussion piece. in its own banner. And same functionality. I click it. I see
> the layout on the keyboard. be able to hear just the chord.  use the piano voice for play back of just the harmony there won't be
> any assignment with the dotted lines to instruments. Instead, I'll be able to assign any note in that harmony to a beating pair. and
> I'll do that manually using the same facility we have now in strikes. So I'll double click a note on the keyboard and then click  a
> node connected to a pair. And then this selection, just like with the strikes, the harmony selection and the assignment will save
> with the take."*
> *(2026-09-07, morning; typed — "the tube a piece" = the tuba piece)*

**AI reading (not the composer's words):** the beating's pitch side takes the strikes drawer's form — a scroll list on the left with
three collapsible banners (the 46 strikes; the tuba's blasts; the two-piano chord shapes), a click puts the chord on the keyboard,
a ▶ hears the chord alone on the piano voice; no lines to instruments — a note is armed on the keyboard (a double click, or a click)
and given to a pair by clicking the pair's node; the harmony chosen and the pairs' notes save with the take. The two-click assign is
the drawer's (STRIKES_TOOL F, U7 → U10). The blasts and the chord shapes come from a first scrape of the two earlier pieces
(`tools/harmony_scrape.js` → `bank/harmonies.json`); the full scrape is the harmony module's (CN-35, PLAN 1d).

## CN-37 · 2026-09-07 — the morphs for the septet: three pairs by default (the two violins · cello and viola · flute and bass clarinet), the piano out, the pairs re-orchestrable

> *"lets go back to the morph panel, can you adapt it for the current instrumentation, -piano, And then I'll create the morphs. with
> three pairs. the two violins, cello and viola, and flute and base clarinet by default. But they'd be able to reorchestrate the pairs.
> So in other words, I'll listen and create a morph with those defaults and then be able to save it and then be able to rearrange the
> orchestration of those three pairs. And then I'll need that facility from the beating drawer that will change the octaves of notes
> that are out of range for any of those instruments. And then I want a facility to insert just a single pair or any combination of
> those three pairs as well."*
> *(2026-09-07, late; typed — "base clarinet" = the bass clarinet)*

**AI reading (not the composer's words):** the morph section's instrumentation decided as pairs — the strings in two like pairs, the
winds as the third — with the piano out of the morphs as it is out of the beatings (CN-34); the pairs re-orchestrable after the fact,
so a morph is written once and cast later; a pair or any combination of the three placed on its own. The tool's adaptation: the data
in RUNNING_LOG §197, his words in MORPH_NOTES §3.

> *Later the same night, narrowing it:* *"For this piece, I basically just want to use the morph panel in a very similar way to the way
> I used it for the tube a piece, to be able to generate a whole sequence using those value based sliders … not use tubas, but these
> instruments for my septet … break the the texture, the ensemble texture up into their individual pairs in case I wanted to just insert
> one pair part of the ensemble or a second pair part of the ensemble … generate an entire ensemble sequence with everything in place
> such as crescendos, crescendos, red breaths, just like I did with the tuber piece."* *(2026-09-07, late; typed — "red breaths" =
> re-breaths)*

**AI reading (not the composer's words):** the morph section is made the tuba way — an ensemble sequence generated whole, its
crescendos and re-breaths from the engine — and placed by pairs; the re-orchestration and the fold of the first ask are withdrawn for
now (RUNNING_LOG §198).

## CN-38 · 2026-09-07 — pitch sets to try for the morphs, from the harmony list

> *"So can we have a discussion about pitch? So I put some images of potential ones I want to try."* *(2026-09-07, late; typed, with
> five screenshots of the beating drawer's harmony list, each highlighted with its notes on the keyboard)*

The five he pointed at (the two-piano chord shapes and the tuba's blasts, as the list names them):
- **cs-015** M3 P4 [0,4,5] — A3 · C♯4 · D4
- **cs-019** m9 M9 [0,13,14] — G3 · G♯4 · A4
- **cs-021** M7 m9 [0,11,13] — G3 · F♯4 · G♯4
- **cs-050** m2 M2 M3 [0,1,2,4] — B3 · C4 · C♯4 · D♯4
- **S055** UNISON-C oct — C2 · C3 · C4 (the bank's MIDI 36 · 48 · 60; the list row says C2–C4)

*AI reading (not the composer's words):* three-note sets of a semitone or a ninth apart — one note per pair, doubled, the beating
inside each pair and the sonority between them; a four-note cluster and an octave stack as the outliers. The facility to try and
keep them: RUNNING_LOG §205.

## CN-39 · 2026-09-07 — a to-do: an animation / technique for the piano to play scattered strikes SOLO

> *"then a composition/todo note, come up for an animation/technique for piano to play scattared strikes solo"* *(2026-09-07, late;
> typed, in the middle of the pitch-menu asks)*

*AI reading (not the composer's words):* the scattered strikes as a piano solo passage — the piano, the anchor of the beatings and out
of the morphs (CN-34, CN-37), gets its own material; what is asked for is the DEVICE: how the animated score animates a solo run of
scattered strikes for one player (the tuba's strike devices are ensemble ones), and the playing technique it implies. To come up
with when the notation and the animation are reached (PLAN §2); parked there.

## CN-40 · 2026-09-07 — the piano in the morph section: HARMONICS at the ensemble's re-breaths, the nearest strong one, a little detuned

> *"Composition note. for the piano part, for the morph section, use harmonics. So detect the onsets where the read breaths happen for
> the morph and what pitches they are, and then figure out the harmonic to play. if it's accessible or the nearest harmonic. It doesn't
> have to be the spot on pitch even better if it's a little detuned from what's being played in the ensemble. I'll book it the closest
> one that has the strongest harmonic. So I guess I would be the active or the fifth. And if that note isn't available, then move down
> the harmonic chain. develop a way to generate these? In two ways. So just to auto generate the midi, but also we have to figure out,
> just like with the piano percussion piece, how to fake fake harmonics using the earcom prepared piano sampler. does they just use, I
> believe, the fifth or the octave? Only one harmonic is available per key. But we did a version of this for that piece, and we could
> probably refine it here. maybe do a pass where we generate all the pitches from the onsets of the ensemble. We take off the ones that
> are playable by the... naturally by the sample library and then figure out how to achieve the other ones. either by using a different
> key Also, we can look into a different sample library that might have access to more harmonics."*
> *(2026-09-07, late; typed — "read breaths" = re-breaths, "the active" = the octave, "earcom" = IRCAM)*

*AI reading (not the composer's words):* the piano, out of the morphs as a bending voice (CN-34, CN-37), enters them as a RESONANCE:
at every re-breath (a re-bow) of the ensemble's morph, a piano harmonic on the pitch the re-entering player takes — not exact; a
little off it is welcome (a beating of its own against the ensemble) — the strongest harmonic first (the octave, then the fifth), then
down the chain (the third, the seventh …) when a stronger one has no string. Two deliverables: (1) the MIDI generated from the
morph's render — its re-breath onsets and pitches are already in the render (`renderPair` / the morph's notes carry every segment's
start and cents) — a pass that writes the piano's harmonic notes into the score; (2) the SOUND: the IRCAM Prepared Piano 2's
"Harmonics" preparation, faked as the two-piano piece did it (`composition_for_two_pianos_and_two_percussion/docs/HARMONICS_PIANO_PLAN.md`:
a fundamental string + a partial → the key played and a CC21 pitch shift, 19.048 c per step around 64, sent 85 ms before the note; a
curated table of which partials each string range gives — the low strings 2–28, the middle 2–16, the transition strings a short list
each, nothing above B4 as a fundamental; the ceiling MIDI 101) — a pass over the ensemble's onsets: the pitches the sampler gives
naturally, then the rest by another key and the shift, then what no key gives — and a look at other libraries with more harmonics.
Planned as PLAN 1i (todo), to be built when the morph section is composed; RUNNING_LOG §210.

## CN-41 · 2026-09-07 — section 2 begins at 183 s; tried in the main score, reverted if disliked

> *"Okay. A question about the save files for the main score. I want to now try some things in the main score with everything that's
> there now. And then if I don't like it, then I'll refer. So, basically, I'm starting section two now at one eighty three. and I'll
> add some things and try some things. And then if I don't like it, I like to revert back. So how do I do this? Or what's the best way
> to do this?"* *(2026-09-07, late; typed — "I'll refer" = revert)*

*AI reading (not the composer's words):* section 1 drafted to 175.7 s (v1.23-sec1DraftDone), the first beating placed after it
(v1.24-firstBeating); section 2 — the morphs and the beatings, CN-28's form — starts at 183 s, tried in the score itself with
everything built today (the beating drawer as it stands, the morph panel with the cast and the pitch menu, the actuals). The save
recipe for trying and reverting: RUNNING_LOG §214.

## CN-42 · 2026-09-07 — Lake George (the next piece): a RONDO with the morph as the returning section — bespoke · morph · another bespoke · morph …

> *"What if I want to try several things? So try some things, revert, or try some things, say that as a version, and then revert back
> to the beginning of section two, try some other things, say that, but then be able to go back to the first try or the second try or
> the third try or back to nothing. Then Composition note for Lake George piece. Ronda style form. with the morph or a morph section be
> the one returning. So I'll have a bespoke section beginning, then a morph, and then another one, a different bespoke, and then a
> morph."* *(2026-09-07, late; typed — "Ronda" = rondo, "say that" = save that)*

*AI reading (not the composer's words):* the form of piece #6 named: a rondo whose refrain is a MORPH section and whose episodes are
bespoke, each different — bespoke A · morph · bespoke B · morph · … — so the morph tool (revised into "an easier to use all purpose
tool" after this piece or the next, CN-29) carries the refrains of Lake George; the earlier Lake George notes (CN-31: the pointillistic
multitempo section, the bouncing balls; the 2026-09-04 notes: the pairs, the delicate continuous texture, the animated conductions)
are the episodes' material. Carried to the AI's memory of the next piece as well. The branching-tries question of the same message:
RUNNING_LOG §215.

## CN-43 · 2026-09-08 — the piano in the morph section, a different way: ARTICULATION POINTS generated from the morph — empty lines at the re-breaths, the apex dots and the breath ends; click a line → a pitch, an articulation, a dynamic, a duration

> *"Okay. Then I'd like to try something different with the piano. I'd like generated from the morph. just articulation points. These
> can maybe appear as lines in the piano part, but initially with nothing attached. And the line should come from any of the morph
> onsets, the rebreath, the peak point, those dots, and the end of a breath. And then I'd like to Be able to click on any of those
> lines. and assigned a pitch and an articulation. So either normal piano, mute... muted piano, or harmonic. or plot. Plucked. and
> then duration and dynamic. And I don't know if it's possible to have that vertical keyboard, and I can just pick a note for it. So
> relatively simple. Click a line. Keyboard pops up. I can choose a note. and I can add a dynamic via the normal dynamics PPP to FFF.
> and i could choose a duration or dial in a duration. Let's discuss how this should look first before building it."*
> *(2026-09-08, after the first pass of PLAN 1i and the apex dots explained; typed — "plot" = plucked, "those dots" = the score's apex
> dots, the loudest interior node of an envelope)*

*AI reading (not the composer's words):* the piano's part in the morph section composed BY HAND on a grid the morph gives: not
generated notes (PLAN 1i's first pass) but generated MOMENTS — three kinds per morph note, its onset (the re-breath), its apex (the
dot) and its end (the breath's end) — drawn on the piano lane as empty vertical lines, nothing sounding until he clicks one and gives
it a pitch (a vertical keyboard), an articulation (the piano's four voices: normal · muted · harmonic · plucked), a dynamic (ppp …
fff, the score's own scale) and a duration (typed, or dialled). The piano as a punctuation of the ensemble's breathing, placed by ear
point by point. The design discussed first, at his word (the planning method); RUNNING_LOG §219.

## CN-44 · 2026-09-08 — the strikes drawer augmented: a strike's rhythm carrying CHORDS (or parts of a chord), players assigned per onset, dealt so no player strikes twice within 200 ms

> *"I would like to build another plan. So this will be probably a augment of the strike straw. drawer. And what I'd like is to use the
> rhythms that are generated usually for one strike individual. notes for one strike, but I'd like to make those onsets carry a cord or
> part of a cord and then I'd like to be able to assign players to that particular onset for those particular pictures. hitches pitches
> and then I can draw from the large cord set that I have. so it might look something like this kind of like a mirror of how it already
> is. but maybe we can re-adapt the same gooey elements so I would dial in the rhythm the whole the same things like the round. robin or
> the randomize each cycle all those features and then I'd be able to assign a cord from the drawer or individual pitches to each
> strike and then I'd have something similar to what is going on with the round. robin core individual pictures but I can say I want
> four players on this one or two players on that one and then the algorithm would shuffle so that no player has another impulse.
> let's lower it to 200 milliseconds in a row so let's think through the requirements"*
> *(2026-09-08, after PLAN 1j's build; typed — "strike straw" = strikes drawer, "cord" = chord, "pictures / hitches" = pitches, "gooey" =
> GUI, "core" = chord; "let's lower it to 200 milliseconds" = the rest a player needs before its next impulse)*

*AI reading (not the composer's words):* a second use of the strikes drawer's rhythm engine — a strike's onsets (one player's notes
today, dealt round robin or randomised each cycle) become CHORD onsets: each onset carries a chord or a part of one, taken from the
harmony list (the strikes' chords, the tuba's blasts, the two-piano chord shapes) or typed as pitches, with a player count per onset
("four players on this one, two on that one"); the dealer spreads the pitches over the players with the drawer's existing modes
(round robin, randomised each cycle) under one rule: no player strikes again within 200 ms. The same GUI elements re-adapted (the
rhythm dials, the run, the seeds), "a mirror of how it already is". The requirements discussed first (the planning method);
RUNNING_LOG §234.

## CN-45 · 2026-09-08 — CN-44 continued: not a hand assignment but MENUS the machine solves — a range of players per onset, a menu of chords with an order and a dwell; and inserting PART of the finished sequence

> *"what I would like is me to put in the menu. So, for example, I can say two to four players each strike, and then the machine can
> solve how many players to put on each onset and how to scramble that And then same with the courts. I can give him menu of cords, and
> then they can alternate them and randomly shuffle them. Or I can give -- a -- few cords -- - -- say things like exhaust one cord
> ---thwn move- to the next cord. -- or then assign a few cords and then random shuffle those chords and then say cycle through each
> cord two to four times before moving on to the next one. things like that and then I'd also like to add the ability to insert part of
> the final sequence into the main score"*
> *(2026-09-08, answering topic 1 of the requirements talk; typed — "courts / cords" = chords, "thwn" = then)*

*AI reading (not the composer's words):* topic 1 answered by widening it — the onsets are not assigned by hand at all; he sets RULES in
menus and the machine solves the rest, the drawer's habit throughout (a dial, a seed, a reshuffle). Two menus: **the players per onset**
— a range ("two to four"), the machine choosing the count for each onset and scrambling who plays; **the chords** — a list he assembles
from the stored set, with an ORDER (in turn · shuffled) and a DWELL (exhaust one chord before the next · stay on each chord two to four
times before moving on), the numbers themselves ranges. And a third ask, new: **insert PART of the finished sequence into the main
score** — a chosen span of the result placed, not all of it. RUNNING_LOG §235.

## CN-46 · 2026-09-08 — CN-44/45 continued: a manual option per onset with the collision still checked; the selection menu the voicing presets' (as played · shuffle · high cluster · low cluster) plus a random part per onset moving on to the next chord

> *"I'd like to also have a manual option so I can assign the number of players and the cord or cord parts to any one onset. and then
> have the the collision checked. for the selection, I'd like to have all three not too different than we have for the single cord
> shuffle we have as played and then a shuffle and then those other options like high cluster low cluster but then also your third
> option which is for each onset. it chooses a random selection of that cord and then moves on to the next cord for the next onset"*
> *(2026-09-08, answering topic 2; typed — "cord" = chord, "the single cord shuffle" = the drawer's voicing presets)*

*AI reading (not the composer's words):* topic 2 answered "all three", and with it the vocabulary settled: the way a chord's notes are
CHOSEN for an onset is the drawer's own voicing menu (as played · shuffle · high cluster · low cluster · spread …), not a new
invention; and the way the tool MOVES ON is separate (exhaust the chord · stay n times · a fresh chord every onset — his last
sentence). Two axes, two menus. Plus a MANUAL option: any single onset given its player count and its chord or its exact notes by
hand, the collision check still run over it (a hand choice is never silently changed — the drawer's rule with hand-assigned notes,
STRIKES_TOOL F). RUNNING_LOG §236.

## CN-47 · 2026-09-08 — CN-44 continued: saving the whole shuffle and rhythm as a unit, saving selected PARTS too, each save carrying every choice that made it

> *"c then also let's talk about how things are saved. so I would like to save the overall shuffle and rhythm as a unit. but also if I
> select parts of it I can save those and the save would include my choices such as which cords and if I chose random shuffle etc. all
> the data that was used to create that sequence"*
> *(2026-09-08, answering topic 5 with (c) — a span marked by a drag AND by click / shift-click — and opening the saving)*

*AI reading (not the composer's words):* a save is the sequence AND its recipe — the dealt result (every onset with its players and
pitches, the flags) together with everything that produced it: the chord list, the order, the advance, the selection, the player range,
the dealer, the seed, the rhythm dials and the manual onsets. Two grains: the WHOLE (the shuffle and the rhythm as one unit) and a
PART (a marked span saved on its own, carrying the same provenance and the memory of the whole it came from). This is the morph
panel's ACTUAL with its recall (§213) brought to the strikes drawer, whose takes today keep the settings alone. RUNNING_LOG §239.

## CN-48 · 2026-09-08 — the CRESCENDOS: a C key like the trills' T, a filler that crescendos through the gaps of a strike sequence, and crescendo strikes in the chords drawer

> *"i would like to work on another build/plan; this is for crescendos, 2.5 builds both for crescendos; 1st I would like a facility like
> the trills in the main score. now, with tr, I insert a strike in the main score, select one note/brick, hit t and it creates a trill
> zone based on 1 of 3 independant curves, zone continues until something like .15 s before the next note for that instrument; for the
> crescendos, similar, strike, select note, press something like c a crescendo appears on that pitch -> .15 before next note, use
> standard curve, I think we called it surge in the tuba piece, but lets do a survey of the crescendo curves I use throughout my pieces
> and potentially a listening test at different durations to nail down a standard or a couple of standards; we'll have a default
> dynamic range ppp-fff and I can reassign individually, also can assign a manual duration, so maybe: c key, little panel, default
> dynamic range and duration (til next note or if no note a standard duration), and articulation, but I can change any of them there in
> the mini panel, then go to insert; build 1.5 related to above but I would like to take a sequence of strikes and fill in the gaps with
> a crescendo on an available instrument , see section beginning at 135.72 with trills, so I would like at least 2 modes for now, 1 will
> be like the trills 135 each onset has a trill/crescendo start with in in an available instrument, I was choosing the empty instrument
> with the shortest available space before its next onset, but above a min say something like 2 seconds, but we should refine this
> choice; mode 2 the crescendo/trill ends with a strike, precisely the end of the cres is at the end of the strike duration; also to
> figure out pitches, maybe a menu, this/last pitch of the corresponding strike or next pitch of strike; also any of the harmonies from
> the harmony drawer, distributed across the sequence of trills/cres and same options of the strikes, reshuffle, repeat in order, etc
> these will include all the ones we identified in the updated morph panel as well
> 2nd related build like the recent strike chords/and-or strikes but instead of single attack, they will be crescendos, help me walk
> thru what needs to be changed for the new articulation, change default instrument, ordinaro or senza vibrato velocity, the
> spacing/overlap rules need to adjust next articulation for any one instrument will be 150ms after end of crescendo; others? ok help me
> organize the planning, 3 separate plans if necessary, any overlaps bundled into a combined plan pass, then whatever unique pick ups
> for each individual plan or another process?"*
> *(2026-09-08, after PLAN 1k was built; typed — "tr" = the trill, "ordinaro" = ordinario)*

*AI reading (not the composer's words):* the crescendo becomes a first-class object of the piece, as the trill and the strike and the
beating are, and arrives in three places: **(1)** by hand in the score — select a note, press C, a mini panel (the dynamic range, the
duration, the articulation), insert, the crescendo running to just before that player's next note, on a STANDARD curve to be settled by
a survey of his own pieces and a listening test at several durations; **(2)** across a sequence — the gaps between strikes filled with
crescendos (and trills) on whatever instrument is free, two modes (one starting at each onset, as the section from 135.72 does with
trills; one ENDING exactly at a strike's end), the free-instrument choice refined, the pitches from a menu (the strike's own pitch, its
next, or a harmony from the drawer distributed across the sequence with the strikes' own options — reshuffle, in order — including the
morph panel's sonorities); **(3)** in the strikes drawer — the chords and strikes of PLAN 1k sounding as crescendos instead of single
attacks, which changes the articulation, the ordinary voice, the velocity law and the spacing (the next attack on a player 150 ms after
the END of its crescendo, not after its attack). He asks first how to organize the planning. RUNNING_LOG §252.

## CN-49 · 2026-09-08 — the standard named (surge), and SECCO: an abrupt cut at the end of a crescendo, in the notation and in the sound

> *"the surge is the default, we can keep the others as options, the bloom needs to be revisited but defer til first use; i thought of
> one more thing, I would like a secco setting, maybe a checkbox, secco on by default, for performers/notation this is a text
> instruction, mostly for strings, though I would include the instruction for the winds to give them a sense of the shape, but strings
> would damp the string with a finger or bow pressure at the end of the crescendo to give an abrupt cut; for the sampler a cc7 cut so
> nothing rings after the end of the crescendo, i think we did it in the string quartet, and if i remember all notes off doesn't work so
> nevermind that fork, we'll use cc7 just has to be on the right port and see string quartet for specs on how to cut"*
> *(2026-09-08, after the crescendo listening test was handed to him)*

*AI reading (not the composer's words):* the crescendo's CLIFF (§255) gets its performing technique. **SECCO** is a property of a
crescendo, on by default: in the notation a text instruction — for the strings an action (damp the string with a finger or bow
pressure at the end), for the winds the same word so they hear the shape the strings will make; in the sound a **CC7 cut** at the end
so nothing rings past it. He remembers rightly that All Notes Off is no use here (the Xsample instruments do not accept it — NITS,
RUNNING_LOG §202), so the cut is CC7 on the player's own port and channel. **Checked in the quartet (#1):** `secco` there is a
NOTATION flag — a text mark beside "Non-Vib" on a long tone, a checkbox in its crescendo tool, removed from the LilyPond when
unchecked (`server.js` ~1050–1520); the MIDI cut is not written down there, so this piece specifies it. RUNNING_LOG §263.

## CN-50 · 2026-09-08 — the secco cut solved in the BACK END: a round robin of instances, the rotation invisible to the front end

> *"alternatively, I think there are already 3 instances available for a round robin do a quick back of napkin calc and see if at the
> margins we ever need a 4th, if so, then put into the plan adding a 4th instance, I believe ai can do this independantly, see bridge and
> kontakt developer options and other xml etc, I might need to put in the loopmidi ports and the precedent is there already. the idea is
> the rotation happens in the back-end, the playback isn't the #1 priority, but I don't want to produce a shoddy demo, so I don't need to
> spend too much time solving intractable problems for playback but in general it should behave like human performers, so have the back
> end architecture so we don't have to think about it on the front end"*
> *(2026-09-08, on the secco cut and the CC7 residue)*

*AI reading (not the composer's words):* the standing principle, wider than this feature — **the playback architecture absorbs the
sampler's limits so the composing surface never has to**. A crescendo is asked for; where it sounds is the back end's problem. The
sampler's rule (a cut needs its slot left alone for a while) is paid for by rotating slots, the way a section of players would simply
be several people. Two boundaries he sets: the demo must not be shoddy, and no long chase after intractable playback problems — good
enough to behave like human performers. RUNNING_LOG §266.

## CN-51 · 2026-09-08 — LAKE GEORGE (piece #6): a pattern tool fed by multitempo and phase, orchestrated and thinned by algorithm; harmony changed on a clock, with transitions like video transitions; a counterpoint of timbres

> *"composition note for lake george, create tool like strikes rhythm portion, but using multi-tempo and phase-shift tool/panel as
> feeder, then when pattern is chosen can orchestrate it various ways, can change articulations per note, can do things like weight one
> or a group of instruments, like 50% of the time is the horn, importantly, have various algos to remove notes, create different degrees
> of sparceness, need to debelop a good model for this; and like chord strikes, add whole or portions, also way to harmonize pattern
> change harmonies every n seconds, or generate time containers to change harmonies, also series of harmony transitions like video
> transitions metaphoricly speaking a variety, crossfade, wipe, ... find models that have distinction sonicly and then codify, can use in
> other things; for the composition part of this note, try to develop a counterpoint of timbres, like sciariano,"*
> *(2026-09-08; typed — "sciariano" = Salvatore Sciarrino, "debelop" = develop)*

*AI reading (not the composer's words):* a tool for piece #6, described by what it is NOT — the strikes drawer's rhythm column, but fed
from a different source and thinned rather than filled. Its parts as he names them:
1. **The feeder is the multitempo / phase-shift panel**, not a recorded strike: a pattern is generated there and chosen.
2. **The orchestration is open** afterwards — several ways over one pattern, the articulation settable per note.
3. **Weighting**, which is new: *"50% of the time is the horn"* — an instrument or a group given a share of the pattern rather than a
   turn in a rotation.
4. **Thinning is the heart** — *"importantly, have various algos to remove notes, create different degrees of sparceness, need to
   develop a good model for this"*: not one rule but a family, and the model itself is the work.
5. **Whole or part**, as PLAN 1k's chord strikes now do (a span marked, that span inserted).
6. **Harmony on a clock**: the pattern harmonized, the harmony changing every n seconds, or by TIME CONTAINERS that hold a harmony for
   a span.
7. **Harmony transitions as a codified family** — his metaphor is video transitions: crossfade, wipe, and others; *"find models that
   have distinction sonicly and then codify, can use in other things"* — so the family is general, not only for this tool.
8. **The composition itself: a counterpoint of TIMBRES, after Sciarrino** — the line carried by colour rather than pitch.

Piece #6's material so far: CN-31 (the pointillistic multitempo section, the bouncing balls), CN-42 (the rondo whose refrain is a morph
section), the 2026-09-04 notes (the pairs, the delicate continuous texture, the animated conductions), and now this. Nothing to build in
the septet unless the septet asks for it; the transitions family (7) is the one part that might earn its place here first, since the
morph and the harmony menu already sit next to each other. RUNNING_LOG §268.

## CN-52 · 2026-09-08 — to do: the PIANO in the chord strikes — it picks up the partials the ensemble could not take, or plays several notes of the sonority itself

> *"and can you take a note to todo revisit the chord strikes and incorporate alowing piano to play a whole chord or multiple partials
> in a chord, for example, if that strike is allowing 3 instruments to avoid collisions, the piano can have the option of picking up
> other partials not dealt in that strike, also, in any strike the piano can play multiple notes from the underlying sonority, and then
> figure out an easy way to generate either single notes or chords for the piano per strike"*
> *(2026-09-08, after PLAN 1k was built)*

*AI reading (not the composer's words):* the piano is the one player that can take a whole chord at once, and PLAN 1k currently leaves
it out of the deal entirely (its default cast is the six, as the morphs and beatings are — CN-34). He wants it back in, in a role only
it can play: **the ensemble's leftovers**. Three things, and the third is the one to design:
1. **The remainder.** When an onset's count is held down — by his range, by the 200 ms rest, by the lowering rule — some notes of the
   chord go unplayed. **The piano may take those**, so the chord is complete even when the strings cannot be.
2. **Free of the count.** In any strike the piano may play several notes of the underlying sonority whether or not the ensemble was
   short, because a pianist's hand is not a bow: the collision rules that shape the others do not bind it the same way.
3. **"An easy way to generate either single notes or chords for the piano per strike"** — the interface question, and the real work: a
   per-strike choice (none · one note · a chord · the remainder), the way the drawer's other menus offer a rule rather than a hand
   assignment.
Its natural home is PLAN 1k as a later step, since it is the chord engine's own deal that decides what is left over. The septet's piano
already has its harmonics and its lines from the morphs (1i, 1j); this is its third role, and the first that is about the ensemble's
gaps rather than its own colour.

## CN-53 · 2026-09-08 — C with no note selected: the pitch comes from a chosen HARMONY, dealt like the strikes' round robin, and the set can be continued, changed or restarted

> *"a good, lets talk through no note selected; so maybe I'm working with something from the harmony drawer, and this can be the slotted
> choice, so every one I start without a pitch selected takes a pitch from the selected harmony and the similar choices to the strikes
> round robbin, finishes pitch set and re shuffles or chooses random etc, and whith each new one, i can continue or select a different
> harmony or restart with same harmony analysis/recommendations?"*
> *(2026-09-08, planning PLAN 1m, topic 3)*

*AI reading (not the composer's words):* the empty-handed C stops being an error and becomes a **way of writing**: he chooses a sonority
once, and then every C without a selection takes the next pitch from it — the deck's rules being the ones he already has (in order ·
shuffled to completion then reshuffled · random, seeded), and the state being his to continue, switch or restart. It makes the C key
two gestures in one: **on a note** it takes that note's pitch (topic 2), **on nothing** it takes the harmony's next pitch. The second is
how a passage gets written quickly; the first is how a passage gets answered.

## CN-54 — the unit of the filled sequence: an accent and a prolonged thing (2026-09-08)

> "the unit is the accent and the prolongued thing eg trill, crescendo, longtone; so the accent kicks off the long as if they were one
> unit, and with cres, I'll also have the accent be the cutoff so crescendo cutoff by accent as one unit; I tried and I think it sounds
> better when the crescendo ends at the end of the accented note, though these are short; the one that plays the long was just a
> pragmatic choice done by eye, more of an issue when there are fewer gaps, and there should be an abort strategy if there never is
> enough room otherwise no strong preference, maybe rotate to the player who played a long the longest before or to avoid a lot of short
> longs in a row or a mixture of longer and shorter longs, recommendation?"

**The AI reads it as** (marked as the AI's, not his): the gesture of PLAN 1n is not "an onset gets a long somewhere" but **accent +
prolongation as one thing**, with a third part for crescendos — a second accent that cuts it off, the crescendo ending at the END of that
accented note. The prolonged thing has three kinds: trill · crescendo · **long tone** (new here; CN-48 named only the first two). Which
player takes the long carries no musical intention, so it is the machine's to choose — with an abort when nothing fits. See RUNNING_LOG
§285–286 for the measurement of his own texture at 135.78 s and the three rules simulated on it.

## CN-55 — the pitch of a filled long is a strategy, reachable at three scopes (2026-09-08)

> "best different strategies and efficient access. So it could be [pitches] from the same strike harmony in order or shuffled or each a
> minor second offset from the previous [or] a fifth offset, etcetera, etcetera. or from a totally different pitch set. I just want to be
> able to choose from a variety of options and a variety of shuffles. And then either they [im]pose it on all the crescendos or sections
> of them. and then also be able to change individually, but in the same way. So select one and then say, this one should pull its pitch
> from this pitch set."

**The AI reads it as** (marked as the AI's): the question is not which pitch rule but how many are within reach and how fast. So every
property of a long — its pitch strategy, its anchor, its kind — is set at **three scopes from one menu: the whole pass · a selection · a
single long.** That is the same shape topic 2 produced for the anchors (CN-54, RUNNING_LOG §288), so 1n has one control idiom rather than
three. The strategies proposed: from the pattern (this accent · the one before · the one after · the whole collection dealt) · from a
sonority (1m's harmony bar whole) · a chain (a fixed interval from the previous long) · vertical (the note the sounding chord is missing).
See RUNNING_LOG §289–290.
