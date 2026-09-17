# APPROVED 2026-09-17 — THE PRINT SCORE (the submission copy, TEMPUS LAB 2026)

**Composer, 2026-09-17, on the re-rendered PDF:** *"ok print score good"*

The score the call asks for — *"The score as an Adobe PDF document with a maximum size of DIN A3 (297 x 420 mm)"*.
Deadline **2026-10-15 23:59 CET**. PLAN 2b, RUNNING_LOG §606–§617.

## The file

**`Scattered-Substance-score-JYang.pdf`** — **71 pages** (cover · performance instructions ×2 · **68 of music**) · **6.39 MB** ·
A3 landscape, drawn **419.7 × 296.8 mm** so the MediaBox lands inside the call's 420 × 297 ceiling · staff **7.55 mm** ·
**10.32 s per page**, the density he picked, which is the approved film's own.
sha256 `d1966ef1c00e52e5065ad55327037086dec9af45c52a63f29beb453a64465270`.
**Not in git** (`print/score/**/*.pdf` is ignored) — this README is what git carries; the PDF lives on this machine. Back it up.

## The command

```bash
bash print/score/build.sh
```

`--rebuild-ir` first if the score has been saved since; `--proof` for the two proof PDFs. The script renders **and runs every gate** —
it is the only supported way to make this file.

## What made it

| | |
|---|---|
| score | `scores/piece-septet.json` as saved 2026-09-16 16:03 (commit `bc54cdc`) |
| IR | `notation/ir/piece-septet.ir.json` — 1806 events, window 0.00–625.00 s, rebuilt 2026-09-17 from its own `provenance.build` and found **identical to `bc54cdc`'s apart from its date** (§612), so the approved audio render and the approved video are of THIS score |
| frame | `Coords.ensembleFrame`, shared with the video exporter — seven weighted lanes (the piano 1.576), the grand staff, two brackets + brace, the labels Fl · BCl · Pno · Vn1 · Vn2 · Va · Vc; realization `video-jury` (the bass clarinet in C — D55) |
| cover | `print/cover/make_cover_septet.ps1` → `cover-septet-a3-landscape.svg`, #4's house style, title 73.5 pt (D58: *Scattered Substance*, "for flute, bass clarinet, piano and string quartet") |
| instructions | `docs/notation_instructions/index.html`, broken across two pages at "Acoustic Beating"; the four video links are clickable annotations |
| page edges | **D59** — a page owns `[cut, next cut)`: point events once and whole, long items on every page they cross, reserves left 0.422 s / right 0.302 s, the system ending with the page's music (his **"a"**, the ragged right edge — 19 pages, at most 1.90 s = 18 % of the width). PLAN 2b.7, §615–§617 |
| marks | none above the music (D58, his *"no marks"*); the strip above carries the time ruler alone |

## The gates, all green at archive time

| check | what it proves |
|---|---|
| `check_print_frame` | the printed page IS the filmed page, at four moments — eight systems, seven labels, two brackets, one brace |
| `check_print_front` | the cover's face resolved, no column of the instructions clipped |
| `check_print_pdf` | 1189.92 × 840.96 pt (inside DIN A3) · 0 fonts unembedded · **0 raster images** · the 4 links |
| `check_print_pages` | all 68 music pages carry the full frame; **one** terminal barline, on the last |
| `check_print_edges` | 14 532 of 14 532 point items owned exactly once · 1304 GC arcs = 1304 impact dots = 1304 owned strikes · 484 curve paths, none from a neighbouring page · no timed ink in the clef gutter, none past the system end |

**The approved film did not move:** the video exporter's pages 0 · 9 · 20 · 30 · 43 · 49 · 53 are byte-identical to their pre-2b.7
baselines, proven three times. Their sha256, for a session that needs them without a re-dump:
`65e4e10d…` (p0) · `1ae2a06a…` (p9) · `ccdbc3f5…` (p20) · `68913256…` (p30) · `ef8c055f…` (p43) · `5ffc7104…` (p49) · `c6d1b4c5…` (p53).

## Re-rendering after a Save

A Save means a new IR, and then the audio render (RENDER.md §1), the video (its archive README) **and this PDF** are all of an older
score. The order is: rebuild the IR → re-render audio → re-render video → `bash print/score/build.sh`. Nothing warns you across the
three; the IR staleness notice in `export_print` is a hint only (D75).

## Still open at archive time — his, not the score's

The four items carried since §605: the score-in-C line · the three fact flags on the instructions page (§569) · the tuba text he has
not reviewed · the two AI calls he may undo (the practice-video link order; Bass Clarinet + Cello's take 6).
