# septet 2026 — the Tempus septet

Composition #5 in the custom-composition-system lineage
(#1 `string_quartet_no1-composer` → #2 `composition_for_two_pianos_and_two_percussion`
→ #3 `for_bass_clarinet_harp_and_accordion` → #4 `for_seven_tubas` → this).

Written for the **TEMPUS LAB 2026 call for scores** (Ensemble Tempus Konnex, Leipzig;
deadline **2026-10-15 23:59 CET**; max 12 min; PDF score ≤ DIN A3; the call is
`docs/Tempus-Lab2026_Application_English.pdf`). Instrumentation, fixed by the composer
2026-09-03: **flute (doubling piccolo and bass flute) · bass clarinet · piano · violin 1 ·
violin 2 · viola · cello.**

This piece inherits piece #4's stack — composer score app, sandbox, notation IR + engine,
print — by **copy-forward with the instrument palette rewritten** (journal D1). The
delivery format is the tuba piece's: an animated scrolling score with the same animated
devices; a presentation score (video + print) for the submission; the performance score
before rehearsals, ported from the tuba modules once they exist there (D2, D3).
**The IR contract (D9):** the composer save is the ground truth; the IR is derived from
it by the extractor and is the single source for every downstream score. Libraries:
SI2 flute · Xsample bass clarinet · 8Dio Steinway + IRCAM Prepared Piano 2 ·
**Xsample Contemporary Solo Strings** (D7).

## READ FIRST — how to work here

**`docs/AI_METHODOLOGY.md`** is the composer's standing instruction on scoping, decisions,
and confidence (inherited unchanged from piece #4). It governs everything below and
outranks the working-preference docs where they conflict. In short: fix what blocks the
piece and flag the rest to `docs/NITS.md` · don't make the composer decide minutiae ·
prefer one robust build over a fragile one · **a confidence claim must be verified in the
running app** · no clear evidence means no diagnosis.

The composer's own rule for this port (2026-09-03): *"I don't want to get too bogged down
in technical details of porting and code and such, but I want to do a good, solid job and
not leave out things now that might bite later ... leaving everything we can for when the
time comes."* Keep the conversation at the conceptual level; consult the code yourself.

## Orient from docs, not from scanning

- **What now / what next:** `docs/PLANNER.md` — the **NOW ►** line, then the outline
- **Living plan:** `docs/PLAN.md` — stable IDs; rules in its header
- **Session state, decisions:** `docs/PROJECT_JOURNAL.md` — §2 Resume Here first
- **The lab journal:** `docs/RUNNING_LOG.md` — append-only, written as the work happens
- **The sketch pad:** `docs/COMPOSITION_NOTES.md` — the composer's musical ideas, verbatim
- **Deferred, real but not now:** `docs/NITS.md`
- **Working preferences & routines:** `docs/HOW_WE_WORK.md` · `docs/SESSION_PROTOCOL.md`
  · `docs/SESSION_HYGIENE.md` (clear between chunks; the docs are the handoff)

Do NOT scan or analyze the codebase unprompted. Name the question first, then read only
what answers it. High bar for subagents / background processes.

## Standing practice: the lab journal (composer, 2026-09-03 — not optional, never asked for)

> *"I'd like to keep a running journal like lab notes, so I can look back on decisions or
> comments, theory, philosophy, etcetera, or how we actually made something, if I wanted
> to write a paper later about this — and I would expect the AI agent to do this
> automatically as a habit."*

The rules, adopted from `live-electronics-engine` (its CLAUDE.md and `docs/journal/README.md`):

- **When:** at the end of any exchange that produced a decision, a result, a rejection, a
  measurement, a theoretical or philosophical point, or a question worth remembering.
  Not at session end — by then the reasoning has blurred.
- **What each entry carries:** what prompted it, in the composer's words, quoted not
  paraphrased · what was tried, in order · the numbers · what was rejected and why (dead
  ends at the same weight as successes) · what was decided, and why that rather than the
  alternative · corrections as NEW entries, never edits.
- **Append-only.** The journal is the record of how the thinking went; it is never tidied.
  Current state lives in the plan, the journal §2 and the READMEs, which are rewritten freely.
- **The sketch pad is the same habit for musical ideas:** every compositional idea the
  composer voices goes into `docs/COMPOSITION_NOTES.md` verbatim, dated, the moment it is
  said — with the AI's reading kept separate and marked as such.

## Apps (after PLAN 0b lands)

- **Composer score:** `node score/server.js` → http://localhost:5300/composer.html
  (7 instrument-keyed tracks + META; saving per D17 — working copy · Save · Name version · Reload; `docs/NAMING.md` §1)
- **Sandbox:** `node sandbox/serve.js` → http://localhost:4800
- **Notation workshop:** carried over with the port, NOT adapted until phase 2 (PLAN 0g / 2a).
- **Ports** (loopMIDI, case-sensitive) — decided in PLAN 0e; 5300/4800 are distinct from
  #4's 5200/4700 and #3's 5100/4600 so two repos' servers can run at once.

## Reference repos (read-only context; registered as additional working dirs)

- **#4** `C:\Users\jwloy\GitHub\for_seven_tubas` — the source of the port; richest docs
  (notation standards, IR schema, print/video pipelines, the D-log)
- **#3** `C:\Users\jwloy\GitHub\for_bass_clarinet_harp_and_accordion` — HOW_WE_WORK origin,
  `SAMPLER_QUIRKS.md`, the Xsample bass clarinet deep map, the sound-research playbook
- **#2** `C:\Users\jwloy\GitHub\composition_for_two_pianos_and_two_percussion` — piano
  libraries and map (8Dio Steinway, IRCAM Prepared Piano 2), the piano notation rules
- **#1** `C:\Users\jwloy\GitHub\string_quartet_no1-composer` — Xsample Contemporary Solo
  Strings (CC0 articulations, channel banks, gliss keyswitches), MIDI architecture standards
- **live-electronics-engine** `C:\Users\jwloy\GitHub\live-electronics-engine` — attached
  for the lab-journal practice this repo adopts, **nothing else**: no electronics in this
  piece and no code from that repo (composer, 2026-09-03)

Consult only when a specific named question requires it. Never edit them.

## Git

- Commit at the natural wrap of an approved chunk; reference plan IDs in messages.
- Stage **explicit paths only, never `git add -A`**.
- **Push automatically after every commit** (D8, composer 2026-09-03 — piece #4's D30
  adopted). Do not ask. The inherited "ask push now?" lines in HOW_WE_WORK and
  SESSION_PROTOCOL are superseded and marked so in place.
