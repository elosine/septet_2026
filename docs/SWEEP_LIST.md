# SWEEP LIST — faults met while composing, logged not fixed

*(Opened 2026-09-10, RUNNING_LOG §352–353. The rule: when a tool blocks, write one line here and route around it —
a console line, a different card, a re-insert. Do not stop to fix. The sweep (Opus, on a copy, in its own session)
takes this list plus the rules × cards matrix and returns ONE report; the composer gives verdicts once; ONE global fix
follows. A line is closed here only when the fix is verified in the running app. `docs/NITS.md` stays what it is —
deferred and not now; this list is real and batched soon.)*

**Format:** date · where (which card / drawer / mode) · what I did · what happened · what I expected · blocking? (Y/N)

| # | Date | Where | What I did | What happened | Expected | Blocking |
|---|---|---|---|---|---|---|
| 1 | 2026-09-10 | crescendo card, main score | dragged the panel | it sticks to the mouse (the sound card had the same fault, fixed there §347, not here) | it moves and lets go | Y |
| 2 | 2026-09-10 | crescendo card, accent row | typed a new accent pitch, ENTER | the panel closed and the whole curve changed shape; no way back | the accent's pitch changes, the curve does not | Y |
| 3 | 2026-09-10 | crescendo card, bottom | `remove`, meaning the accent | it removed the whole crescendo | the accent goes, the crescendo stays; a separate control for each | Y |
| 4 | 2026-09-10 | crescendo card | wanted to commit a change | not clear how — ENTER? click away? | one visible commit path, the same in every card | N (affordance — his decision, from a list of what each control does today) |
| 5 | 2026-09-10 | main score, piano lane | CTRL+drag on a note, to duplicate it | nothing — CTRL+drag duplicate is wired on **zones** (composer.html:9042) and **motives** (:11630) only, never on notes (`waveCurve` + `sonifyNote`) | a note duplicates and the copy follows the mouse, as a zone does | ~~N~~ **CLOSED 2026-09-10** — built: `duplicateNote()`, CTRL+drag on a note, `duplicate` in the note card (§355) |
