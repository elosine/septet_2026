# Trill notation — the spec sheet

*PLAN 2f.1, written 2026-09-13 (RUNNING_LOG §435). Every number the trill device needs, with where it came from. Decisions: §427–§434.
Sizing method: `docs/GLYPH_SIZING.md`. Rule index: `docs/NOTATION_STANDARDS.md` §2. Numbers here become registry data in 2f.2–2f.4;
once built, the registry is the source and this sheet is the record of why.*

**The device in one line:** the tuba's SURGE with a trill on it — open head · the parenthesised neighbour · `tr` above · `sfz` below ·
the whole column left of the go line · the go line at the onset · the level curve over the exact span · **no GC**.

**Provenance keys:** **T** = the tuba registry as carried in this repo (`notation/registry/container.json`, identical to piece #4's) ·
**S** = the septet's section-1 rules (NOTATION_STANDARDS §1) · **LP** = LilyPond 2.24.4, measured by the probe
`tools/fixtures/lp_probes/trill.ly` (defaults for every TrillPitch* grob and the TrillSpanner; `NoteHead.font-size = #-2`) ·
**H** = the house sizing (GLYPH_SIZING) · **C** = the composer score (`score/public/composer.html`) · **D** = his decision.

---

## 1 · What the trill event carries (the IR, 2f.3)

| field | value | from |
|---|---|---|
| source | a `zone` with `midiModel: 'trill'` and a `trill` block, on the part's layer | C, TRILLS_TOOL §104 |
| onset · duration | `startTime` · `endTime − startTime` | C |
| pitch | `trill.pitch` (sounding midi), spelled by the house speller | C |
| neighbour | `trill.pitch + trill.interval` (1 = semitone, 2 = whole tone; the draft's 69 are all upper) | D §427 |
| neighbour spelling | **the next letter name up** (a second, never a unison): C + 1 = D♭, E + 1 = F, C♯ + 2 = D♯. If that needs a double sharp or flat, the house speller instead | proposal — his eye at 2f.5 |
| env | `trill` (a new species; resolves `devices.byEnv.trill`) | this sheet |
| level | 101 samples 0–1 over [onset, onset + duration], from the resolved reference (§5) | C, D23 |
| eaten notes | a note stamped `mutedBy: <trill id>` is **not extracted** when trills are (its attack is the trill's attack). 11 notes carry the stamp today, the piano's `wc-880` at 63.72 s among them | C, TRILLS_TOOL §6 |
| opt-in | trills are extracted only with a build flag, so the strikes page (`strike1`) is unchanged until rebuilt with it | the D9 / snapshot discipline |

## 2 · The column (the nh-unit), horizontal — left of the go line

| element | spec | from |
|---|---|---|
| main head | **open** (`notehead.open`, 1.107 × 0.883 ss), stemless, scale 1 — the surge's unit | D §432 (1a), T `devices.byEnv.surge` |
| main accidental · ledgers · ottava | the nh-unit's existing rules unchanged: accidental 0.10 ss left of the head or the ledger it touches; ledgers 0.25 × head width past each side; ottava from the 4th ledger | T, H, S §401l |
| gap: main head's right ink → the neighbour group's left paren | **0.30 ss** | LP `TrillPitchGroup.padding` (measured 0.300) |
| left paren · right paren | Emmentaler `accidentals.leftparen` / `rightparen` at **× 0.63** (font-size −4) = 0.285 × 1.33 ss, centred vertically on the neighbour head | LP `TrillPitchParentheses.font-size −4` (measured 1.26 tall) |
| paren inner padding (paren ink ↔ the enclosed ink, both sides) | **0.42 ss** | LP (measured 0.417 both sides, all three probe notes) |
| neighbour head | **filled**, the house filled head × 0.794 = 0.83 × 0.70 ss (= LilyPond's −4 against the house −2) | LP `TrillPitchHead.font-size −4` (measured 0.815 × 0.709) |
| neighbour accidental | only when its alter ≠ 0 (the house prints no naturals); the house accidental × 0.794; its right ink **0.20 ss** before the neighbour head | LP `TrillPitchAccidental.padding 0.2` (measured 0.200). ⚠ LilyPond prints a natural on every trill pitch — the house does not |
| neighbour ledgers | the house ledger rule at the neighbour's head width (0.25 × 0.83 = 0.21 ss overhang) | H. LilyPond draws them too, 0.15 overhang |
| **the unit's right ink** | the right paren's right edge | this sheet |
| **gap: the unit's right ink → the go line** | **0.25 ss** — the surge's `nhGapSs` (the composer's "2 px" at staff 31.6) | T `layout.nhGapSs`, `_nhGapNote` |
| GC push | none — no GC (the 0.6 ss strike gap does not apply) | D §434 |

**Width check, the piano's first trill (C2 → D2):** head 1.107 · 0.30 · paren 0.285 · 0.42 · head 0.83 · 0.42 · paren 0.285 = **3.65 ss**
of ink, plus the main head's left ledger overhang (0.28), then 0.25 to the go line. The column's left edge sits ~4.2 ss before the onset.

## 3 · The column, vertical

| element | spec | from |
|---|---|---|
| **`tr`** | Emmentaler `scripts.trill` × **0.57** = 1.37 × 1.26 ss — first 0.70 (1.68 × 1.54), then halfway to the sfz's height at his eye | D §430 · §439 |
| `tr` horizontal | centred on the main head column | LP (centred within 0.09 ss); H (the strikes' symbol above, `headDx`) |
| `tr` vertical | **above**: bottom ink **0.45 ss** above whichever is higher — the staff's top line or the unit's top ink (head · accidental · the neighbour group) | H `stackGapSs 0.45` (the strikes' symbol-above rule, §400). LP: 0.50 (`TrillSpanner` padding 0.5, staff-padding 1.0 measured 0.55 from the line centre) |
| `tr` on the piano | above the staff the note is written on (C2 → above the bass staff, inside the grand staff's 6 ss gap) | S §401k |
| **`sfz`** | `glyphs.dynamic.sfz` (1.18 × 0.97 ss, DynamicText −8.5) on every trill | D §428 |
| `sfz` placement | **the tuba's dynamics rule**: the below-chain (`stackBelow`: articulation · dynamic · instruction · ottava), its top ink **0.45 ss** below whichever is lower — the staff's bottom line or the unit's bottom ink; centred on the head column; **side-with-room**: flips above (under the `tr`) only when it cannot fit between the ink and the lane edge; an ottava pins the chain to its side | T `stackGapSs`, `_stackNote`, `chainSide.sideWithRoom`, `_chainSideNote`; D §432 ("use those same rules for the sforzando") |
| the chain side for a trill | `sideWithRoom` — the tuba's, not the strikes' `headSide` (a trill head has no stem to mirror) | T; this sheet |

## 4 · The go line

| spec | value | from |
|---|---|---|
| x | the trill's onset (the go time) | D §432 |
| colour · width · opacity · dash | `#333` · 1.5 px · 0.85 · `5,4` | T `render.goLine` |
| **top** | **at the height a GC arc's top would have in that part** — the same length as the section-1 strikes' go lines, although the trill carries no GC | S `goLine.topAtGcArc` (§401h); D §432 ("we adjusted the length of the go line in GCs for the first section") — a device flag, since today the rule keys on a GC being present |
| bottom | the lane bottom; a multi-staff part (the piano) mirrors its top distance below the last staff | S `multiStaffBottomMirrorsTop` (§401i) |

## 5 · The level curve

| spec | value | from |
|---|---|---|
| drawn span | from the go line (onset) to the trill's end, exactly | D (CN-75) |
| colour · fill · outline | `#2E7D32` · fill-opacity **0.3** · no stroke | T `render.envCurve` — "same color curve", D §432 |
| band | value 0 → the lane's bottom edge, 1 → its top edge; **the piano: its whole lane** (both staves), as its go line and GC already are | T render (`envcurve`); S §401d. Built 2f.4: the curve item carries `band: lane`, render draws it over the part's whole lane |
| back edge | a vertical edge at the trill's end (the fill closes straight down) | T render |
| peak truncation (`cut`) | **off** — the tuba's surge truncates its rise at the peak; a trill's curve is drawn over its whole span as sampled | this sheet |
| the reference | `trill.curveRef`: `auto` → the A window (layer 8) if a curve there overlaps the span, else the lane's own drawn curve (never a note), else flat at `trill.level`; `A`/`B`/`C` → that window; `lane` → `trill.curveId` or the lane's first curve; `flat` → `trill.level` | C `trillRefResolved`, `refCurvesOn` |
| the value at time t | the curve covering t, else the nearest curve's nearer edge; `getYAtTime(c, t) / 10` | C `curvesLevelAt`, `getYAtTime` |
| the evaluator | the composer's `getYAtPos` — **it has a `smooth` blend that `sonify_core.evalWaveCurve` lacks**. No window in `piece-septet` has smooth nodes today (0 of 6), so the two agree; the extractor must still follow the composer's math or refuse a smooth node loudly | C; §435 |
| **CN-77** | a standing note for SECTION 3: there the notation draws the standard swell shape, not the playback's bent curve. Not applied here | D CN-77 |

### ⚠ What the data draws — for his eye at 2f.5

Sampled over each trill's span: **52 of the 69 trills read a level that varies by less than 0.02 — flat, all at 1.0 (fff).**
The piano's first trill (63.72–65.45 s) lies on the A window's opening plateau (1.0 from 63.07 to 66.30 s). Drawn as specified, it is a
**full-height green block** over the lane, not a swell like the tuba's surge in his picture. The first varying ones start at 72.80 s
(0.06 → 1.0). The build draws the data as it stands; whether a trill's curve should instead be a standard swell (CN-77's reasoning), or the
windows redrawn, is his call when he sees it.

## 6 · What the device does NOT carry

- no GC (D §434) · no stem, no flag, no dot, no accent (the strike look is `byEnv.strike`; a trill is `byEnv.trill`)
- no ring bar, no brick (the curve is the duration)
- no wavy trill line (the curve replaces it — D §433, Q3 = A)
- no dynamic pair (`ppp → fff` is the surge's; the trill states `sfz` and its curve)
- the rate curve is never notated (TRILLS_TOOL, the composer: "it'll just say trill")

## 7 · Registry shape — as BUILT (2f.4, RUNNING_LOG §438)

```json
"devices": { "byEnv": { "trill": {
  "goLine": true, "goLineTopAsGc": true, "gc": false,
  "nhUnit": true, "nhHead": "open", "brick": false, "ringBar": false,
  "curve": true, "cut": false, "curveBand": "lane",
  "dynPair": false, "dynMark": "sfz",
  "techSymbol": "trill", "techSymbolScale": 0.57,
  "trillPitch": { "groupPadSs": 0.30, "parenScale": 0.63, "parenInnerSs": 0.42,
                  "headScale": 0.794, "accScale": 0.794, "accPadSs": 0.20, "naturals": false }
} } }
```

Two changes from the first sketch, both to reuse what exists: the `tr` rides the strikes' technique-symbol slot (`techSymbol`,
`techSymbolScale` — the symbol-above rule of §400) rather than a new `trillSign` key; and **`chainSide` is left UNSET** — any device
value other than `headSide` bypasses the side-with-room test, so writing `sideWithRoom` there would switch the rule off.

Glyph keys (2f.2): `glyphs.articulation.trill` from `scripts.trill`; `glyphs.accidental.leftParen` / `rightParen` from
`accidentals.leftparen` / `rightparen` — stored at STOCK size, the factors applied as data.
