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
