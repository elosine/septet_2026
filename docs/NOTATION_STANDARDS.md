# Notation standards — the septet (piece #5)

*The rules the page is drawn by, each with where it lives as DATA and the journal entry that decided it. The registry
(`notation/registry/container.json` · `techniques.json` · `ensemble.json`) is the source; this file is the index. Opened
2026-09-11 (RUNNING_LOG §401n) after strike 1 → strikes 0–176 s. Add a section per material kind as it is decided.*

## §1 The strike (section 1's one-shots) — decided 2026-09-11, RUNNING_LOG §399–§401m

| rule | data | decided |
|---|---|---|
| **Every strike note at its own onset, its own GC** — no column, no fold ("as millisecond/pixel accurate as possible") | inherent: one event, one device | §399 |
| **What is a strike:** any note the strikes tool wrote (score `srcKind: 'strike'` → IR `env: 'strike'`), whatever its technique — the piano's `main` included | `extract_core` · `container.json engraving.layout.devices.byEnv.strike` | §401 |
| **The look:** the tuba staccato unit — filled head 0.844, 16th flag (flag-clear stem), staccato dot, go line, GC | `byEnv.strike` + `byTechnique.{gettato_vel, bartok_vel, slap, pizzicato}` | §400 |
| **No duration brick** on a strike | `brick: false` in those entries | §401b |
| **Stems the classic way** (above the middle line → down, below → up) | no `nhStemDir` (was `up` for one round) | §401f |
| **The stack on the HEAD side, mirrored with the stem** — below a stem-up note, above a stem-down one; order outward from the head: **dot · > · symbol · fff · text** | `chainSide: 'headSide'`; the order = the tuba's `stackBelow` (articulation · dynamic · instruction · ottava), `stackGapSs` 0.45 | §401f · §400 |
| **Accent > on every strike**; BCl also **+**; the strings' bartók the **snap-pizz ○** | `nhArtic: 'accent'` · `techSymbol: 'plus' / 'snappizz'` at 0.707 (#2's font-size −3) | §400 · §401b |
| **Technique symbol above the unit when the lane has room over the stem tip, else in the stack after the accent**; a head-side chain keeps it in the stack | layout `symAbove` / `symInChain` | §401 · §401f |
| **Dynamic on every strike** (vel 127 = fff; the five bands) | `dynMark: 'band'`, no `dynOnChange`; bands in `dynamicBands` | §401d |
| **Text on every note:** *jeté* (gettato) · *(slap)* · flute *T. R.*; centred on the head column (`instrAlign: middle`); *tongue ram* / right-justify were the first cut | `instrText`, `instrAlign` | §401d · §401h |
| **Tongue ram written at the FINGERING = sounding + M7**; playable only B3–C♯5 written; a warning at build and in layout, a red *out of range* on the page | `techniques.json pizzicato.written {transpose 11, range [59,73]}` | §400 |
| **The flute's rams folded into sounding C3–D4** by the smallest drop — a change to the MUSIC, in HIS tab: `foldFlute()` | `score/public/note_card.js` | §400 · §401 |
| **Piano's grand staff:** one lane, two staves, split at middle C; **inter-staff gap 6 ss** (#2's locked LilyPond measurement; LP's own default 5) centred in the lane; lane weight **1.576** = a player's air above and below | `engraving.layout.grandStaff.interStaffGapSs` · `ensemble.json` piano `weight` · `coords.withStaves` | §401k |
| **Piano's GC:** one lane's height, the arc from the lane top, impact on the line between the staves; the ball lands there too | `GC.systemOf` (render + animobj) | §401e |
| **Go line:** from the GC arc's top (not the lane top) to the lane bottom; a grand staff's line ends below the bass staff by what it sits above the treble | `goLine.topAtGcArc` · `goLine.multiStaffBottomMirrorsTop` | §401h · §401i |
| **Staff lines to the page edge** in every view | `engraving.render.staffFull` | §401b |
| **Ottava from the 4th ledger line on** (within 3 stays), every part; **the bracket** from the accidental's left edge to the rightmost ink (head or ledger overhang) **+ 0.30 ss**, hook toward the staff (Gould; LP runs 0.6 past) | `ottavaLedgerThreshold: 3` · `ottavaEndGapSs: 0.3` | §401j · §401l · §401m |
| **The buffer after the clef:** a page window opens 4.2 ss early, so a note whose onset IS the page cut still draws its unit clear of the gutter (the tuba's rule is the gutter itself; this is what makes it hold when a cut lands on a note) | `page_rules.musicStartBufferSs` | §404 |
| **The three gaps:** tight 0.15 (dot ↔ head) · medium 0.30 · standard 0.45 (the stack) | `tightGapSs` · `gapMediumSs` · `stackGapSs` | inherited |
| **Playback = the composer score:** the notation player uses the score's own note lengths (not the IR's sample-true ones) through the composer's `sonify_core` with `score.tracks` | `playback.scoreDurations` · `midiplayer.js` | §401f · §401g |
| **Animated devices:** only the GC; wedge and pie OFF; any kind switches off by `enabled: false` | `animated.lineWedge/motivePie.enabled` · `animobj kindOn` | §401m |

