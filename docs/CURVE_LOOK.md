# The curve look — the standard for every curve drawn on a score

*D42, the composer, 2026-09-13 (RUNNING_LOG §446–§447). Carry it forward with the engine: this piece, piece #4's rehearsal and
performance scores when they are made, and every piece after. Sizes of glyphs are in `docs/GLYPH_SIZING.md`; this is its sibling
for the filled curves.*

> *"Okay. Let's record this as the standard. for these curves. We're also using it in the morph section of the tuba piece. So I need...
> when I actually make... it's too late for the presentation score, and that's fine. But when I actually make the rehearsal scores and the
> final performance score, I want these standards in there as well and across the board here. So for the morph section. while we're at
> it, can we look up the bright orange In the two piano two percussion score as well. and let's use that standard for the morph section in
> this piece and then moving forward in the tuba, this piece, and other pieces."* (composer, 2026-09-13)

---

## §1 Where it comes from

Piece #2 (*composition for two pianos and two percussion*), its final performance score: `builds/performance/index.html` +
`builds/performance/score.json` (built 2026-05-28, served by `scripts/performance_server.js` on :3001). Its curves —
`score.databases.curves.curves`, 148 of them — are drawn by `renderCurve`. Every one of them uses the same form; only the colour differs.

## §2 The form — ONE closed path

| attribute | value | note |
|---|---|---|
| shape | the curve's line, down its end edge, along the band's baseline, up its start edge — closed (`Z`) | `fillMode: bottom` in #2 |
| `fill` | the colour | |
| `fill-opacity` | **0.3** | |
| `stroke` | the same colour | the outline goes round the WHOLE shape — top, both ends, baseline |
| `stroke-width` | **2 px** | at the video frame (1920 × 1080); scales with the page |
| `opacity` (on the path) | **0.3** | applied to fill AND stroke together |

**What the eye sees:** the interior at **0.3 × 0.3 = 9 %**, the outline at **30 %** — a faint body with a clear edge. The "border" is
the stroke, three times as strong as the fill, because the path opacity multiplies a fill that is already at 0.3.

## §3 The colours, by role

| colour | hex | #2's use | the standard's use |
|---|---|---|---|
| **limeGreen** | `#99FF00` (#2 ColorMap `rgb(153,255,0)`) | 67 curves — the zone-dynamics swells (the opening piano tremolo, `pcrv-wc9-zn25-p1`) | **dynamics**: trills (the septet), surges and swells, the morph crescendo |
| **brightOrange** | `#F04B00` (#2 ColorMap `rgba(240,75,0)`) | 81 curves, 369–566 s (around 6:37 among them) — the accel / decel zones; all 81 identical, `opacity: 0.3` | **the morph glissando** (pitch) — the septet's and forward |

Piece #1 (the string quartet) is where both colours were named: limeGreen its crescendo colour, brightOrange its glissando colour.

## §4 In this engine (the septet's notation layer, ported from piece #4)

- **Registry** `notation/registry/container.json → engraving.render`: `envCurve` (trills, surges), `crescCurve` (the morph crescendo),
  `glissCurve` (the morph glissando) each carry `color`, `fillOpacity 0.3`, `strokeWPx 2`, `strokeOpacity 1`, `pathOpacity 0.3`.
- **Render** `notation/lib/render.js → curvePathD42()`: a curve entry that has `pathOpacity` is drawn as the one closed path above; an entry
  without it keeps the old fill-only drawing (so piece #4's staged batteries, which render with the code defaults, are unchanged).
- **The app**: the video and zoom views pass the whole render registry; the notation (window) view passes these three entries.
- **Proof**: `tools/test_trills.js` (the D42 block) — the registry values, the path's attributes, and the code-default look untouched.

## §5 For piece #4 and the pieces after

Piece #4 (`for_seven_tubas`) is read-only from this repo. When its rehearsal and performance scores are built: port `curvePathD42` and the
three registry entries (its morph section already uses these two colours, at fill 0.22 with no outline — D42 replaces that). Its
presentation score (the Penn State submission) stays as delivered — *"it's too late for the presentation score, and that's fine."*
A new piece starts with this file.

## §6 Register (append-only)

- **2026-09-13 — D42** — the standard adopted from piece #2's final performance score; applied in the septet to `envCurve` (the trills;
  was the tuba's `#2E7D32`, fill 0.3, no stroke), `crescCurve` and `glissCurve` (were fill 0.22, no stroke). RUNNING_LOG §446–§447.
