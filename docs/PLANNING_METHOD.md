# PLANNING METHOD — how a problem becomes a plan item, one step at a time

> Written 2026-09-06 from the session that built PLAN 1g (balanced dynamics), at the composer's word: *"can you organize this
> methodology into its own plan or workflow?"* This is the procedure for **building a plan item or analyzing an issue that ends
> up in the plan.** A plain bug report ("X doesn't work") stays on HOW_WE_WORK's chunk cadence: look, fix, verify, document.
> Where the two conflict, AI_METHODOLOGY.md wins.

## The three phases

### Phase 1 — Stating and restating: one shared understanding

- The composer says what he thinks the issue is, in his own words (often speech-to-text; the AI reads through the transcription).
- The AI answers with **its understanding and its analysis** — and, when the question is about the state of the piece or the
  system, **the data first**: the actual file, the actual code, the actual measurement, shown as a small table, before any opinion.
- Back and forth until both hold the same picture. Every AI turn:
  - the answer first, then the detail;
  - clear, simple human language;
  - spatially separated bullets, short lines, one idea per chunk;
  - clearly delineated steps;
  - technical detail only where it is needed to understand what must be done.
- **One topic at a time.** When several issues surface, the AI names them and holds all but one aside explicitly ("after this").
- **Read back.** When the composer explains an intention, the AI restates it in its own words and the composer confirms or
  corrects. The AI adds what the composer may have missed (a caveat, a consequence) and asks only the questions that only the
  composer can answer — as lettered options in plain text, one at a time where possible.
- When the composer says a turn is too much, the AI shortens without re-explaining. The format resets to the simplest form.

### Phase 2 — The top line

- The AI lists **the very top line of the steps, in order**, one line each, numbered — nothing more.
- The composer confirms, reorders or renames. The order is his ("in the plan, this will be item number one").

### Phase 3 — One step at a time, then into the plan

For each step, in order:

1. **The goal.** The AI gives a goal-based summary in the fixed format below: the **result when done**, not the method.
2. Discuss until it is on point. Corrections are taken at once (a step can lose a part, gain a caveat, change its scale).
3. **The sub-steps.** The AI gives the to-dos as simple human-language bullets in the fixed format below.
4. Discuss until on point.
5. **Written into the plan** — the AI writes that step into `docs/PLAN.md` at once, in the same words and format as the chat,
   commits and pushes. Nothing waits for the end of the conversation; a cleared chat loses nothing.

After the last step: the AI shows the whole item once, asks "is that it?", and names what sits outside the plan and belongs to the
composer (a rack window, a decision, a listening).

## The fixed formats

**A single item and its goal (Phase 3, step 1):**

> **N. Title.**
>
> Result when done: one plain paragraph — what will be true when it is accomplished.

**An item with its sub-steps (Phase 3, step 3; also the whole-plan view):**

> **N. Title** (a one-line summary in brackets)
>
> - to-do
> - to-do
>
> Items not yet discussed carry one line: *to be laid out when we discuss it.*

**The whole plan:** every item in the second format, in order, nothing else.

## What the AI does without being asked (its side of the method)

- Gives the item a stable ID and a *why* in `PLAN.md` (the plan's header rules); mirrors the chat's wording there.
- Writes the decisions that fall out of the discussion into the journal (§2 now, §4 at session end, with the why and the rejected
  alternatives) and the reasoning into the lab journal — the record of how the thinking went.
- Keeps execution separate: building a to-do follows HOW_WE_WORK's chunk cadence (conceptual proposal → go → build → verify →
  docs → commit → push). The plan's to-dos are the chunks; `/running-order` can manage them one at a time.

## Why this method (composer, 2026-09-06)

The failure it prevents: the AI answering with everything it knows at once — long, technical, several issues braided together —
so that the composer cannot see the one thing to decide. *"This format is still too confusing, too much to read, and too
overwhelming. What I meant by one thing is I only want to talk about [one thing]."* The remedy is structural: one topic, the
answer first, the goal before the method, the sub-steps before the plan, and the plan written as it is agreed.