**Known spills, not rules** (NITS 2026-09-11): a first-of-part stack (accent + fff + text) under a 16th flag runs 0.3–0.8 ss past the lane
edge; a high stem-down note's stack above (Vn1 A♯5) ~1 ss over the top; the piano's stacks meet BCl's/Vn1's in 15 places over
0–176 s. The tuba's fix ladder applies per page.

## §2 Trills, morph curves, long notes — trills BUILT 2026-09-13 (§435–§440); morph curves and long notes not yet decided

**The meters (D42, §448):** piece #2's curve follower — 8 px, right edge 3 px left of the cursor, outline 1.5 px @ 0.8, fill @ 0.3 drawn first (`animated.curveMeter` · `crescMeter` · `glissMeter`). The pie and the line-wedge meter: spec in CURVE_LOOK §7, OFF here.

**The curve look (D42, all pieces): `docs/CURVE_LOOK.md`** — one closed path, fill 0.3, 2 px same-colour stroke, path opacity 0.3; limeGreen `#99FF00` for dynamics (the trills), brightOrange `#F04B00` for the morph glissando. Registry `envCurve` · `crescCurve` · `glissCurve`.

**Where the notation lives: the MAIN notation file** `notation/ir/piece-septet.ir.json` (D41) — the whole piece, every rule below and in §1 in
force (`--all --bricks --trills`); a new rule becomes a flag in its build.

**Sizing of any new glyph: `docs/GLYPH_SIZING.md`** — the families, the factors, what to compare to, the procedure.

**Trills — decided so far (RUNNING_LOG §427–§430), not yet on the page:**

