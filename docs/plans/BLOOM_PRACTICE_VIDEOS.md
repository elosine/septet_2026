# THE BLOOM PRACTICE VIDEOS — the build plan (PLAN 2h.7 · D48)

> Written 2026-09-17 (session 15, Fable 5.1) for an **Opus** build, at the composer's word: *"Can we prepare the beating demo videos?
> Please look at the Tubo ones. We should essentially make similar videos to the final ones that were made for the Tubo piece."* — then
> *"we can skip the planning protocol. if you have what you need, pls draw up the plan to hand to opus"*. RUNNING_LOG §595–§597.
> **This file is self-contained: it is the only resume read.** Tick the steps here as they land; keep §8's register.

## §0 The shape — confirmed by him (§596)

- **Three videos, one per Bloom pair.** BLOOM only — no SPECTRAL demos (§584). The bass clarinet **in C** (his word; the `video-jury` frame, D55).
- **Each video, the tuba's final form:**
  1. **A static, 30 s** — a still of the pair's two lanes at the pair's peak instant, the label drawn ON the image
     (`Bloom — N Hz — <Part A> + <Part B>`), under it the **held** max-beating dyad.
  2. **The whole Bloom**, two lanes, animated, with the pair's own audio.
- No gap, no title card, no minimum statics, no second section. About 2:35 each.
- What the page already promises (his prose, §593): *"The demos isolate the pairs and demonstrate how the maximum beating levels sound and
  then provide a two-part demo of the Bloom section."*

## §1 The data — measured from `scores/piece-septet.json` (§595)

BLOOM **183.00 → 304.82 s** (SPECTRAL 314.00 → 435.48).

| pair | lanes (`--parts`) | pitch | peak | at | the pair's last curve end | rack tracks |
|---|---|---|---|---|---|---|
| Bass Clarinet + Cello | `1,6` | C4 | 7.2 Hz | 214.8 s | 299.93 | both `Bass Clarinet XS` · `Vc XS` |
| Violin 1 + Viola | `3,5` | D5 | 16.1 Hz | 222.9 s | 304.82 | `Vn1 XS` · `Va XS` |
| Flute + Violin 2 | `0,4` | A5 | 21.5 Hz | 226.6 s | 302.17 | `Flute SI2` + `Fluteb SI2` · `Vn2 XS` |

- **N on the label = the figure as the chart prints it** — read it from `tools/gen_morph_chart.js` / `images/morph_sequence_chart.svg`,
  never retyped from this table. Pair names and their order = the chart's BLOOM rows, so page, chart and videos agree.
- A part's unused second track (Fluteb, the second bass clarinet) goes along and stays silent — never guess which one sounds.

## §2 What exists, what is new

**Exists, proven:** the capture of the composer's own playback (`midi/piece-septet.capture.json`, 2026-09-16 16:17, of the save of 16:03 —
`piece-septet.json` unchanged since) · the 14 per-track files `midi/piece-septet/NN <track>.mid` · `tools/render_reaper.js` (the bridge
render, twice run on the whole piece) · `tools/export_video.js` with the tuba's day-40 flags (`--parts`, `--probe/--probeDir`, `--t0/--t1`,
`--audio`) · the tuba's build script, the template: `for_seven_tubas/notation/video/renders/demos.sh` (read-only).

**New here — each proven before it is relied on (step 1):**
- a two-lane export on the **septet** frame, and on **non-adjacent** lanes (every tuba pair was two neighbours; no septet pair is);
- a **pair-only** render through the bridge (the route has only ever rendered all 14 tracks);
- the held dyads made by **freezing the capture** (step 2) — the tuba's generator is NOT ported.

## §3 Guards — never

- **Never overwrite the approved render.** `notation/audio/piece-septet.wav` sha256 `ae3f6f74fb6b25565a9026ad8d1d6156f04b35b60c07d618fe2e0fa5ea6c3b65`
  — check it before the first demo render and after the last. `render_reaper.js` with default arguments writes exactly that file.
