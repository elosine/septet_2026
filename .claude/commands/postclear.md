---
description: Pick up the same task after a mid-chunk clear — read §2 + the checkpoint's read-list, restate the next step, start
---

# Postclear — resume the same task after a mid-chunk clear

*(Inherited from piece #4, 2026-09-03.)*

**Use after `/clear` when the task did not change** — you checkpointed, cleared, and are
carrying on with the same work. Deliberately much cheaper than `/session-start`: no
last-session playback, no agenda, no "what would you like to work on today?".

**If the subject DID change, run `/session-start` instead.**

1. **Read these, and only these:**
   - **`docs/PROJECT_JOURNAL.md` §2 — ALL of it**, not just the checkpoint entry.
   - `docs/PLANNER.md`'s **`NOW ►`** line
   - **everything on the checkpoint entry's `Resume reads:` list** — read exactly that,
     nothing more.

   Do **not** read the codebase, and do not read `PLAN.md`, `HOW_WE_WORK.md`, or anything
   else unless the `Resume reads:` list names it.

2. **Play it back in ≤5 bullets:** the task · where it stands · the latest deliverable ·
   the next concrete step · anything waiting on the composer.

3. **If the checkpoint entry does not name a next concrete step, say so and stop resuming
   — run `/session-start` instead.** Do not re-derive the plan from the code.

4. **Check the tree matches.** `git status --short` against the checkpoint's
   deliberately-uncommitted list. Say so if it drifted — the composer may have saved
   scores or a rack in between, which is normal and is not yours to commit without asking.

5. **Start the next concrete step.** Narrate briefly so the composer can interrupt. Do not
   ask what to work on and do not propose an agenda. Keep the lab journal as you go.
