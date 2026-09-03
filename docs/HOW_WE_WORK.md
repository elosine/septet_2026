> **Provenance (septet 2026, 2026-09-03):** copied from piece #3 `for_bass_clarinet_harp_and_accordion/docs/HOW_WE_WORK.md`, which piece #4 also used unchanged. Applies here as written; `AI_METHODOLOGY.md` wins where they conflict.

# How We Work — Reference Card

> Cheat sheet for piece #3. Adapted from piece #2's version, trimmed to what carries forward.
> Piece-2-specific machinery (servers/ports, glyph registry, notation workflows) stays in that
> repo; equivalents get added here only when the corresponding system exists in this repo.

---

## Session routines

| Routine | When | How |
|---|---|---|
| **Session Start** | Beginning of every work session | `/session-start` |
| **Session End** | Done for the day | `/session-end` |
| **Pre-compaction checkpoint** | Context running low mid-session, or say *"checkpoint"* | see `SESSION_PROTOCOL.md` |

Canonical procedures: `docs/SESSION_PROTOCOL.md`. The journal remembers so you don't have to.

---

## The plan (`docs/PLAN.md`)

The single living plan. Stable IDs (`1c` stays `1c` forever), statuses, one-line whys.

**Talk to it in plain language:**
- *"show me the plan for 1"* · *"what's left in 0?"*
- *"what did we decide about X, and why?"* (→ journal §4)
- *"mark 1b done"* · *"move 1c after 1d"* · *"drop 2a"* · *"defer 3b"*
- *"break 1e down further"* — expands sub-steps in place

---

## Working Style

> User preferences, not iron rules — if one blocks the work, **surface it for discussion**
> rather than silently routing around it. The list is expected to evolve.

**Cadence**
- **Conceptual proposal before any code edit.** Describe in plain language what would change and why; wait for approval.
- **Discuss chunks, not individual files.** Once a chunk is approved, execute without re-asking per file; narrate briefly so the user can interrupt.
- **Wrap each chunk before moving on:** update docs (plan statuses, journal), commit if a natural checkpoint, report what actually happened vs proposed, propose the next chunk.
- **Piecemeal by design.** One thing at a time; don't chase the perfect architecture. Shore up as we go.

**Reading & analysis (this piece's addition)**
- **Orient from docs, never by scanning the codebase.** Name the specific question first, then read only what answers it.
- **High bar for subagents / background processes.** Default to doing the work directly; one fast targeted command beats an exhaustive audit.
- Prior repos are reference material, consulted per named question only.
- **Go/no-go before ANY time-consuming process** — disk searches, large codebase reads, extensive web research, long analyses. State conceptually what's needed and pause; the composer either supplies the shortcut (a path, a doc, an answer) or says *"go."* Single targeted checks of known things are always free. *(Added 2026-08-01; generalized from the disk-search case, where AI drive-crawled for libraries the composer could have pointed to instantly.)*
- **Cite IDs with names, never bare.** Decision and plan IDs in chat always carry their short name: *"D6 (Reaper session storage & backups)"*, *"S3 (MIDI out)"* — a bare "D6" forces the composer to look it up. *(Added 2026-08-01.)*

**Language**
- Plain, conversational language first; file paths and code references as anchors, not substance.
- *"Tell me in plain language"* / *"tighten it"* = calibration, not failure.

**Choices**
- **Plain-text lettered options in the message body — never a multiple-choice UI picker.** Reasoning visible next to the options. Wait for a free-text reply.

**Commits**
- Commit at the natural wrap of an approved chunk, or when asked. Never speculatively.
- Reference active plan IDs (e.g. `1c`) and decision IDs (e.g. `D2`) in messages.

**Pushes**
- ~~**AI never pushes automatically.**~~ **Superseded in this repo by D8 (composer 2026-09-03): push automatically after every commit, explicit paths only.** *(Inherited text: after commits, surface the unpushed count; at Session End, always ask "push now?".)*

**Before building anything new — quick pre-check**
1. What exists? 2. What changes? 3. What could break? 4. How do we verify?

---

## If it feels like we lost the thread

1. **Correct + cite:** "We decided X — check journal §4, D-N."
2. **Re-read:** "Re-read §2 — we covered this."
3. **Override:** "The plan is X. Don't re-derive."

The journal is the recovery anchor. If a decision matters enough to survive context loss, it belongs in §2 or §4 *at the moment it's made*.

---

## You don't need to worry about…

- Forgetting the plan or its motivations — `PLAN.md` keeps both, per item.
- Forgetting decisions — journal §4, with the why and the rejected alternatives.
- Forgetting your own to-dos — journal §7, reviewed at session end.
- Losing context between sessions — §2 Resume Here, updated every session end.
- The AI not knowing what's going on — it reads the plan + journal at session start, not the codebase.