- **The rack is never written** (RENDER.md rule 12) — renders are copies in their own tab. `reaper/septet_rack.rpp` is his and uncommitted: never staged.
- **No composer tab, no capture run** — everything comes from the 09-16 capture. **Judge the capture against the save by CONTENT, not by file
  time:** `scores/piece-septet.json` was saved again 2026-09-17 11:04, during the planning session — measured at once (§598): all 1885 objects
  identical to the committed save, only `metadata` differs. So the capture is current and `export_midi.js`'s "saved after the capture" warning is
  expected. Before step 1, repeat that comparison (the objects of the working file against `git show bc54cdc:scores/piece-septet.json`); **if any
  object differs, or the capture is missing: stop and say so** — a changed Bloom means a new capture (RENDER.md §1) before any demo render.
- **No second engine.** No MIDI is written from pitch arithmetic; every message in a demo file is the composer's own, moved or held.
- Stage explicit paths only. The mp4s and wavs are gitignored — say so in the archive README.

## §4 The steps

**1. Prove the two new uses** (a two-lane picture on the septet frame · a pair alone out of the rack) — `todo`

- Stills of all three pairs at their peak instants: `node tools/export_video.js --ir piece-septet --view video --parts 1,6 --probe 214.8
  --probeDir notation/video/renders/demos/tmp` (then `3,5` @ 222.9 · `0,4` @ 226.6). Look at each: two lanes only, the bass clarinet in C,
  the orange and green curves, the cursor, nothing of the other five parts, room for the label at the top left.
- A 10 s moving probe: `--parts 1,6 --t0 210 --t1 220 --audio notation/audio/piece-septet.wav --out …/tmp/probe.mp4` — the followers move on a lane subset.
- Give `tools/render_reaper.js` the smallest change that renders **named parts only, to its own file name** — the default call byte-for-byte
  as it is. Bounds 0 → ~311 s. The demo wavs keep the **piece's timeline** (the exporter lines audio up by its own `-ss t0`).
- Render Bass Clarinet + Cello → `notation/audio/demo-bloom-bclvc.wav`.
- *Check:* the main render's sha unchanged · the first sound in the Bloom window against the pair's first onset (± 50 ms) · the file is the
  pair and nothing else (silence where both rest).
- *If the two-lane export fails:* report what it draws before choosing — the tuba's named fallback is cropping the full-frame video.

