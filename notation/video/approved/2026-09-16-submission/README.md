# APPROVED 2026-09-16 — THE SUBMISSION COPY (the demo video, TEMPUS LAB 2026)

**Composer, 2026-09-16, on the full render:** *"video good, archive it as the submission copy"*

The animated presentation score of the septet — the wide shot with close-ups — for the Tempus Lab call (deadline 2026-10-15; the Tempus
copy of the print score links it). PLAN 2i.10, RUNNING_LOG §556–§563.

## Online

**https://youtu.be/x8EZ3B1EvbE** — his upload of `V-CUT.mp4` (given 2026-09-16, RUNNING_LOG §564). The link the Tempus copy of the print score carries (PLAN 2b).

## The file

**`V-CUT.mp4`** — the watch/submit file. 1920 × 1080 · 30 fps · h264 crf 16 + aac 256 k · **18 903 frames = 630.100 s** · 53.8 MB.
`cmp`-verified byte-identical to `notation/video/renders/piece-septet-V-CUT-seed53.mp4` at archive time.
sha256 `48ecf4e3416f9c8d0cc2279b5b5a4e0dfbf3de36112960bcddb3a3ec3929ea9d`.
**Not in git** (`notation/video/**/*.mp4` is ignored) — this folder's README and cut list are; the video lives on this machine. Back it up.

## What made it

| | |
|---|---|
| score | `scores/piece-septet.json` as saved 2026-09-16 16:03 (commit `bc54cdc`) → MAIN `notation/ir/piece-septet.ir.json` |
| audio | `notation/audio/piece-septet.wav` — the render of 2026-09-16 (RENDER.md §4, RUNNING_LOG §553–§554): 630.100 s, −1.0 dBTP, his "render good" · sha256 `ae3f6f74fb6b25565a9026ad8d1d6156f04b35b60c07d618fe2e0fa5ea6c3b65` |
| frame | the septet's ensemble, realized `video-jury` (the bass clarinet in C, bass clef — D55) · pages 1 and 50 identical to his notation page |
| close-ups | groups at **1.85×** (registry `realizations.video-cut`): V-TOP = Fl · BCl · Pno, V-BOT = the four strings |
| cut | **seed 53** (`cut-list-seed53.json`, a copy of `notation/video/cut-list.json`) — 8 close-ups, 190.0 s = 30.2 %, one top + one bottom in each of SECTION 1 · M1 BEATING BLOOM · M2 SPECTRAL DRIFT · SECTION 3 |
| transitions | `--fade 5 --fadeMode cross` (the tuba video's, his "clips look good") |
| the end | the picture holds from 625 s while the WAV's tail rings to 630.1 |

**Command:** `node tools/export_video.js --ir piece-septet --view video --fps 30 --cut notation/video/cut-list.json --fade 5 --fadeMode
cross --t1 630.1 --audio notation/audio/piece-septet.wav --out <out>.mp4` (~15 min).

## Measured, not asserted (the tuba's PHASE 5)

Duration equal (video 630.100 = audio 630.100) · A/V start 0.000000 on both streams · cut sources vs direct probes 0.46–2.07 % (codec) against
9–15 % for the wrong source · the held tail within 0.005 % · **his eye: "video good"**.