| rule | registry key | § |
|---|---|---|
| **The neighbour** is the zone's `trill.interval` (1 = semitone, 2 = whole tone; the draft: 69 trills, all upper), written as a small stemless notehead in parentheses after the trilled note, with its accidental — LilyPond's pitched-trill look | (build) | §427–§428 |
| **`sfz` on every trill attack** (D23's attack mark, fixed as sfz) | (build) | §428 |
| **`tr`** = Emmentaler `scripts.trill` at **× 0.70** → 1.68 × 1.54 ss, the pedal's factor; parentheses scale with the head (0.794), provisional | (build; the factor as engraving data) | §429–§430 |
| The trill's dynamic is its **curve** (height 0 = ppp … 1 = fff, D23); the rate curve is never notated | — | D23 |
| **The trill is the tuba's SURGE with a trill on it:** open head (the nh-unit) + accidental + ledgers · the parenthesised neighbour after it · the whole column RIGHT of the go line, 0.25 ss after its leftmost ink (§452; LEFT until then) · go line at the onset at the septet's section-1 length · the level curve in the tuba's colour over the exact span, 90° cut · **no GC** (his: too close to the strikes' GCs; a GC means percussive here) | `devices.byEnv.trill` (built 2f.4) | §432–§434 · §438 |
| The `sfz` takes the tuba's below-chain and side-with-room rule (`dynMark: sfz`, `chainSide` unset); the `tr` = the technique-symbol slot above, 0.45 ss over the staff or the unit's top ink, centred on the head (`techSymbol: trill`, `techSymbolScale: 0.57` — halfway to the sfz's height, §439) | `devices.byEnv.trill` | §432 · §438 · §439 |
| The neighbour group `( [acc] ● )`: LilyPond-measured gaps and scales (`trillPitch`); the written neighbour = the next letter up from the written main note | `devices.byEnv.trill.trillPitch` | §435 · §438 |
| **The column RIGHT of the go line — every trill** — leftmost ink (head · ledgers · accidental · `tr` · `sfz` · ottava sign) 0.25 ss after the go line; the ottava bracket over the neighbour. Measured step by step: TRILL_NOTATION_SPEC §2a; conflicts: `tools/trill_conflicts.js` | `devices.byEnv.trill.nhAnchor: afterGo` (the `--trillsRight` flag superseded) | §445 · §452 |
| **CN-77 — for SECTION 3, not here:** the notation's swell is the standard shape, never the playback's bent curve | — | CN-77 |

## §2 The beamed group — strikes too close for their own GCs. Decided 2026-09-13, RUNNING_LOG §455–§458; first built at 43.3 s (§459)

*"the beams allow players to play several notes on one gc." The septet's answer to piece #4's density builds, with his differences: the
trigger is a gap, not a named span; no tempo mark; every head keeps its dot and accent.*

| rule | data | decided |
|---|---|---|
| **Trigger, the pair:** two successive strikes in ONE part under **0.4 s** apart → one beamed group, written **16th · 16th rest · 16th · 16th rest** (rhythmically 8ths); the written 16th = half the gap; **the beam runs on over the last rest**; each rest's left edge on its own slot time (D61) | `--cluster t0-t1@part --gridDiv 2 --restAfter 1 --beamOver 1` after the day-35 defaults `--beamsThrough --rests16` (`tools/notate_section.js`) | §456 · §457 |
| **Trigger, the four:** gaps under **0.25 s** → four beamed 16ths, straight, no rests; the piano's run written **four notes at a time**. First instance built: the bass four at 620.3 (§462). **Open:** a group on BOTH staves of the grand staff — the engine splits it per staff today; a cross-staff beam is the next design (§462) · how the run's 169 notes are cut into fours | `--cluster t0-t1@part --dyn 1 --accents 1,2,3,4` | §456 · §462 |
| **Max FOUR per GC — groups of 1, 2 or 4, never eight** (his "max four notes per GC. So one, two, and four", CN-78; §463's "eight per GC" closed) | inherent | §464 · CN-78 |
| **A group on ONE staff:** beamed as normal — every rule above stands (beam-side accents, one stem direction, left edges on go times). **A group on BOTH staves of the grand staff:** TRY one beam ABOVE the treble staff, the lower notes' stems reaching down into the bass. **Designed and built when SECTION 3 is notated, not before** — every such group is in the piano's closing run | (build, PLAN 2g.1 — deferred to section 3) | §463 · §464 · CN-78 |
| **GC on the FIRST note only**, at its own onset | `figures.cluster.gc: "first"` | §457 |
| **No go line on any note of the group** — nothing is displaced | `figures.cluster.goLine: false` | §457 |
| **Every head's LEFT EDGE on its own go time.** Onsets never move; the spatial score stays millisecond-true | `figures.cluster.nhAnchor: "leftEdge"` | §457 |
| **No tempo mark** — the spatial position carries the time; the beam only groups | inherent: a cluster prints none | §458 |
| **Dynamics:** one mark on the first note (its band); every head keeps its staccato dot and its accent; a later head in a different band gets its own mark | `--dyn 1 --accents 1,2…`; `figures.cluster.nhDot` | §458 |
| Head, dot, stem, beam: the cluster's — filled head 0.844, dot at the tight gap, one stem direction for the group, **the accents on one row on the beam side** (his "accent beam side fine", §462) | `figures.cluster` · `layout.js` beamHasArtic | §458 · §462 |
| **The three trill × GC arc meetings** (piano @85.35 · Vc @146.06 · BCl @147.78): **accepted, no change** — *"performers can time the gc and start the trill immediately after or cheat if they have to"* | `tools/trill_conflicts.js` still lists them; nothing to build | §456 |
| **Built so far:** the pair — piano `ev-wc-827` F#6 @43.328 + `ev-wc-832` C#6 @43.605 (gap 0.277 → 16th 0.1385); the four — piano bass G3 · B3 · C#3 · D#3 @620.316–620.825 (gaps 0.17, ♩ 88). Both in the MAIN file's recorded build | `provenance.build` | §459 · §462 |

**Where the counts stand at the 0.4 s trigger (§461):** **section 1 is complete** — its only gap under 0.4 s is this pair. After 183 s: 218 gaps
under 0.4 s (99 under 0.25) — 46 isolated pairs and two triples across the six non-piano parts, and the piano's ONE run of 169 notes (168 gaps,
87 under 0.25), the density build proper, whose writing is the next design conversation.

## §3 The morph section — opened 2026-09-14 (RUNNING_LOG §464–§467); the tuba's vocabulary (`for_seven_tubas/docs/MORPH_NOTATION.md`) with this piece's differences

*The starting point is the tuba's settled form: normal staff and clef · a header at each part's entry (the two written pitches, a gliss line,
niente · arrow · end mark on the dynamic row) · one go line per breath · the gliss curve (brightOrange) in the top half of the lane, the
crescendo (limeGreen) in the bottom, each normalised to its own extremes · two meters, no dots. Its look is D42's (CURVE_LOOK.md). The
tool: `tools/notate_morph.js` / `notation/lib/morph_overlays.js` / `notate_section.js --morph <group>`, carried by the port.*

| rule | data | decided |
|---|---|---|
| **A voice whose whole travel is under 20 c is written crescendo-only:** one written pitch, no gliss line, no quarter-tone head, no orange curve — the green crescendo alone (the tuba's BALANCE form). **The build tool ALERTS every time it applies; each case is looked at by him.** First cases: M2's flute (4 c) and cello (14 c) | (build: a threshold in `morph_overlays.js`, the alert in the tool's output) | **D44** · §464 · CN-79 |
| **THE PITCH FIGURE — D45, settled 2026-09-14 (§472 → §474; CN-80 · CN-81):** two heads with a gliss line, **in TIME order — the start left, the destination right.** The destination head is spelled to the **nearest QUARTER tone** with the simpler sign (♮ ♯ ♭ ¼♯ ¼♭; never ¾ — D¾♯ is written E¼♭), so the residual is within ±25 c; **the residual as a signed cents number above the destination head, written only when |residual| ≥ 7 c** (`--centsMin 7` — the JND of beating, ballparked; purpose-oriented, a future piece may set 0); **no arrows** (the sign carries the direction; eighth-tone arrows are out — Tenney / Helmholtz–Ellis / Haas practice: the nearest spelling, a signed residual); **ties at exactly 25 c spell toward the start** (C +25 / C −25). M1: C → C +25, D → D −25 … (the bass clarinet in written pitch); M2: C4 → D −14 · D2 → E¼♭ · A3 → B♭. **All pieces from here; piece #4's rehearsal and performance scores take it when made — the cents AND the time order** (its presentation score stays) | (build, PLAN 2h.2: `acc` + `cents` on the header overlay, a text item over the destination head, the header laid out start-left in `layout.js`; no new glyphs) | **D45** · §469–§474 · CN-80 · CN-81 |
| **THE MARKS AND THE CRESCENDO'S SCALE — D46 (2026-09-14, §473):** the header's dynamic figure is **FIXED — niente circle · arrow · `fff` on every part of every morph**, until further notice. It is the LEGEND of the bottom half-lane: bottom = niente, top = fff. **The crescendo curve is ABSOLUTE on that scale** — its height is the sound's level (D23's 0–1, the drawn 0–10, with the D32 fade weight multiplied in), NOT normalised to its own peak (the tuba's per-curve normalisation superseded for the crescendo): a morph that peaks at mf rises a little past half the lane and stops there. The gliss curve stays the displacement map (normalised to its extremes; the pitch figure states the amount). The meters ride the same samples | (build, PLAN 2h.2: `morph_overlays.js` `fit('level')` without the min–max normalisation; the fade weight) | **D46** · §473 |
| **THE CRESCENDO ARC'S DRAWING — D47 (2026-09-14, §475):** **no floor** (the tuba way — the fade from silence is drawn from the baseline; the trills' `curveFloor` is theirs alone) · **the arc through the BREATH PEAKS** — one anchor per breath at its loudest point, Catmull-Rom through them, absolute per D46 with the D32 fade weight in (the tuba's positional fit sagged to 0–5 % between M1's breaths; the raw level would show 9–16 humps per part) · **100 samples/s** (2f.7). The gliss curve stays the tuba's fit of the pitch, normalised to its extremes. **His eye on M1's first page decides; the floor stays a flag** | (build, PLAN 2h.2: `morph_overlays.js` `fit('level')` replaced by the breath-peak envelope; the fit sampled at 100/s) | **D47** · §475 |
| **Held, his to decide at the build (§464):** the piano's 44 notes in the morph section — the section-1 strike device with a plucked mark, or another · the beating indication — parts only, or on the score | — | open |
| **Fixes the septet needs before the first fold (§464 flags 3 · 5 · 6, + 2f.7):** the fade weight (`cc7Fade`, D32) multiplied into the sampled level so the crescendo starts from nothing where the sound does · the header in each part's clef and written pitch (BCl +M9) — verify · parts = layers under `tracks.length`, not 10 · 100 samples/s | (build, PLAN 2h.2) | §464 |
| **The morphs in the score:** M1 BEATING BLOOM 183.003 → ~305 s · M2 SPECTRAL DRIFT 314.000 → ~435 s, its D2 pair re-cast 2026-09-14 (BCl holds, Vc travels; ACT-SPECTRAL-05, §467). Pairs by pitch, across families (§464) | `scores/piece-septet.json` | §464 · §467 |