**2. The held-max dyads** (30 s of each pair's fastest beating, which the music itself never holds) — `todo`

- One generated set, three slots on one timeline (the tuba's layout: slot k at 10 + 40·k s, 32 s long) → `midi/demo-bloom-heldmax/`,
  rendered once with all six parts → `notation/audio/demo-bloom-heldmax.wav`.
- **Each part = the capture frozen at its pair's peak instant:** its channels' whole state as the capture has it there (program, every
  controller, the pitch bend, latched keyswitches), the sounding note restarted at the slot's start and held 32 s. **Loudness controllers
  at their highest value inside that span**, so both parts sit at the top of their swell. Written with `tools/midi_out.js`, placed by
  `tools/reaper_midi_place.js` — the one copy of each.
- *Check — the sound holds:* level per second across each slot; no part may die before 30 s. If one does (a sample that does not loop):
  re-strike it as the score does, at the score's own span length, overlapped — and tell him what his ear will find at the seams.
- *Check — the rate is the label's:* the beat rate measured off the file (the envelope's spectrum), within ~5 % of the chart's figure for
  each slot. **No label goes on a sound that does not match it.** Off → stop and diagnose; do not tune by hand.
- *Rejected:* porting `gen_demo_heldmax_midi.js` (notes and bends from arithmetic) — the septet's channel setup, keyswitches and measured
  bend ranges live only in the composer (RENDER.md rule 1; §553's bend-range bug is the proof). *Held in reserve if the freeze fails the
  rate check:* a small composer score with flat morph curves, captured headless.

**3. The three pair recordings** (each pair alone through the whole Bloom) — `todo`

- Step 1's route, twice more → `demo-bloom-vn1va.wav` · `demo-bloom-flvn2.wav` (about a minute of rendering each).
- **Gain: ONE plain gain per demo file to −1 dBTP, UP allowed** — a pair alone sits far under the full mix and would be faint online.
  No limiter, no normalize beyond that one number; each file's gain goes in the register. (For these files only; RENDER.md rule 8 stands for the piece.)
- *Check:* as step 1, per file.

**4. The build script, and the pilot** (one command makes a video; Bass Clarinet + Cello first) — `todo`

- `notation/video/renders/bloom_demos.sh <pair>|all`, ported from the tuba's `demos.sh`: a row per pair (lanes · names · peak instant · end ·
  the dyad's slot offset · N) · the still → the 30 s static with the label (the tuba's drawtext: Georgia 58 px, black, x 70 y 48 — moved only if
  it sits on notation) and the held dyad from one second into its slot · the section playback `--t0 182 --t1 <the pair's end + 3>` with the
  pair's wav (start at 183.0 instead if the pair is not silent at 182) · concat → `notation/video/renders/demos/bloom-<pair>.mp4`.
  The tuba's encode throughout: 1920 × 1080 · 30 fps · x264 crf 16 · yuv420p · AAC 256 k 48 kHz. Skips what is already rendered.
- Build the **pilot: `bloom-bclvc.mp4`** — the countable pair, where a wrong rate or a bad seam is heard at once.
- *Check, measured (the tuba's PHASE 5):* duration = 30 + (t1 − t0) to the frame · A/V start 0 · the label present by frame extraction ·
  the section's first frame against a direct probe at t0 · the section's first sound against the pair's first onset.

**5. His eye and ear** (the pilot, then the set) — `todo`

- The pilot to him: the file's path, its length, the measures in three lines. Collect his notes in one pass, fix in one pass.
- On his word: the other two (`bloom_demos.sh all`), the same checks, then the three to him.

**6. Upload, and the links on the page** (his upload; the AI wires) — `todo`

- He uploads the three and gives the URLs. Offer a title pattern, his to change: `Scattered Substance — Bloom practice — Bass Clarinet + Cello`
  (the piece's title is still his to confirm, CN-64).
- **Each URL checked against its own YouTube title before it is wired** (the tuba's rule). Then the page's one placeholder line
  (`Bloom practice videos — to be added`, `docs/notation_instructions/index.html`) becomes three, in the tuba's list shape:
  `<Part A> + <Part B> — <url>`. The HTML comment above the section updated. Nothing else on the page moves — **the prose is his (§569).**

**7. Archive, docs, commit** — `todo`

- `notation/video/approved/<date>-bloom-practice/` — the three mp4s (gitignored; his to back up) + a README in the form of
  `approved/2026-09-16-submission/README.md`: what made each, the commands, the measures, sha256s, the URLs.
- PLAN 2h.7 → `done` with its sub-steps · journal §2 (N0 closed → N1) · RENDER.md §4 one register line for the demo renders · NITS for
  anything met and left · commit by explicit path, push (D8).

## §5 What is his

- At build time: **Reaper open, the bridge alive, the rack saved** (true on 2026-09-17 at planning; the tool re-checks the heartbeat).
- His eye and ear, twice (step 5) · the upload, the titles, the three URLs (step 6) · backing up the mp4s.

## §6 AI calls he may overturn

- The demo files' gain brought UP to −1 dBTP · the pilot being Bass Clarinet + Cello · the section starting one second before the first
  go line · 30 s statics (the tuba's final; its first build had 10) · the dyad's loudness at the top of the swell · the file names · the title pattern.

## §7 Stop and report — do not work around

- The main render's sha changes · a two-lane still shows anything but the pair · a held dyad's measured rate misses the chart's figure ·
  a part cannot be made to hold 30 s either way · the bridge refuses twice running.

## §8 Register *(append-only — Opus fills this as the steps land)*

