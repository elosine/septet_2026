# CRESCENDO — the shape, the object, the rule (PLAN 1l)

*The reference 1m (the C key), 1n (the sequence filler) and 1o (crescendo strikes) cite instead of repeating. Built 2026-09-08 at the
composer's word; the talk is RUNNING_LOG §252–263, his words are CN-48.*

---

## 1 · The survey — his own vocabulary, read from his own pieces

The crescendo was not designed here. It was already his, in the tuba piece (`for_seven_tubas/docs/CRESCENDO_TAXONOMY.md`,
`CURVE_DATABASE.md`, `CRESCENDO_EXPERIMENTS.md`, `DYNAMICS_FRAMEWORK.md`, 2026-08-10 on).

- **The families.** **BLOOM** front-loaded · **SURGE** back-loaded · **linear** between them. A full spec reads *"8 seconds, surge 5×"*.
- **The threshold** is the half-loudness moment — *"surge 5×, threshold at two-thirds"*. About 10:1 is each family's working boundary.
- **The standard he used there:** **surge 5×**. His standing mix was *surge .7 / sine .3*, and *"longs always surge"* (COMPOSER_LOG,
  2026-08-12).
- **The time scales:** gesture < 2 s · breath 2–12 s · phrase 12–60 s · formal > 1 min.
- **The peak behaviours:** cliff · tail · hold · handoff · overshoot. His own research pillar P2 says the peak is what the listener
  remembers, more than the interior shape.

**The ratio ↔ slope ladder** (his `CURVE_DATABASE.md`, and this app draws these by name already):

| family | model | 2× | 5× (standard) | 11× | 25× |
|---|---|---|---|---|---|
| surge | `exponential` | 0.17 | **0.40** | 0.60 | 0.80 |
| bloom | `logarithmic` | −0.18 | **−0.29** | −0.37 | −0.46 |
| linear | `power` | — | 0 | — | — |

**Two findings that made the build cheap.** (i) The ladder maps straight onto this score's own curve segments, so a crescendo needs no
new machinery — the app's presets are literally `surge` exponential 0.40, `bloom` logarithmic −0.29, `line` power 0. (ii) 1g's measured
law already makes a curve's height the same loudness on every instrument, and a held note already takes its velocity from the curve's
top with CC7 following (§120). Only the SHAPE was open.

---

## 2 · The listening test — a score file, not a rack probe

His ask (§256): *"can you put the probe in the main score as and experimental save file? this way you can add all the tests for all the
players and I can solo"*. The earlier probes measured machines; this one asks his ear, so it belongs in the instrument he listens with.

`node tools/cresc_test.js` writes **`scores/cresc-test.json`**: three shapes × three durations = 9 columns, **the same times on all
seven lanes** (his "a", §257), 63 crescendos over 73.5 s, a marker naming each column, each on the player's ordinary voice at the middle
of its range, ppp … fff, a cliff at the top, the morph orange.

| | Fl | BCl | Pno | Vn1 | Vn2 | Va | Vc |
|---|---|---|---|---|---|---|---|
| pitch | F#5 | D3 | F4 | F#5 | F#5 | B4 | C4 |
| voice | ord | senza_vel | main | senza_vel | senza_vel | senza_vel | senza_vel |

**How he uses it:** open it, press **S** in a lane to solo (ALT-click = exclusive), play, loop; bend a curve by hand to hear a variant;
the file is his to mark up. `--durations`, `--shapes`, `--ratio` and `--gap` regenerate a different grid in one command.

**What the shapes do to the sound** (measured through the score's own law, Vn1 F#5, the 5 s column):

| shape | CC7 at 0 · ¼ · ½ · ¾ · 1 |
|---|---|
| surge | 88 · 93 · 100 · 109 · 127 |
| line | 88 · 98 · 107 · 114 · 127 |
| bloom | 88 · 103 · 111 · 121 · 127 |

**Caveat named at the build:** the piano cannot really swell. Its column is a CC7 fade on a decaying note. It is in the file because he
asked for all the players; judge it as what it is.

**His verdict:** *pending — the standard in `score/public/cresc.js` is `surge 5×`, marked provisional until he names one.*

---

## 3 · The object — a crescendo is a held note whose curve rises

Decided §254 (his (a)). No new object type: the score's own drag, stretch, delete, undo and save already work on it, the tick already
plays it, the extractor already reads it.

- **The note:** a `waveCurve` with a `sonifyNote`, two nodes (the dynamic range) and one segment whose `model` and `slope` carry the
  shape; `technique` the player's ordinary voice.
- **The provenance** `properties.cresc`: `{ shape, ratio, slope, threshold, dynLo, dynHi, end, gapTo, endGapS, peak }`.
- **Drawn** filled and transparent in the morph **orange** `#C2410C` — the colour the tuba piece's morph section wears, and curve
  window A's.
- **Edited** the newest way, his correction (§254): the three curve-lane overlays, **no slope diamond — the LINE is dragged to bend**.
- **The end** (§255): the peak is a **CLIFF**; it runs to **0.17 s** before that player's next note; with no later note, **5 s** (a
  trill's fallback moved to **3 s** at the same time). A typed duration overrides both and says so.
- **No room** is an answer: when the next note is closer than 0.3 s the maker returns nothing rather than drawing a crescendo over it.

`score/public/cresc.js` — pure, on the page and in node. `make(at, pitch, player, notes, opts)`, `endFor`, `segmentFor`, `heightAt`,
`thresholdOf`, `describe`, `dynHeight` / `dynName`.

---

## 4 · The rule — a player is free 150 ms after its last sound ENDS

His rule (CN-48), generalised at his word (§256) to every sound in the app, with one clause the measurement forced (§260).

- **From the END, not the attack.** Once an event occupies time — a crescendo, a trill, a beating — measuring from its start says
  nothing about whether the player is busy.
- **THE GESTURE CLAUSE:** the rest applies **between gestures, never inside one**. Notes sharing a group (a morph's `grp-morph-NN`, a
  beating's zone, a strike's group) are one continuous sound and never block each other.
- **Why the clause exists.** Measured on his piece: the plain rule would newly block **33** pairs — **18** of them the morph's own
  re-breaths (a string holding 6–10 s and re-bowing 50 ms later, in the BLOOM at 183 s). A re-breath is not a new articulation.
- **What it does to his strikes: nothing.** 517 of the piece's 549 notes are ≤ 200 ms and the median is **63 ms**, so 63 + 150 = 213 ms
  is looser than the 250 ms attack-to-attack the run used.
- **The other 15** of the 33 are existing trill → strike transitions already 110–148 ms apart. They stand exactly as he wrote them: the
  rule governs new generation and never rewrites the score.

`score/public/spacing.js` — pure. `eventsOf(objects)`, `free(t, events, { restMs, group, dur })`, `freePlayers`, `tightest`.
The strikes drawer's chord engine asks it in spirit: its box now reads **"rest after the end ≥ ___ ms"**, default 150, and it tracks
each player's END (`soundMs` is how long one dealt sound lasts, so 1o will pass a crescendo's own length).

---

## 5 · What is not here yet

- **His verdict on the standard** (step 1's last to-do).
- **1m — the C key:** the mini panel, its keys, a multi-selection.
- **1n — the sequence filler:** two modes, the free-instrument rule, the pitch menu, the harmony distribution.
- **1o — crescendo strikes:** the articulation, the ordinary voice, the velocity law for a long sound, what a "count" means when the
  sounds overlap.
- **The notation of a crescendo** (2a).
