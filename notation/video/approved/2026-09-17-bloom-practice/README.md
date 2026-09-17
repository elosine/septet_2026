# APPROVED 2026-09-17 — THE BLOOM PRACTICE VIDEOS (PLAN 2h.7, D48)

**Composer, 2026-09-17, on the three videos:** *"videos good"* — with the three YouTube links.

Three practice videos for the Bloom section of the middle movement, one per beating pair: the players see the beating speed and hear it in
isolation (D48 — no beating indication on the score; the rates go to the practice videos; BLOOM only, no SPECTRAL demos, §584). The shape is
piece #4's final demo videos, Bloom only (RUNNING_LOG §596). PLAN 2h.7; the build plan `docs/plans/BLOOM_PRACTICE_VIDEOS.md`; RUNNING_LOG §595–§602.

## Online — linked from the performance instructions page

Each URL checked against its own YouTube title (oEmbed) before it was wired into `docs/notation_instructions/index.html` (the tuba's rule).

| pair | file | URL | YouTube title |
|---|---|---|---|
| Flute + Violin 2 | `bloom-flvn2.mp4` | https://youtu.be/3GiK0cx5d74 | Scattered Substance · Acoustic Beating Demo · flute + violin 2 |
| Violin 1 + Viola | `bloom-vn1va.mp4` | https://youtu.be/fOV4lDN3kKA | Scattered Substance · Acoustic Beating Demo · violin 1 + viola |
| Bass Clarinet + Cello | `bloom-bclvc.mp4` | https://youtu.be/W1uv11zZC8U | Scattered Substance · Acoustic Beating Demo · Bass Clarinet + Cello |

## The files

**Not in git** (`notation/video/**/*.mp4` is ignored) — this README and `picked.json` are; the videos live on this machine (and YouTube). Back them up.
Each `cmp`-identical to `notation/video/renders/demos/bloom-<id>.mp4` at archive time (those copies are deletable).

| file | length | frames | size | sha256 |
|---|---|---|---|---|
| `bloom-bclvc.mp4` | 150.933 s | 4528 | 7.7 MiB | `64a707d4a860c385e2976f50727539474ee90ee5474a9fec576fb5c2a5e804cb` |
| `bloom-vn1va.mp4` | 155.833 s | 4675 | 8.2 MiB | `673a015b44731135149cb82a944b4e086ed4b0004abe4e7a61a663a5ec39ed57` |
| `bloom-flvn2.mp4` | 153.167 s | 4595 | 7.9 MiB | `360217dce9ee4ceb5c7f969b776b0908223682cd956ceea5afcb86ef6e21543c` |

1920 × 1080 · 30 fps · x264 crf 16 · AAC 256 k 48 kHz.

## Each video

1. **The static, 30 s** — the pair's two lanes at the pair's peak beating instant (the bass clarinet in C, the `video-jury` frame, D55), the label
   drawn on the picture (`Bloom — N Hz — <pair>`, Georgia 58 px; N and the row order read from the chart SVG), under it the **held dyad**.
2. **The whole Bloom** — the two lanes animated from 182 s to the pair's last curve end + 3 s, with the pair's own recording.

## What made it

| | |
|---|---|
| score | `scores/piece-septet.json`, objects identical to `bc54cdc` (the save of 2026-09-16 16:03) → MAIN IR |
| events | `midi/piece-septet.capture.json` — the composer's own playback, captured 2026-09-16 (RENDER.md rule 1) |
| pair recordings | `render_reaper.js --only <the pair's tracks> --out demo-bloom-<id> --end 312 --gainWindow 182-<end>`: the pair alone out of the rack, one plain gain to −1 dBTP read in the used window — bclvc +13.3 dB · vn1va +13.4 · flvn2 +16.2 |
| held dyads | `gen_bloom_heldmax.js` — each part = the capture frozen at the peak instant (every channel's controllers and bend as at T), struck **six times**; one render 0 → 660 s. Every Xsample note-on lands ±1–2 c from its bend (the flute is exact), so each strike is a draw |
| the pick | `pick_bloom_takes.js` — holds · within 4 % of the chart · envelope at 1–3× the rate · then the deepest beating (ties within 10 % → nearest the chart): **Fl + Vn2 take 3, 21.41 Hz · Vn1 + Va take 2, 16.12 Hz · Bcl + Vc take 6, 7.16 Hz** (`picked.json` here, every take's reading in it) |
| the static's gain | the pair recording's (Fl + Vn2 capped at −1 dBTP, +13.9 dB); 20 ms fade in, 500 ms out |
| build | `bash notation/video/renders/bloom_demos.sh all` |

**The picks belong to one render** (`notation/audio/raw/demo-bloom-heldmax-float.wav`, gitignored). To rebuild from scratch: `gen_bloom_heldmax.js` →
`render_reaper.js --dir midi/demo-bloom-heldmax --out demo-bloom-heldmax --end 660 --gainWindow 0-660` → `measure_beating.js --wav … --slots … --json`
into `midi/demo-bloom-heldmax/measured.json` → `pick_bloom_takes.js` → `bloom_demos.sh all` → `check_bloom_demos.js`. A new dyad render draws new takes.

## Measured, not asserted (`node tools/check_bloom_demos.js`)

| | label band PSNR | join vs a probe @ 182 / vs the still | first sound Δ | rate in the mp4 · vs the take · vs the label | static RMS · the music at its peak | true peaks |
|---|---|---|---|---|---|---|
| bclvc | 11.8 dB | 41.9 / 26.2 dB | 20 ms | 7.16 Hz · 0.0 % · 0.6 % | −16.3 · −17.8 dBFS | −9.4 / −1.1 dBTP |
| vn1va | 12.7 dB | 39.7 / 26.1 dB | 18 ms | 16.12 Hz · 0.0 % · 0.1 % | −18.4 · −16.5 | −7.7 / −1.0 |
| flvn2 | 12.5 dB | 40.4 / 25.9 dB | 17 ms | 21.41 Hz · 0.0 % · 0.4 % | −12.7 · −12.0 | −1.0 / −1.0 |

Video = audio length to the frame; both streams start at 0. The approved piece render (`notation/audio/piece-septet.wav`, sha256 `ae3f6f74…`) unchanged
throughout. **His eye and ear: "videos good".**
