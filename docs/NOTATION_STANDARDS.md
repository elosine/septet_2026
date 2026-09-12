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

## §2 Trills, morph curves, long notes — not yet decided
