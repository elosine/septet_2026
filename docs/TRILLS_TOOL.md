# TRILLS_TOOL — trills grown from the strikes, on curves

*Spec written 2026-09-05 (RUNNING_LOG §97–98; CN-19, CN-20). **No code yet** — the composer: "just writing, no coding
yet." Status per section as it gets built, the way STRIKES_TOOL.md does it. The composer's rule for the whole module:
**"intuitive and easy to use, maybe not too many controls."***

## 0 · The picture

The second material of the piece (CN-1, CN-6: tremolos on curves) grows out of the first. A strike note becomes the
attack of a trill; the trill continues, its speed following a reference curve the composer has drawn, for as long as
its span lasts; while it sounds, that player's notes in the strikes it covers fall silent. Trills can also start
between strikes, and later a generator can weave trills through the players' free time. Everything is generated
note by note from lookup speed tables on an ordinary articulation chosen by ear — never the sample libraries' trill
or tremolo presets. The performers will read "trill" and a span; the curve is for the MIDI demo.

## 1 · Decisions taken (2026-09-05)

- **Eat by rule, not by deletion.** A trill mutes what falls under it on its own player, at play time. Remove or
  shorten the trill and the notes are back. Nothing is ever deleted by a trill.
- **The curve segment ends the trill.** The trill's span is its length; the curve is read over that span.
- **Second pitch:** the upper chromatic neighbour by default; other options later (the harmony of CN-6 among them).
- **Speed limits** are not a concern: demo MIDI must sound plausible, the players play within their own limits.
- **The fp envelope** is built in per instrument — "a thing that works", not laboured over; the notation covers it.
- **Three META lanes** for the three reference curves, not colours in one lane.
- **Curve drawing:** simpler than piece #2's wave-curve object — trace a long curve, then adjust along the way.
- **The attack:** a listening exercise, in order of simplicity — the trill's own first note at full velocity · a
  CC7 spike · a second voice (an attack patch and the trill patch at the same onset) where a strike slot exists.

## 2 · The trill object

A `zone` on a player's lane with `midiModel: 'trill'`. Fields:

| field | meaning |
|---|---|
| `startSeconds`, `endSeconds` | the span; the curve is read over it; the end ends the trill |
| `pitches` | `[p]` for a tremolo, `[p, p+1]` for a trill (upper chromatic neighbour by default) |
| `technique` | the articulation the notes are played on (per-instrument default from the listening exercise) |
| `curveRef` | `'A'`, `'B'` or `'C'` — the reference curve read live over the span (§4); or `null` with own nodes |
| `speed` | the per-instrument table row: curve height 0–10 → notes per second, min → max (`bank/trill_speed.json`) |
| `fp` | the attack envelope: first note at `attackVel` (127), then the dynamic curve from `dropTo` |
| `dynamic` | a second curve ref or a level; default = the fp drop level, flat |
| `eat` | `true`: mute this player's notes under the span; `accentEaten` (default off): their onsets spike the velocity |
| `launchedFrom` | the strike note's id when the trill grew from a strike (§5), else null |

