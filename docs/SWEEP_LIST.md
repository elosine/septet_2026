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
| 6 | 2026-09-10 | delivery, not the app | was handed a long console one-liner to paste | Chrome DevTools silently refuses pasted code until `allow pasting` is typed; the script never ran | a tool that works without a troubleshooting step | ~~Y~~ **CLOSED** — shipped as a loaded file, `crescStrikes()` after a reload (§358). **Rule for the sweep: never deliver a paste.** |
| 7 | 2026-09-10 | passages, top bar | clicked the ⤲ buttons to stamp the playhead into `from` and `to` | both stamped 0.00; `insert @ playhead` was also inserting at 0 | the real playhead time | ~~Y~~ **CLOSED** — read `Composer.playheadTime`/`currentTime`, neither of which exists; the accessor is `getTimeAtPlayhead()` (§363). **Two rules for the sweep: when copying a line from a sibling file, copy the branch it TAKES not its dead fallback; and never verify by assigning the property under test.** |
| 8 | 2026-09-10 | passages, capture | named a passage and captured | nothing appeared in the menu; the POST 404’d because the SERVER predates the route and only a console.log said so | it saves, or it tells me why not | ~~Y~~ **CLOSED** — the 404 now names itself on screen and the menu reads `-- restart the server --` (§364). **Rule for the sweep: a hand-off must say which layer changed — static file = reload the page, server.js = restart node.** |
| 9 | 2026-09-10 | crescendo gesture, META shape | deleted the META shape | the crescendos went, the piano strikes stayed behind on lane 2 | the whole gesture goes | ~~Y~~ **CLOSED** — the strikes had a groupId of their own instead of the crescendo’s; `cresc_card.js` had it right all along (§365). `crescStrikes.adopt()` repairs saved scores. **Fourth fault of the day of the same shape: a rule in one sibling and not the other.** |
