# notation/ir — the septet's IR pages

Every `<id>.ir.json` here is a notation page DERIVED from a composer save by
`tools/notate_section.js` (or `notate_block.js` / `notate_morph.js`), validated by
`tools/ir_validate.js`, and listed in `index.json` — the manifest the notation app's
picker reads (`notation/app/notation.html`). The save file in `scores/` is the ground
truth; a page is regenerable from its own `provenance.build` (journal D9).

**Usage:** `node tools/ir_validate.js notation/ir/<id>.ir.json --against-source --complete`
— the validator takes a PATH, not an id.

## The test batteries' golden inputs are the tuba piece's, staged, not stored

`tools/test_render.js`, `test_layout.js`, `test_animobj.js`, `test_splice.js`,
`test_extract_played.js`, `test_midiplayer.js`, `test_pattern_fit.js`,
`test_notate_block.js`, `ir_extract_golden.js` and `ir_validate_battery.js` read pages
by name from this directory (`trance-bar-01`, `morph-window-01`, `db1`, `db1-all-x01`,
`trance-section-01`, `section1-e20`, `section1-e30`, `density-apex-01`) and the tuba
scores those pages name (`scores/tranceA002f`, `piece-final-draft-001`,
`piece-s25-finished01`, `piece-s23`, `piece-s27`, `piece-s28`, `cloud02-10track`,
`cloud02i-b`, `cloud02i-b2`). Those are piece #4's notation and composition, not this
piece's, so they are NOT committed here (PLAN 0g, RUNNING_LOG §12).

To re-run the batteries against them, stage from `C:\Users\jwloy\GitHub\for_seven_tubas`
(read-only) and delete afterwards:

```bash
S=/c/Users/jwloy/GitHub/for_seven_tubas
for f in $(cd $S && git ls-files notation/ir); do cp "$S/$f" "$f"; done
for n in tranceA002f piece-final-draft-001 piece-s25-finished01 piece-s23 piece-s27 piece-s28 cloud02-10track cloud02i-b cloud02i-b2; do cp "$S/scores/$n.json" scores/; done
```

The 0g run (2026-09-03) on that staging: 11 batteries GREEN; 4 RED for reasons in the
septet's own tables, not the copied code — see RUNNING_LOG §12. The snapshot fixtures in
`tools/fixtures/*_snapshot.json` are hashes of the tuba pages' output; they are
regenerated (`--update`) when the septet's first real pages exist (PLAN 2a).
