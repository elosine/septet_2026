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

**His verdict (2026-09-08, §263):** *"the surge is the default, we can keep the others as options, the bloom needs to be revisited but
defer til first use"*. So **surge 5× is the standard** — what every build makes unless told otherwise; **line and bloom stay in the
menus**; **bloom's ladder is revisited when a piece first asks for one** (its 5× reads front-loaded here, and whether that is the bloom
he wants is a question for the music, not for a grid).

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

## 5 · Secco — the cut, and the rotation that lets the sampler survive it

His ask (CN-49): *"I would like a secco setting, maybe a checkbox, secco on by default … strings would damp the string with a finger
or bow pressure at the end of the crescendo to give an abrupt cut; for the sampler a cc7 cut so nothing rings after the end"*. It is
the cliff's performing technique.

**In the notation (2a):** the word *secco* under the note for everyone — for the strings it names the action, for the winds it tells
them the shape the strings will make. The string quartet does the same, as text beside "Non-Vib".

**In the sound:** `Composer.seccoCut` sends **CC7 0 on the crescendo's own slot 10 ms before its note-off**, so the sample stops
rather than decaying. **The guard:** never while another sound of that player is still running on the same port and channel.

**Why a rotation is needed at all.** This rack pins **CC7 = 127 before every event** (REAPER_CONTROL §3, D11) and gives each
instrument **one slot** — the strings run all 88 articulations through channel 1 by CC0. So the next note on that player re-pins the
slot the cut was made on, and if that happens too soon the cut note's tail comes back (his memory of the quartet, §264; the quartet
solved it with three instances). **The tolerance is unmeasured on this kit** — `scores/cresc-secco-test.json` asks his ear for it.

**The pool.** `pool[instKey]` is a list of channels — extra Kontakt slots holding the same instrument. `Cresc.assignSlots` walks a
player's crescendos in time order and gives each the least-recently-cut slot that has rested the tolerance; `applySlots` writes it
into `properties.cresc.slot`, and the tick sends on it. **Empty pool = no rotation**, the ordinary voice's own channel, as today.

**How many slots.** With a pool of N a slot returns every N crescendos, 0.17 s apart, so the rotation holds when
`N × 0.17 + (the N−1 crescendo lengths between) ≥ tolerance`:

| pool | shortest average crescendo that holds, T = 2 s | T = 3 s |
|---|---|---|
| 3 slots | 0.75 s | 1.25 s |
| 4 slots | 0.44 s | 0.78 s |

**Three is the plan**, since his gesture scale starts near 1.5 s. The tool **warns** when the rotation cannot keep the tolerance,
naming the moment — that warning, not a guess, is the signal to add a fourth.

**This is D11, not a new idea (§270–271).** He decided it on 2026-09-03 in these words: *"there's going to be events that happen
right after a crescendo much sooner than two seconds … a crescendo in the violin that goes to secco … the next event might come in
in a hundred and fifty milliseconds … So probably better to continue using multiple channels."* Every Kontakt port carries **ch 1
MAIN** (plain notes; no moving controller) and **ch 2 / 3 / 4 CURVE A/B/C**, round robin. His rack has held those four slots since;
the app had never read them, which is the only reason a cut was revivable.

**Wired 2026-09-08 (PLAN 0f / 0c.7, §271):** the recipe's `channels: { main, curve }` (the four strings had it; the bass clarinet
was added), `Composer.curveChannelsOf` · `isCurveEvent` · `curveChannelMap` · `channelFor`, and `resetCC7All` sweeping the curve
channels too. **Proved by the decoded MIDI:** violin 1 cuts its crescendo on channel 2 and re-pins the next note on channel 3 — the
tail cannot come back; the flute does both on channel 12, because it has no bank.

| player | curve bank | the secco cut |
|---|---|---|
| Vn1 · Vn2 · Va · Vc · BCl | ch 2 · 3 · 4 | safe by architecture — the next event is on another channel |
| Flute | **none yet** | shares a channel; the tolerance decides whether the tail returns |
| Piano | none | a piano cannot swell; main only |

**The flute is the one decision left (0c.7, deferred on 2026-09-03).** On UVI a channel IS a technique — 26 of them over 16
channels on `Flute`, 4 more on `Fluteb` — so a curve channel cannot be "the same instrument again" as a Kontakt slot can. It must be
a curve COPY of a technique, and `Fluteb` has 13 free slots for exactly this. A crescendo only needs `ord`, so **one free slot would
do it**. The alternative, recorded in §16, is to leave the flute on the tuba piece's timing law and accept the ring.

**Still on MAIN and still to do:** trills and beatings carry precomputed snippets with explicit channels, so they have not moved yet
— the next piece of PLAN 0f.
**His standing principle beside it (CN-50):** *"the rotation happens in the back-end … so we don't have to think about it on the
front end"* — the playback architecture absorbs the sampler's limits; the demo must not be shoddy; no long chase after intractable
playback problems.

---

## 6 · What is not here yet

- **His verdict on the standard** (step 1's last to-do).
- **1m — the C key:** the mini panel, its keys, a multi-selection.
- **1n — the sequence filler:** two modes, the free-instrument rule, the pitch menu, the harmony distribution.
- **1o — crescendo strikes:** the articulation, the ordinary voice, the velocity law for a long sound, what a "count" means when the
  sounds overlap.
- **The notation of a crescendo** (2a).
