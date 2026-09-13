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
| **The trill is the tuba's SURGE with a trill on it:** open head (the nh-unit) + accidental + ledgers · the parenthesised neighbour after it · the whole column LEFT of the go line at the tuba's gap after the rightmost ink · go line at the onset at the septet's section-1 length · the level curve in the tuba's colour over the exact span, 90° cut · **no GC** (his: too close to the strikes' GCs; a GC means percussive here) | `devices.byEnv.trill` (built 2f.4) | §432–§434 · §438 |
| The `sfz` takes the tuba's below-chain and side-with-room rule (`dynMark: sfz`, `chainSide` unset); the `tr` = the technique-symbol slot above, 0.45 ss over the staff or the unit's top ink, centred on the head (`techSymbol: trill`, `techSymbolScale: 0.57` — halfway to the sfz's height, §439) | `devices.byEnv.trill` | §432 · §438 · §439 |
| The neighbour group `( [acc] ● )`: LilyPond-measured gaps and scales (`trillPitch`); the written neighbour = the next letter up from the written main note | `devices.byEnv.trill.trillPitch` | §435 · §438 |
| **The column RIGHT of the go line** — leftmost ink (head · ledgers · accidental · `tr` · `sfz` · ottava sign) 0.25 ss after the go line; the ottava bracket over the neighbour. Trying on the first five (63–68 s) | `nhAnchor: afterGo` via `--trillsRight t0-t1` (engraving overlay) | §445 |
| **CN-77 — for SECTION 3, not here:** the notation's swell is the standard shape, never the playback's bent curve | — | CN-77 |