**Realization** (at play and at export, never stored as notes): walk the span; at time t read the curve height,
map it through the instrument's speed row to a rate, step by 1 ÷ rate; alternate the pitches; velocity from the fp
envelope then the dynamic; jitter optional (CN-13's performer jitter, a small percentage). The existing ostinato
engine (`realizeCellEvents`, `densityToIOI`) is the model to extend, not replace: the trill is an ostinato with two
items whose speed table is per instrument and whose floor is not 80 ms.

**Per-instrument speed table** (`bank/trill_speed.json`, editable, plausible demo values to start): violin / viola
finger trill 6 → 14 per second, cello 5 → 12, flute 6 → 13, bass clarinet 5 → 11, piano 5 → 12. A tremolo (one
pitch) may use a second row (bowed tremolo faster).

> **2026-09-05 evening — under review (RUNNING_LOG §100, CN-21):** the composer heard the formula (`trill0-listen`) and
> rejected it. The realization is to follow piece #2's ostinato timing model instead: his own trill playing
> (`scores/trill_playing_samples*.json`, accent senza vib) indexed by speed → a per-instrument table of gaps, velocities and
> note lengths, looked up along the curve with stretch / smooth / speed; the rate table above becomes the fallback. His
> decision on the samples (adapt / re-record) pending; nothing built.
>
> **2026-09-05, later — option A built (RUNNING_LOG §101):** `tools/trill_ingest.js` → `bank/trill_timing_db.json` (speed-indexed,
> role lo / hi, his lengths and velocities); `tools/curve_eval.js` (the app's curve math ported, matched to the app);
> `tools/trill_curve_gen.js` → `scores/trill-curve-test.json` (a 45 s smooth curve on violin 1 with his timing under it);
> `tools/score_to_midi.js` → `midi/` (his captures as .mid, to audition articulations). Awaiting his ears.

## 3 · The reference curves — three META lanes

- The META layer becomes three: A, B, C — three lanes, each toggled like today's META window, each holding one
  reference curve (and any META group shapes as now). **Contract change (D9 §5, NAMING §2.2):** "META shapes sit on
  layer `tracks.length`" generalizes to "layers ≥ `tracks.length` are META" (7, 8, 9). The extractor's classifier
  and `notate_section --parts 0-6` already ignore layers above the parts; the change is written into NAMING at
  build time, never silently.
- **Drawing — trace, then adjust.** Mouse-down on the lane and drag: a freehand trace. On release the trace is
  simplified to a handful of nodes (Ramer–Douglas–Peucker at a tolerance that leaves 6–12 nodes for a lane-wide
  curve) with smooth segments — the existing node + segment model underneath, so nothing downstream changes.
  Adjust along the way with three gestures only: drag a node · drag the middle of a segment to bend it · double-click
  a node to remove it, double-click the curve to add one. No slope handles, no per-node dials. Tracing again over a
  region replaces that region (the new trace splices in between its first and last x). PLAN 1a is this.
- The curves persist in the save like any object (a `waveCurve` on its META lane with `curveName: 'A'`).

## 4 · The sampler — portable

- **Live reference, not a copy.** An object that names a curve (`curveRef`) reads that curve's height over its own
  span whenever it is realized or drawn. Move or stretch the object and it re-reads. Redraw the curve and every object
  on it follows. This is the portable submodule: today the trill's speed; later dynamics, vibrato rate (CN-11),
  density (CN-1), the rows over curves (CN-13).
- **A copy on request:** "bake curve" turns the live reference into the object's own nodes, for the cases where the
  object must be edited independently.
- **Selecting a span on a lane:** SHIFT-drag on empty lane space marks a time range on that lane (the app selects
  objects today; this is the one new gesture). With a span marked: `T` → a trill on that player over that span,
  reading curve A (or the curve chosen in a small A / B / C selector on the lane header).

## 5 · Launch from a strike

- Click a strike note, press `T`: a trill zone is created on that lane starting at the note's onset, `pitches` from
  the note's sounding pitch (+ its upper neighbour), `technique` = the instrument's trill articulation, `curveRef` =
  the current curve, `launchedFrom` = the note's id. **The launching note is muted by its own trill** (rule §6), not
  deleted: remove the trill and the strike is exactly as it was. The trill's first note, at 127, is the attack —
  the one-shot the note carried (Bartók, slap, tongue ram) cannot continue into a trill, so the attack is played on
  the trill's articulation (see §8 for the blend option).
- **Default length:** to this player's next strike note, or 2 s if none; then stretch by the zone's right edge. The
  curve is read over whatever the span becomes.

## 6 · Eating — the mute rule

- At play and export: for every trill on lane L over [t0, t1], the notes on L with onsets inside (t0, t1) are muted.
  In the score they draw greyed with a small "eaten by trill" mark; hovering names the trill. `accentEaten` on: their
  onsets become velocity spikes in the trill instead.
- **Revert is free:** delete the trill, or shorten it past a note, and the note sounds again. Undo works on the trill
  object alone. Auditioning is: draw, listen, drag the edge, listen.
- **Downstream:** on every save the app stamps `mutedBy: <trillId>` on the eaten notes (derived, refreshed each save,
  cleared when no trill covers them), so the extractor and the exporters skip them without knowing the rule. A final
  "bake" that deletes eaten notes is offered only as an explicit, separate action.

## 7 · The availability model (shared)

- One function, `busy(lane, t)`: true when a trill on that lane covers t (later: any sustained commitment). The
  accel run's dealer consults it: a card whose player is busy at the card's onset is skipped for that position (the
  run keeps its timing; the readout says "Vn1 busy (trill) at 2 positions"). The weave (§9) is built on the same
  function. One truth for "who is free when".

## 8 · The attack — a listening exercise, not a build

In order, stopping at the first that sounds right per instrument: (1) the trill's first note at 127 on its own
articulation, then the fp drop — nothing to build beyond the envelope; (2) a CC7 spike on the attack (the balance
kit already speaks CC7); (3) two voices for an instant — the strike's own one-shot (its Bartók, slap, tongue ram)
kept sounding on its strike slot while the trill starts on the main slot: possible where a second slot exists (the
flute and bass clarinet strike slots do; the strings' Bartók is a CC0 preset on the same channel and would need a
slot). The composer decides by ear; the envelope's `attackVel` and `dropTo` per instrument go into the speed table
file beside the rates.

## 9 · The weave (later)

Over a time range and a set of players: read each player's free spans from `busy()` and the strike notes (minus a
rest before and after each), place trills in spans longer than a minimum, hand over to another free player when one
must strike, pitches from the nearest strike note or a chosen set, curve A for all or a curve per trill. A generator
with a seed row like the drawer's shuffles. Not before §§2–7 have been used by hand.

## 10 · Notation (phase 2a)

A trill class: `tr` and a wavy line over the span, the fp at the attack, the two pitches (or one for a tremolo); the
eaten notes appear nowhere. The rate curve is **not** notated — the composer: the performers "are not following any
animation here, it'll just say trill". The animated score shows the span; the curve stays a demo device.

## 11 · Phases and estimates

0. **Hear it — no build.** *Corrected 2026-09-05 (RUNNING_LOG §99): the zone route is dead here — the zone panel routes through
   piece #2's registry, empty in this repo — so:* `node tools/trill0_listen.js` writes `scores/trill0-listen.json`, per lane a row
   of passages, one per candidate articulation, the two pitches alternating on a 3 s ramp from the slow rate to the fast one
   (§2's table), the fp 127 → 60, a marker naming each. Open it from the Experiments menu, SPACE, pick the articulation per
   instrument; judge the fp and the top speed. Edit the script's tables (candidates, rates, `DROP`), re-run, reload.
1. **The trill object** (§2, §6, §8's option 1): the type, the per-instrument table, the fp, mute-by-rule, `mutedBy`
   on save, the greyed drawing; the playability checker (the hard / soft badge) taught that a trill is one object — its notes
   re-attack by design (RUNNING_LOG §99). The realization = the table lookup of `tools/trill_curve_gen.js` (his timing from
   `bank/trill_timing_db.json`), not the rate table (§101). About a day.
2. **Three META lanes, tracing, the live reference, the span selection** (§3, §4). About a day; the contract note.
3. **Launch from a strike** and `busy()` in the dealer (§5, §7). Half a day.
4. **Free trills and edge stretching** (§4's `T` on a span; the default length). Small.
5. **The weave** (§9). A day, after the hand-made ones have taught the rules.
6. **Notation** in 2a.

## 12 · Open, for the composer, when reached

- The trill articulation per instrument (step 0 decides — the listening file `scores/trill0-listen.json`).
- The fp drop level (60 in the listening file) and whether the attack needs §8's option 2 or 3 — the same listening.
- Whether the second pitch may come from the harmony (CN-6) — a menu item once 1d exists.
- Whether eaten notes should ever accent (default off).
